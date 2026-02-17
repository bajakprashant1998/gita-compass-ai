import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

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

  return (
    <Layout>
      <SEOHead
        title="Blog - Bhagavad Gita Insights"
        description="Deep insights and commentary on Bhagavad Gita teachings. Explore articles on anxiety, purpose, karma, and applying ancient wisdom to modern life."
        keywords={['Bhagavad Gita blog', 'spiritual insights', 'wisdom articles', 'Gita commentary']}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <BookOpen className="h-4 w-4" />
              Wisdom Blog
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Insights & Commentary</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Deep dives into Bhagavad Gita teachings and their relevance to modern life challenges.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post: any, idx: number) => (
                <Link to={`/blog/${post.slug}`} key={post.id}>
                  <Card
                    className="overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(post.tags || []).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.created_at), 'MMM d, yyyy')}
                          <span className="mx-1">·</span>
                          <span>{post.author}</span>
                        </div>
                        <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Read More <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                <p className="text-muted-foreground">
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
