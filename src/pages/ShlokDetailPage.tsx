import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { getShlokByChapterAndVerse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BookOpen, Lightbulb, MessageSquare, Heart, Sparkles } from 'lucide-react';
import { SEOHead, generateArticleSchema, generateBreadcrumbSchema } from '@/components/SEOHead';
import { FloatingOm, RadialGlow } from '@/components/ui/decorative-elements';

// Modular components
import { ShlokHeader } from '@/components/shlok/ShlokHeader';
import { SanskritVerse } from '@/components/shlok/SanskritVerse';
import { MeaningSection } from '@/components/shlok/MeaningSection';
import { ProblemTags } from '@/components/shlok/ProblemTags';
import { ProblemSolutionFlow } from '@/components/shlok/ProblemSolutionFlow';
import { ModernStory } from '@/components/shlok/ModernStory';
import { LifeApplicationBox } from '@/components/shlok/LifeApplicationBox';
import { ShareWisdomCard } from '@/components/shlok/ShareWisdomCard';
import { ShlokActions } from '@/components/shlok/ShlokActions';
import { WisdomCardGenerator } from '@/components/shlok/WisdomCardGenerator';
import { ReadingProgress } from '@/components/shlok/ReadingProgress';
import { VerseNavigation } from '@/components/shlok/VerseNavigation';
import { PageLanguageSelector, getScriptClass, isRTL } from '@/components/shlok/PageLanguageSelector';
import { TranslatableContent } from '@/components/shlok/TranslatableContent';
import { Card, CardContent } from '@/components/ui/card';
import { Target, ArrowRight } from 'lucide-react';

// Section navigation items
const sections = [
  { id: 'sanskrit', icon: BookOpen, label: 'Sanskrit' },
  { id: 'meaning', icon: MessageSquare, label: 'Meaning' },
  { id: 'story', icon: Lightbulb, label: 'Story' },
  { id: 'application', icon: Heart, label: 'Apply' },
];

interface TranslatedContent {
  meaning?: string;
  lifeApplication?: string;
  practicalAction?: string;
  modernStory?: string;
  problemContext?: string;
  solutionGita?: string;
}

