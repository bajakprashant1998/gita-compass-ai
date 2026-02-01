import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Shlok } from '@/types';

interface MeaningSectionProps {
  shlok: Shlok;
}

export function MeaningSection({ shlok }: MeaningSectionProps) {
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Actual Gita Meaning</h3>
          <Tabs value={language} onValueChange={(v) => setLanguage(v as 'english' | 'hindi')}>
            <TabsList className="grid w-40 grid-cols-2">
              <TabsTrigger value="english">🇬🇧 EN</TabsTrigger>
              <TabsTrigger value="hindi">🇮🇳 HI</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="text-lg leading-relaxed">
          {language === 'english' ? (
            <p>{shlok.english_meaning}</p>
          ) : (
            <p className="sanskrit">{shlok.hindi_meaning || 'Hindi meaning not available'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
