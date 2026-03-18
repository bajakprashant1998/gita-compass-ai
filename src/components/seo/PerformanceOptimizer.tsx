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

    // Dynamically import web-vitals only when available
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(reportWebVital);
      onINP(reportWebVital);
      onLCP(reportWebVital);
      onFCP(reportWebVital);
      onTTFB(reportWebVital);
    }).catch(() => {
      // web-vitals not installed, skip
    });
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
