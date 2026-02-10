import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSEOFields } from '@/components/admin/AdminSEOFields';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Check, Sparkles, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateAIContentWithMeta } from '@/lib/adminApi';
import { BulkSEOGenerateModal } from '@/components/admin/BulkSEOGenerateModal';
import { Progress } from '@/components/ui/progress';

interface StaticPageSEO {
  id?: string;
  page_identifier: string;
  label: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
}

const STATIC_PAGES = [
  { page_identifier: '/', label: 'Homepage' },
  { page_identifier: '/chat', label: 'Talk to Krishna' },
  { page_identifier: '/problems', label: 'Life Problems' },
  { page_identifier: '/chapters', label: 'All Chapters' },
  { page_identifier: '/contact', label: 'Contact' },
  { page_identifier: '/donate', label: 'Donate' },
  { page_identifier: '/dashboard', label: 'Dashboard' },
];

export default function AdminSEOPages() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [pages, setPages] = useState<StaticPageSEO[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [genProgress, setGenProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const loadSEOData = async () => {
      try {
        const { data, error } = await supabase
          .from('page_seo_metadata')
          .select('*')
          .eq('page_type', 'static');

        if (error) throw error;

        const merged = STATIC_PAGES.map(sp => {
          const existing = data?.find(d => d.page_identifier === sp.page_identifier);
          return {
            id: existing?.id,
            page_identifier: sp.page_identifier,
            label: sp.label,
            meta_title: existing?.meta_title || '',
            meta_description: existing?.meta_description || '',
            meta_keywords: existing?.meta_keywords || [],
          };
        });

        setPages(merged);
      } catch (error) {
        console.error('Failed to load SEO data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSEOData();
  }, []);

  const handleSave = async (page: StaticPageSEO) => {
    setSaving(page.page_identifier);
    try {
      const upsertData = {
        page_type: 'static',
        page_identifier: page.page_identifier,
        meta_title: page.meta_title || null,
        meta_description: page.meta_description || null,
        meta_keywords: page.meta_keywords.length > 0 ? page.meta_keywords : null,
      };

      const { error } = await supabase
        .from('page_seo_metadata')
        .upsert(upsertData, { onConflict: 'page_type,page_identifier' });

      if (error) throw error;

      toast({ title: 'Saved', description: `SEO updated for ${page.label}` });
    } catch (error) {
      console.error('Failed to save SEO:', error);
      toast({ title: 'Error', description: 'Failed to save SEO data', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const updatePage = (identifier: string, field: string, value: unknown) => {
    setPages(prev =>
      prev.map(p =>
        p.page_identifier === identifier ? { ...p, [field]: value } : p
      )
    );
  };

  const handleGenerateAllAndSave = useCallback(async () => {
    setGeneratingAll(true);
    const total = pages.length;
    setGenProgress({ current: 0, total });
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      setGenProgress({ current: i + 1, total });

      try {
        // Generate SEO via AI
        const result = await generateAIContentWithMeta('generate_seo', {
          page_title: page.label,
          page_content: `${page.label} page of Bhagavad Gita Gyan website`,
          page_url: `bhagavadgitagyan.com${page.page_identifier === '/' ? '' : page.page_identifier}`,
        });

        const newTitle = (result.meta_title as string) || page.meta_title;
        const newDesc = (result.meta_description as string) || page.meta_description;
        const newKeywords: string[] = (result.meta_keywords && Array.isArray(result.meta_keywords))
          ? result.meta_keywords as string[]
          : page.meta_keywords;

        // Update local state
        setPages(prev => prev.map(p =>
          p.page_identifier === page.page_identifier
            ? { ...p, meta_title: newTitle, meta_description: newDesc, meta_keywords: newKeywords }
            : p
        ));

        // Save to database
        const upsertPayload: any = {
          page_type: 'static' as const,
          page_identifier: page.page_identifier,
          meta_title: newTitle || null,
          meta_description: newDesc || null,
          meta_keywords: newKeywords.length > 0 ? newKeywords : null,
        };

        const { error } = await supabase
          .from('page_seo_metadata')
          .upsert(upsertPayload, { onConflict: 'page_type,page_identifier' });

        if (error) throw error;
        successCount++;
      } catch (err) {
        console.error(`Failed to generate/save SEO for ${page.label}:`, err);
        failCount++;
      }

      // Rate limit delay
      if (i < pages.length - 1) {
        await new Promise(r => setTimeout(r, 800));
      }
    }

    setGeneratingAll(false);
    toast({
      title: 'Bulk Generation Complete',
      description: `${successCount} saved, ${failCount} failed out of ${total} pages.`,
    });
  }, [pages, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="SEO Management" />
        <div className="container flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="SEO Management"
        subtitle="Manage meta titles, descriptions, and keywords for all pages"
      />
      <div className="container">
        <div className="max-w-3xl space-y-6">
          <div className="flex flex-wrap gap-3 justify-end">
            <Button
              onClick={handleGenerateAllAndSave}
              disabled={generatingAll}
              className="gap-2"
            >
              {generatingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating {genProgress.current}/{genProgress.total}...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate All SEO &amp; Save
                </>
              )}
            </Button>
            <Button onClick={() => setShowBulkModal(true)} variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Bulk Generate SEO (Chapters/Shloks/Problems)
            </Button>
          </div>

          {generatingAll && (
            <div className="space-y-2">
              <Progress value={(genProgress.current / genProgress.total) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Processing {genProgress.current} of {genProgress.total} pages...
              </p>
            </div>
          )}

          {pages.map(page => (
            <div key={page.page_identifier}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">
                  {page.label}
                  <span className="text-sm text-muted-foreground ml-2 font-mono">{page.page_identifier}</span>
                </h3>
                <Button
                  size="sm"
                  onClick={() => handleSave(page)}
                  disabled={saving === page.page_identifier}
                >
                  {saving === page.page_identifier ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
              </div>
              <AdminSEOFields
                metaTitle={page.meta_title}
                metaDescription={page.meta_description}
                metaKeywords={page.meta_keywords}
                onMetaTitleChange={(v) => updatePage(page.page_identifier, 'meta_title', v)}
                onMetaDescriptionChange={(v) => updatePage(page.page_identifier, 'meta_description', v)}
                onMetaKeywordsChange={(v) => updatePage(page.page_identifier, 'meta_keywords', v)}
                pageUrl={`bhagavadgitagyan.com${page.page_identifier === '/' ? '' : page.page_identifier}`}
                onGenerateSEO={async () => {
                  const result = await generateAIContentWithMeta('generate_seo', {
                    page_title: page.label,
                    page_content: `${page.label} page of Bhagavad Gita Gyan website`,
                    page_url: `bhagavadgitagyan.com${page.page_identifier === '/' ? '' : page.page_identifier}`,
                  });
                  if (result.meta_title) updatePage(page.page_identifier, 'meta_title', result.meta_title);
                  if (result.meta_description) updatePage(page.page_identifier, 'meta_description', result.meta_description);
                  if (result.meta_keywords && Array.isArray(result.meta_keywords)) {
                    updatePage(page.page_identifier, 'meta_keywords', result.meta_keywords);
                  }
                  toast({ title: 'Generated', description: `SEO generated for ${page.label}` });
                  return '';
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <BulkSEOGenerateModal
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
      />
    </div>
  );
}
