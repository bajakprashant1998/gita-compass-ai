import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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
  en: 'English',
};

function getTranslationPrompt(targetLang: string): string {
  return `You are a professional translator. Translate the following text to ${langNames[targetLang] || targetLang}. 

Important guidelines:
- Preserve all formatting (markdown, bullet points, numbered lists, bold, italics)
- Keep Sanskrit verse references in their original form (e.g., "Chapter X, Verse Y" or "अध्याय X, श्लोक Y")
- Maintain the spiritual and philosophical tone
- Use natural, fluent ${langNames[targetLang] || targetLang} that reads well
- Do not add any explanations or notes
- Return ONLY the translated text, nothing else

Text to translate:
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, targetLanguage } = await req.json();
    
    if (!content || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: "Missing content or targetLanguage" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Build the prompt
    const prompt = targetLanguage === 'en' 
      ? `Translate the following text to English. Preserve all formatting (markdown, bullet points, etc). Return ONLY the translation:\n\n${content}`
      : getTranslationPrompt(targetLanguage) + content;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
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
    const translatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!translatedContent) {
      throw new Error("No translation returned");
    }

    return new Response(
      JSON.stringify({ translatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Translation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
