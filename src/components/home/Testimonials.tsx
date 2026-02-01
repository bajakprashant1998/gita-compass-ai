import { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    quote: "When I was paralyzed by a career decision, the Gita's teaching on 'action without attachment to results' gave me clarity. I focused on doing my best work instead of obsessing over outcomes.",
    author: "Rahul M.",
    context: "Software Engineer, Bangalore",
    problem: "Decision Making",
  },
  {
    quote: "Dealing with anxiety was exhausting until I discovered 'equanimity in success and failure'. Now I approach challenges with a calmer mind, knowing my worth isn't defined by temporary setbacks.",
    author: "Priya S.",
    context: "Marketing Manager, Mumbai",
    problem: "Anxiety",
  },
  {
    quote: "As a first-time founder, imposter syndrome was real. The Gita reminded me that self-doubt is universal—even Arjuna faced it. That perspective shift changed everything.",
    author: "Amit K.",
    context: "Startup Founder, Delhi",
    problem: "Self-Doubt",
  },
  {
    quote: "After years of anger management issues, understanding 'desire leads to attachment, attachment leads to anger' was revelatory. It helped me trace the root of my reactions.",
    author: "Sneha R.",
    context: "Healthcare Professional, Chennai",
    problem: "Anger",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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
    <section className="py-16 md:py-20 bg-gradient-to-b from-transparent to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Wisdom in Action</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from people who found clarity through ancient teachings
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative bg-card rounded-2xl p-8 md:p-12 shadow-lg border">
            {/* Quote icon */}
            <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/20" />
            
            {/* Testimonial content */}
            <div className="text-center animate-fade-in" key={currentIndex}>
              <p className="text-lg md:text-xl leading-relaxed mb-8 text-foreground/90">
                "{current.quote}"
              </p>
              
              <div className="flex flex-col items-center gap-2">
                <span className="font-semibold">{current.author}</span>
                <span className="text-sm text-muted-foreground">{current.context}</span>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {current.problem}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="rounded-full"
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
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-primary w-6' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="rounded-full"
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
