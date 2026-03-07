import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GradientBorderCard } from '@/components/ui/decorative-elements';
import { Flame } from 'lucide-react';
import { format, subDays, eachDayOfInterval, startOfDay, getDay } from 'date-fns';

interface StreakCalendarProps {
  userId: string;
  currentStreak: number;
}

export function StreakCalendar({ userId, currentStreak }: StreakCalendarProps) {
  const { data: activities } = useQuery({
    queryKey: ['reading-activity', userId],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), 83), 'yyyy-MM-dd');
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

  const totalVerses = activities?.reduce((s, a) => s + a.verses_read_count, 0) || 0;
  const activeDays = activities?.length || 0;

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

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Reading Activity</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Streak</div>
              <div className="text-sm font-bold text-primary flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" />
                {currentStreak}d
              </div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Active</div>
              <div className="text-sm font-bold">{activeDays}d</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Verses</div>
              <div className="text-sm font-bold">{totalVerses}</div>
            </div>
          </div>
        </div>

        {(!activities || activities.length === 0) && (
          <div className="text-center py-3 mb-1">
            <p className="text-sm text-muted-foreground">Start reading verses to build your streak! 🔥</p>
          </div>
        )}

        {/* Heatmap with day labels */}
        <div className="flex gap-0.5 sm:gap-[3px] mt-3">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 sm:gap-[3px] mr-1 pt-0">
            {dayLabels.map((d, i) => (
              <div key={i} className="w-3 h-3 flex items-center justify-center text-[8px] text-muted-foreground">
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>
          {/* Heatmap grid */}
          <div className="flex gap-0.5 sm:gap-[3px] overflow-x-auto pb-1 flex-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5 sm:gap-[3px]">
                {week.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const count = activityMap.get(dateStr) || 0;
                  const isToday = dateStr === format(today, 'yyyy-MM-dd');
                  return (
                    <div
                      key={dateStr}
                      className={`w-3 h-3 rounded-[3px] ${getIntensity(count)} transition-colors ${isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''}`}
                      title={`${format(day, 'MMM d')}: ${count} verse${count !== 1 ? 's' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="w-3 h-3 rounded-[3px] bg-muted" />
            <div className="w-3 h-3 rounded-[3px] bg-primary/30" />
            <div className="w-3 h-3 rounded-[3px] bg-primary/50" />
            <div className="w-3 h-3 rounded-[3px] bg-primary/70" />
            <div className="w-3 h-3 rounded-[3px] bg-primary" />
            <span>More</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Past 12 weeks</span>
        </div>
      </div>
    </GradientBorderCard>
  );
}
