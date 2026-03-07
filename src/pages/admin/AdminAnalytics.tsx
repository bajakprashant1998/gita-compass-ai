import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
import {
  Users,
  MessageSquare,
  BookOpen,
  Clock,
  Heart,
  TrendingUp,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format, subDays } from 'date-fns';

interface AnalyticsData {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  totalConversations: number;
  totalMessages: number;
  totalFavorites: number;
  totalReflections: number;
  totalReadingTime: number;
  avgReadingTimePerUser: number;
  dailyActivity: Array<{ date: string; users: number; verses: number }>;
  topChapters: Array<{ name: string; count: number }>;
  userGrowth: Array<{ date: string; count: number }>;
  // New page view analytics
  totalPageViews: number;
  pageViewsToday: number;
  dailyPageViews: Array<{ date: string; views: number; unique: number }>;
  topPages: Array<{ path: string; views: number; unique: number }>;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function AdminAnalytics() {
  const { isReady } = useAdminAuthContext();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = subDays(new Date(), 7).toISOString().split('T')[0];
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];

      const [
        profilesRes,
        activityTodayRes,
        activityWeekRes,
        conversationsRes,
        messagesRes,
        favoritesRes,
        reflectionsRes,
        progressRes,
        dailyActivityRes,
        chaptersExploredRes,
        profileGrowthRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('reading_activity').select('user_id').eq('activity_date', today),
        supabase.from('reading_activity').select('user_id').gte('activity_date', weekAgo),
        supabase.from('chat_conversations').select('id', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        supabase.from('verse_reflections').select('id', { count: 'exact', head: true }),
        supabase.from('user_progress').select('total_reading_time, chapters_explored'),
        supabase.from('reading_activity')
          .select('activity_date, user_id, verses_read_count')
          .gte('activity_date', thirtyDaysAgo)
          .order('activity_date', { ascending: true }),
        supabase.from('user_progress').select('chapters_explored'),
        supabase.from('profiles')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: true }),
      ]);

      // Unique active users today
      const uniqueToday = new Set((activityTodayRes.data || []).map(r => r.user_id)).size;
      const uniqueWeek = new Set((activityWeekRes.data || []).map(r => r.user_id)).size;

      // Reading time
      const progressData = progressRes.data || [];
      const totalReadingTime = progressData.reduce((sum, p) => sum + (p.total_reading_time || 0), 0);
      const avgReading = progressData.length > 0 ? Math.round(totalReadingTime / progressData.length) : 0;

      // Daily activity aggregation (last 30 days)
      const dailyMap = new Map<string, { users: Set<string>; verses: number }>();
      for (const row of dailyActivityRes.data || []) {
        const d = row.activity_date;
        if (!dailyMap.has(d)) dailyMap.set(d, { users: new Set(), verses: 0 });
        const entry = dailyMap.get(d)!;
        entry.users.add(row.user_id);
        entry.verses += row.verses_read_count;
      }

      const dailyActivity = Array.from(dailyMap.entries()).map(([date, val]) => ({
        date: format(new Date(date), 'MMM dd'),
        users: val.users.size,
        verses: val.verses,
      }));

      // Top chapters explored
      const chapterCountMap = new Map<string, number>();
      for (const p of chaptersExploredRes.data || []) {
        for (const cid of (p.chapters_explored || [])) {
          chapterCountMap.set(cid, (chapterCountMap.get(cid) || 0) + 1);
        }
      }

      // Fetch chapter names for top 5
      const topChapterIds = [...chapterCountMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      let topChapters: Array<{ name: string; count: number }> = [];
      if (topChapterIds.length > 0) {
        const { data: chapterNames } = await supabase
          .from('chapters')
          .select('id, chapter_number, title_english')
          .in('id', topChapterIds);

        topChapters = topChapterIds.map(id => {
          const ch = (chapterNames || []).find(c => c.id === id);
          return {
            name: ch ? `Ch ${ch.chapter_number}` : 'Unknown',
            count: chapterCountMap.get(id) || 0,
          };
        });
      }

      // User growth (last 30 days)
      const growthMap = new Map<string, number>();
      for (const p of profileGrowthRes.data || []) {
        const d = format(new Date(p.created_at!), 'MMM dd');
        growthMap.set(d, (growthMap.get(d) || 0) + 1);
      }
      const userGrowth = Array.from(growthMap.entries()).map(([date, count]) => ({ date, count }));

      setData({
        totalUsers: profilesRes.count || 0,
        activeUsersToday: uniqueToday,
        activeUsersWeek: uniqueWeek,
        totalConversations: conversationsRes.count || 0,
        totalMessages: messagesRes.count || 0,
        totalFavorites: favoritesRes.count || 0,
        totalReflections: reflectionsRes.count || 0,
        totalReadingTime,
        avgReadingTimePerUser: avgReading,
        dailyActivity,
        topChapters,
        userGrowth,
      });
    } catch (err: any) {
      console.error('Analytics load error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    loadAnalytics();
  }, [isReady]);

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">User engagement & app usage insights</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-16" /></Card>
          ))
        ) : (
          <>
            <AdminStatsCard title="Total Users" value={data?.totalUsers || 0} icon={Users} description="Registered users" />
            <AdminStatsCard title="Active Today" value={data?.activeUsersToday || 0} icon={TrendingUp} className="border-l-4 border-l-emerald-500" description="Users with activity today" />
            <AdminStatsCard title="Active This Week" value={data?.activeUsersWeek || 0} icon={CalendarDays} className="border-l-4 border-l-blue-500" description="Last 7 days" />
            <AdminStatsCard title="Avg Reading Time" value={formatMinutes(data?.avgReadingTimePerUser || 0)} icon={Clock} description="Per user" />
          </>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-16" /></Card>
          ))
        ) : (
          <>
            <AdminStatsCard title="Conversations" value={data?.totalConversations || 0} icon={MessageSquare} />
            <AdminStatsCard title="Chat Messages" value={data?.totalMessages || 0} icon={MessageSquare} />
            <AdminStatsCard title="Favorites" value={data?.totalFavorites || 0} icon={Heart} />
            <AdminStatsCard title="Reflections" value={data?.totalReflections || 0} icon={BookOpen} />
          </>
        )}
      </div>

      {/* Charts */}
      {!isLoading && data && (
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Daily Active Users & Verses Read */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Activity (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.dailyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="users" name="Active Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="verses" name="Verses Read" fill="hsl(var(--chart-2, 220 70% 50%))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No activity data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">New User Signups (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.userGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Line type="monotone" dataKey="count" name="New Users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No signup data in the last 30 days
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Chapters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Most Explored Chapters</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topChapters.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.topChapters}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="count"
                    >
                      {data.topChapters.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No chapter exploration data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Reading Time (all users)</span>
                  <span className="font-bold text-lg">{formatMinutes(data.totalReadingTime)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Avg Time Per User</span>
                  <span className="font-bold text-lg">{formatMinutes(data.avgReadingTimePerUser)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Chat Engagement Rate</span>
                  <span className="font-bold text-lg">
                    {data.totalUsers > 0 ? Math.round((data.totalConversations / data.totalUsers) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Favorites Per User</span>
                  <span className="font-bold text-lg">
                    {data.totalUsers > 0 ? (data.totalFavorites / data.totalUsers).toFixed(1) : '0'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
