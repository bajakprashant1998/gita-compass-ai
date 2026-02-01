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
      description: 'of timeless wisdom'
    },
    { 
      label: 'Verses', 
      value: shloksCount, 
      icon: FileText,
      description: 'for every situation'
    },
    { 
      label: 'Life Problems', 
      value: problemsCount, 
      icon: Sparkles,
      description: 'addressed by Gita'
    },
    { 
      label: 'Seekers Helped', 
      value: '10K+', 
      icon: Users,
      description: 'and counting',
      isStatic: true,
    },
  ];

  return (
    <section ref={sectionRef} className="py-16 border-y border-border/50 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold mb-1 tabular-nums">
                {stat.isStatic ? stat.value : stat.value}
              </div>
              <div className="font-medium">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
