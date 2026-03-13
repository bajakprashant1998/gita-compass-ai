import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home, BookOpen, Grid3X3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getChapter } from '@/lib/api';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface VerseNavigationProps {
  chapterNumber: number;
  verseNumber: number;
}

export function VerseNavigation({ chapterNumber, verseNumber }: VerseNavigationProps) {
  const [showVerseGrid, setShowVerseGrid] = useState(false);

  const { data: chapter } = useQuery({
    queryKey: ['chapter', chapterNumber],
    queryFn: () => getChapter(chapterNumber),
    enabled: !!chapterNumber,
  });

  const totalVerses = chapter?.verse_count || 47;
  const hasPrev = verseNumber > 1 || chapterNumber > 1;
  const hasNext = verseNumber < totalVerses || chapterNumber < 18;

  const getPrevLink = () => {
    if (verseNumber > 1) return `/chapters/${chapterNumber}/verse/${verseNumber - 1}`;
    if (chapterNumber > 1) return `/chapters/${chapterNumber - 1}`;
    return null;
  };

  const getNextLink = () => {
    if (verseNumber < totalVerses) return `/chapters/${chapterNumber}/verse/${verseNumber + 1}`;
    if (chapterNumber < 18) return `/chapters/${chapterNumber + 1}/verse/1`;
    return null;
  };

  const prevLink = getPrevLink();
  const nextLink = getNextLink();
  const progress = Math.round((verseNumber / totalVerses) * 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Verse grid quick jump */}
      <AnimatePresence>
        {showVerseGrid && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowVerseGrid(false)}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[340px] max-h-[50vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-4 z-50"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground">Jump to Verse</p>
                <p className="text-xs text-muted-foreground">Ch {chapterNumber} • {totalVerses} verses</p>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {Array.from({ length: totalVerses }, (_, i) => i + 1).map(v => (
                  <Link
                    key={v}
                    to={`/chapters/${chapterNumber}/verse/${v}`}
                    onClick={() => setShowVerseGrid(false)}
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-150 ${
                      v === verseNumber
                        ? 'bg-primary text-primary-foreground shadow-md scale-110'
                        : v < verseNumber
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {v}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="h-1 bg-muted/50">
        <div 
          className="h-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="bg-background/95 backdrop-blur-md border-t border-border">
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-14 max-w-2xl mx-auto">
            {/* Previous Button */}
            <div className="flex-1">
              {prevLink && hasPrev ? (
                <Link to={prevLink}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 h-10 px-3 rounded-lg hover:bg-primary/10 hover:text-primary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {verseNumber > 1 ? `Verse ${verseNumber - 1}` : `Ch ${chapterNumber - 1}`}
                    </span>
                  </Button>
                </Link>
              ) : (
                <div className="w-16" />
              )}
            </div>

            {/* Center - Chapter + Verse Grid */}
            <div className="flex items-center gap-1 bg-muted/60 rounded-full px-1 py-1">
              <Link to="/chapters">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-background"
                  title="All chapters"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              <div className="h-4 w-px bg-border/50" />
              <Link to={`/chapters/${chapterNumber}`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 h-8 px-2 rounded-full hover:bg-background text-xs font-medium"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Ch {chapterNumber}
                </Button>
              </Link>
              <div className="h-4 w-px bg-border/50" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-background"
                onClick={() => setShowVerseGrid(!showVerseGrid)}
                title="Jump to verse"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Next Button */}
            <div className="flex-1 flex justify-end">
              {nextLink && hasNext ? (
                <Link to={nextLink}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 h-10 px-3 rounded-lg hover:bg-primary/10 hover:text-primary"
                  >
                    <span className="text-sm font-medium">
                      {verseNumber < totalVerses ? `Verse ${verseNumber + 1}` : `Ch ${chapterNumber + 1}`}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div className="w-16" />
              )}
            </div>
          </div>
        </div>
        {/* Safe area padding for iOS */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>
    </div>
  );
}
