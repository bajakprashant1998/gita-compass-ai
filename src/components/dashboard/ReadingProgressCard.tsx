import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GradientBorderCard } from '@/components/ui/decorative-elements';

interface ReadingProgressCardProps {
  chaptersExplored: number;
  versesRead: number;
}

export function ReadingProgressCard({ chaptersExplored, versesRead }: ReadingProgressCardProps) {
  const totalChapters = 18;
  const progressPercent = Math.round((chaptersExplored / totalChapters) * 100);

  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Reading Progress</h2>
        </div>

        <div className="space-y-5">
          {/* Circular-style progress display */}
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="3"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{progressPercent}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Chapters</span>
                  <span className="font-semibold">{chaptersExplored}/{totalChapters}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Verses Read</span>
                <span className="font-semibold">{versesRead}</span>
              </div>
            </div>
          </div>

          {/* Milestone badge */}
          {chaptersExplored > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                {chaptersExplored >= 18
                  ? '🎉 All chapters explored!'
                  : `${18 - chaptersExplored} chapters remaining`}
              </span>
            </div>
          )}

          <Link to="/chapters">
            <Button className="w-full gap-2 touch-target" variant="outline">
              Continue Reading
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </GradientBorderCard>
  );
}
