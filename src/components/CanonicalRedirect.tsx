import { useEffect } from 'react';

const CANONICAL_HOST = 'www.bhagavadgitagyan.com';

/**
 * Redirects non-www to www version to prevent
 * "Alternate page with proper canonical tag" issues in Google Search Console.
 */
export function CanonicalRedirect() {
  useEffect(() => {
    const { hostname, protocol, pathname, search, hash } = window.location;
    
    // Only redirect if on the non-www production domain
    if (hostname === 'bhagavadgitagyan.com') {
      window.location.replace(
        `${protocol}//${CANONICAL_HOST}${pathname}${search}${hash}`
      );
    }
  }, []);

  return null;
}
