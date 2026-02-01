import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { ProblemCategories } from '@/components/home/ProblemCategories';
import { DailyWisdom } from '@/components/home/DailyWisdom';
import { StatsSection } from '@/components/home/StatsSection';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <StatsSection />
      <ProblemCategories />
      <DailyWisdom />
      <CTASection />
    </Layout>
  );
};

export default Index;
