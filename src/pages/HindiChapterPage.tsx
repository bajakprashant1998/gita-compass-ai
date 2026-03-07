import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const CANONICAL = 'https://www.bhagavadgitagyan.com';

export default function HindiChapterPage() {
  const { chapterNumber } = useParams<{ chapterNumber: string }>();
  const chNum = Number(chapterNumber);

  const { data: chapter } = useQuery({
    queryKey: ['hindi-chapter', chNum],
    queryFn: async () => {
      const { data } = await supabase
        .from('chapters')
        .select('*')
        .eq('chapter_number', chNum)
        .maybeSingle();
      return data;
    },
    enabled: !!chNum,
  });

  const { data: verses } = useQuery({
    queryKey: ['hindi-chapter-verses', chapter?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('shloks')
        .select('id, verse_number, hindi_meaning, english_meaning')
        .eq('chapter_id', chapter!.id)
        .order('verse_number');
      return data || [];
    },
    enabled: !!chapter?.id,
  });

  const title = chapter
    ? `भगवद्गीता अध्याय ${chNum}: ${chapter.title_hindi || chapter.title_english} - सभी श्लोक`
    : `भगवद्गीता अध्याय ${chNum}`;
  const description = chapter?.description_hindi || chapter?.description_english || `भगवद्गीता अध्याय ${chNum} के सभी श्लोक हिंदी अर्थ के साथ।`;

  const breadcrumbs = [
    { name: 'होम', url: `${CANONICAL}/hi` },
    { name: `अध्याय ${chNum}`, url: `${CANONICAL}/hi/chapters/${chNum}` },
  ];

  return (
    <Layout>
      <Helmet><html lang="hi" /></Helmet>
      <SEOHead
        title={title}
        description={description.slice(0, 160)}
        canonicalUrl={`${CANONICAL}/hi/chapters/${chNum}`}
        keywords={['भगवद्गीता', `अध्याय ${chNum}`, 'हिंदी', 'गीता श्लोक']}
        hreflang={[
          { lang: 'hi', url: `${CANONICAL}/hi/chapters/${chNum}` },
          { lang: 'en', url: `${CANONICAL}/chapters/${chNum}` },
          { lang: 'x-default', url: `${CANONICAL}/chapters/${chNum}` },
        ]}
        structuredData={[generateBreadcrumbSchema(breadcrumbs)]}
      />

      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <Link to="/hi">
              <Button variant="ghost" className="gap-2"><ChevronLeft className="h-4 w-4" /> सभी अध्याय</Button>
            </Link>
            <Link to={`/chapters/${chNum}`}>
              <Button variant="outline" size="sm" className="gap-2"><Globe className="h-4 w-4" /> English</Button>
            </Link>
          </div>

          <div className="text-center mb-10">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">अध्याय {chNum}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {chapter?.title_hindi || chapter?.title_english || `अध्याय ${chNum}`}
            </h1>
            {chapter?.title_sanskrit && (
              <p className="text-lg text-muted-foreground" lang="sa">{chapter.title_sanskrit}</p>
            )}
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto" lang="hi">{description}</p>
          </div>

          <div className="space-y-3">
            {verses?.map((v) => (
              <Link key={v.id} to={`/hi/chapters/${chNum}/verse/${v.verse_number}`}>
                <Card className="group border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Badge variant="outline" className="border-primary/30 text-primary mb-2">श्लोक {v.verse_number}</Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2" lang="hi">
                        {v.hindi_meaning || v.english_meaning}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
