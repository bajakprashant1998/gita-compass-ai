import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getChapter } from '@/lib/api';
import { cn } from '@/lib/utils';

interface VerseNavigationProps {
  chapterNumber: number;
  verseNumber: number;
}

export function VerseNavigation({ chapterNumber, verseNumber }: VerseNavigationProps) {
  const { data: chapter } = useQuery({
    queryKey: ['chapter', chapterNumber],
    queryFn: () => getChapter(chapterNumber),
    enabled: !!chapterNumber,
  });

  const totalVerses = chapter?.verse_count || 47;
  const hasPrev = verseNumber > 1 || chapterNumber > 1;
  const hasNext = verseNumber < totalVerses || chapterNumber < 18;

  const getPrevLink = () => {
    if (verseNumber > 1) {
      return `/chapters/${chapterNumber}/verse/${verseNumber - 1}`;
    }
    if (chapterNumber > 1) {
      return `/chapters/${chapterNumber - 1}`;
    }
    return null;
  };

  const getNextLink = () => {
    if (verseNumber < totalVerses) {
      return `/chapters/${chapterNumber}/verse/${verseNumber + 1}`;
    }
    if (chapterNumber < 18) {
      return `/chapters/${chapterNumber + 1}/verse/1`;
    }
    return null;
  };

  const prevLink = getPrevLink();
  const nextLink = getNextLink();
  const progress = Math.round((verseNumber / totalVerses) * 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-fade-in">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div 
          className="h-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="glass border-t border-border/50 pb-safe">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-16 max-w-4xl mx-auto gap-2">
            {/* Previous */}
            <div className="flex-1 flex justify-start">
              {prevLink && hasPrev ? (
                <Link to={prevLink}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "gap-1.5 sm:gap-2 group rounded-xl h-11 px-3 sm:px-4",
                      "hover:bg-primary/10 hover:text-primary transition-all"
                    )}
                  >
                    <div className="p-1 rounded-lg bg-muted group-hover:bg-primary/20 transition-colors">
                      <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-muted-foreground hidden sm:block">Previous</span>
                      <span className="text-xs sm:text-sm font-medium">
                        {verseNumber > 1 ? `Verse ${verseNumber - 1}` : `Ch. ${chapterNumber - 1}`}
                      </span>
                    </div>
                  </Button>
                </Link>
              ) : (
                <div className="w-20" />
              )}
            </div>

            {/* Center navigation */}
            <div className="flex items-center gap-1 sm:gap-2 bg-muted/50 rounded-xl p-1">
              <Link to="/chapters">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-lg hover:bg-background hover:text-primary"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <Link to={`/chapters/${chapterNumber}`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1.5 sm:gap-2 h-10 rounded-lg hover:bg-background hover:text-primary px-2 sm:px-3"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">
                    <span className="hidden sm:inline">Chapter </span>{chapterNumber}
                  </span>
                </Button>
              </Link>
            </div>

            {/* Next */}
            <div className="flex-1 flex justify-end">
              {nextLink && hasNext ? (
                <Link to={nextLink}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "gap-1.5 sm:gap-2 group rounded-xl h-11 px-3 sm:px-4",
                      "hover:bg-primary/10 hover:text-primary transition-all"
                    )}
                  >
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-muted-foreground hidden sm:block">Next</span>
                      <span className="text-xs sm:text-sm font-medium">
                        {verseNumber < totalVerses ? `Verse ${verseNumber + 1}` : `Ch. ${chapterNumber + 1}`}
                      </span>
                    </div>
                    <div className="p-1 rounded-lg bg-muted group-hover:bg-primary/20 transition-colors">
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Button>
                </Link>
              ) : (
                <div className="w-20" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
