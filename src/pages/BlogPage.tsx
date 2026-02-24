import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, ArrowRight, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const featuredPost = posts?.[0];
  const restPosts = posts?.slice(1);

  return (
    <Layout>
      <SEOHead
        title="Blog - Bhagavad Gita Insights"
        description="Deep insights and commentary on Bhagavad Gita teachings. Explore articles on anxiety, purpose, karma, and applying ancient wisdom to modern life."
        keywords={['Bhagavad Gita blog', 'spiritual insights', 'wisdom articles', 'Gita commentary']}
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/8 via-primary/4 to-background">
        <div className="absolute top-6 right-10 text-[100px] leading-none text-primary/[0.04] font-serif select-none pointer-events-none hidden lg:block">ॐ</div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
              <BookOpen className="h-4 w-4" />
              Wisdom Blog
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Insights & Commentary
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Deep dives into Bhagavad Gita teachings and their relevance to modern life challenges.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-64 animate-pulse rounded-2xl bg-muted" />
              {[1, 2].map(i => (
                <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-8">
              {/* Featured */}
              {featuredPost && (
                <Link to={`/blog/${featuredPost.slug}`} className="block group animate-fade-in">
                  <Card className="overflow-hidden border-primary/15 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-0">
                      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-7 sm:p-9">
                        {/* Premium badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5">✦ Latest</Badge>
                          {(featuredPost.tags || []).slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-[10px] border-primary/20 text-primary/70">{tag}</Badge>
                          ))}
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight max-w-2xl">
                          {featuredPost.title}
                        </h2>
                        {featuredPost.excerpt && (
                          <p className="text-muted-foreground text-base sm:text-lg mb-5 line-clamp-2 max-w-2xl leading-relaxed">
                            {featuredPost.excerpt}
                          </p>
                        )}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 bg-card/80 backdrop-blur border rounded-full px-3 py-1.5 text-xs">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <Eye className="h-3 w-3 text-primary" />
                            </div>
                            <span className="font-medium">{featuredPost.author}</span>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-card/80 backdrop-blur border rounded-full px-3 py-1.5">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(featuredPost.created_at), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-card/80 backdrop-blur border rounded-full px-3 py-1.5">
                            <Clock className="h-3 w-3" />
                            {estimateReadTime(featuredPost.content)} min read
                          </span>
                          <span className="ml-auto text-primary text-sm font-medium items-center gap-1 hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity">
                            Read Article <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {/* Grid */}
              {restPosts && restPosts.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  {restPosts.map((post: any, idx: number) => (
                    <Link to={`/blog/${post.slug}`} key={post.id} className="block group">
                      <Card
                        className="h-full overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                        style={{ animationDelay: `${(idx + 1) * 80}ms` }}
                      >
                        <CardContent className="p-5 sm:p-6 flex flex-col h-full">
                          <div className="flex items-center gap-1.5 mb-3">
                            {(post.tags || []).slice(0, 2).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] bg-primary/8 text-primary font-normal px-2 py-0.5">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <h2 className="text-base sm:text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            {post.title}
                          </h2>
                          {post.excerpt && (
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(post.created_at), 'MMM d')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {estimateReadTime(post.content)} min
                              </span>
                            </div>
                            <span className="text-primary text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Read <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 sm:p-16 text-center">
                <div className="text-5xl mb-4">📖</div>
                <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  We're preparing insightful articles on Bhagavad Gita wisdom. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
