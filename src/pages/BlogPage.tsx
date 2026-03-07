import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, ArrowRight, Clock, Search, Sparkles, TrendingUp, Users } from 'lucide-react';
import { BlogCoverGraphic } from '@/components/blog/BlogCoverGraphic';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function estimateWordCount(content: string) {
  return content.trim().split(/\s+/).length;
}

// Unique gradient for each tag
const tagGradients: Record<string, string> = {
  'Karma Yoga': 'from-amber-500/15 to-orange-500/10',
  'Spirituality': 'from-violet-500/15 to-purple-500/10',
  'Dharma': 'from-emerald-500/15 to-teal-500/10',
  'Anxiety': 'from-blue-500/15 to-cyan-500/10',
  'Meditation': 'from-indigo-500/15 to-blue-500/10',
  'Detachment': 'from-rose-500/15 to-pink-500/10',
  'Mental Health': 'from-teal-500/15 to-green-500/10',
  'Self-improvement': 'from-yellow-500/15 to-amber-500/10',
};

function getTagGradient(tag: string) {
  return tagGradients[tag] || 'from-primary/15 to-primary/5';
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

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

  // Extract all unique tags
  const allTags = useMemo(() => {
    if (!posts) return [];
    const tags = new Set<string>();
    posts.forEach(p => (p.tags || []).forEach((t: string) => tags.add(t)));
    return Array.from(tags).slice(0, 8);
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let result = posts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q) ||
        (p.tags || []).some((t: string) => t.toLowerCase().includes(q))
      );
    }
    if (activeTag) {
      result = result.filter(p => (p.tags || []).includes(activeTag));
    }
    return result;
  }, [posts, searchQuery, activeTag]);

  const featuredPost = filteredPosts?.[0];
  const restPosts = filteredPosts?.slice(1);
  const totalArticles = posts?.length || 0;
  const totalWords = posts?.reduce((acc, p) => acc + estimateWordCount(p.content), 0) || 0;

  return (
    <Layout>
      <SEOHead
        title="Blog - Bhagavad Gita Insights"
        description="Deep insights and commentary on Bhagavad Gita teachings. Explore articles on anxiety, purpose, karma, and applying ancient wisdom to modern life."
        keywords={['Bhagavad Gita blog', 'spiritual insights', 'wisdom articles', 'Gita commentary']}
      />

      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        {/* Decorative elements */}
        <div className="absolute top-6 right-10 text-[140px] leading-none text-primary/[0.03] font-serif select-none pointer-events-none hidden lg:block">ॐ</div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-primary/3 blur-2xl hidden md:block" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 sm:pb-12">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Wisdom Blog
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                Insights & Commentary
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-8">
                Deep dives into Bhagavad Gita teachings and their relevance to modern life challenges.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-lg mx-auto relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/60" />
              <Input
                type="search"
                placeholder="Search articles by topic, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 h-12 rounded-full border-border/60 bg-card/80 backdrop-blur-sm shadow-sm text-sm focus-visible:ring-primary/30"
              />
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary/60" />
                <span><strong className="text-foreground">{totalArticles}</strong> Articles</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary/60" />
                <span><strong className="text-foreground">{Math.round(totalWords / 1000)}k+</strong> Words</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
              <div className="items-center gap-1.5 hidden sm:flex">
                <Users className="h-4 w-4 text-primary/60" />
                <span>Expert Authors</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== TAG FILTERS ===== */}
      {allTags.length > 0 && (
        <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-16 z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTag(null)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  !activeTag
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                All Posts
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeTag === tag
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-72 animate-pulse rounded-2xl bg-muted" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-10">

              {/* ===== FEATURED POST ===== */}
              {featuredPost && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link to={`/blog/${featuredPost.slug}`} className="block group">
                    <Card className="overflow-hidden border-primary/15 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                      <CardContent className="p-0">
                        <div className="grid md:grid-cols-[1fr_1.2fr]">
                          {/* Left: Visual */}
                          <div className="relative min-h-[240px] overflow-hidden">
                            <BlogCoverGraphic slug={featuredPost.slug} variant="card" className="absolute inset-0" />
                            <div className="relative z-10 p-8 sm:p-10 flex flex-col justify-between h-full">
                              <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 w-fit">
                                ✦ Latest
                              </Badge>
                              <div className="flex flex-wrap gap-2 mt-auto">
                                {(featuredPost.tags || []).slice(0, 3).map((tag: string) => (
                                  <Badge key={tag} variant="outline" className="text-[10px] border-foreground/10 text-foreground/60 bg-card/30 backdrop-blur-sm">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right: Content */}
                          <div className="p-7 sm:p-9 flex flex-col justify-center">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
                              {featuredPost.title}
                            </h2>
                            {featuredPost.excerpt && (
                              <p className="text-muted-foreground text-base mb-6 line-clamp-3 leading-relaxed">
                                {featuredPost.excerpt}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <BookOpen className="h-3 w-3 text-primary" />
                                </div>
                                {featuredPost.author}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(featuredPost.created_at), 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {estimateReadTime(featuredPost.content)} min read
                              </span>
                              <span className="ml-auto text-primary text-sm font-medium items-center gap-1 hidden sm:flex group-hover:gap-2 transition-all">
                                Read Article <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )}

              {/* ===== POST GRID ===== */}
              {restPosts && restPosts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <div className="w-1 h-5 bg-primary rounded-full" />
                      More Articles
                    </h2>
                    <span className="text-xs text-muted-foreground">{filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {restPosts.map((post: any, idx: number) => {
                      const readTime = estimateReadTime(post.content);
                      const primaryTag = (post.tags || [])[0] || '';
                      return (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08, duration: 0.4 }}
                        >
                          <Link to={`/blog/${post.slug}`} className="block group h-full">
                            <Card className="h-full overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                              {/* Color accent top bar */}
                              <div className={`h-1.5 bg-gradient-to-r ${getTagGradient(primaryTag)}`} />

                              <CardContent className="p-5 sm:p-6 flex flex-col flex-1">
                                {/* Tags */}
                                <div className="flex items-center gap-1.5 mb-3">
                                  {(post.tags || []).slice(0, 2).map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] bg-primary/8 text-primary font-normal px-2 py-0.5">
                                      {tag}
                                    </Badge>
                                  ))}
                                  <span className="ml-auto text-[10px] text-muted-foreground/60">{readTime} min</span>
                                </div>

                                {/* Title */}
                                <h2 className="text-base sm:text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                  {post.title}
                                </h2>

                                {/* Excerpt */}
                                {post.excerpt && (
                                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">{post.excerpt}</p>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                      <BookOpen className="h-3 w-3 text-primary/70" />
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-medium leading-tight">{post.author}</p>
                                      <p className="text-[10px] text-muted-foreground">{format(new Date(post.created_at), 'MMM d, yyyy')}</p>
                                    </div>
                                  </div>
                                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              {searchQuery || activeTag ? (
                <>
                  <div className="text-5xl mb-4">🔍</div>
                  <h2 className="text-xl font-bold mb-2">No articles found</h2>
                  <p className="text-muted-foreground mb-4">Try a different search term or filter.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveTag(null); }}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <Card className="border-dashed max-w-md mx-auto">
                  <CardContent className="p-12 sm:p-16 text-center">
                    <div className="text-5xl mb-4">📖</div>
                    <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                    <p className="text-muted-foreground">
                      We're preparing insightful articles on Bhagavad Gita wisdom. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== BOTTOM CTA ===== */}
      <div className="border-t border-border/50 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="max-w-lg mx-auto">
            <div className="p-3 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Need Personalized Guidance?</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Ask Krishna any question about life, relationships, career, or spirituality and get wisdom rooted in the Bhagavad Gita.
            </p>
            <Link to="/chat">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                Talk to Krishna <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
