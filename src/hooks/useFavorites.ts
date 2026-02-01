import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Favorite } from '@/types';

export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select('*, shloks(*, chapters(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data as any[]).map(item => ({
        ...item,
        shlok: {
          ...item.shloks,
          chapter: item.shloks?.chapters,
        },
      })) as Favorite[];
    },
    enabled: !!userId,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, shlokId, isFavorite }: { userId: string; shlokId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('shlok_id', shlokId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: userId, shlok_id: shlokId });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.userId] });
    },
  });
}

export function useIsFavorite(userId: string | undefined, shlokId: string) {
  return useQuery({
    queryKey: ['favorite', userId, shlokId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('shlok_id', shlokId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!userId,
  });
}
