import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { ShareButtons } from '@/components/ui/share-buttons';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug!)
        .eq('published', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="h-12 animate-pulse rounded bg-muted" />
            <div className="h-96 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <Link to="/blog"><Button>Back to Blog</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || post.title}
        keywords={post.meta_keywords || post.tags || []}
        type="article"
      />

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog">
            <Button variant="ghost" className="gap-2 mb-6 group">
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Button>
          </Link>

          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {(post.tags || []).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" /> {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </span>
            </div>
          </header>

          <Card className="mb-8">
            <CardContent className="p-6 sm:p-10 prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">Share this article</p>
            <ShareButtons
              title={post.title}
              text={post.excerpt || post.title}
              url={`https://www.bhagavadgitagyan.com/blog/${post.slug}`}
            />
          </div>
        </div>
      </article>
    </Layout>
  );
}
