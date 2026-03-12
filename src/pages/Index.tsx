import { lazy, Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { SEOHead, generateWebsiteSchema, generateOrganizationSchema, generateFAQSchema, generateHowToSchema } from '@/components/SEOHead';
import { generateSiteNavigationSchema, generateBookSchema, generateKnowledgeGraph } from '@/lib/seoSchemas';

// Lazy load below-the-fold components for faster initial paint
const StatsSection = lazy(() => import('@/components/home/StatsSection').then(m => ({ default: m.StatsSection })));
const MoodSelector = lazy(() => import('@/components/home/MoodSelector').then(m => ({ default: m.MoodSelector })));
const HowItWorks = lazy(() => import('@/components/home/HowItWorks').then(m => ({ default: m.HowItWorks })));
const FeaturesGrid = lazy(() => import('@/components/home/FeaturesGrid').then(m => ({ default: m.FeaturesGrid })));
const ProblemCategories = lazy(() => import('@/components/home/ProblemCategories').then(m => ({ default: m.ProblemCategories })));
const DailyWisdom = lazy(() => import('@/components/home/DailyWisdom').then(m => ({ default: m.DailyWisdom })));
const CTASection = lazy(() => import('@/components/home/CTASection').then(m => ({ default: m.CTASection })));
const Testimonials = lazy(() => import('@/components/home/Testimonials').then(m => ({ default: m.Testimonials })));
const FeaturedVersesCarousel = lazy(() => import('@/components/home/FeaturedVersesCarousel').then(m => ({ default: m.FeaturedVersesCarousel })));
const FloatingActionButton = lazy(() => import('@/components/home/FloatingActionButton').then(m => ({ default: m.FloatingActionButton })));
const CommunityHighlights = lazy(() => import('@/components/home/CommunityHighlights').then(m => ({ default: m.CommunityHighlights })));
const SEOInternalLinks = lazy(() => import('@/components/home/SEOInternalLinks').then(m => ({ default: m.SEOInternalLinks })));

// Minimal skeleton for below-fold content
const SectionSkeleton = () => (
  <div className="py-16 section-placeholder">
    <div className="container mx-auto px-4">
      <div className="h-8 w-48 animate-shimmer rounded mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 animate-shimmer rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

const SectionDivider = () => (
  <div className="relative py-2">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  </div>
);

const Index = () => {
  return (
    <Layout>
      <SEOHead
        title="Bhagavad Gita Gyan - Ancient Wisdom for Modern Problems"
        description="Transform your struggles into strength with AI-powered guidance from the Bhagavad Gita. Find timeless solutions for anxiety, fear, confusion, and life decisions."
        canonicalUrl="https://www.bhagavadgitagyan.com/"
        keywords={['Bhagavad Gita', 'Bhagavad Gita online', 'Gita wisdom', 'anxiety help', 'fear', 'confusion', 'life advice', 'AI spiritual guidance', 'ancient wisdom', 'Bhagavad Gita in English', 'Bhagavad Gita meaning']}
        structuredData={[
          generateKnowledgeGraph(),
          generateSiteNavigationSchema(),
          generateFAQSchema([
            { question: 'What is Bhagavad Gita Gyan?', answer: 'Bhagavad Gita Gyan is an AI-powered platform that applies ancient wisdom from the Bhagavad Gita to solve modern life problems like anxiety, fear, confusion, and career challenges. It offers all 18 chapters and 700+ verses for free.' },
            { question: 'How can the Bhagavad Gita help with anxiety?', answer: 'The Bhagavad Gita teaches detachment from outcomes (Nishkama Karma), equanimity of mind (Sthitaprajna), and meditation techniques (Dhyana Yoga in Chapter 6) that directly address anxiety and stress.' },
            { question: 'Can I talk to an AI about my problems using the Bhagavad Gita?', answer: 'Yes! Our Talk to Krishna AI counselor uses deep knowledge of all 700+ verses to provide personalized guidance based on your specific life situation, available in 10+ Indian languages.' },
            { question: 'Is Bhagavad Gita Gyan free to use?', answer: 'Yes, all core features including reading all 700+ verses, AI counseling (Talk to Krishna), reading plans, and community features are completely free.' },
            { question: 'How many chapters are in the Bhagavad Gita?', answer: 'The Bhagavad Gita has 18 chapters and 700+ verses (shlokas). Each chapter covers different yogas: Karma Yoga (action), Bhakti Yoga (devotion), Jnana Yoga (knowledge), and Dhyana Yoga (meditation).' },
            { question: 'What is Karma Yoga in Bhagavad Gita?', answer: 'Karma Yoga is the yoga of selfless action taught in Chapter 3 of the Bhagavad Gita. Lord Krishna teaches Arjuna to perform duties without attachment to results (Nishkama Karma), transforming work into worship.' },
            { question: 'How to read Bhagavad Gita online for free?', answer: 'You can read all 18 chapters and 700+ verses of the Bhagavad Gita for free on Bhagavad Gita Gyan (bhagavadgitagyan.com) with Sanskrit text, transliteration, English meaning, Hindi translation, modern stories, and life applications.' },
            { question: 'What does Bhagavad Gita say about meditation?', answer: 'Chapter 6 (Dhyana Yoga) of the Bhagavad Gita provides detailed meditation instructions. Krishna teaches Arjuna about proper posture, breath control, mind concentration, and achieving equanimity through regular practice.' },
            { question: 'Who wrote the Bhagavad Gita?', answer: 'The Bhagavad Gita was composed by Sage Vyasa (Ved Vyasa) as part of the epic Mahabharata. It records the conversation between Lord Krishna and prince Arjuna on the battlefield of Kurukshetra.' },
            { question: 'What is the most important verse of Bhagavad Gita?', answer: 'Chapter 2, Verse 47 is often considered the most important: "Karmanye vadhikaraste ma phaleshu kadachana" — You have the right to perform your duty, but never to the fruits of your actions. This is the foundation of Karma Yoga.' },
          ]),
          generateHowToSchema(
            'How to Find Guidance from the Bhagavad Gita',
            'Use AI-powered Bhagavad Gita wisdom to find solutions to your life problems in 4 simple steps.',
            [
              { name: 'Identify Your Problem', text: 'Browse life problem categories like anxiety, fear, confusion, relationships, or career challenges on the problems page.' },
              { name: 'Explore Relevant Verses', text: 'Read curated Bhagavad Gita verses with Sanskrit text, English meaning, Hindi translation, life applications, and modern stories related to your situation.' },
              { name: 'Talk to Krishna AI', text: 'Use the free AI counselor for personalized, in-depth guidance based on your specific situation and the Gita teachings. Available in 10+ languages.' },
              { name: 'Follow an Action Plan', text: 'Start a structured 7-30 day reading plan with daily verses, reflection prompts, and practical steps to apply Gita wisdom in your life.' },
            ]
          ),
        ]}
      />
      {/* Critical above-the-fold content - loaded eagerly */}
      <HeroSection />
      
      {/* Below-the-fold content - lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <StatsSection />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionSkeleton />}>
        <MoodSelector />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorks />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionSkeleton />}>
        <FeaturesGrid />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionSkeleton />}>
        <ProblemCategories />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedVersesCarousel />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionSkeleton />}>
        <CommunityHighlights />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionSkeleton />}>
        <Testimonials />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionSkeleton />}>
        <DailyWisdom />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionSkeleton />}>
        <SEOInternalLinks />
      </Suspense>
      <SectionDivider />
      <Suspense fallback={<SectionSkeleton />}>
        <CTASection />
      </Suspense>
      <Suspense fallback={null}>
        <FloatingActionButton />
      </Suspense>
    </Layout>
  );
};

export default Index;
