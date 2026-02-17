import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Discussion {
  id: string;
  shlok_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
  replies?: Discussion[];
}

export function useDiscussions(shlokId: string | undefined) {
  return useQuery({
    queryKey: ['discussions', shlokId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verse_discussions')
        .select('*, profile:profiles!verse_discussions_user_id_fkey(display_name, avatar_url)')
        .eq('shlok_id', shlokId!)
        .order('created_at', { ascending: true });
      if (error) throw error;

      // Build thread tree
      const all = data as any[];
      const topLevel = all.filter(d => !d.parent_id);
      const replies = all.filter(d => d.parent_id);

      return topLevel.map(d => ({
        ...d,
        replies: replies.filter(r => r.parent_id === d.id),
      })) as Discussion[];
    },
    enabled: !!shlokId,
  });
}

export function useCreateDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { shlokId: string; content: string; parentId?: string; userId: string }) => {
      const { data, error } = await supabase
        .from('verse_discussions')
        .insert({
          shlok_id: params.shlokId,
          user_id: params.userId,
          content: params.content,
          parent_id: params.parentId || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['discussions', params.shlokId] });
    },
  });
}
