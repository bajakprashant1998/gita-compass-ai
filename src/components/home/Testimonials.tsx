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
    quote: "Dealing with anxiety was exhausting until I discovered 'equanimity in success and failure'. Now I approach challenges with a calmer mind.",
    author: "Priya S.",
    context: "Marketing Manager, Mumbai",
    problem: "Anxiety",
    rating: 5,
  },
  {
    quote: "As a first-time founder, imposter syndrome was real. The Gita reminded me that self-doubt is universal—even Arjuna faced it.",
    author: "Amit K.",
    context: "Startup Founder, Delhi",
    problem: "Self-Doubt",
    rating: 5,
  },
  {
    quote: "After years of anger management issues, understanding 'desire leads to attachment, attachment leads to anger' was revelatory.",
    author: "Sneha R.",
    context: "Healthcare Professional, Chennai",
    problem: "Anger",
    rating: 5,
  },
  {
    quote: "This platform brought the Gita into my daily routine. The AI coach feels like talking to a wise friend who understands modern struggles.",
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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const current = testimonials[currentIndex];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Real Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            Wisdom in <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">Action</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from people who found clarity through ancient teachings
          </p>
        </div>

        <div className={`max-w-3xl mx-auto ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
          <div className="relative rounded-3xl bg-card border-2 border-border/50 p-8 md:p-12 shadow-lg hover:shadow-xl transition-shadow duration-500">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-tr-3xl" />
            <div className="absolute top-6 left-6 p-2.5 rounded-xl bg-primary/10">
              <Quote className="h-5 w-5 text-primary" />
            </div>
            
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6 mt-4">
              {Array.from({ length: current.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Quote */}
            <div className="text-center" key={currentIndex}>
              <p className="text-lg md:text-xl leading-relaxed mb-8 text-foreground/90 animate-fade-in italic">
                "{current.quote}"
              </p>
              
              <div className="flex flex-col items-center gap-2 animate-fade-in animation-delay-100">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {current.author[0]}
                </div>
                <span className="font-bold">{current.author}</span>
                <span className="text-sm text-muted-foreground">{current.context}</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {current.problem}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button variant="outline" size="icon" onClick={() => { setIsAutoPlaying(false); setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length); }} className="rounded-full h-9 w-9">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => { setIsAutoPlaying(false); setCurrentIndex(index); }}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary w-7' : 'bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40'}`}
                  />
                ))}
              </div>
              <Button variant="outline" size="icon" onClick={() => { setIsAutoPlaying(false); setCurrentIndex((prev) => (prev + 1) % testimonials.length); }} className="rounded-full h-9 w-9">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
