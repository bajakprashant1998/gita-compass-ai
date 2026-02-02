-- Add Google TTS settings to admin_settings table
INSERT INTO admin_settings (key, value, description, is_secret) VALUES
  ('google_tts_api_key', 'AIzaSyAiNQVwsZy6CRTCXEppljE7qT2TzvKfouA', 'Google Cloud TTS API key', true),
  ('google_tts_voice_en', 'en-US-Neural2-D', 'Default English voice for TTS', false),
  ('google_tts_voice_hi', 'hi-IN-Neural2-B', 'Default Hindi/Sanskrit voice for TTS', false),
  ('tts_provider', 'google', 'Active TTS provider (google or elevenlabs)', false)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;