import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  MessageCircle,
  Menu,
  X,
  Home,
  Grid3X3,
  Heart,
  CalendarDays,
  Download,
  Search,
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
  LayoutDashboard,
  Star,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { cn } from '@/lib/utils';
import { getSettingByKey } from '@/lib/adminSettings';
import { supabase } from '@/integrations/supabase/client';

// Lazy load mega menu data — only fetched when user opens mega menu
function useMegaMenuData(enabled: boolean) {
  const [chapters, setChapters] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || fetchedRef.current) return;
    fetchedRef.current = true;

    const headers = {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    };
    const base = import.meta.env.VITE_SUPABASE_URL;

    Promise.all([
      fetch(`${base}/rest/v1/chapters?select=chapter_number,title_english,theme&order=chapter_number&limit=18`, { headers }).then(r => r.json()),
      fetch(`${base}/rest/v1/problems?select=name,slug,icon,color,category&order=display_order`, { headers }).then(r => r.json()),
    ]).then(([chapData, probData]) => {
      if (Array.isArray(chapData)) setChapters(chapData);
      if (Array.isArray(probData)) setProblems(probData);
    }).catch(console.error);
  }, [enabled]);

  return { chapters, problems };
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
    { label: 'What is karma?', icon: Zap, color: 'text-amber-500' },
    { label: 'How to overcome fear', icon: Flame, color: 'text-orange-500' },
    { label: 'Purpose of life', icon: Compass, color: 'text-emerald-500' },
    { label: 'Dealing with anger', icon: TrendingUp, color: 'text-rose-500' },
  ];

  const quickNav = [
    { label: 'Browse Chapters', href: '/chapters', icon: BookOpen },
    { label: 'Life Problems', href: '/problems', icon: Grid3X3 },
    { label: 'Reading Plans', href: '/reading-plans', icon: CalendarDays },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-foreground/60 backdrop-blur-xl" onClick={onClose} />
      <div className="fixed top-0 left-0 right-0 z-[201] flex justify-center pt-[12vh] sm:pt-[16vh]">
        <div className="w-full max-w-2xl mx-4 bg-card border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="h-[2px] bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <Search className="h-5 w-5 text-primary flex-shrink-0" />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search verses, chapters, life problems..."
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/50"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-muted-foreground text-[11px] font-mono border border-border/50">
                ESC
              </kbd>
            </div>
          </form>
          <div className="border-t border-border/20" />
          {!query && (
            <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2.5 px-1 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" /> Ask Krishna
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {quickLinks.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { navigate(`/chat?q=${encodeURIComponent(item.label)}`); onClose(); }}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-sm text-foreground/70 hover:bg-primary/5 hover:text-foreground transition-all duration-150 group"
                    >
                      <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        <item.icon className={cn("h-4 w-4 transition-colors", item.color)} />
                      </div>
                      <span className="font-medium">{item.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2.5 px-1">Quick Navigate</p>
                <div className="flex flex-wrap gap-2">
                  {quickNav.map((item) => (
                    <Link key={item.label} to={item.href} onClick={onClose} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-foreground/60 bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border/20 hover:border-primary/20 transition-all duration-150">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/40 pt-2 border-t border-border/10 px-1">
                <Sparkles className="h-3 w-3 text-primary/40" />
                <span>AI-powered search • Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd> to ask Krishna</span>
              </div>
            </div>
          )}
          {query.trim() && (
            <div className="p-4">
              <button
                onClick={() => { navigate(`/chat?q=${encodeURIComponent(query.trim())}`); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/15 transition-all group"
              >
                <div className="p-2 rounded-lg bg-primary/10"><MessageCircle className="h-4 w-4 text-primary" /></div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-foreground">Ask Krishna: "{query}"</p>
                  <p className="text-[11px] text-muted-foreground">Get wisdom from the Bhagavad Gita</p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// --- Mega Menu Panel ---
function MegaMenuPanel({
  type, chapters, problems, onClose, onMouseEnter,
}: {
  type: 'chapters' | 'problems'; chapters: any[]; problems: any[]; onClose: () => void; onMouseEnter?: () => void;
}) {
  if (type === 'chapters') {
    return (
      <div
        className="fixed top-[68px] left-1/2 -translate-x-1/2 w-[760px] max-w-[92vw] border border-border/40 rounded-2xl shadow-2xl shadow-primary/8 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-[60]"
        style={{ backgroundColor: 'hsl(var(--card) / 0.95)', backdropFilter: 'blur(24px)' }}
        onMouseLeave={onClose} onMouseEnter={onMouseEnter}
      >
        <div className="h-[2px] bg-gradient-to-r from-primary via-amber-500 to-orange-400" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground/80 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10"><BookOpen className="h-4 w-4 text-primary" /></div>
              18 Chapters of the Bhagavad Gita
            </h3>
            <Link to="/chapters" onClick={onClose} className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {chapters.map((ch) => (
              <Link key={ch.chapter_number} to={`/chapters/${ch.chapter_number}`} onClick={onClose} className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-all duration-150">
                <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-amber-500/15 flex items-center justify-center text-xs font-bold text-primary group-hover:from-primary/25 group-hover:to-amber-500/25 group-hover:shadow-sm group-hover:scale-105 transition-all">
                  {ch.chapter_number}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground/80 truncate group-hover:text-primary transition-colors">{ch.title_english}</p>
                  <p className="text-[10px] text-muted-foreground/50 truncate">{ch.theme}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed top-[68px] left-1/2 -translate-x-1/2 w-[560px] max-w-[92vw] border border-border/40 rounded-2xl shadow-2xl shadow-primary/8 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-[60]"
      style={{ backgroundColor: 'hsl(var(--card) / 0.95)', backdropFilter: 'blur(24px)' }}
      onMouseLeave={onClose} onMouseEnter={onMouseEnter}
    >
      <div className="h-[2px] bg-gradient-to-r from-primary via-amber-500 to-orange-400" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10"><Grid3X3 className="h-4 w-4 text-primary" /></div>
            Life Problems & Solutions
          </h3>
          <Link to="/problems" onClick={onClose} className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-1 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          {problems.map((p: any) => (
            <Link key={p.slug} to={`/problems/${p.slug}`} onClick={onClose} className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-all duration-150">
              <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                {p.icon === 'Brain' ? '🧠' : p.icon === 'Shield' ? '🛡️' : p.icon === 'HelpCircle' ? '❓' : p.icon === 'Crown' ? '👑' : p.icon === 'Heart' ? '❤️' : p.icon === 'User' ? '👤' : p.icon === 'Flame' ? '🔥' : p.icon === 'GitBranch' ? '🌿' : p.icon === 'Wallet' ? '💰' : '📌'}
              </span>
              <span className="text-sm font-medium text-foreground/75 group-hover:text-primary transition-colors">{p.name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border/20 flex items-center gap-2">
          <Link to="/mood" onClick={onClose} className="flex-1 flex items-center gap-2.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2.5 rounded-xl hover:bg-primary/5 group">
            <div className="p-1.5 rounded-lg bg-primary/10"><Heart className="h-3.5 w-3.5 text-primary" /></div>
            Not sure? Try the Mood Finder
            <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-0.5 transition-transform" />
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
    { title: '🔥 3-day streak!', desc: 'Keep reading to grow your streak', time: '2h ago', unread: true },
    { title: '📖 New verse published', desc: 'Chapter 4, Verse 18 is now live', time: '5h ago', unread: true },
    { title: '🏆 Badge earned!', desc: 'You earned "Curious Seeker"', time: '1d ago', unread: false },
  ];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className={cn("relative p-2.5 rounded-xl transition-all duration-200 group", open ? "bg-primary/10" : "hover:bg-muted")} aria-label="Notifications">
        <Bell className="h-[18px] w-[18px] text-muted-foreground/60 group-hover:text-foreground transition-colors" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-[340px] border border-border/40 rounded-2xl shadow-2xl shadow-primary/8 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-[60]" style={{ backgroundColor: 'hsl(var(--card) / 0.95)', backdropFilter: 'blur(24px)' }}>
          <div className="h-[2px] bg-gradient-to-r from-primary via-amber-500 to-orange-400" />
          <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground/80 flex items-center gap-2"><Bell className="h-4 w-4 text-primary" />Notifications</h4>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">3 new</span>
          </div>
          <div className="divide-y divide-border/10 max-h-[300px] overflow-y-auto">
            {notifications.map((n, i) => (
              <div key={i} className={cn("px-4 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer relative", n.unread && "bg-primary/[0.02]")}>
                {n.unread && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
                <p className="text-sm font-semibold text-foreground/80">{n.title}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{n.desc}</p>
                <p className="text-[10px] text-muted-foreground/40 mt-1.5 flex items-center gap-1"><Clock className="h-3 w-3" />{n.time}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border/20 bg-muted/20">
            <Link to="/dashboard" onClick={() => setOpen(false)} className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5 justify-center py-1 rounded-lg hover:bg-primary/5 transition-all">
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

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', desc: 'Your reading hub' },
    { icon: Bookmark, label: 'Saved Verses', href: '/dashboard', desc: 'Bookmarks & collections' },
    { icon: Award, label: 'My Badges', href: '/badges', desc: 'Achievements earned' },
    { icon: TrendingUp, label: 'My Progress', href: '/dashboard', desc: 'Stats & streaks' },
    { icon: Settings, label: 'Preferences', href: '/dashboard', desc: 'Theme & notifications' },
  ];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className={cn("flex items-center gap-2 px-1.5 py-1 rounded-xl transition-all duration-200", open ? "bg-primary/10 ring-2 ring-primary/20" : "hover:bg-muted")}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/20 ring-2 ring-background">{initials}</div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 border border-border/40 rounded-2xl shadow-2xl shadow-primary/8 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-[60]" style={{ backgroundColor: 'hsl(var(--card) / 0.95)', backdropFilter: 'blur(24px)' }}>
          <div className="h-[2px] bg-gradient-to-r from-primary via-amber-500 to-orange-400" />
          <div className="px-4 py-4 border-b border-border/20 bg-gradient-to-br from-primary/[0.03] to-amber-500/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-primary/20 ring-2 ring-background">{initials}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" />Spiritual seeker</p>
              </div>
            </div>
          </div>
          <div className="py-1.5">
            {menuItems.map((item) => (
              <Link key={item.label} to={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/75 hover:text-primary hover:bg-primary/5 transition-all group">
                <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors"><item.icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{item.label}</span>
                  <p className="text-[10px] text-muted-foreground/50">{item.desc}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-primary/40 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
          <div className="border-t border-border/20 py-1.5">
            <button onClick={() => { setOpen(false); onSignOut(); }} className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-destructive hover:bg-destructive/5 transition-colors group">
              <div className="p-1.5 rounded-lg bg-destructive/5 group-hover:bg-destructive/10 transition-colors"><LogOut className="h-4 w-4" /></div>
              <span className="font-medium">Sign Out</span>
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
  
  // Only fetch mega menu data when user actually hovers
  const [megaMenuRequested, setMegaMenuRequested] = useState(false);
  const { chapters, problems } = useMegaMenuData(megaMenuRequested);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleMegaEnter = (type: 'chapters' | 'problems') => {
    clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuRequested(true); // trigger lazy fetch
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
    { name: 'Mood Finder', href: '/mood', icon: Heart, desc: 'Find verses by mood' },
    { name: 'Badges', href: '/badges', icon: Award, desc: 'Your achievements' },
    { name: 'Compare Verses', href: '/compare', icon: Compass, desc: 'Side-by-side view' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-background/50 backdrop-blur-sm"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[68px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" aria-label="Bhagavad Gita Gyan Home">
              <div className="relative">
                <img src="/logo.png" alt="Bhagavad Gita Gyan" className="h-10 w-10 rounded-xl shadow-md" width="40" height="40" loading="eager" />
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-amber-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-foreground leading-tight">
                  Bhagavad Gita <span className="text-primary">Gyan</span>
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Ancient Wisdom • Modern Life</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                if (item.mega) {
                  return (
                    <div
                      key={item.name}
                      onMouseEnter={() => handleMegaEnter(item.mega!)}
                      onMouseLeave={handleMegaLeave}
                    >
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 group",
                          active ? "text-primary bg-primary/8" : "text-foreground/65 hover:text-foreground hover:bg-muted/80"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                        <ChevronDown className={cn("h-3 w-3 text-muted-foreground/40 transition-transform duration-200", megaMenu === item.mega && "rotate-180")} />
                      </Link>
                    </div>
                  );
                }
                if (item.highlight) {
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-amber-500 text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      active ? "text-primary bg-primary/8" : "text-foreground/65 hover:text-foreground hover:bg-muted/80"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl hover:bg-muted transition-colors group"
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px] text-muted-foreground/60 group-hover:text-foreground transition-colors" />
              </button>

              {/* Notifications - desktop */}
              <div className="hidden lg:block">
                <NotificationDropdown />
              </div>

              {/* Install button */}
              {isInstallable && !isInstalled && (
                <button
                  onClick={promptInstall}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-foreground/65 hover:text-foreground hover:bg-muted/80 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden xl:inline">Install</span>
                </button>
              )}

              {/* Auth */}
              {!loading && (
                user ? (
                  <UserAvatarMenu user={user} onSignOut={signOut} />
                ) : (
                  <Link to="/auth">
                    <Button size="sm" variant="outline" className="h-9 px-4 rounded-xl text-sm font-medium border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all">
                      Sign In
                    </Button>
                  </Link>
                )
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-muted transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu */}
        {megaMenu && (
          <MegaMenuPanel
            type={megaMenu}
            chapters={chapters}
            problems={problems}
            onClose={() => setMegaMenu(null)}
            onMouseEnter={() => clearTimeout(megaMenuTimeoutRef.current)}
          />
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-card border-l border-border/50 shadow-2xl lg:hidden overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="h-[2px] bg-gradient-to-r from-primary via-amber-500 to-orange-500" />

            {/* User section */}
            <div className="p-5 border-b border-border/20 bg-gradient-to-br from-primary/[0.03] to-amber-500/[0.02]">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary/20">
                    {(user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> Spiritual seeker
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-white font-bold text-sm shadow-lg shadow-primary/20"
                >
                  Sign In / Create Account
                </Link>
              )}
            </div>

            {/* Primary nav */}
            <nav className="p-3">
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider px-3 mb-2">Navigate</p>
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm font-medium transition-all",
                      active ? "text-primary bg-primary/8" : "text-foreground/70 hover:text-foreground hover:bg-muted/50",
                      item.highlight && !active && "text-primary font-bold"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg transition-colors", active ? "bg-primary/15" : "bg-muted")}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    {item.name}
                    {item.highlight && (
                      <span className="ml-auto text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">AI</span>
                    )}
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                  </Link>
                );
              })}
            </nav>

            {/* Secondary nav */}
            <div className="p-3 pt-0">
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider px-3 mb-2">Explore More</p>
              {mobileSecondary.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <div className="p-2 rounded-lg bg-muted"><item.icon className="h-4 w-4" /></div>
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-[10px] text-muted-foreground/50">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Install & donate */}
            <div className="p-3 border-t border-border/20 space-y-2">
              {isInstallable && !isInstalled && (
                <button
                  onClick={() => { promptInstall(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted/50 transition-all"
                >
                  <div className="p-2 rounded-lg bg-primary/10"><Download className="h-4 w-4 text-primary" /></div>
                  Install App
                </button>
              )}
              {showDonate && (
                <Link
                  to="/donate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-500/5 transition-all"
                >
                  <div className="p-2 rounded-lg bg-amber-500/10">🙏</div>
                  Support This Project
                </Link>
              )}
            </div>

            {/* Sign out */}
            {user && (
              <div className="p-3 border-t border-border/20">
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-all"
                >
                  <div className="p-2 rounded-lg bg-destructive/5"><LogOut className="h-4 w-4" /></div>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Search overlay */}
      {searchOpen && <HeaderSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
