import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import type { Problem } from '@/types';

interface ProblemTagsProps {
  problems: Problem[];
}

export function ProblemTags({ problems }: ProblemTagsProps) {
  if (!problems || problems.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Primary Problems Addressed</h3>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Click a tag to explore all related shloks across the entire Gita
        </p>
        <div className="flex flex-wrap gap-2">
          {problems.map((problem) => (
            <Link key={problem.id} to={`/problems/${problem.slug}`}>
              <Badge
                variant="secondary"
                className="text-sm px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                style={{ 
                  backgroundColor: problem.color ? `${problem.color}20` : undefined,
                  borderColor: problem.color || undefined,
                  borderWidth: '1px'
                }}
              >
                #{problem.name}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
