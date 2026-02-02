import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an AI assistant trained on the Bhagavad Gita (all 18 chapters, 700+ verses).

Core Responsibilities:

Problem Understanding
- Carefully understand the user's problem shared in the chat.
- Identify the emotional, mental, practical, and ethical dimensions of the issue.

Gita-Based Analysis
- Analyze the user's problem in depth using relevant verses from across all 18 chapters.
- Interpret the verses accurately and in their proper philosophical context.
- Do not provide solutions that contradict the teachings of the Gita.

Solution Framework
- Provide a clear, practical solution strictly aligned with the Bhagavad Gita.
- Explain why this solution works by connecting it to the Gita's teachings (karma, dharma, detachment, devotion, self-knowledge, discipline, etc.).

Actionable Master Plan
- Create a step-by-step master plan describing what the user should do next.
- The plan should be realistic, progressive, and easy to follow.
- Each step must reflect principles taught in the Gita.

Guidance for the Future
- Suggest how the user can apply these teachings in daily life going forward.
- Encourage self-discipline, clarity of duty, balance, and inner stability.

Modern Context Integration (Next-Level Guidance)
- When appropriate, combine the timeless wisdom of the Bhagavad Gita with current trends, modern lifestyles, and real-world challenges (career, relationships, mental health, technology, stress, decision-making, etc.).
- Ensure modern suggestions never conflict with the core philosophy of the Gita.

Response Style Guidelines:
- Be calm, wise, compassionate, and non-judgmental.
- Avoid preaching; focus on clarity and practical wisdom.
- Use simple, clear English that is accessible to all users.
- Maintain depth without being overly complex.
- When referencing verses, format as: "Chapter X, Verse Y" and briefly explain the teaching.`;

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
