import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Database, Zap, Server, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminSystemHealth() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const startTime = Date.now();
      
      // Test DB response time
      const { error: dbError } = await supabase.from('chapters').select('id', { count: 'exact', head: true });
      const dbResponseTime = Date.now() - startTime;

      // Get table counts
      const [chapters, shloks, users, chats, favorites, blogs] = await Promise.all([
        supabase.from('chapters').select('id', { count: 'exact', head: true }),
        supabase.from('shloks').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('chat_conversations').select('id', { count: 'exact', head: true }),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      ]);

      // Test edge function
      const efStart = Date.now();
      let edgeFunctionStatus = 'healthy';
      let edgeFunctionTime = 0;
      try {
        const resp = await supabase.functions.invoke('test-api-connection', { body: {} });
        edgeFunctionTime = Date.now() - efStart;
        if (resp.error) edgeFunctionStatus = 'degraded';
      } catch {
        edgeFunctionTime = Date.now() - efStart;
        edgeFunctionStatus = 'error';
      }

      return {
        dbResponseTime,
        dbStatus: dbError ? 'error' : dbResponseTime < 500 ? 'healthy' : 'slow',
        edgeFunctionStatus,
        edgeFunctionTime,
        tables: {
          chapters: chapters.count || 0,
          shloks: shloks.count || 0,
          users: users.count || 0,
          chats: chats.count || 0,
          favorites: favorites.count || 0,
          blogs: blogs.count || 0,
        },
      };
    },
    refetchInterval: 30000,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Healthy</Badge>;
      case 'slow':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Slow</Badge>;
      default:
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><AlertTriangle className="w-3 h-3 mr-1" /> Error</Badge>;
    }
  };

  return (
    <div>
      <AdminHeader
        title="System Health"
        subtitle="Real-time platform monitoring"
        icon={<Activity className="w-5 h-5" />}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Service Status */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="rounded-2xl border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" /> Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(data?.dbStatus || 'error')}
                  <span className="text-xs text-muted-foreground">{data?.dbResponseTime}ms</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (data?.dbResponseTime || 0) < 200 ? 'bg-emerald-500' :
                      (data?.dbResponseTime || 0) < 500 ? 'bg-amber-500' : 'bg-destructive'
                    }`}
                    style={{ width: `${Math.min(100, ((data?.dbResponseTime || 0) / 1000) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Response time target: &lt; 200ms</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Backend Functions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(data?.edgeFunctionStatus || 'error')}
                  <span className="text-xs text-muted-foreground">{data?.edgeFunctionTime}ms</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      data?.edgeFunctionStatus === 'healthy' ? 'bg-emerald-500' :
                      data?.edgeFunctionStatus === 'degraded' ? 'bg-amber-500' : 'bg-destructive'
                    }`}
                    style={{ width: data?.edgeFunctionStatus === 'healthy' ? '30%' : data?.edgeFunctionStatus === 'degraded' ? '60%' : '90%' }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Cold start may take longer</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" /> Overall Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(
                    data?.dbStatus === 'healthy' && data?.edgeFunctionStatus === 'healthy' ? 'healthy' :
                    data?.dbStatus === 'error' || data?.edgeFunctionStatus === 'error' ? 'error' : 'slow'
                  )}
                  <span className="text-[10px] text-muted-foreground">Auto-refresh 30s</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4">All services are monitored continuously. Alerts will show if response times exceed thresholds.</p>
              </CardContent>
            </Card>
          </div>

          {/* Table Statistics */}
          <Card className="rounded-2xl border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Database Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Chapters', count: data?.tables.chapters },
                  { label: 'Shloks', count: data?.tables.shloks },
                  { label: 'Users', count: data?.tables.users },
                  { label: 'Chats', count: data?.tables.chats },
                  { label: 'Favorites', count: data?.tables.favorites },
                  { label: 'Blog Posts', count: data?.tables.blogs },
                ].map(t => (
                  <div key={t.label} className="text-center p-4 bg-muted/30 rounded-xl border border-border/30">
                    <p className="text-2xl font-bold">{t.count}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">{t.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
