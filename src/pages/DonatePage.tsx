import { useState } from 'react';
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
  Check,
  ArrowRight,
  MessageCircle,
  Shield,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const paypalLinks = {
  '$1': 'https://www.paypal.com/ncp/payment/8RSFYKXMJCNVA',
  '$5': 'https://www.paypal.com/ncp/payment/L2WYGJLPQ4P5A',
  '$10': 'https://www.paypal.com/ncp/payment/FX4UJ77W5PU7Q',
};

const donationTiers = [
  {
    name: 'Seeker',
    amount: '$1',
    description: 'A gesture of gratitude',
    icon: Coffee,
    features: ['Support platform maintenance', 'Our heartfelt gratitude'],
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/20',
    popular: false,
  },
  {
    name: 'Devotee',
    amount: '$5',
    description: 'Make a real impact',
    icon: Heart,
    features: ['Everything in Seeker', 'Help reach more seekers', 'Support new features'],
    gradient: 'from-rose-500 to-orange-500',
    shadow: 'shadow-rose-500/20',
    popular: true,
  },
  {
    name: 'Patron',
    amount: '$10',
    description: 'Champion the mission',
    icon: Star,
    features: ['Everything in Devotee', 'Support major initiatives', 'Priority feature requests', 'Special patron badge'],
    gradient: 'from-purple-500 to-pink-500',
    shadow: 'shadow-purple-500/20',
    popular: false,
  },
];

const impactStats = [
  { icon: Users, label: 'Seekers Reached', value: '10,000+', gradient: 'from-primary to-amber-500' },
  { icon: BookOpen, label: 'Verses Explained', value: '700+', gradient: 'from-amber-500 to-orange-500' },
  { icon: Globe, label: 'Countries', value: '50+', gradient: 'from-orange-500 to-red-500' },
];

const impactAreas = [
  { icon: Sparkles, title: 'AI Development', desc: 'Enhance our AI coaching with deeper understanding and more personalized guidance' },
  { icon: Globe, title: 'Translations', desc: 'Add support for more languages so wisdom reaches every corner of the world' },
  { icon: BookOpen, title: 'Content', desc: 'Expand verse explanations with modern stories, life applications, and deeper insights' },
  { icon: Users, title: 'Community', desc: 'Build study groups, discussion forums, and collaborative learning features' },
];

