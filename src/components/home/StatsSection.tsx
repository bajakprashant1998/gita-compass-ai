import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { getStats } from '@/lib/api';
import { BookOpen, FileText, Users, Sparkles } from 'lucide-react';

function useCountUp(end: number, duration: number = 2000, startCounting: boolean = false) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!startCounting) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, startCounting]);
  
  return count;
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const chaptersCount = useCountUp(stats?.chapters || 18, 1500, isVisible);
  const shloksCount = useCountUp(stats?.shloks || 700, 2000, isVisible);
  const problemsCount = useCountUp(stats?.problems || 8, 1200, isVisible);

  const statItems = [
    { 
      label: 'Chapters', 
      value: chaptersCount, 
      icon: BookOpen,
      description: 'of timeless wisdom',
      color: 'from-primary to-amber-500'
    },
    { 
      label: 'Verses', 
      value: shloksCount, 
      icon: FileText,
      description: 'for every situation',
      color: 'from-amber-500 to-orange-500'
    },
    { 
      label: 'Life Problems', 
      value: problemsCount, 
      icon: Sparkles,
      description: 'addressed by Gita',
      color: 'from-orange-500 to-red-500'
    },
    { 
      label: 'Seekers Helped', 
      value: '10K+', 
      icon: Users,
      description: 'and counting',
      isStatic: true,
      color: 'from-red-500 to-pink-500'
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-card to-background border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            By The Numbers
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Proven <span className="text-gradient">Results</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {statItems.map((stat, index) => (
            <div
              key={stat.label}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative group">
                {/* Card */}
                <div className="relative rounded-2xl border-2 border-border/50 bg-card p-6 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  
                  {/* Value */}
                  <div className="text-4xl md:text-5xl font-extrabold mb-1 text-gradient">
                    {stat.isStatic ? stat.value : stat.value}
                    {!stat.isStatic && '+'}
                  </div>
                  
                  {/* Label */}
                  <div className="text-lg font-bold text-foreground mb-1">
                    {stat.label}
                  </div>
                  
                  {/* Description */}
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
