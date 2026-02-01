import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type GenerationType = 
  | "transliteration"
  | "hindi_meaning"
  | "english_meaning"
  | "translate_hindi_to_english"
  | "problem_context"
  | "solution_gita"
  | "life_application"
  | "practical_action"
  | "modern_story"
  | "suggest_story_type"
  | "chapter_description"
  | "suggest_problems";

interface GenerationRequest {
  type: GenerationType;
  sanskrit_text?: string;
  english_meaning?: string;
  hindi_meaning?: string;
  verse_content?: string;
  story_type?: string;
  story_content?: string;
  chapter_title?: string;
  chapter_theme?: string;
  chapter_number?: number;
  verse_number?: number;
  existing_problems?: Array<{ name: string; category: string }>;
}

// Build verse context string
function getVerseContext(chapterNumber?: number, verseNumber?: number): string {
  if (chapterNumber && verseNumber) {
    return `Bhagavad Gita Chapter ${chapterNumber}, Verse ${verseNumber}`;
  }
  return "Bhagavad Gita verse";
}

function buildSystemPrompt(type: GenerationType, verseContext: string): string {
  const prompts: Record<GenerationType, string> = {
    transliteration: `You are an expert Sanskrit scholar specializing in IAST (International Alphabet of Sanskrit Transliteration).
You are working on ${verseContext}.
Convert the given Sanskrit Devanagari text to accurate IAST transliteration.
Be precise with diacritical marks: ā, ī, ū, ṛ, ṝ, ḷ, ḹ, ṃ, ḥ, ñ, ṅ, ṭ, ḍ, ṇ, ś, ṣ.
Only output the transliteration, nothing else.`,

    hindi_meaning: `आप एक संस्कृत विद्वान हैं जो ${verseContext} पर काम कर रहे हैं।
दिए गए श्लोक का सरल हिंदी में अर्थ बताएं।
आध्यात्मिक सार को बनाए रखते हुए आधुनिक पाठकों के लिए सुलभ भाषा का प्रयोग करें।
2-3 वाक्यों में संक्षिप्त अर्थ दें।
सुनिश्चित करें कि अर्थ इस विशिष्ट श्लोक के संदर्भ में सही हो।`,

    english_meaning: `You are a Sanskrit scholar working on ${verseContext}.
Provide a clear English translation of the given verse.
Capture the spiritual essence while using accessible modern language.
Keep it concise - 2-3 sentences explaining the core meaning.
Ensure the meaning is accurate to this specific verse's context and teaching.`,

    translate_hindi_to_english: `You are a professional Hindi to English translator specializing in spiritual and philosophical texts.
You are translating content from ${verseContext}.
Translate the given Hindi text to clear, natural English.
Maintain the spiritual essence and meaning accurately.
Do not add any interpretation - just translate faithfully.
Output only the English translation, nothing else.`,

    problem_context: `You are analyzing ${verseContext}.
Based on the verse content, identify what life problem or challenge this specific verse addresses.
Be specific about the emotional or situational context.
Write 1-2 sentences describing the problem scenario that this particular verse speaks to.`,

    solution_gita: `You are analyzing ${verseContext}.
Based on this specific Gita verse, explain what solution or guidance it offers for the identified problem.
Focus on the practical wisdom and philosophical insight unique to this verse.
Write 2-3 sentences.`,

    life_application: `You are analyzing ${verseContext}.
Explain how the teaching of this specific verse can be applied in modern daily life.
Give practical examples that resonate with contemporary readers.
Write 2-3 sentences specific to this verse's teaching.`,

    practical_action: `You are analyzing ${verseContext}.
Provide specific, actionable steps that someone can take today based on this verse's teaching.
Be concrete and practical - what exactly should someone do?
Write 2-3 bullet points as a single paragraph, specific to this verse.`,

    modern_story: `You are creating content for ${verseContext}.
Write a 200-300 word modern story that illustrates this specific verse's teaching.
The story should be set in the specified context (corporate/family/youth/global).
Make it relatable to contemporary readers with realistic characters and situations.
End with a clear moral connection to this verse's teaching.
Do not mention the Gita explicitly - let the wisdom speak through the story.`,

    suggest_story_type: `Analyze the given story content and suggest the most appropriate story type.
Choose from: corporate (office/business settings), family (home/relationships), youth (students/career), global (universal/philosophical).
Consider the characters, setting, and themes.
Return only one word: corporate, family, youth, or global.`,

    chapter_description: `Based on the chapter title and theme, write engaging descriptions for a Bhagavad Gita chapter.
Provide both English and Hindi descriptions (2-3 sentences each).
Format: 
ENGLISH: [description]
HINDI: [description in Hindi]`,

    suggest_problems: `You are analyzing ${verseContext}.
Analyze this specific Gita verse and suggest 3-5 life problems it addresses.
Consider problems in categories: mental (anxiety, stress, depression), relationships (family, social), career (work, ambition), ethics (moral dilemmas), leadership (responsibility, decision-making).
Return as JSON array: [{"name": "Problem Name", "category": "category", "relevance_score": 1-10}]
Only output valid JSON, no other text.`,
  };

  return prompts[type];
}