export default function DonatePage() {
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  const handleDonate = (amount: string) => {
    const link = paypalLinks[amount as keyof typeof paypalLinks];
    if (link) window.open(link, '_blank');
  };

  return (
    <Layout>
      <SEOHead 
        title="Donate | Support Bhagavad Gita Gyan"
        description="Support our mission to spread the wisdom of the Bhagavad Gita to seekers worldwide."
      />

      {/* ========== PREMIUM HERO ========== */}
      <section className="relative overflow-hidden min-h-[55vh] flex items-center border-b border-border/50">
        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/6 via-background to-orange-500/6" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,hsl(var(--primary)/0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,hsl(350_80%_60%/0.08),transparent_50%)]" />
          <div className="absolute top-[10%] left-[15%] w-96 h-96 rounded-full bg-rose-500/[0.04] blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-500/[0.04] blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Watermark */}
        <div className="absolute right-[-5%] top-[5%] text-[22rem] font-bold text-primary/[0.03] select-none pointer-events-none leading-none hidden lg:block" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ॐ</div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-semibold uppercase tracking-wider mb-8 animate-fade-in border border-rose-500/20 backdrop-blur-sm">
              <Heart className="h-4 w-4 fill-current" />
              Support Our Mission
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 animate-fade-in animation-delay-100 tracking-tight">
              <span className="text-foreground">Help spread</span>
              <br />
              <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">Gita wisdom.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in animation-delay-200">
              Your contribution helps maintain this platform, add new features, 
              and reach seekers around the world with timeless guidance.
            </p>

            {/* Impact Stats */}
            <div className="flex flex-wrap justify-center gap-10 animate-fade-in animation-delay-300">
              {impactStats.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className={cn("w-14 h-14 mx-auto rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300", stat.gradient)}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ========== DONATION TIERS ========== */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-rose-500 to-orange-500" />
              <h2 className="text-3xl md:text-4xl font-extrabold">
                Choose Your <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">Contribution</span>
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every donation, big or small, makes a difference in spreading spiritual wisdom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {donationTiers.map((tier, index) => (
              <div 
                key={index}
                className={cn(
                  "group relative rounded-2xl border-2 bg-card overflow-hidden transition-all duration-300 hover:-translate-y-2",
                  tier.popular 
                    ? 'border-rose-500/50 shadow-xl hover:shadow-2xl' 
                    : 'border-border/50 hover:border-rose-500/30 hover:shadow-2xl',
                  hoveredTier === index ? tier.shadow : ''
                )}
                onMouseEnter={() => setHoveredTier(index)}
                onMouseLeave={() => setHoveredTier(null)}
              >
                {/* Top gradient bar */}
                <div className={cn("h-1.5 bg-gradient-to-r", tier.gradient)} />

                {tier.popular && (
                  <div className="absolute top-5 right-5">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Background watermark */}
                <div className="absolute -right-4 -bottom-4 text-[8rem] font-extrabold text-primary/[0.03] select-none pointer-events-none transition-transform duration-500 group-hover:scale-110">
                  {tier.amount}
                </div>

                <div className="relative p-8">
                  <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300", tier.gradient)}>
                    <tier.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={cn("text-5xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent", tier.gradient)}>
                      {tier.amount}
                    </span>
                    <span className="text-muted-foreground text-sm">one-time</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{tier.description}</p>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2.5">
                        <div className={cn("w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 mt-0.5", tier.gradient)}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={cn("w-full h-12 font-bold text-base bg-gradient-to-r border-0 shadow-lg hover:opacity-90 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]", tier.gradient)}
                    onClick={() => handleDonate(tier.amount)}
                  >
                    <Gift className="h-5 w-5 mr-2" />
                    Donate {tier.amount}
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="mt-14 text-center animate-fade-in">
            <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-dashed border-border/50 hover:border-rose-500/30 transition-colors">
              <p className="text-muted-foreground font-medium">
                Want to contribute a different amount?
              </p>
              <Button 
                variant="outline" 
                size="lg"
                className="gap-2 h-12 font-bold border-2 border-rose-500/30 hover:bg-rose-500/5 hover:border-rose-500/50"
                onClick={() => window.open('https://www.paypal.com/ncp/payment/M2Y7XQW6NJBSQ', '_blank')}
              >
                <Heart className="h-5 w-5 text-rose-500" />
                Custom Donation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW YOUR DONATION HELPS ========== */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/10 to-background" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-primary to-amber-500" />
              <h2 className="text-3xl md:text-4xl font-extrabold">
                How Your Donation <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">Helps</span>
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your contribution goes directly toward improving and expanding this platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {impactAreas.map((item, index) => (
              <div 
                key={index}
                className="group rounded-2xl border-2 border-border/50 bg-card overflow-hidden hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-1.5 bg-gradient-to-r from-primary to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== BOTTOM CTA ========== */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-3xl opacity-60" />
            <div className="relative border-2 border-border/50 bg-card/95 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />
              <div className="p-10 md:p-14 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold mb-4">
                  Thank You for Your Support
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                  Whether you donate or share our platform with others, 
                  your support means everything. Together, we spread the 
                  timeless wisdom of the Bhagavad Gita to seekers everywhere.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/chat">
                    <Button size="lg" className="gap-2 h-[3.25rem] font-bold bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-90 border-0 shadow-lg">
                      <MessageCircle className="h-5 w-5" />
                      Talk to Krishna
                    </Button>
                  </Link>
                  <Link to="/chapters">
                    <Button size="lg" variant="outline" className="gap-2 h-13 font-bold border-2">
                      <BookOpen className="h-5 w-5" />
                      Explore Chapters
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
