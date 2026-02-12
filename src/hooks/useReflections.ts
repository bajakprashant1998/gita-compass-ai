import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Reflection {
  id: string;
  user_id: string;
  shlok_id: string;
  content: string;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
  likes_count: number;
  is_liked: boolean;
}

export function useReflections(shlokId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reflections = [], isLoading } = useQuery({
    queryKey: ['reflections', shlokId, user?.id],
    queryFn: async () => {
      // Fetch reflections
      const { data: refs, error } = await supabase
        .from('verse_reflections')
        .select('*')
        .eq('shlok_id', shlokId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!refs || refs.length === 0) return [];

      // Fetch profiles for all users
      const userIds = [...new Set(refs.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Fetch like counts
      const refIds = refs.map(r => r.id);
      const { data: likes } = await supabase
        .from('reflection_likes')
        .select('reflection_id')
        .in('reflection_id', refIds);

      const likeCounts = new Map<string, number>();
      likes?.forEach(l => {
        likeCounts.set(l.reflection_id, (likeCounts.get(l.reflection_id) || 0) + 1);
      });

      // Fetch user's likes
      let userLikes = new Set<string>();
      if (user) {
        const { data: myLikes } = await supabase
          .from('reflection_likes')
          .select('reflection_id')
          .eq('user_id', user.id)
          .in('reflection_id', refIds);
        userLikes = new Set(myLikes?.map(l => l.reflection_id) || []);
      }

      return refs.map(r => ({
        ...r,
        profile: profileMap.get(r.user_id) || null,
        likes_count: likeCounts.get(r.id) || 0,
        is_liked: userLikes.has(r.id),
      })) as Reflection[];
    },
  });

  const addReflection = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('verse_reflections')
        .insert({ user_id: user.id, shlok_id: shlokId, content });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', shlokId] });
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (reflectionId: string) => {
      if (!user) throw new Error('Must be logged in');
      const reflection = reflections.find(r => r.id === reflectionId);
      if (reflection?.is_liked) {
        const { error } = await supabase
          .from('reflection_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('reflection_id', reflectionId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reflection_likes')
          .insert({ user_id: user.id, reflection_id: reflectionId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', shlokId] });
    },
  });

  const deleteReflection = useMutation({
    mutationFn: async (reflectionId: string) => {
      const { error } = await supabase
        .from('verse_reflections')
        .delete()
        .eq('id', reflectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', shlokId] });
    },
  });

  // Sort by likes (most liked first)
  const sorted = [...reflections].sort((a, b) => b.likes_count - a.likes_count);

  return {
    reflections: sorted,
    isLoading,
    addReflection,
    toggleLike,
    deleteReflection,
  };
}
