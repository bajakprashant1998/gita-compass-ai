import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PageSEO {
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_image?: string | null;
}

export function usePageSEO(pageIdentifier: string) {
  return useQuery({
    queryKey: ['page-seo', pageIdentifier],
    queryFn: async (): Promise<PageSEO | null> => {
      const { data, error } = await supabase
        .from('page_seo_metadata')
        .select('meta_title, meta_description, meta_keywords, og_image')
        .eq('page_identifier', pageIdentifier)
        .maybeSingle();

      if (error) {
        console.error('Failed to fetch SEO metadata:', error);
        return null;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
