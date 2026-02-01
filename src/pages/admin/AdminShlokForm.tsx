import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import {
  getShlokById,
  createShlok,
  updateShlok,
  getChapters,
  getAdminProblems,
  updateShlokProblems,
  logActivity,
} from '@/lib/adminApi';
import type { AdminShlok, AdminProblem, ShlokStatus, StoryType } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

interface ProblemMapping {
  id: string;
  name: string;
  selected: boolean;
  relevance_score: number;
}

export default function AdminShlokForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [chapters, setChapters] = useState<{ id: string; chapter_number: number; title_english: string }[]>([]);
  const [problemMappings, setProblemMappings] = useState<ProblemMapping[]>([]);

  const [formData, setFormData] = useState<Partial<AdminShlok>>({
    chapter_id: '',
    verse_number: 1,
    sanskrit_text: '',
    transliteration: '',
    hindi_meaning: '',
    english_meaning: '',
    life_application: '',
    practical_action: '',
    modern_story: '',
    problem_context: '',
    solution_gita: '',
    status: 'draft',
    story_type: 'corporate',
    sanskrit_audio_url: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [chaptersData, problemsData] = await Promise.all([
          getChapters(),
          getAdminProblems(),
        ]);

        setChapters(chaptersData);

        // Initialize problem mappings
        const mappings = problemsData.map(p => ({
          id: p.id,
          name: p.name,
          selected: false,
          relevance_score: 5,
        }));

        if (id) {
          const shlok = await getShlokById(id);
          if (shlok) {
            setFormData(shlok);

            // Update problem mappings with existing data
            const updatedMappings = mappings.map(m => {
              const existing = shlok.problems?.find(p => p.id === m.id);
              if (existing) {
                return {
                  ...m,
                  selected: true,
                  relevance_score: existing.relevance_score,
                };
              }
              return m;
            });
            setProblemMappings(updatedMappings);
          }
        } else {
          setProblemMappings(mappings);
          if (chaptersData.length > 0) {
            setFormData(prev => ({ ...prev, chapter_id: chaptersData[0].id }));
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, toast]);

  const handleChange = (field: keyof AdminShlok, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProblemToggle = (problemId: string, checked: boolean) => {
    setProblemMappings(prev =>
      prev.map(p =>
        p.id === problemId ? { ...p, selected: checked } : p
      )
    );
  };

  const handleRelevanceChange = (problemId: string, score: number) => {
    setProblemMappings(prev =>
      prev.map(p =>
        p.id === problemId ? { ...p, relevance_score: score } : p
      )
    );
  };

  const handleSubmit = async (status: ShlokStatus) => {
    if (!formData.chapter_id || !formData.sanskrit_text || !formData.english_meaning) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const dataToSave = { ...formData, status };
      let savedShlok: AdminShlok;

      if (isEdit && id) {
        savedShlok = await updateShlok(id, dataToSave);
        await logActivity('update', 'shlok', id, undefined, dataToSave as Record<string, unknown>);
      } else {
        savedShlok = await createShlok(dataToSave);
        await logActivity('create', 'shlok', savedShlok.id, undefined, dataToSave as Record<string, unknown>);
      }

      // Update problem mappings
      const selectedProblems = problemMappings
        .filter(p => p.selected)
        .map(p => ({ id: p.id, relevance_score: p.relevance_score }));

      await updateShlokProblems(savedShlok.id, selectedProblems);

      toast({
        title: 'Success',
        description: isEdit ? 'Shlok updated successfully' : 'Shlok created successfully',
      });

      navigate('/admin/shloks');
    } catch (error) {
      console.error('Failed to save shlok:', error);
      toast({
        title: 'Error',
        description: 'Failed to save shlok',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedChapter = chapters.find(c => c.id === formData.chapter_id);

  if (isLoading) {
    return (
      <AdminLayout title={isEdit ? 'Edit Shlok' : 'Create Shlok'}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? `Edit Shlok ${selectedChapter ? `${selectedChapter.chapter_number}.${formData.verse_number}` : ''}` : 'Create New Shlok'}
      subtitle={isEdit ? 'Update shlok content and mappings' : 'Add a new shlok to the database'}
    >
      <div className="max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/admin/shloks')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shloks
        </Button>

        <Tabs defaultValue="core" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="core">Core</TabsTrigger>
            <TabsTrigger value="meanings">Meanings</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="story">Story</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          {/* Tab 1: Core Information */}
          <TabsContent value="core">
            <Card>
              <CardHeader>
                <CardTitle>Core Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapter">Chapter *</Label>
                    <Select
                      value={formData.chapter_id}
                      onValueChange={(value) => handleChange('chapter_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map(ch => (
                          <SelectItem key={ch.id} value={ch.id}>
                            Chapter {ch.chapter_number}: {ch.title_english}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verse">Verse Number *</Label>
                    <Input
                      id="verse"
                      type="number"
                      min={1}
                      value={formData.verse_number}
                      onChange={(e) => handleChange('verse_number', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sanskrit">Sanskrit Text *</Label>
                  <Textarea
                    id="sanskrit"
                    className="font-serif text-lg min-h-[120px]"
                    placeholder="Enter Sanskrit text..."
                    value={formData.sanskrit_text}
                    onChange={(e) => handleChange('sanskrit_text', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transliteration">Transliteration</Label>
                  <Textarea
                    id="transliteration"
                    placeholder="Enter transliteration..."
                    value={formData.transliteration || ''}
                    onChange={(e) => handleChange('transliteration', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audio">Sanskrit Audio URL</Label>
                  <Input
                    id="audio"
                    type="url"
                    placeholder="https://..."
                    value={formData.sanskrit_audio_url || ''}
                    onChange={(e) => handleChange('sanskrit_audio_url', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Meanings */}
          <TabsContent value="meanings">
            <Card>
              <CardHeader>
                <CardTitle>Meanings (Hindi & English)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hindi">Hindi Meaning</Label>
                    <Textarea
                      id="hindi"
                      className="min-h-[200px]"
                      placeholder="हिंदी अर्थ..."
                      value={formData.hindi_meaning || ''}
                      onChange={(e) => handleChange('hindi_meaning', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="english">English Meaning *</Label>
                    <Textarea
                      id="english"
                      className="min-h-[200px]"
                      placeholder="English meaning..."
                      value={formData.english_meaning}
                      onChange={(e) => handleChange('english_meaning', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Problem Mapping */}
          <TabsContent value="problems">
            <Card>
              <CardHeader>
                <CardTitle>Problem Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {problemMappings.map(problem => (
                    <div
                      key={problem.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <Checkbox
                        id={problem.id}
                        checked={problem.selected}
                        onCheckedChange={(checked) => handleProblemToggle(problem.id, !!checked)}
                      />
                      <Label htmlFor={problem.id} className="flex-1 cursor-pointer">
                        {problem.name}
                      </Label>
                      {problem.selected && (
                        <div className="flex items-center gap-4 w-48">
                          <Slider
                            value={[problem.relevance_score]}
                            min={1}
                            max={10}
                            step={1}
                            onValueChange={([value]) => handleRelevanceChange(problem.id, value)}
                          />
                          <Badge variant="outline" className="w-12 justify-center">
                            {problem.relevance_score}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Solution Section */}
          <TabsContent value="solution">
            <Card>
              <CardHeader>
                <CardTitle>Solution & Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="problem_context">Problem Context</Label>
                  <Textarea
                    id="problem_context"
                    className="min-h-[100px]"
                    placeholder="What problem does this shlok address?"
                    value={formData.problem_context || ''}
                    onChange={(e) => handleChange('problem_context', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solution_gita">Gita-Based Solution</Label>
                  <Textarea
                    id="solution_gita"
                    className="min-h-[100px]"
                    placeholder="What solution does the Gita offer?"
                    value={formData.solution_gita || ''}
                    onChange={(e) => handleChange('solution_gita', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="life_application">Life Application</Label>
                  <Textarea
                    id="life_application"
                    className="min-h-[100px]"
                    placeholder="How to apply this in daily life?"
                    value={formData.life_application || ''}
                    onChange={(e) => handleChange('life_application', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="practical_action">Practical Action</Label>
                  <Textarea
                    id="practical_action"
                    className="min-h-[100px]"
                    placeholder="Specific action steps..."
                    value={formData.practical_action || ''}
                    onChange={(e) => handleChange('practical_action', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Story */}
          <TabsContent value="story">
            <Card>
              <CardHeader>
                <CardTitle>Modern Story</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="story_type">Story Type</Label>
                  <Select
                    value={formData.story_type || 'corporate'}
                    onValueChange={(value) => handleChange('story_type', value as StoryType)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="youth">Youth</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modern_story">Story Content</Label>
                  <Textarea
                    id="modern_story"
                    className="min-h-[300px]"
                    placeholder="Write a modern story (200-300 words) that illustrates this shlok's teaching..."
                    value={formData.modern_story || ''}
                    onChange={(e) => handleChange('modern_story', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    {(formData.modern_story || '').split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 6: Status */}
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Publication Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant={formData.status === 'draft' ? 'default' : 'outline'}
                    className="h-24 flex-col gap-2"
                    onClick={() => handleChange('status', 'draft')}
                  >
                    <span className="text-lg">📝</span>
                    <span>Draft</span>
                  </Button>
                  <Button
                    variant={formData.status === 'published' ? 'default' : 'outline'}
                    className="h-24 flex-col gap-2"
                    onClick={() => handleChange('status', 'published')}
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span>Published</span>
                  </Button>
                  <Button
                    variant={formData.status === 'scheduled' ? 'default' : 'outline'}
                    className="h-24 flex-col gap-2"
                    onClick={() => handleChange('status', 'scheduled')}
                  >
                    <span className="text-lg">📅</span>
                    <span>Scheduled</span>
                  </Button>
                </div>

                {formData.status === 'scheduled' && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date">Scheduled Publish Date</Label>
                    <Input
                      id="scheduled_date"
                      type="datetime-local"
                      value={formData.scheduled_publish_at?.slice(0, 16) || ''}
                      onChange={(e) => handleChange('scheduled_publish_at', new Date(e.target.value).toISOString())}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Buttons */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('published')}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Publish
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
