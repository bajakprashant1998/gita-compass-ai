import { useRef, useState, useEffect } from 'react';
import { Search, BookOpen, Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: Search,
    title: 'Describe Your Struggle',
    description: 'Share what\'s troubling you—career stress, relationship issues, or life decisions.',
    color: 'from-primary to-amber-500',
    details: ['Type in your own words', 'Use any language', 'Be as specific as you like'],
  },
  {
    icon: BookOpen,
    title: 'Get Matched Wisdom',
    description: 'Our AI matches your challenge to relevant verses with practical interpretations.',
    color: 'from-amber-500 to-orange-500',
    details: ['700+ verses analyzed', 'Context-aware matching', 'Multiple perspectives'],
  },
  {
    icon: Lightbulb,
    title: 'Apply to Your Life',
    description: 'Receive actionable guidance with modern stories that make wisdom relatable.',
    color: 'from-orange-500 to-red-500',
    details: ['Practical action steps', 'Modern life stories', 'Save for later'],
  },
];

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold: 0.2 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform ancient wisdom into practical guidance in three simple steps
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-28 left-[16%] right-[16%] h-0.5">
            <div className={cn(
              "h-full bg-gradient-to-r from-primary/40 via-amber-500/40 to-orange-500/40 transition-all duration-1000",
              isVisible ? 'scale-x-100' : 'scale-x-0'
            )} style={{ transformOrigin: 'left' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={cn(
                  "relative transition-all duration-700",
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="rounded-2xl border-2 border-border/50 bg-card p-7 text-center group hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
                  {/* Step number */}
                  <div className={cn(
                    "absolute -top-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-gradient-to-br text-white text-sm font-bold flex items-center justify-center shadow-lg ring-4 ring-background",
                    step.color
                  )}>
                    {index + 1}
                  </div>
                  
                  <div className={cn(
                    "w-16 h-16 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform",
                    step.color
                  )}>
                    <step.icon className="h-7 w-7" />
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">{step.description}</p>

                  {/* Detail bullets */}
                  <div className="space-y-2">
                    {step.details.map(detail => (
                      <div key={detail} className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-5">
                      <ArrowRight className="h-5 w-5 text-primary/40" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className={cn(
            "text-center mt-10 transition-all duration-700 delay-500",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <Link to="/chat">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 border-0 shadow-lg font-bold">
                Try It Now — It's Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
