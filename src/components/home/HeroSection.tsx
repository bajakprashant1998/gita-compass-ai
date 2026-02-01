import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, BookOpen, FileText, MessageCircle } from 'lucide-react';
import { TrustBadges } from './TrustBadges';
import { getStats } from '@/lib/api';

export function HeroSection() {
  const [problem, setProblem] = useState('');
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problem.trim()) {
      navigate(`/chat?q=${encodeURIComponent(problem.trim())}`);
    }
  };

  const quickPrompts = [
    "I feel anxious about my future",
    "I can't make a difficult decision",
    "I'm struggling with anger",
    "I feel lost and confused",
  ];

  const featureBadges = [
    { icon: BookOpen, label: `${stats?.chapters || 18} Chapters` },
    { icon: FileText, label: `${stats?.shloks || 700}+ Verses` },
    { icon: MessageCircle, label: 'AI-Powered' },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Ancient Wisdom
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Ancient wisdom.{' '}
              <span className="text-gradient relative">
                Modern problems.
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Transform your struggles into strength with timeless guidance from the Bhagavad Gita, 
              delivered in a way that makes sense for your life today.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              {featureBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm font-medium"
                >
                  <badge.icon className="h-4 w-4 text-primary" />
                  {badge.label}
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center lg:justify-start mb-8">
              <TrustBadges />
            </div>
          </div>

          {/* Right Column - Input Form */}
          <div className="lg:pl-8">
            <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-xl shadow-primary/5">
              <h2 className="text-xl font-semibold mb-2">What's on your mind?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Share your struggle and receive guidance from the Gita
              </p>
              
              <form onSubmit={handleSubmit}>
                <Textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="I'm feeling anxious about..."
                  className="min-h-[120px] text-base resize-none mb-4 bg-background border-border focus:border-primary transition-colors"
                />
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full gap-2"
                  disabled={!problem.trim()}
                >
                  Get Guidance
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              {/* Quick prompts */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-3">Try these:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setProblem(prompt)}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
