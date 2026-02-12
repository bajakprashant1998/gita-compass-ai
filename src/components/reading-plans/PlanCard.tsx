import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlanCardProps {
  plan: {
    id: string;
    title: string;
    description: string | null;
    duration_days: number;
    difficulty: string;
    icon: string | null;
  };
  userProgress?: {
    status: string;
    current_day: number;
  } | null;
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function PlanCard({ plan, userProgress }: PlanCardProps) {
  const isActive = userProgress?.status === 'active';
  const isCompleted = userProgress?.status === 'completed';
  const progress = userProgress ? Math.round((userProgress.current_day / plan.duration_days) * 100) : 0;

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="h-1.5 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-3xl">{plan.icon || '📖'}</span>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
              {plan.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {plan.duration_days} days
              </Badge>
              <Badge className={`text-xs border-0 ${difficultyColors[plan.difficulty] || difficultyColors.beginner}`}>
                <BarChart3 className="h-3 w-3 mr-1" />
                {plan.difficulty}
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>

        {plan.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {plan.description}
          </p>
        )}

        {isActive && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Day {userProgress.current_day} of {plan.duration_days}</span>
              <span className="font-medium text-primary">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <Link to={`/reading-plans/${plan.id}`}>
          <Button className="w-full gap-2" variant={isActive ? 'default' : 'outline'}>
            {isActive ? 'Continue Plan' : isCompleted ? 'Review Plan' : 'Start Plan'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
