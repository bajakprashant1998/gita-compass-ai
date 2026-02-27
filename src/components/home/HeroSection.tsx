import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, MessageCircle, Star, Shield, Zap, BookOpen, Play } from 'lucide-react';
import { TrustBadges } from './TrustBadges';
import { getStats } from '@/lib/api';
import { Link } from 'react-router-dom';

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
    { emoji: '😰', text: 'I feel anxious about my future' },
    { emoji: '🤔', text: "I can't make a difficult decision" },
    { emoji: '😤', text: "I'm struggling with anger" },
    { emoji: '😶‍🌫️', text: 'I feel lost and confused' },
  ];

  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-background to-accent/6" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,hsl(var(--accent)/0.10),transparent_50%)]" />
        {/* Animated mesh circles */}
        <div className="absolute top-[10%] left-[15%] w-96 h-96 rounded-full bg-primary/[0.04] blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-500/[0.04] blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Large ॐ watermark */}
      <div className="absolute right-[-5%] top-[5%] text-[22rem] font-bold text-primary/[0.03] select-none pointer-events-none leading-none hidden lg:block" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ॐ</div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 lg:py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column - Content (7 cols) */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-8 animate-fade-in border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              AI-Powered Ancient Wisdom
              <Sparkles className="h-4 w-4" />
            </div>

            {/* Headline - bigger, bolder */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 animate-fade-in animation-delay-100 tracking-tight">
              <span className="text-foreground">Ancient wisdom.</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">Modern problems.</span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in animation-delay-200">
              Transform your struggles into strength with timeless guidance from the Bhagavad Gita.
            </p>

            {/* Benefits pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8 animate-fade-in animation-delay-300">
              {[
                { icon: Zap, text: 'Personalized AI guidance', color: 'bg-primary/10 text-primary border-primary/20' },
                { icon: Star, text: `${stats?.shloks || 700}+ verses`, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
                { icon: Shield, text: 'Modern applications', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
              ].map((b) => (
                <span key={b.text} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border ${b.color}`}>
                  <b.icon className="h-3.5 w-3.5" />
                  {b.text}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-10 mb-8 animate-fade-in animation-delay-400">
              {[
                { value: stats?.chapters || 18, label: 'Chapters', suffix: '' },
                { value: stats?.shloks || 700, label: 'Verses', suffix: '+' },
                { value: '10K', label: 'Seekers', suffix: '+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">{stat.value}{stat.suffix}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA buttons for mobile */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6 lg:hidden animate-fade-in animation-delay-400">
              <Link to="/chat">
                <Button size="lg" className="w-full sm:w-auto gap-2 h-13 text-base font-bold bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 border-0 shadow-lg">
                  <MessageCircle className="h-5 w-5" />
                  Talk to Krishna
                </Button>
              </Link>
              <Link to="/chapters">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 h-13 text-base font-bold border-2">
                  <BookOpen className="h-5 w-5" />
                  Browse Chapters
                </Button>
              </Link>
            </div>

            {/* Trust */}
            <div className="flex justify-center lg:justify-start animate-fade-in animation-delay-400">
              <TrustBadges />
            </div>
          </div>

          {/* Right Column - CTA Card (5 cols) */}
          <div className="lg:col-span-5 animate-fade-in animation-delay-200">
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-amber-500/20 to-orange-500/20 rounded-3xl blur-3xl opacity-60 animate-pulse-slow" />
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/8 to-amber-500/8 rounded-3xl blur-xl" />
              
              <div className="relative bg-card/95 backdrop-blur-sm rounded-2xl border-2 border-border/50 shadow-2xl overflow-hidden">
                {/* Gradient top bar */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
                
                <div className="p-5 sm:p-7">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-lg shadow-primary/25">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">What's troubling you?</h2>
                      <p className="text-sm text-muted-foreground">Share your struggle, receive wisdom</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <Textarea
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder={typewriterPlaceholder || "I'm feeling anxious about..."}
                      className="min-h-[120px] text-base resize-none mb-4 bg-background/80 border-2 border-border focus:border-primary transition-all rounded-xl"
                    />
                    <Button 
                      type="submit" 
                      size="lg"
                      className="w-full gap-2 h-13 text-lg font-bold bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 border-0 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      disabled={!problem.trim()}
                    >
                      Get Wisdom
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </form>

                  {/* Quick prompts as chips */}
                  <div className="mt-5 pt-5 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Try these:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt.text}
                          onClick={() => setProblem(prompt.text)}
                          className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-200 font-medium whitespace-nowrap"
                        >
                          {prompt.emoji} {prompt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
