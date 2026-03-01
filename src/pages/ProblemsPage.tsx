import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Shield, 
  HelpCircle, 
  Crown, 
  Heart, 
  User, 
  Flame,
  GitBranch,
  LucideIcon,
  BookOpen,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Search,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProblemMatcher } from '@/components/problems/ProblemMatcher';
import { EmotionCloud } from '@/components/problems/EmotionCloud';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, LucideIcon> = {
  Brain, Shield, HelpCircle, Crown, Heart, User, Flame, GitBranch,
};

const colorMap: Record<string, { gradient: string; glow: string }> = {
  amber: { gradient: 'from-amber-500 to-orange-500', glow: 'group-hover:shadow-amber-500/20' },
  red: { gradient: 'from-red-500 to-rose-500', glow: 'group-hover:shadow-red-500/20' },
  blue: { gradient: 'from-blue-500 to-indigo-500', glow: 'group-hover:shadow-blue-500/20' },
  purple: { gradient: 'from-purple-500 to-violet-500', glow: 'group-hover:shadow-purple-500/20' },
  pink: { gradient: 'from-pink-500 to-rose-500', glow: 'group-hover:shadow-pink-500/20' },
  teal: { gradient: 'from-teal-500 to-cyan-500', glow: 'group-hover:shadow-teal-500/20' },
  orange: { gradient: 'from-orange-500 to-amber-500', glow: 'group-hover:shadow-orange-500/20' },
  green: { gradient: 'from-green-500 to-emerald-500', glow: 'group-hover:shadow-green-500/20' },
};

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

