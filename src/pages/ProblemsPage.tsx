import { useState, useMemo } from 'react';
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
  ChevronRight,
  BookOpen,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProblemMatcher } from '@/components/problems/ProblemMatcher';
import { EmotionCloud } from '@/components/problems/EmotionCloud';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';

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

const colorMap: Record<string, { bg: string; icon: string; gradient: string }> = {
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-600 dark:text-amber-400', gradient: 'from-amber-500 to-orange-500' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400', gradient: 'from-red-500 to-rose-500' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-indigo-500' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400', gradient: 'from-purple-500 to-violet-500' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', icon: 'text-pink-600 dark:text-pink-400', gradient: 'from-pink-500 to-rose-500' },
  teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', icon: 'text-teal-600 dark:text-teal-400', gradient: 'from-teal-500 to-cyan-500' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400', gradient: 'from-orange-500 to-amber-500' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400', gradient: 'from-green-500 to-emerald-500' },
};

async function getProblemsWithCounts() {
  // First get all problems
  const { data: problems, error: problemsError } = await supabase
    .from('problems')
    .select('*')
    .order('display_order');
  
  if (problemsError) throw problemsError;
  
  // Then get counts for each problem from shlok_problems
  const { data: counts, error: countsError } = await supabase
    .from('shlok_problems')
    .select('problem_id');
  
  if (countsError) throw countsError;
  
  // Count occurrences per problem_id
  const countMap = (counts || []).reduce((acc, item) => {
    acc[item.problem_id] = (acc[item.problem_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (problems || []).map(p => ({
    ...p,
    verseCount: countMap[p.id] || 0,
  }));
}

export default function ProblemsPage() {
  const navigate = useNavigate();
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  
  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems-with-counts'],
    queryFn: getProblemsWithCounts,
  });

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

  return (
    <Layout>
      <SEOHead
        title="Life Problems Addressed by Bhagavad Gita"
        description="Find Gita wisdom for anxiety, fear, anger, self-doubt, relationships, and major life decisions. Ancient solutions for modern challenges."
        canonicalUrl="https://www.bhagavadgitagyan.com/problems"
        keywords={['life problems', 'anxiety help', 'fear', 'anger management', 'self-doubt', 'Gita solutions']}
        structuredData={generateBreadcrumbSchema(breadcrumbs)}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 lg:py-24">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Find Your Solution
            </div>
            
            <h1 className="headline-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              <span className="text-gradient">Life Problems</span> Solved
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The Bhagavad Gita addresses universal human struggles. 
              Find wisdom that speaks directly to what you're going through.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient">{problems?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Problem Areas</div>
              </div>
              <div className="w-px h-12 bg-border hidden md:block" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient">{totalVerses}+</div>
                <div className="text-sm text-muted-foreground">Relevant Verses</div>
              </div>
              <div className="w-px h-12 bg-border hidden md:block" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient">100%</div>
                <div className="text-sm text-muted-foreground">Free Access</div>
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
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Problem Matcher */}
            <ProblemMatcher
              problems={problems || []}
              onMatchFound={handleMatchFound}
            />
            
            {filteredProblems?.map((problem, index) => {
              const Icon = iconMap[problem.icon || 'HelpCircle'] || HelpCircle;
              const colors = colorMap[problem.color || 'blue'] || colorMap.blue;

              return (
                <Link 
                  key={problem.id} 
                  to={`/problems/${problem.slug}`}
                  className="animate-fade-in block"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="group h-full relative rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                    {/* Gradient Top Border */}
                    <div className={cn(
                      "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity",
                      colors.gradient
                    )} />
                    
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                          colors.bg
                        )}>
                          <Icon className={cn("h-7 w-7", colors.icon)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {problem.name}
                          </h2>
                          <p className="text-muted-foreground line-clamp-2">
                            {problem.description_english}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">{problem.verseCount}</span>
                            <span className="text-muted-foreground">verses</span>
                          </div>
                        </div>
                        <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all">
                          <span>Explore</span>
                          <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
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
