import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const audioCache = new Map<string, string>();

export function useVerseAudio(shlokId: string, sanskritText: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const play = useCallback(async () => {
    // If already playing, stop
    if (isPlaying && audioRef.current) {
      stop();
      return;
    }

    // Check cache
    let audioUrl = audioCache.get(shlokId);

    if (!audioUrl) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('google-tts', {
          body: { text: sanskritText, language: 'sanskrit' },
        });

        if (error) throw error;
        if (!data?.audioContent) throw new Error('No audio received');

        // Convert base64 to blob URL
        const byteCharacters = atob(data.audioContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mp3' });
        audioUrl = URL.createObjectURL(blob);
        audioCache.set(shlokId, audioUrl);
      } catch (err) {
        console.error('TTS error:', err);
        toast.error('Could not load audio. Please try again.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    // Play audio
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }
    audioRef.current.src = audioUrl;
    await audioRef.current.play();
    setIsPlaying(true);
  }, [shlokId, sanskritText, isPlaying, stop]);

  return { play, stop, isPlaying, isLoading };
}
