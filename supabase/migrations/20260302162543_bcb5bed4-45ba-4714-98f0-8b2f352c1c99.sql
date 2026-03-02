
-- Allow admins to read all reading_activity for analytics
CREATE POLICY "Admins can view all reading activity"
ON public.reading_activity
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all chat_conversations for analytics
CREATE POLICY "Admins can view all conversations"
ON public.chat_conversations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all chat_messages for analytics
CREATE POLICY "Admins can view all messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all favorites for analytics
CREATE POLICY "Admins can view all favorites"
ON public.favorites
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all user_progress for analytics
CREATE POLICY "Admins can view all user progress"
ON public.user_progress
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
