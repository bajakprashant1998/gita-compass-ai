import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Globe, MessageCircle, Sparkles } from 'lucide-react';
import { RadialGlow } from '@/components/ui/decorative-elements';
import { Helmet } from 'react-helmet-async';

const CANONICAL = 'https://www.bhagavadgitagyan.com';

export default function HindiHomePage() {
  const { data: chapters } = useQuery({
    queryKey: ['hindi-chapters'],
    queryFn: async () => {
      const { data } = await supabase
        .from('chapters')
        .select('chapter_number, title_hindi, title_english, title_sanskrit, verse_count, theme')
        .order('chapter_number');
      return data || [];
    },
  });

  return (
    <Layout>
      <Helmet><html lang="hi" /></Helmet>
      <SEOHead
        title="भगवद्गीता ज्ञान - श्रीकृष्ण के उपदेश हिंदी में"
        description="भगवद्गीता के सभी 18 अध्याय और 700 श्लोक हिंदी अर्थ के साथ। श्रीकृष्ण के दिव्य उपदेश, जीवन में प्रयोग और AI गाइडेंस।"
        canonicalUrl={`${CANONICAL}/hi`}
        keywords={['भगवद्गीता', 'गीता हिंदी', 'श्रीकृष्ण', 'गीता श्लोक', 'भगवद गीता अर्थ']}
        hreflang={[
          { lang: 'hi', url: `${CANONICAL}/hi` },
          { lang: 'en', url: CANONICAL },
          { lang: 'x-default', url: CANONICAL },
        ]}
        structuredData={[generateBreadcrumbSchema([{ name: 'होम', url: `${CANONICAL}/hi` }])]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-accent/5 py-16 lg:py-24 border-b border-border/30">
        <div className="absolute inset-0 pointer-events-none">
          <RadialGlow position="top-right" color="primary" className="opacity-40" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-end mb-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-2"><Globe className="h-4 w-4" /> English</Button>
              </Link>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6 text-sm px-4 py-1.5">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              18 अध्याय • 700+ श्लोक
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" lang="hi">
              <span className="text-gradient">भगवद्गीता</span> ज्ञान
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" lang="hi">
              श्रीकृष्ण के दिव्य उपदेश — आधुनिक जीवन की समस्याओं का प्राचीन समाधान। AI-संचालित मार्गदर्शन के साथ।
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/chat">
                <Button className="bg-gradient-to-r from-primary to-amber-500 gap-2">
                  <Sparkles className="h-4 w-4" /> कृष्ण से बात करें
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" lang="hi">
            सभी <span className="text-gradient">अध्याय</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters?.map((ch) => (
              <Link key={ch.chapter_number} to={`/hi/chapters/${ch.chapter_number}`}>
                <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
                  <CardContent className="p-5">
                    <Badge variant="outline" className="border-primary/30 text-primary mb-3">
                      अध्याय {ch.chapter_number}
                    </Badge>
                    <h3 className="font-bold group-hover:text-primary transition-colors" lang="hi">
                      {ch.title_hindi || ch.title_english}
                    </h3>
                    {ch.title_sanskrit && (
                      <p className="text-xs text-muted-foreground mt-1" lang="sa">{ch.title_sanskrit}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{ch.verse_count || 0} श्लोक</p>
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
