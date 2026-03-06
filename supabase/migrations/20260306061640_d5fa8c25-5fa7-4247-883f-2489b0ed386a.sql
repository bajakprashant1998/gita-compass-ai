-- Fix blog_posts: change restrictive policies to permissive
DROP POLICY IF EXISTS "Admins can manage posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Published posts are publicly readable" ON public.blog_posts;

CREATE POLICY "Admins can manage posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Published posts are publicly readable"
  ON public.blog_posts FOR SELECT
  TO anon, authenticated
  USING (published = true);