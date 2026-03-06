import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead, generateBreadcrumbSchema, generateFAQSchema } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, MessageCircle, ArrowRight, Heart, Target, Lightbulb } from 'lucide-react';
import { RadialGlow } from '@/components/ui/decorative-elements';
import { RelatedContentLinks } from '@/components/seo/RelatedContentLinks';

const CANONICAL = 'https://www.bhagavadgitagyan.com';

// Map slug to problem slug (e.g., "anxiety" -> problem slug)
function slugToQuery(slug: string) {
  return slug.replace(/-/g, ' ');
}

export default function GitaWisdomPage() {
  const { topic } = useParams<{ topic: string }>();
  const searchTerm = slugToQuery(topic || '');

  // Find matching problem
  const { data: problem } = useQuery({
    queryKey: ['seo-problem', topic],
    queryFn: async () => {
      // Try exact slug match first
      const { data: exact } = await supabase
        .from('problems')
        .select('*')
        .eq('slug', topic)
        .maybeSingle();
      if (exact) return exact;

      // Try name match
      const { data: byName } = await supabase
        .from('problems')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(1)
        .maybeSingle();
      return byName;
    },
    enabled: !!topic,
  });

  // Get related verses
  const { data: verses } = useQuery({
    queryKey: ['seo-verses', problem?.id],
    queryFn: async () => {
      const { data: sp } = await supabase
        .from('shlok_problems')
        .select('shlok_id, relevance_score')
        .eq('problem_id', problem!.id)
        .order('relevance_score', { ascending: false })
        .limit(10);

      if (!sp?.length) return [];

      const { data: shloks } = await supabase
        .from('shloks')
        .select('id, verse_number, sanskrit_text, english_meaning, life_application, practical_action, chapter_id')
        .in('id', sp.map(s => s.shlok_id));

      if (!shloks?.length) return [];

      // Get chapter info
      const chapterIds = [...new Set(shloks.map(s => s.chapter_id))];
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id, chapter_number, title_english')
        .in('id', chapterIds);

      const chapterMap = new Map(chapters?.map(c => [c.id, c]) || []);
      return shloks.map(s => ({ ...s, chapter: chapterMap.get(s.chapter_id) }));
    },
    enabled: !!problem?.id,
  });

  // Get related problems for internal linking
  const { data: relatedProblems } = useQuery({
    queryKey: ['seo-related-problems', problem?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('problems')
        .select('name, slug, icon, description_english')
        .neq('id', problem!.id)
        .order('display_order')
        .limit(6);
      return data || [];
    },
    enabled: !!problem?.id,
  });

  const title = problem
    ? `Bhagavad Gita on ${problem.name} - ${verses?.length || 0} Verses & Wisdom`
    : `Bhagavad Gita on ${(topic || '').replace(/-/g, ' ')} - Ancient Wisdom`;

  const description = problem?.description_english
    || `Discover what the Bhagavad Gita says about ${searchTerm}. Read relevant verses, practical wisdom, and life applications from Lord Krishna's teachings.`;

  const faqs = [
    { question: `What does the Bhagavad Gita say about ${searchTerm}?`, answer: problem?.description_english || `The Bhagavad Gita offers profound wisdom on ${searchTerm} through Lord Krishna's teachings to Arjuna. Multiple verses address this topic with practical guidance for daily life.` },
    { question: `How many Bhagavad Gita verses address ${searchTerm}?`, answer: `There are ${verses?.length || 'several'} verses in the Bhagavad Gita that directly address ${searchTerm}, offering different perspectives and solutions.` },
    { question: `How can I apply Bhagavad Gita wisdom for ${searchTerm} in daily life?`, answer: `The Bhagavad Gita provides practical actions and mindset shifts for dealing with ${searchTerm}. Each verse includes a life application section to help you implement the wisdom.` },
  ];

  const breadcrumbs = [
    { name: 'Home', url: CANONICAL },
    { name: 'Life Problems', url: `${CANONICAL}/problems` },
    { name: problem?.name || searchTerm, url: `${CANONICAL}/bhagavad-gita-on-${topic}` },
  ];

  return (
    <Layout>
      <SEOHead
        title={title}
        description={description.slice(0, 160)}
        canonicalUrl={`${CANONICAL}/bhagavad-gita-on-${topic}`}
        keywords={['bhagavad gita', searchTerm, 'gita wisdom', 'krishna teachings', `gita on ${searchTerm}`, 'spiritual guidance', 'vedic wisdom']}
        type="article"
        structuredData={[
          generateBreadcrumbSchema(breadcrumbs),
          generateFAQSchema(faqs),
        ]}
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
                <ChevronLeft className="h-4 w-4" /> All Life Problems
              </Button>
            </Link>

            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6 text-sm px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {verses?.length || 0} Relevant Verses
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Bhagavad Gita on{' '}
              <span className="text-gradient capitalize">{searchTerm}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section for rich snippets */}
      <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
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

      {/* Verses */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Key Verses on <span className="text-gradient capitalize">{searchTerm}</span>
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
                          <p className="text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
                            {verse.english_meaning}
                          </p>
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
                <p className="text-muted-foreground mb-6">Get personalized wisdom on {searchTerm} from Bhagavad Gita</p>
                <Link to={`/chat?q=${encodeURIComponent(`What does the Bhagavad Gita say about ${searchTerm}?`)}`}>
                  <Button className="bg-gradient-to-r from-primary to-amber-500">
                    <Sparkles className="h-4 w-4 mr-2" /> Start Conversation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Related Topics - Internal Linking */}
      {relatedProblems && relatedProblems.length > 0 && (
        <section className="py-12 bg-muted/30 border-t border-border/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Related <span className="text-gradient">Topics</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedProblems.map((p: any) => (
                <Link key={p.slug} to={`/bhagavad-gita-on-${p.slug}`}>
                  <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
                    <CardContent className="p-5">
                      <span className="text-2xl mb-2 block">{p.icon || '🕉️'}</span>
                      <h3 className="font-bold text-sm group-hover:text-primary transition-colors">
                        Bhagavad Gita on {p.name}
                      </h3>
                      {p.description_english && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{p.description_english}</p>
                      )}
                      <span className="text-xs text-primary font-medium mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Read more <ArrowRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Need Personalized <span className="text-gradient">Guidance?</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Talk to Krishna AI for wisdom tailored to your specific situation with {searchTerm}.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to={`/chat?q=${encodeURIComponent(`Help me with ${searchTerm}`)}`}>
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
