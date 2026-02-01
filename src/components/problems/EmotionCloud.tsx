import { cn } from '@/lib/utils';
import { Sparkles, X } from 'lucide-react';

interface EmotionCloudProps {
  selectedEmotions: string[];
  onEmotionToggle: (emotion: string) => void;
}

const emotions = [
  { name: 'Worried', maps: 'anxiety', size: 'text-lg' },
  { name: 'Scared', maps: 'fear', size: 'text-base' },
  { name: 'Lost', maps: 'confusion', size: 'text-lg' },
  { name: 'Frustrated', maps: 'anger', size: 'text-base' },
  { name: 'Uncertain', maps: 'decision-making', size: 'text-sm' },
  { name: 'Overwhelmed', maps: 'anxiety', size: 'text-base' },
  { name: 'Inadequate', maps: 'self-doubt', size: 'text-lg' },
  { name: 'Hurt', maps: 'relationships', size: 'text-sm' },
  { name: 'Stuck', maps: 'confusion', size: 'text-base' },
  { name: 'Nervous', maps: 'fear', size: 'text-sm' },
  { name: 'Conflicted', maps: 'decision-making', size: 'text-lg' },
  { name: 'Stressed', maps: 'anxiety', size: 'text-base' },
  { name: 'Isolated', maps: 'relationships', size: 'text-sm' },
  { name: 'Powerless', maps: 'leadership', size: 'text-base' },
  { name: 'Resentful', maps: 'anger', size: 'text-sm' },
  { name: 'Insecure', maps: 'self-doubt', size: 'text-base' },
];

export function EmotionCloud({ selectedEmotions, onEmotionToggle }: EmotionCloudProps) {
  return (
    <div className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border/50 p-8">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-center">
            What are you feeling?
          </h3>
        </div>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Click emotions to filter and find relevant wisdom
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          {emotions.map((emotion) => {
            const isSelected = selectedEmotions.includes(emotion.maps);
            return (
              <button
                key={emotion.name}
                onClick={() => onEmotionToggle(emotion.maps)}
                className={cn(
                  'px-4 py-2 rounded-full transition-all duration-300 font-medium',
                  emotion.size,
                  isSelected
                    ? 'bg-gradient-to-r from-primary to-amber-500 text-white shadow-lg shadow-primary/30 scale-105'
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-card/80 border border-border/50 hover:border-primary/30 hover:shadow-md'
                )}
              >
                {emotion.name}
              </button>
            );
          })}
        </div>
        
        {selectedEmotions.length > 0 && (
          <button
            onClick={() => selectedEmotions.forEach(onEmotionToggle)}
            className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mx-auto px-4 py-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
            Clear filters ({selectedEmotions.length})
          </button>
        )}
      </div>
    </div>
  );
}
