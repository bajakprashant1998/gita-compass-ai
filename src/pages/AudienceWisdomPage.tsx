import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead, generateBreadcrumbSchema, generateFAQSchema } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, MessageCircle, ArrowRight, Lightbulb, Users } from 'lucide-react';
import { RadialGlow } from '@/components/ui/decorative-elements';

const CANONICAL = 'https://www.bhagavadgitagyan.com';

const AUDIENCE_DEFAULTS: Record<string, { title: string; description: string; searchTerms: string[] }> = {
  students: {
    title: 'Bhagavad Gita for Students',
    description: 'Discover powerful Bhagavad Gita teachings for students — overcome exam stress, find focus, build discipline, and discover your true purpose through Lord Krishna\'s timeless wisdom.',
    searchTerms: ['anxiety', 'confusion', 'self-doubt', 'fear', 'stress'],
  },
  'working-professionals': {
    title: 'Bhagavad Gita for Working Professionals',
    description: 'Apply Bhagavad Gita wisdom to your career — master workplace stress, lead with dharma, make ethical decisions, and find work-life balance through Krishna\'s teachings.',
    searchTerms: ['stress', 'anger', 'decision-making', 'leadership', 'purpose'],
  },
  parents: {
    title: 'Bhagavad Gita for Parents',
    description: 'Bhagavad Gita guidance for parents — raise children with values, handle family challenges, practice detached love, and lead by spiritual example.',
    searchTerms: ['attachment', 'anger', 'anxiety', 'duty', 'relationships'],
  },
  entrepreneurs: {
    title: 'Bhagavad Gita for Entrepreneurs',
    description: 'Entrepreneurial wisdom from the Bhagavad Gita — overcome fear of failure, practice karma yoga in business, lead teams with dharma, and build purposeful ventures.',
    searchTerms: ['fear', 'decision-making', 'purpose', 'stress', 'leadership'],
  },
  women: {
    title: 'Bhagavad Gita for Women',
    description: 'Empowering Bhagavad Gita teachings for women — find inner strength, overcome societal pressures, embrace self-worth, and live with purpose and dignity.',
    searchTerms: ['self-doubt', 'anxiety', 'purpose', 'relationships', 'stress'],
  },
};

