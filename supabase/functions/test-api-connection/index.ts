import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider } = await req.json();

    if (!provider || !["gemini", "google-tts", "elevenlabs"].includes(provider)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid provider" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the API key from Supabase secrets or admin_settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let apiKey: string | null = null;
    let keyName = "";

    switch (provider) {
      case "gemini":
        keyName = "gemini_api_key";
        apiKey = Deno.env.get("GEMINI_API_KEY") || null;
        break;
      case "google-tts":
        keyName = "google_tts_api_key";
        break;
      case "elevenlabs":
        keyName = "elevenlabs_api_key";
        break;
    }

    // If not in env, try admin_settings table
    if (!apiKey) {
      const { data } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", keyName)
        .maybeSingle();
      apiKey = data?.value || null;
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: { success: boolean; error?: string };

    switch (provider) {
      case "gemini":
        result = await testGemini(apiKey);
        break;
      case "google-tts":
        result = await testGoogleTTS(apiKey);
        break;
      case "elevenlabs":
        result = await testElevenLabs(apiKey);
        break;
      default:
        result = { success: false, error: "Unknown provider" };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Test connection error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function testGemini(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "Hello" in one word' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini test error:", response.status, errorText);
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { success: true };
    }

    return { success: false, error: "Invalid response from API" };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Connection failed" };
  }
}

async function testGoogleTTS(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: "Hello" },
          voice: { languageCode: "en-US", name: "en-US-Neural2-D" },
          audioConfig: { audioEncoding: "MP3" },
        }),
      }
    );

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    if (data.audioContent) {
      return { success: true };
    }

    return { success: false, error: "Invalid response from API" };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Connection failed" };
  }
}

async function testElevenLabs(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/user", {
      headers: { "xi-api-key": apiKey },
    });

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    if (data.subscription) {
      return { success: true };
    }

    return { success: false, error: "Invalid API key" };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Connection failed" };
  }
}
