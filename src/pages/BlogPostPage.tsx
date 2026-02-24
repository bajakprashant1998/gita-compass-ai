import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChevronLeft, Calendar, User, Clock, BookOpen, Tag,
  ArrowRight, MessageCircle, Eye, ListOrdered
} from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { ShareButtons } from '@/components/ui/share-buttons';
import { useState, useEffect, useRef, useMemo } from 'react';

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function estimateWordCount(content: string) {
  return content.trim().split(/\s+/).length;
}

function extractHeadings(content: string) {
  const headingRegex = /^#{1,3}\s+(.+)$/gm;
  const headings: { text: string; id: string; level: number }[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[0].indexOf(' ');
    const text = match[1].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    headings.push({ text, id, level });
  }
  return headings;
}

function extractKeyTakeaways(content: string) {
  // Look for bullet points in the first few sections
  const lines = content.split('\n');
  const takeaways: string[] = [];
  let inList = false;
  for (const line of lines) {
    if (line.match(/^[-*]\s+/)) {
      takeaways.push(line.replace(/^[-*]\s+/, '').trim());
      inList = true;
    } else if (inList && takeaways.length >= 3) {
      break;
    } else if (line.trim() && inList) {
      break;
    }
  }
  return takeaways.slice(0, 6);
}

