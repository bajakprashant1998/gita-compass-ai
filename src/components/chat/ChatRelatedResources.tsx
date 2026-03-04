import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Compass, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface RelatedResourcesData {
  verses: Array<{
    chapterNumber: number;
    verseNumber: number;
    chapterTitle: string;
    meaning: string;
  }>;
  problems: Array<{
    name: string;
    slug: string;
    icon: string;
    category: string;
  }>;
  readingPlans: Array<{
    id: string;
    title: string;
    difficulty: string;
    days: number;
    icon: string;
  }>;
  chapters: Array<{
    number: number;
    title: string;
    theme: string;
  }>;
}

interface ChatRelatedResourcesProps {
  data: RelatedResourcesData;
  className?: string;
}

export function ChatRelatedResources({ data, className }: ChatRelatedResourcesProps) {
  const hasContent = data.verses.length > 0 || data.problems.length > 0 || data.readingPlans.length > 0;
  if (!hasContent) return null;

  return (
    <div className={cn("ml-10 md:ml-12 mt-2 animate-fade-in", className)}>
      <div className="rounded-xl border border-border/40 bg-gradient-to-br from-primary/[0.03] to-amber-500/[0.03] overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-border/30 flex items-center gap-2">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">Related Resources</span>
        </div>

        <div className="p-3 space-y-3">
          {/* Referenced Verses */}
          {data.verses.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <BookOpen className="h-3 w-3 text-primary/60" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Verses Referenced</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {data.verses.slice(0, 4).map((v, i) => (
                  <Link
                    key={i}
                    to={`/chapters/${v.chapterNumber}/verse/${v.verseNumber}`}
                    className="group flex items-start gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/15"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gradient-to-br from-primary/10 to-amber-500/10 flex items-center justify-center border border-primary/15">
                      <span className="text-[10px] font-bold text-primary">{v.chapterNumber}.{v.verseNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground/80 truncate">
                        Ch {v.chapterNumber}: {v.chapterTitle}
                      </p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{v.meaning}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Problems */}
          {data.problems.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3 w-3 text-primary/60" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Related Topics</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.problems.map((p, i) => (
                  <Link
                    key={i}
                    to={`/problems/${p.slug}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 text-[11px] font-medium text-foreground/70 hover:text-primary transition-all"
                  >
                    {p.icon && <span className="text-xs">{p.icon}</span>}
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reading Plans */}
          {data.readingPlans.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3 w-3 text-primary/60" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested Plans</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.readingPlans.map((p, i) => (
                  <Link
                    key={i}
                    to={`/reading-plans/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 text-[11px] font-medium text-foreground/70 hover:text-amber-700 dark:hover:text-amber-400 transition-all"
                  >
                    <span className="text-xs">{p.icon}</span>
                    {p.title} ({p.days}d)
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Explore Chapters */}
          {data.chapters.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.chapters.slice(0, 3).map((ch, i) => (
                <Link
                  key={i}
                  to={`/chapters/${ch.number}`}
                  className="text-[10px] text-primary/60 hover:text-primary underline underline-offset-2 decoration-primary/20 hover:decoration-primary/40 transition-all"
                >
                  📖 Explore Chapter {ch.number}: {ch.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
