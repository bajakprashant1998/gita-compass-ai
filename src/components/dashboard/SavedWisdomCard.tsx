import { Link } from 'react-router-dom';
import { Bookmark, ChevronRight } from 'lucide-react';
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
            <Bookmark className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Saved Wisdom</h2>
          </div>
          {favorites.length > 0 && (
            <Badge variant="secondary">{favorites.length}</Badge>
          )}
        </div>

        {favorites.length > 0 ? (
          <div className="space-y-2">
            {favorites.slice(0, 4).map((fav) => (
              <Link
                key={fav.id}
                to={`/chapters/${fav.shlok?.chapter?.chapter_number}/verse/${fav.shlok?.verse_number}`}
              >
                <div className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="mb-1 text-xs">
                        Ch {fav.shlok?.chapter?.chapter_number}, V {fav.shlok?.verse_number}
                      </Badge>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {fav.shlok?.english_meaning}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Bookmark className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No saved verses yet</p>
            <Link to="/chapters">
              <Button variant="outline" size="sm">Explore Chapters</Button>
            </Link>
          </div>
        )}
      </div>
    </GradientBorderCard>
  );
}
