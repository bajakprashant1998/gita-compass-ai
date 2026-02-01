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
import { Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { generateAIContent, type AIGenerationType } from '@/lib/adminApi';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShlokInfo {
  id: string;
  verse_number: number;
  sanskrit_text: string;
  english_meaning: string;
  transliteration?: string;
  hindi_meaning?: string;
  problem_context?: string;
  solution_gita?: string;
  life_application?: string;
  practical_action?: string;
  modern_story?: string;
}

interface AIBulkGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedShlokIds: string[];
  onComplete: () => void;
}

type FieldOption = {
  key: AIGenerationType;
  label: string;
  fieldName: keyof ShlokInfo;
};

const fieldOptions: FieldOption[] = [
  { key: 'transliteration', label: 'Transliteration', fieldName: 'transliteration' },
  { key: 'hindi_meaning', label: 'Hindi Meaning', fieldName: 'hindi_meaning' },
  { key: 'english_meaning', label: 'English Meaning', fieldName: 'english_meaning' },
  { key: 'problem_context', label: 'Problem Context', fieldName: 'problem_context' },
  { key: 'solution_gita', label: 'Gita Solution', fieldName: 'solution_gita' },
  { key: 'life_application', label: 'Life Application', fieldName: 'life_application' },
  { key: 'practical_action', label: 'Practical Action', fieldName: 'practical_action' },
  { key: 'modern_story', label: 'Modern Story', fieldName: 'modern_story' },
];

export function AIBulkGenerateModal({
  open,
  onOpenChange,
  selectedShlokIds,
  onComplete,
}: AIBulkGenerateModalProps) {
  const { toast } = useToast();
  const [selectedFields, setSelectedFields] = useState<AIGenerationType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentShlok: '' });
  const [results, setResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  const handleFieldToggle = (field: AIGenerationType, checked: boolean) => {
    setSelectedFields(prev =>
      checked ? [...prev, field] : prev.filter(f => f !== field)
    );
  };

  const handleGenerate = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: 'Select Fields',
        description: 'Please select at least one field to generate',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setResults({ success: 0, failed: 0 });

    const total = selectedShlokIds.length * selectedFields.length;
    setProgress({ current: 0, total, currentShlok: '' });

    let successCount = 0;
    let failedCount = 0;

    try {
      // Fetch all shloks data first
      const { data: shloksData, error } = await supabase
        .from('shloks')
        .select('*')
        .in('id', selectedShlokIds);

      if (error) throw error;

      for (const shlok of shloksData || []) {
        setProgress(prev => ({ ...prev, currentShlok: `Verse ${shlok.verse_number}` }));

        for (const field of selectedFields) {
          try {
            // Skip if field already has content
            const fieldName = fieldOptions.find(f => f.key === field)?.fieldName;
            if (fieldName && shlok[fieldName]) {
              setProgress(prev => ({ ...prev, current: prev.current + 1 }));
              successCount++;
              continue;
            }

            const content = await generateAIContent(field, {
              sanskrit_text: shlok.sanskrit_text,
              english_meaning: shlok.english_meaning,
              verse_content: shlok.english_meaning || shlok.sanskrit_text,
              story_type: shlok.story_type || 'corporate',
            });

            if (content && fieldName) {
              await supabase
                .from('shloks')
                .update({ [fieldName]: content })
                .eq('id', shlok.id);

              successCount++;
            }
          } catch (err) {
            console.error(`Failed to generate ${field} for shlok ${shlok.id}:`, err);
            failedCount++;
          }

          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          setResults({ success: successCount, failed: failedCount });

          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast({
        title: 'Bulk Generation Complete',
        description: `Generated ${successCount} fields. ${failedCount > 0 ? `${failedCount} failed.` : ''}`,
      });

      onComplete();
    } catch (error) {
      console.error('Bulk generation failed:', error);
      toast({
        title: 'Error',
        description: 'Bulk generation encountered an error',
        variant: 'destructive',
      });
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
            <Sparkles className="h-5 w-5" />
            AI Fill Missing Content
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate AI content for {selectedShlokIds.length} selected shlok(s).
            Only empty fields will be filled.
          </p>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Select fields to generate:</Label>
            <div className="grid grid-cols-2 gap-3">
              {fieldOptions.map(option => (
                <div key={option.key} className="flex items-center gap-2">
                  <Checkbox
                    id={option.key}
                    checked={selectedFields.includes(option.key)}
                    onCheckedChange={(checked) => handleFieldToggle(option.key, !!checked)}
                    disabled={isGenerating}
                  />
                  <Label htmlFor={option.key} className="text-sm cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{progress.currentShlok}</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex gap-4">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  {results.success} success
                </Badge>
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
          <Button onClick={handleGenerate} disabled={isGenerating || selectedFields.length === 0}>
            {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isGenerating ? 'Generating...' : 'Start Generation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
