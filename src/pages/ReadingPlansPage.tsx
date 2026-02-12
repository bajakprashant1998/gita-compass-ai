import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { PlanCard } from '@/components/reading-plans/PlanCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen } from 'lucide-react';

export default function ReadingPlansPage() {
  const { user } = useAuth();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['reading-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_plans')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: userPlans = [] } = useQuery({
    queryKey: ['user-reading-plans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_reading_plans')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const userPlanMap = new Map(userPlans.map(up => [up.plan_id, up]));

  return (
    <Layout>
      <SEOHead
        title="Guided Reading Plans | Bhagavad Gita Gyan"
        description="Embark on curated multi-day spiritual journeys through the Bhagavad Gita. Choose from guided reading plans designed for inner peace, courage, and purpose."
        canonicalUrl="https://www.bhagavadgitagyan.com/reading-plans"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <BookOpen className="h-4 w-4" />
              Guided Journeys
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Reading Plans</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Curated multi-day spiritual journeys through the Bhagavad Gita. 
              Each plan guides you through carefully selected verses with daily reflection prompts.
            </p>
          </div>

          {/* Plans grid */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {plans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  userProgress={userPlanMap.get(plan.id) as any}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
