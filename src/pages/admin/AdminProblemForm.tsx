import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { AdminSEOFields } from '@/components/admin/AdminSEOFields';
import { supabase } from '@/integrations/supabase/client';
import { createProblem, updateProblem, logActivity } from '@/lib/adminApi';
import type { AdminProblem, ProblemCategory } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

const categories: { value: ProblemCategory; label: string }[] = [
  { value: 'mental', label: 'Mental / Emotional' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'ethics', label: 'Ethics / Dharma' },
  { value: 'career', label: 'Career / Work' },
  { value: 'relationships', label: 'Relationships' },
];

export default function AdminProblemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<AdminProblem> & { meta_title?: string; meta_description?: string; meta_keywords?: string[] }>({
    name: '',
    slug: '',
    description_english: '',
    description_hindi: '',
    icon: '',
    color: '',
    category: 'mental',
    display_order: 0,
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
  });

  useEffect(() => {
    const loadProblem = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('problems')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setFormData(data as unknown as AdminProblem);
        }
      } catch (error) {
        console.error('Failed to load problem:', error);
        toast({
          title: 'Error',
          description: 'Failed to load problem',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProblem();
  }, [id, toast]);

  const handleChange = (field: keyof AdminProblem, value: unknown) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug from name
      if (field === 'name' && typeof value === 'string') {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast({
        title: 'Validation Error',
        description: 'Name and slug are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (isEdit && id) {
        await updateProblem(id, formData);
        await logActivity('update', 'problem', id, undefined, formData as Record<string, unknown>);
      } else {
        const created = await createProblem(formData);
        await logActivity('create', 'problem', created.id, undefined, formData as Record<string, unknown>);
      }

      toast({
        title: 'Success',
        description: isEdit ? 'Problem updated' : 'Problem created',
      });

      navigate('/admin/problems');
    } catch (error) {
      console.error('Failed to save problem:', error);
      toast({
        title: 'Error',
        description: 'Failed to save problem',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminHeader title={isEdit ? 'Edit Problem' : 'Create Problem'} />
        <div className="container flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={isEdit ? `Edit: ${formData.name}` : 'Create Problem Tag'}
        subtitle={isEdit ? 'Update problem details' : 'Add a new problem category'}
      />
      <div className="container">
        <div className="max-w-2xl">
          <Button variant="ghost" onClick={() => navigate('/admin/problems')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Problems
          </Button>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Problem Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (English) *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Fear Before Decision"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">SEO Slug *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">/problems/</span>
                    <Input
                      id="slug"
                      placeholder="fear-before-decision"
                      value={formData.slug}
                      onChange={(e) => handleChange('slug', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange('category', value as ProblemCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="desc_en">Description (English)</Label>
                    <Textarea
                      id="desc_en"
                      placeholder="English description..."
                      value={formData.description_english || ''}
                      onChange={(e) => handleChange('description_english', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc_hi">Description (Hindi)</Label>
                    <Textarea
                      id="desc_hi"
                      placeholder="हिंदी विवरण..."
                      value={formData.description_hindi || ''}
                      onChange={(e) => handleChange('description_hindi', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon Name</Label>
                    <Input
                      id="icon"
                      placeholder="e.g., Brain"
                      value={formData.icon || ''}
                      onChange={(e) => handleChange('icon', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color || '#6366f1'}
                      onChange={(e) => handleChange('color', e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      min={0}
                      value={formData.display_order}
                      onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Section */}
            <AdminSEOFields
              metaTitle={formData.meta_title || ''}
              metaDescription={formData.meta_description || ''}
              metaKeywords={formData.meta_keywords || []}
              onMetaTitleChange={(v) => setFormData(prev => ({ ...prev, meta_title: v }))}
              onMetaDescriptionChange={(v) => setFormData(prev => ({ ...prev, meta_description: v }))}
              onMetaKeywordsChange={(v) => setFormData(prev => ({ ...prev, meta_keywords: v }))}
              pageUrl={`bhagavadgitagyan.com/problems/${formData.slug}`}
            />

            <div className="flex items-center gap-4 mt-6">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isEdit ? 'Update Problem' : 'Create Problem'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
