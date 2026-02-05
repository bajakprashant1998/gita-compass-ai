import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  MessageCircle,
  User,
  Menu,
  X,
  Home,
  Grid3X3,
  Heart
} from 'lucide-react';
import { BhagwaFlag } from '@/components/ui/bhagwa-flag';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { getSettingByKey } from '@/lib/adminSettings';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDonate, setShowDonate] = useState(true);
  const { user, loading } = useAuth();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch donate button visibility setting
  useEffect(() => {
    getSettingByKey('show_donate_button')
      .then(value => {
        setShowDonate(value !== 'false');
      })
      .catch(() => {
        // Default to showing donate button if fetch fails
        setShowDonate(true);
      });
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Chapters', href: '/chapters', icon: BookOpen },
    { name: 'Life Problems', href: '/problems', icon: Grid3X3 },
    { name: 'AI Coach', href: '/chat', icon: MessageCircle, badge: 'NEW' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 border-b transition-all duration-300",
      scrolled
        ? "bg-background/95 backdrop-blur-lg border-border/50 shadow-sm"
        : "bg-background/80 backdrop-blur-md border-transparent"
    )}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
            </div>

            <span className="text-xl font-semibold tracking-tight">
              Bhagavad Gita<span className="text-gradient">Gyan</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}

                {/* Active indicator */}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-primary to-amber-500 rounded-full" />
                )}

                {item.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-primary to-amber-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {/* Donate Button - Conditionally rendered */}
            {showDonate && (
              <Link to="/donate">
                <Button
                  size="sm"
                  className="gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 transition-all"
                >
                  <Heart className="h-4 w-4" />
                  Donate
                </Button>
              </Link>
            )}

            {
              loading ? (
                <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
              ) : user ? (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2 rounded-lg border-border/50 hover:border-primary/50 hover:bg-primary/5">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="gap-2 rounded-lg bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                    <User className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )
            }
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2.5 rounded-xl border border-border/50 hover:bg-muted hover:border-primary/30 transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation - Full screen overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        <div className={cn(
          "fixed top-0 right-0 h-full w-[85%] max-w-sm bg-card border-l border-border/50 shadow-2xl z-50 md:hidden",
          "transform transition-transform duration-300 ease-out",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}>
          {/* Menu Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
              <img src="/logo.png" alt="Logo" className="h-9 w-9 object-contain" />
              <span className="text-lg font-semibold">
                Bhagavad Gita<span className="text-gradient">Gyan</span>
              </span>
            </Link>
            <button
              type="button"
              className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col p-4 space-y-1">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200",
                  "animate-fade-in",
                  isActive(item.href)
                    ? "bg-accent text-primary border-l-4 border-primary shadow-sm"
                    : "text-foreground hover:bg-muted"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  isActive(item.href) ? "bg-primary/10" : "bg-muted"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span>{item.name}</span>
                {item.badge && (
                  <span className="ml-auto px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-primary to-amber-500 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 border-t border-border/50 bg-card animate-fade-in pb-safe" style={{ animationDelay: '200ms' }}>
            {showDonate && (
              <Link to="/donate" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button className="w-full h-12 gap-2 text-base font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-500/20">
                  <Heart className="h-5 w-5" />
                  Donate
                </Button>
              </Link>
            )}
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="outline" className="w-full h-12 gap-2 text-base font-semibold rounded-xl border-2">
                  <User className="h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button className="w-full h-12 gap-2 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg shadow-primary/20">
                  <User className="h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
