import { useQuery } from '@tanstack/react-query';
import { getRandomShlok } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ShareButtons } from '@/components/ui/share-buttons';

export function DailyWisdom() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: shlok, isLoading, refetch } = useQuery({
    queryKey: ['daily-wisdom', refreshKey],
    queryFn: getRandomShlok,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

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

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Daily Wisdom</h2>
          <p className="text-muted-foreground">
            A verse to reflect on today
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-2 border-primary/20">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
            
            <CardContent className="p-8 md:p-12 relative">
              {/* Chapter reference */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-primary">
                  Chapter {shlok.chapter?.chapter_number}, Verse {shlok.verse_number}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  className="hover:bg-primary/10"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Sanskrit verse */}
              <blockquote className="text-xl md:text-2xl font-medium text-center mb-8 sanskrit leading-relaxed">
                "{shlok.sanskrit_text}"
              </blockquote>

              {/* English meaning */}
              <p className="text-lg text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                {shlok.english_meaning}
              </p>

              {/* Life application */}
              {shlok.life_application && (
                <div className="bg-muted/50 rounded-xl p-6 mb-8">
                  <h4 className="font-semibold mb-2">💡 Life Application</h4>
                  <p className="text-muted-foreground">{shlok.life_application}</p>
                </div>
              )}

              {/* Actions */}
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
