import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Languages, Sparkles, Volume2, Loader2, Pause, Copy, Check } from 'lucide-react';
import type { Shlok } from '@/types';
import { useVerseAudio } from '@/hooks/useVerseAudio';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SanskritVerseProps {
  shlok: Shlok;
}

export function SanskritVerse({ shlok }: SanskritVerseProps) {
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [copied, setCopied] = useState(false);
  const { play, isPlaying, isLoading: audioLoading } = useVerseAudio(shlok.id, shlok.sanskrit_text);

  const handleCopySanskrit = async () => {
    await navigator.clipboard.writeText(shlok.sanskrit_text);
    setCopied(true);
    toast.success('Sanskrit text copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mb-8 overflow-hidden border-0 shadow-xl animate-fade-in group">
      {/* Gradient header bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
      
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 md:px-10 md:py-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm uppercase tracking-wider text-primary">
                Original Sanskrit
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">Sacred Scripture</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Copy Sanskrit */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopySanskrit}
              className="gap-1.5 text-muted-foreground hover:text-foreground h-9"
              title="Copy Sanskrit text"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline text-xs">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
            {/* Audio play button */}
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={play}
              disabled={audioLoading}
              className="gap-1.5 transition-all duration-300 h-9"
            >
              {audioLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              <span className="hidden sm:inline text-xs">
                {audioLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Listen'}
              </span>
            </Button>
            {shlok.transliteration && (
              <Button
                variant={showTransliteration ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTransliteration(!showTransliteration)}
                className="gap-1.5 transition-all duration-300 h-9"
              >
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">
                  {showTransliteration ? 'Hide' : 'Romanized'}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Sanskrit text with decorative elements */}
        <div className="relative px-6 sm:px-8 md:px-12 py-8 sm:py-10 bg-gradient-to-br from-primary/5 via-background to-amber-50/30 dark:from-primary/10 dark:via-background dark:to-amber-900/10">
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/20 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/20 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/20 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/20 rounded-br-lg" />

          <Sparkles className="absolute top-6 left-8 h-4 w-4 text-primary/20" />
          <Sparkles className="absolute bottom-6 right-8 h-4 w-4 text-primary/20" />
           
          <blockquote 
            className="text-xl sm:text-2xl lg:text-3xl font-bold sanskrit leading-loose text-center whitespace-pre-line select-all" 
            lang="sa"
            style={{
              backgroundImage: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(35, 90%, 50%) 50%, hsl(var(--primary)) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {shlok.sanskrit_text}
          </blockquote>

          {/* Playing indicator */}
          {isPlaying && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-1 mt-4"
            >
              {[1, 2, 3, 4, 5].map(i => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-primary"
                  animate={{ height: [4, 16, 4] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Transliteration section with smooth animation */}
        <div className={`overflow-hidden transition-all duration-500 ease-out ${
          showTransliteration ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-6 sm:px-8 md:px-12 py-6 border-t border-border/30 bg-muted/30">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Transliteration</p>
            <p className="text-center text-muted-foreground italic whitespace-pre-line leading-relaxed text-base sm:text-lg">
              {shlok.transliteration}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
