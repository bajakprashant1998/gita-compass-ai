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
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProblemMatcher } from '@/components/problems/ProblemMatcher';
import { EmotionCloud } from '@/components/problems/EmotionCloud';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';
import { FloatingOm, RadialGlow, TrendingBadge } from '@/components/ui/decorative-elements';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Shield,
  HelpCircle,
  Crown,
  Heart,
  User,
  Flame,
  GitBranch,
};

const colorMap: Record<string, { bg: string; icon: string; gradient: string; glow: string }> = {
  amber: { 
    bg: 'bg-amber-100 dark:bg-amber-900/30', 
    icon: 'text-amber-600 dark:text-amber-400', 
    gradient: 'from-amber-500 to-orange-500',
    glow: 'group-hover:shadow-amber-500/20'
  },
  red: { 
    bg: 'bg-red-100 dark:bg-red-900/30', 
    icon: 'text-red-600 dark:text-red-400', 
    gradient: 'from-red-500 to-rose-500',
    glow: 'group-hover:shadow-red-500/20'
  },
  blue: { 
    bg: 'bg-blue-100 dark:bg-blue-900/30', 
    icon: 'text-blue-600 dark:text-blue-400', 
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'group-hover:shadow-blue-500/20'
  },
  purple: { 
    bg: 'bg-purple-100 dark:bg-purple-900/30', 
    icon: 'text-purple-600 dark:text-purple-400', 
    gradient: 'from-purple-500 to-violet-500',
    glow: 'group-hover:shadow-purple-500/20'
  },
  pink: { 
    bg: 'bg-pink-100 dark:bg-pink-900/30', 
    icon: 'text-pink-600 dark:text-pink-400', 
    gradient: 'from-pink-500 to-rose-500',
    glow: 'group-hover:shadow-pink-500/20'
  },
  teal: { 
    bg: 'bg-teal-100 dark:bg-teal-900/30', 
    icon: 'text-teal-600 dark:text-teal-400', 
    gradient: 'from-teal-500 to-cyan-500',
    glow: 'group-hover:shadow-teal-500/20'
  },
  orange: { 
    bg: 'bg-orange-100 dark:bg-orange-900/30', 
    icon: 'text-orange-600 dark:text-orange-400', 
    gradient: 'from-orange-500 to-amber-500',
    glow: 'group-hover:shadow-orange-500/20'
  },
  green: { 
    bg: 'bg-green-100 dark:bg-green-900/30', 
    icon: 'text-green-600 dark:text-green-400', 
    gradient: 'from-green-500 to-emerald-500',
    glow: 'group-hover:shadow-green-500/20'
  },
};

