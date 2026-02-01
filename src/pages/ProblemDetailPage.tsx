import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getProblem, getShloksByProblem } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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
        <div className="container mx-auto px-4 py-12">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </Layout>
    );
  }

  if (!problem) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Problem not found</h1>
          <Link to="/problems">
            <Button>Back to Problems</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <div className="mb-8">
          <Link to="/problems">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              All Life Problems
            </Button>
          </Link>
        </div>

        {/* Problem Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{problem.name}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {problem.description_english}
            </p>

            {/* AI Summary Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">The Gita's Approach</h3>
                </div>
                <p className="text-muted-foreground">
                  The Bhagavad Gita addresses {problem.name.toLowerCase()} by teaching us to understand 
                  the nature of our mind and emotions. Through self-awareness and right action, 
                  we can transform this challenge into a path of growth.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Relevant Shloks */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            Relevant Verses ({shloks?.length || 0})
          </h2>

          {shloksLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : shloks && shloks.length > 0 ? (
            <div className="space-y-4">
              {shloks.map((shlok) => (
                <Link key={shlok.id} to={`/shlok/${shlok.id}`}>
                  <Card className="hover-lift cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              Verse {shlok.verse_number}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground line-clamp-2 mb-2">
                            {shlok.english_meaning}
                          </p>
                          {shlok.practical_action && (
                            <p className="text-sm text-primary">
                              ✨ {shlok.practical_action}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  We're still adding verses for this topic. Try the AI Coach for personalized guidance!
                </p>
                <Link to="/chat" className="mt-4 inline-block">
                  <Button>Talk to AI Coach</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
