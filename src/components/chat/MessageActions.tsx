import { useState } from 'react';
import { Copy, Check, Share2, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  content: string;
  className?: string;
  onTranslate?: (language: string, content: string) => void;
}

const languages = [
  { code: 'hi', name: 'हिंदी', label: 'Hindi' },
  { code: 'en', name: 'English', label: 'English' },
];

export function MessageActions({ content, className, onTranslate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bhagavad Gita Wisdom',
          text: content.slice(0, 280),
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } catch (error: unknown) {
        // Only show fallback if not user cancelled
        if (error instanceof Error && error.name !== 'AbortError') {
          await handleCopy();
        }
        // User cancelled - do nothing
      }
    } else {
      // No native share API - fallback to copy
      await handleCopy();
      toast.info('Content copied (sharing not available on this device)');
    }
  };

  const handleTranslate = (langCode: string) => {
    setIsTranslateOpen(false);
    if (onTranslate) {
      onTranslate(langCode, content);
    } else {
      toast.info(`Translation to ${langCode === 'hi' ? 'Hindi' : 'English'} coming soon`);
    }
  };

  return (
    <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={handleShare}
        title="Share"
      >
        <Share2 className="h-3.5 w-3.5" />
      </Button>

      <Popover open={isTranslateOpen} onOpenChange={setIsTranslateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
            title="Translate"
          >
            <Languages className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-2" align="end">
          <div className="space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleTranslate(lang.code)}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
              >
                <span>{lang.name}</span>
                <span className="text-xs text-muted-foreground">{lang.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
