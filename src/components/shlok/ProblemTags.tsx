import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, ArrowUpRight } from 'lucide-react';
import type { Problem } from '@/types';

interface ProblemTagsProps {
  problems: Problem[];
}

export function ProblemTags({ problems }: ProblemTagsProps) {
  if (!problems || problems.length === 0) return null;

  return (
    <Card className="mb-8 border-0 shadow-lg animate-fade-in animation-delay-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent text-accent-foreground">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Life Challenges Addressed</h3>
              <p className="text-xs text-muted-foreground">
                Click to explore related wisdom
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {problems.map((problem) => (
            <Link key={problem.id} to={`/problems/${problem.slug}`} className="group">
              <Badge
                variant="outline"
                className="text-sm px-4 py-2.5 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md flex items-center gap-2"
                style={{ 
                  backgroundColor: problem.color ? `${problem.color}15` : undefined,
                  borderColor: problem.color || 'hsl(var(--border))',
                  borderWidth: '2px',
                  color: problem.color || 'inherit'
                }}
              >
                <span className="font-semibold">#{problem.name}</span>
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
