import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead, generateBreadcrumbSchema, generateFAQSchema } from '@/components/SEOHead';
import { getProblem, getShloksByProblem } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft, ChevronRight, Sparkles, BookOpen, MessageCircle,
  Lightbulb, ArrowRight, Filter, ChevronUp, Share2, Target, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CANONICAL = 'https://www.bhagavadgitagyan.com';

/* ═══════════════════════════════════════ */
/*              VERSE CARD                */
/* ═══════════════════════════════════════ */
function VerseCard({ shlok, index }: { shlok: any; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/chapters/${shlok.chapter?.chapter_number}/verse/${shlok.verse_number}`}>
        <div className="group relative rounded-2xl overflow-hidden border border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
          {/* Left accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-amber-500 to-orange-500" />

          <div className="p-4 md:p-5 pl-5 md:pl-6">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="border-primary/30 text-primary text-xs font-bold px-2 py-0.5">
                  {shlok.chapter?.chapter_number}.{shlok.verse_number}
                </Badge>
                {shlok.chapter?.title_english && (
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    {shlok.chapter.title_english}
                  </span>
                )}
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* Sanskrit preview */}
            {shlok.sanskrit_text && (
              <p className="text-xs text-muted-foreground/70 line-clamp-1 mb-2 font-serif italic">
                {shlok.sanskrit_text}
              </p>
            )}

            {/* Meaning */}
            <p className="text-sm text-foreground/90 leading-relaxed mb-3 line-clamp-3 group-hover:line-clamp-none transition-all">
              {shlok.english_meaning}
            </p>

            {/* Action items */}
            <div className="flex flex-col gap-1.5">
              {shlok.life_application && (
                <div className="flex items-start gap-2 text-xs">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground line-clamp-1">{shlok.life_application}</span>
                </div>
              )}
              {shlok.practical_action && (
                <div className="flex items-start gap-2 text-xs">
                  <Target className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground line-clamp-1">{shlok.practical_action}</span>
                </div>
              )}
            </div>

            {/* Read more hint */}
            <div className="flex items-center gap-1 text-xs font-bold text-primary mt-3 opacity-0 group-hover:opacity-100 transition-all">
              Read full verse
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════ */
/*           RELATED PROBLEMS             */
/* ═══════════════════════════════════════ */
function RelatedProblems({ currentProblemId }: { currentProblemId: string }) {
  const { data: related } = useQuery({
    queryKey: ['related-problems', currentProblemId],
    queryFn: async () => {
      const { data } = await supabase
        .from('problems')
        .select('name, slug, icon, description_english')
        .neq('id', currentProblemId)
        .order('display_order')
        .limit(4);
      return data || [];
    },
    enabled: !!currentProblemId,
  });

  if (!related?.length) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-amber-500" />
          <h2 className="text-lg md:text-xl font-bold">Related Topics</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {related.map((p: any, i: number) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/problems/${p.slug}`}>
                <div className="group rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-md transition-all h-full">
                  <h3 className="text-sm font-bold group-hover:text-primary transition-colors mb-1 truncate">{p.name}</h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{p.description_english}</p>
                  <span className="text-[10px] text-primary font-bold mt-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════ */
/*              MAIN PAGE                 */
/* ═══════════════════════════════════════ */
export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data: problem, isLoading: problemLoading } = useQuery({
    queryKey: ['problem', slug],
    queryFn: () => getProblem(slug!),
    enabled: !!slug,
  });

  const { data: shloks, isLoading: shloksLoading } = useQuery({
    queryKey: ['problem-shloks', problem?.id],
    queryFn: () => getShloksByProblem(problem!.id),
    enabled: !!problem?.id,
  });

  // Scroll-to-top
  import { useEffect } from 'react';

  const breadcrumbs = [
    { name: 'Home', url: CANONICAL },
    { name: 'Life Problems', url: `${CANONICAL}/problems` },
    { name: problem?.name || slug || '', url: `${CANONICAL}/problems/${slug}` },
  ];

  const faqs = problem ? [
    {
      question: `What does the Bhagavad Gita say about ${problem.name}?`,
      answer: problem.description_english || `The Gita offers profound wisdom on ${problem.name} through multiple verses and practical guidance.`
    },
    {
      question: `How many Gita verses address ${problem.name}?`,
      answer: `There are ${shloks?.length || 'several'} verses directly addressing ${problem.name} with actionable wisdom.`
    },
  ] : [];

  /* ─── Loading ─── */
  if (problemLoading) {
    return (
      <Layout>
        <div className="min-h-screen">
          <div className="h-[45vh] bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-pulse" />
          <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  /* ─── Not Found ─── */
  if (!problem) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold mb-2">Problem not found</h1>
            <p className="text-muted-foreground mb-6">This topic may have been moved or doesn't exist.</p>
            <Link to="/problems">
              <Button className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back to Problems
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={(problem as any).meta_title || `${problem.name} - Bhagavad Gita Wisdom`}
        description={(problem as any).meta_description || problem.description_english || `Find Bhagavad Gita wisdom for ${problem.name}`}
        canonicalUrl={`${CANONICAL}/problems/${slug}`}
        keywords={(problem as any).meta_keywords || ['Bhagavad Gita', problem.name, 'wisdom', 'guidance']}
        structuredData={[
          generateBreadcrumbSchema(breadcrumbs),
          ...(faqs.length ? [generateFAQSchema(faqs)] : []),
        ]}
      />

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden border-b border-border/30">
        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-background to-accent/6" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,hsl(var(--primary)/0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_80%,hsl(var(--accent)/0.08),transparent_50%)]" />
          <div className="absolute top-[10%] right-[15%] w-64 md:w-96 h-64 md:h-96 rounded-full bg-primary/[0.04] blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* ॐ watermark */}
        <div className="absolute right-[-3%] top-[8%] text-[14rem] md:text-[20rem] font-bold text-primary/[0.03] select-none pointer-events-none leading-none hidden lg:block" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ॐ</div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20 relative">
          <div className="max-w-4xl mx-auto">
            {/* Back */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <Link to="/problems">
                <Button variant="ghost" size="sm" className="gap-1.5 mb-5 md:mb-6 hover:bg-primary/10 text-muted-foreground -ml-2">
                  <ChevronLeft className="h-4 w-4" />
                  All Problems
                </Button>
              </Link>
            </motion.div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10">
              {/* Left: Title area */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 text-xs px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Gita Wisdom
                  </Badge>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-4 tracking-tight"
                >
                  <span className="bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent">
                    {problem.name}
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
                >
                  {problem.description_english}
                </motion.p>
              </div>

              {/* Right: Stats pill */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-5 md:gap-6"
              >
                <div className="text-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mb-1.5 shadow-lg">
                    <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                    {shloks?.length || 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Verses</div>
                </div>
                <div className="w-px h-12 bg-border/50 hidden md:block" />
                <Link to={`/chat?q=${encodeURIComponent(`Help me with ${problem.name}`)}`} className="hidden md:block">
                  <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-md text-xs">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Ask Krishna
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Mobile CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-6 flex gap-3 md:hidden"
            >
              <Link to={`/chat?q=${encodeURIComponent(`Help me with ${problem.name}`)}`} className="flex-1">
                <Button className="w-full gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-md text-sm h-11">
                  <MessageCircle className="h-4 w-4" />
                  Ask Krishna
                </Button>
              </Link>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 border-2"
                onClick={() => navigator.share?.({ title: problem.name, url: window.location.href }).catch(() => {})}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ========== GITA'S APPROACH ========== */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] to-accent/[0.04] p-5 md:p-7"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-md">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-bold text-base md:text-lg">The Gita's Approach</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              The Bhagavad Gita addresses {problem.name.toLowerCase()} by teaching us to understand 
              the nature of our mind and emotions. Through self-awareness and right action, 
              we can transform this challenge into a path of growth. The verses below offer 
              timeless wisdom to help you navigate this aspect of life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== VERSES ========== */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Section header */}
          <div className="flex items-center justify-between mb-5 md:mb-7">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 md:h-7 rounded-full bg-gradient-to-b from-primary to-amber-500" />
              <h2 className="text-lg md:text-2xl font-extrabold">
                Relevant Verses
              </h2>
              {shloks && shloks.length > 0 && (
                <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {shloks.length}
                </span>
              )}
            </div>
          </div>

          {/* Verse list */}
          {shloksLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : shloks && shloks.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {shloks.map((shlok, index) => (
                <VerseCard key={shlok.id} shlok={shlok} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-border/50 bg-card p-8 md:p-12 text-center"
            >
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-lg font-bold mb-2">More Wisdom Coming Soon</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                We're still adding verses for this topic. Try asking Krishna AI for personalized guidance!
              </p>
              <Link to={`/chat?q=${encodeURIComponent(`Help me with ${problem.name}`)}`}>
                <Button className="gap-2 bg-gradient-to-r from-primary to-amber-500 shadow-md">
                  <MessageCircle className="h-4 w-4" />
                  Talk to Krishna
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* ========== FAQ (SEO) ========== */}
      {faqs.length > 0 && (
        <section className="py-8 md:py-12 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
              <h2 className="text-lg md:text-xl font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border/50 bg-card p-4 md:p-5"
                >
                  <h3 className="font-bold text-sm md:text-base mb-1.5">{faq.question}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== RELATED TOPICS ========== */}
      <RelatedProblems currentProblemId={problem.id} />

      {/* ========== CTA ========== */}
      <section className="py-10 md:py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-card to-accent/[0.04] p-6 md:p-10 text-center"
          >
            <div className="text-3xl md:text-4xl mb-3">🙏</div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Need Personalized Guidance?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md mx-auto">
              Describe your specific situation and get tailored wisdom from the Bhagavad Gita.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={`/chat?q=${encodeURIComponent(`Help me with ${problem.name}`)}`}>
                <Button className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg">
                  <MessageCircle className="h-4 w-4" />
                  Talk to Krishna
                </Button>
              </Link>
              <Link to="/problems">
                <Button variant="outline" className="w-full sm:w-auto gap-2 border-2">
                  <BookOpen className="h-4 w-4" />
                  Explore Other Topics
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </Layout>
  );
}
