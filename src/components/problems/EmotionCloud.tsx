import { cn } from '@/lib/utils';
import { Sparkles, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmotionCloudProps {
  selectedEmotions: string[];
  onEmotionToggle: (emotion: string) => void;
}

const emotions = [
  { name: 'Worried', maps: 'anxiety', emoji: '😟' },
  { name: 'Scared', maps: 'fear', emoji: '😰' },
  { name: 'Lost', maps: 'confusion', emoji: '😶‍🌫️' },
  { name: 'Frustrated', maps: 'anger', emoji: '😤' },
  { name: 'Uncertain', maps: 'decision-making', emoji: '🤔' },
  { name: 'Overwhelmed', maps: 'anxiety', emoji: '😵' },
  { name: 'Inadequate', maps: 'self-doubt', emoji: '😔' },
  { name: 'Hurt', maps: 'relationships', emoji: '💔' },
  { name: 'Stuck', maps: 'confusion', emoji: '🧱' },
  { name: 'Nervous', maps: 'fear', emoji: '😬' },
  { name: 'Conflicted', maps: 'decision-making', emoji: '⚖️' },
  { name: 'Stressed', maps: 'anxiety', emoji: '😩' },
  { name: 'Isolated', maps: 'relationships', emoji: '🏝️' },
  { name: 'Powerless', maps: 'leadership', emoji: '😞' },
  { name: 'Resentful', maps: 'anger', emoji: '😠' },
  { name: 'Insecure', maps: 'self-doubt', emoji: '🫣' },
];

export function EmotionCloud({ selectedEmotions, onEmotionToggle }: EmotionCloudProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-card to-accent/5 border border-border/50 p-6 md:p-8"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--accent)/0.08),transparent_50%)]" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-center">
            How are you feeling right now?
          </h3>
        </div>
        <p className="text-sm text-muted-foreground text-center mb-5">
          Tap what resonates — we'll find wisdom that matches
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 md:gap-2.5">
          {emotions.map((emotion, i) => {
            const isSelected = selectedEmotions.includes(emotion.maps);
            return (
              <motion.button
                key={emotion.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onEmotionToggle(emotion.maps)}
                className={cn(
                  'px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-200 font-medium text-sm flex items-center gap-1.5',
                  isSelected
                    ? 'bg-gradient-to-r from-primary to-amber-500 text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary/30'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border/60 hover:border-primary/40 hover:shadow-sm'
                )}
              >
                <span className="text-base leading-none">{emotion.emoji}</span>
                {emotion.name}
              </motion.button>
            );
          })}
        </div>
        
        <AnimatePresence>
          {selectedEmotions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center"
            >
              <button
                onClick={() => selectedEmotions.forEach(onEmotionToggle)}
                className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters ({selectedEmotions.length})
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
