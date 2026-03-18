import { Helmet } from 'react-helmet-async';

const CANONICAL_DOMAIN = 'https://www.bhagavadgitagyan.com';

/**
 * Global structured data injected on every page:
 * - Organization with enhanced properties
 * - WebSite with SearchAction (for sitelinks search box)
 * - SoftwareApplication for PWA signals
 */
export function AdvancedStructuredData() {
  const globalSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${CANONICAL_DOMAIN}/#organization`,
        name: 'Bhagavad Gita Gyan',
        url: CANONICAL_DOMAIN,
        logo: {
          '@type': 'ImageObject',
          '@id': `${CANONICAL_DOMAIN}/#logo`,
          url: `${CANONICAL_DOMAIN}/logo.png`,
          contentUrl: `${CANONICAL_DOMAIN}/logo.png`,
          width: 512,
          height: 512,
          caption: 'Bhagavad Gita Gyan',
        },
        image: { '@id': `${CANONICAL_DOMAIN}/#logo` },
        description: 'AI-powered platform making Bhagavad Gita wisdom accessible for modern life challenges.',
        foundingDate: '2024',
        knowsAbout: [
          'Bhagavad Gita', 'Hindu Philosophy', 'Karma Yoga', 'Bhakti Yoga',
          'Jnana Yoga', 'Dhyana Yoga', 'Vedic Wisdom', 'Meditation',
          'Spiritual Guidance', 'Sanskrit Scriptures',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          url: `${CANONICAL_DOMAIN}/contact`,
          availableLanguage: ['English', 'Hindi'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${CANONICAL_DOMAIN}/#website`,
        url: CANONICAL_DOMAIN,
        name: 'Bhagavad Gita Gyan',
        alternateName: ['BhagavadGitaGyan', 'भगवद्गीता ज्ञान'],
        description: 'Read Bhagavad Gita online free — all 18 chapters, 700+ verses with AI spiritual guidance.',
        publisher: { '@id': `${CANONICAL_DOMAIN}/#organization` },
        inLanguage: ['en', 'hi', 'sa'],
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${CANONICAL_DOMAIN}/chat?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        ],
      },
      {
        '@type': 'MobileApplication',
        '@id': `${CANONICAL_DOMAIN}/#app`,
        name: 'Bhagavad Gita Gyan',
        operatingSystem: 'Web',
        applicationCategory: 'LifestyleApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '500',
          bestRating: '5',
        },
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(globalSchema)}</script>
    </Helmet>
  );
}
