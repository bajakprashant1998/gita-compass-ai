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

// Test API connection via secure edge function (keys never leave the server)
export async function testApiConnection(provider: 'gemini' | 'google-tts' | 'elevenlabs'): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-api-connection`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ provider }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Connection test failed' };
    }

    return response.json();
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

// Legacy functions kept for backward compatibility - redirect to secure endpoint
export async function testGeminiConnection(_apiKey?: string): Promise<{ success: boolean; error?: string }> {
  return testApiConnection('gemini');
}

export async function testElevenLabsConnection(_apiKey?: string): Promise<{ success: boolean; error?: string }> {
  return testApiConnection('elevenlabs');
}

export async function testGoogleTTSConnection(_apiKey?: string): Promise<{ success: boolean; error?: string }> {
  return testApiConnection('google-tts');
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

// Play base64 audio
export function playBase64Audio(base64Audio: string): HTMLAudioElement {
  const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
  const audio = new Audio(audioUrl);
  audio.play();
  return audio;
}
