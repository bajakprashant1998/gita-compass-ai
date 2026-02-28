import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';
import { Layout } from '@/components/layout/Layout';
import { getChapter, getShloksByChapter } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadialGlow } from '@/components/ui/decorative-elements';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  Search,
  Grid3X3,
  List,
  Target,
  Brain,
  Heart,
  Flame,
  Clock,
  ArrowUp,
  MessageCircle,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { VerseCard } from '@/components/chapters/VerseCard';
import { cn } from '@/lib/utils';

// Animated counter hook
function useAnimatedCounter(end: number, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return count;
}

// Key themes for each chapter
const chapterThemes: Record<number, { icon: React.ElementType; label: string; color: string }[]> = {
  1: [
    { icon: Heart, label: 'Compassion', color: 'from-pink-500 to-rose-500' },
    { icon: Brain, label: 'Confusion', color: 'from-purple-500 to-indigo-500' },
  ],
  2: [
    { icon: Brain, label: 'Self-Knowledge', color: 'from-purple-500 to-indigo-500' },
    { icon: Target, label: 'Dharma', color: 'from-blue-500 to-cyan-500' },
    { icon: Flame, label: 'Action', color: 'from-orange-500 to-amber-500' },
  ],
  3: [
    { icon: Flame, label: 'Karma Yoga', color: 'from-orange-500 to-amber-500' },
    { icon: Target, label: 'Duty', color: 'from-blue-500 to-cyan-500' },
  ],
};

