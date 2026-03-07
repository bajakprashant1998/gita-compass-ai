import {
  Flame, Heart, Brain, Leaf, Sun, Moon, Eye, Compass,
  Target, Shield, Zap, Feather, Wind, Mountain, Waves,
  Star, Sparkles, CircleDot, Flower2, TreePine, Gem,
  Infinity, Crown, Lightbulb, HandHeart, Orbit
} from 'lucide-react';
import { cn } from '@/lib/utils';

type BlogTheme = {
  gradient: string;
  accentGradient: string;
  iconColor: string;
  patternColor: string;
  icons: React.ElementType[];
  centerIcon: React.ElementType;
  orbitalIcons: React.ElementType[];
};

const blogThemes: Record<string, BlogTheme> = {
  'karma-yoga': {
    gradient: 'from-amber-500/20 via-orange-400/10 to-yellow-500/15',
    accentGradient: 'from-amber-500 to-orange-600',
    iconColor: 'text-amber-600 dark:text-amber-400',
    patternColor: 'text-amber-500/[0.06]',
    icons: [Flame, Sun, Target, Zap, HandHeart],
    centerIcon: Flame,
    orbitalIcons: [Sun, Target, HandHeart, Zap],
  },
  'dharma': {
    gradient: 'from-emerald-500/20 via-teal-400/10 to-green-500/15',
    accentGradient: 'from-emerald-500 to-teal-600',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    patternColor: 'text-emerald-500/[0.06]',
    icons: [Shield, Compass, Crown, Mountain, Gem],
    centerIcon: Shield,
    orbitalIcons: [Compass, Crown, Mountain, Gem],
  },
  'anxiety': {
    gradient: 'from-blue-500/20 via-cyan-400/10 to-sky-500/15',
    accentGradient: 'from-blue-500 to-cyan-600',
    iconColor: 'text-blue-600 dark:text-blue-400',
    patternColor: 'text-blue-500/[0.06]',
    icons: [Brain, Waves, Feather, Wind, Leaf],
    centerIcon: Brain,
    orbitalIcons: [Waves, Feather, Wind, Leaf],
  },
  'detachment': {
    gradient: 'from-rose-500/20 via-pink-400/10 to-fuchsia-500/15',
    accentGradient: 'from-rose-500 to-pink-600',
    iconColor: 'text-rose-600 dark:text-rose-400',
    patternColor: 'text-rose-500/[0.06]',
    icons: [Feather, Wind, Infinity, Flower2, Heart],
    centerIcon: Feather,
    orbitalIcons: [Wind, Infinity, Flower2, Heart],
  },
  'meditation': {
    gradient: 'from-violet-500/20 via-purple-400/10 to-indigo-500/15',
    accentGradient: 'from-violet-500 to-purple-600',
    iconColor: 'text-violet-600 dark:text-violet-400',
    patternColor: 'text-violet-500/[0.06]',
    icons: [Eye, Moon, CircleDot, Star, Orbit],
    centerIcon: Eye,
    orbitalIcons: [Moon, CircleDot, Star, Orbit],
  },
  'krishna': {
    gradient: 'from-indigo-500/20 via-blue-400/10 to-violet-500/15',
    accentGradient: 'from-indigo-500 to-blue-600',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    patternColor: 'text-indigo-500/[0.06]',
    icons: [Sparkles, Crown, Heart, Flower2, Star],
    centerIcon: Sparkles,
    orbitalIcons: [Crown, Heart, Flower2, Star],
  },
  'default': {
    gradient: 'from-primary/20 via-primary/10 to-accent/15',
    accentGradient: 'from-primary to-primary/80',
    iconColor: 'text-primary',
    patternColor: 'text-primary/[0.06]',
    icons: [Lightbulb, Star, Gem, TreePine, Leaf],
    centerIcon: Lightbulb,
    orbitalIcons: [Star, Gem, TreePine, Leaf],
  },
};

function getThemeForSlug(slug: string): BlogTheme {
  if (slug.includes('karma')) return blogThemes['karma-yoga'];
  if (slug.includes('dharma') || slug.includes('duty')) return blogThemes['dharma'];
  if (slug.includes('anxiety') || slug.includes('stress') || slug.includes('overcoming')) return blogThemes['anxiety'];
  if (slug.includes('detach') || slug.includes('letting-go')) return blogThemes['detachment'];
  if (slug.includes('meditation') || slug.includes('dhyana')) return blogThemes['meditation'];
  if (slug.includes('krishna') || slug.includes('divine') || slug.includes('lila')) return blogThemes['krishna'];
  return blogThemes['default'];
}

interface BlogCoverGraphicProps {
  slug: string;
  variant?: 'hero' | 'card' | 'mini';
  className?: string;
}

