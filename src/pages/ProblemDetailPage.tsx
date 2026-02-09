import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { getProblem, getShloksByProblem } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, MessageCircle } from 'lucide-react';
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: problem, isLoading: problemLoading } = useQuery({
    queryKey: ['problem', slug],
    queryFn: () => getProblem(slug!),
    enabled: !!slug,
  });

  const { data: shloks, isLoading: shloksLoading } = useQuery({
    queryKey: ['problem-shloks', problem?.id],
    queryFn: () => getShloksByProblem(problem!.id),
    enabled: !!problem?.id,
  });

  if (problemLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 py-12">
            <div className="h-96 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!problem) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Problem not found</h1>
            <Link to="/problems">
              <Button>Back to Problems</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={(problem as any).meta_title || `${problem.name} - Bhagavad Gita Wisdom`}
        description={(problem as any).meta_description || problem.description_english || `Find Bhagavad Gita wisdom for ${problem.name}`}
        canonicalUrl={`https://www.bhagavadgitagyan.com/problems/${slug}`}
        keywords={(problem as any).meta_keywords || ['Bhagavad Gita', problem.name, 'wisdom', 'guidance']}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 lg:py-24 border-b border-border/30">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <RadialGlow position="top-right" color="primary" className="opacity-50" />
          <RadialGlow position="bottom-left" color="amber" className="opacity-30" />
          <FloatingOm className="top-20 left-10 hidden lg:block" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(var(--primary)/0.08),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            {/* Breadcrumb */}
            <Link to="/problems">
              <Button variant="ghost" className="gap-2 mb-6 hover:bg-primary/10">
                <ChevronLeft className="h-4 w-4" />
                All Life Problems
              </Button>
            </Link>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-6 border border-primary/20">
              <Sparkles className="h-4 w-4" />
              Gita Wisdom
            </div>

            {/* Title */}
            <h1 className="headline-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              <span className="text-gradient">{problem.name}</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              {problem.description_english}
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mb-3 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gradient">{shloks?.length || 0}</div>
                <div className="text-sm text-muted-foreground font-medium">Relevant Verses</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Summary Card */}
      <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="group relative rounded-2xl overflow-hidden">
              {/* Left Gradient Border */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-amber-500 to-orange-500 z-10" />
              
              <Card className="border-2 border-l-0 border-primary/20 rounded-r-2xl bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-md">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">The Gita's Approach</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    The Bhagavad Gita addresses {problem.name.toLowerCase()} by teaching us to understand 
                    the nature of our mind and emotions. Through self-awareness and right action, 
                    we can transform this challenge into a path of growth. The verses below offer 
                    timeless wisdom to help you navigate this aspect of life.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Relevant Shloks */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="headline-bold text-2xl md:text-3xl">
                Relevant <span className="text-gradient">Verses</span>
              </h2>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {shloks?.length || 0} verses
              </Badge>
            </div>

            {shloksLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : shloks && shloks.length > 0 ? (
              <div className="space-y-4">
                {shloks.map((shlok) => (
                  <Link key={shlok.id} to={`/chapters/${shlok.chapter?.chapter_number}/verse/${shlok.verse_number}`}>
                    <div className="group relative rounded-2xl overflow-hidden">
                      {/* Left Gradient Border */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-amber-500 to-orange-500 z-10" />
                      
                      <Card className="h-full border-2 border-l-0 border-border/50 rounded-r-2xl transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/5 group-hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="font-semibold border-primary/30 text-primary">
                                  Chapter {shlok.chapter?.chapter_number}, Verse {shlok.verse_number}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                                {shlok.english_meaning}
                              </p>
                              {shlok.practical_action && (
                                <p className="text-sm text-primary font-medium flex items-center gap-2">
                                  <Sparkles className="h-4 w-4" />
                                  {shlok.practical_action}
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                              <ChevronRight className="h-5 w-5" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="group relative rounded-2xl overflow-hidden">
                {/* Left Gradient Border */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-amber-500 to-orange-500 z-10" />
                
                <Card className="border-2 border-l-0 border-border/50 rounded-r-2xl">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-primary/10 to-amber-500/10 flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">More Wisdom Coming Soon</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      We're still adding verses for this topic. Try the AI Coach for personalized guidance!
                    </p>
                    <Link to="/chat">
                      <Button className="bg-gradient-to-r from-primary to-amber-500 hover:opacity-90 shadow-lg">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Talk to AI Coach
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 p-8 md:p-12">
              <h2 className="headline-bold text-2xl md:text-3xl mb-4">
                Need More <span className="text-gradient">Guidance?</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Our AI Coach can provide personalized wisdom from the Bhagavad Gita 
                tailored to your specific situation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/chat">
                  <Button className="bg-gradient-to-r from-primary to-amber-500 hover:opacity-90 shadow-lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start a Conversation
                  </Button>
                </Link>
                <Link to="/problems">
                  <Button variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explore Other Topics
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
