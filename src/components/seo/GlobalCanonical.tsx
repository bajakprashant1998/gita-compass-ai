import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const CANONICAL_DOMAIN = 'https://www.bhagavadgitagyan.com';

/**
 * Global canonical tag that automatically sets a self-referencing canonical URL
 * for every page. Individual pages using SEOHead will override this with their
 * own canonical tag since react-helmet-async uses last-rendered-wins.
 */
export function GlobalCanonical() {
  const location = useLocation();
  const canonical = `${CANONICAL_DOMAIN}${location.pathname}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
}
