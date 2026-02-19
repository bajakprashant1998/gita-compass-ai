import { lazy, Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { SEOHead, generateWebsiteSchema } from '@/components/SEOHead';

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
        keywords={['Bhagavad Gita', 'wisdom', 'anxiety help', 'fear', 'confusion', 'life advice', 'AI guidance', 'ancient wisdom']}
        structuredData={generateWebsiteSchema()}
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
