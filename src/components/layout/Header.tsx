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
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-500 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:scale-105">
              <BhagwaFlag className="h-5 w-5 text-white" />
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-amber-500 opacity-0 blur-md transition-opacity group-hover:opacity-50" />
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

            {loading ? (
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
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-96 pb-4" : "max-h-0"
        )}>
          <div className="flex flex-col gap-1 pt-4 border-t border-border/50">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  "animate-fade-in",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-primary/10 to-amber-500/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-primary to-amber-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-border/50 space-y-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {/* Donate Button in Mobile Menu - Conditionally rendered */}
              {showDonate && (
                <Link to="/donate" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gap-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600">
                    <Heart className="h-4 w-4" />
                    Donate
                  </Button>
                </Link>
              )}
              
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2 border-border/50">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gap-2 bg-gradient-to-r from-primary to-amber-500">
                    <User className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
