import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProblems } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, 
  Shield, 
  HelpCircle, 
  Crown, 
  Heart, 
  User, 
  Flame,
  GitBranch,
  LucideIcon
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

export function ProblemCategories() {
  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: getProblems,
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Life Problem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find wisdom that directly addresses what you're going through.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse by Life Problem</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find wisdom that directly addresses what you're going through.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {problems?.map((problem) => {
            const Icon = iconMap[problem.icon || 'HelpCircle'] || HelpCircle;
            const colorClass = colorMap[problem.color || 'blue'] || colorMap.blue;

            return (
              <Link key={problem.id} to={`/problems/${problem.slug}`}>
                <Card className="h-full hover-lift cursor-pointer group">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                      colorClass
                    )}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold mb-2">{problem.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {problem.description_english}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
