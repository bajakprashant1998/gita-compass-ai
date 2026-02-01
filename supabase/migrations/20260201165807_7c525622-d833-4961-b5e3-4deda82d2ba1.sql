-- Create story_types table for managing custom story types
CREATE TABLE public.story_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.story_types ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (story types are configuration data)
CREATE POLICY "Story types are viewable by everyone" 
ON public.story_types 
FOR SELECT 
USING (true);

-- Create policy for admin insert/update/delete (for now allow all authenticated, will tighten with admin role later)
CREATE POLICY "Authenticated users can manage story types" 
ON public.story_types 
FOR ALL 
USING (true);

-- Seed default story types
INSERT INTO public.story_types (name, display_name, description, keywords, display_order) VALUES
('corporate', 'Corporate / Business', 'Stories set in office, business, startup contexts', ARRAY['work', 'office', 'boss', 'team', 'deadline', 'meeting', 'project', 'career'], 1),
('family', 'Family / Home', 'Stories about family relationships, parenting, home life', ARRAY['parent', 'child', 'home', 'marriage', 'family', 'mother', 'father', 'son', 'daughter'], 2),
('youth', 'Youth / Student', 'Stories about students, young adults, career decisions', ARRAY['student', 'college', 'career', 'future', 'exam', 'school', 'university', 'job'], 3),
('global', 'Global / Universal', 'Universal stories applicable to anyone', ARRAY['life', 'journey', 'wisdom', 'choice', 'path', 'human', 'world', 'universal'], 4);