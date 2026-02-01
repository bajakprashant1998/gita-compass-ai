import { cn } from '@/lib/utils';

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
    <div className="mb-8 p-6 bg-muted/50 rounded-xl">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
        What are you feeling? Click to explore related wisdom.
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        {emotions.map((emotion) => {
          const isSelected = selectedEmotions.includes(emotion.maps);
          return (
            <button
              key={emotion.name}
              onClick={() => onEmotionToggle(emotion.maps)}
              className={cn(
                'px-3 py-1.5 rounded-full transition-all duration-200 font-medium',
                emotion.size,
                isSelected
                  ? 'bg-primary text-primary-foreground scale-110'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-card/80 border border-border/50'
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
          className="mt-4 text-xs text-muted-foreground hover:text-foreground mx-auto block"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
