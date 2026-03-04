import { useState, useEffect, useRef } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, User, MessageSquare, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'new_user' | 'new_chat';
  title: string;
  detail: string;
  timestamp: Date;
  read: boolean;
}

export function AdminNotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Subscribe to new profiles (new users)
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          const profile = payload.new as any;
          setNotifications(prev => [{
            id: `user-${profile.id}`,
            type: 'new_user' as const,
            title: 'New User Signed Up',
            detail: profile.display_name || 'Anonymous',
            timestamp: new Date(),
            read: false,
          }, ...prev].slice(0, 50));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_conversations' },
        (payload) => {
          setNotifications(prev => [{
            id: `chat-${payload.new.id}`,
            type: 'new_chat' as const,
            title: 'New Chat Session',
            detail: 'A user started a conversation',
            timestamp: new Date(),
            read: false,
          }, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border/60 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <span className="text-sm font-bold">Notifications</span>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
                    <Check className="w-3 h-3 mr-1" /> Read all
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearAll}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No notifications yet</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Real-time alerts appear here</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-border/20 transition-colors ${n.read ? '' : 'bg-primary/5'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${n.type === 'new_user' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>
                      {n.type === 'new_user' ? <User className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{n.detail}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
