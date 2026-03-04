import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const CANONICAL_DOMAIN = 'https://www.bhagavadgitagyan.com';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string[];
  structuredData?: object | object[];
  type?: 'website' | 'article';
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  hreflang?: { lang: string; url: string }[];
}

export function SEOHead({
  title,
  description,
  canonicalUrl,
  ogImage = `${CANONICAL_DOMAIN}/og-image.png`,
  keywords = [],
  structuredData,
  type = 'website',
  noindex = false,
  publishedTime,
  modifiedTime,
  author,
  section,
  hreflang,
}: SEOHeadProps) {
  const location = useLocation();
  const fullTitle = title.includes('Bhagavad Gita Gyan') ? title : `${title} | Bhagavad Gita Gyan`;
  const resolvedCanonical = canonicalUrl || `${CANONICAL_DOMAIN}${location.pathname}`;
  const isNonCanonicalDomain = typeof window !== 'undefined' && 
    !window.location.hostname.includes('bhagavadgitagyan.com');

  // Handle multiple structured data objects
  const schemaScripts = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {(noindex || isNonCanonicalDomain) && (
        <meta name="robots" content="noindex, nofollow" />
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:site_name" content="Bhagavad Gita Gyan" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      {section && <meta property="article:section" content={section} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@bhagavadgitagyan" />
      
      {/* Canonical */}
      <link rel="canonical" href={resolvedCanonical} />
      
      {/* Hreflang for multilingual */}
      {hreflang?.map(h => (
        <link key={h.lang} rel="alternate" hrefLang={h.lang} href={h.url} />
      ))}
      
      {/* Structured Data */}
      {schemaScripts.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

// ===================== SCHEMA GENERATORS =====================

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bhagavad Gita Gyan',
    alternateName: 'BhagavadGitaGyan',
    description: 'AI-powered ancient wisdom from Bhagavad Gita for modern life problems',
    url: CANONICAL_DOMAIN,
    inLanguage: ['en', 'hi'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${CANONICAL_DOMAIN}/chat?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bhagavad Gita Gyan',
    url: CANONICAL_DOMAIN,
    logo: `${CANONICAL_DOMAIN}/logo.png`,
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${CANONICAL_DOMAIN}/contact`,
    },
  };
}

export function generateArticleSchema(shlok: {
  chapter_number: number;
  verse_number: number;
  english_meaning: string;
  sanskrit_text?: string;
  life_application?: string;
  updated_at?: string;
}) {
  const url = `${CANONICAL_DOMAIN}/chapters/${shlok.chapter_number}/verse/${shlok.verse_number}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Bhagavad Gita Chapter ${shlok.chapter_number}, Verse ${shlok.verse_number} - Meaning & Life Application`,
    description: shlok.english_meaning?.slice(0, 160),
    author: {
      '@type': 'Organization',
      name: 'Bhagavad Gita Gyan',
      url: CANONICAL_DOMAIN,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bhagavad Gita Gyan',
      logo: {
        '@type': 'ImageObject',
        url: `${CANONICAL_DOMAIN}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    datePublished: shlok.updated_at || new Date().toISOString(),
    dateModified: shlok.updated_at || new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    inLanguage: 'en',
    isAccessibleForFree: true,
    about: {
      '@type': 'Thing',
      name: 'Bhagavad Gita',
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

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBlogPostSchema(post: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
  cover_image?: string;
  tags?: string[];
}) {
  const url = `${CANONICAL_DOMAIN}/blog/${post.slug}`;
  const wordCount = post.content.trim().split(/\s+/).length;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bhagavad Gita Gyan',
      logo: {
        '@type': 'ImageObject',
        url: `${CANONICAL_DOMAIN}/logo.png`,
      },
    },
    datePublished: post.created_at,
    dateModified: post.updated_at,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    wordCount,
    keywords: post.tags?.join(', '),
    image: post.cover_image || `${CANONICAL_DOMAIN}/og-image.png`,
    inLanguage: 'en',
    isAccessibleForFree: true,
  };
}

export function generateChapterSchema(chapter: {
  chapter_number: number;
  title_english: string;
  description_english?: string;
  theme: string;
  verse_count?: number;
}) {
  const url = `${CANONICAL_DOMAIN}/chapters/${chapter.chapter_number}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Bhagavad Gita Chapter ${chapter.chapter_number}: ${chapter.title_english}`,
    description: chapter.description_english || `Explore the ${chapter.title_english} - ${chapter.theme}. Read all ${chapter.verse_count || ''} verses with meaning, stories, and life applications.`,
    author: { '@type': 'Organization', name: 'Bhagavad Gita Gyan' },
    publisher: {
      '@type': 'Organization',
      name: 'Bhagavad Gita Gyan',
      logo: { '@type': 'ImageObject', url: `${CANONICAL_DOMAIN}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    about: { '@type': 'Book', name: 'Bhagavad Gita' },
  };
}

export function generateCollectionPageSchema(name: string, description: string, items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${CANONICAL_DOMAIN}/chapters`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function generateHowToSchema(name: string, description: string, steps: { name: string; text: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
