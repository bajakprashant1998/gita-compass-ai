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
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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

const gradientMap: Record<string, string> = {
  amber: 'from-amber-500 to-orange-500',
  red: 'from-red-500 to-rose-500',
  blue: 'from-blue-500 to-indigo-500',
  purple: 'from-purple-500 to-violet-500',
  pink: 'from-pink-500 to-rose-500',
  teal: 'from-teal-500 to-cyan-500',
  orange: 'from-orange-500 to-amber-500',
  green: 'from-green-500 to-emerald-500',
};

export function ProblemCategories() {
  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: getProblems,
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
              Life Challenges
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Browse by Life Problem</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4 animate-fade-in">
            Life Challenges
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 animate-fade-in animation-delay-100">
            Browse by <span className="text-gradient">Life Problem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Find wisdom that directly addresses what you're going through.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems?.map((problem, index) => {
            const Icon = iconMap[problem.icon || 'HelpCircle'] || HelpCircle;
            const gradient = gradientMap[problem.color || 'blue'] || gradientMap.blue;

            return (
              <Link 
                key={problem.id} 
                to={`/problems/${problem.slug}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="group relative rounded-2xl border-2 border-border/50 bg-card p-6 h-full transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                    gradient
                  )} />
                  
                  {/* Popular badge */}
                  {index === 0 && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs font-bold uppercase tracking-wide">
                      Popular
                    </Badge>
                  )}
                  
                  {/* Icon */}
                  <div className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 bg-gradient-to-br text-white shadow-lg",
                    gradient
                  )}>
                    <Icon className="h-7 w-7" />
                  </div>
                  
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                    {problem.name}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 mb-5 leading-relaxed">
                    {problem.description_english}
                  </p>
                  
                  {/* CTA */}
                  <div className="flex items-center text-sm font-bold text-primary">
                    <span>Find solutions</span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-2" />
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
