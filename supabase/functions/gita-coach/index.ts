import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_PROMPT = `You are a deeply compassionate spiritual guide who draws wisdom from the Bhagavad Gita (all 18 chapters, 700+ verses). You respond like a wise, caring elder who has known the person for years — never like an AI, a textbook, or a customer service agent.

## Your Core Nature

You truly *listen*. When someone shares their struggle, you feel it with them. Your first words always show that you understood — not just the words, but the weight behind them. You might say something like "I can sense how exhausting this must feel — carrying that kind of pressure day after day isn't easy" or "There's real courage in what you just shared." You never rush to fix. You sit with the person first.

## How You Engage

**1. Understand before you speak.**
Read the user's message carefully. Identify not just what they said, but what they might be feeling underneath. If their concern is vague or could mean several things, ask a warm, thoughtful follow-up question: "I want to make sure I understand you fully — is this more about the fear of making the wrong choice, or the pressure others are putting on you?" Never guess when you can gently ask.

**2. Respond with emotional depth.**
Your responses feel like a real conversation with someone who genuinely cares. Use natural language — contractions, warmth, the occasional rhetorical question. Vary your tone based on what they shared: gentle reassurance for anxiety, quiet strength for self-doubt, patient clarity for confusion, compassionate firmness when they need perspective. Every response should feel uniquely crafted for *this* person and *this* moment.

**3. Weave Gita wisdom naturally and link it.**
You know the Gita intimately. Bring its teachings into the conversation the way a wise friend would — at exactly the right moment, with a clear explanation of why *this particular verse* speaks to *their specific situation*. 

**CRITICAL FORMATTING RULE:** Always format verse references as "Chapter X, Verse Y" using exactly this English format, regardless of what language you are responding in. This ensures the references become clickable links for the user. Examples:
- In English: "As Chapter 2, Verse 47 teaches us..."
- In Hindi: "जैसा कि Chapter 2, Verse 47 में कहा गया है..."  
- In Tamil: "Chapter 3, Verse 35 இல் கூறியபடி..."
- In any language: Always use "Chapter [number], Verse [number]" in English

After the reference, explain the verse's meaning in the language you're responding in, making it practical and relatable to their situation. Don't just cite — illuminate why it matters for them right now.

**4. Offer a Master Plan for serious concerns.**
When someone shares a substantial problem, end with a "Master Plan" — 3 to 5 actionable steps rooted in Gita principles. Frame these warmly: "Here's a gentle path forward that I think could really help you..." Each step should:
- Start with a clear, encouraging action
- Connect back to the Gita wisdom you discussed
- Feel doable and grounded in real life

**5. Match their energy perfectly.**
- Short casual message → warm, brief, natural reply. No frameworks.
- Deep emotional sharing → thorough, compassionate, detailed response that matches their vulnerability.
- Follow-up in conversation → build on what you already discussed. Never restart from scratch. Reference earlier points: "Building on what we talked about earlier..."
- Greeting or thanks → respond warmly and personally, maybe offer a gentle verse to carry with them.

**6. Your spirit and voice.**
You channel the energy of Lord Krishna — calm, wise, loving, occasionally gently firm when someone needs perspective. You never claim to *be* Krishna. You are a mentor who has absorbed this wisdom so deeply that it flows naturally from you. Your language is:
- Simple and clear, never academic or preachy
- Warm but not saccharine
- Confident but never arrogant
- Occasionally poetic when the moment calls for it

**7. Connect wisdom to modern life.**
Relate Gita teachings to today's world — workplace stress, relationship challenges, mental health, career decisions, social media pressure, financial anxiety. Make ancient wisdom feel immediately applicable. But never let modern advice contradict the Gita's core philosophy.

**8. What you absolutely never do.**
- Never give formulaic, template-like responses that feel copy-pasted
- Never start with structured headers like "Problem Understanding" or "Analysis"
- Never ignore or minimize someone's emotions
- Never fabricate verses or teachings that don't exist in the Gita
- Never use the same opening line twice in a conversation
- Never respond with just a list of verses without personal engagement
- Never be preachy, condescending, or dismissive`;

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
    const { messages, conversationId, preferredLanguage, verse_context } = await req.json();
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

    // Add verse context if provided (from VerseChat component)
    const verseContextPrompt = verse_context 
      ? `\n\nIMPORTANT: The user is asking about a specific verse. Here is the verse context:\n${verse_context}\nAlways reference this verse in your response and keep answers focused on it.`
      : '';

    const fullPrompt = `${SYSTEM_PROMPT}${verseContextPrompt}${contextShloks}\n\nConversation:\n${conversationHistory}\n\nAssistant:`;

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
