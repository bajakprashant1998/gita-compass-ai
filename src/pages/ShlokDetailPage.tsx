import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getShlok } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Bookmark, 
  Share2, 
  BookOpen,
  Lightbulb,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import { toast } from 'sonner';

export default function ShlokDetailPage() {
  const { shlokId } = useParams<{ shlokId: string }>();
  const { user } = useAuth();

  const { data: shlok, isLoading } = useQuery({
    queryKey: ['shlok', shlokId],
    queryFn: () => getShlok(shlokId!),
    enabled: !!shlokId,
  });

  const { data: isFavorite } = useIsFavorite(user?.id, shlokId || '');
  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    
    try {
      await toggleFavorite.mutateAsync({
        userId: user.id,
        shlokId: shlokId!,
        isFavorite: isFavorite || false,
      });
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Bhagavad Gita - Chapter ${shlok?.chapter?.chapter_number}, Verse ${shlok?.verse_number}`,
        text: shlok?.english_meaning,
        url: window.location.href,
      });
    } catch {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="h-96 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!shlok) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Verse not found</h1>
          <Link to="/chapters">
            <Button>Browse Chapters</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <div className="max-w-3xl mx-auto mb-8">
          <Link to={`/chapters/${shlok.chapter?.chapter_number}`}>
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Chapter {shlok.chapter?.chapter_number}
            </Button>
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Chapter {shlok.chapter?.chapter_number}, Verse {shlok.verse_number}
            </Badge>
            <h1 className="text-2xl font-bold mb-2">{shlok.chapter?.title_english}</h1>
          </div>

          {/* Sanskrit Verse */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-4" />
                <blockquote className="text-xl md:text-2xl font-medium sanskrit leading-relaxed mb-4">
                  {shlok.sanskrit_text}
                </blockquote>
                {shlok.transliteration && (
                  <p className="text-muted-foreground italic">
                    {shlok.transliteration}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meanings */}
          <div className="space-y-4 mb-6">
            {/* English Meaning */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-lg">🇬🇧</span> English Meaning
                </h3>
                <p className="text-lg leading-relaxed">
                  {shlok.english_meaning}
                </p>
              </CardContent>
            </Card>

            {/* Hindi Meaning */}
            {shlok.hindi_meaning && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="text-lg">🇮🇳</span> हिंदी अर्थ
                  </h3>
                  <p className="text-lg leading-relaxed sanskrit">
                    {shlok.hindi_meaning}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Life Application */}
          {shlok.life_application && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Life Application
                </h3>
                <p className="text-lg leading-relaxed">
                  {shlok.life_application}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Practical Action */}
          {shlok.practical_action && (
            <Card className="mb-8 border-green-500/20 bg-green-500/5">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Today's Action
                </h3>
                <p className="text-lg leading-relaxed">
                  {shlok.practical_action}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isFavorite ? "default" : "outline"}
              className="gap-2"
              onClick={handleToggleFavorite}
              disabled={toggleFavorite.isPending}
            >
              <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
