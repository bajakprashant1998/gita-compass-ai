import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';
import { Layout } from '@/components/layout/Layout';
import { getChapter, getShloksByChapter } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Flame
} from 'lucide-react';
import { VerseCard } from '@/components/chapters/VerseCard';
import { cn } from '@/lib/utils';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (end === 0) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return count;
}

// Key themes for each chapter (simplified - you can expand this)
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
  
  // Filter shloks based on search
  const filteredShloks = shloks?.filter(shlok => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      shlok.sanskrit_text.toLowerCase().includes(query) ||
      shlok.english_meaning.toLowerCase().includes(query) ||
      shlok.verse_number.toString().includes(query)
    );
  });

  const themes = chapterThemes[chapterNum] || chapterThemes[2];

  if (chapterLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </Layout>
    );
  }

  if (!chapter) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
          <Link to="/chapters">
            <Button>Back to Chapters</Button>
          </Link>
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
      {/* Hero Section - WebFX Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-amber-500/5 py-12 sm:py-16 lg:py-24">
        {/* Enhanced Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Radial gradients */}
          <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.2),transparent_50%)]" />
          <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--accent)/0.15),transparent_50%)]" />
          
          {/* Floating Om symbols */}
          <div className="absolute top-20 left-10 text-8xl text-primary/5 font-bold animate-pulse">ॐ</div>
          <div className="absolute bottom-20 right-10 text-6xl text-amber-500/5 font-bold animate-pulse" style={{ animationDelay: '1s' }}>ॐ</div>
          <div className="absolute top-1/2 left-1/4 text-4xl text-primary/5 font-bold animate-pulse" style={{ animationDelay: '0.5s' }}>ॐ</div>
          
          {/* Decorative lines */}
          <div className="absolute top-1/4 right-0 w-1/3 h-px bg-gradient-to-l from-primary/20 to-transparent" />
          <div className="absolute bottom-1/4 left-0 w-1/3 h-px bg-gradient-to-r from-primary/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-12">
            <Link to="/chapters">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10 group">
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                All Chapters
              </Button>
            </Link>
            <div className="flex gap-2">
              {chapterNum > 1 && (
                <Link to={`/chapters/${chapterNum - 1}`}>
                  <Button variant="outline" size="icon" className="hover:border-primary hover:text-primary hover:bg-primary/5 transition-all hover:shadow-lg hover:shadow-primary/10">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              {chapterNum < 18 && (
                <Link to={`/chapters/${chapterNum + 1}`}>
                  <Button variant="outline" size="icon" className="hover:border-primary hover:text-primary hover:bg-primary/5 transition-all hover:shadow-lg hover:shadow-primary/10">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Chapter Info - Enhanced */}
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            {/* Large Chapter Number Badge */}
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="text-[80px] sm:text-[100px] md:text-[140px] lg:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-primary/20 to-transparent leading-none select-none">
                {chapter.chapter_number}
              </div>
              <Badge 
                variant="secondary" 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg px-6 py-2 bg-gradient-to-r from-primary to-amber-500 text-white border-0 shadow-xl shadow-primary/30"
              >
                Chapter {chapter.chapter_number}
              </Badge>
            </div>
            
            <h1 className="headline-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 tracking-tight">
              {chapter.title_english}
            </h1>
            
            {chapter.title_sanskrit && (
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary/80 sanskrit mb-6 sm:mb-8 font-bold">
                {chapter.title_sanskrit}
              </p>
            )}
            
            {/* Theme Pill */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-amber-500 text-white font-semibold mb-8 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105 cursor-default">
              <Sparkles className="h-5 w-5" />
              <span className="text-lg">{chapter.theme}</span>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              {chapter.description_english}
            </p>

            {/* Key Themes Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {themes.map((theme, index) => (
                <div 
                  key={theme.label}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full",
                    "bg-gradient-to-r text-white shadow-lg",
                    theme.color,
                    "animate-fade-in hover:scale-105 transition-transform cursor-default"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <theme.icon className="h-4 w-4" />
                  <span className="font-medium">{theme.label}</span>
                </div>
              ))}
            </div>

            {/* Stats Cards - WebFX Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="group p-4 sm:p-6 rounded-2xl bg-card border border-border/50 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gradient mb-1">{animatedVerseCount}</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Sacred Verses</div>
              </div>
              
              <div className="group p-4 sm:p-6 rounded-2xl bg-card border border-border/50 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">{themes.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Key Themes</div>
              </div>
              
              <div className="group p-4 sm:p-6 rounded-2xl bg-card border border-border/50 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">{chapterNum}/18</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Chapter</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Featured Quote - First verse highlight */}
      {shloks && shloks.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
          <div className="max-w-4xl mx-auto">
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
        </div>
      )}

      {/* Verses Section - Enhanced */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Section Header with Search & View Toggle */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-primary to-amber-500" />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Explore Verses
                </h2>
                <p className="text-muted-foreground text-sm">
                  {filteredShloks?.length || 0} verses {searchQuery && `matching "${searchQuery}"`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search verses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-[200px] border-border/50 focus:border-primary/50"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex border border-border/50 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-none h-10 w-10",
                    viewMode === 'list' && "bg-primary/10 text-primary"
                  )}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-none h-10 w-10",
                    viewMode === 'grid' && "bg-primary/10 text-primary"
                  )}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {shloksLoading ? (
            <div className={cn(
              viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"
            )}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 animate-shimmer rounded-xl" />
              ))}
            </div>
          ) : filteredShloks && filteredShloks.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-5" : "space-y-5"
            )}>
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
                {searchQuery ? (
                  <Search className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No verses found matching "${searchQuery}"`
                  : 'No verses available for this chapter yet. Check back soon!'
                }
              </p>
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
