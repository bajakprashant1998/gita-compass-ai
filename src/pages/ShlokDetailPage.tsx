import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
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

// Section navigation items
const sections = [
  { id: 'sanskrit', icon: BookOpen, label: 'Sanskrit' },
  { id: 'meaning', icon: MessageSquare, label: 'Meaning' },
  { id: 'story', icon: Lightbulb, label: 'Story' },
  { id: 'application', icon: Heart, label: 'Apply' },
];

export default function ShlokDetailPage() {
  const { chapterNumber, verseNumber } = useParams<{ chapterNumber: string; verseNumber: string }>();
  const chapterNum = parseInt(chapterNumber || '1');
  const verseNum = parseInt(verseNumber || '1');

  const { data: shlok, isLoading } = useQuery({
    queryKey: ['shlok-by-verse', chapterNum, verseNum],
    queryFn: () => getShlokByChapterAndVerse(chapterNum, verseNum),
    enabled: !!chapterNum && !!verseNum,
  });

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
            {/* Back Navigation */}
            <Link to={`/chapters/${chapterNum}`} className="inline-block mb-6">
              <Button variant="ghost" className="gap-2 group hover:bg-primary/10 border border-transparent hover:border-primary/20">
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Chapter {chapterNum}
              </Button>
            </Link>

            {/* Page Header with Breadcrumbs */}
            <ShlokHeader shlok={shlok} />

            {/* Sanskrit Verse with Transliteration Toggle */}
            <div id="sanskrit">
              <SanskritVerse shlok={shlok} />
            </div>

            {/* Actual Meaning with Language Switcher */}
            <div id="meaning">
              <MeaningSection shlok={shlok} />
            </div>

            {/* Problem Tags (Clickable Navigation) */}
            <ProblemTags problems={shlok.problems || []} />

            {/* Problem → Solution Flow */}
            <ProblemSolutionFlow shlok={shlok} />

            {/* Modern Story / Example */}
            <div id="story">
              <ModernStory shlok={shlok} />
            </div>

            {/* Life Application Box */}
            <div id="application">
              <LifeApplicationBox shlok={shlok} />
            </div>

            {/* Share as Wisdom Card */}
            <ShareWisdomCard shlok={shlok} />

            {/* Downloadable Wisdom Card Generator */}
            <WisdomCardGenerator shlok={shlok} />

            {/* Actions (Save, Ask AI) */}
            <ShlokActions shlokId={shlok.id} />
            
            {/* Chapter Progress Indicator */}
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-background to-amber-50/30 dark:from-primary/10 dark:via-background dark:to-amber-900/10 border border-border/50">
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
                  className="h-full bg-gradient-to-r from-primary via-amber-500 to-orange-500 rounded-full transition-all duration-500"
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
