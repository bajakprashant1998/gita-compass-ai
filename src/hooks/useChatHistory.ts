import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useChatCount(userId: string | undefined) {
  return useQuery<number>({
    queryKey: ['chat-count', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from('chat_conversations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
}
