import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  MessageCircle,
  User,
  Menu,
  X,
  Home,
  Grid3X3,
  Heart,
  CalendarDays,
  Download,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Award,
  Bookmark,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Compass,
  Clock,
  Flame,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { cn } from '@/lib/utils';
import { getSettingByKey } from '@/lib/adminSettings';
import { supabase } from '@/integrations/supabase/client';

// --- Mega Menu Data Hook ---
function useMegaMenuData() {
  const [chapters, setChapters] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (loaded) return;
    const [chapRes, probRes] = await Promise.all([
      supabase.from('chapters').select('chapter_number, title_english, theme').order('chapter_number').limit(18),
      supabase.from('problems').select('name, slug, icon, color, category').order('display_order'),
    ]);
    if (chapRes.data) setChapters(chapRes.data);
    if (probRes.data) setProblems(probRes.data);
    setLoaded(true);
  }, [loaded]);

  return { chapters, problems, load };
}

// --- Enhanced Search Command ---
function HeaderSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/chat?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const quickLinks = [
    { label: 'What is karma?', icon: Zap },
    { label: 'How to overcome fear', icon: Flame },
    { label: 'Purpose of life', icon: Compass },
    { label: 'Dealing with anger', icon: TrendingUp },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-foreground/50 backdrop-blur-md" onClick={onClose} />
      <div className="fixed top-0 left-0 right-0 z-[201] flex justify-center pt-[18vh]">
        <div className="w-full max-w-2xl mx-4 bg-card border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30">
              <Search className="h-5 w-5 text-primary flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search verses, chapters, life problems..."
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/50"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-mono border border-border/50">
                ESC
              </kbd>
            </div>
          </form>

          {/* Quick suggestions */}
          {!query && (
            <div className="p-4">
              <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
                Popular Searches
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {quickLinks.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(`/chat?q=${encodeURIComponent(item.label)}`);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm text-foreground/70 hover:bg-primary/5 hover:text-primary transition-all duration-150 group"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50 mt-4 pt-3 border-t border-border/20">
                <Sparkles className="h-3 w-3" />
                <span>AI-powered search • Press Enter to ask Krishna</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// --- Enhanced Mega Menu Panel ---
function MegaMenuPanel({
  type,
  chapters,
  problems,
  onClose,
}: {
  type: 'chapters' | 'problems';
  chapters: any[];
  problems: any[];
  onClose: () => void;
}) {
  if (type === 'chapters') {
    return (
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] max-w-[92vw] bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl shadow-primary/8 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-[60]"
        onMouseLeave={onClose}
      >
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-400" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground/80 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              18 Chapters of the Bhagavad Gita
            </h3>
            <Link
              to="/chapters"
              onClick={onClose}
              className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-all"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {chapters.map((ch) => (
              <Link
                key={ch.chapter_number}
                to={`/chapters/${ch.chapter_number}`}
                onClick={onClose}
                className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-all duration-150"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-amber-500/15 flex items-center justify-center text-xs font-bold text-primary group-hover:from-primary/25 group-hover:to-amber-500/25 group-hover:shadow-sm transition-all">
                  {ch.chapter_number}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground/80 truncate group-hover:text-primary transition-colors">
                    {ch.title_english}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 truncate">{ch.theme}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Problems mega menu
  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] max-w-[92vw] bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl shadow-primary/8 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-[60]"
      onMouseLeave={onClose}
    >
      <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-400" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Grid3X3 className="h-4 w-4 text-primary" />
            </div>
            Life Problems
          </h3>
          <Link
            to="/problems"
            onClick={onClose}
            className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-all"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {problems.map((p: any) => (
            <Link
              key={p.slug}
              to={`/problems/${p.slug}`}
              onClick={onClose}
              className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-all duration-150"
            >
              <span className="text-lg flex-shrink-0">
                {p.icon === 'Brain' ? '🧠' : p.icon === 'Shield' ? '🛡️' : p.icon === 'HelpCircle' ? '❓' : p.icon === 'Crown' ? '👑' : p.icon === 'Heart' ? '❤️' : p.icon === 'User' ? '👤' : p.icon === 'Flame' ? '🔥' : p.icon === 'GitBranch' ? '🌿' : p.icon === 'Wallet' ? '💰' : '📌'}
              </span>
              <span className="text-sm font-medium text-foreground/75 group-hover:text-primary transition-colors">
                {p.name}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border/20">
          <Link
            to="/mood"
            onClick={onClose}
            className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-primary/5"
          >
            <Heart className="h-3.5 w-3.5" />
            Not sure? Try the Mood Finder
            <ArrowRight className="h-3 w-3 ml-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Notification Dropdown ---
function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = [
    { title: '🔥 3-day streak!', desc: 'Keep reading to grow your streak', time: '2h ago' },
    { title: '📖 New verse published', desc: 'Chapter 4, Verse 18 is now live', time: '5h ago' },
    { title: '🏆 Badge earned!', desc: 'You earned "Curious Seeker"', time: '1d ago' },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative p-2 rounded-xl transition-all duration-200 group",
          open ? "bg-primary/10" : "hover:bg-muted"
        )}
      >
        <Bell className="h-[18px] w-[18px] text-muted-foreground/60 group-hover:text-foreground transition-colors" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border/40 rounded-2xl shadow-2xl shadow-primary/8 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-[60]">
          <div className="h-0.5 bg-gradient-to-r from-primary via-amber-500 to-orange-400" />
          <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground/80">Notifications</h4>
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">3 new</span>
          </div>
          <div className="divide-y divide-border/10">
            {notifications.map((n, i) => (
              <div key={i} className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="text-sm font-medium text-foreground/80">{n.title}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{n.desc}</p>
                <p className="text-[10px] text-muted-foreground/40 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {n.time}
                </p>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-border/20">
            <Link to="/dashboard" onClick={() => setOpen(false)} className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 justify-center">
              View all in Dashboard <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// --- User Avatar Menu ---
function UserAvatarMenu({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (user.email || 'U').charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200",
          open ? "bg-primary/10" : "hover:bg-muted"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/20 ring-2 ring-background">
          {initials}
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-60 bg-card border border-border/40 rounded-2xl shadow-2xl shadow-primary/8 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-[60]">
          <div className="h-0.5 bg-gradient-to-r from-primary via-amber-500 to-orange-400" />
          <div className="px-4 py-3 border-b border-border/20">
            <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
            <p className="text-[11px] text-muted-foreground">Spiritual seeker ✨</p>
          </div>
          <div className="py-1.5">
            {[
              { icon: User, label: 'Dashboard', href: '/dashboard' },
              { icon: Bookmark, label: 'Saved Verses', href: '/dashboard' },
              { icon: Award, label: 'My Badges', href: '/badges' },
              { icon: TrendingUp, label: 'My Progress', href: '/dashboard' },
              { icon: Settings, label: 'Preferences', href: '/dashboard' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/75 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground/30" />
              </Link>
            ))}
          </div>
          <div className="border-t border-border/20 py-1.5">
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              className="flex items-center gap-2.5 px-4 py-2.5 w-full text-sm text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================= MAIN HEADER =========================
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDonate, setShowDonate] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<'chapters' | 'problems' | null>(null);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { user, loading, signOut } = useAuth();
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const location = useLocation();
  const { chapters, problems, load: loadMegaData } = useMegaMenuData();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    getSettingByKey('show_donate_button')
      .then(value => setShowDonate(value !== 'false'))
      .catch(() => setShowDonate(true));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenu(null);
  }, [location.pathname]);

  const handleMegaEnter = (type: 'chapters' | 'problems') => {
    clearTimeout(megaMenuTimeoutRef.current);
    loadMegaData();
    setMegaMenu(type);
  };

  const handleMegaLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => setMegaMenu(null), 200);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Chapters', href: '/chapters', icon: BookOpen, mega: 'chapters' as const },
    { name: 'Life Problems', href: '/problems', icon: Grid3X3, mega: 'problems' as const },
    { name: 'Reading Plans', href: '/reading-plans', icon: CalendarDays },
    { name: 'Talk to Krishna', href: '/chat', icon: MessageCircle, highlight: true },
    { name: 'Blog', href: '/blog', icon: FileText },
  ];

  const mobileSecondary = [
    { name: 'Mood Finder', href: '/mood', icon: Heart },
    { name: 'Badges', href: '/badges', icon: Award },
    { name: 'Compare Verses', href: '/compare', icon: Compass },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-500",
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-border/40 shadow-lg shadow-primary/[0.03]"
            : "bg-background/70 backdrop-blur-md border-transparent"
        )}
      >
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-primary via-amber-500 to-orange-500" />

        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative flex h-10 w-10 items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img src="/logo.png" alt="Bhagavad Gita Gyan" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight hidden sm:inline">
                Bhagavad <span className="text-gradient">GitaGyan</span>
              </span>
              <span className="text-xl font-bold tracking-tight sm:hidden">
                <span className="text-gradient">GitaGyan</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:gap-0.5">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.mega ? handleMegaEnter(item.mega) : setMegaMenu(null)}
                  onMouseLeave={item.mega ? handleMegaLeave : undefined}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 group",
                      item.highlight && !isActive(item.href)
                        ? "text-primary hover:text-primary"
                        : isActive(item.href)
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 transition-colors",
                      item.highlight
                        ? "text-primary"
                        : isActive(item.href) ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"
                    )} />
                    {item.name}
                    {item.mega && (
                      <ChevronDown className={cn(
                        "h-3 w-3 text-muted-foreground/50 transition-transform duration-200",
                        megaMenu === item.mega && "rotate-180 text-primary"
                      )} />
                    )}

                    {/* Animated underline */}
                    <span className={cn(
                      "absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-300",
                      isActive(item.href) ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-100"
                    )} />

                    {item.highlight && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                    )}
                  </Link>

                  {/* Mega Menu */}
                  {item.mega && megaMenu === item.mega && (
                    <MegaMenuPanel
                      type={item.mega}
                      chapters={chapters}
                      problems={problems}
                      onClose={() => setMegaMenu(null)}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex lg:items-center lg:gap-1.5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/20 hover:border-border/50 transition-all duration-200 group"
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground/40">Search...</span>
                <kbd className="hidden xl:inline-flex ml-2 items-center gap-0.5 px-1.5 py-0.5 rounded bg-background text-muted-foreground/40 text-[10px] font-mono border border-border/30">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Bell */}
              {user && <NotificationDropdown />}

              {/* Donate */}
              {showDonate && (
                <Link to="/donate">
                  <Button
                    size="sm"
                    className="gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-md shadow-rose-500/15 hover:shadow-lg hover:shadow-rose-500/25 transition-all text-xs font-semibold h-9"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    Donate
                  </Button>
                </Link>
              )}

              {/* Auth */}
              {loading ? (
                <div className="h-8 w-8 rounded-full animate-pulse bg-muted" />
              ) : user ? (
                <UserAvatarMenu user={user} onSignOut={() => signOut()} />
              ) : (
                <Link to="/auth">
                  <Button
                    size="sm"
                    className="gap-1.5 rounded-xl bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25 transition-all text-xs font-semibold h-9"
                  >
                    <User className="h-3.5 w-3.5" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile: Search + Menu */}
            <div className="flex lg:hidden items-center gap-1.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl hover:bg-muted transition-all"
              >
                <Search className="h-[18px] w-[18px] text-muted-foreground" />
              </button>
              {user && (
                <button className="relative p-2.5 rounded-xl hover:bg-muted transition-all">
                  <Bell className="h-[18px] w-[18px] text-muted-foreground" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
                </button>
              )}
              <button
                type="button"
                className="p-2.5 rounded-xl hover:bg-muted transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation - Full-screen Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-[100] bg-foreground/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            <div className="fixed top-0 right-0 z-[101] lg:hidden h-[100dvh] w-[88%] max-w-sm bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                  <span className="text-base font-bold tracking-tight">
                    <span className="text-gradient">GitaGyan</span>
                  </span>
                </Link>
                <button
                  type="button"
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Info (mobile) */}
              {user && (
                <div className="px-4 py-3 border-b border-border/30 bg-primary/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-background">
                      {(user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{user.email}</p>
                      <p className="text-[11px] text-muted-foreground">Spiritual seeker ✨</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-3 pb-6">
                {/* Main Nav */}
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-3 mb-2">
                  Navigate
                </p>
                <div className="flex flex-col gap-0.5 mb-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all",
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        isActive(item.href) ? "bg-primary/15" : "bg-muted"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1">{item.name}</span>
                      {item.highlight && (
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                    </Link>
                  ))}
                </div>

                {/* Explore More */}
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-3 mb-2">
                  Explore More
                </p>
                <div className="flex flex-col gap-0.5">
                  {mobileSecondary.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all",
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        isActive(item.href) ? "bg-primary/15" : "bg-muted"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span>{item.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 ml-auto" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-auto p-4 space-y-2 border-t border-border/50 pb-safe">
                {isInstallable && !isInstalled && (
                  <Button
                    onClick={() => { promptInstall(); setMobileMenuOpen(false); }}
                    className="w-full h-11 gap-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
                  >
                    <Download className="h-4 w-4" />
                    Install App
                  </Button>
                )}
                {!isInstallable && !isInstalled && (
                  <Link to="/install" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button variant="outline" className="w-full h-11 gap-2 text-sm font-semibold rounded-xl border-primary/30 text-primary">
                      <Download className="h-4 w-4" />
                      Install App
                    </Button>
                  </Link>
                )}
                {showDonate && (
                  <Link to="/donate" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button className="w-full h-11 gap-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600">
                      <Heart className="h-4 w-4" />
                      Donate
                    </Button>
                  </Link>
                )}
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block">
                      <Button variant="outline" className="w-full h-11 gap-2 text-sm font-semibold rounded-xl">
                        <User className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="w-full h-11 gap-2 text-sm font-semibold rounded-xl text-destructive hover:bg-destructive/5"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button className="w-full h-11 gap-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-amber-500">
                      <User className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Search Overlay */}
      {searchOpen && <HeaderSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
