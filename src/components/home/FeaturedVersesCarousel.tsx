import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import type { Shlok } from '@/types';

async function getFeaturedVerses(): Promise<Shlok[]> {
  const { data, error } = await supabase
    .from('shloks')
    .select('*, chapters(*)')
    .not('modern_story', 'is', null)
    .not('life_application', 'is', null)
    .limit(5);
  
  if (error) throw error;
  
  return (data as any[]).map(item => ({
    ...item,
    chapter: item.chapters,
  })) as Shlok[];
}

export function FeaturedVersesCarousel() {
  const { data: verses, isLoading } = useQuery({
    queryKey: ['featured-verses'],
    queryFn: getFeaturedVerses,
  });

  if (isLoading || !verses?.length) {
    return null;
  }

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Wisdom</h2>
            <p className="text-muted-foreground">
              Verses with profound life applications
            </p>
          </div>
          <Link to="/chapters">
            <Button variant="outline" className="hidden sm:flex">
              View All Verses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {verses.map((verse) => (
              <CarouselItem key={verse.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Link to={`/chapters/${verse.chapter?.chapter_number}/verse/${verse.verse_number}`}>
                  <Card className="h-full hover-lift cursor-pointer group">
                    <CardContent className="p-6">
                      {/* Chapter badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          Chapter {verse.chapter?.chapter_number}, Verse {verse.verse_number}
                        </span>
                      </div>

                      {/* Sanskrit snippet */}
                      <p className="text-sm text-muted-foreground sanskrit mb-4 line-clamp-2">
                        {verse.sanskrit_text.slice(0, 100)}...
                      </p>

                      {/* English meaning */}
                      <p className="text-foreground leading-relaxed mb-4 line-clamp-3">
                        {verse.english_meaning}
                      </p>

                      {/* Life application */}
                      {verse.life_application && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            <span className="font-medium text-foreground">Takeaway: </span>
                            {verse.life_application}
                          </p>
                        </div>
                      )}

                      {/* Read more */}
                      <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                        <span>Read More</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>

        <Link to="/chapters" className="sm:hidden mt-6 block">
          <Button variant="outline" className="w-full">
            View All Verses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
