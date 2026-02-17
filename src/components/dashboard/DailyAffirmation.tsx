import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
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
      // Get a random recent verse the user has read for context
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

      // Call AI to generate affirmation
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

      // Handle streaming response
      if (typeof data === 'string') {
        return data.trim();
      }

      return data?.choices?.[0]?.message?.content?.trim() || 'I embrace the wisdom of the Gita and walk my path with clarity and courage.';
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
    retry: 1,
  });

  return (
    <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all">
      <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-amber-500 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Today's Affirmation</h3>
              <p className="text-[10px] text-muted-foreground">Personalized from your reading</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-4 justify-center text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Generating your affirmation...</span>
          </div>
        ) : (
          <blockquote className="text-base sm:text-lg font-medium text-foreground leading-relaxed italic text-center py-2">
            "{affirmation}"
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
}
