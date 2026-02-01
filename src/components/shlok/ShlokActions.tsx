import { Button } from '@/components/ui/button';
import { Bookmark, MessageCircle } from 'lucide-react';
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

  return (
    <div className="flex items-center justify-center gap-4 py-6 border-t">
      <Button
        variant={isFavorite ? "default" : "outline"}
        className="gap-2"
        onClick={handleToggleFavorite}
        disabled={toggleFavorite.isPending}
      >
        <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        {isFavorite ? 'Saved' : 'Save to Favorites'}
      </Button>
      <Link to="/chat">
        <Button variant="outline" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Ask AI Coach
        </Button>
      </Link>
    </div>
  );
}
