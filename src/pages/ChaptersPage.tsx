import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getChapters } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { ChapterFilters } from '@/components/chapters/ChapterFilters';
import { SEOHead, generateBreadcrumbSchema } from '@/components/SEOHead';

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

export default function ChaptersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  
  const { data: chapters, isLoading } = useQuery({
    queryKey: ['chapters'],
    queryFn: getChapters,
  });

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

  const breadcrumbs = [
    { name: 'Home', url: 'https://www.bhagavadgitagyan.com/' },
    { name: 'Chapters', url: 'https://www.bhagavadgitagyan.com/chapters' },
  ];

  const totalVerses = chapters?.reduce((sum, ch) => sum + (ch.verse_count || 0), 0) || 700;

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Complete Scripture
            </div>

            {/* Headline - WebFX bold style */}
            <h1 className="headline-bold mb-6 animate-fade-in animation-delay-100">
              <span className="text-foreground">The </span>
              <span className="text-gradient">18 Chapters</span>
              <span className="text-foreground"> of Wisdom</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in animation-delay-200">
              Each chapter addresses different aspects of life, duty, and self-realization. 
              Explore the wisdom within.
            </p>

            {/* Stats row - WebFX metric style */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 animate-fade-in animation-delay-300">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-gradient">18</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide mt-1">Chapters</div>
              </div>
              <div className="hidden sm:block w-px h-16 bg-border" />
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-gradient">{totalVerses}+</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide mt-1">Verses</div>
              </div>
              <div className="hidden sm:block w-px h-16 bg-border" />
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-gradient">5000+</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide mt-1">Years Old</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <ChapterFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedThemes={selectedThemes}
          onThemeToggle={handleThemeToggle}
          availableThemes={availableThemes}
        />

        {/* Chapters Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No chapters match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredChapters.map((chapter, index) => {
              const teachings = chapterTeachings[chapter.chapter_number] || [];
              
              return (
                <Link 
                  key={chapter.id} 
                  to={`/chapters/${chapter.chapter_number}`}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="group h-full rounded-2xl border-2 border-border/50 bg-card overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2">
                    {/* Gradient header */}
                    <div className="h-2 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-primary/10 text-primary border-0 font-bold text-xs uppercase tracking-wider">
                          Chapter {chapter.chapter_number}
                        </Badge>
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
                      
                      {/* Key teachings */}
                      {teachings.length > 0 && (
                        <ul className="text-sm text-muted-foreground space-y-2 mb-5">
                          {teachings.slice(0, 2).map((teaching) => (
                            <li key={teaching} className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">✦</span>
                              <span>{teaching}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="flex items-center text-primary text-sm font-bold">
                        <span>Explore Chapter</span>
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-2" />
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
