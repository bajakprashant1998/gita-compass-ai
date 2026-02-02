import { Link } from 'react-router-dom';
import { useState, forwardRef } from 'react';
import { Heart, Twitter, Github, Mail, Send, BookOpen, MessageCircle, ArrowRight, Phone } from 'lucide-react';
import { BhagwaFlag } from '@/components/ui/bhagwa-flag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const Footer = forwardRef<HTMLElement, object>(function Footer(_props, ref) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate newsletter signup
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Thank you for subscribing! 🙏');
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-border/50 bg-gradient-to-b from-background to-muted/30">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
              </div>

              <span className="text-2xl font-semibold tracking-tight">
                Bhagavad Gita<span className="text-gradient">Gyan</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md mb-8 text-lg leading-relaxed">
              Ancient wisdom for modern problems. A calm mentor that understands
              modern life, powered by timeless wisdom from the Bhagavad Gita.
            </p>

            {/* Newsletter */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Stay Connected
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-card border-border/50 focus:border-primary/50"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-md shadow-primary/20"
                >
                  {isSubmitting ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:info@dibull.com"
                className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Explore
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/chapters" className="group flex items-center text-foreground hover:text-primary transition-colors">
                  <span>All Chapters</span>
                  <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link to="/problems" className="group flex items-center text-foreground hover:text-primary transition-colors">
                  <span>Life Problems</span>
                  <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link to="/chat" className="group flex items-center text-foreground hover:text-primary transition-colors">
                  <span>AI Gita Coach</span>
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-primary to-amber-500 text-white">NEW</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="group flex items-center text-foreground hover:text-primary transition-colors">
                  <span>Contact Us</span>
                  <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Account
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/auth" className="group flex items-center text-foreground hover:text-primary transition-colors">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="group flex items-center text-foreground hover:text-primary transition-colors">
                  <span>Dashboard</span>
                  <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link to="/dashboard/favorites" className="group flex items-center text-foreground hover:text-primary transition-colors">
                  <span>Saved Wisdom</span>
                  <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">18</div>
              <div className="text-sm text-muted-foreground">Chapters</div>
            </div>
            <div className="hidden md:block w-px h-10 bg-border/50" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">700+</div>
              <div className="text-sm text-muted-foreground">Verses</div>
            </div>
            <div className="hidden md:block w-px h-10 bg-border/50" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">10K+</div>
              <div className="text-sm text-muted-foreground">Seekers</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Bhagavad Gita Gyan. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" /> by{' '}
            <a href="https://www.dibull.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              dibull
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
