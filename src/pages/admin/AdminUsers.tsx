import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, Mail, Calendar, BookOpen, Heart, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserRow {
  user_id: string;
  display_name: string | null;
  preferred_language: string | null;
  created_at: string | null;
  versesRead: number;
  favorites: number;
  chats: number;
}

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      // Fetch profiles
      let query = supabase.from('profiles').select('user_id, display_name, preferred_language, created_at', { count: 'exact' });
      
      if (search) {
        query = query.ilike('display_name', `%${search}%`);
      }

      const from = (page - 1) * perPage;
      query = query.order('created_at', { ascending: false }).range(from, from + perPage - 1);

      const { data: profiles, count, error } = await query;
      if (error) throw error;

      const userIds = (profiles || []).map(p => p.user_id);

      // Batch fetch progress, favorites, chats
      const [progressRes, favoritesRes, chatsRes] = await Promise.all([
        supabase.from('user_progress').select('user_id, shloks_read').in('user_id', userIds),
        supabase.from('favorites').select('user_id').in('user_id', userIds),
        supabase.from('chat_conversations').select('user_id').in('user_id', userIds),
      ]);

      const progressMap = new Map<string, number>();
      (progressRes.data || []).forEach(p => {
        progressMap.set(p.user_id, Array.isArray(p.shloks_read) ? p.shloks_read.length : 0);
      });

      const favMap = new Map<string, number>();
      (favoritesRes.data || []).forEach(f => {
        favMap.set(f.user_id, (favMap.get(f.user_id) || 0) + 1);
      });

      const chatMap = new Map<string, number>();
      (chatsRes.data || []).forEach(c => {
        chatMap.set(c.user_id, (chatMap.get(c.user_id) || 0) + 1);
      });

      const users: UserRow[] = (profiles || []).map(p => ({
        user_id: p.user_id,
        display_name: p.display_name,
        preferred_language: p.preferred_language,
        created_at: p.created_at,
        versesRead: progressMap.get(p.user_id) || 0,
        favorites: favMap.get(p.user_id) || 0,
        chats: chatMap.get(p.user_id) || 0,
      }));

      return { users, total: count || 0 };
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / perPage);

  return (
    <div>
      <AdminHeader
        title="User Management"
        subtitle={`${data?.total || 0} registered users`}
        icon={<Users className="w-5 h-5" />}
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {/* User List */}
      <Card className="rounded-2xl border-border/60 overflow-hidden">
        <CardContent className="p-0">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-4 px-5 py-3 border-b border-border/40 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>User</span>
            <span className="text-center">Verses</span>
            <span className="text-center">Favs</span>
            <span className="text-center">Chats</span>
            <span className="text-center">Joined</span>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : data?.users && data.users.length > 0 ? (
            <div className="divide-y divide-border/30">
              {data.users.map(user => {
                const initials = (user.display_name || 'U').substring(0, 2).toUpperCase();
                const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';

                return (
                  <div key={user.user_id} className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-4 px-5 py-3.5 items-center hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.display_name || 'Anonymous'}</p>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">
                          {user.preferred_language || 'english'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold flex items-center justify-center gap-1">
                        <BookOpen className="w-3 h-3 text-muted-foreground" />
                        {user.versesRead}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        {user.favorites}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold flex items-center justify-center gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-400" />
                        {user.chats}
                      </span>
                    </div>
                    <div className="text-center text-xs text-muted-foreground">
                      {joinDate}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {data?.total} users
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
