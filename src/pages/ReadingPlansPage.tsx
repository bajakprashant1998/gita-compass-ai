import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { PlanCard } from '@/components/reading-plans/PlanCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Sparkles, Filter, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';
import { cn } from '@/lib/utils';

const DIFFICULTY_FILTERS = [
  { key: 'all', label: 'All Plans', icon: '🕉️' },
  { key: 'beginner', label: 'Beginner', icon: '🌱' },
  { key: 'intermediate', label: 'Intermediate', icon: '🌿' },
  { key: 'advanced', label: 'Advanced', icon: '🔥' },
];

export default function ReadingPlansPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('display_order');

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['reading-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_plans')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: userPlans = [] } = useQuery({
    queryKey: ['user-reading-plans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_reading_plans')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const userPlanMap = new Map(userPlans.map(up => [up.plan_id, up]));

  let filteredPlans = activeFilter === 'all'
    ? plans
    : plans.filter(p => p.difficulty === activeFilter);

  // Apply search filter
  filteredPlans = filteredPlans.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Apply sorting
  filteredPlans = [...filteredPlans].sort((a, b) => {
    if (sortBy === 'duration_asc') {
      return a.duration_days - b.duration_days;
    } else if (sortBy === 'duration_desc') {
      return b.duration_days - a.duration_days;
    }
    return (a.display_order || 0) - (b.display_order || 0);
  });

  const activePlanCount = userPlans.filter(p => p.status === 'active').length;
  const completedPlanCount = userPlans.filter(p => p.status === 'completed').length;

  return (
    <Layout>
      <SEOHead
        title="Guided Reading Plans | Bhagavad Gita Gyan"
        description="Embark on curated multi-day spiritual journeys through the Bhagavad Gita. Choose from guided reading plans designed for inner peace, courage, and purpose."
        canonicalUrl="https://www.bhagavadgitagyan.com/reading-plans"
      />

      <div className="relative overflow-hidden">
        {/* Decorative background */}
        <RadialGlow position="top-left" color="primary" className="opacity-30" />
        <RadialGlow position="bottom-right" color="amber" className="opacity-15" />
        <FloatingOm className="top-32 right-8 animate-float hidden lg:block" />

        {/* Hero Banner */}
        <section className="relative py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4" />
                Guided Spiritual Journeys
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
                Reading <span className="text-gradient">Plans</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
                Curated multi-day journeys through the Bhagavad Gita. Each plan guides you with
                carefully selected verses and daily reflection prompts.
              </p>

              {/* Stats row */}
              {user && (activePlanCount > 0 || completedPlanCount > 0) && (
                <div className="flex items-center justify-center gap-6 sm:gap-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient">{plans.length}</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{activePlanCount}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{completedPlanCount}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Filters + Content */}
         <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
           <div className="max-w-4xl mx-auto">
             {/* Category Filters */}
             <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
               <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
               {DIFFICULTY_FILTERS.map(filter => (
                 <button
                   key={filter.key}
                   onClick={() => setActiveFilter(filter.key)}
                   className={cn(
                     "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                     activeFilter === filter.key
                       ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                       : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                   )}
                 >
                   <span>{filter.icon}</span>
                   {filter.label}
                 </button>
               ))}
             </div>

             {/* Search and Sort Controls */}
             <div className="flex flex-col sm:flex-row gap-4 mb-8">
               <div className="flex-1 relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   placeholder="Search plans by title or description..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10"
                 />
               </div>
               <Select value={sortBy} onValueChange={setSortBy}>
                 <SelectTrigger className="sm:w-48">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="display_order">Default Order</SelectItem>
                   <SelectItem value="duration_asc">
                     <div className="flex items-center gap-2">
                       <ArrowUp className="h-3 w-3" />
                       Shortest First
                     </div>
                   </SelectItem>
                   <SelectItem value="duration_desc">
                     <div className="flex items-center gap-2">
                       <ArrowDown className="h-3 w-3" />
                       Longest First
                     </div>
                   </SelectItem>
                 </SelectContent>
               </Select>
             </div>

            {/* Plans grid */}
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">No plans found for this category yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredPlans.map((plan, i) => (
                  <div key={plan.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <PlanCard
                      plan={plan}
                      userProgress={userPlanMap.get(plan.id) as any}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
