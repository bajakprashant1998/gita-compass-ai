import { useState } from 'react';
import { useDiscussions, useCreateDiscussion } from '@/hooks/useDiscussions';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Reply, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface DiscussionThreadsProps {
  shlokId: string;
}

export function DiscussionThreads({ shlokId }: DiscussionThreadsProps) {
  const { user } = useAuth();
  const { data: discussions, isLoading } = useDiscussions(shlokId);
  const createDiscussion = useCreateDiscussion();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = () => {
    if (!user || !newComment.trim()) return;
    createDiscussion.mutate({
      shlokId,
      content: newComment.trim(),
      userId: user.id,
    }, {
      onSuccess: () => {
        setNewComment('');
        toast.success('Comment posted!');
      },
    });
  };

  const handleReply = (parentId: string) => {
    if (!user || !replyContent.trim()) return;
    createDiscussion.mutate({
      shlokId,
      content: replyContent.trim(),
      parentId,
      userId: user.id,
    }, {
      onSuccess: () => {
        setReplyTo(null);
        setReplyContent('');
        toast.success('Reply posted!');
      },
    });
  };

  return (
    <Card className="mb-8 border-0 shadow-lg animate-fade-in">
      <div className="h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500" />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Discussion</h3>
            <p className="text-xs text-muted-foreground">
              {discussions?.length || 0} comments
            </p>
          </div>
        </div>

        {/* New Comment */}
        {user ? (
          <div className="mb-6">
            <Textarea
              placeholder="Share your thoughts on this verse..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="mb-2 min-h-[80px]"
            />
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || createDiscussion.isPending}
              size="sm"
              className="gap-1"
            >
              <Send className="h-4 w-4" /> Post
            </Button>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-lg bg-muted/50 text-center">
            <Link to="/auth" className="text-primary hover:underline text-sm">
              Sign in to join the discussion
            </Link>
          </div>
        )}

        {/* Threads */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : discussions && discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map(d => (
              <div key={d.id} className="border-l-2 border-border pl-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {(d.profile?.display_name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{d.profile?.display_name || 'Anonymous'}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-2">{d.content}</p>
                    {user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs gap-1 text-muted-foreground"
                        onClick={() => setReplyTo(replyTo === d.id ? null : d.id)}
                      >
                        <Reply className="h-3 w-3" /> Reply
                      </Button>
                    )}

                    {/* Reply form */}
                    {replyTo === d.id && (
                      <div className="mt-2 flex gap-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={e => setReplyContent(e.target.value)}
                          className="min-h-[60px] text-sm"
                        />
                        <Button
                          onClick={() => handleReply(d.id)}
                          disabled={!replyContent.trim()}
                          size="icon"
                          className="shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Replies */}
                    {d.replies && d.replies.length > 0 && (
                      <div className="mt-3 space-y-3 pl-4 border-l border-border/50">
                        {d.replies.map(reply => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-accent text-accent-foreground">
                                {(reply.profile?.display_name || 'U')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-medium">{reply.profile?.display_name || 'Anonymous'}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-xs text-foreground">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
