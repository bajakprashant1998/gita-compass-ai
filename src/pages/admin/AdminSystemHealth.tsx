import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Activity, Database, Zap, Server, CheckCircle, AlertTriangle, Clock,
  RefreshCw, Wifi, WifiOff, HardDrive, Users, MessageSquare, BookOpen,
  Heart, FileText, Shield, Globe, BarChart3, Timer
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HealthHistory {
  timestamp: number;
  dbTime: number;
  efTime: number;
  dbStatus: string;
  efStatus: string;
}

export default function AdminSystemHealth() {
  const [history, setHistory] = useState<HealthHistory[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const startTime = Date.now();

      // Test DB response time
      const { error: dbError } = await supabase.from('chapters').select('id', { count: 'exact', head: true });
      const dbResponseTime = Date.now() - startTime;

      // Test auth service
      const authStart = Date.now();
      let authStatus = 'healthy';
      let authTime = 0;
      try {
        await supabase.auth.getSession();
        authTime = Date.now() - authStart;
        if (authTime > 1000) authStatus = 'slow';
      } catch {
        authTime = Date.now() - authStart;
        authStatus = 'error';
      }

      // Test storage/realtime ping
      const storageStart = Date.now();
      let storageStatus = 'healthy';
      let storageTime = 0;
      try {
        // Simple REST ping to check connectivity
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        storageTime = Date.now() - storageStart;
        if (!resp.ok) storageStatus = 'degraded';
        if (storageTime > 500) storageStatus = 'slow';
      } catch {
        storageTime = Date.now() - storageStart;
        storageStatus = 'error';
      }

      // Get table counts
      const [chapters, shloks, users, chats, favorites, blogs, reflections, discussions, readingPlans, contacts] = await Promise.all([
        supabase.from('chapters').select('id', { count: 'exact', head: true }),
        supabase.from('shloks').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('chat_conversations').select('id', { count: 'exact', head: true }),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('verse_reflections').select('id', { count: 'exact', head: true }),
        supabase.from('verse_discussions').select('id', { count: 'exact', head: true }),
        supabase.from('reading_plans').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
      ]);

      // Test edge function
      const efStart = Date.now();
      let edgeFunctionStatus = 'healthy';
      let edgeFunctionTime = 0;
      try {
        const resp = await supabase.functions.invoke('test-api-connection', { body: { provider: 'gemini' } });
        edgeFunctionTime = Date.now() - efStart;
        if (resp.error) edgeFunctionStatus = 'degraded';
        if (edgeFunctionTime > 2000) edgeFunctionStatus = 'slow';
      } catch {
        edgeFunctionTime = Date.now() - efStart;
        edgeFunctionStatus = 'error';
      }

      const totalTime = Date.now() - startTime;

      return {
        dbResponseTime,
        dbStatus: dbError ? 'error' : dbResponseTime < 200 ? 'healthy' : dbResponseTime < 500 ? 'slow' : 'error',
        authStatus,
        authTime,
        storageStatus,
        storageTime,
        edgeFunctionStatus,
        edgeFunctionTime,
        totalTime,
        tables: {
          chapters: chapters.count || 0,
          shloks: shloks.count || 0,
          users: users.count || 0,
          chats: chats.count || 0,
          favorites: favorites.count || 0,
          blogs: blogs.count || 0,
          reflections: reflections.count || 0,
          discussions: discussions.count || 0,
          readingPlans: readingPlans.count || 0,
          contacts: contacts.count || 0,
        },
      };
    },
    refetchInterval: 30000,
  });

  // Track history
  useEffect(() => {
    if (data) {
      setLastChecked(new Date());
      setHistory(prev => {
        const next = [...prev, {
          timestamp: Date.now(),
          dbTime: data.dbResponseTime,
          efTime: data.edgeFunctionTime,
          dbStatus: data.dbStatus,
          efStatus: data.edgeFunctionStatus,
        }];
        return next.slice(-20); // Keep last 20
      });
    }
  }, [data]);

  const getOverallStatus = useCallback(() => {
    if (!data) return 'error';
    const statuses = [data.dbStatus, data.edgeFunctionStatus, data.authStatus, data.storageStatus];
    if (statuses.some(s => s === 'error')) return 'error';
    if (statuses.some(s => s === 'slow' || s === 'degraded')) return 'slow';
    return 'healthy';
  }, [data]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'slow':
      case 'degraded': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1"><CheckCircle className="w-3 h-3" /> Healthy</Badge>;
      case 'slow':
      case 'degraded':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1"><Clock className="w-3 h-3" /> Slow</Badge>;
      default:
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1"><AlertTriangle className="w-3 h-3" /> Error</Badge>;
    }
  };

  const getLatencyColor = (ms: number, thresholds = { good: 200, warn: 500 }) => {
    if (ms < thresholds.good) return 'text-emerald-500';
    if (ms < thresholds.warn) return 'text-amber-500';
    return 'text-destructive';
  };

  const getBarColor = (ms: number, thresholds = { good: 200, warn: 500 }) => {
    if (ms < thresholds.good) return 'bg-emerald-500';
    if (ms < thresholds.warn) return 'bg-amber-500';
    return 'bg-destructive';
  };

  const uptimePercent = history.length > 0
    ? Math.round((history.filter(h => h.dbStatus === 'healthy').length / history.length) * 100)
    : 100;

  const avgDbTime = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.dbTime, 0) / history.length)
    : 0;

  const services = data ? [
    { name: 'Database', icon: Database, status: data.dbStatus, latency: data.dbResponseTime, target: '< 200ms' },
    { name: 'Authentication', icon: Shield, status: data.authStatus, latency: data.authTime, target: '< 500ms' },
    { name: 'Backend Functions', icon: Zap, status: data.edgeFunctionStatus, latency: data.edgeFunctionTime, target: '< 2000ms' },
    { name: 'REST API', icon: Globe, status: data.storageStatus, latency: data.storageTime, target: '< 500ms' },
  ] : [];

  const tableData = data ? [
    { label: 'Chapters', count: data.tables.chapters, icon: BookOpen, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Shloks', count: data.tables.shloks, icon: FileText, color: 'text-primary bg-primary/10' },
    { label: 'Users', count: data.tables.users, icon: Users, color: 'text-violet-500 bg-violet-500/10' },
    { label: 'Conversations', count: data.tables.chats, icon: MessageSquare, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Favorites', count: data.tables.favorites, icon: Heart, color: 'text-rose-500 bg-rose-500/10' },
    { label: 'Blog Posts', count: data.tables.blogs, icon: FileText, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Reflections', count: data.tables.reflections, icon: MessageSquare, color: 'text-cyan-500 bg-cyan-500/10' },
    { label: 'Discussions', count: data.tables.discussions, icon: MessageSquare, color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Reading Plans', count: data.tables.readingPlans, icon: BookOpen, color: 'text-teal-500 bg-teal-500/10' },
    { label: 'Contact Forms', count: data.tables.contacts, icon: FileText, color: 'text-orange-500 bg-orange-500/10' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminHeader
          title="System Health"
          subtitle="Real-time platform monitoring & diagnostics"
          icon={<Activity className="w-5 h-5" />}
        />
        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Overall Status Banner */}
          <Card className={`rounded-2xl border-2 transition-colors ${
            getOverallStatus() === 'healthy' ? 'border-emerald-500/30 bg-emerald-500/5' :
            getOverallStatus() === 'slow' ? 'border-amber-500/30 bg-amber-500/5' :
            'border-destructive/30 bg-destructive/5'
          }`}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    getOverallStatus() === 'healthy' ? 'bg-emerald-500/20' :
                    getOverallStatus() === 'slow' ? 'bg-amber-500/20' : 'bg-destructive/20'
                  }`}>
                    {getOverallStatus() === 'healthy' ? <Wifi className="w-6 h-6 text-emerald-500" /> :
                     getOverallStatus() === 'slow' ? <Clock className="w-6 h-6 text-amber-500" /> :
                     <WifiOff className="w-6 h-6 text-destructive" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {getOverallStatus() === 'healthy' ? 'All Systems Operational' :
                       getOverallStatus() === 'slow' ? 'Performance Degraded' :
                       'System Issues Detected'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {services.filter(s => s.status === 'healthy').length}/{services.length} services healthy · Total check: {data?.totalTime}ms
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{uptimePercent}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{avgDbTime}<span className="text-sm font-normal text-muted-foreground">ms</span></p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Latency</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{history.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Checks</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Status Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map(service => (
              <Card key={service.name} className="rounded-2xl border-border/60 hover:border-primary/20 transition-colors">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <service.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{service.name}</span>
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(service.status)}
                      <span className={`text-sm font-mono font-semibold ${getLatencyColor(service.latency, 
                        service.name === 'Backend Functions' ? { good: 500, warn: 2000 } : { good: 200, warn: 500 }
                      )}`}>
                        {service.latency}ms
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(service.latency,
                          service.name === 'Backend Functions' ? { good: 500, warn: 2000 } : { good: 200, warn: 500 }
                        )}`}
                        style={{ width: `${Math.min(100, (service.latency / (service.name === 'Backend Functions' ? 3000 : 1000)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Target: {service.target}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Latency History */}
          {history.length > 1 && (
            <Card className="rounded-2xl border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Response Time History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-20">
                  {history.map((h, i) => {
                    const maxTime = Math.max(...history.map(x => x.dbTime), 100);
                    const height = Math.max(4, (h.dbTime / maxTime) * 100);
                    return (
                      <div
                        key={i}
                        className="flex-1 group relative"
                      >
                        <div
                          className={`w-full rounded-t transition-all ${getBarColor(h.dbTime)} opacity-80 hover:opacity-100`}
                          style={{ height: `${height}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border border-border rounded px-2 py-1 text-[10px] font-mono shadow-lg whitespace-nowrap z-10">
                          {h.dbTime}ms
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">Older</span>
                  <span className="text-[10px] text-muted-foreground">Latest</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Database Tables */}
          <Card className="rounded-2xl border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-primary" /> Database Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {tableData.map(t => (
                  <div key={t.label} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/30 hover:border-primary/20 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${t.color}`}>
                      <t.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold leading-tight">{t.count}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate">{t.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Environment Info */}
          <Card className="rounded-2xl border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" /> Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Platform</p>
                  <p className="font-medium">Lovable Cloud</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Region</p>
                  <p className="font-medium">Auto-detected</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Auto-Refresh</p>
                  <p className="font-medium">Every 30 seconds</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Configured Secrets</p>
                  <p className="font-medium">GEMINI_API_KEY, VAPID keys</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Backend Functions</p>
                  <p className="font-medium">10 deployed</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Session Uptime</p>
                  <p className="font-medium">{history.length} checks recorded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
