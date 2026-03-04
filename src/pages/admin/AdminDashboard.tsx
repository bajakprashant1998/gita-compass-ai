import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  FileText,
  Tags,
  Languages,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  LayoutDashboard,
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  Activity,
  PenSquare,
  Bot,
  Sparkles,
} from 'lucide-react';
import { getAdminStats } from '@/lib/adminApi';
import type { AdminStats } from '@/types/admin';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ExtendedStats extends AdminStats {
  totalUsers: number;
  totalChats: number;
  totalFavorites: number;
  totalBlogPosts: number;
  recentActivity: Array<{
    id: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    created_at: string;
  }>;
}

export default function AdminDashboard() {
  const { isReady } = useAdminAuthContext();
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [baseStats, usersRes, chatsRes, favoritesRes, blogRes, activityRes] = await Promise.all([
        getAdminStats(),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('chat_conversations').select('id', { count: 'exact', head: true }),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('admin_activity_log').select('id, action, entity_type, entity_id, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        ...baseStats,
        totalUsers: usersRes.count || 0,
        totalChats: chatsRes.count || 0,
        totalFavorites: favoritesRes.count || 0,
        totalBlogPosts: blogRes.count || 0,
        recentActivity: (activityRes.data || []) as any,
      });
    } catch (error: any) {
      console.error('Failed to load admin stats:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    loadStats();
  }, [isReady]);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="w-3 h-3" />;
      case 'update': return <Activity className="w-3 h-3" />;
      case 'delete': return <Clock className="w-3 h-3" />;
      case 'publish': return <CheckCircle className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'update': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'delete': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'publish': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        subtitle="Overview of your Bhagavad Gita Gyan platform"
        icon={<LayoutDashboard className="w-5 h-5" />}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/analytics">
                <TrendingUp className="w-4 h-4 mr-2" /> Analytics
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/shloks/create">
                <Plus className="w-4 h-4 mr-2" /> New Shlok
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      {error ? (
        <div className="p-6 border border-destructive/20 bg-destructive/5 rounded-2xl text-destructive flex items-center gap-3 mb-8">
          <div className="h-5 w-5 border-2 border-destructive rounded-full flex items-center justify-center font-bold text-xs">!</div>
          <p className="flex-1 text-sm">Failed to load dashboard data: {error.message}</p>
          <Button variant="outline" size="sm" onClick={loadStats}>Retry</Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 mb-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-5 rounded-2xl">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))
          ) : (
            <>
              <AdminStatsCard title="Chapters" value={stats?.totalChapters || 0} icon={BookOpen} color="primary" />
              <AdminStatsCard title="Total Shloks" value={stats?.totalShloks || 0} icon={FileText} color="blue" />
              <AdminStatsCard title="Published" value={stats?.publishedShloks || 0} icon={CheckCircle} color="emerald" />
              <AdminStatsCard title="Drafts" value={stats?.draftShloks || 0} icon={Clock} color="amber" />
              <AdminStatsCard title="Users" value={stats?.totalUsers || 0} icon={Users} color="purple" />
              <AdminStatsCard title="Chat Sessions" value={stats?.totalChats || 0} icon={MessageSquare} color="blue" />
              <AdminStatsCard title="Favorites" value={stats?.totalFavorites || 0} icon={Heart} color="rose" />
              <AdminStatsCard title="Blog Posts" value={stats?.totalBlogPosts || 0} icon={PenSquare} color="amber" />
            </>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Quick Actions */}
        <Card className="rounded-2xl border-border/60 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { to: '/admin/shloks/create', icon: FileText, label: 'Add New Shlok', variant: 'default' as const },
              { to: '/admin/blog/create', icon: PenSquare, label: 'Write Blog Post', variant: 'outline' as const },
              { to: '/admin/problems/create', icon: Tags, label: 'Add Problem Tag', variant: 'outline' as const },
              { to: '/admin/users', icon: Users, label: 'Manage Users', variant: 'outline' as const },
            ].map(action => (
              <Button key={action.to} asChild variant={action.variant} className="w-full justify-start rounded-xl h-10" size="sm">
                <Link to={action.to}>
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Content Status */}
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Content Status
              </span>
              <Link to="/admin/shloks" className="text-xs text-primary hover:underline font-normal">
                View All →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Published Content</span>
                  <span className="font-bold text-lg">
                    {stats ? Math.round((stats.publishedShloks / Math.max(stats.totalShloks, 1)) * 100) : 0}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats ? (stats.publishedShloks / Math.max(stats.totalShloks, 1)) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="text-center p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats?.publishedShloks || 0}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Published</p>
                </div>
                <div className="text-center p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats?.draftShloks || 0}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Drafts</p>
                </div>
                <div className="text-center p-3 bg-primary/5 border border-primary/10 rounded-xl">
                  <p className="text-xl font-bold text-primary">{stats?.totalProblems || 0}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Problems</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recent Activity
              </span>
              <Link to="/admin/activity" className="text-xs text-primary hover:underline font-normal">
                View All →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-7 h-7 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-32 mb-1" />
                      <Skeleton className="h-2.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${getActionColor(item.action)}`}>
                      {getActionIcon(item.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate capitalize">
                        {item.action}d {item.entity_type}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {getTimeAgo(item.created_at)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize">
                      {item.entity_type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Management Links */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/admin/shloks', icon: FileText, label: 'Manage Shloks', desc: 'Create, edit, and publish', color: 'from-primary/10 to-primary/5' },
          { to: '/admin/chapters', icon: BookOpen, label: 'Manage Chapters', desc: 'Edit chapter details', color: 'from-blue-500/10 to-blue-500/5' },
          { to: '/admin/blog', icon: PenSquare, label: 'Blog Posts', desc: 'Write and manage posts', color: 'from-amber-500/10 to-amber-500/5' },
          { to: '/admin/ai-rules', icon: Bot, label: 'AI Rules', desc: 'Configure search mappings', color: 'from-purple-500/10 to-purple-500/5' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="block p-5 bg-card border border-border/60 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm mb-0.5 group-hover:text-primary transition-colors">
              {item.label}
            </h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
