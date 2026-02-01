import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { getChapters } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight } from 'lucide-react';
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
    { name: 'Home', url: 'https://gitawisdom.com/' },
    { name: 'Chapters', url: 'https://gitawisdom.com/chapters' },
  ];

  return (
    <Layout>
      <SEOHead
        title="18 Chapters of Bhagavad Gita - Complete Guide"
        description="Explore all 18 chapters of the Bhagavad Gita. From Arjuna's despair to ultimate liberation, discover the spiritual journey and key teachings of each chapter."
        canonicalUrl="https://gitawisdom.com/chapters"
        keywords={['Bhagavad Gita chapters', '18 chapters', 'Gita summary', 'chapter guide', 'spiritual journey']}
        structuredData={generateBreadcrumbSchema(breadcrumbs)}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Complete Guide
          </span>
          <h1 className="text-4xl font-bold mb-4">The 18 Chapters</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each chapter of the Bhagavad Gita addresses different aspects of life, 
            duty, and self-realization. Explore the wisdom within.
          </p>
        </div>

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
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No chapters match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChapters.map((chapter, index) => {
              const teachings = chapterTeachings[chapter.chapter_number] || [];
              
              return (
                <Link 
                  key={chapter.id} 
                  to={`/chapters/${chapter.chapter_number}`}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="group h-full rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-xs font-medium">
                        Chapter {chapter.chapter_number}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        {chapter.verse_count} verses
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                      {chapter.title_english}
                    </h2>
                    {chapter.title_sanskrit && (
                      <p className="text-sm text-muted-foreground sanskrit mb-4">
                        {chapter.title_sanskrit}
                      </p>
                    )}
                    
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {chapter.theme}
                      </span>
                    </div>
                    
                    {/* Key teachings */}
                    {teachings.length > 0 && (
                      <ul className="text-sm text-muted-foreground space-y-1.5 mb-4">
                        {teachings.slice(0, 2).map((teaching) => (
                          <li key={teaching} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{teaching}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all">
                      <span>Explore Chapter</span>
                      <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
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
