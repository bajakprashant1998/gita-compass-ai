import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, BookOpen, FileText, MessageCircle, CheckCircle } from 'lucide-react';
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

  const benefits = [
    "Personalized AI guidance",
    "700+ verses of wisdom",
    "Modern life applications",
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background pattern - WebFX inspired */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.15),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--accent)/0.1),transparent_40%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 lg:py-28 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-6 animate-fade-in border border-primary/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              AI-Powered Ancient Wisdom
              <Sparkles className="h-4 w-4" />
            </div>

            {/* Headline - WebFX bold style */}
            <h1 className="headline-bold mb-6 animate-fade-in animation-delay-100">
              <span className="text-foreground">Ancient wisdom.</span>
              <br />
              <span className="text-gradient">Modern problems.</span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in animation-delay-200">
              Transform your struggles into strength with timeless guidance from the Bhagavad Gita.
            </p>

            {/* Benefits list - WebFX style */}
            <ul className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 mb-8 animate-fade-in animation-delay-300">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Stats row - WebFX metric style */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mb-8 animate-fade-in animation-delay-400">
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-extrabold text-gradient">{stats?.chapters || 18}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Chapters</div>
              </div>
              <div className="w-px h-12 bg-border hidden sm:block" />
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-extrabold text-gradient">{stats?.shloks || 700}+</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Verses</div>
              </div>
              <div className="w-px h-12 bg-border hidden sm:block" />
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-extrabold text-gradient">10K+</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Seekers</div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center lg:justify-start animate-fade-in animation-delay-400">
              <TrustBadges />
            </div>
          </div>

          {/* Right Column - Input Form */}
          <div className="lg:pl-8 animate-fade-in animation-delay-200">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl opacity-50" />
              
              <div className="relative bg-card rounded-2xl border-2 border-border/50 p-5 sm:p-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-amber-500 text-white">
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
                    className="min-h-[100px] sm:min-h-[140px] text-base resize-none mb-4 bg-background border-2 border-border focus:border-primary transition-colors rounded-xl"
                  />
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full gap-2 h-14 text-lg font-bold bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 border-0 rounded-xl shadow-lg shadow-primary/20"
                    disabled={!problem.trim()}
                  >
                    Get Wisdom
                    <ArrowRight className="h-5 w-5" />
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
                        className="text-xs px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-300 font-medium whitespace-nowrap flex-shrink-0"
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
    </section>
  );
}
