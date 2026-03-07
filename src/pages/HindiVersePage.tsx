import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen, Globe } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const CANONICAL = 'https://www.bhagavadgitagyan.com';

export default function HindiVersePage() {
  const { chapterNumber, verseNumber } = useParams<{ chapterNumber: string; verseNumber: string }>();
  const chNum = Number(chapterNumber);
  const vNum = Number(verseNumber);

  // Fetch verse
  const { data: verse, isLoading } = useQuery({
    queryKey: ['hindi-verse', chNum, vNum],
    queryFn: async () => {
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id, chapter_number, title_hindi, title_english, title_sanskrit')
        .eq('chapter_number', chNum)
        .limit(1);
      if (!chapters?.length) return null;
      const chapter = chapters[0];
      const { data: shloks } = await supabase
        .from('shloks')
        .select('id, verse_number, sanskrit_text, transliteration, hindi_meaning, english_meaning, life_application')
        .eq('chapter_id', chapter.id)
        .eq('verse_number', vNum)
        .limit(1);
      if (!shloks?.length) return null;
      // Get Hindi translation if available
      const { data: translation } = await supabase
        .from('shlok_translations')
        .select('meaning, life_application, practical_action')
        .eq('shlok_id', shloks[0].id)
        .eq('language_code', 'hi')
        .maybeSingle();
      return { ...shloks[0], chapter, translation };
    },
    enabled: !!chNum && !!vNum,
  });

  const hindiMeaning = verse?.translation?.meaning || verse?.hindi_meaning || '';
  const hindiApplication = verse?.translation?.life_application || '';
  const chapterTitle = verse?.chapter?.title_hindi || verse?.chapter?.title_english || '';

  const title = `भगवद्गीता अध्याय ${chNum}, श्लोक ${vNum} - अर्थ और व्याख्या`;
  const description = hindiMeaning
    ? hindiMeaning.slice(0, 155)
    : `भगवद्गीता अध्याय ${chNum} श्लोक ${vNum} का हिंदी अर्थ, संस्कृत पाठ और जीवन में प्रयोग। श्रीकृष्ण के उपदेश।`;

  const breadcrumbs = [
    { name: 'होम', url: `${CANONICAL}/hi` },
    { name: `अध्याय ${chNum}`, url: `${CANONICAL}/hi/chapters/${chNum}` },
    { name: `श्लोक ${vNum}`, url: `${CANONICAL}/hi/chapters/${chNum}/verse/${vNum}` },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-8 w-64 animate-pulse rounded bg-muted mx-auto mb-4" />
            <p className="text-muted-foreground">श्लोक लोड हो रहा है...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!verse) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">श्लोक नहीं मिला</h1>
          <p className="text-muted-foreground mb-4">अध्याय {chNum}, श्लोक {vNum} नहीं मिला।</p>
          <Link to="/chapters" className="text-primary hover:underline">सभी अध्याय देखें</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <html lang="hi" />
      </Helmet>
      <SEOHead
        title={title}
        description={description}
        canonicalUrl={`${CANONICAL}/hi/chapters/${chNum}/verse/${vNum}`}
        keywords={['भगवद्गीता', `अध्याय ${chNum}`, `श्लोक ${vNum}`, 'हिंदी अर्थ', 'गीता', 'श्रीकृष्ण']}
        type="article"
        hreflang={[
          { lang: 'hi', url: `${CANONICAL}/hi/chapters/${chNum}/verse/${vNum}` },
          { lang: 'en', url: `${CANONICAL}/chapters/${chNum}/verse/${vNum}` },
          { lang: 'x-default', url: `${CANONICAL}/chapters/${chNum}/verse/${vNum}` },
        ]}
        structuredData={[generateBreadcrumbSchema(breadcrumbs)]}
      />

      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link to={`/hi/chapters/${chNum}`}>
              <Button variant="ghost" className="gap-2">
                <ChevronLeft className="h-4 w-4" /> अध्याय {chNum}
              </Button>
            </Link>
            <Link to={`/chapters/${chNum}/verse/${vNum}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" /> English
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              अध्याय {chNum} — {chapterTitle}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold">
              भगवद्गीता <span className="text-gradient">श्लोक {chNum}.{vNum}</span>
            </h1>
          </div>

          {/* Sanskrit */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 mb-6">
            <CardContent className="p-6 md:p-8 text-center">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">संस्कृत श्लोक</h2>
              <p className="text-xl md:text-2xl leading-relaxed font-serif text-foreground" lang="sa">
                {verse.sanskrit_text}
              </p>
              {verse.transliteration && (
                <p className="text-sm text-muted-foreground mt-4 italic">{verse.transliteration}</p>
              )}
            </CardContent>
          </Card>

          {/* Hindi Meaning */}
          <Card className="mb-6 border-border/50">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> हिंदी अर्थ
              </h2>
              <p className="text-lg leading-relaxed text-foreground" lang="hi">
                {hindiMeaning || verse.english_meaning}
              </p>
            </CardContent>
          </Card>

          {/* Life Application in Hindi */}
          {(hindiApplication || verse.life_application) && (
            <Card className="mb-6 border-border/50">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-4">जीवन में प्रयोग</h2>
                <p className="text-muted-foreground leading-relaxed" lang="hi">
                  {hindiApplication || verse.life_application}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Navigation to prev/next */}
          <div className="flex justify-between mt-10">
            {vNum > 1 && (
              <Link to={`/hi/chapters/${chNum}/verse/${vNum - 1}`}>
                <Button variant="outline" className="gap-2">
                  <ChevronLeft className="h-4 w-4" /> श्लोक {vNum - 1}
                </Button>
              </Link>
            )}
            <Link to={`/hi/chapters/${chNum}/verse/${vNum + 1}`} className="ml-auto">
              <Button variant="outline" className="gap-2">
                श्लोक {vNum + 1} <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
