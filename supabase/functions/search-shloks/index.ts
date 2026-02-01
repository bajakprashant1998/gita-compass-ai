import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Step 1: Use AI to analyze the query and extract problem categories
    const analysisPrompt = `You are an expert at understanding human emotions and life problems. Analyze this user query and identify the relevant problem categories.

User Query: "${query}"

Available problem categories (return ONLY from this list):
- anxiety (worry, stress, nervousness, uncertainty about future)
- fear (scared, afraid, phobia, terror, dread)
- confusion (lost, unclear, indecisive, uncertain, bewildered)
- leadership (management, guiding others, responsibility, authority)
- relationships (family, friends, love, conflicts, connections)
- self-doubt (lack of confidence, imposter syndrome, insecurity)
- anger (frustration, rage, irritation, resentment)
- decision-making (choices, paralysis, weighing options)

Respond with ONLY a JSON object in this exact format:
{
  "categories": ["category1", "category2"],
  "guidance": "A brief, empathetic one-sentence acknowledgment of the user's struggle and what kind of wisdom might help"
}

Be concise. Select 1-3 most relevant categories.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a helpful assistant that analyzes emotional queries. Always respond with valid JSON only." },
          { role: "user", content: analysisPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI analysis failed:", aiResponse.status, errorText);
      
      // Fallback to keyword matching
      return await fallbackSearch(query, corsHeaders);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";

    // Parse AI response
    let analysis: { categories: string[]; guidance: string };
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      analysis = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Failed to parse AI response:", aiContent);
      return await fallbackSearch(query, corsHeaders);
    }

    // Step 2: Query database for shloks matching the problem categories
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get problem IDs for the categories
    const { data: problems } = await supabase
      .from("problems")
      .select("id, slug")
      .in("slug", analysis.categories);

    if (!problems || problems.length === 0) {
      return new Response(
        JSON.stringify({
          results: [],
          guidance: analysis.guidance || "I understand you're going through something difficult. Let me help you find relevant wisdom.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const problemIds = problems.map((p) => p.id);

    // Get shloks matching these problems
    const { data: shlokProblems } = await supabase
      .from("shlok_problems")
      .select(`
        shlok_id,
        relevance_score,
        shloks (
          id,
          verse_number,
          english_meaning,
          life_application,
          chapter_id,
          chapters (
            chapter_number
          )
        )
      `)
      .in("problem_id", problemIds)
      .order("relevance_score", { ascending: false })
      .limit(5);

    const results = (shlokProblems || [])
      .filter((sp: any) => sp.shloks)
      .map((sp: any) => ({
        id: sp.shloks.id,
        chapter_number: sp.shloks.chapters?.chapter_number || 1,
        verse_number: sp.shloks.verse_number,
        english_meaning: sp.shloks.english_meaning,
        life_application: sp.shloks.life_application,
      }));

    // Remove duplicates by shlok id
    const uniqueResults = results.filter(
      (shlok: any, index: number, self: any[]) =>
        index === self.findIndex((s) => s.id === shlok.id)
    );

    return new Response(
      JSON.stringify({
        results: uniqueResults.slice(0, 5),
        guidance: analysis.guidance,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fallback search using keyword matching
async function fallbackSearch(query: string, corsHeaders: Record<string, string>) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const lowerQuery = query.toLowerCase();

  // Simple keyword to category mapping
  const keywordMap: Record<string, string[]> = {
    anxiety: ["anxious", "worried", "stress", "nervous", "tense"],
    fear: ["afraid", "scared", "fear", "terrified", "dread"],
    confusion: ["confused", "lost", "unclear", "uncertain", "bewildered"],
    leadership: ["lead", "manage", "boss", "team", "authority"],
    relationships: ["family", "friend", "love", "relationship", "conflict"],
    "self-doubt": ["doubt", "confidence", "insecure", "imposter", "worthy"],
    anger: ["angry", "frustrated", "rage", "irritated", "mad"],
    "decision-making": ["decide", "choice", "decision", "choose", "option"],
  };

  const matchedCategories: string[] = [];
  for (const [category, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      matchedCategories.push(category);
    }
  }

  if (matchedCategories.length === 0) {
    // Default to confusion if no match
    matchedCategories.push("confusion");
  }

  const { data: problems } = await supabase
    .from("problems")
    .select("id")
    .in("slug", matchedCategories);

  if (!problems || problems.length === 0) {
    return new Response(
      JSON.stringify({ results: [], guidance: "Let me help you find relevant wisdom." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: shlokProblems } = await supabase
    .from("shlok_problems")
    .select(`
      shloks (
        id,
        verse_number,
        english_meaning,
        life_application,
        chapters (chapter_number)
      )
    `)
    .in("problem_id", problems.map((p) => p.id))
    .limit(5);

  const results = (shlokProblems || [])
    .filter((sp: any) => sp.shloks)
    .map((sp: any) => ({
      id: sp.shloks.id,
      chapter_number: sp.shloks.chapters?.chapter_number || 1,
      verse_number: sp.shloks.verse_number,
      english_meaning: sp.shloks.english_meaning,
      life_application: sp.shloks.life_application,
    }));

  return new Response(
    JSON.stringify({
      results,
      guidance: "Here are some verses that might help with what you're going through.",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