export default function AudienceWisdomPage() {
  const { audience } = useParams<{ audience: string }>();
  const audienceKey = audience || '';
  const config = AUDIENCE_DEFAULTS[audienceKey];
  const displayName = audienceKey.replace(/-/g, ' ');

  // Try to get custom landing page data
  const { data: landingPage } = useQuery({
    queryKey: ['landing-page', 'audience', audienceKey],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('seo_landing_pages')
        .select('*')
        .eq('slug', audienceKey)
        .eq('page_type', 'audience')
        .maybeSingle();
      return data;
    },
    enabled: !!audienceKey,
  });

  const title = landingPage?.title || config?.title || `Bhagavad Gita for ${displayName}`;
  const description = landingPage?.description || config?.description || `Discover what the Bhagavad Gita teaches for ${displayName}. Practical wisdom from Lord Krishna for modern life.`;
  const searchTerms = config?.searchTerms || ['anxiety', 'purpose', 'stress'];

  // Fetch related verses through problems matching the audience
  const { data: problems } = useQuery({
    queryKey: ['audience-problems', searchTerms],
    queryFn: async () => {
      const { data } = await supabase
        .from('problems')
        .select('id, name, slug, icon, description_english')
        .order('display_order');
      if (!data) return [];
      return data.filter(p => searchTerms.some(t => p.name.toLowerCase().includes(t) || p.slug.includes(t)));
    },
  });

  // Get verses from matched problems
  const { data: verses } = useQuery({
    queryKey: ['audience-verses', problems?.map(p => p.id)],
    queryFn: async () => {
      if (!problems?.length) return [];
      const { data: sp } = await supabase
        .from('shlok_problems')
        .select('shlok_id, relevance_score')
        .in('problem_id', problems.map(p => p.id))
        .order('relevance_score', { ascending: false })
        .limit(12);
      if (!sp?.length) return [];
      const uniqueIds = [...new Set(sp.map(s => s.shlok_id))].slice(0, 8);
      const { data: shloks } = await supabase
        .from('shloks')
        .select('id, verse_number, sanskrit_text, english_meaning, life_application, chapter_id')
        .in('id', uniqueIds);
      if (!shloks?.length) return [];
      const chapterIds = [...new Set(shloks.map(s => s.chapter_id))];
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id, chapter_number, title_english')
        .in('id', chapterIds);
      const chapterMap = new Map(chapters?.map(c => [c.id, c]) || []);
      return shloks.map(s => ({ ...s, chapter: chapterMap.get(s.chapter_id) }));
    },
    enabled: !!problems?.length,
  });

  const faqs = [
    { question: `What does the Bhagavad Gita teach ${displayName}?`, answer: `The Bhagavad Gita offers ${displayName} timeless guidance on handling challenges, finding purpose, and living with clarity. Krishna's teachings apply directly to the struggles ${displayName} face daily.` },
    { question: `Which Bhagavad Gita chapter is best for ${displayName}?`, answer: `Chapter 2 (Sankhya Yoga) and Chapter 3 (Karma Yoga) are excellent starting points for ${displayName}, teaching the art of action without attachment and mental resilience.` },
    { question: `How can ${displayName} apply Gita wisdom daily?`, answer: `Start with one verse a day, reflect on its meaning, and identify one practical action. The key is consistent practice — even 5 minutes of contemplation daily transforms perspective.` },
  ];

  const breadcrumbs = [
    { name: 'Home', url: CANONICAL },
    { name: `For ${displayName}`, url: `${CANONICAL}/bhagavad-gita-for-${audienceKey}` },
  ];

  return (
    <Layout>
      <SEOHead
        title={title}
        description={description.slice(0, 160)}
        canonicalUrl={`${CANONICAL}/bhagavad-gita-for-${audienceKey}`}
        keywords={['bhagavad gita', displayName, 'gita wisdom', 'krishna teachings', `gita for ${displayName}`, 'spiritual guidance']}
        type="article"
        structuredData={[generateBreadcrumbSchema(breadcrumbs), generateFAQSchema(faqs)]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-accent/5 py-16 lg:py-24 border-b border-border/30">
        <div className="absolute inset-0 pointer-events-none">
          <RadialGlow position="top-right" color="primary" className="opacity-40" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Link to="/problems">
              <Button variant="ghost" className="gap-2 mb-6 hover:bg-primary/10">
                <ChevronLeft className="h-4 w-4" /> Explore Topics
              </Button>
            </Link>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6 text-sm px-4 py-1.5">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Curated for {displayName}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Bhagavad Gita for{' '}
              <span className="text-gradient capitalize">{displayName}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Related Problems */}
      {problems && problems.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Key Challenges for <span className="text-gradient capitalize">{displayName}</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {problems.map((p: any) => (
                <Link key={p.slug} to={`/bhagavad-gita-on-${p.slug}`}>
                  <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
                    <CardContent className="p-5">
                      <span className="text-2xl mb-2 block">{p.icon || '🕉️'}</span>
                      <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{p.name}</h3>
                      {p.description_english && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{p.description_english}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Verses */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Essential Verses for <span className="text-gradient capitalize">{displayName}</span>
          </h2>
          {verses && verses.length > 0 ? (
            <div className="space-y-5">
              {verses.map((verse: any) => (
                <Link key={verse.id} to={`/chapters/${verse.chapter?.chapter_number}/verse/${verse.verse_number}`}>
                  <Card className="group border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Badge variant="outline" className="border-primary/30 text-primary mb-3">
                            Chapter {verse.chapter?.chapter_number}, Verse {verse.verse_number}
                          </Badge>
                          <p className="text-muted-foreground line-clamp-3 mb-3 leading-relaxed">{verse.english_meaning}</p>
                          {verse.life_application && (
                            <div className="flex items-start gap-2 text-sm">
                              <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <p className="text-foreground/80 line-clamp-2">{verse.life_application}</p>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Ask Krishna AI</h3>
                <p className="text-muted-foreground mb-6">Get personalized guidance for {displayName}</p>
                <Link to={`/chat?q=${encodeURIComponent(`Bhagavad Gita guidance for ${displayName}`)}`}>
                  <Button className="bg-gradient-to-r from-primary to-amber-500">
                    <Sparkles className="h-4 w-4 mr-2" /> Start Conversation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked <span className="text-gradient">Questions</span></h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Personalized <span className="text-gradient">Guidance?</span></h2>
              <p className="text-muted-foreground mb-8">Talk to Krishna AI for wisdom tailored to your situation.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to={`/chat?q=${encodeURIComponent(`I'm a ${displayName}, guide me with Gita wisdom`)}`}>
                  <Button className="bg-gradient-to-r from-primary to-amber-500 gap-2">
                    <MessageCircle className="h-4 w-4" /> Talk to Krishna
                  </Button>
                </Link>
                <Link to="/chapters">
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" /> Browse All Chapters
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
