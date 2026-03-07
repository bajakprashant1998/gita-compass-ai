import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { GradientBorderCard } from '@/components/ui/decorative-elements';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useVerseRecommendations, VerseRecommendation } from '@/hooks/useVerseRecommendations';

interface RecommendedVersesProps {
  userId: string;
}

export function RecommendedVerses({ userId }: RecommendedVersesProps) {
  const { data: recommendations, isLoading, isError } = useVerseRecommendations(userId);

  if (isError || (!isLoading && (!recommendations || recommendations.length === 0))) return null;

  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Recommended for You</h2>
          <Badge variant="secondary" className="text-[10px] ml-auto">AI</Badge>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations?.map((rec: VerseRecommendation) => (
              <Link
                key={rec.shlok_id}
                to={`/chapters/${rec.chapter}/verse/${rec.verse}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                  {rec.chapter}.{rec.verse}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Chapter {rec.chapter}, Verse {rec.verse}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{rec.reason}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </GradientBorderCard>
  );
}
