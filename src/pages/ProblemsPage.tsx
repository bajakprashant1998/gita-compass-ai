import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, Shield, HelpCircle, Crown, Heart, User, Flame, GitBranch,
  LucideIcon, BookOpen, Sparkles, ArrowRight, Zap, Target,
  TrendingUp, Search, MessageCircle, LayoutGrid, List, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProblemMatcher } from '@/components/problems/ProblemMatcher';
import { EmotionCloud } from '@/components/problems/EmotionCloud';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, LucideIcon> = {
  Brain, Shield, HelpCircle, Crown, Heart, User, Flame, GitBranch,
};

const colorMap: Record<string, { gradient: string; glow: string; bg: string }> = {
  amber: { gradient: 'from-amber-500 to-orange-500', glow: 'group-hover:shadow-amber-500/20', bg: 'bg-amber-500/10' },
  red: { gradient: 'from-red-500 to-rose-500', glow: 'group-hover:shadow-red-500/20', bg: 'bg-red-500/10' },
  blue: { gradient: 'from-blue-500 to-indigo-500', glow: 'group-hover:shadow-blue-500/20', bg: 'bg-blue-500/10' },
  purple: { gradient: 'from-purple-500 to-violet-500', glow: 'group-hover:shadow-purple-500/20', bg: 'bg-purple-500/10' },
  pink: { gradient: 'from-pink-500 to-rose-500', glow: 'group-hover:shadow-pink-500/20', bg: 'bg-pink-500/10' },
  teal: { gradient: 'from-teal-500 to-cyan-500', glow: 'group-hover:shadow-teal-500/20', bg: 'bg-teal-500/10' },
  orange: { gradient: 'from-orange-500 to-amber-500', glow: 'group-hover:shadow-orange-500/20', bg: 'bg-orange-500/10' },
  green: { gradient: 'from-green-500 to-emerald-500', glow: 'group-hover:shadow-green-500/20', bg: 'bg-green-500/10' },
};

const categoryFilters = [
  { label: 'All', value: '' },
  { label: 'Mental Health', value: 'mental' },
  { label: 'Relationships', value: 'relationships' },
  { label: 'Career', value: 'career' },
  { label: 'Spiritual', value: 'spiritual' },
];

async function getProblemsWithCounts() {
  const { data, error } = await supabase
    .from('problems')
    .select('*, shlok_problems(count)')
    .order('display_order');

  if (error) throw error;

  return (data || []).map((p: any) => {
    let count = 0;
    if (Array.isArray(p.shlok_problems) && p.shlok_problems.length > 0) {
      count = p.shlok_problems[0]?.count ?? 0;
    } else if (p.shlok_problems && typeof p.shlok_problems === 'object') {
      count = p.shlok_problems.count ?? 0;
    }
    return { ...p, verseCount: count };
  });
}

function useAnimatedCounter(end: number, startCounting: boolean, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting || end === 0) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration, startCounting]);
  return count;
}

