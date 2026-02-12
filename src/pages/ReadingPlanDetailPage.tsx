import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { DayProgress } from '@/components/reading-plans/DayProgress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Play, CheckCircle2, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function ReadingPlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ['reading-plan', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_plans')
        .select('*')
        .eq('id', planId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });

  const { data: days = [] } = useQuery({
    queryKey: ['reading-plan-days', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_plan_days')
        .select('*, shloks:shlok_id(verse_number, english_meaning, chapter_id, chapters:chapter_id(chapter_number, title_english))')
        .eq('plan_id', planId!)
        .order('day_number');
      if (error) throw error;
      // Map nested structure
      return data.map((d: any) => ({
        ...d,
        shlok: d.shloks ? {
          verse_number: d.shloks.verse_number,
          english_meaning: d.shloks.english_meaning,
          chapter: d.shloks.chapters,
        } : undefined,
      }));
    },
    enabled: !!planId,
  });

  const { data: userPlan } = useQuery({
    queryKey: ['user-reading-plan', planId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_reading_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_id', planId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!planId && !!user,
  });

  const startPlan = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('user_reading_plans')
        .upsert({ user_id: user.id, plan_id: planId!, current_day: 1, status: 'active' }, { onConflict: 'user_id,plan_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reading-plan'] });
      queryClient.invalidateQueries({ queryKey: ['user-reading-plans'] });
      toast.success('Plan started! 🎉');
    },
  });

  const advanceDay = useMutation({
    mutationFn: async () => {
      if (!user || !userPlan) return;
      const nextDay = userPlan.current_day + 1;
      const isComplete = nextDay > (plan?.duration_days || 999);
      const { error } = await supabase
        .from('user_reading_plans')
        .update({
          current_day: isComplete ? userPlan.current_day : nextDay,
          status: isComplete ? 'completed' : 'active',
          completed_at: isComplete ? new Date().toISOString() : null,
        })
        .eq('id', userPlan.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reading-plan'] });
      queryClient.invalidateQueries({ queryKey: ['user-reading-plans'] });
      toast.success('Day completed! 🙏');
    },
  });

  if (planLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-40 animate-pulse rounded-xl bg-muted" />
            {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Plan not found</h1>
          <Link to="/reading-plans"><Button>Browse Plans</Button></Link>
        </div>
      </Layout>
    );
  }

  const isActive = userPlan?.status === 'active';
  const isCompleted = userPlan?.status === 'completed';
  const currentDay = userPlan?.current_day || 0;

  return (
    <Layout>
      <SEOHead
        title={`${plan.title} | Reading Plans`}
        description={plan.description || `A ${plan.duration_days}-day guided reading plan through the Bhagavad Gita.`}
        canonicalUrl={`https://www.bhagavadgitagyan.com/reading-plans/${plan.id}`}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Link to="/reading-plans">
            <Button variant="ghost" className="gap-2 mb-6">
              <ChevronLeft className="h-4 w-4" /> All Plans
            </Button>
          </Link>

          {/* Plan header */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-amber-50/30 dark:from-primary/10 dark:to-amber-900/10 border border-primary/20">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{plan.icon || '📖'}</span>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{plan.title}</h1>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline">{plan.duration_days} days</Badge>
                  <Badge variant="outline" className="capitalize">{plan.difficulty}</Badge>
                  {isCompleted && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              {!user ? (
                <Link to="/auth"><Button>Sign in to Start</Button></Link>
              ) : !userPlan ? (
                <Button onClick={() => startPlan.mutate()} disabled={startPlan.isPending} className="gap-2">
                  <Play className="h-4 w-4" /> Start Plan
                </Button>
              ) : isActive ? (
                <Button onClick={() => advanceDay.mutate()} disabled={advanceDay.isPending} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Complete Day {currentDay}
                </Button>
              ) : isCompleted ? (
                <Button variant="outline" onClick={() => startPlan.mutate()} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Restart Plan
                </Button>
              ) : null}
            </div>
          </div>

          {/* Progress bar */}
          {isActive && (
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-primary">Day {currentDay} of {plan.duration_days}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(currentDay / plan.duration_days) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Days list */}
          <div className="space-y-4">
            {days.map((day: any) => (
              <DayProgress
                key={day.id}
                day={day}
                isCompleted={day.day_number < currentDay}
                isCurrent={day.day_number === currentDay}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
