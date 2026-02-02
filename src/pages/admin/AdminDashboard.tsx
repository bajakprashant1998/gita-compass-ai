import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  FileText,
  Tags,
  Languages,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { getAdminStats } from '@/lib/adminApi';
import type { AdminStats } from '@/types/admin';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your Bhagavad Gita Gyan content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))
        ) : (
          <>
            <AdminStatsCard
              title="Total Chapters"
              value={stats?.totalChapters || 0}
              icon={BookOpen}
            />
            <AdminStatsCard
              title="Total Shloks"
              value={stats?.totalShloks || 0}
              icon={FileText}
            />
            <AdminStatsCard
              title="Published"
              value={stats?.publishedShloks || 0}
              icon={CheckCircle}
              className="border-l-4 border-l-emerald-500"
            />
            <AdminStatsCard
              title="Drafts"
              value={stats?.draftShloks || 0}
              icon={Clock}
              className="border-l-4 border-l-amber-500"
            />
            <AdminStatsCard
              title="Problem Tags"
              value={stats?.totalProblems || 0}
              icon={Tags}
            />
            <AdminStatsCard
              title="Languages"
              value={stats?.activeLanguages || 0}
              icon={Languages}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link to="/admin/shloks/create">
                <FileText className="mr-2 h-4 w-4" />
                Add New Shlok
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/problems/create">
                <Tags className="mr-2 h-4 w-4" />
                Add Problem Tag
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Content Status
              <Link to="/admin/shloks" className="text-sm text-primary hover:underline">
                View All <ArrowRight className="inline h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Published Content</span>
                  <span className="font-medium">
                    {stats ? Math.round((stats.publishedShloks / Math.max(stats.totalShloks, 1)) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: `${stats ? (stats.publishedShloks / Math.max(stats.totalShloks, 1)) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">{stats?.publishedShloks || 0}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{stats?.draftShloks || 0}</p>
                  <p className="text-xs text-muted-foreground">Drafts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Activity tracking enabled</p>
              <Button asChild variant="link" size="sm" className="mt-2">
                <Link to="/admin/activity">View Activity Log</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/shloks"
          className="block p-6 bg-card border rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <FileText className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            Manage Shloks
          </h3>
          <p className="text-sm text-muted-foreground">
            Create, edit, and publish shloks
          </p>
        </Link>

        <Link
          to="/admin/chapters"
          className="block p-6 bg-card border rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <BookOpen className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            Manage Chapters
          </h3>
          <p className="text-sm text-muted-foreground">
            Edit chapter details and themes
          </p>
        </Link>

        <Link
          to="/admin/problems"
          className="block p-6 bg-card border rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <Tags className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            Problem Tags
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage problem categories
          </p>
        </Link>

        <Link
          to="/admin/ai-rules"
          className="block p-6 bg-card border rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <Languages className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            AI Search Rules
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure keyword mappings
          </p>
        </Link>
      </div>
    </div>
  );
}
