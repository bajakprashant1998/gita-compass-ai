import { supabase } from '@/integrations/supabase/client';

export interface AdminSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  is_secret: boolean;
  created_at: string;
  updated_at: string;
}

// Get all admin settings
export async function getAdminSettings(): Promise<AdminSetting[]> {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .order('key');

  if (error) throw error;
  return (data || []) as AdminSetting[];
}

// Get a single setting by key
export async function getSettingByKey(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;
  return data?.value || null;
}

// Update a setting
export async function updateSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('admin_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) throw error;
}

// Update multiple settings at once
export async function updateSettings(settings: Record<string, string>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('admin_settings')
      .update({ value: update.value, updated_at: update.updated_at })
      .eq('key', update.key);

    if (error) throw error;
  }
}

// Test Gemini API connection
export async function testGeminiConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "Hello" in one word' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { success: true };
    }

    return { success: false, error: 'Invalid response from API' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

// Test ElevenLabs API connection
export async function testElevenLabsConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': apiKey },
    });

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    if (data.subscription) {
      return { success: true };
    }

    return { success: false, error: 'Invalid API key' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

// Generate TTS audio using Google Cloud TTS
export async function generateTTS(
  text: string,
  language: 'sanskrit' | 'hindi' | 'english' = 'english',
  voiceName?: string
): Promise<{ audioContent: string; format: string }> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-tts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ text, language, voice_name: voiceName }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'TTS generation failed');
  }

  return response.json();
}

// Test Google TTS connection
export async function testGoogleTTSConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: 'Hello' },
          voice: { languageCode: 'en-US', name: 'en-US-Neural2-D' },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    if (data.audioContent) {
      return { success: true };
    }

    return { success: false, error: 'Invalid response from API' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

// Play base64 audio
export function playBase64Audio(base64Audio: string): HTMLAudioElement {
  const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
  const audio = new Audio(audioUrl);
  audio.play();
  return audio;
}
