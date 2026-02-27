import { useQuery } from '@tanstack/react-query';
import { getDailyVerse } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, ArrowRight, BookOpen, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShareButtons } from '@/components/ui/share-buttons';

export function DailyWisdom() {
  const { data: shlok, isLoading } = useQuery({
    queryKey: ['daily-verse', new Date().toISOString().slice(0, 10)],
    queryFn: getDailyVerse,
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="h-80 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </section>
    );
  }

  if (!shlok) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Sparkles className="h-4 w-4" />
            Verse of the Day
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Today's Wisdom</h2>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />{today}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-amber-500/5 to-orange-500/8" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
            {/* ॐ watermark */}
            <div className="absolute right-8 top-8 text-8xl text-primary/[0.06] font-bold select-none pointer-events-none" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ॐ</div>

            <div className="relative border-2 border-primary/20 rounded-3xl p-8 md:p-12 bg-card/80 backdrop-blur-sm">
              {/* Chapter badge */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                  <BookOpen className="h-3.5 w-3.5" />
                  Chapter {shlok.chapter?.chapter_number}, Verse {shlok.verse_number}
                </span>
              </div>

              {/* Sanskrit text */}
              <blockquote className="text-xl md:text-2xl font-medium text-center mb-8 sanskrit leading-relaxed text-foreground/90">
                "{shlok.sanskrit_text}"
              </blockquote>

              {/* Divider */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/30" />
                <Sparkles className="h-4 w-4 text-primary/40" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/30" />
              </div>

              {/* English meaning */}
              <p className="text-base md:text-lg text-center text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                {shlok.english_meaning}
              </p>

              {/* Life application */}
              {shlok.life_application && (
                <div className="bg-gradient-to-r from-primary/5 to-amber-500/5 rounded-2xl p-5 sm:p-6 mb-8 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-1">Life Application</h4>
                      <p className="text-foreground leading-relaxed">{shlok.life_application}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to={`/chapters/${shlok.chapter?.chapter_number}/verse/${shlok.verse_number}`}>
                  <Button className="gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 border-0 shadow-lg">
                    Explore This Verse
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <ShareButtons
                  title={`Bhagavad Gita - Chapter ${shlok.chapter?.chapter_number}, Verse ${shlok.verse_number}`}
                  text={shlok.life_application || shlok.english_meaning}
                  url={`https://www.bhagavadgitagyan.com/chapters/${shlok.chapter?.chapter_number}/verse/${shlok.verse_number}`}
                />
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      navigator.share({
                        title: `Bhagavad Gita - Chapter ${shlok.chapter?.chapter_number}, Verse ${shlok.verse_number}`,
                        text: `"${shlok.english_meaning}"\n\n💡 ${shlok.life_application || ''}\n\n— Bhagavad Gita`,
                        url: `https://www.bhagavadgitagyan.com/chapters/${shlok.chapter?.chapter_number}/verse/${shlok.verse_number}`,
                      }).catch(() => {});
                    }}
                  >
                    <Share2 className="h-4 w-4" /> Share as Story
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
