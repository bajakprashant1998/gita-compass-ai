import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquareQuote, Quote, Globe, Loader2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { Shlok } from '@/types';

interface MeaningSectionProps {
  shlok: Shlok;
}

interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
}

interface ShlokTranslation {
  meaning: string | null;
  life_application: string | null;
  practical_action: string | null;
  modern_story: string | null;
  problem_context: string | null;
  solution_gita: string | null;
}

async function getLanguages(): Promise<Language[]> {
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .eq('enabled', true)
    .order('display_order');
  
  if (error) throw error;
  return data || [];
}

async function getShlokTranslation(shlokId: string, languageCode: string): Promise<ShlokTranslation | null> {
  const { data, error } = await supabase
    .from('shlok_translations')
    .select('meaning, life_application, practical_action, modern_story, problem_context, solution_gita')
    .eq('shlok_id', shlokId)
    .eq('language_code', languageCode)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export function MeaningSection({ shlok }: MeaningSectionProps) {
  const [language, setLanguage] = useState<string>('en');

  // Fetch available languages
  const { data: languages = [], isLoading: languagesLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch translation when language changes (only for non-default languages)
  const { data: translation, isLoading: translationLoading, error: translationError } = useQuery({
    queryKey: ['shlok-translation', shlok.id, language],
    queryFn: () => getShlokTranslation(shlok.id, language),
    enabled: language !== 'en' && language !== 'hi', // Only fetch for other languages
    staleTime: 5 * 60 * 1000,
  });

  // Get the meaning based on selected language
  const getMeaning = () => {
    if (language === 'en') {
      return shlok.english_meaning;
    }
    if (language === 'hi') {
      return shlok.hindi_meaning || 'Hindi meaning not available';
    }
    // For other languages, use translation from database
    if (translation?.meaning) {
      return translation.meaning;
    }
    return null;
  };

  const meaning = getMeaning();
  const selectedLang = languages.find(l => l.code === language);
  const isLoading = languagesLoading || (translationLoading && language !== 'en' && language !== 'hi');

  return (
    <Card className="mb-8 border-0 shadow-lg animate-fade-in animation-delay-200 overflow-hidden">
      {/* Gradient top border */}
      <div className="h-1 bg-gradient-to-r from-secondary via-accent to-secondary" />
      
      <CardContent className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-secondary to-accent text-secondary-foreground">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Meaning & Interpretation</h3>
              <p className="text-xs text-muted-foreground">Understanding the verse</p>
            </div>
          </div>
          
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-44 h-10 bg-card border-2 border-border/50 hover:border-primary/30 transition-colors">
                <SelectValue placeholder="Select language">
                  {selectedLang ? (
                    <span className="flex items-center gap-2">
                      <span>{selectedLang.native_name}</span>
                      <span className="text-xs text-muted-foreground">({selectedLang.name})</span>
                    </span>
                  ) : (
                    'Select language'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{lang.native_name}</span>
                      <span className="text-xs text-muted-foreground">({lang.name})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading translation...</span>
          </div>
        )}

        {/* Error State */}
        {translationError && (
          <div className="flex items-center gap-2 text-destructive py-4">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load translation. Please try again.</span>
          </div>
        )}

        {/* Translation Not Available */}
        {!isLoading && !translationError && meaning === null && (
          <div className="relative pl-6 border-l-4 border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 rounded-r-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Translation not available in {selectedLang?.name || 'this language'}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  We're working on adding more translations. Check back later or switch to English/Hindi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meaning Content */}
        {!isLoading && !translationError && meaning && (
          <div className="relative pl-6 border-l-4 border-primary/30">
            <Quote className="absolute -left-3 -top-2 h-6 w-6 text-primary/20 fill-primary/10" />
            <div className={`text-lg md:text-xl leading-relaxed transition-all duration-300 ${
              language === 'hi' || language === 'sa' ? 'sanskrit' : ''
            }`}>
              <p className="text-foreground">{meaning}</p>
            </div>
            
            {/* Language indicator */}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded-full bg-muted">
                {selectedLang?.native_name || language.toUpperCase()}
              </span>
              {language !== 'en' && (
                <span className="text-primary cursor-pointer hover:underline" onClick={() => setLanguage('en')}>
                  View in English
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
