import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookText, Volume2, Pause, Square, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { Shlok } from '@/types';

interface ModernStoryProps {
  shlok: Shlok;
}

export function ModernStory({ shlok }: ModernStoryProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Fetch new audio
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: shlok.modern_story,
            voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George - warm narrator voice
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });

      audio.addEventListener('error', () => {
        toast({
          title: 'Playback Error',
          description: 'Failed to play audio. Please try again.',
          variant: 'destructive',
        });
        setIsPlaying(false);
        audioRef.current = null;
      });

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('TTS Error:', error);
      toast({
        title: 'Audio Generation Failed',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  };

  if (!shlok.modern_story) return null;

  return (
    <Card className="mb-6 bg-gradient-to-br from-secondary/50 to-secondary/30 border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Modern Story</h3>
              <p className="text-xs text-muted-foreground">
                A contemporary example of this wisdom
              </p>
            </div>
          </div>
          
          {/* Audio Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Loading...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Listen</span>
                </>
              )}
            </Button>
            
            {(isPlaying || progress > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStop}
                className="px-2"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {(isPlaying || progress > 0) && (
          <div className="mb-4">
            <Progress value={progress} className="h-1" />
          </div>
        )}

        <div className="prose prose-sm max-w-none">
          {shlok.modern_story.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-foreground leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
