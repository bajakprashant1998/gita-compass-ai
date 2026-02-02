import { useState, useEffect, useRef, RefObject } from 'react';

interface UseAnimatedCounterOptions {
  duration?: number;
  delay?: number;
  threshold?: number;
}

interface UseAnimatedCounterReturn {
  count: number;
  ref: RefObject<HTMLElement>;
  hasAnimated: boolean;
}

export function useAnimatedCounter(
  end: number,
  options: UseAnimatedCounterOptions = {}
): UseAnimatedCounterReturn {
  const { duration = 1500, delay = 0, threshold = 0.3 } = options;
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          // Start animation after delay
          setTimeout(() => {
            let startTimestamp: number | null = null;
            
            const step = (timestamp: number) => {
              if (!startTimestamp) startTimestamp = timestamp;
              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
              
              // Easing function for smooth animation
              const easeOutQuart = 1 - Math.pow(1 - progress, 4);
              setCount(Math.floor(easeOutQuart * end));
              
              if (progress < 1) {
                window.requestAnimationFrame(step);
              }
            };
            
            window.requestAnimationFrame(step);
          }, delay);
          
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, duration, delay, threshold, hasAnimated]);

  return { count, ref, hasAnimated };
}

// Hook for multiple counters with staggered animation
export function useMultipleAnimatedCounters(
  values: number[],
  options: UseAnimatedCounterOptions = {}
): { counts: number[]; ref: RefObject<HTMLElement>; hasAnimated: boolean } {
  const { duration = 1500, delay = 0, threshold = 0.3 } = options;
  const [counts, setCounts] = useState<number[]>(values.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          setTimeout(() => {
            let startTimestamp: number | null = null;
            
            const step = (timestamp: number) => {
              if (!startTimestamp) startTimestamp = timestamp;
              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
              const easeOutQuart = 1 - Math.pow(1 - progress, 4);
              
              setCounts(values.map(val => Math.floor(easeOutQuart * val)));
              
              if (progress < 1) {
                window.requestAnimationFrame(step);
              }
            };
            
            window.requestAnimationFrame(step);
          }, delay);
          
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [values, duration, delay, threshold, hasAnimated]);

  return { counts, ref, hasAnimated };
}
