import { useState, useEffect, useRef } from 'react';
import { Quote, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

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
  {
    quote: "I recommend this to every student. The chapter on meditation helped me handle exam stress and stay focused during my board exams.",
    author: "Meera J.",
    context: "Student, Pune",
    problem: "Focus & Stress",
    rating: 5,
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveIndex(prev => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // Show 3 testimonials on desktop: active, active+1, active+2
  const getVisibleCards = () => {
    return [0, 1, 2].map(offset => testimonials[(activeIndex + offset) % testimonials.length]);
  };

  const visibleCards = getVisibleCards();

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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

        {/* Desktop: 3 cards */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {visibleCards.map((testimonial, i) => (
            <div
              key={`${testimonial.author}-${activeIndex}-${i}`}
              className={cn(
                "rounded-2xl border-2 bg-card p-7 transition-all duration-500 animate-fade-in",
                i === 0
                  ? 'border-primary/30 shadow-xl shadow-primary/5 scale-[1.02]'
                  : 'border-border/50 hover:border-primary/20 hover:shadow-lg'
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Quote icon */}
              <div className="flex items-center justify-between mb-5">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Quote className="h-4 w-4 text-primary" />
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-foreground/90 leading-relaxed mb-6 line-clamp-4 italic">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {testimonial.author[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{testimonial.author}</div>
                  <div className="text-xs text-muted-foreground truncate">{testimonial.context}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide shrink-0">
                  {testimonial.problem}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: single card */}
        <div className="lg:hidden max-w-lg mx-auto">
          <div
            key={activeIndex}
            className="rounded-2xl border-2 border-primary/20 bg-card p-6 sm:p-8 shadow-lg animate-fade-in"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Quote className="h-4 w-4 text-primary" />
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: testimonials[activeIndex].rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            <p className="text-foreground/90 leading-relaxed mb-6 italic">
              "{testimonials[activeIndex].quote}"
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                {testimonials[activeIndex].author[0]}
              </div>
              <div>
                <div className="font-semibold text-sm">{testimonials[activeIndex].author}</div>
                <div className="text-xs text-muted-foreground">{testimonials[activeIndex].context}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === activeIndex ? 'bg-primary w-7' : 'bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40'
              )}
            />
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center mt-10 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link to="/chat" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            Share your story with Krishna AI
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
