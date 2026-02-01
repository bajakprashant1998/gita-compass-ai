-- Fix overly permissive RLS policy on story_types
DROP POLICY IF EXISTS "Authenticated users can manage story types" ON public.story_types;

-- Create proper admin-only policies for story_types
CREATE POLICY "Admins can manage story types" 
ON public.story_types 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));