import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, FileText, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth, getDay } from 'date-fns';

interface ScheduledShlok {
  id: string;
  verse_number: number;
  status: string;
  scheduled_publish_at: string;
  english_meaning: string;
  chapter: { chapter_number: number; title_english: string } | null;
}

export default function AdminScheduleCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { data: scheduled, isLoading } = useQuery({
    queryKey: ['admin-scheduled', format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shloks')
        .select('id, verse_number, status, scheduled_publish_at, english_meaning, chapter:chapters!shloks_chapter_id_fkey(chapter_number, title_english)')
        .not('scheduled_publish_at', 'is', null)
        .gte('scheduled_publish_at', monthStart.toISOString())
        .lte('scheduled_publish_at', monthEnd.toISOString())
        .order('scheduled_publish_at', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as ScheduledShlok[];
    },
  });

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart); // 0=Sun

  const dayScheduleMap = useMemo(() => {
    const map = new Map<string, ScheduledShlok[]>();
    (scheduled || []).forEach(s => {
      const key = format(new Date(s.scheduled_publish_at), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [scheduled]);

  const totalScheduled = scheduled?.length || 0;
  const publishedCount = scheduled?.filter(s => s.status === 'published').length || 0;

  return (
    <div>
      <AdminHeader
        title="Content Schedule"
        subtitle={`${totalScheduled} scheduled this month · ${publishedCount} published`}
        icon={<CalendarDays className="w-5 h-5" />}
        actions={
          <Button asChild size="sm">
            <Link to="/admin/shloks/create">
              <FileText className="w-4 h-4 mr-2" /> New Shlok
            </Link>
          </Button>
        }
      />

      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-[500px] rounded-2xl" />
      ) : (
        <Card className="rounded-2xl border-border/60 overflow-hidden">
          <CardContent className="p-0">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border/40">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells for padding */}
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} className="min-h-[100px] border-b border-r border-border/20 bg-muted/10" />
              ))}

              {days.map(day => {
                const key = format(day, 'yyyy-MM-dd');
                const items = dayScheduleMap.get(key) || [];
                const isToday = isSameDay(day, new Date());

                return (
                  <div key={key} className={`min-h-[100px] border-b border-r border-border/20 p-1.5 transition-colors hover:bg-muted/20 ${isToday ? 'bg-primary/5' : ''}`}>
                    <div className={`text-xs font-semibold mb-1 px-1 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {items.slice(0, 3).map(item => (
                        <Link
                          key={item.id}
                          to={`/admin/shloks/edit/${item.id}`}
                          className="block px-1.5 py-1 rounded-md text-[10px] font-medium truncate transition-colors bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          Ch{item.chapter?.chapter_number}:V{item.verse_number}
                        </Link>
                      ))}
                      {items.length > 3 && (
                        <span className="text-[10px] text-muted-foreground px-1">+{items.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming list */}
      {(scheduled || []).length > 0 && (
        <Card className="rounded-2xl border-border/60 mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Upcoming This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(scheduled || []).slice(0, 10).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                      Ch {item.chapter?.chapter_number} · V {item.verse_number}
                    </Badge>
                    <p className="text-sm truncate">{item.english_meaning}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(item.scheduled_publish_at), 'MMM d, h:mm a')}
                    </span>
                    <Badge variant={item.status === 'published' ? 'default' : 'secondary'} className="text-[10px]">
                      {item.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <Link to={`/admin/shloks/edit/${item.id}`}><Edit className="w-3 h-3" /></Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
