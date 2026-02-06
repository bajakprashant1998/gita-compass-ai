import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserPreferencesData {
  theme: string;
  notificationsEnabled: boolean;
  dailyWisdomEnabled: boolean;
}

export function useUserPreferences(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery<UserPreferencesData>({
    queryKey: ['user-preferences', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return {
        theme: data?.theme || 'light',
        notificationsEnabled: data?.notifications_enabled ?? true,
        dailyWisdomEnabled: data?.daily_wisdom_enabled ?? true,
      };
    },
    enabled: !!userId,
  });

  const updatePreference = useMutation({
    mutationFn: async (updates: Partial<{
      theme: string;
      notifications_enabled: boolean;
      daily_wisdom_enabled: boolean;
    }>) => {
      if (!userId) throw new Error('No user');
      const { error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', userId] });
    },
  });

  return { ...query, updatePreference };
}
