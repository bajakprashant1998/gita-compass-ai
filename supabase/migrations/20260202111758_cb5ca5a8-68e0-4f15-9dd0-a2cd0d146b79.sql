-- Allow public to read non-secret settings (like show_donate_button)
CREATE POLICY "Public can read non-secret settings"
ON public.admin_settings
FOR SELECT
TO public
USING (is_secret = false);