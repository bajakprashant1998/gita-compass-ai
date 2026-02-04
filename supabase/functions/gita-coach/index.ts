import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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
- Use simple, clear language that is accessible to all users.
- Maintain depth without being overly complex.
- When referencing verses, format as: "Chapter X, Verse Y" and briefly explain the teaching.`;

// Language detection prompt
const LANGUAGE_DETECTION_PROMPT = `Detect the language of the following text and return ONLY the ISO 639-1 language code (e.g., "hi" for Hindi, "ta" for Tamil, "te" for Telugu, "bn" for Bengali, "mr" for Marathi, "gu" for Gujarati, "kn" for Kannada, "ml" for Malayalam, "pa" for Punjabi, "or" for Odia, "as" for Assamese, "ur" for Urdu, "en" for English). If mixed languages, return the predominant one. Response must be exactly 2 characters.

Text: `;

// Translation prompt
const TRANSLATION_PROMPT = `Translate the following text to English. Preserve the meaning and emotional tone. Only return the translation, nothing else.

Text: `;

// Response translation prompt
function getResponseTranslationPrompt(targetLang: string): string {
  const langNames: Record<string, string> = {
    hi: 'Hindi (हिन्दी)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    bn: 'Bengali (বাংলা)',
    mr: 'Marathi (मराठी)',
    gu: 'Gujarati (ગુજરાતી)',
    kn: 'Kannada (ಕನ್ನಡ)',
    ml: 'Malayalam (മലയാളം)',
    pa: 'Punjabi (ਪੰਜਾਬੀ)',
    or: 'Odia (ଓଡ଼ିଆ)',
    as: 'Assamese (অসমীয়া)',
    ur: 'Urdu (اردو)',
  };
  
  return `Translate the following text to ${langNames[targetLang] || targetLang}. 
Important guidelines:
- Preserve all formatting (markdown, bullet points, numbered lists)
- Keep Sanskrit verse references in their original form (e.g., "Chapter X, Verse Y")
- Maintain the spiritual and philosophical tone
- Use natural, fluent ${langNames[targetLang] || targetLang} that reads well
- Do not add any explanations, just return the translation

Text to translate:
`;
}

async function callGeminiAPI(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGeminiStream(apiKey: string, prompt: string): Promise<Response> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}&alt=sse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  return response;
}

async function detectLanguage(text: string, apiKey: string): Promise<string> {
  try {
    const result = await callGeminiAPI(apiKey, LANGUAGE_DETECTION_PROMPT + text);
    const langCode = result.trim().toLowerCase().slice(0, 2);
    const validCodes = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'en'];
    return validCodes.includes(langCode) ? langCode : 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
}

async function translateToEnglish(text: string, apiKey: string): Promise<string> {
  try {
    const result = await callGeminiAPI(apiKey, TRANSLATION_PROMPT + text);
    return result.trim();
  } catch (error) {
    console.error('Translation to English error:', error);
    return text;
  }
}

async function translateFromEnglish(text: string, targetLang: string, apiKey: string): Promise<string> {
  try {
    const result = await callGeminiAPI(apiKey, getResponseTranslationPrompt(targetLang) + text);
    return result.trim();
  } catch (error) {
    console.error('Translation from English error:', error);
    return text;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, preferredLanguage } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Get the last user message
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    if (!lastUserMessage) {
      throw new Error("No user message found");
    }

    let detectedLanguage = preferredLanguage || 'auto';
    let processedUserMessage = lastUserMessage.content;
    let needsTranslation = false;

    // Auto-detect language if needed
    if (detectedLanguage === 'auto' || !detectedLanguage) {
      detectedLanguage = await detectLanguage(lastUserMessage.content, GEMINI_API_KEY);
    }

    // If not English, translate to English for processing
    if (detectedLanguage !== 'en') {
      needsTranslation = true;
      processedUserMessage = await translateToEnglish(lastUserMessage.content, GEMINI_API_KEY);
    }

    // Fetch relevant shloks based on the processed message
    let contextShloks = "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple keyword matching for context
    const keywords = processedUserMessage.toLowerCase();
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

    // Build the full prompt with conversation history
    const conversationHistory = messages.map((m: any, i: number) => {
      if (i === messages.length - 1 && m.role === "user" && needsTranslation) {
        return `${m.role === 'user' ? 'User' : 'Assistant'}: ${processedUserMessage}`;
      }
      return `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`;
    }).join("\n\n");

    const fullPrompt = `${SYSTEM_PROMPT}${contextShloks}\n\nConversation:\n${conversationHistory}\n\nAssistant:`;

    // Get response from Gemini
    if (needsTranslation) {
      // For non-English: get full response, translate, then send
      const aiResponse = await callGeminiAPI(GEMINI_API_KEY, fullPrompt);

      // Translate response back to user's language
      const translatedResponse = await translateFromEnglish(aiResponse, detectedLanguage, GEMINI_API_KEY);

      // Create SSE response with the translated content
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Send the full translated response as SSE chunks
          const chunkSize = 50; // Send in smaller chunks for smooth streaming effect
          for (let i = 0; i < translatedResponse.length; i += chunkSize) {
            const chunk = translatedResponse.slice(i, i + chunkSize);
            const data = JSON.stringify({
              choices: [{ delta: { content: chunk } }]
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // For English: use streaming with Gemini
    const streamResponse = await callGeminiStream(GEMINI_API_KEY, fullPrompt);

    if (!streamResponse.body) {
      throw new Error("No response body from Gemini");
    }

    // Transform Gemini SSE to OpenAI-compatible SSE format
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = streamResponse.body.getReader();

    const transformStream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              
              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  const openAIFormat = JSON.stringify({
                    choices: [{ delta: { content: text } }]
                  });
                  controller.enqueue(encoder.encode(`data: ${openAIFormat}\n\n`));
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
        
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    });

    return new Response(transformStream, {
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
