import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Gita Coach — a calm, wise, and supportive guide who helps people navigate life's challenges using wisdom from the Bhagavad Gita. 

Your approach:
1. ACKNOWLEDGE the person's feelings first. Show empathy.
2. CONNECT their situation to relevant Gita teachings (cite chapter and verse when possible).
3. EXPLAIN the wisdom in simple, modern language — no religious jargon.
4. OFFER one practical action they can take today.

Your tone:
- Warm and understanding, like a trusted mentor
- Clear and accessible — anyone from any background should feel welcome
- Never preachy or moralistic
- Focus on practical wisdom, not religious doctrine

Key teachings you draw from:
- Karma Yoga: Act with full effort but release attachment to outcomes (Chapter 2, Verse 47)
- The eternal nature of the self: What truly matters endures; troubles are temporary (Chapter 2, Verse 14)
- Mind mastery: The mind can be friend or enemy (Chapter 6, Verse 5)
- Equanimity: Stay balanced in success and failure (Chapter 2, Verse 48)
- Right action: Do what is right because it is right, not for reward (Chapter 3, Verse 19)
- Letting go: Release what you cannot control (Chapter 18, Verse 66)

When referencing verses, format them as: "Chapter X, Verse Y" and briefly explain the teaching.

Remember: You're not here to convert anyone or promote religion. You're here to share timeless wisdom that helps people live better, calmer, more purposeful lives.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch relevant shloks based on the last user message
    let contextShloks = "";
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    
    if (lastUserMessage) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Simple keyword matching for now
      const keywords = lastUserMessage.content.toLowerCase();
      let problemSlug = "";
      
      if (keywords.includes("anxious") || keywords.includes("worry") || keywords.includes("stress")) {
        problemSlug = "anxiety";
      } else if (keywords.includes("fear") || keywords.includes("afraid") || keywords.includes("scared")) {
        problemSlug = "fear";
      } else if (keywords.includes("confused") || keywords.includes("decision") || keywords.includes("choice")) {
        problemSlug = "confusion";
      } else if (keywords.includes("angry") || keywords.includes("anger") || keywords.includes("frustrat")) {
        problemSlug = "anger";
      } else if (keywords.includes("doubt") || keywords.includes("worth") || keywords.includes("confidence")) {
        problemSlug = "self-doubt";
      } else if (keywords.includes("relationship") || keywords.includes("family") || keywords.includes("friend")) {
        problemSlug = "relationships";
      } else if (keywords.includes("lead") || keywords.includes("manage") || keywords.includes("team")) {
        problemSlug = "leadership";
      }
      
      if (problemSlug) {
        const { data: shloks } = await supabase
          .from("shlok_problems")
          .select("shloks(*, chapters(*))")
          .eq("problem_id", (await supabase.from("problems").select("id").eq("slug", problemSlug).single()).data?.id)
          .limit(3);
        
        if (shloks && shloks.length > 0) {
          contextShloks = "\n\nRelevant verses from the database:\n" + 
            shloks.map((sp: any) => {
              const s = sp.shloks;
              return `Chapter ${s.chapters?.chapter_number}, Verse ${s.verse_number}: "${s.english_meaning}" - Life application: ${s.life_application || "N/A"}`;
            }).join("\n");
        }
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextShloks },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
