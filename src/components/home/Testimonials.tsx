import { useState, useEffect, useRef } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    quote: "When I was paralyzed by a career decision, the Gita's teaching on 'action without attachment to results' gave me clarity. I focused on doing my best work instead of obsessing over outcomes.",
    author: "Rahul M.",
    context: "Software Engineer, Bangalore",
    problem: "Decision Making",
    rating: 5,
  },
  {
    quote: "Dealing with anxiety was exhausting until I discovered 'equanimity in success and failure'. Now I approach challenges with a calmer mind, knowing my worth isn't defined by temporary setbacks.",
    author: "Priya S.",
    context: "Marketing Manager, Mumbai",
    problem: "Anxiety",
    rating: 5,
  },
  {
    quote: "As a first-time founder, imposter syndrome was real. The Gita reminded me that self-doubt is universal—even Arjuna faced it. That perspective shift changed everything.",
    author: "Amit K.",
    context: "Startup Founder, Delhi",
    problem: "Self-Doubt",
    rating: 5,
  },
  {
    quote: "After years of anger management issues, understanding 'desire leads to attachment, attachment leads to anger' was revelatory. It helped me trace the root of my reactions.",
    author: "Sneha R.",
    context: "Healthcare Professional, Chennai",
    problem: "Anger",
    rating: 5,
  },
  {
    quote: "This platform brought the Gita into my daily routine. The AI coach feels like talking to a wise friend who understands modern struggles through ancient eyes.",
    author: "Vikram P.",
    context: "Product Designer, Hyderabad",
    problem: "Life Purpose",
    rating: 5,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-b from-transparent to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Real Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            Wisdom in <span className="text-gradient">Action</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from people who found clarity through ancient teachings
          </p>
        </div>

        <div className={`max-w-4xl mx-auto ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
          <div className="relative bg-card rounded-3xl p-8 md:p-14 shadow-2xl border-2 border-border/50 hover:border-primary/20 transition-colors duration-500">
            {/* Decorative gradient corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-tr-3xl" />
            
            {/* Quote icon */}
            <div className="absolute top-6 left-6 p-3 rounded-xl bg-primary/10">
              <Quote className="h-6 w-6 text-primary" />
            </div>
            
            {/* Star rating */}
            <div className="flex justify-center gap-1 mb-6 mt-4">
              {Array.from({ length: current.rating }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Testimonial content */}
            <div className="text-center" key={currentIndex}>
              <p className="text-lg md:text-xl leading-relaxed mb-8 text-foreground/90 animate-fade-in italic">
                "{current.quote}"
              </p>
              
              <div className="flex flex-col items-center gap-2 animate-fade-in animation-delay-100">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {current.author[0]}
                </div>
                <span className="font-bold text-lg">{current.author}</span>
                <span className="text-sm text-muted-foreground">{current.context}</span>
                <span className="inline-block mt-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {current.problem}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                className="rounded-full h-10 w-10 border-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-primary w-8' 
                        : 'bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="rounded-full h-10 w-10 border-2"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}