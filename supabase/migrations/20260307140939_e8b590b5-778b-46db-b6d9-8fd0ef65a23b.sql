
-- SEO Landing Pages table for programmatic pages
CREATE TABLE public.seo_landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  page_type text NOT NULL DEFAULT 'topic',
  title text NOT NULL,
  description text,
  keywords text[] DEFAULT '{}',
  related_problem_ids uuid[] DEFAULT '{}',
  meta_title text,
  meta_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view landing pages" ON public.seo_landing_pages
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage landing pages" ON public.seo_landing_pages
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Web Stories table
CREATE TABLE public.web_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  slides jsonb NOT NULL DEFAULT '[]',
  shlok_id uuid REFERENCES public.shloks(id),
  published boolean NOT NULL DEFAULT false,
  meta_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.web_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published stories" ON public.web_stories
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage stories" ON public.web_stories
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
