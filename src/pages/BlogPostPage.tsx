import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead, generateBlogPostSchema, generateBreadcrumbSchema } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChevronLeft, Calendar, User, Clock, BookOpen, Tag,
  ArrowRight, MessageCircle, Eye, ListOrdered, Share2,
  Heart, ExternalLink, Bookmark, Sparkles, CheckCircle2,
  ChevronUp, Link2, ThumbsUp, Smile, Flame, Brain,
  ChevronDown, Minus, Plus, Printer, Copy, Check
} from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { ShareButtons } from '@/components/ui/share-buttons';
import { BlogCoverGraphic } from '@/components/blog/BlogCoverGraphic';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Utilities ───────────────────────────────────────────

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

// ─── Reading Progress Bar with Time Remaining ────────────

function ReadingProgressBar({ readTime }: { readTime: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const minutesLeft = Math.max(0, Math.ceil(readTime * (1 - progress / 100)));

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-muted/50">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      {progress > 5 && progress < 95 && (
        <div className="absolute right-4 top-2 bg-card/95 backdrop-blur-sm border border-border/60 rounded-full px-3 py-1 text-[11px] text-muted-foreground shadow-sm hidden sm:block">
          {minutesLeft} min left
        </div>
      )}
    </div>
  );
}

// ─── Back to Top Button ──────────────────────────────────

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 right-6 z-40 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      aria-label="Back to top"
    >
      <ChevronUp className="h-5 w-5" />
    </motion.button>
  );
}

// ─── Floating Social Bar ─────────────────────────────────

function FloatingSocialBar({ title, url }: { title: string; url: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shareLinks = [
    { icon: '𝕏', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, label: 'Twitter' },
    { icon: 'f', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, label: 'Facebook' },
    { icon: 'in', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, label: 'LinkedIn' },
  ];

  if (!visible) return null;

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2">
      {shareLinks.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-md transition-all"
          title={`Share on ${s.label}`}
        >
          {s.icon}
        </a>
      ))}
      <button
        onClick={async () => {
          await navigator.clipboard?.writeText(url);
          setCopied(true);
          toast.success('Link copied!');
          setTimeout(() => setCopied(false), 2000);
        }}
        className="w-10 h-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-md transition-all"
        title="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ─── Mobile Sticky ToC ───────────────────────────────────

