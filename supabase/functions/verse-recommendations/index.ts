import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { user_id } = await req.json();
    if (!user_id) throw new Error('user_id required');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch user context
    const [progressRes, favoritesRes, chatRes] = await Promise.all([
      supabaseAdmin.from('user_progress').select('shloks_read, chapters_explored, current_streak').eq('user_id', user_id).maybeSingle(),
      supabaseAdmin.from('favorites').select('shlok_id').eq('user_id', user_id).limit(20),
      supabaseAdmin.from('chat_conversations').select('id').eq('user_id', user_id).order('updated_at', { ascending: false }).limit(1),
    ]);

    const shloksRead = progressRes.data?.shloks_read || [];
    const favoriteIds = (favoritesRes.data || []).map((f: any) => f.shlok_id);

    // Get recent chat context
    let chatContext = '';
    if (chatRes.data) {
      const { data: msgs } = await supabaseAdmin
        .from('chat_messages')
        .select('content, role')
        .eq('conversation_id', chatRes.data.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (msgs?.length) {
        chatContext = msgs.map((m: any) => `${m.role}: ${m.content.slice(0, 100)}`).join('\n');
      }
    }

    // Get candidate shloks (not yet read)
    const { data: candidates } = await supabaseAdmin
      .from('shloks')
      .select('id, verse_number, english_meaning, life_application, problem_context, chapter:chapters!shloks_chapter_id_fkey(chapter_number, title_english)')
      .eq('status', 'published')
      .limit(200);

    const unread = (candidates || []).filter((s: any) => !shloksRead.includes(s.id));
    const sample = unread.sort(() => Math.random() - 0.5).slice(0, 30);

    if (sample.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get favorite verse details for context
    const favDetails = (candidates || []).filter((s: any) => favoriteIds.includes(s.id)).slice(0, 5);

    const systemPrompt = `You are a Bhagavad Gita wisdom guide. Based on the user's reading history and interests, recommend 3-5 verses they should read next. Consider their favorites, chat topics, and reading patterns.`;

    const userPrompt = `User context:
- Verses read: ${shloksRead.length}
- Current streak: ${progressRes.data?.current_streak || 0} days
- Favorite verses themes: ${favDetails.map((f: any) => `Ch${f.chapter?.chapter_number}:V${f.verse_number} - ${f.problem_context?.slice(0, 50) || f.english_meaning.slice(0, 50)}`).join('; ')}
- Recent chat topics: ${chatContext || 'None'}

Available unread verses:
${sample.map((s: any) => `ID:${s.id} | Ch${s.chapter?.chapter_number}:V${s.verse_number} | ${s.english_meaning.slice(0, 80)} | Context: ${s.problem_context?.slice(0, 50) || 'N/A'}`).join('\n')}

Select 3-5 verses and explain why each is relevant.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'recommend_verses',
            description: 'Return 3-5 verse recommendations with reasoning',
            parameters: {
              type: 'object',
              properties: {
                recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      shlok_id: { type: 'string' },
                      chapter: { type: 'number' },
                      verse: { type: 'number' },
                      reason: { type: 'string' },
                    },
                    required: ['shlok_id', 'chapter', 'verse', 'reason'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['recommendations'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'recommend_verses' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited, try again later' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Credits exhausted' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error('AI error:', response.status, t);
      throw new Error('AI gateway error');
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let recommendations = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        recommendations = parsed.recommendations || [];
      } catch {
        console.error('Failed to parse tool call arguments');
      }
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('verse-recommendations error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
