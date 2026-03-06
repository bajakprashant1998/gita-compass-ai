import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertTriangle, CheckCircle2, XCircle, Search, FileText,
  BookOpen, Tags, RefreshCw, TrendingUp, Eye, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  entity: string;
  entityType: string;
  editUrl?: string;
  message: string;
}

interface AuditResult {
  score: number;
  issues: SEOIssue[];
  stats: {
    totalPages: number;
    withTitle: number;
    withDescription: number;
    withKeywords: number;
    thinContent: number;
  };
}

export default function AdminSEOAudit() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  const runAudit = async () => {
    setLoading(true);
    const issues: SEOIssue[] = [];
    let totalPages = 0;
    let withTitle = 0;
    let withDescription = 0;
    let withKeywords = 0;
    let thinContent = 0;

    try {
      // Audit chapters
      const { data: chapters } = await supabase.from('chapters').select('id, chapter_number, title_english, meta_title, meta_description, meta_keywords, description_english');
      if (chapters) {
        totalPages += chapters.length;
        for (const ch of chapters) {
          if (ch.meta_title) withTitle++; else issues.push({ type: 'error', entity: `Chapter ${ch.chapter_number}: ${ch.title_english}`, entityType: 'chapter', editUrl: `/admin/chapters/edit/${ch.id}`, message: 'Missing meta title' });
          if (ch.meta_description) withDescription++; else issues.push({ type: 'error', entity: `Chapter ${ch.chapter_number}: ${ch.title_english}`, entityType: 'chapter', editUrl: `/admin/chapters/edit/${ch.id}`, message: 'Missing meta description' });
          if (ch.meta_keywords?.length) withKeywords++; else issues.push({ type: 'warning', entity: `Chapter ${ch.chapter_number}`, entityType: 'chapter', editUrl: `/admin/chapters/edit/${ch.id}`, message: 'Missing meta keywords' });
          if (ch.meta_title && ch.meta_title.length > 60) issues.push({ type: 'warning', entity: `Chapter ${ch.chapter_number}`, entityType: 'chapter', editUrl: `/admin/chapters/edit/${ch.id}`, message: `Title too long (${ch.meta_title.length}/60 chars)` });
          if (ch.meta_description && ch.meta_description.length > 160) issues.push({ type: 'warning', entity: `Chapter ${ch.chapter_number}`, entityType: 'chapter', editUrl: `/admin/chapters/edit/${ch.id}`, message: `Description too long (${ch.meta_description.length}/160 chars)` });
          if (!ch.description_english || ch.description_english.length < 100) { thinContent++; issues.push({ type: 'info', entity: `Chapter ${ch.chapter_number}`, entityType: 'chapter', editUrl: `/admin/chapters/edit/${ch.id}`, message: 'Thin content — description under 100 chars' }); }
        }
      }

      // Audit shloks (sample first 200)
      const { data: shloks } = await supabase
        .from('shloks')
        .select('id, verse_number, meta_title, meta_description, meta_keywords, english_meaning, life_application, chapters!inner(chapter_number)')
        .limit(200);
      if (shloks) {
        totalPages += shloks.length;
        for (const s of shloks as any[]) {
          const label = `Verse ${s.chapters?.chapter_number}.${s.verse_number}`;
          if (s.meta_title) withTitle++; else issues.push({ type: 'error', entity: label, entityType: 'shlok', editUrl: `/admin/shloks/edit/${s.id}`, message: 'Missing meta title' });
          if (s.meta_description) withDescription++; else issues.push({ type: 'error', entity: label, entityType: 'shlok', editUrl: `/admin/shloks/edit/${s.id}`, message: 'Missing meta description' });
          if (s.meta_keywords?.length) withKeywords++; else issues.push({ type: 'warning', entity: label, entityType: 'shlok', editUrl: `/admin/shloks/edit/${s.id}`, message: 'Missing keywords' });
          if (!s.life_application) issues.push({ type: 'info', entity: label, entityType: 'shlok', editUrl: `/admin/shloks/edit/${s.id}`, message: 'Missing life application (thin content)' });
        }
      }

      // Audit problems
      const { data: problems } = await supabase.from('problems').select('id, name, slug, meta_title, meta_description, meta_keywords, description_english');
      if (problems) {
        totalPages += problems.length;
        for (const p of problems) {
          if (p.meta_title) withTitle++; else issues.push({ type: 'error', entity: p.name, entityType: 'problem', editUrl: `/admin/problems/edit/${p.id}`, message: 'Missing meta title' });
          if (p.meta_description) withDescription++; else issues.push({ type: 'error', entity: p.name, entityType: 'problem', editUrl: `/admin/problems/edit/${p.id}`, message: 'Missing meta description' });
          if (p.meta_keywords?.length) withKeywords++; else issues.push({ type: 'warning', entity: p.name, entityType: 'problem', editUrl: `/admin/problems/edit/${p.id}`, message: 'Missing keywords' });
        }
      }

      // Audit blog posts
      const { data: blogs } = await supabase.from('blog_posts').select('id, title, slug, meta_title, meta_description, meta_keywords, content, published');
      if (blogs) {
        totalPages += blogs.length;
        for (const b of blogs) {
          if (b.meta_title) withTitle++; else issues.push({ type: 'error', entity: b.title, entityType: 'blog', editUrl: `/admin/blog/edit/${b.id}`, message: 'Missing meta title' });
          if (b.meta_description) withDescription++; else issues.push({ type: 'error', entity: b.title, entityType: 'blog', editUrl: `/admin/blog/edit/${b.id}`, message: 'Missing meta description' });
          if (b.meta_keywords?.length) withKeywords++; else issues.push({ type: 'warning', entity: b.title, entityType: 'blog', editUrl: `/admin/blog/edit/${b.id}`, message: 'Missing keywords' });
          const wordCount = b.content?.trim().split(/\s+/).length || 0;
          if (wordCount < 300) { thinContent++; issues.push({ type: 'warning', entity: b.title, entityType: 'blog', editUrl: `/admin/blog/edit/${b.id}`, message: `Thin content (${wordCount} words, recommend 300+)` }); }
        }
      }

      // Audit static page SEO
      const { data: staticSeo } = await supabase.from('page_seo_metadata').select('*').eq('page_type', 'static');
      const staticPages = ['/', '/chat', '/problems', '/chapters', '/contact', '/donate', '/dashboard'];
      for (const page of staticPages) {
        totalPages++;
        const seo = staticSeo?.find(s => s.page_identifier === page);
        if (seo?.meta_title) withTitle++; else issues.push({ type: 'warning', entity: `Static: ${page}`, entityType: 'static', editUrl: '/admin/seo', message: 'Missing custom meta title' });
        if (seo?.meta_description) withDescription++; else issues.push({ type: 'warning', entity: `Static: ${page}`, entityType: 'static', editUrl: '/admin/seo', message: 'Missing custom meta description' });
      }

      // Calculate score
      const totalChecks = totalPages * 3; // title + desc + keywords per page
      const passed = withTitle + withDescription + withKeywords;
      const score = totalChecks > 0 ? Math.round((passed / totalChecks) * 100) : 0;

      setResult({ score, issues, stats: { totalPages, withTitle, withDescription, withKeywords, thinContent } });
    } catch (err) {
      console.error('SEO audit error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runAudit(); }, []);

  const filteredIssues = result?.issues.filter(i => filter === 'all' || i.type === filter) || [];
  const errorCount = result?.issues.filter(i => i.type === 'error').length || 0;
  const warningCount = result?.issues.filter(i => i.type === 'warning').length || 0;
  const infoCount = result?.issues.filter(i => i.type === 'info').length || 0;

  const scoreColor = (result?.score || 0) >= 80 ? 'text-green-500' : (result?.score || 0) >= 50 ? 'text-yellow-500' : 'text-destructive';

  return (
    <div className="space-y-6">
      <AdminHeader
        title="SEO Audit"
        subtitle="Comprehensive SEO health check across all content"
        actions={
          <Button onClick={runAudit} disabled={loading} size="sm">
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Re-run Audit
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>)}
        </div>
      ) : result && (
        <>
          {/* Score + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="md:col-span-1">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <span className={cn("text-5xl font-black tabular-nums", scoreColor)}>{result.score}</span>
                <span className="text-xs text-muted-foreground mt-1">SEO Score</span>
                <Progress value={result.score} className="mt-3 h-2" />
              </CardContent>
            </Card>
            {[
              { label: 'Total Pages', value: result.stats.totalPages, icon: FileText },
              { label: 'With Title', value: result.stats.withTitle, icon: Search },
              { label: 'With Description', value: result.stats.withDescription, icon: Eye },
              { label: 'Thin Content', value: result.stats.thinContent, icon: AlertTriangle },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <stat.icon className="w-4 h-4" />
                    <span className="text-xs">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-bold">{stat.value}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all' as const, label: 'All', count: result.issues.length },
              { key: 'error' as const, label: 'Errors', count: errorCount },
              { key: 'warning' as const, label: 'Warnings', count: warningCount },
              { key: 'info' as const, label: 'Info', count: infoCount },
            ].map(f => (
              <Button
                key={f.key}
                variant={filter === f.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <Badge variant="secondary" className="ml-2 text-[10px]">{f.count}</Badge>
              </Button>
            ))}
          </div>

          {/* Issues Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Issues ({filteredIssues.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {filteredIssues.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p>No issues found! 🎉</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card border-b">
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Page</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Issue</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssues.map((issue, i) => (
                        <tr key={i} className="border-b border-border/30 hover:bg-muted/30">
                          <td className="p-3">
                            {issue.type === 'error' ? <XCircle className="w-4 h-4 text-destructive" /> :
                             issue.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-500" /> :
                             <Eye className="w-4 h-4 text-blue-500" />}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{issue.entityType}</Badge>
                              <span className="font-medium truncate max-w-[200px]">{issue.entity}</span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{issue.message}</td>
                          <td className="p-3">
                            {issue.editUrl && (
                              <Link to={issue.editUrl}>
                                <Button variant="ghost" size="sm" className="h-7 text-xs">
                                  Fix <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
