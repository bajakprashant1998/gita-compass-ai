import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getProblems } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  BookOpen
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

const colorMap: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

async function getProblemsWithCounts() {
  const { data: problems, error } = await supabase
    .from('problems')
    .select('*, shlok_problems(count)')
    .order('display_order');
  
  if (error) throw error;
  
  return problems.map(p => ({
    ...p,
    verseCount: (p.shlok_problems as any)?.[0]?.count || 0,
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
    { name: 'Home', url: 'https://gitawisdom.com/' },
    { name: 'Life Problems', url: 'https://gitawisdom.com/problems' },
  ];

  return (
    <Layout>
      <SEOHead
        title="Life Problems Addressed by Bhagavad Gita"
        description="Find Gita wisdom for anxiety, fear, anger, self-doubt, relationships, and major life decisions. Ancient solutions for modern challenges."
        canonicalUrl="https://gitawisdom.com/problems"
        keywords={['life problems', 'anxiety help', 'fear', 'anger management', 'self-doubt', 'Gita solutions']}
        structuredData={generateBreadcrumbSchema(breadcrumbs)}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Life Problems</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The Bhagavad Gita addresses universal human struggles. 
            Find wisdom that speaks directly to what you're going through.
          </p>
        </div>

        {/* Emotion Cloud */}
        <EmotionCloud
          selectedEmotions={selectedEmotions}
          onEmotionToggle={handleEmotionToggle}
        />

        {/* Problems Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Problem Matcher */}
            <ProblemMatcher
              problems={problems || []}
              onMatchFound={handleMatchFound}
            />
            
            {filteredProblems?.map((problem) => {
              const Icon = iconMap[problem.icon || 'HelpCircle'] || HelpCircle;
              const colorClass = colorMap[problem.color || 'blue'] || colorMap.blue;

              return (
                <Link key={problem.id} to={`/problems/${problem.slug}`}>
                  <Card className="h-full hover-lift cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                          colorClass
                        )}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {problem.name}
                            </CardTitle>
                          </div>
                          <p className="text-muted-foreground">
                            {problem.description_english}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>{problem.verseCount} verses</span>
                        </div>
                        <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                          <span>Explore Solutions</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
