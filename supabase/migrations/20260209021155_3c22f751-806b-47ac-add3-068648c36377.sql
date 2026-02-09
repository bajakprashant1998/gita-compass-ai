
-- Add SEO columns to chapters table
ALTER TABLE public.chapters
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS meta_keywords text[];

-- Add SEO columns to shloks table
ALTER TABLE public.shloks
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS meta_keywords text[];

-- Add SEO columns to problems table
ALTER TABLE public.problems
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS meta_keywords text[];

-- Create page_seo_metadata table for static pages
CREATE TABLE public.page_seo_metadata (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type text NOT NULL DEFAULT 'static',
  page_identifier text NOT NULL,
  meta_title text,
  meta_description text,
  meta_keywords text[],
  og_image text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(page_type, page_identifier)
);

-- Enable RLS
ALTER TABLE public.page_seo_metadata ENABLE ROW LEVEL SECURITY;

-- Anyone can read SEO metadata (needed for frontend)
CREATE POLICY "Anyone can view SEO metadata"
ON public.page_seo_metadata
FOR SELECT
USING (true);

-- Admins can manage SEO metadata
CREATE POLICY "Admins can manage SEO metadata"
ON public.page_seo_metadata
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_page_seo_metadata_updated_at
BEFORE UPDATE ON public.page_seo_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
