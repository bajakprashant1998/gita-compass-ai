import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Target } from 'lucide-react';
import type { Shlok } from '@/types';

interface LifeApplicationBoxProps {
  shlok: Shlok;
}

export function LifeApplicationBox({ shlok }: LifeApplicationBoxProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Life Application */}
      {shlok.life_application && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Life Application</h3>
                <p className="text-lg leading-relaxed">{shlok.life_application}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Practical Action */}
      {shlok.practical_action && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-500/10 rounded-full p-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-green-700">Today's Action</h3>
                <p className="text-lg leading-relaxed">{shlok.practical_action}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
