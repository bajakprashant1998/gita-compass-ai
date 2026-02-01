import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Languages } from 'lucide-react';
import type { Shlok } from '@/types';

interface SanskritVerseProps {
  shlok: Shlok;
}

export function SanskritVerse({ shlok }: SanskritVerseProps) {
  const [showTransliteration, setShowTransliteration] = useState(false);

  return (
    <Card className="mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm uppercase tracking-wide text-primary">
              Original Sanskrit
            </span>
          </div>
          {shlok.transliteration && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTransliteration(!showTransliteration)}
              className="gap-2"
            >
              <Languages className="h-4 w-4" />
              {showTransliteration ? 'Hide' : 'Show'} Transliteration
            </Button>
          )}
        </div>

        <blockquote className="text-xl md:text-2xl font-medium sanskrit leading-relaxed text-center mb-4 whitespace-pre-line">
          {shlok.sanskrit_text}
        </blockquote>

        {showTransliteration && shlok.transliteration && (
          <div className="mt-6 pt-6 border-t border-primary/20">
            <p className="text-center text-muted-foreground italic whitespace-pre-line">
              {shlok.transliteration}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
