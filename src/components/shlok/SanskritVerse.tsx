import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Languages, Sparkles } from 'lucide-react';
import type { Shlok } from '@/types';

interface SanskritVerseProps {
  shlok: Shlok;
}

export function SanskritVerse({ shlok }: SanskritVerseProps) {
  const [showTransliteration, setShowTransliteration] = useState(false);

  return (
    <Card className="mb-8 overflow-hidden border-0 shadow-xl glow-primary animate-fade-in animation-delay-100">
      {/* Gradient header bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
      
      <CardContent className="p-8 md:p-10 bg-gradient-to-br from-primary/5 via-background to-amber-50/30 dark:from-primary/10 dark:via-background dark:to-amber-900/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm uppercase tracking-wider text-primary">
                Original Sanskrit
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">Sacred Scripture</p>
            </div>
          </div>
          {shlok.transliteration && (
            <Button
              variant={showTransliteration ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTransliteration(!showTransliteration)}
              className="gap-2 transition-all duration-300"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">
                {showTransliteration ? 'Hide' : 'Show'} Transliteration
              </span>
              <span className="sm:hidden">
                {showTransliteration ? 'Hide' : 'Show'}
              </span>
            </Button>
          )}
        </div>

        {/* Sanskrit text with decorative elements */}
        <div className="relative py-6">
          <Sparkles className="absolute -top-2 left-4 h-4 w-4 text-primary/30" />
          <Sparkles className="absolute -bottom-2 right-4 h-4 w-4 text-primary/30" />
          
          <blockquote className="text-xl md:text-2xl lg:text-3xl font-medium sanskrit leading-loose text-center px-4 whitespace-pre-line">
            {shlok.sanskrit_text}
          </blockquote>
        </div>

        {/* Transliteration section with smooth animation */}
        <div className={`overflow-hidden transition-all duration-500 ease-out ${
          showTransliteration ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'
        }`}>
          <div className="pt-6 border-t border-primary/20">
            <p className="text-center text-muted-foreground italic whitespace-pre-line leading-relaxed">
              {shlok.transliteration}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
