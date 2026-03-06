
-- Redirects table for canonical + redirect manager
CREATE TABLE public.seo_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path text NOT NULL UNIQUE,
  to_path text NOT NULL,
  redirect_type integer NOT NULL DEFAULT 301,
  is_active boolean NOT NULL DEFAULT true,
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active redirects" ON public.seo_redirects
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage redirects" ON public.seo_redirects
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