export default function ChapterDetailPage() {
  const { chapterNumber } = useParams<{ chapterNumber: string }>();
  const chapterNum = parseInt(chapterNumber || '1');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copied, setCopied] = useState(false);
  const versesRef = useRef<HTMLDivElement>(null);

  const { data: chapter, isLoading: chapterLoading } = useQuery({
    queryKey: ['chapter', chapterNum],
    queryFn: () => getChapter(chapterNum),
    enabled: !!chapterNum,
  });

  const { data: shloks, isLoading: shloksLoading } = useQuery({
    queryKey: ['shloks', chapter?.id],
    queryFn: () => getShloksByChapter(chapter!.id),
    enabled: !!chapter?.id,
  });

  const animatedVerseCount = useAnimatedCounter(shloks?.length || chapter?.verse_count || 0);
  const themes = chapterThemes[chapterNum] || chapterThemes[2];

  // Scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter shloks
  const filteredShloks = useMemo(() => {
    if (!shloks) return [];
    if (!searchQuery) return shloks;
    const query = searchQuery.toLowerCase();
    return shloks.filter(shlok =>
      shlok.sanskrit_text.toLowerCase().includes(query) ||
      shlok.english_meaning.toLowerCase().includes(query) ||
      shlok.verse_number.toString().includes(query)
    );
  }, [shloks, searchQuery]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Check out Chapter ${chapterNum}: ${chapter?.title_english} of the Bhagavad Gita`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + window.location.href)}`, '_blank');
  };

  if (chapterLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="h-96 animate-shimmer rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!chapter) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
          <Link to="/chapters"><Button>Back to Chapters</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={(chapter as any).meta_title || `Chapter ${chapterNum}: ${chapter.title_english} - Bhagavad Gita`}
        description={(chapter as any).meta_description || chapter.description_english || `Explore Chapter ${chapterNum} of the Bhagavad Gita`}
        canonicalUrl={`https://www.bhagavadgitagyan.com/chapters/${chapterNum}`}
        keywords={(chapter as any).meta_keywords || ['Bhagavad Gita', `Chapter ${chapterNum}`, chapter.theme]}
        structuredData={generateBreadcrumbSchema([
          { name: 'Home', url: 'https://www.bhagavadgitagyan.com' },
          { name: 'Chapters', url: 'https://www.bhagavadgitagyan.com/chapters' },
          { name: `Chapter ${chapterNum}`, url: `https://www.bhagavadgitagyan.com/chapters/${chapterNum}` },
        ])}
      />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <RadialGlow position="top-right" color="primary" className="opacity-40 scale-150" />
          <RadialGlow position="bottom-left" color="amber" className="opacity-25 scale-125" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black text-primary/[0.03] select-none sanskrit leading-none">
            ॐ
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-24 relative">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <Link to="/chapters">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10 group rounded-xl">
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                All Chapters
              </Button>
            </Link>
            <div className="flex gap-2">
              {chapterNum > 1 && (
                <Link to={`/chapters/${chapterNum - 1}`}>
                  <Button variant="outline" size="icon" className="rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              {chapterNum < 18 && (
                <Link to={`/chapters/${chapterNum + 1}`}>
                  <Button variant="outline" size="icon" className="rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            {/* Chapter badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              Chapter {chapter.chapter_number} of 18
            </div>

            {/* Large background number */}
            <div className="relative inline-block mb-4">
              <div className="text-[100px] sm:text-[140px] md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-primary/15 to-transparent leading-none select-none">
                {chapter.chapter_number}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="text-gradient">{chapter.title_english}</span>
            </h1>

            {chapter.title_sanskrit && (
              <p className="text-xl sm:text-2xl md:text-3xl text-primary/70 sanskrit mb-6 font-bold">
                {chapter.title_sanskrit}
              </p>
            )}

            {/* Theme pill */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-amber-500 text-white font-semibold mb-8 shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4" />
              <span>{chapter.theme}</span>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {chapter.description_english}
            </p>

            {/* Theme badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {themes.map((theme, index) => (
                <div
                  key={theme.label}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r text-white shadow-lg animate-fade-in hover:scale-105 transition-transform cursor-default",
                    theme.color
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <theme.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{theme.label}</span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
              {[
                { icon: BookOpen, value: animatedVerseCount.toString(), label: 'Verses', gradient: 'from-primary to-amber-500' },
                { icon: Brain, value: themes.length.toString(), label: 'Key Themes', gradient: 'from-purple-500 to-indigo-500' },
                { icon: Target, value: `${chapterNum}/18`, label: 'Chapter', gradient: 'from-emerald-500 to-teal-500' },
              ].map(stat => (
                <div key={stat.label} className="text-center group">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gradient">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Two-Column Content ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0">
            {/* Featured Quote */}
            {shloks && shloks.length > 0 && (
              <div className="mb-10">
                <div className="relative rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-primary/20 p-6 sm:p-8">
                  <div className="absolute top-4 left-6 text-5xl text-primary/20 font-serif">"</div>
                  <blockquote className="relative pl-8 text-lg sm:text-xl text-foreground/80 italic leading-relaxed">
                    {shloks[0].english_meaning.length > 200
                      ? shloks[0].english_meaning.substring(0, 200) + '...'
                      : shloks[0].english_meaning}
                  </blockquote>
                  <p className="mt-4 pl-8 text-sm text-primary font-semibold">— Verse {shloks[0].verse_number}</p>
                </div>
              </div>
            )}

            {/* Search & View Toggle */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between mb-8" ref={versesRef}>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-primary to-amber-500" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">Explore Verses</h2>
                  <p className="text-muted-foreground text-sm">
                    {filteredShloks.length} verses {searchQuery && `matching "${searchQuery}"`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search verses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-[200px] border-border/50 focus:border-primary/50 rounded-xl"
                  />
                </div>
                <div className="flex border border-border/50 rounded-xl overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("rounded-none h-10 w-10", viewMode === 'list' && "bg-primary/10 text-primary")}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("rounded-none h-10 w-10", viewMode === 'grid' && "bg-primary/10 text-primary")}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Verse Cards */}
            {shloksLoading ? (
              <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4")}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 animate-shimmer rounded-xl" />
                ))}
              </div>
            ) : filteredShloks.length > 0 ? (
              <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-5" : "space-y-5")}>
                {filteredShloks.map((shlok, index) => (
                  <VerseCard
                    key={shlok.id}
                    shlok={shlok}
                    chapterNumber={chapterNum}
                    animationDelay={index * 50}
                    compact={viewMode === 'grid'}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border/50 bg-card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  {searchQuery ? <Search className="h-8 w-8 text-muted-foreground" /> : <BookOpen className="h-8 w-8 text-muted-foreground" />}
                </div>
                <p className="text-muted-foreground">
                  {searchQuery ? `No verses found matching "${searchQuery}"` : 'No verses available for this chapter yet.'}
                </p>
                {searchQuery && (
                  <Button variant="ghost" className="mt-4" onClick={() => setSearchQuery('')}>Clear Search</Button>
                )}
              </div>
            )}

            {/* Chapter Progress Bar */}
            <div className="mt-12 rounded-2xl border border-border/50 bg-card p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-muted-foreground">Chapter Progress</span>
                <span className="text-sm font-bold text-gradient">{chapterNum} / 18</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-amber-500 to-orange-500 transition-all duration-700"
                  style={{ width: `${(chapterNum / 18) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-4 gap-2">
                {chapterNum > 1 && (
                  <Link to={`/chapters/${chapterNum - 1}`}>
                    <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Chapter {chapterNum - 1}
                    </Button>
                  </Link>
                )}
                <div className="flex-1" />
                {chapterNum < 18 && (
                  <Link to={`/chapters/${chapterNum + 1}`}>
                    <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                      Chapter {chapterNum + 1}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </main>

          {/* ── Sticky Sidebar ── */}
          <aside className="hidden lg:block w-80 xl:w-[340px] shrink-0">
            <div className="sticky top-24 space-y-6">

              {/* Chapter Info Card */}
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Chapter Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Verses</span>
                    <span className="font-bold">{shloks?.length || chapter.verse_count || '—'}</span>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Theme</span>
                    <span className="font-bold text-primary">{chapter.theme}</span>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Read Time</span>
                    <span className="font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      ~{Math.ceil((shloks?.length || chapter.verse_count || 10) * 1.5)} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 rounded-xl h-10"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Link Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 rounded-xl h-10"
                    onClick={handleShareWhatsApp}
                  >
                    <Share2 className="h-4 w-4" />
                    Share on WhatsApp
                  </Button>
                </div>
              </div>

              {/* Need Guidance CTA */}
              <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">Need Guidance?</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Ask Krishna AI about this chapter's teachings and how to apply them in your life.
                </p>
                <Link to={`/chat?context=chapter-${chapterNum}`}>
                  <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-amber-500 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                    Talk to Krishna
                  </Button>
                </Link>
              </div>

              {/* Navigate Chapters */}
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Navigate</h3>
                <div className="grid grid-cols-6 gap-1.5">
                  {Array.from({ length: 18 }, (_, i) => i + 1).map(num => (
                    <Link key={num} to={`/chapters/${num}`}>
                      <div className={cn(
                        "w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                        num === chapterNum
                          ? "bg-gradient-to-br from-primary to-amber-500 text-white shadow-md"
                          : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      )}>
                        {num}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-amber-500 text-white shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform animate-fade-in"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </Layout>
  );
}
