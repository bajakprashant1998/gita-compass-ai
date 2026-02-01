import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getChapters } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight } from 'lucide-react';

export default function ChaptersPage() {
  const { data: chapters, isLoading } = useQuery({
    queryKey: ['chapters'],
    queryFn: getChapters,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">The 18 Chapters</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each chapter of the Bhagavad Gita addresses different aspects of life, 
            duty, and self-realization. Explore the wisdom within.
          </p>
        </div>

        {/* Chapters Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters?.map((chapter) => (
              <Link key={chapter.id} to={`/chapters/${chapter.chapter_number}`}>
                <Card className="h-full hover-lift cursor-pointer group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        Chapter {chapter.chapter_number}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {chapter.verse_count} verses
                      </span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {chapter.title_english}
                    </CardTitle>
                    {chapter.title_sanskrit && (
                      <p className="text-sm text-muted-foreground sanskrit">
                        {chapter.title_sanskrit}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {chapter.theme}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {chapter.description_english}
                    </p>
                    <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      <span>Explore Chapter</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
