import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Prefetch pages on hover/touch for near-instant navigation.
 * Reduces perceived load time and bounce rate.
 */
const prefetchedRoutes = new Set<string>();

export function usePrefetchRoute() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const prefetch = useCallback((path: string) => {
    if (prefetchedRoutes.has(path)) return;
    
    // Clear any pending prefetch
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      prefetchedRoutes.add(path);
      // Create a hidden link with prefetch hint
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      link.as = 'document';
      document.head.appendChild(link);
    }, 65); // Small delay to avoid prefetching on scroll-through
  }, []);

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return { prefetch, cancelPrefetch };
}

/**
 * Enhanced Link wrapper that prefetches on hover.
 * Use for important internal navigation links.
 */
export function PrefetchLink({
  to,
  children,
  className,
  ...props
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const { prefetch, cancelPrefetch } = usePrefetchRoute();
  const navigate = useNavigate();

  return (
    <a
      href={to}
      className={className}
      onMouseEnter={() => prefetch(to)}
      onTouchStart={() => prefetch(to)}
      onMouseLeave={cancelPrefetch}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
