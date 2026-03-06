import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, ArrowRight, Tag } from 'lucide-react';

interface RelatedContentLinksProps {
  currentChapter: number;
  currentVerse: number;
  problemIds?: string[];
  maxLinks?: number;
}

/**
 * Internal linking engine — shows related verses, chapters & problems
 * to build topic clusters for Google authority signals.
 */
export function RelatedContentLinks({ currentChapter, currentVerse, problemIds = [], maxLinks = 6 }: RelatedContentLinksProps) {
  // Fetch related verses from same problems
  const { data: relatedVerses } = useQuery({
    queryKey: ['related-verses', problemIds],
    queryFn: async () => {
      if (problemIds.length === 0) return [];
      const { data } = await supabase
        .from('shlok_problems')
        .select('shlok_id, shloks!inner(verse_number, english_meaning, chapters!inner(chapter_number))')
        .in('problem_id', problemIds)
        .limit(20);
      
      // Filter out current verse and deduplicate
      const seen = new Set<string>();
      return (data || [])
        .filter((item: any) => {
          const ch = item.shloks?.chapters?.chapter_number;
          const v = item.shloks?.verse_number;
          if (ch === currentChapter && v === currentVerse) return false;
          const key = `${ch}-${v}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, maxLinks)
        .map((item: any) => ({
          chapter: item.shloks?.chapters?.chapter_number,
          verse: item.shloks?.verse_number,
          meaning: item.shloks?.english_meaning?.slice(0, 80),
        }));
    },
    enabled: problemIds.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch related problems
  const { data: relatedProblems } = useQuery({
    queryKey: ['related-problems', problemIds],
    queryFn: async () => {
      if (problemIds.length === 0) return [];
      const { data } = await supabase
        .from('problems')
        .select('name, slug, icon')
        .in('id', problemIds)
        .limit(4);
      return data || [];
    },
    enabled: problemIds.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  // Adjacent chapters
  const prevChapter = currentChapter > 1 ? currentChapter - 1 : null;
  const nextChapter = currentChapter < 18 ? currentChapter + 1 : null;

  if (!relatedVerses?.length && !relatedProblems?.length) return null;

  return (
    <nav aria-label="Related content" className="mt-8 space-y-6">
      {/* Related Verses */}
      {relatedVerses && relatedVerses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Related Verses
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {relatedVerses.map((v: any) => (
              <Link
                key={`${v.chapter}-${v.verse}`}
                to={`/chapters/${v.chapter}/verse/${v.verse}`}
                className="group flex items-start gap-2 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                  {v.chapter}.{v.verse}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                  {v.meaning}...
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Problems */}
      {relatedProblems && relatedProblems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Related Life Challenges
          </h3>
          <div className="flex flex-wrap gap-2">
            {relatedProblems.map((p: any) => (
              <Link
                key={p.slug}
                to={`/problems/${p.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <span>{p.icon}</span>
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Chapter navigation */}
      <div className="flex gap-2">
        {prevChapter && (
          <Link
            to={`/chapters/${prevChapter}`}
            className="flex-1 flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-xs text-muted-foreground hover:text-foreground"
          >
            ← Chapter {prevChapter}
          </Link>
        )}
        {nextChapter && (
          <Link
            to={`/chapters/${nextChapter}`}
            className="flex-1 flex items-center justify-end gap-2 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-xs text-muted-foreground hover:text-foreground"
          >
            Chapter {nextChapter} →
          </Link>
        )}
      </div>
    </nav>
  );
}
