import { useQuery } from '@tanstack/react-query';
import { getDailyVerse } from '@/lib/api';
import { BookOpen } from 'lucide-react';

export default function EmbedVersePage() {
  const { data: shlok, isLoading } = useQuery({
    queryKey: ['daily-verse', new Date().toISOString().slice(0, 10)],
    queryFn: getDailyVerse,
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[280px] bg-background p-4">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!shlok) {
    return (
      <div className="flex items-center justify-center min-h-[280px] bg-background p-4">
        <p className="text-muted-foreground text-sm">Unable to load verse</p>
      </div>
    );
  }

  const chapterNumber = (shlok as any).chapters?.chapter_number;

  return (
    <div className="bg-background text-foreground p-5 max-w-md mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-xs font-bold text-primary uppercase tracking-wide">Verse of the Day</span>
      </div>

      {/* Sanskrit */}
      <blockquote className="text-base font-semibold leading-relaxed mb-3 whitespace-pre-line" lang="sa">
        {shlok.sanskrit_text.split('\n').slice(0, 2).join('\n')}
      </blockquote>

      {/* Meaning */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
        {shlok.english_meaning}
      </p>

      {/* Reference */}
      {chapterNumber && (
        <p className="text-xs text-muted-foreground/70 mb-4">
          — Chapter {chapterNumber}, Verse {shlok.verse_number}
        </p>
      )}

      {/* Powered by */}
      <div className="border-t border-border pt-3">
        <a
          href="https://www.bhagavadgitagyan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-primary hover:underline font-medium"
        >
          Powered by Bhagavad Gita Gyan →
        </a>
      </div>
    </div>
  );
}
