import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, ChevronRight, Play, CheckCircle2 } from 'lucide-react';
import { GradientBorderCard } from '@/components/ui/decorative-elements';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface ActivePlan {
  id: string;
  current_day: number;
  status: string;
  plan: {
    id: string;
    title: string;
    duration_days: number;
    icon: string | null;
  };
}

export function ReadingPlansWidget({ userId }: { userId: string }) {
  const { data: activePlans, isLoading } = useQuery({
    queryKey: ['active-reading-plans', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_reading_plans')
        .select('id, current_day, status, plan:reading_plans(id, title, duration_days, icon)')
        .eq('user_id', userId)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data || []) as unknown as ActivePlan[];
    },
    enabled: !!userId,
  });

  const active = activePlans?.filter(p => p.status === 'active') || [];
  const completed = activePlans?.filter(p => p.status === 'completed') || [];

  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Reading Plans</h2>
          </div>
          <Link to="/reading-plans" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : active.length === 0 && completed.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm mb-3">No active reading plans yet</p>
            <Link to="/reading-plans">
              <Button size="sm" className="gap-2 rounded-lg">
                <Play className="h-4 w-4" />
                Start a Plan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((plan) => {
              const progress = Math.round((plan.current_day / plan.plan.duration_days) * 100);
              return (
                <Link key={plan.id} to={`/reading-plans/${plan.plan.id}`}>
                  <div className="p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all group cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {plan.plan.icon} {plan.plan.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Day {plan.current_day}/{plan.plan.duration_days}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </Link>
              );
            })}

            {completed.map((plan) => (
              <Link key={plan.id} to={`/reading-plans/${plan.plan.id}`}>
                <div className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all group cursor-pointer flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-muted-foreground">
                      {plan.plan.icon} {plan.plan.title}
                    </span>
                    <p className="text-xs text-muted-foreground">Completed ✨</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </GradientBorderCard>
  );
}
