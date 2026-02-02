-- Allow users to update their own messages
CREATE POLICY "Users can update own messages" 
ON public.chat_messages
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete own messages" 
ON public.chat_messages
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);