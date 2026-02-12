import { Heart, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Reflection } from '@/hooks/useReflections';
import { formatDistanceToNow } from 'date-fns';

interface ReflectionCardProps {
  reflection: Reflection;
  isOwn: boolean;
  onLike: () => void;
  onDelete: () => void;
}

export function ReflectionCard({ reflection, isOwn, onLike, onDelete }: ReflectionCardProps) {
  const displayName = reflection.profile?.display_name || 'Anonymous';
  const initials = displayName.slice(0, 2).toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(reflection.created_at), { addSuffix: true });

  return (
    <div className="p-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={reflection.profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{displayName}</span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
            {reflection.content}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={`gap-1.5 h-7 px-2 text-xs ${
                reflection.is_liked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${reflection.is_liked ? 'fill-current' : ''}`} />
              {reflection.likes_count > 0 && reflection.likes_count}
            </Button>
            {isOwn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="gap-1.5 h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
