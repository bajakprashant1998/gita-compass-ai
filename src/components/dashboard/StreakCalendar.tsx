import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GradientBorderCard } from '@/components/ui/decorative-elements';
import { Flame } from 'lucide-react';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';

interface StreakCalendarProps {
  userId: string;
  currentStreak: number;
}

export function StreakCalendar({ userId, currentStreak }: StreakCalendarProps) {
  const { data: activities } = useQuery({
    queryKey: ['reading-activity', userId],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), 83), 'yyyy-MM-dd'); // 12 weeks
      const { data, error } = await supabase
        .from('reading_activity')
        .select('activity_date, verses_read_count')
        .eq('user_id', userId)
        .gte('activity_date', startDate)
        .order('activity_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const today = startOfDay(new Date());
  const startDate = subDays(today, 83);
  const days = eachDayOfInterval({ start: startDate, end: today });

  const activityMap = new Map<string, number>();
  activities?.forEach((a) => {
    activityMap.set(a.activity_date, a.verses_read_count);
  });

  const getIntensity = (count: number): string => {
    if (count === 0) return 'bg-muted';
    if (count <= 1) return 'bg-primary/30';
    if (count <= 3) return 'bg-primary/50';
    if (count <= 5) return 'bg-primary/70';
    return 'bg-primary';
  };

  // Group days into weeks (columns)
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Reading Streak</h2>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Flame className="h-4 w-4" />
            {currentStreak} day{currentStreak !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Heatmap */}
        <div className="flex gap-[3px] overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const count = activityMap.get(dateStr) || 0;
                return (
                  <div
                    key={dateStr}
                    className={`w-3 h-3 rounded-sm ${getIntensity(count)} transition-colors`}
                    title={`${format(day, 'MMM d')}: ${count} verse${count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-primary/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/50" />
          <div className="w-3 h-3 rounded-sm bg-primary/70" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>More</span>
        </div>
      </div>
    </GradientBorderCard>
  );
}
