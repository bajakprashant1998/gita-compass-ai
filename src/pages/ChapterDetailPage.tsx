import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getChapter, getShloksByChapter } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { VerseCard } from '@/components/chapters/VerseCard';

export default function ChapterDetailPage() {
  const { chapterNumber } = useParams<{ chapterNumber: string }>();
  const chapterNum = parseInt(chapterNumber || '1');

  const { data: chapter, isLoading: chapterLoading } = useQuery({
    queryKey: ['chapter', chapterNum],
    queryFn: () => getChapter(chapterNum),
    enabled: !!chapterNum,
  });

  const { data: shloks, isLoading: shloksLoading } = useQuery({
    queryKey: ['shloks', chapter?.id],
    queryFn: () => getShloksByChapter(chapter!.id),
    enabled: !!chapter?.id,
  });

  if (chapterLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </Layout>
    );
  }

  if (!chapter) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
          <Link to="/chapters">
            <Button>Back to Chapters</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 lg:py-24">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-10">
            <Link to="/chapters">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10">
                <ChevronLeft className="h-4 w-4" />
                All Chapters
              </Button>
            </Link>
            <div className="flex gap-2">
              {chapterNum > 1 && (
                <Link to={`/chapters/${chapterNum - 1}`}>
                  <Button variant="outline" size="icon" className="hover:border-primary hover:text-primary">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              {chapterNum < 18 && (
                <Link to={`/chapters/${chapterNum + 1}`}>
                  <Button variant="outline" size="icon" className="hover:border-primary hover:text-primary">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Chapter Info */}
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <Badge 
              variant="secondary" 
              className="mb-6 text-base px-4 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
            >
              Chapter {chapter.chapter_number}
            </Badge>
            
            <h1 className="headline-bold text-4xl md:text-5xl lg:text-6xl mb-4">
              {chapter.title_english}
            </h1>
            
            {chapter.title_sanskrit && (
              <p className="text-2xl md:text-3xl text-muted-foreground sanskrit mb-6">
                {chapter.title_sanskrit}
              </p>
            )}
            
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-amber-500 text-white font-semibold mb-8">
              <Sparkles className="h-4 w-4" />
              {chapter.theme}
            </div>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              {chapter.description_english}
            </p>

            {/* Verse Count Metric */}
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border/50 shadow-lg shadow-primary/5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold text-gradient">{shloks?.length || chapter.verse_count}</div>
                <div className="text-sm text-muted-foreground">Sacred Verses</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verses Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-primary to-amber-500" />
            <h2 className="text-2xl md:text-3xl font-bold">
              Verses ({shloks?.length || chapter.verse_count})
            </h2>
          </div>

          {shloksLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : shloks && shloks.length > 0 ? (
            <div className="space-y-5">
              {shloks.map((shlok, index) => (
                <VerseCard 
                  key={shlok.id}
                  shlok={shlok}
                  chapterNumber={chapterNum}
                  animationDelay={index * 50}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No verses available for this chapter yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
