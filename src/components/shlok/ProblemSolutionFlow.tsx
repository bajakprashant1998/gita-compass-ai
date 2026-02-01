import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Shlok } from '@/types';

interface ProblemSolutionFlowProps {
  shlok: Shlok;
}

export function ProblemSolutionFlow({ shlok }: ProblemSolutionFlowProps) {
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');

  if (!shlok.problem_context && !shlok.solution_gita) return null;

  return (
    <Card className="mb-8 border-0 shadow-lg overflow-hidden animate-fade-in animation-delay-300">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <h3 className="font-bold text-lg">Problem → Solution Flow</h3>
          </div>
          <Tabs value={language} onValueChange={(v) => setLanguage(v as 'english' | 'hindi')}>
            <TabsList className="grid w-36 grid-cols-2 h-10">
              <TabsTrigger value="english" className="text-sm font-medium">🇬🇧 EN</TabsTrigger>
              <TabsTrigger value="hindi" className="text-sm font-medium">🇮🇳 HI</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid md:grid-cols-2 gap-0 mt-6">
          {/* Problem Section */}
          <div className="relative bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent p-6 md:p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive to-destructive/50" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <span className="font-bold text-destructive uppercase text-sm tracking-wide">The Problem</span>
            </div>
            <p className="text-base leading-relaxed text-foreground/90">
              {shlok.problem_context || 'Problem context not available'}
            </p>
          </div>

          {/* Solution Section */}
          <div className="relative bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-6 md:p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/50 to-green-500" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-bold text-green-600 dark:text-green-400 uppercase text-sm tracking-wide">The Gita's Solution</span>
            </div>
            <p className="text-base leading-relaxed text-foreground/90">
              {shlok.solution_gita || 'Solution not available'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