async function getProblemsWithCounts() {
  // Optimized: fetch both in parallel
  const [problemsResult, countsResult] = await Promise.all([
    supabase.from('problems').select('*').order('display_order'),
    supabase.from('shlok_problems').select('problem_id')
  ]);
  
  if (problemsResult.error) throw problemsResult.error;
  if (countsResult.error) throw countsResult.error;
  
  // Count occurrences per problem_id
  const countMap = (countsResult.data || []).reduce((acc, item) => {
    acc[item.problem_id] = (acc[item.problem_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (problemsResult.data || []).map(p => ({
    ...p,
    verseCount: countMap[p.id] || 0,
  }));
}

// Animated counter hook
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
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, startCounting]);

  return count;
}

// Loading skeleton for problem cards
function ProblemCardSkeleton({ index }: { index: number }) {
  return (
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-muted via-muted to-muted" />
        <div className="h-48 border-2 border-l-0 border-border/50 bg-card rounded-r-2xl p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProblemsPage() {
  const navigate = useNavigate();
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  
  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems-with-counts'],
    queryFn: getProblemsWithCounts,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Intersection observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const filteredProblems = useMemo(() => {
    if (!problems) return [];
    if (selectedEmotions.length === 0) return problems;
    
    return problems.filter(problem => 
      selectedEmotions.includes(problem.slug)
    );
  }, [problems, selectedEmotions]);

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleMatchFound = (slug: string) => {
    navigate(`/problems/${slug}`);
  };

  const breadcrumbs = [
    { name: 'Home', url: 'https://www.bhagavadgitagyan.com/' },
    { name: 'Life Problems', url: 'https://www.bhagavadgitagyan.com/problems' },
  ];

  const totalVerses = problems?.reduce((sum, p) => sum + p.verseCount, 0) || 0;
  const problemCount = useAnimatedCounter(problems?.length || 0, isStatsVisible, 1000);
  const verseCount = useAnimatedCounter(totalVerses, isStatsVisible, 1500);

  // Find trending problem (most verses)
  const trendingProblemSlug = useMemo(() => {
    if (!problems || problems.length === 0) return null;
    const sorted = [...problems].sort((a, b) => b.verseCount - a.verseCount);
    return sorted[0]?.slug;
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

      {/* Hero Section - WebFX Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 lg:py-24 border-b">
        {/* Decorative Elements */}
        <RadialGlow position="top-right" color="primary" className="opacity-50" />
        <RadialGlow position="bottom-left" color="amber" className="opacity-30" />
        <FloatingOm className="top-20 left-10 animate-float hidden lg:block" />
        <FloatingOm className="bottom-10 right-20 animate-float animation-delay-500 hidden lg:block" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-6 border border-primary/20">
              <Sparkles className="h-4 w-4" />
              Find Your Solution
            </div>
            
            <h1 className="headline-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              <span className="text-gradient">Life Problems</span>
              <span className="text-foreground"> Solved</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The Bhagavad Gita addresses universal human struggles. 
              Find wisdom that speaks directly to what you're going through.
            </p>

            {/* Stats Row - Enhanced with icons and animations */}
            <div 
              ref={statsRef}
              className="flex flex-wrap justify-center gap-6 md:gap-10"
            >
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gradient">{problemCount}</div>
                <div className="text-sm text-muted-foreground font-medium">Problem Areas</div>
              </div>
              <div className="w-px h-20 bg-gradient-to-b from-transparent via-border to-transparent hidden md:block self-center" />
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gradient">{verseCount}+</div>
                <div className="text-sm text-muted-foreground font-medium">Relevant Verses</div>
              </div>
              <div className="w-px h-20 bg-gradient-to-b from-transparent via-border to-transparent hidden md:block self-center" />
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gradient">100%</div>
                <div className="text-sm text-muted-foreground font-medium">Free Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Emotion Cloud */}
        <EmotionCloud
          selectedEmotions={selectedEmotions}
          onEmotionToggle={handleEmotionToggle}
        />

        {/* Problems Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Problem Matcher skeleton */}
            <div className="animate-fade-in">
              <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-amber-500 to-orange-500" />
                <div className="h-48 border-2 border-l-0 border-border/50 bg-card rounded-r-2xl p-6">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-6" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
            {[...Array(7)].map((_, i) => (
              <ProblemCardSkeleton key={i} index={i + 1} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Problem Matcher - Enhanced */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-amber-500 to-orange-500 z-10" />
              <ProblemMatcher
                problems={problems || []}
                onMatchFound={handleMatchFound}
              />
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
                    "group h-full relative rounded-2xl overflow-hidden",
                  )}>
                    {/* Left Gradient Border */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b z-10",
                      colors.gradient
                    )} />
                    
                    <div className={cn(
                      "h-full border-2 border-l-0 border-border/50 bg-card rounded-r-2xl transition-all duration-300",
                      "hover:border-primary/30 hover:shadow-xl hover:-translate-y-1",
                      colors.glow
                    )}>
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                            `bg-gradient-to-br ${colors.gradient}`
                          )}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                                {problem.name}
                              </h2>
                              {isTrending && <TrendingBadge />}
                            </div>
                            <p className="text-muted-foreground line-clamp-2">
                              {problem.description_english}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <span className="font-bold text-foreground">{problem.verseCount}</span>
                              <span className="text-muted-foreground">verses</span>
                            </div>
                          </div>
                          <div className="flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-all">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>Explore</span>
                            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
