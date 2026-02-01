import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  BookOpen, 
  Heart, 
  Sparkles, 
  Search,
  Volume2,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: MessageCircle,
    title: 'AI Gita Coach',
    description: 'Have a conversation with an AI that understands your struggles and guides you with relevant Gita wisdom.',
    badge: 'HOT',
    badgeColor: 'bg-red-500',
    href: '/chat',
    gradient: 'from-primary to-amber-500',
  },
  {
    icon: Search,
    title: 'Problem-Based Search',
    description: 'Describe what you\'re going through and find verses that directly address your situation.',
    href: '/problems',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: BookOpen,
    title: '18 Chapters Explored',
    description: 'Navigate through all 18 chapters with modern interpretations and life applications.',
    href: '/chapters',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Volume2,
    title: 'Listen to Wisdom',
    description: 'Hear verses in Sanskrit with translations. Perfect for meditation and deep reflection.',
    badge: 'NEW',
    badgeColor: 'bg-green-500',
    href: '/chapters',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    icon: Sparkles,
    title: 'Modern Stories',
    description: 'Every verse comes with a contemporary story showing how ancient wisdom applies to life today.',
    href: '/chapters/2',
    gradient: 'from-pink-500 to-purple-500',
  },
  {
    icon: Heart,
    title: 'Save Your Favorites',
    description: 'Build a personal collection of verses that resonate with you for easy reference.',
    href: '/auth',
    gradient: 'from-purple-500 to-indigo-500',
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4 animate-fade-in">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 animate-fade-in animation-delay-100">
            Everything for your{' '}
            <span className="text-gradient">spiritual journey</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Modern tools to access ancient wisdom. Search, learn, reflect, and grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link 
              key={feature.title} 
              to={feature.href}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="group h-full rounded-2xl border-2 border-border/50 bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2">
                {/* Header with icon and badge */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  {feature.badge && (
                    <Badge className={`${feature.badgeColor} text-white border-0 text-xs font-bold uppercase tracking-wide`}>
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {feature.description}
                </p>
                
                {/* CTA */}
                <div className="flex items-center text-primary font-bold text-sm">
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
