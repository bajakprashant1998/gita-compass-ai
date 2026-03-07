import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VerseRecommendation {
  shlok_id: string;
  chapter: number;
  verse: number;
  reason: string;
}

export function useVerseRecommendations(userId: string | undefined) {
  return useQuery<VerseRecommendation[]>({
    queryKey: ['verse-recommendations', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase.functions.invoke('verse-recommendations', {
        body: { user_id: userId },
      });
      if (error) throw error;
      return data?.recommendations || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 min
    retry: 1,
  });
}
