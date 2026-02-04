import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookText, Volume2, Pause, Square, Loader2, Sparkles, Globe, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { Shlok } from '@/types';

// Supported languages with Google TTS language codes
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', ttsCode: 'en-US' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', ttsCode: 'hi-IN', scriptClass: 'font-hindi' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', ttsCode: 'ta-IN', scriptClass: 'font-tamil' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', ttsCode: 'te-IN', scriptClass: 'font-telugu' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', ttsCode: 'bn-IN', scriptClass: 'font-bengali' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', ttsCode: 'mr-IN', scriptClass: 'font-hindi' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', ttsCode: 'gu-IN', scriptClass: 'font-gujarati' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', ttsCode: 'kn-IN', scriptClass: 'font-kannada' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', ttsCode: 'ml-IN', scriptClass: 'font-malayalam' },
];

interface ModernStoryProps {
  shlok: Shlok;
}

export function ModernStory({ shlok }: ModernStoryProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedStory, setTranslatedStory] = useState<string | null>(null);
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

  // Reset audio when language changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [selectedLanguage]);

  const translateStory = async (text: string, targetLang: string): Promise<string> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ content: text, targetLanguage: targetLang }),
      }
    );

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    return data.translatedContent;
  };

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === selectedLanguage) return;

    setSelectedLanguage(langCode);

    // Reset audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setProgress(0);
    }

    // If English, use original
    if (langCode === 'en') {
      setTranslatedStory(null);
      return;
    }

    // Translate using Gemini
    setIsTranslating(true);
    try {
      const translated = await translateStory(shlok.modern_story!, langCode);
      setTranslatedStory(translated);
      toast({
        title: 'Story Translated',
        description: `Story translated to ${SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name}`,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Translation Failed',
        description: 'Could not translate the story. Please try again.',
        variant: 'destructive',
      });
      setSelectedLanguage('en');
      setTranslatedStory(null);
    } finally {
      setIsTranslating(false);
    }
  };

  // Web Speech API fallback
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const useBrowserTTS = (text: string, langCode: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Browser does not support speech synthesis'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthRef.current = utterance;

      // Map language codes to BCP 47 tags for Web Speech API
      const langMap: Record<string, string> = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'bn': 'bn-IN',
        'mr': 'mr-IN',
        'gu': 'gu-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN',
      };

      utterance.lang = langMap[langCode] || 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
        setTimeout(() => setProgress(0), 500);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsPlaying(false);
        reject(new Error(event.error));
      };

      // Simulate progress for browser TTS
      const estimatedDuration = text.length * 60; // rough estimate in ms
      let startTime = Date.now();
      const progressInterval = setInterval(() => {
        if (!isPlaying) {
          clearInterval(progressInterval);
          return;
        }
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / estimatedDuration) * 100, 95);
        setProgress(progress);
      }, 100);

      utterance.onend = () => {
        clearInterval(progressInterval);
        setIsPlaying(false);
        setProgress(100);
        setTimeout(() => setProgress(0), 500);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    });
  };

  const handlePlayPause = async () => {
    // Handle pause for browser TTS
    if (isPlaying && speechSynthRef.current) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setProgress(0);
      return;
    }

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

    // Get the text to speak (translated or original)
    const textToSpeak = translatedStory || shlok.modern_story;
    if (!textToSpeak) return;

    // Determine language for TTS
    const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);
    const language = selectedLanguage === 'en' ? 'english' : 'hindi';

    setIsLoading(true);
    try {
      // Try Google TTS first
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: textToSpeak,
            language: language,
            voice_name: langConfig?.ttsCode ? `${langConfig.ttsCode}-Neural2-A` : undefined,
          }),
        }
      );

      if (!response.ok) {
        console.warn('Google TTS failed, falling back to browser TTS');
        throw new Error('Google TTS unavailable');
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received');
      }

      // Create audio from base64
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
        // Fallback to browser TTS on playback error
        useBrowserTTS(textToSpeak, selectedLanguage).catch(() => {
          toast({
            title: 'Playback Error',
            description: 'Failed to play audio. Please try again.',
            variant: 'destructive',
          });
        });
        audioRef.current = null;
      });

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.warn('Using browser TTS fallback:', error);
      // Fallback to Web Speech API
      try {
        await useBrowserTTS(textToSpeak, selectedLanguage);
        toast({
          title: 'Using Browser Audio',
          description: 'Playing with your browser\'s built-in voice.',
        });
      } catch (fallbackError) {
        console.error('Browser TTS also failed:', fallbackError);
        toast({
          title: 'Audio Unavailable',
          description: 'Text-to-speech is not available. Please try a different browser.',
          variant: 'destructive',
        });
      }
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

  const displayStory = translatedStory || shlok.modern_story;
  const paragraphs = displayStory.split('\n\n');
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <Card className="mb-8 border-0 shadow-xl overflow-hidden animate-fade-in animation-delay-300 relative">
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

          {/* Language Selector - Desktop only */}
          <div className="hidden sm:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-2 border-primary/20 hover:border-primary/40"
                  disabled={isTranslating}
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 text-primary" />
                      <span className={currentLang?.scriptClass}>
                        {currentLang?.native || 'English'}
                      </span>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className={`font-medium ${lang.scriptClass || ''}`}>
                      {lang.native}
                    </span>
                    {selectedLanguage === lang.code && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Bar */}
        {(isPlaying || progress > 0) && (
          <div className="px-6">
            <Progress value={progress} className="h-1.5 rounded-full" />
          </div>
        )}

        {/* Story content */}
        <div className="p-6 pt-4 pb-24">
          <div className={`prose prose-lg max-w-none transition-all duration-500 ${isExpanded ? '' : 'max-h-48 overflow-hidden relative'}`}>
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={`text-foreground leading-relaxed mb-4 last:mb-0 ${currentLang?.scriptClass || ''} ${
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

        {/* Floating Audio Control Bar */}
        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-r from-secondary via-card to-secondary border-t border-primary/10 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
            {/* Language Selector - Mobile & Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-2 border-primary/20 hover:border-primary/40 flex-shrink-0"
                  disabled={isTranslating}
                >
                  {isTranslating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Globe className="h-4 w-4 text-primary" />
                      <span className={`hidden xs:inline ${currentLang?.scriptClass || ''}`}>
                        {currentLang?.native || 'English'}
                      </span>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className={`font-medium ${lang.scriptClass || ''}`}>
                      {lang.native}
                    </span>
                    {selectedLanguage === lang.code && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Progress indicator */}
            <div className="flex-1 mx-2">
              {(isPlaying || progress > 0) ? (
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {Math.round(progress)}%
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  {isTranslating ? 'Translating story...' : 'Listen to the story'}
                </p>
              )}
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                onClick={handlePlayPause}
                disabled={isLoading || isTranslating}
                className="gap-2 min-w-[90px] bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white border-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Loading</span>
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
                  size="icon"
                  onClick={handleStop}
                  className="h-9 w-9"
                >
                  <Square className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}