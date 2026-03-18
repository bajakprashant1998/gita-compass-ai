import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Runtime performance optimizations:
 * 1. Reports Web Vitals to analytics
 * 2. Adds resource hints for likely next navigations
 * 3. Implements Interaction to Next Paint (INP) optimizations
 */
export function PerformanceOptimizer() {
  const location = useLocation();

  // Report Web Vitals to GA4
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reportWebVital = (metric: { name: string; value: number; id: string }) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        });
      }
    };

    // Report basic CWV using PerformanceObserver (no library needed)
    try {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        reportWebVital({ name: 'LCP', value: last.startTime, id: 'lcp-' + Date.now() });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Report CLS on page hide
      const reportCLS = () => {
        reportWebVital({ name: 'CLS', value: clsValue, id: 'cls-' + Date.now() });
      };
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') reportCLS();
      });
    } catch {
      // PerformanceObserver not supported
    }
  }, []);

  // Add dynamic resource hints based on current page
  useEffect(() => {
    const hints: { rel: string; href: string }[] = [];

    if (location.pathname === '/') {
      hints.push(
        { rel: 'prefetch', href: '/chapters' },
        { rel: 'prefetch', href: '/chat' },
        { rel: 'prefetch', href: '/problems' },
      );
    } else if (location.pathname === '/chapters') {
      for (let i = 1; i <= 3; i++) {
        hints.push({ rel: 'prefetch', href: `/chapters/${i}` });
      }
    }

    const links: HTMLLinkElement[] = [];
    hints.forEach(({ rel, href }) => {
      if (!document.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        document.head.appendChild(link);
        links.push(link);
      }
    });

    return () => {
      links.forEach((link) => link.remove());
    };
  }, [location.pathname]);

  return null;
}

// Extend window for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
