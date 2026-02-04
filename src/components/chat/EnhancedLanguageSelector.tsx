import { useState, useEffect } from 'react';
import { Globe, Check, ChevronDown, Sparkles, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  greeting?: string;
}

export const INDIAN_LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto-detect', nativeName: 'Auto', script: 'Latin', greeting: '🔮 Let AI detect your language' },
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', greeting: 'Hello! How can I help?' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', greeting: 'नमस्ते! मैं कैसे मदद कर सकता हूं?' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', greeting: 'வணக்கம்! நான் எப்படி உதவ முடியும்?' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', greeting: 'నమస్కారం! నేను ఎలా సహాయం చేయగలను?' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', greeting: 'নমস্কার! আমি কিভাবে সাহায্য করতে পারি?' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', greeting: 'नमस्कार! मी कशी मदत करू शकतो?' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', greeting: 'નમસ્તે! હું કેવી રીતે મદદ કરી શકું?' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', greeting: 'ನಮಸ್ಕಾರ! ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', greeting: 'നമസ്കാരം! ഞാൻ എങ്ങനെ സഹായിക്കാം?' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', greeting: 'ନମସ୍କାର! ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରେ?' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali', greeting: 'নমস্কাৰ! মই কেনেকৈ সহায় কৰিব পাৰোঁ?' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Arabic', greeting: 'السلام علیکم! میں کیسے مدد کر سکتا ہوں؟' },
];

const STORAGE_KEY = 'gita-preferred-language';

interface EnhancedLanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (langCode: string) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'prominent';
}

export function EnhancedLanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled,
  className,
  variant = 'default',
}: EnhancedLanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = INDIAN_LANGUAGES.find(l => l.code === selectedLanguage) || INDIAN_LANGUAGES[0];

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && INDIAN_LANGUAGES.find(l => l.code === saved)) {
      onLanguageChange(saved);
    }
  }, []);

  // Save preference when changed
  const handleLanguageChange = (langCode: string) => {
    onLanguageChange(langCode);
    localStorage.setItem(STORAGE_KEY, langCode);
    setIsOpen(false);
    
    const lang = INDIAN_LANGUAGES.find(l => l.code === langCode);
    if (lang && lang.greeting) {
      toast.success(lang.greeting, {
        icon: <Globe className="h-4 w-4" />,
        duration: 2000,
      });
    }
  };

  // Group languages by script type for better organization
  const popularLanguages = INDIAN_LANGUAGES.filter(l => 
    ['auto', 'en', 'hi', 'ta', 'te', 'bn'].includes(l.code)
  );
  const otherLanguages = INDIAN_LANGUAGES.filter(l => 
    !['auto', 'en', 'hi', 'ta', 'te', 'bn'].includes(l.code)
  );

  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className={cn(
              "h-9 w-9 rounded-full hover:bg-primary/10",
              className
            )}
          >
            <Globe className="h-4 w-4 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 max-h-[400px] overflow-y-auto">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Response Language</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {INDIAN_LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "flex items-center justify-between cursor-pointer",
                selectedLanguage === lang.code && "bg-primary/10"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </div>
              {selectedLanguage === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'prominent') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "gap-3 min-w-[180px] h-12 justify-between",
              "bg-gradient-to-r from-primary/5 to-amber-500/5",
              "border-primary/20 hover:border-primary/50",
              "hover:bg-gradient-to-r hover:from-primary/10 hover:to-amber-500/10",
              "transition-all duration-300",
              className
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Language</p>
                <p className="font-semibold text-sm">
                  {currentLang.code === 'auto' ? 'Auto-detect' : currentLang.nativeName}
                </p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 max-h-[450px] overflow-y-auto">
          <DropdownMenuLabel className="flex items-center gap-2 pb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <div>
              <p className="font-semibold">Choose Your Language</p>
              <p className="text-xs text-muted-foreground font-normal">AI will respond in your preferred language</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Popular</DropdownMenuLabel>
            {popularLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "flex items-center justify-between cursor-pointer py-3",
                  selectedLanguage === lang.code && "bg-primary/10 border-l-2 border-primary"
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                </div>
                {selectedLanguage === lang.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">More Languages</DropdownMenuLabel>
            {otherLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "flex items-center justify-between cursor-pointer py-3",
                  selectedLanguage === lang.code && "bg-primary/10 border-l-2 border-primary"
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                </div>
                {selectedLanguage === lang.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "gap-2 min-w-[140px] justify-between",
            "hover:bg-primary/5 hover:border-primary/50 transition-all",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {currentLang.code === 'auto' ? 'Auto' : currentLang.nativeName}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Select response language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {INDIAN_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              selectedLanguage === lang.code && "bg-primary/10"
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </div>
            {selectedLanguage === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
