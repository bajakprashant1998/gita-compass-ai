import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSEOFields } from '@/components/admin/AdminSEOFields';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
        subtitle="Manage meta titles, descriptions, and keywords for static pages"
      />
      <div className="container">
        <div className="max-w-3xl space-y-6">
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
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
