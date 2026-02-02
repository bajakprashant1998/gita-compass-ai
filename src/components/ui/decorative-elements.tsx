import { cn } from '@/lib/utils';

// Floating Om Symbol
export function FloatingOm({ className }: { className?: string }) {
  return (
    <div className={cn(
      "absolute text-primary/10 font-bold select-none pointer-events-none",
      className
    )}>
      <span className="text-6xl md:text-8xl sanskrit">ॐ</span>
    </div>
  );
}

// Lotus Pattern
export function LotusPattern({ className }: { className?: string }) {
  return (
    <div className={cn(
      "absolute opacity-5 pointer-events-none",
      className
    )}>
      <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-primary">
        <path d="M50 15 C55 25, 70 35, 50 50 C30 35, 45 25, 50 15Z" />
        <path d="M50 15 C45 25, 30 35, 50 50 C70 35, 55 25, 50 15Z" />
        <path d="M25 40 C35 45, 45 55, 50 50 C45 35, 35 35, 25 40Z" />
        <path d="M75 40 C65 45, 55 55, 50 50 C55 35, 65 35, 75 40Z" />
        <path d="M30 60 C40 55, 50 50, 50 50 C40 60, 35 65, 30 60Z" />
        <path d="M70 60 C60 55, 50 50, 50 50 C60 60, 65 65, 70 60Z" />
      </svg>
    </div>
  );
}

// Radial Glow Background
export function RadialGlow({ 
  className, 
  position = 'center',
  color = 'primary' 
}: { 
  className?: string; 
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  color?: 'primary' | 'accent' | 'amber';
}) {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  const colorVar = color === 'primary' ? 'var(--primary)' : 
                   color === 'accent' ? 'var(--accent)' : 
                   '38 100% 50%'; // amber

  return (
    <div 
      className={cn(
        "absolute w-96 h-96 rounded-full blur-3xl pointer-events-none",
        positionClasses[position],
        className
      )}
      style={{
        background: `radial-gradient(circle, hsl(${colorVar} / 0.15) 0%, transparent 70%)`
      }}
    />
  );
}

// Animated Gradient Border Card
export function GradientBorderCard({ 
  children, 
  className,
  hoverEffect = true,
}: { 
  children: React.ReactNode; 
  className?: string;
  hoverEffect?: boolean;
}) {
  return (
    <div className={cn(
      "group relative rounded-2xl overflow-hidden",
      className
    )}>
      {/* Left Gradient Border */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-amber-500 to-orange-500" />
      
      {/* Card Content */}
      <div className={cn(
        "h-full bg-card border-2 border-l-0 border-border/50 rounded-r-2xl transition-all duration-300",
        hoverEffect && "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
      )}>
        {children}
      </div>
    </div>
  );
}

// Sparkle Effect Component
export function SparkleEffect({ className }: { className?: string }) {
  return (
    <div className={cn("absolute pointer-events-none", className)}>
      <div className="relative w-full h-full">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              opacity: 0.5 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Trending Badge
export function TrendingBadge({ className }: { className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm",
      className
    )}>
      <span className="animate-pulse">🔥</span>
      Trending
    </span>
  );
}

// Popular Badge
export function PopularBadge({ className }: { className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
      "bg-gradient-to-r from-primary to-amber-500 text-white shadow-sm",
      className
    )}>
      ⭐ Popular
    </span>
  );
}
