import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getChapters, getStats } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles, ArrowRight, TrendingUp, Clock, Target } from 'lucide-react';
import { ChapterFilters } from '@/components/chapters/ChapterFilters';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';
import { FloatingOm, RadialGlow, PopularBadge } from '@/components/ui/decorative-elements';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Key teachings for each chapter
const chapterTeachings: Record<number, string[]> = {
  1: ['Arjuna\'s moral dilemma', 'The conflict of duty', 'Seeking divine guidance'],
  2: ['The immortal soul', 'Karma Yoga introduction', 'Equanimity in action'],
  3: ['Importance of action', 'Selfless service', 'Leading by example'],
  4: ['Divine incarnation', 'Sacrifice of knowledge', 'Finding a teacher'],
  5: ['Renunciation vs action', 'True renunciation', 'Inner peace'],
  6: ['Meditation practices', 'Controlling the mind', 'Self-discipline'],
  7: ['Knowledge and wisdom', 'Material and spiritual nature', 'Surrendering to God'],
  8: ['The eternal question', 'Remembrance at death', 'Path to liberation'],
  9: ['Royal knowledge', 'Supreme secret', 'Devotion\'s power'],
  10: ['Divine manifestations', 'Glory of God', 'Recognition of divinity'],
  11: ['Universal form vision', 'Cosmic perspective', 'Awe and devotion'],
  12: ['Path of devotion', 'Personal vs formless', 'Qualities of devotees'],
  13: ['Field and knower', 'Knowledge of self', 'Liberation path'],
  14: ['Three gunas', 'Nature\'s qualities', 'Transcendence'],
  15: ['Supreme person', 'Tree of life analogy', 'Ultimate reality'],
  16: ['Divine vs demonic', 'Character qualities', 'Path to elevation'],
  17: ['Three types of faith', 'Food and worship', 'Austerity forms'],
  18: ['Final teachings', 'Surrender completely', 'Attaining liberation'],
};

// Most popular chapters for badge
const popularChapters = [2, 11, 18];

// Animated counter hook inline
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
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
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

  // Intersection observer for stats animation
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
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const availableThemes = useMemo(() => {
    if (!chapters) return [];
    const themes = new Set(chapters.map(c => c.theme));
    return Array.from(themes).sort();
  }, [chapters]);

  const filteredChapters = useMemo(() => {
    if (!chapters) return [];
    
    return chapters.filter(chapter => {
      const matchesSearch = !searchQuery || 
        chapter.title_english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.description_english?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTheme = selectedThemes.length === 0 || 
        selectedThemes.includes(chapter.theme);
      
      return matchesSearch && matchesTheme;
    });
  }, [chapters, searchQuery, selectedThemes]);

  const handleThemeToggle = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const handleQuickJump = (value: string) => {
    setQuickJump(value);
    if (value) {
      const element = document.getElementById(`chapter-${value}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      
      {/* Hero Section - WebFX inspired */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
        {/* Decorative Elements */}
        <RadialGlow position="top-right" color="primary" className="opacity-50" />
        <RadialGlow position="bottom-left" color="amber" className="opacity-30" />
        <FloatingOm className="top-20 left-10 animate-float hidden lg:block" />
        <FloatingOm className="bottom-20 right-10 animate-float animation-delay-500 hidden lg:block" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-6 animate-fade-in border border-primary/20">
              <Sparkles className="h-4 w-4" />
              Complete Scripture
            </div>

            {/* Headline - WebFX bold style */}
            <h1 className="headline-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 animate-fade-in animation-delay-100">
              <span className="text-foreground">The </span>
              <span className="text-gradient">18 Chapters</span>
              <span className="text-foreground"> of Wisdom</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in animation-delay-200">
              Each chapter addresses different aspects of life, duty, and self-realization. 
              Explore the wisdom within.
            </p>

            {/* Stats row - WebFX metric style with animated counters */}
            <div 
              ref={statsRef}
              className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-12 animate-fade-in animation-delay-300"
            >
              <div className="text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient">{chaptersCount}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide mt-1">Chapters</div>
              </div>
              <div className="hidden sm:block w-px h-24 bg-gradient-to-b from-transparent via-border to-transparent self-center" />
              <div className="text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient">{versesCount}+</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide mt-1">Verses</div>
              </div>
              <div className="hidden sm:block w-px h-24 bg-gradient-to-b from-transparent via-border to-transparent self-center" />
              <div className="text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient">5000+</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide mt-1">Years Old</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Jump & Filters Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <ChapterFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedThemes={selectedThemes}
              onThemeToggle={handleThemeToggle}
              availableThemes={availableThemes}
            />
          </div>
          
          {/* Quick Jump Dropdown */}
          <div className="w-full md:w-48">
            <Select value={quickJump} onValueChange={handleQuickJump}>
              <SelectTrigger className="h-12 bg-card border-2 border-border/50 hover:border-primary/30 transition-colors">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(18)].map((_, i) => (
              <div 
                key={i} 
                className="h-72 animate-pulse rounded-2xl bg-muted"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No chapters match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredChapters.map((chapter, index) => {
              const teachings = chapterTeachings[chapter.chapter_number] || [];
              const isPopular = popularChapters.includes(chapter.chapter_number);
              
              return (
                <Link 
                  key={chapter.id} 
                  id={`chapter-${chapter.chapter_number}`}
                  to={`/chapters/${chapter.chapter_number}`}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="group h-full relative rounded-2xl overflow-hidden">
                    {/* Left Gradient Border */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-amber-500 to-orange-500 z-10" />
                    
                    <div className="h-full border-2 border-l-0 border-border/50 bg-card rounded-r-2xl transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:-translate-y-2">
                      {/* Gradient header */}
                      <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-primary to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                              Chapter {chapter.chapter_number}
                            </span>
                            {isPopular && <PopularBadge />}
                          </div>
                          <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                            <BookOpen className="h-4 w-4" />
                            {chapter.verse_count} verses
                          </span>
                        </div>
                        
                        <h2 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                          {chapter.title_english}
                        </h2>
                        {chapter.title_sanskrit && (
                          <p className="text-sm text-muted-foreground sanskrit mb-4">
                            {chapter.title_sanskrit}
                          </p>
                        )}
                        
                        <div className="mb-4">
                          <span className="inline-block px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-amber-500/10 text-primary text-sm font-semibold border border-primary/20">
                            {chapter.theme}
                          </span>
                        </div>
                        
                        {/* Key teachings - hidden on mobile */}
                        {teachings.length > 0 && (
                          <ul className="hidden sm:block text-sm text-muted-foreground space-y-2 mb-5">
                            {teachings.slice(0, 2).map((teaching) => (
                              <li key={teaching} className="flex items-start gap-2">
                                <span className="text-primary mt-0.5 text-xs">✦</span>
                                <span>{teaching}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        <div className="flex items-center text-primary text-sm font-bold mt-auto pt-4 border-t border-border/50">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          <span>Explore Chapter</span>
                          <ArrowRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
