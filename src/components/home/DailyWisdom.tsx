import { useQuery } from '@tanstack/react-query';
import { getDailyVerse } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShareButtons } from '@/components/ui/share-buttons';

export function DailyWisdom() {
  const { data: shlok, isLoading } = useQuery({
    queryKey: ['daily-verse', new Date().toISOString().slice(0, 10)],
    queryFn: getDailyVerse,
    staleTime: 60 * 60 * 1000, // 1 hour
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
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Verse of the Day
          </div>
          <h2 className="text-3xl font-bold mb-2">Today's Wisdom</h2>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            {today}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-2 border-primary/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
            
            <CardContent className="p-8 md:p-12 relative">
              <span className="text-sm font-medium text-primary">
                Chapter {shlok.chapter?.chapter_number}, Verse {shlok.verse_number}
              </span>

              <blockquote className="text-xl md:text-2xl font-medium text-center my-8 sanskrit leading-relaxed">
                "{shlok.sanskrit_text}"
              </blockquote>

              <p className="text-lg text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                {shlok.english_meaning}
              </p>

              {shlok.life_application && (
                <div className="bg-muted/50 rounded-xl p-6 mb-8">
                  <h4 className="font-semibold mb-2">💡 Life Application</h4>
                  <p className="text-muted-foreground">{shlok.life_application}</p>
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                <Link to={`/chapters/${shlok.chapter?.chapter_number}/verse/${shlok.verse_number}`}>
                  <Button variant="default" className="gap-2">
                    Explore This Verse
                  </Button>
                </Link>
                <ShareButtons
                  title={`Bhagavad Gita - Chapter ${shlok.chapter?.chapter_number}, Verse ${shlok.verse_number}`}
                  text={shlok.life_application || shlok.english_meaning}
                  url={`https://www.bhagavadgitagyan.com/chapters/${shlok.chapter?.chapter_number}/verse/${shlok.verse_number}`}
                />
                {/* Native Web Share for mobile */}
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
                    📤 Share as Story
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