export function BlogCoverGraphic({ slug, variant = 'card', className }: BlogCoverGraphicProps) {
  const theme = getThemeForSlug(slug);
  const CenterIcon = theme.centerIcon;

  if (variant === 'mini') {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-lg bg-gradient-to-br',
        theme.gradient,
        'flex items-center justify-center',
        className
      )}>
        <CenterIcon className={cn('h-5 w-5', theme.iconColor)} strokeWidth={1.5} />
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={cn(
        'relative rounded-2xl overflow-hidden bg-gradient-to-br border border-border/50 shadow-lg',
        theme.gradient,
        'aspect-[16/7]',
        className
      )}>
        {/* Background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large decorative icons scattered */}
          {theme.icons.map((Icon, i) => {
            const positions = [
              { top: '8%', left: '5%', size: 'h-16 w-16', rotate: '-12deg', opacity: 'opacity-[0.04]' },
              { top: '60%', right: '8%', size: 'h-20 w-20', rotate: '15deg', opacity: 'opacity-[0.03]' },
              { bottom: '10%', left: '25%', size: 'h-12 w-12', rotate: '-25deg', opacity: 'opacity-[0.05]' },
              { top: '15%', right: '30%', size: 'h-14 w-14', rotate: '8deg', opacity: 'opacity-[0.04]' },
              { bottom: '20%', right: '45%', size: 'h-10 w-10', rotate: '-5deg', opacity: 'opacity-[0.06]' },
            ];
            const pos = positions[i];
            return (
              <Icon
                key={i}
                className={cn('absolute', pos.size, pos.opacity, theme.iconColor)}
                style={{
                  top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom,
                  transform: `rotate(${pos.rotate})`,
                }}
                strokeWidth={1}
              />
            );
          })}
          
          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-radial from-background/30 to-transparent blur-2xl" />
        </div>

        {/* Center infographic */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Orbital ring */}
            <div className="w-36 h-36 rounded-full border-2 border-dashed border-current opacity-[0.08] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="w-52 h-52 rounded-full border border-current opacity-[0.04] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            
            {/* Center icon */}
            <div className={cn(
              'w-20 h-20 rounded-2xl bg-gradient-to-br shadow-xl flex items-center justify-center relative z-10',
              theme.accentGradient
            )}>
              <CenterIcon className="h-10 w-10 text-white" strokeWidth={1.5} />
            </div>

            {/* Orbital icons */}
            {theme.orbitalIcons.map((OIcon, i) => {
              const angle = (i * 90) - 45;
              const rad = (angle * Math.PI) / 180;
              const radius = 72;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;
              return (
                <div
                  key={i}
                  className={cn(
                    'absolute w-9 h-9 rounded-xl bg-card/80 backdrop-blur-sm border border-border/60 shadow-md flex items-center justify-center z-20'
                  )}
                  style={{
                    left: `calc(50% + ${x}px - 18px)`,
                    top: `calc(50% + ${y}px - 18px)`,
                  }}
                >
                  <OIcon className={cn('h-4 w-4', theme.iconColor)} strokeWidth={1.5} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Connecting lines (decorative) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="20%" x2="40%" y2="45%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="90%" y1="30%" x2="60%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="20%" y1="80%" x2="45%" y2="55%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="80%" y1="75%" x2="55%" y2="52%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>
    );
  }

  // Card variant
  return (
    <div className={cn(
      'relative overflow-hidden bg-gradient-to-br',
      theme.gradient,
      'flex items-center justify-center',
      className
    )}>
      {/* Subtle pattern */}
      <div className="absolute inset-0">
        {theme.icons.slice(0, 3).map((Icon, i) => {
          const spots = [
            { top: '15%', left: '10%', size: 'h-10 w-10', rotate: '-15deg' },
            { bottom: '15%', right: '10%', size: 'h-12 w-12', rotate: '20deg' },
            { top: '50%', right: '25%', size: 'h-8 w-8', rotate: '-8deg' },
          ];
          const s = spots[i];
          return (
            <Icon
              key={i}
              className={cn('absolute opacity-[0.05]', s.size, theme.iconColor)}
              style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom, transform: `rotate(${s.rotate})` }}
              strokeWidth={1}
            />
          );
        })}
      </div>

      {/* Center graphic */}
      <div className="relative z-10">
        <div className={cn(
          'w-14 h-14 rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center',
          theme.accentGradient
        )}>
          <CenterIcon className="h-7 w-7 text-white" strokeWidth={1.5} />
        </div>
        {/* Small satellite dots */}
        {theme.orbitalIcons.slice(0, 3).map((OIcon, i) => {
          const angle = (i * 120) - 90;
          const rad = (angle * Math.PI) / 180;
          const r = 42;
          return (
            <div
              key={i}
              className="absolute w-7 h-7 rounded-lg bg-card/70 backdrop-blur-sm border border-border/40 shadow-sm flex items-center justify-center"
              style={{
                left: `calc(50% + ${Math.cos(rad) * r}px - 14px)`,
                top: `calc(50% + ${Math.sin(rad) * r}px - 14px)`,
              }}
            >
              <OIcon className={cn('h-3.5 w-3.5', theme.iconColor)} strokeWidth={1.5} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
