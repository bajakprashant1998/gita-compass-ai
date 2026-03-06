import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Client-side redirect handler that checks seo_redirects table.
 * Place inside BrowserRouter to handle redirects before page renders.
 */
export function RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: redirects } = useQuery({
    queryKey: ['seo-redirects'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('seo_redirects')
        .select('from_path, to_path')
        .eq('is_active', true);
      return (data || []) as { from_path: string; to_path: string }[];
    },
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!redirects) return;
    const match = redirects.find((r) => r.from_path === location.pathname);
    if (match) {
      navigate(match.to_path, { replace: true });
    }
  }, [location.pathname, redirects, navigate]);

  return null;
}
