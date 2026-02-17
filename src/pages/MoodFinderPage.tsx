import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const MOODS = [
  { emoji: '😰', label: 'Anxious', problem: 'anxiety', color: 'from-yellow-500 to-amber-500' },
  { emoji: '😢', label: 'Sad', problem: 'sadness', color: 'from-blue-500 to-indigo-500' },
  { emoji: '😤', label: 'Angry', problem: 'anger', color: 'from-red-500 to-orange-500' },
  { emoji: '😕', label: 'Confused', problem: 'confusion', color: 'from-purple-500 to-violet-500' },
  { emoji: '😔', label: 'Hopeless', problem: 'hopelessness', color: 'from-gray-500 to-slate-500' },
  { emoji: '😨', label: 'Fearful', problem: 'fear', color: 'from-teal-500 to-cyan-500' },
  { emoji: '😫', label: 'Stressed', problem: 'stress', color: 'from-pink-500 to-rose-500' },
  { emoji: '🤔', label: 'Lost', problem: 'purpose', color: 'from-emerald-500 to-green-500' },
];

export default function MoodFinderPage() {
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);

  const { data: verses, isLoading } = useQuery({
    queryKey: ['mood-verses', selectedMood?.problem],
    queryFn: async () => {
      // Find problems matching the mood
      const { data: problems } = await supabase
        .from('problems')
        .select('id')
        .ilike('name', `%${selectedMood!.problem}%`);

      if (!problems?.length) {
        // Fallback: search in shlok content
        const { data } = await supabase
          .from('shloks')
          .select('*, chapter:chapters(chapter_number, title_english)')
          .or(`english_meaning.ilike.%${selectedMood!.problem}%,life_application.ilike.%${selectedMood!.problem}%`)
          .limit(3);
        return data || [];
      }

      const problemIds = problems.map(p => p.id);
      const { data: shlokLinks } = await supabase
        .from('shlok_problems')
        .select('shlok_id')
        .in('problem_id', problemIds)
        .order('relevance_score', { ascending: false })
        .limit(3);

      if (!shlokLinks?.length) return [];

      const { data } = await supabase
        .from('shloks')
        .select('*, chapter:chapters(chapter_number, title_english)')
        .in('id', shlokLinks.map(s => s.shlok_id));

      return data || [];
    },
    enabled: !!selectedMood,
  });

  return (
    <Layout>
      <SEOHead
        title="Mood-Based Verse Finder"
        description="Select how you're feeling and discover the perfect Bhagavad Gita verse for your current emotional state."
        keywords={['mood', 'feelings', 'emotional guidance', 'Bhagavad Gita']}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Heart className="h-4 w-4" />
              Emotional Guidance
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">How Are You Feeling?</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select your current emotion and discover Gita verses that speak directly to your heart.
            </p>
          </div>

          {/* Mood Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {MOODS.map((mood, idx) => (
              <button
                key={mood.label}
                onClick={() => setSelectedMood(mood)}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all duration-300 animate-fade-in text-center",
                  selectedMood?.label === mood.label
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-105"
                    : "border-border hover:border-primary/30 hover:bg-accent/50"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="text-3xl block mb-2">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.label}</span>
              </button>
            ))}
          </div>

          {/* Results */}
          {selectedMood && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  Wisdom for when you feel {selectedMood.label.toLowerCase()}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMood(null)}
                  className="gap-1"
                >
                  <RefreshCw className="h-4 w-4" /> Reset
                </Button>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
                  ))}
                </div>
              ) : verses && verses.length > 0 ? (
                <div className="space-y-4">
                  {verses.map((shlok: any, idx: number) => (
                    <Card
                      key={shlok.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className={cn("h-1 bg-gradient-to-r", selectedMood.color)} />
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-primary">
                            Chapter {shlok.chapter?.chapter_number}, Verse {shlok.verse_number}
                          </span>
                          <Link to={`/chapters/${shlok.chapter?.chapter_number}/verse/${shlok.verse_number}`}>
                            <Button variant="ghost" size="sm" className="gap-1 text-primary">
                              Read Full <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>

                        <blockquote className="text-sm sanskrit text-center mb-3 whitespace-pre-line opacity-70" lang="sa">
                          {shlok.sanskrit_text.split('\n').slice(0, 2).join('\n')}
                        </blockquote>

                        <p className="text-foreground mb-3">{shlok.english_meaning}</p>

                        {shlok.life_application && (
                          <div className="rounded-lg bg-primary/5 p-3">
                            <p className="text-sm text-muted-foreground">
                              💡 {shlok.life_application}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No specific verses found for this mood.</p>
                    <Link to="/chat">
                      <Button className="gap-2">
                        <Sparkles className="h-4 w-4" /> Talk to Krishna instead
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
