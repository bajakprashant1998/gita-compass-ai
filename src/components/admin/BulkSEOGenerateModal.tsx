import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, CheckCircle, XCircle } from 'lucide-react';
import { generateAIContentWithMeta } from '@/lib/adminApi';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkSEOGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ContentType = 'chapters' | 'shloks' | 'problems';

export function BulkSEOGenerateModal({
  open,
  onOpenChange,
}: BulkSEOGenerateModalProps) {
  const { toast } = useToast();
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([]);
  const [skipExisting, setSkipExisting] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentItem: '' });
  const [results, setResults] = useState({ success: 0, failed: 0, skipped: 0 });

  const contentTypes: { key: ContentType; label: string; description: string }[] = [
    { key: 'chapters', label: 'All Chapters', description: '18 chapters' },
    { key: 'shloks', label: 'All Shloks', description: 'All published verses' },
    { key: 'problems', label: 'All Problems', description: 'All problem tags' },
  ];

  const handleTypeToggle = (type: ContentType, checked: boolean) => {
    setSelectedTypes(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) {
      toast({ title: 'Select Content', description: 'Pick at least one content type', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setResults({ success: 0, failed: 0, skipped: 0 });
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    try {
      // Collect all items
      const items: Array<{ type: ContentType; id: string; title: string; content: string; url: string; hasSEO: boolean }> = [];

      if (selectedTypes.includes('chapters')) {
        const { data } = await supabase.from('chapters').select('id, chapter_number, title_english, theme, description_english, meta_title').order('chapter_number');
        (data || []).forEach(ch => items.push({
          type: 'chapters',
          id: ch.id,
          title: ch.title_english,
          content: `Chapter ${ch.chapter_number}: ${ch.title_english}. Theme: ${ch.theme}. ${ch.description_english || ''}`,
          url: `bhagavadgitagyan.com/chapters/${ch.chapter_number}`,
          hasSEO: !!ch.meta_title,
        }));
      }

      if (selectedTypes.includes('shloks')) {
        const { data } = await supabase.from('shloks').select('id, verse_number, sanskrit_text, english_meaning, chapter_id, meta_title, chapter:chapters(chapter_number)').eq('status', 'published');
        (data || []).forEach(sh => {
          const chNum = (sh.chapter as any)?.chapter_number || '?';
          items.push({
            type: 'shloks',
            id: sh.id,
            title: `Verse ${chNum}.${sh.verse_number}`,
            content: `${sh.sanskrit_text} ${sh.english_meaning || ''}`,
            url: `bhagavadgitagyan.com/chapters/${chNum}/verse/${sh.verse_number}`,
            hasSEO: !!sh.meta_title,
          });
        });
      }

      if (selectedTypes.includes('problems')) {
        const { data } = await supabase.from('problems').select('id, name, slug, description_english, category, meta_title').order('display_order');
        (data || []).forEach(p => items.push({
          type: 'problems',
          id: p.id,
          title: p.name,
          content: `${p.name}. ${p.description_english || ''} Category: ${p.category || ''}`,
          url: `bhagavadgitagyan.com/problems/${p.slug}`,
          hasSEO: !!p.meta_title,
        }));
      }

      setProgress({ current: 0, total: items.length, currentItem: '' });

      for (const item of items) {
        if (skipExisting && item.hasSEO) {
          skippedCount++;
          setProgress(prev => ({ ...prev, current: prev.current + 1, currentItem: `Skipped: ${item.title}` }));
          setResults({ success: successCount, failed: failedCount, skipped: skippedCount });
          continue;
        }

        setProgress(prev => ({ ...prev, currentItem: item.title }));

        try {
          const result = await generateAIContentWithMeta('generate_seo', {
            page_title: item.title,
            page_content: item.content,
            page_url: item.url,
          });

          const updateData: Record<string, unknown> = {};
          if (result.meta_title) updateData.meta_title = result.meta_title;
          if (result.meta_description) updateData.meta_description = result.meta_description;
          if (result.meta_keywords && Array.isArray(result.meta_keywords)) updateData.meta_keywords = result.meta_keywords;

          if (Object.keys(updateData).length > 0) {
            const { error } = await supabase.from(item.type).update(updateData).eq('id', item.id);
            if (error) throw error;
            successCount++;
          }
        } catch (err) {
          console.error(`Failed SEO for ${item.title}:`, err);
          failedCount++;
        }

        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        setResults({ success: successCount, failed: failedCount, skipped: skippedCount });

        // Rate limit delay
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      toast({
        title: 'Bulk SEO Complete',
        description: `${successCount} generated, ${skippedCount} skipped, ${failedCount} failed.`,
      });
    } catch (error) {
      console.error('Bulk SEO generation failed:', error);
      toast({ title: 'Error', description: 'Bulk generation encountered an error', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Bulk SEO Generation
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Auto-generate SEO metadata (title, description, keywords) for all content using AI.
          </p>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Select content to generate SEO for:</Label>
            <div className="space-y-3">
              {contentTypes.map(ct => (
                <div key={ct.key} className="flex items-center gap-3">
                  <Checkbox
                    id={`seo-${ct.key}`}
                    checked={selectedTypes.includes(ct.key)}
                    onCheckedChange={(checked) => handleTypeToggle(ct.key, !!checked)}
                    disabled={isGenerating}
                  />
                  <Label htmlFor={`seo-${ct.key}`} className="text-sm cursor-pointer flex-1">
                    <span className="font-medium">{ct.label}</span>
                    <span className="text-muted-foreground ml-2">({ct.description})</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t">
            <Checkbox
              id="skip-existing"
              checked={skipExisting}
              onCheckedChange={(checked) => setSkipExisting(!!checked)}
              disabled={isGenerating}
            />
            <Label htmlFor="skip-existing" className="text-sm cursor-pointer">
              Skip items that already have SEO metadata
            </Label>
          </div>

          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate max-w-[280px]">{progress.currentItem}</span>
                <span className="tabular-nums">{progress.current}/{progress.total}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex gap-3 flex-wrap">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  {results.success} generated
                </Badge>
                {results.skipped > 0 && (
                  <Badge variant="outline" className="gap-1">
                    ⏭ {results.skipped} skipped
                  </Badge>
                )}
                {results.failed > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <XCircle className="h-3 w-3 text-destructive" />
                    {results.failed} failed
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            {isGenerating ? 'Running...' : 'Cancel'}
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || selectedTypes.length === 0}>
            {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isGenerating ? 'Generating...' : 'Start Generation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
