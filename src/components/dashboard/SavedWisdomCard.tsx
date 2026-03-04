import { Link } from 'react-router-dom';
import { Bookmark, ChevronRight, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GradientBorderCard } from '@/components/ui/decorative-elements';
import type { Favorite } from '@/types';

interface SavedWisdomCardProps {
  favorites: Favorite[];
}

export function SavedWisdomCard({ favorites }: SavedWisdomCardProps) {
  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
              <Bookmark className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-bold">Saved Wisdom</h2>
          </div>
          {favorites.length > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">{favorites.length}</Badge>
          )}
        </div>

        {favorites.length > 0 ? (
          <div className="space-y-2">
            {favorites.slice(0, 4).map((fav, i) => (
              <Link
                key={fav.id}
                to={`/chapters/${fav.shlok?.chapter?.chapter_number}/verse/${fav.shlok?.verse_number}`}
              >
                <div className="p-3 rounded-xl bg-muted/50 hover:bg-primary/5 transition-all cursor-pointer group animate-fade-in border border-transparent hover:border-primary/10"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20 text-primary">
                          Ch {fav.shlok?.chapter?.chapter_number} · V {fav.shlok?.verse_number}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors">
                        {fav.shlok?.english_meaning}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-0.5 shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
            {favorites.length > 4 && (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="w-full mt-1 text-primary hover:bg-primary/5">
                  View All {favorites.length} Saved Verses <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Heart className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground mb-1 font-medium">No saved verses yet</p>
            <p className="text-xs text-muted-foreground/70 mb-4">Bookmark verses while reading to find them here</p>
            <Link to="/chapters">
              <Button variant="outline" size="sm" className="gap-2">
                <Bookmark className="h-3.5 w-3.5" />
                Explore Chapters
              </Button>
            </Link>
          </div>
        )}
      </div>
    </GradientBorderCard>
  );
}
