import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquareQuote, Quote } from 'lucide-react';
import type { Shlok } from '@/types';

interface MeaningSectionProps {
  shlok: Shlok;
}

export function MeaningSection({ shlok }: MeaningSectionProps) {
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');

  return (
    <Card className="mb-8 border-0 shadow-lg animate-fade-in animation-delay-200">
      <CardContent className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary text-secondary-foreground">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Meaning & Interpretation</h3>
              <p className="text-xs text-muted-foreground">Understanding the verse</p>
            </div>
          </div>
          <Tabs value={language} onValueChange={(v) => setLanguage(v as 'english' | 'hindi')}>
            <TabsList className="grid w-36 grid-cols-2 h-10">
              <TabsTrigger value="english" className="text-sm font-medium">🇬🇧 EN</TabsTrigger>
              <TabsTrigger value="hindi" className="text-sm font-medium">🇮🇳 HI</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Quote styling for meaning */}
        <div className="relative pl-6 border-l-4 border-primary/30">
          <Quote className="absolute -left-3 -top-2 h-6 w-6 text-primary/20 fill-primary/10" />
          <div className={`text-lg md:text-xl leading-relaxed transition-all duration-300 ${
            language === 'hindi' ? 'sanskrit' : ''
          }`}>
            {language === 'english' ? (
              <p className="text-foreground">{shlok.english_meaning}</p>
            ) : (
              <p className="text-foreground">
                {shlok.hindi_meaning || 'Hindi meaning not available'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
