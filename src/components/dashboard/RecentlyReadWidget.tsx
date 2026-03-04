import { Link } from 'react-router-dom';
import { Clock, ChevronRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GradientBorderCard } from '@/components/ui/decorative-elements';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentlyReadWidgetProps {
  shloksRead: string[];
}

export function RecentlyReadWidget({ shloksRead }: RecentlyReadWidgetProps) {
  const recentIds = shloksRead.slice(-5).reverse();

  const { data: verses, isLoading } = useQuery({
    queryKey: ['recently-read-verses', recentIds],
    queryFn: async () => {
      if (!recentIds.length) return [];
      const { data, error } = await supabase
        .from('shloks')
        .select('id, verse_number, english_meaning, chapter_id, chapters!shloks_chapter_id_fkey(chapter_number, title_english)')
        .in('id', recentIds);
      if (error) throw error;

      // Preserve recent-first order
      const map = new Map(data?.map(v => [v.id, v]));
      return recentIds.map(id => map.get(id)).filter(Boolean) as typeof data;
    },
    enabled: recentIds.length > 0,
  });

  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold">Recently Read</h2>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : verses && verses.length > 0 ? (
          <div className="space-y-2">
            {verses.map((v: any, i: number) => (
              <Link
                key={v.id}
                to={`/chapters/${v.chapters?.chapter_number}/verse/${v.verse_number}`}
              >
                <div
                  className="p-3 rounded-xl bg-muted/50 hover:bg-primary/5 transition-all cursor-pointer group border border-transparent hover:border-primary/10 animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20 text-primary">
                          Ch {v.chapters?.chapter_number} · V {v.verse_number}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors">
                        {v.english_meaning}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-0.5 shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground mb-1 font-medium">No verses read yet</p>
            <p className="text-xs text-muted-foreground/70">Start exploring chapters to see your history here</p>
          </div>
        )}
      </div>
    </GradientBorderCard>
  );
}
