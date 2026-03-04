import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GradientBorderCard } from '@/components/ui/decorative-elements';

interface ReadingProgressCardProps {
  chaptersExplored: number;
  versesRead: number;
}

export function ReadingProgressCard({ chaptersExplored, versesRead }: ReadingProgressCardProps) {
  const totalChapters = 18;
  const totalVerses = 700;
  const chapterPercent = Math.round((chaptersExplored / totalChapters) * 100);
  const versePercent = Math.min(Math.round((versesRead / totalVerses) * 100), 100);

  const getMilestone = () => {
    if (chaptersExplored >= 18) return { text: '🎉 All chapters explored! You are a true seeker.', color: 'text-primary' };
    if (chaptersExplored >= 12) return { text: '🌟 Over halfway! Keep going, wisdom awaits.', color: 'text-primary' };
    if (chaptersExplored >= 6) return { text: '📖 Great start! 6+ chapters explored.', color: 'text-primary' };
    if (chaptersExplored >= 1) return { text: '🌱 Your journey has begun!', color: 'text-muted-foreground' };
    return { text: '✨ Start exploring chapters to track progress', color: 'text-muted-foreground' };
  };

  const milestone = getMilestone();

  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-amber-500">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold">Reading Progress</h2>
        </div>

        <div className="space-y-5">
          {/* Circular progress + stats */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="2.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#progressGrad)"
                  strokeWidth="2.5"
                  strokeDasharray={`${chapterPercent}, 100`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold leading-none">{chapterPercent}%</span>
                <span className="text-[9px] text-muted-foreground">complete</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground font-medium">Chapters</span>
                  <span className="font-bold text-foreground">{chaptersExplored}/{totalChapters}</span>
                </div>
                <Progress value={chapterPercent} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground font-medium">Verses</span>
                  <span className="font-bold text-foreground">{versesRead}/{totalVerses}</span>
                </div>
                <Progress value={versePercent} className="h-2" />
              </div>
            </div>
          </div>

          {/* Milestone */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Trophy className="h-4 w-4 text-primary shrink-0" />
            <span className={`text-xs ${milestone.color}`}>{milestone.text}</span>
          </div>

          {/* Chapter grid mini-map */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Chapter Map</p>
            <div className="grid grid-cols-9 gap-1">
              {Array.from({ length: 18 }, (_, i) => i + 1).map(num => {
                // We don't have exact chapter IDs here, so show explored count visually
                const isExplored = num <= chaptersExplored;
                return (
                  <Link key={num} to={`/chapters/${num}`}>
                    <div
                      className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 cursor-pointer ${
                        isExplored
                          ? 'bg-gradient-to-br from-primary to-amber-500 text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {num}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <Link to="/chapters">
            <Button className="w-full gap-2 touch-target bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-md shadow-primary/15" size="lg">
              Continue Reading
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </GradientBorderCard>
  );
}
