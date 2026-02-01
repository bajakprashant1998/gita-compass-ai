import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getChapter, getShloksByChapter } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/chapters">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              All Chapters
            </Button>
          </Link>
          <div className="flex gap-2">
            {chapterNum > 1 && (
              <Link to={`/chapters/${chapterNum - 1}`}>
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {chapterNum < 18 && (
              <Link to={`/chapters/${chapterNum + 1}`}>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Chapter Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              Chapter {chapter.chapter_number}
            </Badge>
            <h1 className="text-4xl font-bold mb-2">{chapter.title_english}</h1>
            {chapter.title_sanskrit && (
              <p className="text-xl text-muted-foreground sanskrit mb-4">
                {chapter.title_sanskrit}
              </p>
            )}
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
              {chapter.theme}
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {chapter.description_english}
            </p>
          </div>
        </div>

        {/* Shloks List */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">
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
                          {shlok.modern_story && (
                            <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">
                              📖 {shlok.modern_story.slice(0, 120)}...
                            </p>
                          )}
                          {shlok.life_application && !shlok.modern_story && (
                            <p className="text-sm text-primary">
                              💡 {shlok.life_application.slice(0, 100)}...
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
                  No verses available for this chapter yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
