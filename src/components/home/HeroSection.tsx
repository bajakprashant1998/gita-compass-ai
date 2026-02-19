import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, MessageCircle, CheckCircle, Star, Shield, Zap } from 'lucide-react';
import { TrustBadges } from './TrustBadges';
import { getStats } from '@/lib/api';

// Typewriter placeholder hook
function useTypewriter(phrases: string[], typingSpeed = 60, pauseTime = 2000) {
  const [placeholder, setPlaceholder] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentPhrase.length) {
          setPlaceholder(currentPhrase.slice(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholder(currentPhrase.slice(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? 30 : typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, phrases, typingSpeed, pauseTime]);

  return placeholder;
}

// Floating particle component
function FloatingParticle({ delay, size, x, y }: { delay: number; size: number; x: number; y: number }) {
  return (
    <div
      className="absolute rounded-full bg-primary/20 animate-float"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${6 + delay}s`,
      }}
    />
  );
}

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

  const typewriterPlaceholder = useTypewriter([
    "I'm feeling anxious about my future...",
    "I can't make a difficult decision...",
    "I'm struggling with anger issues...",
    "I feel lost and don't know my purpose...",
    "How do I deal with fear of failure?",
  ]);

  const quickPrompts = [
    "😰 I feel anxious about my future",
    "🤔 I can't make a difficult decision",
    "😤 I'm struggling with anger",
    "😶‍🌫️ I feel lost and confused",
  ];

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,hsl(var(--primary)/0.18),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,hsl(var(--accent)/0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.05),transparent_70%)]" />
      
      {/* Floating particles */}
      <FloatingParticle delay={0} size={6} x={10} y={20} />
      <FloatingParticle delay={1.5} size={4} x={85} y={15} />
      <FloatingParticle delay={3} size={8} x={70} y={70} />
      <FloatingParticle delay={0.5} size={5} x={25} y={75} />
      <FloatingParticle delay={2} size={3} x={50} y={10} />
      <FloatingParticle delay={4} size={6} x={90} y={50} />

      {/* Large decorative ॐ watermark */}
      <div className="absolute right-[-5%] top-[10%] text-[20rem] font-bold text-primary/[0.03] select-none pointer-events-none leading-none">
        ॐ
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-6 animate-fade-in border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              AI-Powered Ancient Wisdom
              <Sparkles className="h-4 w-4" />
            </div>

            {/* Headline */}
            <h1 className="headline-bold mb-6 animate-fade-in animation-delay-100">
              <span className="text-foreground">Ancient wisdom.</span>
              <br />
              <span className="text-gradient bg-[length:200%_auto] animate-gradient-shift">Modern problems.</span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in animation-delay-200">
              Transform your struggles into strength with timeless guidance from the Bhagavad Gita.
            </p>

            {/* Benefits list with icons */}
            <ul className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 mb-8 animate-fade-in animation-delay-300">
              {[
                { icon: Zap, text: "Personalized AI guidance" },
                { icon: Star, text: `${stats?.shloks || 700}+ verses of wisdom` },
                { icon: Shield, text: "Modern life applications" },
              ].map((benefit) => (
                <li key={benefit.text} className="flex items-center gap-2 text-sm font-medium group">
                  <div className="p-1 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <benefit.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>

            {/* Stats row - animated counters */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mb-8 animate-fade-in animation-delay-400">
              {[
                { value: stats?.chapters || 18, label: 'Chapters' },
                { value: `${stats?.shloks || 700}+`, label: 'Verses' },
                { value: '10K+', label: 'Seekers' },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-extrabold text-gradient">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</div>
                  {i < 2 && <div className="hidden sm:block" />}
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center lg:justify-start animate-fade-in animation-delay-400">
              <TrustBadges />
            </div>
          </div>

          {/* Right Column - Input Form */}
          <div className="lg:pl-8 animate-fade-in animation-delay-200">
            <div className="relative">
              {/* Multi-layer glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/25 via-amber-500/25 to-orange-500/25 rounded-3xl blur-3xl opacity-60 animate-pulse-slow" />
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-amber-500/10 rounded-3xl blur-xl" />
              
              <div className="relative bg-card/95 backdrop-blur-sm rounded-2xl border-2 border-border/50 p-5 sm:p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-lg shadow-primary/30">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">What's on your mind?</h2>
                    <p className="text-sm text-muted-foreground">
                      Share your struggle and receive guidance
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <Textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder={typewriterPlaceholder || "I'm feeling anxious about..."}
                    className="min-h-[100px] sm:min-h-[140px] text-base resize-none mb-4 bg-background/80 border-2 border-border focus:border-primary transition-all rounded-xl focus:shadow-lg focus:shadow-primary/10"
                  />
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full gap-2 h-14 text-lg font-bold bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 border-0 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
                    disabled={!problem.trim()}
                  >
                    Get Wisdom
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>

                {/* Quick prompts */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Try these:</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => setProblem(prompt)}
                        className="text-xs px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-300 font-medium whitespace-nowrap flex-shrink-0 hover:scale-105"
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
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}