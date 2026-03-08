import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { 
  MessageCircle, 
  BookOpen, 
  Heart, 
  Sparkles, 
  Search,
  Volume2,
  GitCompareArrows,
  ArrowRight,
  Flame
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: MessageCircle,
    title: 'Talk to Krishna',
    description: 'Have a conversation with an AI that understands your struggles and guides you with relevant Gita wisdom.',
    badge: 'HOT',
    badgeColor: 'bg-red-500',
    href: '/chat',
    gradient: 'from-primary to-amber-500',
    span: 'md:col-span-2 md:row-span-2', // Featured spotlight
    featured: true,
  },
  {
    icon: Search,
    title: 'Problem-Based Search',
    description: 'Find verses that directly address your life situation.',
    href: '/problems',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: BookOpen,
    title: '18 Chapters Explored',
    description: 'Navigate all chapters with modern interpretations.',
    href: '/chapters',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Volume2,
    title: 'Listen to Wisdom',
    description: 'Hear verses in Sanskrit. Perfect for meditation and reflection.',
    badge: 'NEW',
    badgeColor: 'bg-green-500',
    href: '/chapters',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    icon: Sparkles,
    title: 'Modern Stories',
    description: 'Every verse comes with a contemporary story showing how ancient wisdom applies today.',
    href: '/chapters/2',
    gradient: 'from-pink-500 to-purple-500',
  },
  {
    icon: GitCompareArrows,
    title: 'Compare Verses',
    description: 'Compare 2-3 verses side-by-side to discover shared themes.',
    badge: 'NEW',
    badgeColor: 'bg-blue-500',
    href: '/compare',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Heart,
    title: 'Save Favorites',
    description: 'Build a personal collection of verses that resonate with you.',
    href: '/auth',
    gradient: 'from-purple-500 to-indigo-500',
  },
];

export function FeaturesGrid() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold: 0.15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const featured = features[0];
  const rest = features.slice(1);

  return (
    <section ref={sectionRef} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            Everything for your{' '}
            <span className="text-gradient">spiritual journey</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Modern tools to access ancient wisdom. Search, learn, reflect, and grow.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {/* Featured Card - Talk to Krishna */}
          <Link
            to={featured.href}
            className={cn(
              "md:col-span-2 md:row-span-2 transition-all duration-700",
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            <div className="group relative h-full rounded-2xl border-2 border-border/50 bg-card overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* ॐ watermark */}
              <div className="absolute right-4 bottom-4 text-[8rem] text-primary/[0.04] font-bold select-none pointer-events-none leading-none" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ॐ</div>
              
              <div className="relative p-8 md:p-10 flex flex-col h-full min-h-[320px]">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${featured.gradient} text-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300`}>
                    <featured.icon className="h-8 w-8" />
                  </div>
                  <Badge className="bg-red-500 text-white border-0 text-xs font-bold uppercase tracking-wide animate-pulse">
                    {featured.badge}
                  </Badge>
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-3 group-hover:text-primary transition-colors">
                    {featured.title}
                  </h3>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 max-w-md">
                    {featured.description}
                  </p>
                </div>

                {/* Mini demo preview */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex -space-x-2">
                    {['R', 'P', 'A', 'S'].map((letter, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-500 text-white text-xs font-bold flex items-center justify-center border-2 border-card">
                        {letter}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">10K+ seekers guided</span>
                </div>

                <div className="flex items-center text-primary font-bold text-base">
                  <span>Start Conversation</span>
                  <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Rest of the features */}
          {rest.map((feature, index) => (
            <Link
              key={feature.title}
              to={feature.href}
              className={cn(
                "transition-all duration-700",
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: `${(index + 1) * 80}ms` }}
            >
              <div className="group h-full rounded-2xl border-2 border-border/50 bg-card p-5 sm:p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  {feature.badge && (
                    <Badge className={`${feature.badgeColor} text-white border-0 text-[10px] font-bold uppercase tracking-wide`}>
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
