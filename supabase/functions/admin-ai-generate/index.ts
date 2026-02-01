import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type GenerationType = 
  | "transliteration"
  | "hindi_meaning"
  | "english_meaning"
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
  verse_content?: string;
  story_type?: string;
  story_content?: string;
  chapter_title?: string;
  chapter_theme?: string;
  existing_problems?: Array<{ name: string; category: string }>;
}

const systemPrompts: Record<GenerationType, string> = {
  transliteration: `You are an expert Sanskrit scholar specializing in IAST (International Alphabet of Sanskrit Transliteration). 
Convert the given Sanskrit Devanagari text to accurate IAST transliteration.
Be precise with diacritical marks: ā, ī, ū, ṛ, ṝ, ḷ, ḹ, ṃ, ḥ, ñ, ṅ, ṭ, ḍ, ṇ, ś, ṣ.
Only output the transliteration, nothing else.`,

  hindi_meaning: `आप एक संस्कृत विद्वान हैं। दिए गए श्लोक का सरल हिंदी में अर्थ बताएं।
आध्यात्मिक सार को बनाए रखते हुए आधुनिक पाठकों के लिए सुलभ भाषा का प्रयोग करें।
2-3 वाक्यों में संक्षिप्त अर्थ दें।`,

  english_meaning: `You are a Sanskrit scholar. Provide a clear English translation of the given verse.
Capture the spiritual essence while using accessible modern language.
Keep it concise - 2-3 sentences explaining the core meaning.`,

  problem_context: `Based on the verse content, identify what life problem or challenge this verse addresses.
Be specific about the emotional or situational context.
Write 1-2 sentences describing the problem scenario.`,

  solution_gita: `Based on this Gita verse, explain what solution or guidance the Gita offers for the identified problem.
Focus on the practical wisdom and philosophical insight.
Write 2-3 sentences.`,

  life_application: `Explain how the teaching of this verse can be applied in modern daily life.
Give practical examples that resonate with contemporary readers.
Write 2-3 sentences.`,

  practical_action: `Provide specific, actionable steps that someone can take today based on this verse's teaching.
Be concrete and practical - what exactly should someone do?
Write 2-3 bullet points as a single paragraph.`,

  modern_story: `Write a 200-300 word modern story that illustrates this Gita teaching.
The story should be set in the specified context (corporate/family/youth/global).
Make it relatable to contemporary readers with realistic characters and situations.
End with a clear moral connection to the verse's teaching.
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

  suggest_problems: `Analyze this Gita verse and suggest 3-5 life problems it addresses.
Consider problems in categories: mental (anxiety, stress, depression), relationships (family, social), career (work, ambition), ethics (moral dilemmas), leadership (responsibility, decision-making).
Return as JSON array: [{"name": "Problem Name", "category": "category", "relevance_score": 1-10}]
Only output valid JSON, no other text.`,
};

function buildPrompt(request: GenerationRequest): string {
  const { type, sanskrit_text, english_meaning, verse_content, story_type, story_content, chapter_title, chapter_theme, existing_problems } = request;

  switch (type) {
    case "transliteration":
      return `Convert this Sanskrit text to IAST transliteration:\n\n${sanskrit_text}`;

    case "hindi_meaning":
      return `Sanskrit: ${sanskrit_text}\n\nEnglish context: ${english_meaning || "Not provided"}\n\nProvide Hindi meaning:`;

    case "english_meaning":
      return `Sanskrit: ${sanskrit_text}\n\nProvide English meaning:`;

    case "problem_context":
    case "solution_gita":
    case "life_application":
    case "practical_action":
      return `Verse content:\nSanskrit: ${sanskrit_text || "Not provided"}\nMeaning: ${english_meaning || verse_content || "Not provided"}\n\nGenerate the ${type.replace("_", " ")}:`;

    case "modern_story":
      return `Verse content:\n${verse_content || english_meaning || sanskrit_text}\n\nStory setting: ${story_type || "corporate"}\n\nWrite a modern story (200-300 words):`;

    case "suggest_story_type":
      return `Analyze this story and suggest the best story type:\n\n${story_content}`;

    case "chapter_description":
      return `Chapter: ${chapter_title}\nTheme: ${chapter_theme}\n\nWrite descriptions:`;

    case "suggest_problems":
      const existingList = existing_problems?.map(p => p.name).join(", ") || "None";
      return `Verse content:\n${verse_content || english_meaning || sanskrit_text}\n\nExisting problems in database: ${existingList}\n\nSuggest relevant problems (prefer suggesting from existing list if applicable):`;

    default:
      return verse_content || english_meaning || sanskrit_text || "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const request: GenerationRequest = await req.json();
    const { type } = request;

    if (!type || !systemPrompts[type]) {
      return new Response(
        JSON.stringify({ error: "Invalid generation type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = systemPrompts[type];
    const userPrompt = buildPrompt(request);

    console.log(`Generating ${type} content...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: type === "modern_story" ? 1000 : 500,
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

    // Special handling for suggest_problems - parse JSON
    if (type === "suggest_problems") {
      try {
        // Extract JSON from the response (in case there's extra text)
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
  } catch (error) {
    console.error("admin-ai-generate error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
