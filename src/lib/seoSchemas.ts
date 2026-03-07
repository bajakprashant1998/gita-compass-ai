/**
 * Advanced JSON-LD schema generators for rich snippets in Google & AI engines.
 */

const CANONICAL_DOMAIN = 'https://www.bhagavadgitagyan.com';

/**
 * Master Knowledge Graph — a single @graph with interconnected entities.
 * This is the NUCLEAR SEO weapon. Google, ChatGPT, Gemini, and Perplexity
 * all consume this to build entity relationships.
 */
export function generateKnowledgeGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. WebSite entity with SearchAction
      {
        '@type': 'WebSite',
        '@id': `${CANONICAL_DOMAIN}/#website`,
        url: CANONICAL_DOMAIN,
        name: 'Bhagavad Gita Gyan',
        alternateName: ['BhagavadGitaGyan', 'Bhagavad Gita Gyan AI', 'भगवद्गीता ज्ञान'],
        description: 'AI-powered ancient wisdom from the Bhagavad Gita for modern life problems. Complete 18 chapters, 700+ verses with Sanskrit text, English & Hindi meanings, life applications, and AI spiritual guidance.',
        inLanguage: ['en', 'hi', 'sa'],
        publisher: { '@id': `${CANONICAL_DOMAIN}/#organization` },
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${CANONICAL_DOMAIN}/chat?q={search_term_string}` },
            'query-input': 'required name=search_term_string',
          },
          {
            '@type': 'ReadAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${CANONICAL_DOMAIN}/chapters/{chapter_number}/verse/{verse_number}` },
          },
        ],
      },
      // 2. Organization / Publisher
      {
        '@type': ['Organization', 'EducationalOrganization'],
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
          caption: 'Bhagavad Gita Gyan Logo',
        },
        image: { '@id': `${CANONICAL_DOMAIN}/#logo` },
        description: 'Digital platform making Bhagavad Gita wisdom accessible through AI-powered guidance, modern interpretations, and structured learning paths.',
        foundingDate: '2024',
        areaServed: 'Worldwide',
        knowsAbout: [
          'Bhagavad Gita',
          'Hindu Philosophy',
          'Karma Yoga',
          'Bhakti Yoga',
          'Jnana Yoga',
          'Dhyana Yoga',
          'Vedic Wisdom',
          'Sanskrit Scriptures',
          'Spiritual Guidance',
          'Meditation',
          'Mindfulness',
          'Mental Health',
          'Ancient Indian Philosophy',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          url: `${CANONICAL_DOMAIN}/contact`,
        },
        sameAs: [],
      },
      // 3. The Bhagavad Gita as a Book/CreativeWork
      {
        '@type': ['Book', 'CreativeWork'],
        '@id': `${CANONICAL_DOMAIN}/#bhagavad-gita`,
        name: 'Bhagavad Gita',
        alternateName: ['Srimad Bhagavad Gita', 'श्रीमद्भगवद्गीता', 'Song of God', 'Gita'],
        author: { '@type': 'Person', name: 'Vyasa', alternateName: 'Ved Vyasa' },
        inLanguage: ['sa', 'en', 'hi'],
        numberOfPages: 700,
        genre: ['Philosophy', 'Spirituality', 'Religion', 'Self-Help', 'Ancient Text'],
        about: [
          { '@type': 'Thing', name: 'Dharma', description: 'Sacred duty and righteousness' },
          { '@type': 'Thing', name: 'Karma Yoga', description: 'Path of selfless action' },
          { '@type': 'Thing', name: 'Bhakti Yoga', description: 'Path of devotion' },
          { '@type': 'Thing', name: 'Jnana Yoga', description: 'Path of knowledge' },
          { '@type': 'Thing', name: 'Moksha', description: 'Liberation from cycle of birth and death' },
          { '@type': 'Thing', name: 'Meditation', description: 'Dhyana yoga for mental peace' },
          { '@type': 'Thing', name: 'Atman', description: 'The eternal, indestructible soul' },
        ],
        character: [
          { '@type': 'Person', name: 'Krishna', alternateName: ['Lord Krishna', 'श्री कृष्ण', 'Shri Krishna'], description: 'Supreme Personality of Godhead, charioteer and guide of Arjuna' },
          { '@type': 'Person', name: 'Arjuna', alternateName: ['Partha', 'Dhananjaya'], description: 'Pandava prince, greatest archer, student of Krishna' },
        ],
        isPartOf: { '@type': 'Book', name: 'Mahabharata', author: { '@type': 'Person', name: 'Vyasa' } },
        url: `${CANONICAL_DOMAIN}/chapters`,
        isAccessibleForFree: true,
        sameAs: [
          'https://en.wikipedia.org/wiki/Bhagavad_Gita',
          'https://www.wikidata.org/wiki/Q36092',
        ],
      },
      // 4. WebApplication (the AI tool)
      {
        '@type': 'WebApplication',
        '@id': `${CANONICAL_DOMAIN}/#app`,
        name: 'Talk to Krishna AI',
        description: 'AI-powered spiritual counselor providing personalized guidance from the Bhagavad Gita for anxiety, stress, confusion, career decisions, and life challenges.',
        url: `${CANONICAL_DOMAIN}/chat`,
        applicationCategory: 'LifestyleApplication',
        applicationSubCategory: 'Spiritual Guidance',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free AI spiritual guidance',
        },
        featureList: [
          'Personalized Bhagavad Gita guidance',
          'Multi-language support (10+ Indian languages)',
          'Voice input for hands-free interaction',
          'Verse-specific deep conversations',
          'Conversation history',
        ],
        isPartOf: { '@id': `${CANONICAL_DOMAIN}/#website` },
      },
      // 5. Main WebPage
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL_DOMAIN}/#webpage`,
        url: CANONICAL_DOMAIN,
        name: 'Bhagavad Gita Gyan - Ancient Wisdom for Modern Problems',
        description: 'Transform your struggles into strength with AI-powered guidance from the Bhagavad Gita. All 18 chapters, 700+ verses, and AI counselor for free.',
        isPartOf: { '@id': `${CANONICAL_DOMAIN}/#website` },
        about: { '@id': `${CANONICAL_DOMAIN}/#bhagavad-gita` },
        inLanguage: 'en',
        primaryImageOfPage: { '@id': `${CANONICAL_DOMAIN}/#logo` },
        breadcrumb: { '@id': `${CANONICAL_DOMAIN}/#breadcrumb` },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.hero-description', '.faq-answer'],
        },
      },
      // 6. Breadcrumb for homepage
      {
        '@type': 'BreadcrumbList',
        '@id': `${CANONICAL_DOMAIN}/#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: CANONICAL_DOMAIN },
        ],
      },
    ],
  };
}

/**
 * EducationalOccupationalProgram schema for reading plans.
 * This helps Google understand structured learning content.
 */
export function generateLearningProgramSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: 'Bhagavad Gita Study Programs',
    description: 'Structured reading plans to study the Bhagavad Gita with daily verses, reflection prompts, and practical applications.',
    provider: { '@type': 'Organization', name: 'Bhagavad Gita Gyan', url: CANONICAL_DOMAIN },
    educationalProgramMode: 'online',
    isAccessibleForFree: true,
    url: `${CANONICAL_DOMAIN}/reading-plans`,
  };
}

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
