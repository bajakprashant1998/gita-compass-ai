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
    <Card className="h-full border-primary/20 hover:border-primary/40 transition-colors">
      <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
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
          <div className="rounded-lg bg-primary/5 p-3">
            <h4 className="text-xs font-bold text-primary uppercase mb-1">Life Application</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{shlok.life_application}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <GitCompareArrows className="h-4 w-4" />
              Compare Verses
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Side-by-Side Verse Comparison</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Explore connections between different Gita teachings by comparing verses together.
            </p>
          </div>

          {/* Add verse form */}
          {verses.length < 4 && (
            <Card className="mb-8 border-dashed border-2">
              <CardContent className="p-4 flex flex-wrap items-end gap-3">
                <div>
                  <Label className="text-xs">Chapter (1-18)</Label>
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
                  <Label className="text-xs">Verse</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newVerse}
                    onChange={e => setNewVerse(e.target.value)}
                    placeholder="Verse"
                    className="w-20"
                  />
                </div>
                <Button onClick={addVerse} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Add Verse
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comparison Grid */}
          {verses.length === 0 ? (
            <Card className="border-dashed">
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

          {/* Popular comparisons */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Popular Comparisons</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Karma Yoga vs Jnana Yoga', verses: [{ chapter: 3, verse: 3 }, { chapter: 4, verse: 33 }] },
                { label: 'Duty & Detachment', verses: [{ chapter: 2, verse: 47 }, { chapter: 2, verse: 48 }] },
                { label: 'Mind Control', verses: [{ chapter: 6, verse: 5 }, { chapter: 6, verse: 6 }] },
              ].map(preset => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setVerses(preset.verses)}
                  className="hover:border-primary/40"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
