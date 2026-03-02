import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { getShlokByChapterAndVerse } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GitCompareArrows, Plus, X, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';

interface VerseRef {
  chapter: number;
  verse: number;
}

function VersePanel({ verseRef, onRemove }: { verseRef: VerseRef; onRemove: () => void }) {
  const { data: shlok, isLoading } = useQuery({
    queryKey: ['compare-verse', verseRef.chapter, verseRef.verse],
    queryFn: () => getShlokByChapterAndVerse(verseRef.chapter, verseRef.verse),
  });

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  }

  if (!shlok) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="p-6 text-center">
          <p className="text-destructive text-sm">Verse not found</p>
          <Button variant="ghost" size="sm" onClick={onRemove} className="mt-2">Remove</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group h-full border-border/50 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            to={`/chapters/${verseRef.chapter}/verse/${verseRef.verse}`}
            className="text-sm font-bold text-primary hover:underline"
          >
            Ch. {verseRef.chapter}, Verse {verseRef.verse}
          </Link>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <blockquote className="text-base font-medium sanskrit text-center mb-4 leading-relaxed whitespace-pre-line" lang="sa">
          {shlok.sanskrit_text}
        </blockquote>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

        <p className="text-sm text-foreground mb-4 leading-relaxed">{shlok.english_meaning}</p>

        {shlok.life_application && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
            <h4 className="text-xs font-bold text-primary uppercase mb-1">Life Application</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{shlok.life_application}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const PRESETS = [
  { label: 'Karma Yoga vs Jnana Yoga', verses: [{ chapter: 3, verse: 3 }, { chapter: 4, verse: 33 }] },
  { label: 'Duty & Detachment', verses: [{ chapter: 2, verse: 47 }, { chapter: 2, verse: 48 }] },
  { label: 'Mind Control', verses: [{ chapter: 6, verse: 5 }, { chapter: 6, verse: 6 }] },
];

export default function CompareVersesPage() {
  const [verses, setVerses] = useState<VerseRef[]>([
    { chapter: 2, verse: 47 },
    { chapter: 3, verse: 19 },
  ]);
  const [newChapter, setNewChapter] = useState('');
  const [newVerse, setNewVerse] = useState('');

  const addVerse = () => {
    const ch = parseInt(newChapter);
    const v = parseInt(newVerse);
    if (ch >= 1 && ch <= 18 && v >= 1 && verses.length < 4) {
      setVerses([...verses, { chapter: ch, verse: v }]);
      setNewChapter('');
      setNewVerse('');
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Compare Bhagavad Gita Verses"
        description="Compare multiple Bhagavad Gita verses side by side. Explore connections between different teachings and discover deeper wisdom."
        keywords={['compare verses', 'Bhagavad Gita comparison', 'verse analysis']}
      />

      <div className="relative overflow-hidden">
        {/* Premium Hero */}
        <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/10 border-b border-border/50">
          <RadialGlow position="top-left" color="primary" className="opacity-30" />
          <RadialGlow position="bottom-right" color="amber" className="opacity-20" />
          <FloatingOm className="top-8 right-8 animate-float hidden lg:block" />

          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in border border-primary/20">
                <GitCompareArrows className="h-4 w-4" />
                Compare Verses
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight animate-fade-in">
                Side-by-Side{' '}
                <span className="text-gradient">Comparison</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in">
                Explore connections between different Gita teachings by comparing verses together.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-6xl mx-auto">
            {/* Add verse form */}
            {verses.length < 4 && (
              <Card className="mb-8 border-dashed border-2 border-primary/20 hover:border-primary/40 transition-colors overflow-hidden">
                <CardContent className="p-4 sm:p-5 flex flex-wrap items-end gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Chapter (1-18)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={18}
                      value={newChapter}
                      onChange={e => setNewChapter(e.target.value)}
                      placeholder="Ch."
                      className="w-20"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Verse</Label>
                    <Input
                      type="number"
                      min={1}
                      value={newVerse}
                      onChange={e => setNewVerse(e.target.value)}
                      placeholder="Verse"
                      className="w-20"
                    />
                  </div>
                  <Button onClick={addVerse} size="sm" className="gap-1 bg-gradient-to-r from-primary to-primary/80">
                    <Plus className="h-4 w-4" /> Add Verse
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Popular comparisons */}
            <div className="mb-8">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Quick Presets</h2>
              <div className="flex flex-wrap gap-3">
                {PRESETS.map(preset => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setVerses(preset.verses)}
                    className="hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Comparison Grid */}
            {verses.length === 0 ? (
              <Card className="border-dashed border-border/50">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Add verses above to start comparing</p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                "grid gap-5",
                verses.length === 1 && "grid-cols-1 max-w-xl mx-auto",
                verses.length === 2 && "grid-cols-1 md:grid-cols-2",
                verses.length >= 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
              )}>
                {verses.map((v, idx) => (
                  <VersePanel
                    key={`${v.chapter}-${v.verse}`}
                    verseRef={v}
                    onRemove={() => setVerses(verses.filter((_, i) => i !== idx))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
