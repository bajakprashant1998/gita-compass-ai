import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send } from 'lucide-react';
import { useReflections } from '@/hooks/useReflections';
import { ReflectionCard } from './ReflectionCard';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface CommunityReflectionsProps {
  shlokId: string;
}

export function CommunityReflections({ shlokId }: CommunityReflectionsProps) {
  const { user } = useAuth();
  const { reflections, isLoading, addReflection, toggleLike, deleteReflection } = useReflections(shlokId);
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (content.length > 500) {
      toast.error('Reflection must be under 500 characters');
      return;
    }
    try {
      await addReflection.mutateAsync(content.trim());
      setContent('');
      toast.success('Reflection shared! 🙏');
    } catch {
      toast.error('Failed to share reflection');
    }
  };

  return (
    <Card className="mb-8 border-0 shadow-lg animate-fade-in overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" />
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Community Reflections</h3>
            <p className="text-xs text-muted-foreground">
              {reflections.length} reflection{reflections.length !== 1 ? 's' : ''} shared
            </p>
          </div>
        </div>

        {/* Input form */}
        {user ? (
          <div className="mb-6">
            <Textarea
              placeholder="Share your reflection on this verse... (max 500 chars)"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              className="min-h-[80px] resize-none mb-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{content.length}/500</span>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || addReflection.isPending}
                className="gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                Share
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground mb-2">Sign in to share your reflection</p>
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </div>
        )}

        {/* Reflections list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : reflections.length > 0 ? (
          <div className="space-y-3">
            {reflections.map(reflection => (
              <ReflectionCard
                key={reflection.id}
                reflection={reflection}
                isOwn={user?.id === reflection.user_id}
                onLike={() => {
                  if (!user) {
                    toast.error('Sign in to like reflections');
                    return;
                  }
                  toggleLike.mutate(reflection.id);
                }}
                onDelete={() => deleteReflection.mutate(reflection.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Be the first to share a reflection on this verse</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
