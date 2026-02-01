-- =============================================
-- ADMIN PANEL DATABASE MIGRATION
-- =============================================

-- 1. Create languages table for multi-language support
CREATE TABLE public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on languages
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for languages
CREATE POLICY "Anyone can view enabled languages"
ON public.languages FOR SELECT
USING (enabled = true);

CREATE POLICY "Admins can manage languages"
ON public.languages FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed default languages
INSERT INTO public.languages (code, name, native_name, enabled, display_order) VALUES
('en', 'English', 'English', true, 1),
('hi', 'Hindi', 'हिन्दी', true, 2),
('es', 'Spanish', 'Español', false, 3),
('fr', 'French', 'Français', false, 4),
('de', 'German', 'Deutsch', false, 5);

-- 2. Create ai_search_rules table for AI keyword mapping
CREATE TABLE public.ai_search_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  problem_id UUID REFERENCES public.problems(id) ON DELETE SET NULL,
  fallback_shloks UUID[] DEFAULT '{}',
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on ai_search_rules
ALTER TABLE public.ai_search_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_search_rules
CREATE POLICY "Anyone can view enabled rules"
ON public.ai_search_rules FOR SELECT
USING (enabled = true);

CREATE POLICY "Admins can manage AI rules"
ON public.ai_search_rules FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_ai_search_rules_updated_at
BEFORE UPDATE ON public.ai_search_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Create admin_activity_log table for audit trail
CREATE TABLE public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin_activity_log
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_activity_log
CREATE POLICY "Admins can view activity log"
ON public.admin_activity_log FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert activity log"
ON public.admin_activity_log FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. Add new columns to shloks table
ALTER TABLE public.shloks
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS story_type TEXT DEFAULT 'corporate',
ADD COLUMN IF NOT EXISTS sanskrit_audio_url TEXT,
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT now();

-- 5. Add category column to problems table
ALTER TABLE public.problems
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'mental';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shloks_status ON public.shloks(status);
CREATE INDEX IF NOT EXISTS idx_shloks_chapter_verse ON public.shloks(chapter_id, verse_number);
CREATE INDEX IF NOT EXISTS idx_problems_category ON public.problems(category);
CREATE INDEX IF NOT EXISTS idx_ai_rules_keywords ON public.ai_search_rules USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.admin_activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.admin_activity_log(user_id);