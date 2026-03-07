import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVerseRecommendations } from '@/hooks/useVerseRecommendations';

interface NextVerseRecommendationProps {
  userId: string;
}

export function NextVerseRecommendation({ userId }: NextVerseRecommendationProps) {
  const { data: recommendations, isLoading } = useVerseRecommendations(userId);

  if (isLoading || !recommendations?.length) return null;

  const rec = recommendations[0];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-amber-500/5">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold">Next Verse for You</span>
          <Badge variant="secondary" className="text-[10px]">AI</Badge>
        </div>
        <Link
          to={`/chapters/${rec.chapter}/verse/${rec.verse}`}
          className="flex items-center gap-3 p-3 rounded-xl bg-background/80 hover:bg-background transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {rec.chapter}.{rec.verse}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Chapter {rec.chapter}, Verse {rec.verse}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{rec.reason}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Link>
      </CardContent>
    </Card>
  );
}
