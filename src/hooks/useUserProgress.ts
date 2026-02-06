import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProgressData {
  chaptersExplored: string[];
  shloksRead: string[];
  currentStreak: number;
  longestStreak: number;
  totalReadingTime: number;
  lastActivityDate: string | null;
}

export function useUserProgress(userId: string | undefined) {
  return useQuery<UserProgressData>({
    queryKey: ['user-progress', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return {
        chaptersExplored: (data?.chapters_explored as string[]) || [],
        shloksRead: (data?.shloks_read as string[]) || [],
        currentStreak: data?.current_streak || 0,
        longestStreak: data?.longest_streak || 0,
        totalReadingTime: data?.total_reading_time || 0,
        lastActivityDate: data?.last_activity_date || null,
      };
    },
    enabled: !!userId,
  });
}
