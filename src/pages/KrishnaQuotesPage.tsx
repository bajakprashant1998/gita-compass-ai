import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead, generateBreadcrumbSchema, generateFAQSchema } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, MessageCircle, Quote, Lightbulb } from 'lucide-react';
import { RadialGlow } from '@/components/ui/decorative-elements';

const CANONICAL = 'https://www.bhagavadgitagyan.com';

const TOPIC_MAP: Record<string, string[]> = {
  love: ['attachment', 'relationships', 'devotion'],
  life: ['purpose', 'duty', 'self-realization'],
  death: ['fear', 'mortality', 'soul'],
  duty: ['duty', 'dharma', 'responsibility'],
  karma: ['karma', 'action', 'work'],
  peace: ['peace', 'anxiety', 'stress'],
  success: ['purpose', 'ambition', 'work'],
  anger: ['anger', 'emotions', 'control'],
  fear: ['fear', 'courage', 'anxiety'],
  happiness: ['happiness', 'joy', 'contentment'],
};

export default function KrishnaQuotesPage() {
  const { topic } = useParams<{ topic: string }>();
  const topicKey = topic || '';
  const displayTopic = topicKey.replace(/-/g, ' ');
  const searchTerms = TOPIC_MAP[topicKey] || [topicKey];

  // Try custom landing page
  const { data: landingPage } = useQuery({
    queryKey: ['landing-page', 'quotes', topicKey],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('seo_landing_pages')
        .select('*')
        .eq('slug', topicKey)
        .eq('page_type', 'quotes')
        .maybeSingle();
      return data;
    },
    enabled: !!topicKey,
  });

  // Search verses by meaning
  const { data: verses } = useQuery({
    queryKey: ['krishna-quotes', searchTerms],
    queryFn: async () => {
      const conditions = searchTerms.map(t => `english_meaning.ilike.%${t}%`).join(',');
      const { data } = await supabase
        .from('shloks')
        .select('id, verse_number, sanskrit_text, english_meaning, life_application, chapter_id')
        .or(conditions)
        .limit(12);
      if (!data?.length) return [];
      const chapterIds = [...new Set(data.map(s => s.chapter_id))];
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id, chapter_number, title_english')
        .in('id', chapterIds);
      const chapterMap = new Map(chapters?.map(c => [c.id, c]) || []);
      return data.map(s => ({ ...s, chapter: chapterMap.get(s.chapter_id) }));
    },
    enabled: searchTerms.length > 0,
  });

  const title = landingPage?.title || `Krishna Quotes on ${displayTopic} - Bhagavad Gita Wisdom`;
  const description = landingPage?.description || `Beautiful Krishna quotes on ${displayTopic} from the Bhagavad Gita. Read Lord Krishna's most powerful teachings about ${displayTopic} with meaning and life application.`;

  const faqs = [
    { question: `What did Krishna say about ${displayTopic}?`, answer: `Lord Krishna shared profound wisdom about ${displayTopic} in the Bhagavad Gita. His teachings provide clarity, peace, and practical guidance for anyone seeking understanding on this topic.` },
    { question: `Which Bhagavad Gita verse is best for ${displayTopic}?`, answer: `Multiple verses address ${displayTopic} from different angles. The best verse depends on your specific situation — browse the curated collection below to find what resonates.` },
    { question: `How to apply Krishna's teaching on ${displayTopic}?`, answer: `Start by reading the verse meaning, then reflect on the life application provided. Try implementing one practical action from the verse in your daily routine for transformative results.` },
  ];

  const breadcrumbs = [
    { name: 'Home', url: CANONICAL },
    { name: `Krishna Quotes on ${displayTopic}`, url: `${CANONICAL}/krishna-quotes-on-${topicKey}` },
  ];

  return (
    <Layout>
      <SEOHead
        title={title}
        description={description.slice(0, 160)}
        canonicalUrl={`${CANONICAL}/krishna-quotes-on-${topicKey}`}
        keywords={['krishna quotes', displayTopic, 'bhagavad gita quotes', 'lord krishna', `krishna on ${displayTopic}`, 'gita quotes']}
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
            <Link to="/chapters">
              <Button variant="ghost" className="gap-2 mb-6 hover:bg-primary/10">
                <ChevronLeft className="h-4 w-4" /> All Chapters
              </Button>
            </Link>
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6 text-sm px-4 py-1.5">
              <Quote className="h-3.5 w-3.5 mr-1.5" />
              {verses?.length || 0} Quotes Found
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Krishna Quotes on{' '}
              <span className="text-gradient capitalize">{displayTopic}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Lord Krishna on <span className="text-gradient capitalize">{displayTopic}</span>
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
                          <blockquote className="text-foreground font-medium italic border-l-2 border-primary/30 pl-4 mb-3 line-clamp-3">
                            "{verse.english_meaning}"
                          </blockquote>
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
                <p className="text-muted-foreground mb-6">Get quotes about {displayTopic} from the Gita</p>
                <Link to={`/chat?q=${encodeURIComponent(`Krishna quotes on ${displayTopic}`)}`}>
                  <Button className="bg-gradient-to-r from-primary to-amber-500">
                    <Sparkles className="h-4 w-4 mr-2" /> Find Quotes
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
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Explore More <span className="text-gradient">Krishna Wisdom</span></h2>
              <p className="text-muted-foreground mb-8">Dive deeper into the Bhagavad Gita's teachings with AI-powered guidance.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to={`/chat?q=${encodeURIComponent(`Tell me more about ${displayTopic} in the Gita`)}`}>
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