function MobileTableOfContents({ headings, activeId }: { headings: { text: string; id: string; level: number }[]; activeId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (headings.length === 0) return null;

  const activeIdx = headings.findIndex(h => h.id === activeId);
  const activeText = activeIdx >= 0 ? headings[activeIdx].text : 'Table of Contents';

  return (
    <div className="lg:hidden sticky top-1 z-30 mx-4 mb-6">
      <div className="bg-card/95 backdrop-blur-md border border-border/60 rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded-md bg-primary/10 shrink-0">
              <ListOrdered className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium truncate text-muted-foreground">{activeText}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{activeIdx + 1}/{headings.length}</Badge>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <nav className="px-3 pb-3 max-h-60 overflow-y-auto space-y-0.5 border-t border-border/40 pt-2">
                {headings.map((h, idx) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-xs transition-all ${
                      activeId === h.id
                        ? 'text-primary font-semibold bg-primary/5'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span className={`shrink-0 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded ${
                      activeId === h.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="truncate">{h.text}</span>
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sidebar Table of Contents ───────────────────────────

function TableOfContents({ headings, activeId }: { headings: { text: string; id: string; level: number }[]; activeId: string }) {
  if (headings.length === 0) return null;
  const activeIdx = headings.findIndex(h => h.id === activeId);

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <ListOrdered className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-bold text-sm">Contents</h3>
          </div>
          {activeIdx >= 0 && (
            <Badge variant="secondary" className="text-[10px]">{activeIdx + 1}/{headings.length}</Badge>
          )}
        </div>
        {/* Progress indicator */}
        <div className="h-1 bg-muted rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-primary/50 rounded-full transition-all duration-300"
            style={{ width: `${headings.length > 0 ? ((activeIdx + 1) / headings.length) * 100 : 0}%` }}
          />
        </div>
        <nav className="space-y-0.5">
          {headings.map((h, idx) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`flex items-start gap-2.5 py-2 px-2.5 rounded-lg text-[13px] transition-all hover:bg-primary/5 ${
                activeId === h.id
                  ? 'text-primary font-semibold bg-primary/5'
                  : idx <= activeIdx ? 'text-foreground/70' : 'text-muted-foreground'
              }`}
            >
              <span className={`shrink-0 text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-md transition-colors ${
                activeId === h.id ? 'bg-primary text-primary-foreground' : idx <= activeIdx ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {idx <= activeIdx && idx !== activeIdx ? '✓' : idx + 1}
              </span>
              <span className="leading-snug line-clamp-2">{h.text}</span>
            </a>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}

// ─── Text Size Controls ──────────────────────────────────

function TextSizeControls({ size, onChange }: { size: number; onChange: (s: number) => void }) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardContent className="p-4 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Text Size</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(Math.max(14, size - 1))}
            className="w-7 h-7 rounded-md border border-border hover:bg-muted flex items-center justify-center transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-xs font-mono w-7 text-center">{size}</span>
          <button
            onClick={() => onChange(Math.min(22, size + 1))}
            className="w-7 h-7 rounded-md border border-border hover:bg-muted flex items-center justify-center transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Emoji Reactions ─────────────────────────────────────

function ArticleReactions() {
  const [reacted, setReacted] = useState<string | null>(null);
  const reactions = [
    { emoji: '🙏', label: 'Grateful', icon: ThumbsUp },
    { emoji: '💡', label: 'Enlightening', icon: Brain },
    { emoji: '❤️', label: 'Loved it', icon: Heart },
    { emoji: '🔥', label: 'Inspiring', icon: Flame },
    { emoji: '😊', label: 'Peaceful', icon: Smile },
  ];

  return (
    <div className="mt-10 pt-8 border-t border-border/60">
      <div className="text-center">
        <p className="text-sm font-semibold mb-1">How did this article make you feel?</p>
        <p className="text-xs text-muted-foreground mb-5">Your feedback helps us create better content</p>
        <div className="flex items-center justify-center gap-3">
          {reactions.map((r) => (
            <button
              key={r.label}
              onClick={() => {
                setReacted(r.label);
                toast.success(`Thank you for your feedback! ${r.emoji}`);
              }}
              className={`group flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                reacted === r.label
                  ? 'bg-primary/10 scale-110 ring-2 ring-primary/20'
                  : reacted
                  ? 'opacity-50 hover:opacity-80'
                  : 'hover:bg-muted hover:scale-105'
              }`}
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">{r.emoji}</span>
              <span className="text-[10px] text-muted-foreground font-medium">{r.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Author Card ─────────────────────────────────────────

function AuthorCard({ author }: { author: string }) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardContent className="p-5 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3 ring-2 ring-primary/10">
          <User className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-bold text-sm">{author}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Spiritual Wisdom Experts</p>
        <div className="flex items-center justify-center gap-0.5 mt-2.5">
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className="text-amber-400 text-sm">★</span>
          ))}
          <span className="text-xs text-muted-foreground ml-1.5 font-medium">4.9/5</span>
        </div>
        <Link to="/contact">
          <Button variant="outline" size="sm" className="w-full mt-3 text-xs gap-1.5 rounded-full">
            About Our Team
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── Content Score Card ──────────────────────────────────

function ContentScoreCard({ wordCount, readTime }: { wordCount: number; readTime: number }) {
  const depthScore = wordCount > 2000 ? 'Excellent' : wordCount > 1000 ? 'Good' : 'Brief';
  const depthColor = wordCount > 2000 ? 'text-green-600' : wordCount > 1000 ? 'text-primary' : 'text-amber-600';

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
          <div className="p-1.5 rounded-lg bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Article Quality</h3>
            <p className="text-[11px] text-muted-foreground">Content analysis</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Word Count', value: wordCount.toLocaleString(), color: 'text-foreground' },
            { label: 'Reading Time', value: `${readTime} min`, color: 'text-foreground' },
            { label: 'Content Depth', value: depthScore, color: `${depthColor} font-semibold` },
            { label: 'Wisdom Score', value: 'Verified ✓', color: 'text-green-600 font-semibold' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                <span className="text-muted-foreground text-xs">{item.label}</span>
              </div>
              <span className={`text-xs font-medium ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Need Help CTA Card ──────────────────────────────────

function NeedHelpCard() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-card shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-x-4 -translate-y-4 blur-2xl" />
      <CardContent className="p-5 relative">
        <div className="p-2.5 rounded-xl bg-primary/15 w-fit mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-bold text-sm mb-1">Need Guidance?</h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Get personalized wisdom from Krishna based on Bhagavad Gita teachings.
        </p>
        <Link to="/chat">
          <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs rounded-full border-primary/20 hover:bg-primary/10">
            Talk to Krishna <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── Related Articles Card ───────────────────────────────

function RelatedArticlesCard({ currentSlug }: { currentSlug: string }) {
  const { data: related } = useQuery({
    queryKey: ['blog-related', currentSlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('title, slug, tags, created_at, content')
        .eq('published', true)
        .neq('slug', currentSlug)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  if (!related || related.length === 0) return null;

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Related Articles</h3>
            <p className="text-[11px] text-muted-foreground">Continue your learning</p>
          </div>
        </div>
        <div className="space-y-2">
          {related.map((r: any) => {
            const rt = r.content ? estimateReadTime(r.content) : 5;
            return (
              <Link
                key={r.slug}
                to={`/blog/${r.slug}`}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-primary/5 transition-colors group"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <BookOpen className="h-4 w-4 text-primary/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">{r.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {rt} min
                    </span>
                    {r.tags?.[0] && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{r.tags[0]}</Badge>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary shrink-0 mt-1 transition-colors" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Cover Image Section ─────────────────────────────────

function CoverImageSection({ coverImage, readTime, tags, slug }: { coverImage?: string | null; readTime: number; tags: string[]; slug: string }) {
  if (!coverImage) {
    return (
      <div className="relative mb-8">
        <BlogCoverGraphic slug={slug} variant="hero" />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20">
          <Badge className="bg-primary text-primary-foreground border-0 shadow-md gap-1.5 text-xs px-3 py-1">
            <Sparkles className="h-3 w-3" /> Expert Analysis
          </Badge>
          <Badge className="bg-card/90 backdrop-blur-sm text-foreground border-0 shadow-md gap-1.5 text-xs px-3 py-1">
            <Clock className="h-3 w-3" /> {readTime} min read
          </Badge>
          {tags[0] && (
            <Badge className="bg-card/90 backdrop-blur-sm text-foreground border-0 shadow-md gap-1.5 text-xs px-3 py-1">
              <BookOpen className="h-3 w-3" /> {tags[0]}
            </Badge>
          )}
        </div>
        <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground border-0 shadow-md text-[11px] z-20">
          ✦ Premium
        </Badge>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg mb-8 group">
      <img src={coverImage} alt="" className="w-full aspect-[16/7] object-cover group-hover:scale-[1.02] transition-transform duration-700" loading="eager" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <Badge className="bg-primary text-primary-foreground border-0 shadow-md gap-1.5 text-xs px-3 py-1">
          <Sparkles className="h-3 w-3" /> Expert Analysis
        </Badge>
        <Badge className="bg-white/90 backdrop-blur-sm text-foreground border-0 shadow-md gap-1.5 text-xs px-3 py-1">
          <Clock className="h-3 w-3" /> {readTime} min read
        </Badge>
      </div>
      <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground border-0 shadow-md text-[11px]">
        ✦ Premium
      </Badge>
    </div>
  );
}

// ─── Recommended Reading ─────────────────────────────────

function RecommendedReading({ currentSlug }: { currentSlug: string }) {
  const { data: posts } = useQuery({
    queryKey: ['blog-recommended', currentSlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('title, slug, tags, created_at, excerpt, content')
        .eq('published', true)
        .neq('slug', currentSlug)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  if (!posts || posts.length === 0) return null;

  return (
    <div className="border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-0 text-xs mb-3">
            <BookOpen className="h-3 w-3 mr-1" /> Continue Reading
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold">More Spiritual Insights</h2>
          <p className="text-sm text-muted-foreground mt-2">Explore more articles on ancient wisdom and modern life</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {posts.map((p: any) => {
            const rt = p.content ? estimateReadTime(p.content) : 5;
            return (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="group">
                <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <BlogCoverGraphic slug={p.slug} variant="card" className="absolute inset-0" />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2.5">
                      {p.tags?.[0] && (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">{p.tags[0]}</Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {rt} min
                      </span>
                    </div>
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                    )}
                    <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Read article <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Related Topics ──────────────────────────────────────

function RelatedTopics() {
  const topics = [
    { icon: '🕉️', title: 'Karma Yoga', desc: 'Action without attachment', link: '/problems' },
    { icon: '🧘', title: 'Meditation', desc: 'Inner peace through practice', link: '/chapters' },
    { icon: '📖', title: 'Gita Wisdom', desc: 'Ancient texts, modern life', link: '/chat' },
  ];

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
          <div className="p-1.5 rounded-lg bg-accent">
            <Bookmark className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Related Topics</h3>
            <p className="text-[11px] text-muted-foreground">Explore our spiritual resources</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {topics.map((t) => (
            <Link key={t.title} to={t.link} className="text-center group p-3 rounded-xl hover:bg-primary/5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 text-lg group-hover:scale-110 transition-transform">
                {t.icon}
              </div>
              <p className="text-xs font-semibold group-hover:text-primary transition-colors">{t.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Authority Resources ─────────────────────────────────

function AuthorityResources() {
  const resources = [
    { title: 'Bhagavad Gita - Wikipedia', url: 'https://en.wikipedia.org/wiki/Bhagavad_Gita' },
    { title: 'Sacred Texts - Bhagavad Gita', url: 'https://www.sacred-texts.com/hin/gita/' },
  ];

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
          <div className="p-1.5 rounded-lg bg-accent">
            <ExternalLink className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Authority Resources</h3>
            <p className="text-[11px] text-muted-foreground">Trusted sources for deeper learning</p>
          </div>
        </div>
        <div className="space-y-2">
          {resources.map((r) => (
            <a
              key={r.title}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium group-hover:text-primary transition-colors truncate">{r.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{r.url}</p>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Heading with Copy Anchor ────────────────────────────

function HeadingWithAnchor({ id, counter, children }: { id: string; counter: number; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    toast.success('Section link copied!');
    setTimeout(() => setCopied(false), 2000);
  }, [id]);

  return (
    <h2 id={id} className="group flex items-start gap-3 text-xl sm:text-2xl font-bold mt-14 mb-5 text-foreground tracking-tight first:mt-0 scroll-mt-24">
      <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center mt-0.5">
        {counter}
      </span>
      <span className="flex-1">{children}</span>
      <button
        onClick={handleCopyLink}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 p-1 rounded-md hover:bg-muted"
        title="Copy link to section"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4 text-muted-foreground" />}
      </button>
    </h2>
  );
}

// ═════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ─────────────────────────────────────
// ═════════════════════════════════════════════════════════

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [textSize, setTextSize] = useState(17);
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

  // Intersection observer for active heading
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
  const shareUrl = `https://www.bhagavadgitagyan.com/blog/${post.slug}`;
  let headingCounter = 0;

  return (
    <Layout>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || post.title}
        keywords={post.meta_keywords || post.tags || []}
        type="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at}
        author={post.author}
        structuredData={[
          generateBlogPostSchema(post),
          generateBreadcrumbSchema([
            { name: 'Home', url: 'https://www.bhagavadgitagyan.com/' },
            { name: 'Blog', url: 'https://www.bhagavadgitagyan.com/blog' },
            { name: post.title, url: `https://www.bhagavadgitagyan.com/blog/${post.slug}` },
          ]),
        ]}
      />

      <ReadingProgressBar readTime={readTime} />
      <FloatingSocialBar title={post.title} url={shareUrl} />
      <BackToTopButton />

      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/8 via-primary/4 to-background">
        <div className="absolute top-8 right-8 text-[140px] leading-none text-primary/[0.03] font-serif select-none pointer-events-none hidden xl:block">ॐ</div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 sm:pt-8 sm:pb-10">
          <div className="max-w-4xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-muted-foreground/40">›</span>
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <span className="text-muted-foreground/40">›</span>
              <span className="text-foreground/70 truncate max-w-[200px]">{(post.tags || [])[0] || 'Article'}</span>
            </nav>

            {/* Category badge */}
            {(post.tags || []).length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 rounded-md bg-primary/10">
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
              <div className="flex items-center gap-2 bg-card border border-border/60 rounded-full px-4 py-2 shadow-sm">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium leading-tight">{post.author}</p>
                  <p className="text-[10px] text-muted-foreground">Expert Team</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-3 py-2 text-xs text-muted-foreground shadow-sm">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-3 py-2 text-xs text-muted-foreground shadow-sm">
                <Clock className="h-3.5 w-3.5" />
                {readTime} min read
              </div>
              <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-3 py-2 text-xs text-muted-foreground shadow-sm">
                <Eye className="h-3.5 w-3.5" />
                {wordCount.toLocaleString()} words
              </div>
              {/* Print button */}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-3 py-2 text-xs text-muted-foreground shadow-sm hover:text-primary hover:border-primary/30 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE STICKY TOC ===== */}
      <MobileTableOfContents headings={headings} activeId={activeHeadingId} />

      {/* ===== TWO-COLUMN LAYOUT ===== */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 max-w-6xl mx-auto">

          {/* ===== MAIN CONTENT ===== */}
          <article className="min-w-0" ref={contentRef}>

            {/* Cover Image */}
            <CoverImageSection coverImage={post.cover_image} readTime={readTime} tags={post.tags || []} slug={post.slug} />

            {/* Key Takeaways */}
            {keyTakeaways.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-primary/5 border border-primary/15 rounded-2xl p-6 mb-10"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-primary/15">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Key Takeaways</h3>
                    <p className="text-[11px] text-muted-foreground">What you'll learn from this article</p>
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
              </motion.div>
            )}

            {/* Introduction label */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Introduction</span>
            </div>

            {/* Article body with dynamic text size */}
            <div className="blog-content" style={{ '--blog-text-size': `${textSize}px` } as React.CSSProperties}>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => {
                    headingCounter++;
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    return <HeadingWithAnchor id={id} counter={headingCounter}>{children}</HeadingWithAnchor>;
                  },
                  h2: ({ children }) => {
                    headingCounter++;
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    return <HeadingWithAnchor id={id} counter={headingCounter}>{children}</HeadingWithAnchor>;
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
                  p: ({ children, node }) => {
                    // Drop cap for first paragraph
                    const isFirst = node && contentRef.current && !contentRef.current.querySelector('.drop-cap-applied');
                    if (isFirst && typeof children === 'string' && children.length > 50) {
                      return (
                        <p className="drop-cap-applied text-muted-foreground mb-6 leading-[1.85]" style={{ fontSize: 'var(--blog-text-size, 17px)' }}>
                          <span className="float-left text-5xl font-bold text-primary leading-[0.8] mr-2 mt-1.5 font-serif">{children.charAt(0)}</span>
                          {children.slice(1)}
                        </p>
                      );
                    }
                    return (
                      <p className="text-muted-foreground mb-6 leading-[1.85]" style={{ fontSize: 'var(--blog-text-size, 17px)' }}>
                        {children}
                      </p>
                    );
                  },
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
                    <blockquote className="relative border-l-4 border-primary/30 bg-primary/5 rounded-r-xl pl-8 pr-5 py-5 my-8 text-foreground/80">
                      <span className="absolute left-3 top-3 text-3xl text-primary/20 font-serif leading-none select-none">"</span>
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
              <div className="mt-10 pt-8 border-t border-border/60">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(post.tags || []).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs px-3 py-1 rounded-full hover:bg-primary/5 transition-colors cursor-default">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Emoji Reactions */}
            <ArticleReactions />

            {/* CTA Card */}
            <div className="mt-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 sm:p-8 border border-primary/15">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/15 shrink-0 hidden sm:flex">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Have questions about this article?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our team of spiritual wisdom experts is here to help you apply these teachings in your life.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/chat">
                      <Button size="sm" className="gap-2 rounded-full">
                        Talk to Krishna <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Link to="/problems">
                      <Button variant="outline" size="sm" className="rounded-full">Explore Topics</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Share row */}
            <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">Help others discover this insight</p>
              <ShareButtons
                title={post.title}
                text={post.excerpt || post.title}
                url={shareUrl}
              />
            </div>

            {/* Related Topics (mobile-visible) */}
            <div className="mt-10">
              <RelatedTopics />
            </div>

            {/* Authority Resources (mobile-visible) */}
            <div className="mt-6">
              <AuthorityResources />
            </div>
          </article>

          {/* ===== SIDEBAR ===== */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <TextSizeControls size={textSize} onChange={setTextSize} />
              <TableOfContents headings={headings} activeId={activeHeadingId} />
              <AuthorCard author={post.author} />

              {/* Newsletter CTA */}
              <Card className="border-primary/15 bg-gradient-to-b from-primary/8 to-card shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl" />
                <CardContent className="p-5 relative">
                  <div className="p-2 rounded-xl bg-primary/15 w-fit mb-3">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm">Get Weekly Insights</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-3 leading-relaxed">
                    Join seekers receiving spiritual wisdom directly in their inbox.
                  </p>
                  <Link to="/contact">
                    <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs rounded-full border-primary/20">
                      Subscribe Now <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <ContentScoreCard wordCount={wordCount} readTime={readTime} />
              <NeedHelpCard />
              <RelatedArticlesCard currentSlug={slug || ''} />
            </div>
          </aside>
        </div>

        {/* Mobile-only related & author */}
        <div className="lg:hidden mt-10 space-y-6 max-w-3xl mx-auto">
          <RelatedArticlesCard currentSlug={slug || ''} />
        </div>
      </div>

      {/* Full-width Recommended Reading */}
      <RecommendedReading currentSlug={slug || ''} />
    </Layout>
  );
}
