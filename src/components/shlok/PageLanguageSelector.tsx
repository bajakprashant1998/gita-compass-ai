import { useState, useEffect } from 'react';
import { Globe, Languages, Check, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// Supported languages with native names and script classes
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', scriptClass: '' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', scriptClass: 'font-hindi' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', scriptClass: 'font-tamil' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', scriptClass: 'font-telugu' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', scriptClass: 'font-bengali' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', scriptClass: 'font-hindi' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', scriptClass: 'font-gujarati' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', scriptClass: 'font-kannada' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', scriptClass: 'font-malayalam' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', scriptClass: 'font-punjabi' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', scriptClass: 'font-odia' },
  { code: 'ur', name: 'Urdu', native: 'اردو', scriptClass: 'font-urdu', rtl: true },
];

interface TranslatedContent {
  meaning?: string;
  lifeApplication?: string;
  practicalAction?: string;
  modernStory?: string;
  problemContext?: string;
  solutionGita?: string;
}

interface PageLanguageSelectorProps {
  originalContent: {
    meaning: string;
    hindiMeaning?: string | null;
    lifeApplication?: string | null;
    practicalAction?: string | null;
    modernStory?: string | null;
    problemContext?: string | null;
    solutionGita?: string | null;
  };
  onTranslated: (content: TranslatedContent, langCode: string) => void;
  onReset: () => void;
}

export function PageLanguageSelector({ originalContent, onTranslated, onReset }: PageLanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  // Load preferred language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shlok-page-language');
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      setSelectedLanguage(saved);
    }
  }, []);

  const translateContent = async (text: string, targetLang: string): Promise<string> => {
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

    // Save preference
    localStorage.setItem('shlok-page-language', langCode);
    setSelectedLanguage(langCode);

    // If English, reset to original
    if (langCode === 'en') {
      onReset();
      return;
    }

    // If Hindi and we have Hindi content, use it directly
    if (langCode === 'hi' && originalContent.hindiMeaning) {
      onTranslated({
        meaning: originalContent.hindiMeaning,
        // Other fields would need translation
      }, langCode);
      
      // Translate remaining fields
      setIsTranslating(true);
      try {
        const translations: TranslatedContent = {
          meaning: originalContent.hindiMeaning,
        };

        // Translate other fields in parallel
        const fieldsToTranslate = [
          { key: 'lifeApplication', value: originalContent.lifeApplication },
          { key: 'practicalAction', value: originalContent.practicalAction },
          { key: 'modernStory', value: originalContent.modernStory },
          { key: 'problemContext', value: originalContent.problemContext },
          { key: 'solutionGita', value: originalContent.solutionGita },
        ].filter(f => f.value);

        const results = await Promise.all(
          fieldsToTranslate.map(f => translateContent(f.value!, langCode))
        );

        fieldsToTranslate.forEach((field, index) => {
          (translations as any)[field.key] = results[index];
        });

        onTranslated(translations, langCode);
      } catch (error) {
        console.error('Translation error:', error);
        toast({
          title: 'Translation Error',
          description: 'Some content could not be translated. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsTranslating(false);
      }
      return;
    }

    // Translate all content to selected language
    setIsTranslating(true);
    try {
      const fieldsToTranslate = [
        { key: 'meaning', value: originalContent.meaning },
        { key: 'lifeApplication', value: originalContent.lifeApplication },
        { key: 'practicalAction', value: originalContent.practicalAction },
        { key: 'modernStory', value: originalContent.modernStory },
        { key: 'problemContext', value: originalContent.problemContext },
        { key: 'solutionGita', value: originalContent.solutionGita },
      ].filter(f => f.value);

      const results = await Promise.all(
        fieldsToTranslate.map(f => translateContent(f.value!, langCode))
      );

      const translations: TranslatedContent = {};
      fieldsToTranslate.forEach((field, index) => {
        (translations as any)[field.key] = results[index];
      });

      onTranslated(translations, langCode);
      
      toast({
        title: 'Content Translated',
        description: `Page content translated to ${SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name}`,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Translation Failed',
        description: 'Could not translate content. Please try again.',
        variant: 'destructive',
      });
      setSelectedLanguage('en');
      onReset();
    } finally {
      setIsTranslating(false);
    }
  };

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-2 border-primary/20 hover:border-primary/40 bg-background/80 backdrop-blur-sm"
            disabled={isTranslating}
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Languages className="h-4 w-4 text-primary" />
                <span className={currentLang?.scriptClass}>
                  {currentLang?.native || 'English'}
                </span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Select Language
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SUPPORTED_LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center justify-between cursor-pointer ${lang.rtl ? 'text-right' : ''}`}
              dir={lang.rtl ? 'rtl' : 'ltr'}
            >
              <span className="flex items-center gap-2">
                <span className={`font-medium ${lang.scriptClass}`}>{lang.native}</span>
                <span className="text-xs text-muted-foreground">({lang.name})</span>
              </span>
              {selectedLanguage === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedLanguage !== 'en' && !isTranslating && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleLanguageChange('en')}
          className="gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" />
          Original
        </Button>
      )}
    </div>
  );
}

export function getScriptClass(langCode: string): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.scriptClass || '';
}

export function isRTL(langCode: string): boolean {
  return SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.rtl || false;
}
