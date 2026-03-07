import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, FileText, Edit, GripVertical } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';

interface CalendarItem {
  id: string;
  type: 'shlok' | 'blog';
  label: string;
  status: string;
  scheduledAt: string;
  editUrl: string;
}

export default function AdminScheduleCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [dragItem, setDragItem] = useState<CalendarItem | null>(null);
  const queryClient = useQueryClient();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const queryKey = ['admin-calendar', format(monthStart, 'yyyy-MM')];

  // Fetch shloks
  const { data: shloks, isLoading: shloksLoading } = useQuery({
    queryKey: ['admin-cal-shloks', format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shloks')
        .select('id, verse_number, status, scheduled_publish_at, english_meaning, chapter:chapters!shloks_chapter_id_fkey(chapter_number, title_english)')
        .not('scheduled_publish_at', 'is', null)
        .gte('scheduled_publish_at', monthStart.toISOString())
        .lte('scheduled_publish_at', monthEnd.toISOString())
        .order('scheduled_publish_at', { ascending: true });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  // Fetch blog posts
  const { data: blogs, isLoading: blogsLoading } = useQuery({
    queryKey: ['admin-cal-blogs', format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, published, scheduled_publish_at, created_at')
        .or(`and(scheduled_publish_at.gte.${monthStart.toISOString()},scheduled_publish_at.lte.${monthEnd.toISOString()}),and(created_at.gte.${monthStart.toISOString()},created_at.lte.${monthEnd.toISOString()})`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = shloksLoading || blogsLoading;

  // Unify into CalendarItems
  const calendarItems = useMemo(() => {
    const items: CalendarItem[] = [];
    (shloks || []).forEach(s => {
      items.push({
        id: `shlok-${s.id}`,
        type: 'shlok',
        label: `Ch${s.chapter?.chapter_number}:V${s.verse_number}`,
        status: s.status || 'draft',
        scheduledAt: s.scheduled_publish_at,
        editUrl: `/admin/shloks/edit/${s.id}`,
      });
    });
    (blogs || []).forEach(b => {
      const date = b.scheduled_publish_at || b.created_at;
      items.push({
        id: `blog-${b.id}`,
        type: 'blog',
        label: b.title.length > 20 ? b.title.slice(0, 18) + '…' : b.title,
        status: b.published ? 'published' : 'draft',
        scheduledAt: date,
        editUrl: `/admin/blog/edit/${b.id}`,
      });
    });
    return items;
  }, [shloks, blogs]);

  const dayMap = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    calendarItems.forEach(item => {
      const key = format(new Date(item.scheduledAt), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return map;
  }, [calendarItems]);

  // Reschedule mutation
  const reschedule = useMutation({
    mutationFn: async ({ item, newDate }: { item: CalendarItem; newDate: Date }) => {
      const realId = item.id.replace(/^(shlok|blog)-/, '');
      const table = item.type === 'shlok' ? 'shloks' : 'blog_posts';
      const { error } = await supabase
        .from(table)
        .update({ scheduled_publish_at: newDate.toISOString() } as any)
        .eq('id', realId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cal-shloks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cal-blogs'] });
      toast.success('Rescheduled successfully');
    },
  });

  // Bulk publish/unpublish
  const bulkAction = useMutation({
    mutationFn: async (action: 'publish' | 'unpublish') => {
      const items = calendarItems.filter(i => selectedItems.has(i.id));
      for (const item of items) {
        const realId = item.id.replace(/^(shlok|blog)-/, '');
        if (item.type === 'shlok') {
          await supabase.from('shloks').update({ status: action === 'publish' ? 'published' : 'draft' }).eq('id', realId);
        } else {
          await supabase.from('blog_posts').update({ published: action === 'publish' }).eq('id', realId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cal-shloks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cal-blogs'] });
      setSelectedItems(new Set());
      toast.success('Bulk action completed');
    },
  });

  // Bulk reschedule
  const bulkReschedule = useMutation({
    mutationFn: async (newDate: Date) => {
      const items = calendarItems.filter(i => selectedItems.has(i.id));
      for (const item of items) {
        const realId = item.id.replace(/^(shlok|blog)-/, '');
        const table = item.type === 'shlok' ? 'shloks' : 'blog_posts';
        await supabase.from(table).update({ scheduled_publish_at: newDate.toISOString() } as any).eq('id', realId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cal-shloks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cal-blogs'] });
      setSelectedItems(new Set());
      toast.success('Bulk rescheduled');
    },
  });

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, item: CalendarItem) => {
    setDragItem(item);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, day: Date) => {
    e.preventDefault();
    if (dragItem) {
      const newDate = new Date(day);
      const oldDate = new Date(dragItem.scheduledAt);
      newDate.setHours(oldDate.getHours(), oldDate.getMinutes());
      reschedule.mutate({ item: dragItem, newDate });
      setDragItem(null);
    }
  }, [dragItem, reschedule]);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const totalShloks = shloks?.length || 0;
  const totalBlogs = blogs?.length || 0;

  const typeColors = {
    shlok: 'bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 border-orange-500/30',
    blog: 'bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/30',
  };

  return (
    <div>
      <AdminHeader
        title="Content Calendar"
        subtitle={`${totalShloks} shloks · ${totalBlogs} blog posts this month`}
        icon={<CalendarDays className="w-5 h-5" />}
        actions={
          <Button asChild size="sm">
            <Link to="/admin/shloks/create"><FileText className="w-4 h-4 mr-2" /> New Shlok</Link>
          </Button>
        }
      />

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded bg-orange-500/40" /> <span>Shloks</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded bg-blue-500/40" /> <span>Blog Posts</span>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-muted border border-border/60">
          <span className="text-sm font-medium">{selectedItems.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => bulkAction.mutate('publish')} disabled={bulkAction.isPending}>Publish</Button>
          <Button size="sm" variant="outline" onClick={() => bulkAction.mutate('unpublish')} disabled={bulkAction.isPending}>Unpublish</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">Reschedule</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" onSelect={(d) => d && bulkReschedule.mutate(d)} />
            </PopoverContent>
          </Popover>
          <Button size="sm" variant="ghost" onClick={() => setSelectedItems(new Set())}>Clear</Button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-[500px] rounded-2xl" />
      ) : (
        <Card className="rounded-2xl border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-border/40">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} className="min-h-[110px] border-b border-r border-border/20 bg-muted/10" />
              ))}
              {days.map(day => {
                const key = format(day, 'yyyy-MM-dd');
                const items = dayMap.get(key) || [];
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={key}
                    className={`min-h-[110px] border-b border-r border-border/20 p-1.5 transition-colors hover:bg-muted/20 ${isToday ? 'bg-primary/5' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day)}
                  >
                    <div className={`text-xs font-semibold mb-1 px-1 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {items.slice(0, 3).map(item => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-medium truncate transition-colors cursor-grab active:cursor-grabbing border ${typeColors[item.type]}`}
                        >
                          <Checkbox
                            className="h-3 w-3 shrink-0"
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={() => toggleSelect(item.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <GripVertical className="h-3 w-3 shrink-0 opacity-40" />
                          <Link to={item.editUrl} className="truncate hover:underline" onClick={(e) => e.stopPropagation()}>
                            {item.label}
                          </Link>
                        </div>
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
      {calendarItems.length > 0 && (
        <Card className="rounded-2xl border-border/60 mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Upcoming This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {calendarItems.slice(0, 15).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${item.type === 'shlok' ? 'border-orange-500/40 text-orange-700' : 'border-blue-500/40 text-blue-700'}`}>
                      {item.type === 'shlok' ? '📖' : '✏️'} {item.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(item.scheduledAt), 'MMM d, h:mm a')}
                    </span>
                    <Badge variant={item.status === 'published' ? 'default' : 'secondary'} className="text-[10px]">
                      {item.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <Link to={item.editUrl}><Edit className="w-3 h-3" /></Link>
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
