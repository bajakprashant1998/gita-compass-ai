import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Gift, 
  Coffee, 
  Star, 
  Globe, 
  Users, 
  BookOpen,
  Sparkles,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';

// Direct PayPal payment links for each tier
const paypalLinks = {
  '$1': 'https://www.paypal.com/ncp/payment/8RSFYKXMJCNVA',
  '$5': 'https://www.paypal.com/ncp/payment/L2WYGJLPQ4P5A',
  '$10': 'https://www.paypal.com/ncp/payment/FX4UJ77W5PU7Q',
};

const donationTiers = [
  {
    name: 'Seeker',
    amount: '$1',
    description: 'Show your support',
    icon: Coffee,
    features: [
      'Support platform maintenance',
      'Our heartfelt gratitude',
    ],
    color: 'from-amber-400 to-orange-500',
    popular: false,
  },
  {
    name: 'Devotee',
    amount: '$5',
    description: 'Make an impact',
    icon: Heart,
    features: [
      'Everything in Seeker',
      'Help reach more seekers',
      'Support new features',
    ],
    color: 'from-rose-500 to-orange-500',
    popular: true,
  },
  {
    name: 'Patron',
    amount: '$10',
    description: 'Champion the cause',
    icon: Star,
    features: [
      'Everything in Devotee',
      'Support major initiatives',
      'Priority feature requests',
      'Special patron badge',
    ],
    color: 'from-purple-500 to-pink-500',
    popular: false,
  },
];

const impactStats = [
  { icon: Users, label: 'Seekers Reached', value: '10,000+' },
  { icon: BookOpen, label: 'Verses Explained', value: '700+' },
  { icon: Globe, label: 'Countries', value: '50+' },
];

export default function DonatePage() {
  const handleDonate = (amount: string) => {
    const link = paypalLinks[amount as keyof typeof paypalLinks];
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <Layout>
      <SEOHead 
        title="Donate | Support Bhagavad Gita Gyan"
        description="Support our mission to spread the wisdom of the Bhagavad Gita to seekers worldwide."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-500/5 via-background to-orange-500/5 py-20">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <RadialGlow position="top-right" color="primary" className="opacity-40" />
          <RadialGlow position="bottom-left" color="amber" className="opacity-30" />
          <FloatingOm className="top-20 left-10 hidden lg:block" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary)/0.1),transparent_40%)]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-sm font-medium text-rose-600 dark:text-rose-400 mb-6">
              <Heart className="h-4 w-4" />
              Support Our Mission
            </div>
            <h1 className="headline-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              Help Spread <span className="text-gradient">Gita Wisdom</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Your contribution helps us maintain this platform, add new features, 
              and reach more seekers around the world with the timeless wisdom of the Bhagavad Gita.
            </p>

            {/* Impact Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-rose-500" />
                  </div>
                  <div className="text-2xl font-bold text-gradient">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donation Tiers */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="headline-bold text-3xl md:text-4xl mb-4">
              Choose Your <span className="text-gradient">Contribution</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every donation, big or small, makes a difference in spreading spiritual wisdom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {donationTiers.map((tier, index) => (
              <div 
                key={index}
                className={`relative rounded-2xl border ${
                  tier.popular 
                    ? 'border-rose-500/50 shadow-xl shadow-rose-500/10' 
                    : 'border-border/50'
                } bg-card p-8 hover:border-rose-500/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-6`}>
                  <tier.icon className="h-7 w-7 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-4xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    {tier.amount}
                  </span>
                  <span className="text-muted-foreground">one-time</span>
                </div>
                <p className="text-muted-foreground mb-6">{tier.description}</p>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90 shadow-lg`}
                  onClick={() => handleDonate(tier.amount)}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Donate {tier.amount}
                </Button>
              </div>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Want to contribute a different amount?
            </p>
            <Button 
              variant="outline" 
              size="lg"
              className="border-rose-500/30 hover:bg-rose-500/5 hover:border-rose-500/50"
              onClick={() => window.open('https://www.paypal.com/ncp/payment/L2WYGJLPQ4P5A', '_blank')}
            >
              <Heart className="h-4 w-4 mr-2 text-rose-500" />
              Custom Donation
            </Button>
          </div>
        </div>
      </section>

      {/* How Your Donation Helps */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="headline-bold text-3xl md:text-4xl mb-4">
              How Your Donation <span className="text-gradient">Helps</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your contribution goes directly toward improving and expanding this platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Sparkles, title: 'AI Development', desc: 'Improve our AI coaching capabilities' },
              { icon: Globe, title: 'Translations', desc: 'Add more language support' },
              { icon: BookOpen, title: 'Content', desc: 'Expand verse explanations' },
              { icon: Users, title: 'Community', desc: 'Build features for seekers' },
            ].map((item, index) => (
              <div 
                key={index}
                className="rounded-xl border border-border/50 bg-card p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-amber-500/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center rounded-2xl border border-border/50 bg-gradient-to-br from-rose-500/5 to-orange-500/5 p-12">
            <Heart className="h-12 w-12 mx-auto mb-6 text-rose-500" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Thank You for Your Support
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Whether you donate or simply share our platform with others, 
              your support means the world to us. Together, we can spread the 
              timeless wisdom of the Bhagavad Gita to seekers everywhere.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <Link to="/chapters">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Explore Chapters
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get in Touch
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
