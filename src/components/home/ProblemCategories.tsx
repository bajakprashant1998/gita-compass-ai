import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProblems } from '@/lib/api';
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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const colorMap: Record<string, { bg: string; icon: string }> = {
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-600 dark:text-amber-400' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', icon: 'text-pink-600 dark:text-pink-400' },
  teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', icon: 'text-teal-600 dark:text-teal-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
};

export function ProblemCategories() {
  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: getProblems,
  });

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Life Challenges
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Life Problem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find wisdom that directly addresses what you're going through.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Life Challenges
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Life Problem</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find wisdom that directly addresses what you're going through.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {problems?.map((problem, index) => {
            const Icon = iconMap[problem.icon || 'HelpCircle'] || HelpCircle;
            const colors = colorMap[problem.color || 'blue'] || colorMap.blue;

            return (
              <Link 
                key={problem.id} 
                to={`/problems/${problem.slug}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="group relative rounded-2xl border border-border/50 bg-card p-6 h-full transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                  {/* Popular badge for first item */}
                  {index === 0 && (
                    <span className="absolute top-4 right-4 px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Popular
                    </span>
                  )}
                  
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                    colors.bg
                  )}>
                    <Icon className={cn("h-7 w-7", colors.icon)} />
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {problem.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {problem.description_english}
                  </p>
                  
                  <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Find solutions</span>
                    <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
