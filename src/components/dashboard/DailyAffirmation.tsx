import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Loader2, Quote } from 'lucide-react';
import { GradientBorderCard } from '@/components/ui/decorative-elements';
import { toast } from 'sonner';

interface DailyAffirmationProps {
  userId: string;
  versesRead: string[];
}

export function DailyAffirmation({ userId, versesRead }: DailyAffirmationProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const today = new Date().toISOString().slice(0, 10);

  const { data: affirmation, isLoading } = useQuery({
    queryKey: ['daily-affirmation', userId, today, refreshKey],
    queryFn: async () => {
      let context = 'the teachings of the Bhagavad Gita';
      if (versesRead.length > 0) {
        const randomId = versesRead[Math.floor(Math.random() * Math.min(versesRead.length, 10))];
        const { data: shlok } = await supabase
          .from('shloks')
          .select('english_meaning, life_application')
          .eq('id', randomId)
          .single();
        if (shlok) {
          context = shlok.life_application || shlok.english_meaning;
        }
      }

      const { data, error } = await supabase.functions.invoke('gita-coach', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Based on this Gita teaching: "${context.substring(0, 200)}" — generate ONE short, powerful morning affirmation (1-2 sentences max). Make it personal, present-tense, and uplifting. Just the affirmation text, nothing else.`
            }
          ]
        }
      });

      if (error) throw error;

      if (typeof data === 'string') {
        return data.trim();
      }

      return data?.choices?.[0]?.message?.content?.trim() || 'I embrace the wisdom of the Gita and walk my path with clarity and courage.';
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  return (
    <GradientBorderCard>
      <div className="relative overflow-hidden">
        {/* Decorative quote marks */}
        <div className="absolute top-3 left-4 text-primary/5 pointer-events-none select-none" aria-hidden="true">
          <Quote className="h-16 w-16 rotate-180" />
        </div>
        <div className="absolute bottom-3 right-4 text-primary/5 pointer-events-none select-none" aria-hidden="true">
          <Quote className="h-16 w-16" />
        </div>

        <div className="p-5 sm:p-6 relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-amber-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Today's Affirmation</h3>
                <p className="text-[10px] text-muted-foreground">Personalized from your reading</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10"
              onClick={() => setRefreshKey(k => k + 1)}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating your affirmation...</span>
            </div>
          ) : (
            <blockquote className="text-base sm:text-lg md:text-xl font-medium text-foreground leading-relaxed italic text-center py-4 px-4 sm:px-8">
              "{affirmation}"
            </blockquote>
          )}
        </div>
      </div>
    </GradientBorderCard>
  );
}
