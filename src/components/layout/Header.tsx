import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  Moon,
  Sun,
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
  Users,
  Palette,
  ExternalLink,
  Quote,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { cn } from '@/lib/utils';
import { getSettingByKey } from '@/lib/adminSettings';
import { supabase } from '@/integrations/supabase/client';

// ========================= LAZY MEGA MENU DATA =========================
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

// ========================= SEARCH COMMAND =========================
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

// ========================= ANIMATED MEGA MENU =========================
function ChaptersMegaMenu({ chapters, onClose, onMouseEnter }: { chapters: any[]; onClose: () => void; onMouseEnter?: () => void }) {
  // Featured chapters
  const featured = chapters.filter(c => [1, 2, 11, 18].includes(c.chapter_number));

  return (
    <div
      className="fixed top-[72px] left-1/2 -translate-x-1/2 w-[880px] max-w-[94vw] border border-border/30 rounded-2xl overflow-hidden z-[60] mega-menu-enter"
      style={{ backgroundColor: 'hsl(var(--card) / 0.97)', backdropFilter: 'blur(32px)', boxShadow: '0 25px 60px -12px hsl(var(--primary) / 0.12), 0 0 0 1px hsl(var(--border) / 0.1)' }}
      onMouseLeave={onClose}
      onMouseEnter={onMouseEnter}
    >
      <div className="h-[2px] bg-gradient-to-r from-primary via-amber-500 to-orange-400" />
      <div className="grid grid-cols-[1fr_260px] divide-x divide-border/15">
        {/* Left: All chapters grid */}
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
          <div className="grid grid-cols-3 gap-0.5">
            {chapters.map((ch, i) => (
              <Link
                key={ch.chapter_number}
                to={`/chapters/${ch.chapter_number}`}
                onClick={onClose}
                className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-all duration-200"
                style={{ animationDelay: `${i * 15}ms` }}
              >
                <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary/12 to-amber-500/12 flex items-center justify-center text-xs font-bold text-primary group-hover:from-primary/25 group-hover:to-amber-500/25 group-hover:shadow-sm group-hover:scale-110 transition-all duration-200">
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

        {/* Right: Featured sidebar */}
        <div className="p-5 bg-gradient-to-b from-primary/[0.02] to-amber-500/[0.02]">
          <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> Must Read
          </p>
          <div className="space-y-1.5">
            {featured.map((ch) => (
              <Link
                key={ch.chapter_number}
                to={`/chapters/${ch.chapter_number}`}
                onClick={onClose}
                className="group block px-3 py-3 rounded-xl hover:bg-primary/8 border border-transparent hover:border-primary/10 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">{ch.chapter_number}</span>
                  <p className="text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors">{ch.title_english}</p>
                </div>
                <p className="text-[10px] text-muted-foreground/60 line-clamp-2 pl-8">{ch.theme}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border/15">
            <Link
              to="/chat"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary/8 to-amber-500/8 hover:from-primary/15 hover:to-amber-500/15 border border-primary/10 transition-all group"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-[11px] font-bold text-foreground/80">Ask Krishna AI</p>
                <p className="text-[10px] text-muted-foreground/50">Which chapter to start?</p>
              </div>
              <ArrowRight className="h-3 w-3 text-primary/50 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemsMegaMenu({ problems, onClose, onMouseEnter }: { problems: any[]; onClose: () => void; onMouseEnter?: () => void }) {
  const iconMap: Record<string, string> = {
    'Brain': '🧠', 'Shield': '🛡️', 'HelpCircle': '❓', 'Crown': '👑',
    'Heart': '❤️', 'User': '👤', 'Flame': '🔥', 'GitBranch': '🌿', 'Wallet': '💰',
  };

  // Group by category
  const categories = problems.reduce((acc: Record<string, any[]>, p: any) => {
    const cat = p.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div
      className="fixed top-[72px] left-1/2 -translate-x-1/2 w-[680px] max-w-[94vw] border border-border/30 rounded-2xl overflow-hidden z-[60] mega-menu-enter"
      style={{ backgroundColor: 'hsl(var(--card) / 0.97)', backdropFilter: 'blur(32px)', boxShadow: '0 25px 60px -12px hsl(var(--primary) / 0.12), 0 0 0 1px hsl(var(--border) / 0.1)' }}
      onMouseLeave={onClose}
      onMouseEnter={onMouseEnter}
    >
      <div className="h-[2px] bg-gradient-to-r from-primary via-amber-500 to-orange-400" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10"><Grid3X3 className="h-4 w-4 text-primary" /></div>
            Life Problems & Gita Solutions
          </h3>
          <Link to="/problems" onClick={onClose} className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="max-h-[360px] overflow-y-auto pr-1 custom-scrollbar space-y-4">
          {Object.entries(categories).map(([cat, items]: [string, any[]]) => (
            <div key={cat}>
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 px-1">{cat}</p>
              <div className="grid grid-cols-2 gap-0.5">
                {items.map((p: any, i: number) => (
                  <Link
                    key={p.slug}
                    to={`/problems/${p.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-all duration-200"
                  >
                    <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      {iconMap[p.icon] || '📌'}
                    </span>
                    <span className="text-sm font-medium text-foreground/75 group-hover:text-primary transition-colors">{p.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-border/15 grid grid-cols-2 gap-2">
          <Link to="/mood" onClick={onClose} className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2.5 rounded-xl hover:bg-primary/5 group border border-border/20 hover:border-primary/15">
            <div className="p-1.5 rounded-lg bg-primary/10"><Heart className="h-3.5 w-3.5 text-primary" /></div>
            <div>
              <span className="font-semibold">Mood Finder</span>
              <p className="text-[10px] text-muted-foreground/50">Not sure? Let us help</p>
            </div>
          </Link>
          <Link to="/chat" onClick={onClose} className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2.5 rounded-xl hover:bg-primary/5 group border border-border/20 hover:border-primary/15">
            <div className="p-1.5 rounded-lg bg-primary/10"><MessageCircle className="h-3.5 w-3.5 text-primary" /></div>
            <div>
              <span className="font-semibold">Talk to Krishna</span>
              <p className="text-[10px] text-muted-foreground/50">AI guidance for your issue</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ========================= NOTIFICATION DROPDOWN =========================
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
        <div className="absolute top-full right-0 mt-2 w-[340px] border border-border/30 rounded-2xl overflow-hidden z-[60] mega-menu-enter" style={{ backgroundColor: 'hsl(var(--card) / 0.97)', backdropFilter: 'blur(32px)', boxShadow: '0 25px 60px -12px hsl(var(--primary) / 0.12)' }}>
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

// ========================= USER AVATAR MENU =========================
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
        <div className="absolute top-full right-0 mt-2 w-72 border border-border/30 rounded-2xl overflow-hidden z-[60] mega-menu-enter" style={{ backgroundColor: 'hsl(var(--card) / 0.97)', backdropFilter: 'blur(32px)', boxShadow: '0 25px 60px -12px hsl(var(--primary) / 0.12)' }}>
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

// ========================= SUB-NAVIGATION BAR =========================
function SubNavigation({ scrolled }: { scrolled: boolean }) {
  const location = useLocation();

  const subNavItems = [
    { name: 'Chapters', href: '/chapters', icon: BookOpen },
    { name: 'Problems', href: '/problems', icon: Grid3X3 },
    { name: 'Krishna AI', href: '/chat', icon: MessageCircle },
    { name: 'Plans', href: '/reading-plans', icon: CalendarDays },
    { name: 'Blog', href: '/blog', icon: FileText },
    { name: 'Mood', href: '/mood', icon: Heart },
    { name: 'Quotes', href: '/krishna-quotes', icon: Quote },
  ];

  const isActive = (href: string) => location.pathname.startsWith(href);

  if (!scrolled) return null;

  return (
    <div className="hidden lg:block border-t border-border/30 bg-background/60 backdrop-blur-lg sub-nav-enter">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-0.5 h-10 overflow-x-auto no-scrollbar">
          {subNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200",
                  active
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/60"
                )}
              >
                <item.icon className="h-3 w-3" />
                {item.name}
              </Link>
            );
          })}
          <div className="ml-auto flex items-center gap-2 pl-4">
            <Link
              to="/donate"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-amber-600 hover:bg-amber-500/5 transition-all"
            >
              🙏 Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================= MOBILE BOTTOM SHEET MENU =========================
function MobileMenu({
  open,
  onClose,
  user,
  isInstallable,
  isInstalled,
  promptInstall,
  showDonate,
  signOut,
}: {
  open: boolean;
  onClose: () => void;
  user: any;
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => void;
  showDonate: boolean;
  signOut: () => void;
}) {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  if (!open) return null;

  const primaryNav = [
    { name: 'Home', href: '/', icon: Home, desc: 'Back to homepage' },
    { name: 'Chapters', href: '/chapters', icon: BookOpen, desc: '18 chapters of wisdom' },
    { name: 'Life Problems', href: '/problems', icon: Grid3X3, desc: 'Find your solution' },
    { name: 'Talk to Krishna', href: '/chat', icon: MessageCircle, desc: 'AI spiritual guide', highlight: true },
    { name: 'Reading Plans', href: '/reading-plans', icon: CalendarDays, desc: 'Guided study paths' },
    { name: 'Blog', href: '/blog', icon: FileText, desc: 'Articles & insights' },
  ];

  const exploreNav = [
    { name: 'Mood Finder', href: '/mood', icon: Heart, desc: 'Find verses by mood', color: 'text-rose-500' },
    { name: 'Badges', href: '/badges', icon: Award, desc: 'Your achievements', color: 'text-amber-500' },
    { name: 'Compare Verses', href: '/compare', icon: Compass, desc: 'Side-by-side view', color: 'text-blue-500' },
    { name: 'Krishna Quotes', href: '/krishna-quotes', icon: Quote, desc: 'Daily inspiration', color: 'text-emerald-500' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-md lg:hidden"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden mobile-sheet-enter" style={{ maxHeight: '92dvh' }}>
        <div className="bg-card rounded-t-3xl border-t border-x border-border/30 shadow-2xl overflow-hidden" style={{ boxShadow: '0 -25px 60px -12px hsl(var(--foreground) / 0.15)' }}>
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-border/60" />
          </div>

          {/* Gradient accent */}
          <div className="h-[2px] bg-gradient-to-r from-primary via-amber-500 to-orange-500 mx-4 rounded-full" />

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 40px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
            {/* User section */}
            <div className="p-4 pb-3">
              {user ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-primary/[0.04] to-amber-500/[0.03] border border-border/20">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary/20">
                    {(user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> Spiritual seeker
                    </p>
                  </div>
                  <Link to="/dashboard" onClick={onClose} className="p-2.5 rounded-xl bg-muted/80 hover:bg-primary/10 transition-colors">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-amber-500 text-white font-bold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                >
                  Sign In / Create Account
                </Link>
              )}
            </div>

            {/* Primary nav - large touch targets */}
            <nav className="px-4">
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-1 mb-2">Navigate</p>
              <div className="space-y-0.5">
                {primaryNav.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3.5 px-3.5 py-3.5 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]",
                        active
                          ? "text-primary bg-primary/8 border border-primary/10"
                          : "text-foreground/70 hover:bg-muted/60",
                        item.highlight && !active && "text-primary"
                      )}
                    >
                      <div className={cn(
                        "p-2.5 rounded-xl transition-colors",
                        active ? "bg-primary/15" : item.highlight ? "bg-gradient-to-br from-primary/15 to-amber-500/15" : "bg-muted"
                      )}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block">{item.name}</span>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">{item.desc}</p>
                      </div>
                      {item.highlight && (
                        <span className="text-[10px] font-bold bg-gradient-to-r from-primary/10 to-amber-500/10 text-primary px-2.5 py-1 rounded-full border border-primary/10">AI ✨</span>
                      )}
                      {active && <div className="w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/30" />}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Explore section with icons */}
            <div className="px-4 mt-4">
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-1 mb-2">Explore More</p>
              <div className="grid grid-cols-2 gap-2">
                {exploreNav.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-border/20 hover:border-primary/15 hover:bg-primary/[0.03] transition-all active:scale-[0.98]"
                  >
                    <div className={cn("p-2 rounded-lg bg-muted")}>
                      <item.icon className={cn("h-4 w-4", item.color)} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-foreground/80 block">{item.name}</span>
                      <p className="text-[9px] text-muted-foreground/50 truncate">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick actions row */}
            <div className="px-4 mt-4 flex gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={() => {
                  const html = document.documentElement;
                  const isDark = html.classList.contains('dark');
                  html.classList.toggle('dark', !isDark);
                  localStorage.setItem('theme', isDark ? 'light' : 'dark');
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium text-foreground/70 bg-muted/50 border border-border/20 hover:bg-primary/5 transition-all active:scale-[0.98]"
              >
                <Sun className="h-4 w-4 text-primary hidden dark:block" />
                <Moon className="h-4 w-4 text-primary dark:hidden" />
                <span className="dark:hidden">Dark Mode</span>
                <span className="hidden dark:inline">Light Mode</span>
              </button>
              {isInstallable && !isInstalled && (
                <button
                  onClick={() => { promptInstall(); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium text-foreground/70 bg-muted/50 border border-border/20 hover:bg-primary/5 transition-all active:scale-[0.98]"
                >
                  <Download className="h-4 w-4 text-primary" />
                  Install App
                </button>
              )}
              {showDonate && (
                <Link
                  to="/donate"
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium text-amber-600 bg-amber-500/5 border border-amber-500/15 hover:bg-amber-500/10 transition-all active:scale-[0.98]"
                >
                  🙏 Support Us
                </Link>
              )}
            </div>

            {/* Sign out */}
            {user && (
              <div className="px-4 mt-3 mb-2">
                <button
                  onClick={() => { signOut(); onClose(); }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-destructive bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-all active:scale-[0.98]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
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
    setMegaMenuRequested(true);
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
            ? "header-scrolled"
            : "bg-background/50 backdrop-blur-sm"
        )}
      >
        {/* Main nav bar */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo - upgraded */}
            <Link to="/" className="flex items-center gap-3 group" aria-label="Bhagavad Gita Gyan Home">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Bhagavad Gita Gyan"
                  className="h-10 w-10 rounded-xl shadow-md group-hover:shadow-lg group-hover:shadow-primary/15 transition-shadow duration-300"
                  width="40" height="40" loading="eager"
                />
                <div className="absolute -inset-1.5 bg-gradient-to-br from-primary/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-foreground leading-tight tracking-tight">
                  Bhagavad Gita <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">Gyan</span>
                </h1>
                <p className="text-[10px] text-muted-foreground/60 font-medium tracking-[0.15em] uppercase">Ancient Wisdom • Modern Life</p>
              </div>
            </Link>

            {/* Desktop Nav - animated underline style */}
            <nav className="hidden lg:flex items-center gap-0.5">
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
                          "relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 group",
                          active ? "text-primary" : "text-foreground/60 hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                        <ChevronDown className={cn(
                          "h-3 w-3 text-muted-foreground/40 transition-all duration-200",
                          megaMenu === item.mega && "rotate-180 text-primary"
                        )} />
                        {/* Active indicator */}
                        <span className={cn(
                          "absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-300",
                          active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                        )} />
                      </Link>
                    </div>
                  );
                }
                if (item.highlight) {
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="relative flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-amber-500 text-white shadow-md shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <item.icon className="h-4 w-4 relative z-10" />
                      <span className="relative z-10">{item.name}</span>
                      <Sparkles className="h-3 w-3 relative z-10 opacity-60" />
                    </Link>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      active ? "text-primary" : "text-foreground/60 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                    <span className={cn(
                      "absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-300",
                      active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                    )} />
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              {/* Search trigger with kbd hint */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-muted transition-all duration-200 group"
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px] text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/80 text-muted-foreground/40 text-[10px] font-mono border border-border/30">
                  ⌘K
                </kbd>
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={() => {
                  const html = document.documentElement;
                  const isDark = html.classList.contains('dark');
                  html.classList.toggle('dark', !isDark);
                  localStorage.setItem('theme', isDark ? 'light' : 'dark');
                }}
                className="p-2.5 rounded-xl hover:bg-muted transition-all duration-200 group"
                aria-label="Toggle dark mode"
              >
                <Sun className="h-[18px] w-[18px] text-muted-foreground/60 group-hover:text-foreground transition-colors hidden dark:block" />
                <Moon className="h-[18px] w-[18px] text-muted-foreground/60 group-hover:text-foreground transition-colors dark:hidden" />
              </button>

              {/* Notifications - desktop */}
              <div className="hidden lg:block">
                <NotificationDropdown />
              </div>

              {/* Install */}
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
                    <Button size="sm" variant="outline" className="h-9 px-4 rounded-xl text-sm font-medium border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all">
                      Sign In
                    </Button>
                  </Link>
                )
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "lg:hidden p-2.5 rounded-xl transition-all duration-200",
                  mobileMenuOpen ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sub-navigation - visible on scroll */}
        <SubNavigation scrolled={scrolled} />

        {/* Mega Menu */}
        {megaMenu === 'chapters' && (
          <ChaptersMegaMenu
            chapters={chapters}
            onClose={() => setMegaMenu(null)}
            onMouseEnter={() => clearTimeout(megaMenuTimeoutRef.current)}
          />
        )}
        {megaMenu === 'problems' && (
          <ProblemsMegaMenu
            problems={problems}
            onClose={() => setMegaMenu(null)}
            onMouseEnter={() => clearTimeout(megaMenuTimeoutRef.current)}
          />
        )}
      </header>

      {/* Mobile Bottom Sheet Menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        promptInstall={promptInstall}
        showDonate={showDonate}
        signOut={signOut}
      />

      {/* Search overlay */}
      {searchOpen && <HeaderSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
