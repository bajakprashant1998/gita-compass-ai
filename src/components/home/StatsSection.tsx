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
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration, startCounting]);
  return count;
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: getStats });

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const chaptersCount = useCountUp(stats?.chapters || 18, 1500, isVisible);
  const shloksCount = useCountUp(stats?.shloks || 700, 2000, isVisible);
  const problemsCount = useCountUp(stats?.problems || 8, 1200, isVisible);

  const statItems = [
    { label: 'Chapters', value: chaptersCount, icon: BookOpen, description: 'of timeless wisdom', suffix: '' },
    { label: 'Verses', value: shloksCount, icon: FileText, description: 'for every situation', suffix: '+' },
    { label: 'Life Problems', value: problemsCount, icon: Sparkles, description: 'addressed by Gita', suffix: '+' },
    { label: 'Seekers Helped', value: '10K+', icon: Users, description: 'and counting', isStatic: true, suffix: '' },
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {statItems.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center p-6 sm:p-8 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 text-white mb-4 shadow-lg">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent mb-1">
                  {stat.isStatic ? stat.value : `${stat.value}${stat.suffix}`}
                </div>
                <div className="text-sm font-bold text-foreground mb-0.5">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
