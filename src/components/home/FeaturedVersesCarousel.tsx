import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { Shlok } from '@/types';

const cardGradients = [
  'from-primary/10 to-amber-500/10 border-primary/20',
  'from-amber-500/10 to-orange-500/10 border-amber-500/20',
  'from-orange-500/10 to-red-500/10 border-orange-500/20',
  'from-pink-500/10 to-purple-500/10 border-pink-500/20',
  'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
];

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

  if (isLoading || !verses?.length) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-3">
              Curated Wisdom
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Featured Verses</h2>
            <p className="text-muted-foreground">
              Profound teachings with life-changing applications
            </p>
          </div>
          <Link to="/chapters" className="hidden sm:block">
            <Button variant="outline" className="gap-2 font-bold">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Carousel opts={{ align: 'start', loop: true }} className="w-full">
          <CarouselContent className="-ml-4">
            {verses.map((verse, i) => (
              <CarouselItem key={verse.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Link to={`/chapters/${verse.chapter?.chapter_number}/verse/${verse.verse_number}`}>
                  <div className={cn(
                    "group h-full rounded-2xl border-2 bg-gradient-to-br p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer",
                    cardGradients[i % cardGradients.length]
                  )}>
                    {/* Chapter badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        Ch. {verse.chapter?.chapter_number}, V. {verse.verse_number}
                      </span>
                    </div>

                    {/* Sanskrit snippet */}
                    <p className="text-sm text-muted-foreground sanskrit mb-4 line-clamp-2 leading-relaxed">
                      {verse.sanskrit_text}
                    </p>

                    {/* English meaning */}
                    <p className="text-foreground leading-relaxed mb-4 line-clamp-3 font-medium">
                      {verse.english_meaning}
                    </p>

                    {/* Life application */}
                    {verse.life_application && (
                      <div className="pt-4 border-t border-border/50 mb-4">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {verse.life_application}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Read more */}
                    <div className="flex items-center text-primary text-sm font-bold group-hover:gap-2 transition-all">
                      <span>Read Full Verse</span>
                      <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>

        <Link to="/chapters" className="sm:hidden mt-6 block">
          <Button variant="outline" className="w-full gap-2 font-bold">
            View All Verses
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
