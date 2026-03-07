import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Generate a simple session ID per tab
const sessionId = crypto.randomUUID?.() || Math.random().toString(36).slice(2);

export function usePageViewTracker() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname;

    // Skip admin routes and duplicate fires
    if (path.startsWith('/admin') || path === lastPath.current) return;
    lastPath.current = path;

    const trackView = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        await supabase.from('page_views' as any).insert({
          page_path: path,
          page_title: document.title,
          referrer: document.referrer || null,
          session_id: sessionId,
          user_id: session?.user?.id || null,
        });
      } catch {
        // Silent fail — analytics should never break the app
      }
    };

    // Slight delay to capture the correct document.title after route change
    const timer = setTimeout(trackView, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);
}
