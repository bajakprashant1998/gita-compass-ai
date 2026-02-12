import { CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface DayProgressProps {
  day: {
    day_number: number;
    shlok_id: string;
    reflection_prompt: string | null;
    shlok?: {
      verse_number: number;
      english_meaning: string;
      chapter?: { chapter_number: number; title_english: string };
    };
  };
  isCompleted: boolean;
  isCurrent: boolean;
}

export function DayProgress({ day, isCompleted, isCurrent }: DayProgressProps) {
  const chapterNum = day.shlok?.chapter?.chapter_number;
  const verseNum = day.shlok?.verse_number;
  const verseLink = chapterNum && verseNum ? `/chapters/${chapterNum}/verse/${verseNum}` : '#';

  return (
    <Card className={`overflow-hidden transition-all ${
      isCurrent ? 'border-primary shadow-lg ring-2 ring-primary/20' : 
      isCompleted ? 'border-green-200 dark:border-green-800' : 'border-border/50 opacity-75'
    }`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : isCurrent ? (
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {day.day_number}
              </div>
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground/40" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">Day {day.day_number}</span>
              {isCurrent && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  Today
                </span>
              )}
            </div>
            {day.shlok && (
              <Link to={verseLink} className="group">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium text-primary group-hover:underline">
                    Chapter {chapterNum}, Verse {verseNum}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {day.shlok.english_meaning}
                </p>
              </Link>
            )}
            {day.reflection_prompt && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-0.5">Reflect</p>
                <p className="text-sm text-foreground/80 italic">{day.reflection_prompt}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