export default function ProblemsPage() {
  const navigate = useNavigate();
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  
  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems-with-counts'],
    queryFn: getProblemsWithCounts,
    staleTime: 30000,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsStatsVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
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
    return filtered;
  }, [problems, selectedEmotions, searchFilter]);

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

  return (
    <Layout>
      <SEOHead
        title="Life Problems Addressed by Bhagavad Gita"
        description="Find Gita wisdom for anxiety, fear, anger, self-doubt, relationships, and major life decisions. Ancient solutions for modern challenges."
        canonicalUrl="https://www.bhagavadgitagyan.com/problems"
        keywords={['life problems', 'anxiety help', 'fear', 'anger management', 'self-doubt', 'Gita solutions']}
        structuredData={generateBreadcrumbSchema(breadcrumbs)}
      />

      {/* ========== PREMIUM HERO ========== */}
      <section className="relative overflow-hidden min-h-[50vh] flex items-center border-b border-border/50">
        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-background to-accent/6" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,hsl(var(--accent)/0.10),transparent_50%)]" />
          <div className="absolute top-[10%] left-[15%] w-96 h-96 rounded-full bg-primary/[0.04] blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-500/[0.04] blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* ॐ watermark */}
        <div className="absolute right-[-5%] top-[5%] text-[22rem] font-bold text-primary/[0.03] select-none pointer-events-none leading-none hidden lg:block" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ॐ</div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-8 animate-fade-in border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Find Your Solution
              <Sparkles className="h-4 w-4" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 animate-fade-in animation-delay-100 tracking-tight">
              <span className="text-foreground">Life problems.</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">Ancient solutions.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in animation-delay-200">
              The Bhagavad Gita addresses every human struggle. Find wisdom that speaks directly to what you're going through.
            </p>

            {/* Stats Row */}
            <div ref={statsRef} className="flex flex-wrap justify-center gap-10 mb-10 animate-fade-in animation-delay-300">
              {[
                { value: problemCount, suffix: '', label: 'Problem Areas', icon: Zap, gradient: 'from-primary to-amber-500' },
                { value: verseCount, suffix: '+', label: 'Relevant Verses', icon: BookOpen, gradient: 'from-amber-500 to-orange-500' },
                { value: 100, suffix: '%', label: 'Free Access', icon: Target, gradient: 'from-orange-500 to-red-500' },
              ].map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className={cn("w-14 h-14 mx-auto rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300", stat.gradient)}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">{stat.value}{stat.suffix}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in animation-delay-400">
              <Link to="/chat">
                <Button size="lg" className="gap-2 h-13 text-base font-bold bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 border-0 shadow-lg">
                  <MessageCircle className="h-5 w-5" />
                  Talk to Krishna
                </Button>
              </Link>
              <Link to="/chapters">
                <Button size="lg" variant="outline" className="gap-2 h-13 text-base font-bold border-2">
                  <BookOpen className="h-5 w-5" />
                  Browse Chapters
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ========== MAIN CONTENT ========== */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {/* Emotion Cloud */}
        <EmotionCloud selectedEmotions={selectedEmotions} onEmotionToggle={handleEmotionToggle} />

        {/* ===== Most Popular Section ===== */}
        {!isLoading && problems && problems.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-primary to-amber-500" />
              <h2 className="text-2xl md:text-3xl font-extrabold">Most Popular</h2>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...problems].sort((a, b) => b.verseCount - a.verseCount).slice(0, 3).map((problem, index) => {
                const Icon = iconMap[problem.icon || 'HelpCircle'] || HelpCircle;
                const colors = colorMap[problem.color || 'blue'] || colorMap.blue;
                return (
                  <Link key={problem.id} to={`/problems/${problem.slug}`} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="group relative rounded-2xl overflow-hidden border-2 border-border/50 bg-card hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                      {/* Top gradient bar */}
                      <div className={cn("h-1.5 bg-gradient-to-r", colors.gradient)} />
                      <div className="p-6 text-center">
                        {/* Rank badge */}
                        <div className="absolute top-5 right-5">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            #{index + 1}
                          </span>
                        </div>
                        <div className={cn("w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300", colors.gradient)}>
                          <Icon className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{problem.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{problem.description_english}</p>
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-primary">
                          <BookOpen className="h-4 w-4" />
                          {problem.verseCount} verses
                          <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-2" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== Search & Filter ===== */}
        <div className="mb-8">
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-border/50 bg-card text-base focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* ===== All Problems Grid ===== */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
          <h2 className="text-2xl md:text-3xl font-extrabold">All Problems</h2>
          {filteredProblems.length > 0 && (
            <span className="text-sm text-muted-foreground font-medium">({filteredProblems.length})</span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Problem Matcher Card */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 bg-card shadow-lg">
              <div className="h-1.5 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
              <ProblemMatcher problems={problems || []} onMatchFound={handleMatchFound} />
            </div>

            {filteredProblems?.map((problem, index) => {
              const Icon = iconMap[problem.icon || 'HelpCircle'] || HelpCircle;
              const colors = colorMap[problem.color || 'blue'] || colorMap.blue;
              const isTrending = problem.slug === trendingProblemSlug;

              return (
                <Link 
                  key={problem.id} 
                  to={`/problems/${problem.slug}`}
                  className="animate-fade-in block"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn(
                    "group h-full relative rounded-2xl overflow-hidden border-2 border-border/50 bg-card transition-all duration-300",
                    "hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2",
                    colors.glow
                  )}>
                    {/* Top gradient bar */}
                    <div className={cn("h-1.5 bg-gradient-to-r", colors.gradient)} />

                    {/* Background watermark */}
                    <div className={cn(
                      "absolute -right-4 -bottom-4 text-8xl font-extrabold text-primary/[0.03] select-none pointer-events-none transition-transform duration-500 group-hover:scale-110"
                    )}>
                      {index + 1}
                    </div>

                    <div className="relative p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg",
                          `bg-gradient-to-br ${colors.gradient}`
                        )}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                              {problem.name}
                            </h3>
                            {isTrending && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white uppercase tracking-wider flex-shrink-0">
                                Trending
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {problem.description_english}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-sm">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="font-bold text-foreground">{problem.verseCount}</span>
                            <span className="text-muted-foreground">verses</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", colors.gradient)}
                              style={{ width: `${Math.min((problem.verseCount / 50) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <span>Explore</span>
                          <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredProblems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No problems found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={() => { setSearchFilter(''); setSelectedEmotions([]); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
