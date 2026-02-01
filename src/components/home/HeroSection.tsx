import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight } from 'lucide-react';

export function HeroSection() {
  const [problem, setProblem] = useState('');
  const navigate = useNavigate();

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

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            AI-Powered Ancient Wisdom
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Ancient wisdom.{' '}
            <span className="text-gradient">Modern problems.</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Transform your struggles into strength with timeless guidance from the Bhagavad Gita, 
            delivered in a way that makes sense for your life today.
          </p>

          {/* Problem Input */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="What are you struggling with today?"
                className="min-h-[120px] text-lg resize-none pr-32 bg-card border-2 border-border focus:border-primary transition-colors"
              />
              <Button 
                type="submit" 
                size="lg"
                className="absolute bottom-4 right-4 gap-2"
                disabled={!problem.trim()}
              >
                Get Guidance
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Quick prompts */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-sm text-muted-foreground">Try:</span>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setProblem(prompt)}
                className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