export default function ShlokDetailPage() {
  const { chapterNumber, verseNumber } = useParams<{ chapterNumber: string; verseNumber: string }>();
  const chapterNum = parseInt(chapterNumber || '1');
  const verseNum = parseInt(verseNumber || '1');

  const { data: shlok, isLoading } = useQuery({
    queryKey: ['shlok-by-verse', chapterNum, verseNum],
    queryFn: () => getShlokByChapterAndVerse(chapterNum, verseNum),
    enabled: !!chapterNum && !!verseNum,
  });

  // Translation state
  const [translatedContent, setTranslatedContent] = useState<TranslatedContent | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Reset translation when shlok changes
  useEffect(() => {
    setTranslatedContent(null);
    setCurrentLanguage('en');
  }, [shlok?.id]);

  const handleTranslated = useCallback((content: TranslatedContent, langCode: string) => {
    setTranslatedContent(content);
    setCurrentLanguage(langCode);
  }, []);

  const handleReset = useCallback(() => {
    setTranslatedContent(null);
    setCurrentLanguage('en');
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'ArrowLeft') {
        if (verseNum > 1) {
          window.location.href = `/chapters/${chapterNum}/verse/${verseNum - 1}`;
        } else if (chapterNum > 1) {
          window.location.href = `/chapters/${chapterNum - 1}`;
        }
      } else if (e.key === 'ArrowRight') {
        window.location.href = `/chapters/${chapterNum}/verse/${verseNum + 1}`;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapterNum, verseNum]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!shlok) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Verse not found</h1>
          <p className="text-muted-foreground mb-4">
            Chapter {chapterNum}, Verse {verseNum} could not be found.
          </p>
          <Link to="/chapters">
            <Button>Browse Chapters</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Get display content (translated or original)
  const displayContent = {
    meaning: translatedContent?.meaning || shlok.english_meaning,
    lifeApplication: translatedContent?.lifeApplication || shlok.life_application,
    practicalAction: translatedContent?.practicalAction || shlok.practical_action,
    modernStory: translatedContent?.modernStory || shlok.modern_story,
    problemContext: translatedContent?.problemContext || shlok.problem_context,
    solutionGita: translatedContent?.solutionGita || shlok.solution_gita,
  };

  const scriptClass = getScriptClass(currentLanguage);
  const rtl = isRTL(currentLanguage);

  // Generate structured data
  const articleSchema = generateArticleSchema({
    chapter_number: chapterNum,
    verse_number: verseNum,
    english_meaning: shlok.english_meaning,
    life_application: shlok.life_application || undefined,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://www.bhagavadgitagyan.com' },
    { name: `Chapter ${chapterNum}`, url: `https://www.bhagavadgitagyan.com/chapters/${chapterNum}` },
    { name: `Verse ${verseNum}`, url: `https://www.bhagavadgitagyan.com/chapters/${chapterNum}/verse/${verseNum}` },
  ]);

  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [articleSchema, breadcrumbSchema],
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Layout>
      {/* Reading Progress Bar */}
      <ReadingProgress />
      
      <SEOHead
        title={`Chapter ${chapterNum}, Verse ${verseNum} - ${shlok.life_application || 'Bhagavad Gita'}`}
        description={shlok.english_meaning.substring(0, 155) + '...'}
        canonicalUrl={`https://www.bhagavadgitagyan.com/chapters/${chapterNum}/verse/${verseNum}`}
        keywords={['Bhagavad Gita', `Chapter ${chapterNum}`, `Verse ${verseNum}`, 'wisdom', 'guidance']}
        structuredData={combinedSchema}
        type="article"
      />

      {/* Floating Section Navigation - Desktop only */}
      <div className="section-indicator">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="section-dot group relative"
            title={section.label}
          >
            <span className="absolute right-full mr-3 px-2 py-1 rounded bg-card border text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {section.label}
            </span>
          </button>
        ))}
      </div>
      
      {/* Main Content with Decorative Elements */}
      <div className="relative overflow-hidden">
        {/* Decorative floating elements */}
        <FloatingOm className="top-40 -left-10 animate-float hidden xl:block" />
        <FloatingOm className="top-96 -right-10 animate-float animation-delay-500 hidden xl:block" />
        <RadialGlow position="top-right" color="primary" className="opacity-30" />
        <RadialGlow position="bottom-left" color="amber" className="opacity-20" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24 relative">
          <div className="max-w-4xl mx-auto">
            {/* Back Navigation + Language Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <Link to={`/chapters/${chapterNum}`}>
                <Button variant="ghost" className="gap-2 group hover:bg-primary/10 border border-transparent hover:border-primary/20">
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Chapter {chapterNum}
                </Button>
              </Link>

              {/* Page-Level Language Translator */}
              <PageLanguageSelector
                originalContent={{
                  meaning: shlok.english_meaning,
                  hindiMeaning: shlok.hindi_meaning,
                  lifeApplication: shlok.life_application,
                  practicalAction: shlok.practical_action,
                  modernStory: shlok.modern_story,
                  problemContext: shlok.problem_context,
                  solutionGita: shlok.solution_gita,
                }}
                onTranslated={handleTranslated}
                onReset={handleReset}
              />
            </div>

            {/* Page Header with Breadcrumbs */}
            <ShlokHeader shlok={shlok} />

            {/* Sanskrit Verse with Transliteration Toggle */}
            <div id="sanskrit">
              <SanskritVerse shlok={shlok} />
            </div>

            {/* Actual Meaning - Using translated content if available */}
            <div id="meaning">
              <Card className="mb-8 border-0 shadow-lg animate-fade-in animation-delay-200 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-secondary via-accent to-secondary" />
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-secondary to-accent text-secondary-foreground">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Meaning & Interpretation</h3>
                      <p className="text-xs text-muted-foreground">Understanding the verse</p>
                    </div>
                  </div>

                  <div className="relative pl-6 border-l-4 border-primary/30">
                    <TranslatableContent 
                      languageCode={currentLanguage}
                      className="text-lg md:text-xl leading-relaxed text-foreground"
                    >
                      {displayContent.meaning}
                    </TranslatableContent>
                    
                    {currentLanguage !== 'en' && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded-full bg-primary/10 text-primary ${scriptClass}`}>
                          Translated
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Problem Tags (Clickable Navigation) */}
            <ProblemTags problems={shlok.problems || []} />

            {/* Problem → Solution Flow - with translation support */}
            {(displayContent.problemContext || displayContent.solutionGita) && (
              <div className="mb-8 space-y-4">
                {displayContent.problemContext && (
                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">The Problem</h4>
                      <TranslatableContent languageCode={currentLanguage} className="text-foreground">
                        {displayContent.problemContext}
                      </TranslatableContent>
                    </CardContent>
                  </Card>
                )}
                {displayContent.solutionGita && (
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">Gita's Solution</h4>
                      <TranslatableContent languageCode={currentLanguage} className="text-foreground">
                        {displayContent.solutionGita}
                      </TranslatableContent>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Modern Story / Example - with translation support */}
            {displayContent.modernStory && (
              <div id="story">
                <Card className="mb-8 border-0 shadow-xl overflow-hidden animate-fade-in animation-delay-300">
                  <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Modern Story</h3>
                        <p className="text-sm text-muted-foreground">A contemporary example</p>
                      </div>
                    </div>
                    <div className="prose prose-lg max-w-none">
                      <TranslatableContent languageCode={currentLanguage} className="text-foreground leading-relaxed">
                        {displayContent.modernStory}
                      </TranslatableContent>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Life Application Box - with translation support */}
            <div id="application" className="space-y-6 mb-8 animate-fade-in animation-delay-400">
              {displayContent.lifeApplication && (
                <Card className="metric-card border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className="shrink-0 p-4 rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-lg">
                        <Lightbulb className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-bold text-xl text-primary">Life Application</h3>
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">Key Takeaway</span>
                        </div>
                        <TranslatableContent 
                          languageCode={currentLanguage}
                          className="text-lg md:text-xl leading-relaxed font-medium text-foreground"
                        >
                          {displayContent.lifeApplication}
                        </TranslatableContent>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {displayContent.practicalAction && (
                <Card className="metric-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className="shrink-0 p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                        <Target className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-bold text-xl text-green-700 dark:text-green-400">Today's Action</h3>
                          <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-semibold">
                            DO THIS
                          </span>
                        </div>
                        <TranslatableContent 
                          languageCode={currentLanguage}
                          className="text-lg md:text-xl leading-relaxed text-foreground"
                        >
                          {displayContent.practicalAction}
                        </TranslatableContent>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Share as Wisdom Card */}
            <ShareWisdomCard shlok={shlok} />

            {/* Downloadable Wisdom Card Generator */}
            <WisdomCardGenerator shlok={shlok} />

            {/* Actions (Save, Ask AI) */}
            <ShlokActions shlokId={shlok.id} />
            
            {/* Chapter Progress Indicator */}
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-background to-accent/10 dark:from-primary/10 dark:via-background dark:to-accent/5 border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Chapter {chapterNum} Progress
                </span>
                <span className="text-sm font-bold text-primary">
                  Verse {verseNum}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((verseNum / 47) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                Keep exploring to unlock more wisdom
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <VerseNavigation chapterNumber={chapterNum} verseNumber={verseNum} />
    </Layout>
  );
}
