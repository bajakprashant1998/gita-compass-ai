/**
 * Advanced JSON-LD schema generators for rich snippets in Google.
 */

const CANONICAL_DOMAIN = 'https://www.bhagavadgitagyan.com';

// Speakable schema for Google Assistant / voice search
export function generateSpeakableSchema(cssSelectors: string[] = ['h1', '.verse-meaning', '.life-application']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
  };
}

// Course schema for reading plans
export function generateCourseSchema(plan: {
  title: string;
  description?: string;
  difficulty: string;
  duration_days: number;
  id: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: plan.title,
    description: plan.description || `A ${plan.duration_days}-day Bhagavad Gita reading plan`,
    provider: {
      '@type': 'Organization',
      name: 'Bhagavad Gita Gyan',
      url: CANONICAL_DOMAIN,
    },
    educationalLevel: plan.difficulty === 'beginner' ? 'Beginner' : plan.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced',
    timeRequired: `P${plan.duration_days}D`,
    isAccessibleForFree: true,
    inLanguage: 'en',
    url: `${CANONICAL_DOMAIN}/reading-plans/${plan.id}`,
  };
}

// SiteNavigationElement for sitelinks
export function generateSiteNavigationSchema() {
  const items = [
    { name: 'All Chapters', url: `${CANONICAL_DOMAIN}/chapters` },
    { name: 'Life Problems', url: `${CANONICAL_DOMAIN}/problems` },
    { name: 'Talk to Krishna AI', url: `${CANONICAL_DOMAIN}/chat` },
    { name: 'Reading Plans', url: `${CANONICAL_DOMAIN}/reading-plans` },
    { name: 'Blog', url: `${CANONICAL_DOMAIN}/blog` },
    { name: 'Contact', url: `${CANONICAL_DOMAIN}/contact` },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    hasPart: items.map(item => ({
      '@type': 'WebPage',
      name: item.name,
      url: item.url,
    })),
  };
}

// Book schema for the Bhagavad Gita itself
export function generateBookSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: 'Bhagavad Gita',
    alternateName: ['Srimad Bhagavad Gita', 'श्रीमद्भगवद्गीता', 'Song of God'],
    author: { '@type': 'Person', name: 'Vyasa' },
    inLanguage: ['sa', 'en', 'hi'],
    numberOfPages: 700,
    genre: ['Philosophy', 'Spirituality', 'Religion'],
    about: [
      { '@type': 'Thing', name: 'Dharma' },
      { '@type': 'Thing', name: 'Yoga' },
      { '@type': 'Thing', name: 'Karma' },
      { '@type': 'Thing', name: 'Moksha' },
    ],
    url: `${CANONICAL_DOMAIN}/chapters`,
    isAccessibleForFree: true,
  };
}

// ItemList schema for chapter listings (better than CollectionPage for rankings)
export function generateItemListSchema(items: { name: string; url: string; description?: string; position: number }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      item: {
        '@type': 'Article',
        name: item.name,
        url: item.url,
        description: item.description,
      },
    })),
  };
}

// VideoObject schema for audio/video content
export function generateAudioSchema(verse: {
  chapter_number: number;
  verse_number: number;
  sanskrit_text: string;
  audio_url?: string;
}) {
  if (!verse.audio_url) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: `Bhagavad Gita Chapter ${verse.chapter_number}, Verse ${verse.verse_number} - Sanskrit Recitation`,
    description: verse.sanskrit_text.slice(0, 160),
    contentUrl: verse.audio_url,
    encodingFormat: 'audio/mpeg',
    inLanguage: 'sa',
    isAccessibleForFree: true,
  };
}

// Enhanced article with review-like aggregateRating
export function generateEnhancedVerseSchema(verse: {
  chapter_number: number;
  verse_number: number;
  english_meaning: string;
  sanskrit_text: string;
  life_application?: string;
  practical_action?: string;
  updated_at?: string;
  reflectionCount?: number;
}) {
  const url = `${CANONICAL_DOMAIN}/chapters/${verse.chapter_number}/verse/${verse.verse_number}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Bhagavad Gita Chapter ${verse.chapter_number}, Verse ${verse.verse_number} - Meaning & Life Application`,
    description: verse.english_meaning?.slice(0, 160),
    articleBody: [verse.english_meaning, verse.life_application, verse.practical_action].filter(Boolean).join('\n\n'),
    author: { '@type': 'Organization', name: 'Bhagavad Gita Gyan', url: CANONICAL_DOMAIN },
    publisher: {
      '@type': 'Organization',
      name: 'Bhagavad Gita Gyan',
      logo: { '@type': 'ImageObject', url: `${CANONICAL_DOMAIN}/logo.png`, width: 512, height: 512 },
    },
    datePublished: verse.updated_at || new Date().toISOString(),
    dateModified: verse.updated_at || new Date().toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    inLanguage: 'en',
    isAccessibleForFree: true,
    about: [
      { '@type': 'Thing', name: 'Bhagavad Gita' },
      { '@type': 'Thing', name: `Chapter ${verse.chapter_number}` },
    ],
    interactionStatistic: verse.reflectionCount ? {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: verse.reflectionCount,
    } : undefined,
  };
}
