import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIGenerateButton } from '@/components/admin/AIGenerateButton';

interface AdminSEOFieldsProps {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onMetaKeywordsChange: (value: string[]) => void;
  pageUrl?: string;
  onGenerateSEO?: () => Promise<string | void>;
}

function CharCounter({ current, max, warn }: { current: number; max: number; warn: number }) {
  const color = current > max ? 'text-destructive' : current > warn ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400';
  return <span className={cn('text-xs font-medium tabular-nums', color)}>{current}/{max}</span>;
}

export function AdminSEOFields({
  metaTitle,
  metaDescription,
  metaKeywords,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onMetaKeywordsChange,
  pageUrl = 'bhagavadgitagyan.com',
  onGenerateSEO,
}: AdminSEOFieldsProps) {
  const [keywordInput, setKeywordInput] = useState('');

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !metaKeywords.includes(trimmed)) {
      onMetaKeywordsChange([...metaKeywords, trimmed]);
    }
    setKeywordInput('');
  };

  const removeKeyword = (keyword: string) => {
    onMetaKeywordsChange(metaKeywords.filter(k => k !== keyword));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword();
    }
  };

  const serpTitle = metaTitle || 'Page Title - Bhagavad Gita Gyan';
  const serpDescription = metaDescription || 'Page description will appear here...';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Settings
          </CardTitle>
          {onGenerateSEO && (
            <AIGenerateButton
              label="Generate SEO"
              onGenerate={onGenerateSEO}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Meta Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="meta_title">Meta Title</Label>
            <CharCounter current={metaTitle.length} max={60} warn={50} />
          </div>
          <Input
            id="meta_title"
            placeholder="Custom page title for search engines..."
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            className={cn(metaTitle.length > 60 && 'border-destructive')}
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="meta_description">Meta Description</Label>
            <CharCounter current={metaDescription.length} max={160} warn={140} />
          </div>
          <Textarea
            id="meta_description"
            placeholder="Custom description for search engines..."
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            className={cn('min-h-[80px]', metaDescription.length > 160 && 'border-destructive')}
          />
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label htmlFor="meta_keywords">Keywords</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {metaKeywords.map(keyword => (
              <Badge key={keyword} variant="secondary" className="gap-1 pr-1">
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="ml-1 p-0.5 rounded-full hover:bg-destructive/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Input
            id="meta_keywords"
            placeholder="Type keyword and press Enter..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
            onBlur={addKeyword}
          />
        </div>

        {/* Google SERP Preview */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Google Preview</Label>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-blue-600 dark:text-blue-400 text-lg font-medium leading-tight truncate">
              {serpTitle.length > 60 ? serpTitle.substring(0, 57) + '...' : serpTitle}
            </div>
            <div className="text-green-700 dark:text-green-400 text-sm mt-1">
              {pageUrl}
            </div>
            <div className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {serpDescription.length > 160 ? serpDescription.substring(0, 157) + '...' : serpDescription}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
