import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getChapter } from '@/lib/api';

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 max-w-4xl mx-auto">
          {/* Previous */}
          <div className="flex-1 flex justify-start">
            {prevLink && hasPrev && (
              <Link to={prevLink}>
                <Button variant="ghost" size="sm" className="gap-2 group">
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span className="hidden sm:inline">
                    {verseNumber > 1 ? `Verse ${verseNumber - 1}` : `Chapter ${chapterNumber - 1}`}
                  </span>
                  <span className="sm:hidden">Prev</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Center navigation */}
          <div className="flex items-center gap-2">
            <Link to="/chapters">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={`/chapters/${chapterNumber}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Chapter {chapterNumber}</span>
              </Button>
            </Link>
          </div>

          {/* Next */}
          <div className="flex-1 flex justify-end">
            {nextLink && hasNext && (
              <Link to={nextLink}>
                <Button variant="ghost" size="sm" className="gap-2 group">
                  <span className="hidden sm:inline">
                    {verseNumber < totalVerses ? `Verse ${verseNumber + 1}` : `Chapter ${chapterNumber + 1}`}
                  </span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
