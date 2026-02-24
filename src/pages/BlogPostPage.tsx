import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, User, Clock, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { ShareButtons } from '@/components/ui/share-buttons';

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

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
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-px bg-border my-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${90 - i * 8}%` }} />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold mb-2">Article not found</h1>
          <p className="text-muted-foreground mb-6">This article may have been removed or the link is incorrect.</p>
          <Link to="/blog"><Button className="gap-2"><ChevronLeft className="h-4 w-4" /> Back to Blog</Button></Link>
        </div>
      </Layout>
    );
  }

  const readTime = estimateReadTime(post.content);

  return (
    <Layout>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || post.title}
        keywords={post.meta_keywords || post.tags || []}
        type="article"
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/8 via-primary/4 to-background">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 text-[120px] leading-none text-primary/5 font-serif select-none pointer-events-none hidden lg:block">ॐ</div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:pt-8 sm:pb-14">
          <div className="max-w-3xl mx-auto">
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="gap-1.5 mb-6 -ml-2 text-muted-foreground hover:text-foreground group">
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Blog
              </Button>
            </Link>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {(post.tags || []).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-medium px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-5">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                {post.excerpt}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary/60" /> {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary/60" /> {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary/60" /> {readTime} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="blog-prose">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h2 className="text-2xl sm:text-3xl font-bold mt-12 mb-4 text-foreground tracking-tight first:mt-0">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl sm:text-3xl font-bold mt-12 mb-4 text-foreground tracking-tight first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-foreground">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-semibold mt-8 mb-2 text-foreground">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-base sm:text-lg leading-relaxed sm:leading-8 text-muted-foreground mb-6">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-outside pl-6 space-y-2 mb-6 text-muted-foreground text-base sm:text-lg leading-relaxed">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside pl-6 space-y-2 mb-6 text-muted-foreground text-base sm:text-lg leading-relaxed">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/40 bg-primary/5 rounded-r-lg pl-5 pr-4 py-4 my-8 italic text-foreground/80">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-foreground/70">{children}</em>
                ),
                a: ({ children, href }) => (
                  <a href={href} className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                hr: () => (
                  <div className="my-10 flex items-center justify-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-primary/30 text-lg">✦</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>;
                  }
                  return (
                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto mb-6">
                      <code className="text-sm font-mono text-foreground">{children}</code>
                    </pre>
                  );
                },
                img: ({ src, alt }) => (
                  <figure className="my-8">
                    <img src={src} alt={alt || ''} className="w-full rounded-xl shadow-lg" loading="lazy" />
                    {alt && <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">{alt}</figcaption>}
                  </figure>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* End decorative divider */}
          <div className="my-12 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
            <span className="text-primary/40 text-2xl">🙏</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
          </div>

          {/* Share section */}
          <div className="bg-muted/50 rounded-2xl p-6 sm:p-8 text-center">
            <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">Enjoyed this article?</p>
            <p className="text-xs text-muted-foreground mb-4">Share this wisdom with others</p>
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
