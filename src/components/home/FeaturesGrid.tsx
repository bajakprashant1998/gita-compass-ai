import { Link } from 'react-router-dom';
import { FeatureCard } from '@/components/ui/feature-card';
import { 
  MessageCircle, 
  BookOpen, 
  Heart, 
  Sparkles, 
  Search,
  Volume2 
} from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'AI Gita Coach',
    description: 'Have a conversation with an AI that understands your struggles and guides you with relevant Gita wisdom.',
    badge: 'HOT',
    badgeVariant: 'hot' as const,
    href: '/chat',
  },
  {
    icon: Search,
    title: 'Problem-Based Search',
    description: 'Describe what you\'re going through and find verses that directly address your situation.',
    href: '/problems',
  },
  {
    icon: BookOpen,
    title: '18 Chapters Explored',
    description: 'Navigate through all 18 chapters with modern interpretations and life applications.',
    href: '/chapters',
  },
  {
    icon: Volume2,
    title: 'Listen to Wisdom',
    description: 'Hear verses in Sanskrit with translations. Perfect for meditation and deep reflection.',
    badge: 'NEW',
    badgeVariant: 'new' as const,
    href: '/chapters',
  },
  {
    icon: Sparkles,
    title: 'Modern Stories',
    description: 'Every verse comes with a contemporary story showing how ancient wisdom applies to life today.',
    href: '/chapters/2',
  },
  {
    icon: Heart,
    title: 'Save Your Favorites',
    description: 'Build a personal collection of verses that resonate with you for easy reference.',
    href: '/auth',
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for your{' '}
            <span className="text-gradient">spiritual journey</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Modern tools to access ancient wisdom. Search, learn, reflect, and grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.href}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                badge={feature.badge}
                badgeVariant={feature.badgeVariant}
                actionLabel="Explore"
                className="h-full cursor-pointer"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
