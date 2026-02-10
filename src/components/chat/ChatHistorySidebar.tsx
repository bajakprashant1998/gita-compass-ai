import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, Plus, Trash2, Clock, ChevronLeft, 
  ChevronRight, Search 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface ChatConversation {
  id: string;
  title: string | null;
  created_at: string | null;
  updated_at: string | null;
  preview?: string;
}

interface ChatHistorySidebarProps {
  userId: string | undefined;
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (conversationId: string, messages: Array<{ role: string; content: string }>) => void;
  onNewChat: () => void;
  activeConversationId?: string;
}

export function ChatHistorySidebar({
  userId,
  isOpen,
  onToggle,
  onSelectConversation,
  onNewChat,
  activeConversationId,
}: ChatHistorySidebarProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (userId && isOpen) {
      fetchConversations();
    }
  }, [userId, isOpen]);

  const fetchConversations = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id, title, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch first message preview for each conversation
      const conversationsWithPreview = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: msgs } = await supabase
            .from('chat_messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .eq('role', 'user')
            .order('created_at', { ascending: true })
            .limit(1);
          return {
            ...conv,
            preview: msgs?.[0]?.content?.slice(0, 80) || 'New conversation',
          };
        })
      );

      setConversations(conversationsWithPreview);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      onSelectConversation(conversationId, data || []);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    try {
      await supabase.from('chat_messages').delete().eq('conversation_id', conversationId);
      await supabase.from('chat_conversations').delete().eq('id', conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        onNewChat();
      }
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  const filtered = conversations.filter(c =>
    !searchQuery || 
    (c.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.preview?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Collapsed toggle button
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl border border-border/50 bg-card hover:bg-muted/80 transition-all shadow-sm hover:shadow-md"
        title="Show chat history"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="flex flex-col w-full md:w-72 h-full bg-card md:border md:border-border/50 md:rounded-2xl md:shadow-xl overflow-hidden md:animate-slide-in-right">
      {/* Header */}
      <div className="p-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">History</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNewChat} title="New chat">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle} title="Close sidebar">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="h-8 text-xs pl-8 bg-background/50 border-border/30"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {!userId ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Sign in to see your chat history</p>
          </div>
        ) : isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>{searchQuery ? 'No matching chats' : 'No conversations yet'}</p>
          </div>
        ) : (
          <div className="p-1.5 space-y-0.5">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all duration-200 group/item",
                  "hover:bg-muted/70",
                  activeConversationId === conv.id
                    ? "bg-primary/10 border border-primary/20"
                    : "border border-transparent"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conv.title || conv.preview || 'New chat'}
                    </p>
                    {conv.preview && conv.title && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.preview}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {conv.updated_at
                        ? formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })
                        : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
