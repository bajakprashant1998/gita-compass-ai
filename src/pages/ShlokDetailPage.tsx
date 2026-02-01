import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getShlok } from '@/lib/api';
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

export default function ShlokDetailPage() {
  const { shlokId } = useParams<{ shlokId: string }>();

  const { data: shlok, isLoading } = useQuery({
    queryKey: ['shlok', shlokId],
    queryFn: () => getShlok(shlokId!),
    enabled: !!shlokId,
  });

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
          <Link to="/chapters">
            <Button>Browse Chapters</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const chapterNumber = shlok.chapter?.chapter_number || 1;
  const verseNumber = shlok.verse_number;

  // Generate structured data
  const articleSchema = generateArticleSchema({
    chapter_number: chapterNumber,
    verse_number: verseNumber,
    english_meaning: shlok.english_meaning,
    life_application: shlok.life_application || undefined,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://www.bhagavadgitagyan.com' },
    { name: `Chapter ${chapterNumber}`, url: `https://www.bhagavadgitagyan.com/chapters/${chapterNumber}` },
    { name: `Verse ${verseNumber}`, url: `https://www.bhagavadgitagyan.com/shlok/${shlok.id}` },
  ]);

  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [articleSchema, breadcrumbSchema],
  };

  return (
    <Layout>
      <SEOHead
        title={`Chapter ${chapterNumber}, Verse ${verseNumber} - ${shlok.life_application || 'Bhagavad Gita'}`}
        description={shlok.english_meaning.substring(0, 155) + '...'}
        canonicalUrl={`https://www.bhagavadgitagyan.com/chapter/${chapterNumber}/verse/${verseNumber}`}
        keywords={['Bhagavad Gita', `Chapter ${chapterNumber}`, `Verse ${verseNumber}`, 'wisdom', 'guidance']}
        structuredData={combinedSchema}
        type="article"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link to={`/chapters/${chapterNumber}`} className="inline-block mb-4">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Chapter {chapterNumber}
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
    </Layout>
  );
}
