-- Fix security warnings

-- 1. Add explicit SELECT policy for chat_conversations
-- (The ALL policy exists but an explicit SELECT provides clarity)
CREATE POLICY "Users can view own conversations" 
ON public.chat_conversations
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Remove public access to admin_settings (security risk)
DROP POLICY IF EXISTS "Public can read non-secret settings" ON public.admin_settings;