import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookText, Volume2, Pause, Square, Loader2, Sparkles } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [usingWebSpeech, setUsingWebSpeech] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Web Speech API fallback
  const playWithWebSpeech = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Your browser does not support text-to-speech.',
        variant: 'destructive',
      });
      return false;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Try to get a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
    ) || voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Estimate progress based on text length and rate
    const estimatedDuration = (text.length / 15) * 1000; // ~15 chars per second
    let startTime = Date.now();

    utterance.onstart = () => {
      setIsPlaying(true);
      setUsingWebSpeech(true);
      startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const prog = Math.min((elapsed / estimatedDuration) * 100, 95);
        setProgress(prog);
      }, 200);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(0);
      setUsingWebSpeech(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };

    utterance.onerror = (event) => {
      console.error('Web Speech error:', event);
      setIsPlaying(false);
      setProgress(0);
      setUsingWebSpeech(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  }, [toast]);

  const handlePlayPause = async () => {
    // Handle Web Speech pause/resume
    if (usingWebSpeech) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      }
      return;
    }

    // Handle audio element pause/resume
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

    // Try Google TTS first, fall back to Web Speech API
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: shlok.modern_story,
            language: 'english',
          }),
        }
      );

      if (!response.ok) {
        // Fallback to Web Speech API
        console.log('Google TTS failed, falling back to Web Speech API');
        const success = playWithWebSpeech(shlok.modern_story || '');
        if (!success) {
          throw new Error('Text-to-speech not available');
        }
        return;
      }

      const data = await response.json();
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      
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
      // Try Web Speech as last resort
      const success = playWithWebSpeech(shlok.modern_story || '');
      if (!success) {
        toast({
          title: 'Audio Not Available',
          description: 'Text-to-speech is not available. Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (usingWebSpeech) {
      window.speechSynthesis.cancel();
      setUsingWebSpeech(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
  };

  if (!shlok.modern_story) return null;

  const paragraphs = shlok.modern_story.split('\n\n');

  return (
    <Card className="mb-8 border-0 shadow-xl overflow-hidden animate-fade-in animation-delay-300">
      {/* Decorative gradient header */}
      <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
      
      <CardContent className="p-0">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-secondary/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
              <BookText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Modern Story</h3>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                A contemporary example of this wisdom
              </p>
            </div>
          </div>
          
          {/* Audio Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={handlePlayPause}
              disabled={isLoading}
              className="gap-2 min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span>Listen</span>
                </>
              )}
            </Button>
            
            {(isPlaying || progress > 0) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStop}
                className="h-9 w-9"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {(isPlaying || progress > 0) && (
          <div className="px-6">
            <Progress value={progress} className="h-1.5 rounded-full" />
          </div>
        )}

        {/* Story content */}
        <div className="p-6 pt-4">
          <div className={`prose prose-lg max-w-none transition-all duration-500 ${
            isExpanded ? '' : 'max-h-48 overflow-hidden relative'
          }`}>
            {paragraphs.map((paragraph, index) => (
              <p 
                key={index} 
                className={`text-foreground leading-relaxed mb-4 last:mb-0 ${
                  index === 0 ? 'first-letter:text-3xl first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left first-letter:leading-none' : ''
                }`}
              >
                {paragraph}
              </p>
            ))}
            
            {!isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent" />
            )}
          </div>
          
          {paragraphs.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 text-primary"
            >
              {isExpanded ? 'Show Less' : 'Read Full Story'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
