import { lazy, Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { SEOHead, generateWebsiteSchema, generateOrganizationSchema, generateFAQSchema, generateHowToSchema } from '@/components/SEOHead';

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

// Minimal skeleton for below-fold content
const SectionSkeleton = () => (
  <div className="py-16">
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
          generateWebsiteSchema(),
          generateOrganizationSchema(),
          generateFAQSchema([
            { question: 'What is Bhagavad Gita Gyan?', answer: 'Bhagavad Gita Gyan is an AI-powered platform that applies ancient wisdom from the Bhagavad Gita to solve modern life problems like anxiety, fear, confusion, and career challenges.' },
            { question: 'How can the Bhagavad Gita help with anxiety?', answer: 'The Bhagavad Gita teaches detachment from outcomes (Nishkama Karma), equanimity of mind, and meditation techniques that directly address anxiety and stress.' },
            { question: 'Can I talk to an AI about my problems using the Bhagavad Gita?', answer: 'Yes! Our Talk to Krishna AI counselor uses deep knowledge of all 700+ verses to provide personalized guidance based on your specific life situation.' },
            { question: 'Is Bhagavad Gita Gyan free to use?', answer: 'Yes, all core features including reading verses, AI counseling, and reading plans are completely free.' },
            { question: 'How many chapters are in the Bhagavad Gita?', answer: 'The Bhagavad Gita has 18 chapters and 700+ verses, each addressing different aspects of life, duty, knowledge, and devotion.' },
          ]),
          generateHowToSchema(
            'How to Find Guidance from the Bhagavad Gita',
            'Use AI-powered Bhagavad Gita wisdom to find solutions to your life problems.',
            [
              { name: 'Identify Your Problem', text: 'Browse life problem categories like anxiety, fear, confusion, relationships, or career challenges.' },
              { name: 'Explore Relevant Verses', text: 'Read curated Bhagavad Gita verses with meaning, life applications, and modern stories related to your situation.' },
              { name: 'Talk to Krishna AI', text: 'Use the AI counselor for personalized, in-depth guidance based on your specific situation and the Gita teachings.' },
              { name: 'Follow an Action Plan', text: 'Get a structured 7-day action plan with daily verses, reflection prompts, and practical steps.' },
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
        <CTASection />
      </Suspense>
      <Suspense fallback={null}>
        <FloatingActionButton />
      </Suspense>
    </Layout>
  );
};

export default Index;
