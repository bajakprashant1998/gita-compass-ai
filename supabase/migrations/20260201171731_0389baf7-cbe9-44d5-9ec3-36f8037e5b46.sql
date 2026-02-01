-- =====================================================
-- ADMIN SETTINGS TABLE (for API keys and configuration)
-- =====================================================
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  description TEXT,
  is_secret BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access settings
CREATE POLICY "Admins can manage settings" 
ON public.admin_settings FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default settings
INSERT INTO public.admin_settings (key, value, description, is_secret) VALUES
  ('gemini_api_key', '', 'Google Gemini API key for AI content generation (optional - uses Lovable AI if empty)', true),
  ('elevenlabs_api_key', '', 'ElevenLabs API key for text-to-speech', true),
  ('ai_model', 'google/gemini-3-flash-preview', 'AI model to use for content generation', false),
  ('ai_temperature', '0.7', 'AI temperature setting (0-1)', false),
  ('ai_max_tokens', '1000', 'Maximum tokens for AI responses', false),
  ('elevenlabs_voice_id', 'JBFqnCBsd6RMkjVDRZzb', 'Default ElevenLabs voice ID', false),
  ('default_language', 'en', 'Default content language', false);

-- =====================================================
-- SHLOK TRANSLATIONS TABLE (for multi-language support)
-- =====================================================
CREATE TABLE public.shlok_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shlok_id UUID NOT NULL REFERENCES public.shloks(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  meaning TEXT,
  life_application TEXT,
  practical_action TEXT,
  modern_story TEXT,
  problem_context TEXT,
  solution_gita TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shlok_id, language_code)
);

-- Enable RLS
ALTER TABLE public.shlok_translations ENABLE ROW LEVEL SECURITY;

-- Public read access for translations
CREATE POLICY "Anyone can read translations" 
ON public.shlok_translations FOR SELECT 
USING (true);

-- Only admins can manage translations
CREATE POLICY "Admins can manage translations" 
ON public.shlok_translations FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_shlok_translations_updated_at
  BEFORE UPDATE ON public.shlok_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_shlok_translations_shlok_id ON public.shlok_translations(shlok_id);
CREATE INDEX idx_shlok_translations_language ON public.shlok_translations(language_code);