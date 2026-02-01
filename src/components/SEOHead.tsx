import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string[];
  structuredData?: object;
  type?: 'website' | 'article';
}

export function SEOHead({
  title,
  description,
  canonicalUrl,
  ogImage = 'https://gitawisdom.com/og-image.png',
  keywords = [],
  structuredData,
  type = 'website',
}: SEOHeadProps) {
  const fullTitle = title.includes('Bhagavad Gita Gyan') ? title : `${title} | Bhagavad Gita Gyan`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Reusable structured data generators
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bhagavad Gita Gyan',
    description: 'AI-powered ancient wisdom from Bhagavad Gita for modern life problems',
    url: 'https://gitawisdom.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://gitawisdom.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateArticleSchema(shlok: {
  chapter_number: number;
  verse_number: number;
  english_meaning: string;
  life_application?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Chapter ${shlok.chapter_number}, Verse ${shlok.verse_number} - Bhagavad Gita`,
    description: shlok.english_meaning,
    author: {
      '@type': 'Organization',
      name: 'Bhagavad Gita Gyan',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bhagavad Gita Gyan',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gitawisdom.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://gitawisdom.com/chapter/${shlok.chapter_number}/verse/${shlok.verse_number}`,
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
