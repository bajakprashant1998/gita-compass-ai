import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark, MessageCircle, Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import { toast } from 'sonner';

interface ShlokActionsProps {
  shlokId: string;
}

export function ShlokActions({ shlokId }: ShlokActionsProps) {
  const { user } = useAuth();
  const { data: isFavorite } = useIsFavorite(user?.id, shlokId);
  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    
    try {
      await toggleFavorite.mutateAsync({
        userId: user.id,
        shlokId: shlokId,
        isFavorite: isFavorite || false,
      });
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bhagavad Gita Wisdom',
          text: 'Check out this verse from the Bhagavad Gita',
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <Card className="mb-20 border-0 shadow-lg bg-gradient-to-r from-muted/50 to-muted/30 animate-fade-in animation-delay-400">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Favorite Button */}
          <Button
            variant={isFavorite ? "default" : "outline"}
            size="lg"
            className={`gap-3 min-w-[160px] transition-all duration-300 ${
              isFavorite 
                ? 'bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 border-0 text-white' 
                : 'hover:border-primary hover:text-primary'
            }`}
            onClick={handleToggleFavorite}
            disabled={toggleFavorite.isPending}
          >
            {isFavorite ? (
              <Heart className="h-5 w-5 fill-current" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
            {isFavorite ? 'Saved!' : 'Save to Favorites'}
          </Button>

          {/* AI Coach Button */}
          <Link to="/chat">
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-3 min-w-[160px] hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <MessageCircle className="h-5 w-5" />
              Ask AI Coach
            </Button>
          </Link>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="lg"
            className="gap-3 min-w-[120px]"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
