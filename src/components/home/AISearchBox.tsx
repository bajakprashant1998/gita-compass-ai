import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Search, ArrowRight, Loader2, BookOpen, MessageCircle } from 'lucide-react';

interface SearchResult {
  id: string;
  chapter_number: number;
  verse_number: number;
  english_meaning: string;
  life_application: string | null;
  relevance_reason?: string;
}

interface SearchResponse {
  results: SearchResult[];
  guidance?: string;
}

export function AISearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const navigate = useNavigate();

  const placeholders = [
    "I feel anxious about my future...",
    "I'm struggling to make a decision...",
    "I feel lost and confused...",
    "I'm afraid of failing...",
    "I can't control my anger...",
    "I doubt my own abilities...",
  ];

  // Animate placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-shloks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ query: query.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to empty results
      setResults({ results: [], guidance: "Unable to search at the moment. Please try again." });
    } finally {
      setIsSearching(false);
    }
  }, [query, isSearching]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAskAI = () => {
    navigate(`/chat?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Search Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered Search
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Find Wisdom for Your Problems
            </h2>
            <p className="text-muted-foreground">
              Describe what you're struggling with, and we'll find relevant guidance from the Gita
            </p>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholders[placeholderIndex]}
              className="pl-12 pr-32 h-14 text-lg bg-card border-2 border-border focus:border-primary transition-all"
            />
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 gap-2"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Search
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Quick Problem Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['anxiety', 'fear', 'confusion', 'anger', 'self-doubt'].map((problem) => (
              <button
                key={problem}
                onClick={() => setQuery(`I'm struggling with ${problem}`)}
                className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors capitalize"
              >
                {problem}
              </button>
            ))}
          </div>

          {/* Search Results */}
          {results && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* AI Guidance */}
              {results.guidance && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-primary mb-1">AI Insight</p>
                        <p className="text-sm text-foreground">{results.guidance}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Shlok Results */}
              {results.results.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Found {results.results.length} relevant verse{results.results.length > 1 ? 's' : ''}:
                  </p>
                  {results.results.map((shlok) => (
                    <Link key={shlok.id} to={`/shlok/${shlok.id}`}>
                      <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-sm">
                                  Chapter {shlok.chapter_number}, Verse {shlok.verse_number}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {shlok.english_meaning}
                              </p>
                              {shlok.life_application && (
                                <p className="text-sm font-medium text-primary">
                                  💡 {shlok.life_application}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}

                  {/* Ask AI Button */}
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={handleAskAI} className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Get Deeper Guidance with AI Coach
                    </Button>
                  </div>
                </>
              ) : (
                results.results.length === 0 && !results.guidance && (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        No specific verses found. Try describing your problem differently, or ask our AI coach.
                      </p>
                      <Button onClick={handleAskAI} className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Ask AI Coach
                      </Button>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
