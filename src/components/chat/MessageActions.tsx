import { useState } from 'react';
import { Copy, Check, Share2, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  content: string;
  className?: string;
  onTranslate?: (language: string, content: string) => void;
}

const languages = [
  { code: 'hi', name: 'हिन्दी', label: 'Hindi' },
  { code: 'en', name: 'English', label: 'English' },
  { code: 'ta', name: 'தமிழ்', label: 'Tamil' },
  { code: 'te', name: 'తెలుగు', label: 'Telugu' },
  { code: 'bn', name: 'বাংলা', label: 'Bengali' },
  { code: 'mr', name: 'मराठी', label: 'Marathi' },
  { code: 'gu', name: 'ગુજરાતી', label: 'Gujarati' },
  { code: 'kn', name: 'ಕನ್ನಡ', label: 'Kannada' },
  { code: 'ml', name: 'മലയാളം', label: 'Malayalam' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', label: 'Punjabi' },
  { code: 'or', name: 'ଓଡ଼ିଆ', label: 'Odia' },
  { code: 'as', name: 'অসমীয়া', label: 'Assamese' },
  { code: 'ur', name: 'اردو', label: 'Urdu' },
];

export function MessageActions({ content, className, onTranslate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

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

  const handleTranslate = async (langCode: string) => {
    setIsTranslateOpen(false);
    
    if (onTranslate) {
      setIsTranslating(true);
      toast.loading(`Translating to ${languages.find(l => l.code === langCode)?.label}...`, { id: 'translate' });
      onTranslate(langCode, content);
      // The parent component will handle the actual translation
      setTimeout(() => {
        setIsTranslating(false);
        toast.dismiss('translate');
      }, 500);
    } else {
      const langName = languages.find(l => l.code === langCode)?.label || langCode;
      toast.info(`Translation to ${langName} coming soon`);
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
            className={cn(
              "h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors",
              isTranslating && "animate-pulse"
            )}
            title="Translate"
            disabled={isTranslating}
          >
            <Languages className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-52 p-0 bg-popover border border-border shadow-lg z-50" 
          align="end"
          sideOffset={5}
        >
          <div className="px-3 py-2 border-b border-border bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground">Translate to</p>
          </div>
          <ScrollArea className="h-[280px]">
            <div className="p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleTranslate(lang.code)}
                  className="w-full text-left px-3 py-2.5 text-sm rounded-md hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group/item"
                >
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-xs text-muted-foreground group-hover/item:text-primary/70">{lang.label}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
