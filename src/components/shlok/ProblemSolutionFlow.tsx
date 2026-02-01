import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Shlok } from '@/types';

interface ProblemSolutionFlowProps {
  shlok: Shlok;
}

export function ProblemSolutionFlow({ shlok }: ProblemSolutionFlowProps) {
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');

  if (!shlok.problem_context && !shlok.solution_gita) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Problem → Solution Flow</h3>
          <Tabs value={language} onValueChange={(v) => setLanguage(v as 'english' | 'hindi')}>
            <TabsList className="grid w-40 grid-cols-2">
              <TabsTrigger value="english">🇬🇧 EN</TabsTrigger>
              <TabsTrigger value="hindi">🇮🇳 HI</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Problem Section */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="font-semibold text-destructive">The Problem</span>
            </div>
            <p className="text-sm leading-relaxed">
              {shlok.problem_context || 'Problem context not available'}
            </p>
          </div>

          {/* Solution Section */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-600">The Gita's Solution</span>
            </div>
            <p className="text-sm leading-relaxed">
              {shlok.solution_gita || 'Solution not available'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
