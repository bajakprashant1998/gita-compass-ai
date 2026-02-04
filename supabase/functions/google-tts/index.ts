import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface TTSRequest {
  text: string;
  language?: 'english' | 'hindi' | 'sanskrit';
  voice_name?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language = 'english', voice_name } = await req.json() as TTSRequest;

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client to get settings from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Google TTS settings from admin_settings
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('key, value')
      .in('key', ['google_tts_api_key', 'google_tts_voice_en', 'google_tts_voice_hi']);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch TTS settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    
    const apiKey = settingsMap['google_tts_api_key'];
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google TTS API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine voice based on language
    let languageCode: string;
    let voiceName: string;

    if (voice_name) {
      // Extract language code from voice name (e.g., "ta-IN-Neural2-A" -> "ta-IN")
      const match = voice_name.match(/^([a-z]{2}-[A-Z]{2})/);
      languageCode = match ? match[1] : 'en-US';
      voiceName = voice_name;
    } else if (language === 'hindi' || language === 'sanskrit') {
      languageCode = 'hi-IN';
      voiceName = settingsMap['google_tts_voice_hi'] || 'hi-IN-Neural2-B';
    } else {
      languageCode = 'en-US';
      voiceName = settingsMap['google_tts_voice_en'] || 'en-US-Neural2-D';
    }

    console.log(`Generating TTS for ${language} with voice ${voiceName}...`);

    // Call Google Cloud Text-to-Speech API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            name: voiceName,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google TTS API error: ${response.status} ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Google TTS API error', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      return new Response(
        JSON.stringify({ error: 'No audio content received from Google TTS' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('TTS generation successful');

    // Return base64 audio content
    return new Response(
      JSON.stringify({ 
        audioContent: data.audioContent,
        format: 'mp3'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('TTS Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
