import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { getChapters, getStats } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Target, Clock, Compass } from 'lucide-react';
import { ChapterFilters } from '@/components/chapters/ChapterFilters';
import { ChapterCard } from '@/components/chapters/ChapterCard';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';
import { RadialGlow } from '@/components/ui/decorative-elements';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function useAnimatedCounter(end: number, startCounting: boolean, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration, startCounting]);
  return count;
}

export default function ChaptersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [quickJump, setQuickJump] = useState('');
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const { data: chapters, isLoading } = useQuery({
    queryKey: ['chapters'],
    queryFn: getChapters,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const availableThemes = useMemo(() => {
    if (!chapters) return [];
    return Array.from(new Set(chapters.map(c => c.theme))).sort();
  }, [chapters]);

  const filteredChapters = useMemo(() => {
    if (!chapters) return [];
    return chapters.filter(chapter => {
      const matchesSearch = !searchQuery ||
        chapter.title_english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.description_english?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTheme = selectedThemes.length === 0 || selectedThemes.includes(chapter.theme);
      return matchesSearch && matchesTheme;
    });
  }, [chapters, searchQuery, selectedThemes]);

  const handleThemeToggle = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const handleQuickJump = (value: string) => {
    setQuickJump(value);
    if (value) {
      document.getElementById(`chapter-${value}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const breadcrumbs = [
    { name: 'Home', url: 'https://www.bhagavadgitagyan.com/' },
    { name: 'Chapters', url: 'https://www.bhagavadgitagyan.com/chapters' },
  ];

  const totalVerses = stats?.shloks || chapters?.reduce((sum, ch) => sum + (ch.verse_count || 0), 0) || 700;
  const chaptersCount = useAnimatedCounter(stats?.chapters || 18, isStatsVisible, 1200);
  const versesCount = useAnimatedCounter(totalVerses, isStatsVisible, 1800);

  return (
    <Layout>
      <SEOHead
        title="18 Chapters of Bhagavad Gita - Complete Guide"
        description="Explore all 18 chapters of the Bhagavad Gita. From Arjuna's despair to ultimate liberation, discover the spiritual journey and key teachings of each chapter."
        canonicalUrl="https://www.bhagavadgitagyan.com/chapters"
        keywords={['Bhagavad Gita chapters', '18 chapters', 'Gita summary', 'chapter guide', 'spiritual journey']}
        structuredData={generateBreadcrumbSchema(breadcrumbs)}
      />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <RadialGlow position="top-right" color="primary" className="opacity-40 scale-150" />
          <RadialGlow position="bottom-left" color="amber" className="opacity-25 scale-125" />
          {/* Geometric grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          {/* ॐ watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black text-primary/[0.03] select-none sanskrit leading-none">
            ॐ
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-28 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              Complete Scripture Guide
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in animation-delay-100">
              <span className="text-foreground">The </span>
              <span className="text-gradient">18 Chapters</span>
              <br className="hidden sm:block" />
              <span className="text-foreground"> of Eternal Wisdom</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in animation-delay-200 leading-relaxed">
              A spiritual journey from Arjuna's despair to ultimate liberation.
              Each chapter illuminates a different path to self-realization.
            </p>

            {/* Stats row */}
            <div
              ref={statsRef}
              className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-16 animate-fade-in animation-delay-300"
            >
              {[
                { icon: BookOpen, value: chaptersCount, label: 'Chapters', gradient: 'from-primary to-amber-500' },
                { icon: Target, value: versesCount, suffix: '+', label: 'Verses', gradient: 'from-amber-500 to-orange-500' },
                { icon: Clock, value: 5000, suffix: '+', label: 'Years Old', gradient: 'from-orange-500 to-red-500' },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center group">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mt-1">
                    {stat.label}
                  </div>
                  {i < 2 && (
                    <div className="hidden sm:block absolute" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Section ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Filters + Quick Jump */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1">
            <ChapterFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedThemes={selectedThemes}
              onThemeToggle={handleThemeToggle}
              availableThemes={availableThemes}
            />
          </div>
          <div className="w-full md:w-52">
            <Select value={quickJump} onValueChange={handleQuickJump}>
              <SelectTrigger className="h-11 bg-card border border-border/50 hover:border-primary/30 transition-colors rounded-xl">
                <Compass className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Quick Jump..." />
              </SelectTrigger>
              <SelectContent>
                {chapters?.map(ch => (
                  <SelectItem key={ch.id} value={ch.chapter_number.toString()}>
                    Ch. {ch.chapter_number}: {ch.title_english}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chapters Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7">
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-shimmer rounded-2xl bg-muted/30"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-5">
              <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No chapters found</h3>
            <p className="text-muted-foreground mb-5">Try adjusting your search or filters</p>
            <Button variant="outline" className="rounded-xl" onClick={() => { setSearchQuery(''); setSelectedThemes([]); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7">
            {filteredChapters.map((chapter, index) => (
              <ChapterCard key={chapter.id} chapter={chapter} index={index} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
