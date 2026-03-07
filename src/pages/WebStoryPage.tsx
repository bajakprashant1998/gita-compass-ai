import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Share2 } from 'lucide-react';

const CANONICAL = 'https://www.bhagavadgitagyan.com';

interface Slide {
  text: string;
  subtext?: string;
  verse_ref?: string;
  gradient?: string;
}

const GRADIENTS = [
  'from-amber-600 to-orange-800',
  'from-indigo-700 to-purple-900',
  'from-emerald-700 to-teal-900',
  'from-rose-700 to-pink-900',
  'from-sky-700 to-blue-900',
  'from-violet-700 to-fuchsia-900',
  'from-orange-700 to-red-900',
  'from-cyan-700 to-emerald-900',
];

export default function WebStoryPage() {
  const { storySlug } = useParams<{ storySlug: string }>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: story, isLoading } = useQuery({
    queryKey: ['web-story', storySlug],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('web_stories')
        .select('*')
        .eq('slug', storySlug)
        .eq('published', true)
        .maybeSingle();
      return data;
    },
    enabled: !!storySlug,
  });

  const slides: Slide[] = story?.slides || [];
  const totalSlides = slides.length;

  const goNext = useCallback(() => {
    setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  }, []);

  // Keyboard + swipe
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!story || !slides.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
        <Link to="/" className="text-primary hover:underline">Go Home</Link>
      </div>
    );
  }

  const slide = slides[currentSlide];
  const gradient = slide.gradient || GRADIENTS[currentSlide % GRADIENTS.length];

  return (
    <>
      <SEOHead
        title={`${story.title} - Bhagavad Gita Web Story`}
        description={story.meta_description || `Visual story: ${story.title}. Swipe through beautiful Bhagavad Gita wisdom slides.`}
        canonicalUrl={`${CANONICAL}/stories/${storySlug}`}
        keywords={['bhagavad gita', 'web story', 'krishna wisdom', 'gita quotes']}
        type="article"
      />

      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
          {slides.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/20">
              <div
                className={`h-full rounded-full transition-all duration-300 ${i < currentSlide ? 'bg-white w-full' : i === currentSlide ? 'bg-white w-full' : 'w-0'}`}
              />
            </div>
          ))}
        </div>

        {/* Close */}
        <Link to="/" className="absolute top-4 right-4 z-20">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </Button>
        </Link>

        {/* Slide content */}
        <div
          className={`flex-1 flex flex-col items-center justify-center p-8 md:p-16 bg-gradient-to-br ${gradient} text-white transition-all duration-500`}
          onClick={(e) => {
            const x = e.clientX;
            const w = window.innerWidth;
            if (x < w / 3) goPrev();
            else goNext();
          }}
        >
          {slide.verse_ref && (
            <span className="text-sm font-medium uppercase tracking-wider opacity-70 mb-6">
              {slide.verse_ref}
            </span>
          )}
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-center leading-tight max-w-3xl mb-6">
            {slide.text}
          </h2>
          {slide.subtext && (
            <p className="text-base md:text-xl text-center opacity-80 max-w-xl leading-relaxed">
              {slide.subtext}
            </p>
          )}

          {/* Slide counter */}
          <span className="absolute bottom-8 text-sm opacity-50">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>

        {/* Navigation arrows (desktop) */}
        {currentSlide > 0 && (
          <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/60 hover:text-white hidden md:block">
            <ChevronLeft className="h-10 w-10" />
          </button>
        )}
        {currentSlide < totalSlides - 1 && (
          <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/60 hover:text-white hidden md:block">
            <ChevronRight className="h-10 w-10" />
          </button>
        )}

        {/* Last slide CTA */}
        {currentSlide === totalSlides - 1 && (
          <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-4 z-20">
            <Link to={`/chapters`}>
              <Button className="bg-white text-black hover:bg-white/90 gap-2">
                Read More Verses
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
