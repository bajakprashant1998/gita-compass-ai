import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, ArrowLeft, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { updateChapter, logActivity, generateAIContentWithMeta } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';
import { AIGenerateButton } from '@/components/admin/AIGenerateButton';

interface ChapterData {
  id: string;
  chapter_number: number;
  title_english: string;
  title_hindi?: string;
  title_sanskrit?: string;
  theme: string;
  description_english?: string;
  description_hindi?: string;
}

export default function AdminChapterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ChapterData>({
    id: '',
    chapter_number: 1,
    title_english: '',
    title_hindi: '',
    title_sanskrit: '',
    theme: '',
    description_english: '',
    description_hindi: '',
  });

  useEffect(() => {
    const loadChapter = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setFormData(data as ChapterData);
        }
      } catch (error) {
        console.error('Failed to load chapter:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chapter',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadChapter();
  }, [id, toast]);

  const handleChange = (field: keyof ChapterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateDescriptions = async () => {
    if (!formData.title_english || !formData.theme) {
      toast({
        title: 'Need Title & Theme',
        description: 'Please enter title and theme first',
        variant: 'destructive',
      });
      return '';
    }

    const result = await generateAIContentWithMeta('chapter_description', {
      chapter_title: formData.title_english,
      chapter_theme: formData.theme,
    });

    if (result.description_english) {
      handleChange('description_english', result.description_english as string);
    }
    if (result.description_hindi) {
      handleChange('description_hindi', result.description_hindi as string);
    }

    toast({ title: 'Generated', description: 'Descriptions generated successfully' });
    return result.content as string || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_english || !formData.theme) {
      toast({
        title: 'Validation Error',
        description: 'Title and theme are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      await updateChapter(id!, {
        title_english: formData.title_english,
        title_hindi: formData.title_hindi,
        title_sanskrit: formData.title_sanskrit,
        theme: formData.theme,
        description_english: formData.description_english,
        description_hindi: formData.description_hindi,
      });

      await logActivity('update', 'chapter', id!, undefined, formData as unknown as Record<string, unknown>);

      toast({
        title: 'Success',
        description: 'Chapter updated successfully',
      });

      navigate('/admin/chapters');
    } catch (error) {
      console.error('Failed to save chapter:', error);
      toast({
        title: 'Error',
        description: 'Failed to save chapter',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Edit Chapter" />
        <div className="container flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={`Edit Chapter ${formData.chapter_number}`}
        subtitle={formData.title_english}
      />
      <div className="container">
        <div className="max-w-3xl">
          <Button variant="ghost" onClick={() => navigate('/admin/chapters')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chapters
          </Button>

          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Chapter Titles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title_english">English Title *</Label>
                  <Input
                    id="title_english"
                    value={formData.title_english}
                    onChange={(e) => handleChange('title_english', e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_hindi">Hindi Title</Label>
                    <Input
                      id="title_hindi"
                      value={formData.title_hindi || ''}
                      onChange={(e) => handleChange('title_hindi', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title_sanskrit">Sanskrit Title</Label>
                    <Input
                      id="title_sanskrit"
                      className="font-serif"
                      value={formData.title_sanskrit || ''}
                      onChange={(e) => handleChange('title_sanskrit', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Theme & Descriptions</CardTitle>
                  <AIGenerateButton
                    label="Generate Both"
                    disabled={!formData.title_english || !formData.theme}
                    onGenerate={handleGenerateDescriptions}
                    onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme *</Label>
                  <Input
                    id="theme"
                    placeholder="e.g., The Yoga of Despondency"
                    value={formData.theme}
                    onChange={(e) => handleChange('theme', e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="desc_en">Description (English)</Label>
                    <Textarea
                      id="desc_en"
                      className="min-h-[150px]"
                      placeholder="English description of the chapter..."
                      value={formData.description_english || ''}
                      onChange={(e) => handleChange('description_english', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc_hi">Description (Hindi)</Label>
                    <Textarea
                      id="desc_hi"
                      className="min-h-[150px]"
                      placeholder="अध्याय का हिंदी विवरण..."
                      value={formData.description_hindi || ''}
                      onChange={(e) => handleChange('description_hindi', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Update Chapter
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