function buildUserPrompt(request: GenerationRequest): string {
  const { 
    type, 
    sanskrit_text, 
    english_meaning, 
    hindi_meaning,
    verse_content, 
    story_type, 
    story_content, 
    chapter_title, 
    chapter_theme, 
    chapter_number,
    verse_number,
    existing_problems 
  } = request;

  const verseId = chapter_number && verse_number ? `(${chapter_number}.${verse_number})` : "";

  switch (type) {
    case "transliteration":
      return `Convert this Sanskrit text ${verseId} to IAST transliteration:\n\n${sanskrit_text}`;

    case "hindi_meaning":
      return `Sanskrit ${verseId}: ${sanskrit_text}\n\nProvide Hindi meaning for this specific verse:`;

    case "english_meaning":
      return `Sanskrit ${verseId}: ${sanskrit_text}\n\nProvide English meaning for this specific verse:`;

    case "translate_hindi_to_english":
      return `Translate this Hindi text to English:\n\n${hindi_meaning}`;

    case "problem_context":
    case "solution_gita":
    case "life_application":
    case "practical_action":
      return `Verse ${verseId}:\nSanskrit: ${sanskrit_text || "Not provided"}\nMeaning: ${english_meaning || verse_content || "Not provided"}\n\nGenerate the ${type.replace(/_/g, " ")} for this specific verse:`;

    case "modern_story":
      return `Verse ${verseId}:\n${verse_content || english_meaning || sanskrit_text}\n\nStory setting: ${story_type || "corporate"}\n\nWrite a modern story (200-300 words) that illustrates this specific verse's teaching:`;

    case "suggest_story_type":
      return `Analyze this story and suggest the best story type:\n\n${story_content}`;

    case "chapter_description":
      return `Chapter: ${chapter_title}\nTheme: ${chapter_theme}\n\nWrite descriptions:`;

    case "suggest_problems":
      const existingList = existing_problems?.map(p => p.name).join(", ") || "None";
      return `Verse ${verseId}:\n${verse_content || english_meaning || sanskrit_text}\n\nExisting problems in database: ${existingList}\n\nSuggest relevant problems for this specific verse (prefer suggesting from existing list if applicable):`;

    default:
      return verse_content || english_meaning || sanskrit_text || "";
  }
}

// Fetch admin settings from database
async function getAdminSettings(supabaseUrl: string, supabaseKey: string): Promise<Record<string, string>> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('admin_settings')
    .select('key, value');
  
  if (error) {
    console.error('Failed to fetch admin settings:', error);
    return {};
  }

  return (data || []).reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Fetch admin settings
    const settings = await getAdminSettings(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Use admin Gemini API key if configured, otherwise fall back to Lovable AI
    const adminGeminiKey = settings['gemini_api_key'];
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // Determine which API to use
    const useAdminKey = adminGeminiKey && adminGeminiKey.trim().length > 0;
    
    if (!useAdminKey && !LOVABLE_API_KEY) {
      throw new Error("No AI API key configured. Please set Gemini API key in Admin Settings or ensure LOVABLE_API_KEY is configured.");
    }

    const request: GenerationRequest = await req.json();
    const { type, chapter_number, verse_number } = request;

    if (!type) {
      return new Response(
        JSON.stringify({ error: "Invalid generation type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verseContext = getVerseContext(chapter_number, verse_number);
    const systemPrompt = buildSystemPrompt(type, verseContext);
    const userPrompt = buildUserPrompt(request);

    console.log(`Generating ${type} content for ${verseContext}...`);

    // Get model and temperature from settings
    const model = settings['ai_model'] || "google/gemini-3-flash-preview";
    const temperature = parseFloat(settings['ai_temperature'] || "0.7");
    const maxTokens = parseInt(settings['ai_max_tokens'] || "1000");

    let response: Response;

    if (useAdminKey) {
      // Use Google Gemini API directly with admin key
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${adminGeminiKey}`;
      
      response = await fetch(geminiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature,
            maxOutputTokens: type === "modern_story" ? maxTokens : Math.min(maxTokens, 500),
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      return handleContentResponse(type, content, corsHeaders);
    } else {
      // Use Lovable AI gateway
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature,
          max_tokens: type === "modern_story" ? maxTokens : Math.min(maxTokens, 500),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || "";

      return handleContentResponse(type, content, corsHeaders);
    }
  } catch (error) {
    console.error("admin-ai-generate error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function handleContentResponse(type: GenerationType, content: string, corsHeaders: Record<string, string>): Response {
  // Special handling for suggest_problems - parse JSON
  if (type === "suggest_problems") {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const problems = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify({ content, problems }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (parseError) {
      console.error("Failed to parse problems JSON:", parseError);
    }
  }

  // Special handling for chapter_description - parse both languages
  if (type === "chapter_description") {
    const englishMatch = content.match(/ENGLISH:\s*(.+?)(?=HINDI:|$)/is);
    const hindiMatch = content.match(/HINDI:\s*(.+)/is);
    
    return new Response(
      JSON.stringify({
        content,
        description_english: englishMatch?.[1]?.trim() || content,
        description_hindi: hindiMatch?.[1]?.trim() || "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ content }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
