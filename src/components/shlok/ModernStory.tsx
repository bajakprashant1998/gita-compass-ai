import { Card, CardContent } from '@/components/ui/card';
import { BookText } from 'lucide-react';
import type { Shlok } from '@/types';

interface ModernStoryProps {
  shlok: Shlok;
}

export function ModernStory({ shlok }: ModernStoryProps) {
  if (!shlok.modern_story) return null;

  return (
    <Card className="mb-6 bg-gradient-to-br from-secondary/50 to-secondary/30">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Modern Story</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          A contemporary example of this wisdom in action
        </p>
        <div className="prose prose-sm max-w-none">
          {shlok.modern_story.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-foreground leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