/* ═══════════════════════════════════════ */
/*              PROBLEM CARD              */
/* ═══════════════════════════════════════ */
function ProblemCard({ problem, index, isTrending, viewMode }: {
  problem: any;
  index: number;
  isTrending: boolean;
  viewMode: 'grid' | 'list';
}) {
  const Icon = iconMap[problem.icon || 'HelpCircle'] || HelpCircle;
  const colors = colorMap[problem.color || 'blue'] || colorMap.blue;

  if (viewMode === 'list') {
    return (
      <Link to={`/problems/${problem.slug}`} className="block">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.35 }}
          className={cn(
            "group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card",
            "hover:border-primary/30 hover:shadow-lg transition-all duration-200",
            colors.glow
          )}
        >
          <div className={cn(
            "w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br text-white shadow-md group-hover:scale-105 transition-transform",
            colors.gradient
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm group-hover:text-primary transition-colors truncate">{problem.name}</h3>
              {isTrending && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white uppercase tracking-wider flex-shrink-0">
                  Hot
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{problem.description_english}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-bold text-foreground">{problem.verseCount}</span>
            <span className="text-xs text-muted-foreground">verses</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/problems/${problem.slug}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.4 }}
        className={cn(
          "group h-full relative rounded-2xl overflow-hidden border border-border/50 bg-card transition-all duration-300",
          "hover:border-primary/30 hover:shadow-xl hover:-translate-y-1.5",
          colors.glow
        )}
      >
        {/* Top gradient bar */}
        <div className={cn("h-1 bg-gradient-to-r", colors.gradient)} />

        {/* Background watermark */}
        <div className="absolute -right-3 -bottom-3 text-7xl font-extrabold text-primary/[0.03] select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">
          {index + 1}
        </div>

        <div className="relative p-5">
          <div className="flex items-start gap-3.5 mb-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
              `bg-gradient-to-br ${colors.gradient} text-white shadow-md`
            )}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-base font-bold group-hover:text-primary transition-colors truncate">
                  {problem.name}
                </h3>
                {isTrending && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white uppercase tracking-wider flex-shrink-0">
                    Hot
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {problem.description_english}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">{problem.verseCount}</span>
              <span className="text-xs text-muted-foreground">verses</span>
              {/* Mini progress */}
              <div className="w-12 h-1 rounded-full bg-muted overflow-hidden ml-1">
                <div 
                  className={cn("h-full rounded-full bg-gradient-to-r", colors.gradient)}
                  style={{ width: `${Math.min((problem.verseCount / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-all">
              Explore
              <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ═══════════════════════════════════════ */
/*            TOP PROBLEM CARD            */
/* ═══════════════════════════════════════ */
function TopProblemCard({ problem, rank }: { problem: any; rank: number }) {
  const Icon = iconMap[problem.icon || 'HelpCircle'] || HelpCircle;
  const colors = colorMap[problem.color || 'blue'] || colorMap.blue;
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <Link to={`/problems/${problem.slug}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank * 0.1, duration: 0.45 }}
        className="group relative rounded-2xl overflow-hidden border border-border/50 bg-card hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full"
      >
        <div className={cn("h-1.5 bg-gradient-to-r", colors.gradient)} />
        <div className="p-5 md:p-6 text-center">
          <div className="absolute top-4 right-4">
            <span className="text-lg">{medals[rank]}</span>
          </div>
          <div className={cn(
            "w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
            colors.gradient
          )}>
            <Icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-1.5 group-hover:text-primary transition-colors">{problem.name}</h3>
          <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{problem.description_english}</p>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            {problem.verseCount} verses
            <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ═══════════════════════════════════════ */
/*              MAIN PAGE                 */
/* ═══════════════════════════════════════ */
export default function ProblemsPage() {
  const navigate = useNavigate();
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems-with-counts'],
    queryFn: getProblemsWithCounts,
    staleTime: 30000,
  });

  // Stats intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsStatsVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filteredProblems = useMemo(() => {
    if (!problems) return [];
    let filtered = problems;
    if (selectedEmotions.length > 0) {
      filtered = filtered.filter(problem => selectedEmotions.includes(problem.slug));
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      filtered = filtered.filter(problem => 
        problem.name.toLowerCase().includes(q) || 
        problem.description_english?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter(problem => 
        problem.category?.toLowerCase().includes(categoryFilter)
      );
    }
    return filtered;
  }, [problems, selectedEmotions, searchFilter, categoryFilter]);

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    );
  };

  const handleMatchFound = (slug: string) => navigate(`/problems/${slug}`);

  const breadcrumbs = [
    { name: 'Home', url: 'https://www.bhagavadgitagyan.com/' },
    { name: 'Life Problems', url: 'https://www.bhagavadgitagyan.com/problems' },
  ];

  const totalVerses = problems?.reduce((sum, p) => sum + p.verseCount, 0) || 0;
  const problemCount = useAnimatedCounter(problems?.length || 0, isStatsVisible, 1000);
  const verseCount = useAnimatedCounter(totalVerses, isStatsVisible, 1500);

  const trendingProblemSlug = useMemo(() => {
    if (!problems || problems.length === 0) return null;
    return [...problems].sort((a, b) => b.verseCount - a.verseCount)[0]?.slug;
  }, [problems]);

  const topProblems = useMemo(() => {
    if (!problems) return [];
    return [...problems].sort((a, b) => b.verseCount - a.verseCount).slice(0, 3);
  }, [problems]);

  return (
    <Layout>
      <SEOHead
        title="Life Problems Addressed by Bhagavad Gita"
        description="Find Gita wisdom for anxiety, fear, anger, self-doubt, relationships, and major life decisions. Ancient solutions for modern challenges."
        canonicalUrl="https://www.bhagavadgitagyan.com/problems"
        keywords={['life problems', 'anxiety help', 'fear', 'anger management', 'self-doubt', 'Gita solutions']}
        structuredData={generateBreadcrumbSchema(breadcrumbs)}
      />

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden min-h-[45vh] md:min-h-[50vh] flex items-center border-b border-border/50">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-background to-accent/6" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,hsl(var(--primary)/0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,hsl(var(--accent)/0.08),transparent_50%)]" />
          <div className="absolute top-[10%] left-[15%] w-72 md:w-96 h-72 md:h-96 rounded-full bg-primary/[0.04] blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-[20%] right-[10%] w-80 md:w-[500px] h-80 md:h-[500px] rounded-full bg-amber-500/[0.04] blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute right-[-5%] top-[5%] text-[16rem] md:text-[22rem] font-bold text-primary/[0.03] select-none pointer-events-none leading-none hidden lg:block" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ॐ</div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-semibold uppercase tracking-wider mb-6 md:mb-8 border border-primary/20 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Find Your Solution
              <Sparkles className="h-3.5 w-3.5" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-4 md:mb-6 tracking-tight"
            >
              <span className="text-foreground">Life problems.</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">Ancient solutions.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed"
            >
              The Bhagavad Gita addresses every human struggle. Find wisdom that speaks directly to what you're going through.
            </motion.p>

            {/* Stats */}
            <motion.div
              ref={statsRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8 md:mb-10"
            >
              {[
                { value: problemCount, suffix: '', label: 'Problem Areas', icon: Zap, gradient: 'from-primary to-amber-500' },
                { value: verseCount, suffix: '+', label: 'Relevant Verses', icon: BookOpen, gradient: 'from-amber-500 to-orange-500' },
                { value: 100, suffix: '%', label: 'Free Access', icon: Target, gradient: 'from-orange-500 to-red-500' },
              ].map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className={cn("w-11 h-11 md:w-14 md:h-14 mx-auto rounded-xl bg-gradient-to-br flex items-center justify-center mb-2 md:mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300", stat.gradient)}>
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">{stat.value}{stat.suffix}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link to="/chat">
                <Button size="lg" className="gap-2 w-full sm:w-auto h-12 text-sm md:text-base font-bold bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 border-0 shadow-lg">
                  <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                  Talk to Krishna
                </Button>
              </Link>
              <Link to="/chapters">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto h-12 text-sm md:text-base font-bold border-2">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                  Browse Chapters
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ========== MAIN CONTENT ========== */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">

        {/* Emotion Cloud */}
        <EmotionCloud selectedEmotions={selectedEmotions} onEmotionToggle={handleEmotionToggle} />

        {/* ===== Most Popular ===== */}
        {!isLoading && topProblems.length > 0 && (
          <div className="mb-12 md:mb-14">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-1 h-7 md:h-8 rounded-full bg-gradient-to-b from-primary to-amber-500" />
              <h2 className="text-xl md:text-3xl font-extrabold">Most Popular</h2>
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {topProblems.map((problem, index) => (
                <TopProblemCard key={problem.id} problem={problem} rank={index} />
              ))}
            </div>
          </div>
        )}

        {/* ===== Search, Filter & View Toggle ===== */}
        <div ref={searchRef} className="sticky top-16 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3 bg-background/80 backdrop-blur-xl border-b border-border/30 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-card text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">Clear</span>
                  ×
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {categoryFilters.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value === categoryFilter ? '' : cat.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border',
                    categoryFilter === cat.value
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* View toggle (desktop) */}
            <div className="hidden md:flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-card self-start">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-1.5 rounded-md transition-colors', viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-1.5 rounded-md transition-colors', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-3 mb-5 md:mb-6">
          <div className="w-1 h-6 md:h-8 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
          <h2 className="text-lg md:text-2xl font-extrabold">All Problems</h2>
          {filteredProblems.length > 0 && (
            <span className="text-xs md:text-sm text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
              {filteredProblems.length}
            </span>
          )}
        </div>

        {/* Grid / List */}
        {isLoading ? (
          <div className={cn(
            "grid gap-4 md:gap-6",
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {[...Array(9)].map((_, i) => (
              <div key={i} className={cn("animate-pulse rounded-2xl bg-muted", viewMode === 'grid' ? 'h-48' : 'h-16')} />
            ))}
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'
              : 'grid grid-cols-1 gap-2.5'
          )}>
            {/* Problem Matcher - only in grid */}
            {viewMode === 'grid' && (
              <div className="sm:row-span-1">
                <ProblemMatcher problems={problems || []} onMatchFound={handleMatchFound} />
              </div>
            )}

            {filteredProblems.map((problem, index) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                index={index}
                isTrending={problem.slug === trendingProblemSlug}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        <AnimatePresence>
          {!isLoading && filteredProblems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">No problems found</h3>
              <p className="text-muted-foreground mb-6 text-sm">Try adjusting your search or filters</p>
              <Button variant="outline" size="sm" onClick={() => { setSearchFilter(''); setSelectedEmotions([]); setCategoryFilter(''); }}>
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ask Krishna CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 md:mt-20 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-6 md:p-10 text-center"
        >
          <div className="text-3xl md:text-4xl mb-3">🙏</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            Can't find your problem?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md mx-auto">
            Ask Krishna AI directly — describe what you're going through and get personalized Gita wisdom.
          </p>
          <Link to="/chat">
            <Button className="gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg">
              <MessageCircle className="h-4 w-4" />
              Talk to Krishna
            </Button>
          </Link>
        </motion.div>
      </div>

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