// Sticky Table of Contents
function TableOfContents({ headings, activeId }: { headings: { text: string; id: string; level: number }[]; activeId: string }) {
  if (headings.length === 0) return null;
  return (
    <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-md bg-primary/10">
            <ListOrdered className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm">Table of Contents</h3>
        </div>
        <nav className="space-y-1">
          {headings.map((h, idx) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`flex items-start gap-2.5 py-1.5 px-2 rounded-md text-sm transition-all hover:bg-primary/5 ${
                activeId === h.id
                  ? 'text-primary font-medium bg-primary/5'
                  : 'text-muted-foreground'
              }`}
            >
              <span className={`shrink-0 text-xs font-medium w-5 h-5 flex items-center justify-center rounded ${
                activeId === h.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {idx + 1}
              </span>
              <span className="leading-snug line-clamp-2">{h.text}</span>
            </a>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}

// Author Card
function AuthorCard({ author }: { author: string }) {
  return (
    <Card className="border-primary/10">
      <CardContent className="p-5 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <User className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold text-sm">{author}</h3>
        <p className="text-xs text-muted-foreground mt-1">Spiritual Wisdom Writer</p>
        <div className="flex items-center justify-center gap-0.5 mt-2">
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className="text-amber-400 text-xs">★</span>
          ))}
          <span className="text-xs text-muted-foreground ml-1">4.9/5</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Related Articles Card
function RelatedArticlesCard({ currentSlug }: { currentSlug: string }) {
  const { data: related } = useQuery({
    queryKey: ['blog-related', currentSlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('title, slug, tags, created_at')
        .eq('published', true)
        .neq('slug', currentSlug)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  if (!related || related.length === 0) return null;

  return (
    <Card className="border-primary/10">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-md bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm">Related Articles</h3>
        </div>
        <div className="space-y-3">
          {related.map((r: any) => (
            <Link
              key={r.slug}
              to={`/blog/${r.slug}`}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors group"
            >
              <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                <BookOpen className="h-4 w-4 text-primary/60" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 5 min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

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

  const headings = useMemo(() => (post ? extractHeadings(post.content) : []), [post]);
  const keyTakeaways = useMemo(() => (post ? extractKeyTakeaways(post.content) : []), [post]);

  // Intersection observer for active heading tracking
  useEffect(() => {
    if (!post || headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );
    const timer = setTimeout(() => {
      headings.forEach(h => {
        const el = document.getElementById(h.id);
        if (el) observer.observe(el);
      });
    }, 300);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [post, headings]);

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-gradient-to-b from-primary/8 to-background">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl space-y-6">
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-12 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-5 w-full animate-pulse rounded bg-muted" />
              <div className="flex gap-4">
                <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
                <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
                <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${95 - i * 6}%` }} />
              ))}
            </div>
            <div className="hidden lg:block space-y-6">
              <div className="h-64 animate-pulse rounded-xl bg-muted" />
              <div className="h-40 animate-pulse rounded-xl bg-muted" />
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
  const wordCount = estimateWordCount(post.content);
  let headingCounter = 0;

  return (
    <Layout>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || post.title}
        keywords={post.meta_keywords || post.tags || []}
        type="article"
      />

      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/8 via-primary/4 to-background">
        <div className="absolute top-8 right-8 text-[140px] leading-none text-primary/[0.04] font-serif select-none pointer-events-none hidden xl:block">ॐ</div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 sm:pt-8 sm:pb-10">
          <div className="max-w-4xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-muted-foreground/40">›</span>
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <span className="text-muted-foreground/40">›</span>
              <span className="text-foreground/70 truncate max-w-[200px]">{(post.tags || [])[0] || 'Article'}</span>
            </nav>

            {/* Category badge */}
            {(post.tags || []).length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 rounded bg-primary/10">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                </div>
                <Badge className="bg-primary/10 text-primary border-0 text-xs font-medium">
                  {(post.tags || [])[0]}
                </Badge>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-[1.15] tracking-tight mb-5 max-w-3xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                {post.excerpt}
              </p>
            )}

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-card border rounded-full px-4 py-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium leading-tight">{post.author}</p>
                  <p className="text-[10px] text-muted-foreground">Expert Team</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-card border rounded-full px-3 py-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1.5 bg-card border rounded-full px-3 py-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {readTime} min read
              </div>
              <div className="flex items-center gap-1.5 bg-card border rounded-full px-3 py-2 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                {wordCount.toLocaleString()} words
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TWO-COLUMN LAYOUT ===== */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 max-w-6xl mx-auto">

          {/* ===== MAIN CONTENT ===== */}
          <article className="min-w-0" ref={contentRef}>

            {/* Key Takeaways Box */}
            {keyTakeaways.length > 0 && (
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-primary/15">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Key Takeaways</h3>
                    <p className="text-xs text-muted-foreground">What you'll learn from this article</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {keyTakeaways.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-medium mt-0.5">✓</span>
                      <span className="text-sm text-muted-foreground leading-snug">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Introduction label */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Introduction</span>
            </div>

            {/* Article body */}
            <div className="blog-content">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => {
                    headingCounter++;
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    return (
                      <h2 id={id} className="flex items-start gap-3 text-xl sm:text-2xl font-bold mt-14 mb-5 text-foreground tracking-tight first:mt-0 scroll-mt-24">
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center mt-0.5">
                          {headingCounter}
                        </span>
                        <span>{children}</span>
                      </h2>
                    );
                  },
                  h2: ({ children }) => {
                    headingCounter++;
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    return (
                      <h2 id={id} className="flex items-start gap-3 text-xl sm:text-2xl font-bold mt-14 mb-5 text-foreground tracking-tight first:mt-0 scroll-mt-24">
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center mt-0.5">
                          {headingCounter}
                        </span>
                        <span>{children}</span>
                      </h2>
                    );
                  },
                  h3: ({ children }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    return (
                      <h3 id={id} className="text-lg sm:text-xl font-semibold mt-10 mb-3 text-foreground scroll-mt-24">
                        {children}
                      </h3>
                    );
                  },
                  h4: ({ children }) => (
                    <h4 className="text-base font-semibold mt-8 mb-2 text-foreground">{children}</h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-base sm:text-[17px] leading-[1.8] text-muted-foreground mb-6">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2 mb-6 ml-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside pl-6 space-y-2 mb-6 text-muted-foreground text-base leading-relaxed">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-2.5 text-base text-muted-foreground leading-relaxed">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary/50 mt-2.5" />
                      <span>{children}</span>
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/30 bg-primary/5 rounded-r-xl pl-5 pr-5 py-5 my-8 text-foreground/80">
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
                    <a href={href} className="text-primary font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  hr: () => (
                    <div className="my-10 flex items-center justify-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-primary/30 text-sm">✦</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    if (isInline) {
                      return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>;
                    }
                    return (
                      <pre className="bg-muted rounded-xl p-5 overflow-x-auto mb-6 border">
                        <code className="text-sm font-mono text-foreground">{children}</code>
                      </pre>
                    );
                  },
                  img: ({ src, alt }) => (
                    <figure className="my-8">
                      <img src={src} alt={alt || ''} className="w-full rounded-xl shadow-lg border" loading="lazy" />
                      {alt && <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">{alt}</figcaption>}
                    </figure>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {(post.tags || []).length > 0 && (
              <div className="mt-10 pt-8 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(post.tags || []).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs px-3 py-1 rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Card (like DiBull's "Have questions?" section) */}
            <div className="mt-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 sm:p-8 border border-primary/15">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/15 shrink-0 hidden sm:flex">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Have questions about this article?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Talk to Krishna for personalized guidance based on Bhagavad Gita wisdom.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/chat">
                      <Button size="sm" className="gap-2">
                        Talk to Krishna <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Link to="/problems">
                      <Button variant="outline" size="sm">Explore Topics</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Share row */}
            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">Help others discover this insight</p>
              <ShareButtons
                title={post.title}
                text={post.excerpt || post.title}
                url={`https://www.bhagavadgitagyan.com/blog/${post.slug}`}
              />
            </div>
          </article>

          {/* ===== SIDEBAR ===== */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <TableOfContents headings={headings} activeId={activeHeadingId} />
              <AuthorCard author={post.author} />

              {/* Newsletter CTA */}
              <Card className="border-primary/15 bg-gradient-to-b from-primary/5 to-transparent">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">✨</span>
                    <h3 className="font-semibold text-sm">Get Weekly Insights</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Join seekers receiving spiritual wisdom directly in their inbox.
                  </p>
                  <Link to="/contact">
                    <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs">
                      Subscribe Now <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <RelatedArticlesCard currentSlug={slug || ''} />
            </div>
          </aside>
        </div>

        {/* Mobile-only related & author (shown below content on small screens) */}
        <div className="lg:hidden mt-10 space-y-6 max-w-3xl mx-auto">
          <RelatedArticlesCard currentSlug={slug || ''} />
        </div>
      </div>
    </Layout>
  );
}
