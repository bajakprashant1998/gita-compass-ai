import { Link } from 'react-router-dom';
import { useState, forwardRef } from 'react';
import {
  Heart, Mail, Send, BookOpen, MessageCircle, ArrowRight,
  Compass, Sparkles, Users, Trophy, BookMarked, Flame,
  ExternalLink, MapPin, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const footerLinks = {
  explore: [
    { to: '/chapters', label: 'All 18 Chapters', icon: BookOpen },
    { to: '/problems', label: 'Life Problems', icon: Compass },
    { to: '/chat', label: 'Talk to Krishna', icon: MessageCircle, badge: 'AI' },
    { to: '/mood', label: 'Mood Finder', icon: Sparkles },
    { to: '/reading-plans', label: 'Reading Plans', icon: BookMarked, badge: 'NEW' },
    { to: '/compare', label: 'Compare Verses', icon: Flame },
  ],
  community: [
    { to: '/blog', label: 'Blog & Articles', icon: BookOpen },
    { to: '/study-groups', label: 'Study Groups', icon: Users },
    { to: '/badges', label: 'Achievement Badges', icon: Trophy },
    { to: '/donate', label: 'Support Us', icon: Heart },
    { to: '/contact', label: 'Contact', icon: Mail },
  ],
  account: [
    { to: '/auth', label: 'Sign In / Sign Up' },
    { to: '/dashboard', label: 'My Dashboard' },
    { to: '/dashboard/favorites', label: 'Saved Wisdom' },
    { to: '/install', label: 'Install App' },
  ],
};

const popularChapters = [
  { num: 2, name: 'Sankhya Yoga' },
  { num: 4, name: 'Jnana Karma Sanyasa' },
  { num: 11, name: 'Vishwaroop Darshan' },
  { num: 18, name: 'Moksha Sanyasa' },
];

export const Footer = forwardRef<HTMLElement, object>(function Footer(_props, ref) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Thank you for subscribing! 🙏');
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-border/30 bg-gradient-to-b from-background via-muted/20 to-muted/50">
      {/* Sanskrit Watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        <span className="absolute -right-10 top-8 text-[180px] md:text-[280px] font-serif text-primary/[0.03] leading-none tracking-tighter">
          ॐ
        </span>
        <span className="absolute -left-6 bottom-12 text-[120px] md:text-[200px] font-serif text-primary/[0.03] leading-none">
          गीता
        </span>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Newsletter Banner */}
        <div className="py-10 md:py-14">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Mail className="h-3.5 w-3.5" />
              Daily Wisdom Newsletter
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Receive <span className="text-gradient">timeless wisdom</span> in your inbox
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              One verse, one insight, every morning. Start your day with clarity from the Bhagavad Gita.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 bg-card border-border/50 focus:border-primary/50 text-base"
                required
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="h-12 px-6 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg shadow-primary/20 text-base font-semibold"
              >
                {isSubmitting ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Links Grid */}
        <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 md:gap-8">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 lg:pr-4">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="relative flex h-11 w-11 items-center justify-center">
                <img src="/logo.png" alt="Bhagavad Gita Gyan" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Gita<span className="text-gradient">Gyan</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              AI-powered ancient wisdom for modern life. Find peace, purpose, and answers in the Bhagavad Gita.
            </p>
            {/* Social */}
            <div className="flex items-center gap-2">
              {[
                { icon: Globe, href: 'https://www.bhagavadgitagyan.com', label: 'Website' },
                { icon: Mail, href: 'mailto:info@dibull.com', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 hover:scale-105"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" />
              Explore
            </h4>
            <ul className="space-y-3">
              {footerLinks.explore.map(({ to, label, badge }) => (
                <li key={to}>
                  <Link to={to} className="group flex items-center gap-1.5 text-sm text-foreground/80 hover:text-primary transition-colors">
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    <span>{label}</span>
                    {badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gradient-to-r from-primary to-amber-500 text-white leading-none">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              Community
            </h4>
            <ul className="space-y-3">
              {footerLinks.community.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="group flex items-center gap-1.5 text-sm text-foreground/80 hover:text-primary transition-colors">
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Chapters + Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-primary" />
              Popular
            </h4>
            <ul className="space-y-3 mb-8">
              {popularChapters.map(({ num, name }) => (
                <li key={num}>
                  <Link to={`/chapters/${num}`} className="group flex items-center gap-1.5 text-sm text-foreground/80 hover:text-primary transition-colors">
                    <span className="w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {num}
                    </span>
                    <span className="truncate">{name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Account
            </h4>
            <ul className="space-y-3">
              {footerLinks.account.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="group flex items-center gap-1.5 text-sm text-foreground/80 hover:text-primary transition-colors">
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Stats Strip */}
        <div className="py-8 flex flex-wrap justify-center gap-6 md:gap-10">
          {[
            { value: '18', label: 'Chapters' },
            { value: '700+', label: 'Verses' },
            { value: '9', label: 'Life Problems' },
            { value: '10K+', label: 'Seekers' },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-3">
              {i > 0 && <div className="hidden md:block w-px h-8 bg-border/50 -ml-3 mr-0" />}
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-gradient">{value}</div>
                <div className="text-xs text-muted-foreground tracking-wide">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Bottom Bar */}
        <div className="py-6 pb-24 md:pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bhagavad Gita Gyan. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> by{' '}
              <a href="https://www.dibull.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-0.5">
                dibull <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
