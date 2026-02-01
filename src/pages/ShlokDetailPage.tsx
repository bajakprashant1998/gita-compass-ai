import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { getShlokByChapterAndVerse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { SEOHead, generateArticleSchema, generateBreadcrumbSchema } from '@/components/SEOHead';

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
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link to={`/chapters/${chapterNum}`} className="inline-block mb-6">
            <Button variant="ghost" className="gap-2 group hover:bg-primary/10">
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Chapter {chapterNum}
            </Button>
          </Link>

          {/* Page Header with Breadcrumbs */}
          <ShlokHeader shlok={shlok} />

          {/* Sanskrit Verse with Transliteration Toggle */}
          <SanskritVerse shlok={shlok} />

          {/* Actual Meaning with Language Switcher */}
          <MeaningSection shlok={shlok} />

          {/* Problem Tags (Clickable Navigation) */}
          <ProblemTags problems={shlok.problems || []} />

          {/* Problem → Solution Flow */}
          <ProblemSolutionFlow shlok={shlok} />

          {/* Modern Story / Example */}
          <ModernStory shlok={shlok} />

          {/* Life Application Box */}
          <LifeApplicationBox shlok={shlok} />

          {/* Share as Wisdom Card */}
          <ShareWisdomCard shlok={shlok} />

          {/* Downloadable Wisdom Card Generator */}
          <WisdomCardGenerator shlok={shlok} />

          {/* Actions (Save, Ask AI) */}
          <ShlokActions shlokId={shlok.id} />
        </div>
      </div>

      {/* Bottom Navigation */}
      <VerseNavigation chapterNumber={chapterNum} verseNumber={verseNum} />
    </Layout>
  );
}
