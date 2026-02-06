import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
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
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Reading Progress</h2>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Chapters Explored</span>
              <span className="font-semibold">{chaptersExplored} / {totalChapters}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <span className="text-sm text-muted-foreground">Total Verses Read</span>
            <span className="font-bold text-lg">{versesRead}</span>
          </div>

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
