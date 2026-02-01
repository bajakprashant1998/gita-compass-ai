import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Target, ArrowRight } from 'lucide-react';
import type { Shlok } from '@/types';

interface LifeApplicationBoxProps {
  shlok: Shlok;
}

export function LifeApplicationBox({ shlok }: LifeApplicationBoxProps) {
  return (
    <div className="space-y-6 mb-8 animate-fade-in animation-delay-400">
      {/* Life Application - WebFX metric card style */}
      {shlok.life_application && (
        <Card className="metric-card border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-start gap-5">
              <div className="shrink-0 p-4 rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-lg glow-primary">
                <Lightbulb className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-bold text-xl text-primary">Life Application</h3>
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Key Takeaway</span>
                </div>
                <p className="text-lg md:text-xl leading-relaxed font-medium text-foreground">
                  {shlok.life_application}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Practical Action - Call to action style */}
      {shlok.practical_action && (
        <Card className="metric-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-start gap-5">
              <div className="shrink-0 p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                <Target className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-bold text-xl text-green-700 dark:text-green-400">Today's Action</h3>
                  <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-semibold">
                    DO THIS
                  </span>
                </div>
                <p className="text-lg md:text-xl leading-relaxed text-foreground">
                  {shlok.practical_action}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
