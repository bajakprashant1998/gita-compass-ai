import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BookmarkCollection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  item_count?: number;
}

export function useCollections(userId: string | undefined) {
  const queryClient = useQueryClient();

  const collectionsQuery = useQuery({
    queryKey: ['collections', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookmark_collections')
        .select('*, collection_items(count)')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((c: any) => ({
        ...c,
        item_count: c.collection_items?.[0]?.count || 0,
      })) as BookmarkCollection[];
    },
    enabled: !!userId,
  });

  const createCollection = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('bookmark_collections')
        .insert({ user_id: userId!, name, description: description || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', userId] });
      toast.success('Collection created! 🙏');
    },
  });

  const addToCollection = useMutation({
    mutationFn: async ({ collectionId, shlokId }: { collectionId: string; shlokId: string }) => {
      const { error } = await supabase
        .from('collection_items')
        .insert({ collection_id: collectionId, shlok_id: shlokId });
      if (error) {
        if (error.code === '23505') throw new Error('Already in collection');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', userId] });
      toast.success('Added to collection!');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteCollection = useMutation({
    mutationFn: async (collectionId: string) => {
      const { error } = await supabase
        .from('bookmark_collections')
        .delete()
        .eq('id', collectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', userId] });
      toast.success('Collection deleted');
    },
  });

  return {
    collections: collectionsQuery.data || [],
    isLoading: collectionsQuery.isLoading,
    createCollection,
    addToCollection,
    deleteCollection,
  };
}
