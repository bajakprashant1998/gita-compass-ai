import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { AISearchBox } from '@/components/home/AISearchBox';
import { ProblemCategories } from '@/components/home/ProblemCategories';
import { DailyWisdom } from '@/components/home/DailyWisdom';
import { StatsSection } from '@/components/home/StatsSection';
import { CTASection } from '@/components/home/CTASection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Testimonials } from '@/components/home/Testimonials';
import { FeaturedVersesCarousel } from '@/components/home/FeaturedVersesCarousel';
import { FloatingActionButton } from '@/components/home/FloatingActionButton';
import { SEOHead, generateWebsiteSchema } from '@/components/SEOHead';

const Index = () => {
  return (
    <Layout>
      <SEOHead
        title="GitaWisdom - Ancient Wisdom for Modern Problems"
        description="Transform your struggles into strength with AI-powered guidance from the Bhagavad Gita. Find timeless solutions for anxiety, fear, confusion, and life decisions."
        canonicalUrl="https://gitawisdom.com/"
        keywords={['Bhagavad Gita', 'wisdom', 'anxiety help', 'fear', 'confusion', 'life advice', 'AI guidance', 'ancient wisdom']}
        structuredData={generateWebsiteSchema()}
      />
      <HeroSection />
      <AISearchBox />
      <StatsSection />
      <HowItWorks />
      <ProblemCategories />
      <FeaturedVersesCarousel />
      <Testimonials />
      <DailyWisdom />
      <CTASection />
      <FloatingActionButton />
    </Layout>
  );
};

export default Index;
