import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TTSRequest {
  text: string;
  voice_id?: string;
  language?: 'sanskrit' | 'hindi' | 'english';
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

// Default voices optimized for different languages
const DEFAULT_VOICES: Record<string, string> = {
  sanskrit: 'JBFqnCBsd6RMkjVDRZzb', // George - deep, clear
  hindi: 'onwK4e9ZLuTAKqWW03F9',    // Daniel - clear articulation
  english: 'JBFqnCBsd6RMkjVDRZzb',  // George - deep, authoritative
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Fetch admin settings
    const settings = await getAdminSettings(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const ELEVENLABS_API_KEY = settings['elevenlabs_api_key'];
    
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured. Please add it in Admin Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, voice_id, language = 'english' }: TTSRequest = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use custom voice_id from settings if available, otherwise use language default
    const configuredVoiceId = settings['elevenlabs_voice_id'];
    const finalVoiceId = voice_id || configuredVoiceId || DEFAULT_VOICES[language] || DEFAULT_VOICES.english;

    console.log(`Generating TTS for ${language} with voice ${finalVoiceId}...`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid ElevenLabs API key. Please check your settings." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "ElevenLabs rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Return base64 encoded audio in JSON response
    const base64Audio = base64Encode(audioBuffer);
    
    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        format: "mp3",
        voice_id: finalVoiceId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("elevenlabs-tts error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
