import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  display_order: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: BadgeDefinition;
}

export function useBadgeDefinitions() {
  return useQuery({
    queryKey: ['badge-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badge_definitions')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as BadgeDefinition[];
    },
  });
}

export function useUserBadges(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badge_definitions(*)')
        .eq('user_id', userId!);
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!userId,
  });
}

export function useCheckAndAwardBadges(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (progress: {
      versesRead: number;
      streakDays: number;
      chaptersExplored: number;
      reflectionsWritten: number;
      plansCompleted: number;
    }) => {
      if (!userId) return [];

      // Get all badge definitions and user's existing badges
      const [{ data: badges }, { data: earned }] = await Promise.all([
        supabase.from('badge_definitions').select('*'),
        supabase.from('user_badges').select('badge_id').eq('user_id', userId),
      ]);

      if (!badges) return [];
      const earnedIds = new Set(earned?.map(e => e.badge_id) || []);

      const typeMap: Record<string, number> = {
        verses_read: progress.versesRead,
        streak_days: progress.streakDays,
        chapters_explored: progress.chaptersExplored,
        reflections_written: progress.reflectionsWritten,
        plans_completed: progress.plansCompleted,
      };

      const newBadges = badges.filter(b =>
        !earnedIds.has(b.id) &&
        (typeMap[b.requirement_type] ?? 0) >= b.requirement_value
      );

      if (newBadges.length > 0) {
        await supabase.from('user_badges').insert(
          newBadges.map(b => ({ user_id: userId, badge_id: b.id }))
        );
      }

      return newBadges;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-badges', userId] });
    },
  });
}
