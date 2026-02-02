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
import { Loader2, Save, ArrowLeft, CheckCircle, Plus, Sparkles, Settings, Languages, Volume2 } from 'lucide-react';
import {
  getShlokById,
  createShlok,
  updateShlok,
  getChapters,
  getAdminProblems,
  updateShlokProblems,
  logActivity,
  generateAIContent,
  generateAIContentWithMeta,
} from '@/lib/adminApi';
import type { AdminShlok, AdminProblem, ShlokStatus, StoryType, StoryTypeConfig } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import { AIGenerateButton } from '@/components/admin/AIGenerateButton';
import { AddProblemModal } from '@/components/admin/AddProblemModal';
import { StoryTypeManager } from '@/components/admin/StoryTypeManager';
import { supabase } from '@/integrations/supabase/client';
import { generateTTS, playBase64Audio } from '@/lib/adminSettings';

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
  const [storyTypes, setStoryTypes] = useState<StoryTypeConfig[]>([]);
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [showStoryTypeManager, setShowStoryTypeManager] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

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

  const loadStoryTypes = async () => {
    const { data } = await supabase
      .from('story_types')
      .select('*')
      .order('display_order', { ascending: true });
    setStoryTypes((data || []) as StoryTypeConfig[]);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [chaptersData, problemsData] = await Promise.all([
          getChapters(),
          getAdminProblems(),
        ]);

        setChapters(chaptersData);
        loadStoryTypes();

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

  const handleProblemCreated = (newProblem: { id: string; name: string }) => {
    setProblemMappings(prev => [
      ...prev,
      { id: newProblem.id, name: newProblem.name, selected: true, relevance_score: 7 },
    ]);
  };

  const handleSubmit = async (status: ShlokStatus) => {
    if (!formData.chapter_id || !formData.sanskrit_text) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in Chapter and Sanskrit Text',
        variant: 'destructive',
      });
      return;
    }
    
    // Set a default english_meaning if not provided (required by DB)
    const dataToSubmit = {
      ...formData,
      english_meaning: formData.english_meaning || 'Pending translation',
    };

    setIsSaving(true);

    try {
      const dataToSave = { ...dataToSubmit, status };
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
        description: 'Shlok saved successfully',
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

  // AI Generation handlers - now with chapter/verse context
  const handleAIGenerate = async (
    type: 'transliteration' | 'hindi_meaning' | 'english_meaning' | 'translate_hindi_to_english' | 'problem_context' | 'solution_gita' | 'life_application' | 'practical_action' | 'modern_story',
    field: keyof AdminShlok
  ) => {
    const content = await generateAIContent(type, {
      sanskrit_text: formData.sanskrit_text,
      english_meaning: formData.english_meaning,
      hindi_meaning: formData.hindi_meaning,
      verse_content: formData.english_meaning || formData.sanskrit_text,
      story_type: formData.story_type || 'corporate',
      chapter_number: selectedChapter?.chapter_number,
      verse_number: formData.verse_number,
    });
    handleChange(field, content);
    toast({ title: 'Generated', description: `${field.replace(/_/g, ' ')} generated successfully` });
    return content;
  };

  // Translate Hindi to English
  const handleTranslateToEnglish = async () => {
    if (!formData.hindi_meaning) {
      toast({ title: 'No Hindi', description: 'Please enter or generate Hindi meaning first', variant: 'destructive' });
      return '';
    }
    const content = await generateAIContent('translate_hindi_to_english', {
      hindi_meaning: formData.hindi_meaning,
      chapter_number: selectedChapter?.chapter_number,
      verse_number: formData.verse_number,
    });
    handleChange('english_meaning', content);
    toast({ title: 'Translated', description: 'Hindi meaning translated to English' });
    return content;
  };

  // Play TTS audio for Sanskrit
  const handlePlaySanskritAudio = async () => {
    if (!formData.sanskrit_text) {
      toast({ title: 'No Text', description: 'Please enter Sanskrit text first', variant: 'destructive' });
      return;
    }
    setPlayingAudio(true);
    try {
      const result = await generateTTS(formData.sanskrit_text, 'sanskrit');
      playBase64Audio(result.audioContent);
      toast({ title: 'Playing Audio', description: 'Sanskrit verse audio is playing...' });
    } catch (error) {
      toast({
        title: 'Audio Generation Failed',
        description: error instanceof Error ? error.message : 'Check ElevenLabs API key in Settings',
        variant: 'destructive',
      });
    } finally {
      setPlayingAudio(false);
    }
  };

  const handleGenerateAllSolutions = async () => {
    const fields = ['problem_context', 'solution_gita', 'life_application', 'practical_action'] as const;
    for (const field of fields) {
      await handleAIGenerate(field, field);
    }
    toast({ title: 'Done', description: 'All solution fields generated' });
  };

  const handleSuggestProblems = async () => {
    const result = await generateAIContentWithMeta('suggest_problems', {
      verse_content: formData.english_meaning || formData.sanskrit_text,
      existing_problems: problemMappings.map(p => ({ name: p.name, category: 'general' })),
      chapter_number: selectedChapter?.chapter_number,
      verse_number: formData.verse_number,
    });

    if (result.problems && Array.isArray(result.problems)) {
      const suggestions = result.problems as Array<{ name: string; relevance_score?: number }>;
      
      // Match suggestions to existing problems
      const updatedMappings = problemMappings.map(pm => {
        const suggestion = suggestions.find(s => 
          s.name.toLowerCase().includes(pm.name.toLowerCase()) ||
          pm.name.toLowerCase().includes(s.name.toLowerCase())
        );
        if (suggestion) {
          return { ...pm, selected: true, relevance_score: suggestion.relevance_score || 7 };
        }
        return pm;
      });
      
      setProblemMappings(updatedMappings);
      toast({ title: 'Suggestions Applied', description: `Found ${suggestions.length} relevant problems` });
    }
    return '';
  };

  const handleSuggestStoryType = async () => {
    if (!formData.modern_story && !formData.english_meaning) {
      toast({ title: 'Need Content', description: 'Add story or meaning first', variant: 'destructive' });
      return '';
    }
    const suggestion = await generateAIContent('suggest_story_type', {
      story_content: formData.modern_story || formData.english_meaning,
      chapter_number: selectedChapter?.chapter_number,
      verse_number: formData.verse_number,
    });
    const storyType = suggestion.toLowerCase().trim() as StoryType;
    if (['corporate', 'family', 'youth', 'global'].includes(storyType)) {
      handleChange('story_type', storyType);
      toast({ title: 'Type Suggested', description: `Suggested: ${storyType}` });
    }
    return suggestion;
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="transliteration">Transliteration</Label>
                    <AIGenerateButton
                      label="Generate"
                      disabled={!formData.sanskrit_text}
                      onGenerate={() => handleAIGenerate('transliteration', 'transliteration')}
                      onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                    />
                  </div>
                  <Textarea
                    id="transliteration"
                    placeholder="Enter transliteration..."
                    value={formData.transliteration || ''}
                    onChange={(e) => handleChange('transliteration', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="audio">Sanskrit Audio URL</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlaySanskritAudio}
                      disabled={playingAudio || !formData.sanskrit_text}
                    >
                      {playingAudio ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Volume2 className="h-4 w-4 mr-1" />
                      )}
                      Preview TTS
                    </Button>
                  </div>
                  <Input
                    id="audio"
                    type="url"
                    placeholder="https://..."
                    value={formData.sanskrit_audio_url || ''}
                    onChange={(e) => handleChange('sanskrit_audio_url', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Use "Preview TTS" to hear AI-generated audio (requires ElevenLabs API key in Settings)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Meanings */}
          <TabsContent value="meanings">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Meanings (Hindi & English)</CardTitle>
                  <AIGenerateButton
                    label="Translate Hindi → English"
                    icon={<Languages className="h-4 w-4 mr-1" />}
                    disabled={!formData.hindi_meaning}
                    onGenerate={handleTranslateToEnglish}
                    onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hindi">Hindi Meaning (Primary)</Label>
                      <AIGenerateButton
                        label="Generate Hindi"
                        disabled={!formData.sanskrit_text}
                        onGenerate={() => handleAIGenerate('hindi_meaning', 'hindi_meaning')}
                        onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                      />
                    </div>
                    <Textarea
                      id="hindi"
                      className="min-h-[200px]"
                      placeholder="हिंदी अर्थ..."
                      value={formData.hindi_meaning || ''}
                      onChange={(e) => handleChange('hindi_meaning', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Generate Hindi first, then translate to English for accuracy
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="english">English Meaning *</Label>
                      <AIGenerateButton
                        label="Generate English"
                        disabled={!formData.sanskrit_text}
                        onGenerate={() => handleAIGenerate('english_meaning', 'english_meaning')}
                        onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                      />
                    </div>
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
                <div className="flex items-center justify-between">
                  <CardTitle>Problem Mapping</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAddProblem(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Problem
                    </Button>
                    <AIGenerateButton
                      label="Suggest Problems"
                      disabled={!formData.english_meaning && !formData.sanskrit_text}
                      onGenerate={handleSuggestProblems}
                      onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                    />
                  </div>
                </div>
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
                  {problemMappings.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No problems found. Create one to start mapping.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Solution Section */}
          <TabsContent value="solution">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Solution & Application</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleGenerateAllSolutions} disabled={!formData.english_meaning}>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Generate All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="problem_context">Problem Context</Label>
                    <AIGenerateButton
                      label="Generate"
                      disabled={!formData.english_meaning}
                      onGenerate={() => handleAIGenerate('problem_context', 'problem_context')}
                      onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                    />
                  </div>
                  <Textarea
                    id="problem_context"
                    className="min-h-[100px]"
                    placeholder="What problem does this shlok address?"
                    value={formData.problem_context || ''}
                    onChange={(e) => handleChange('problem_context', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="solution_gita">Gita-Based Solution</Label>
                    <AIGenerateButton
                      label="Generate"
                      disabled={!formData.english_meaning}
                      onGenerate={() => handleAIGenerate('solution_gita', 'solution_gita')}
                      onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                    />
                  </div>
                  <Textarea
                    id="solution_gita"
                    className="min-h-[100px]"
                    placeholder="What solution does the Gita offer?"
                    value={formData.solution_gita || ''}
                    onChange={(e) => handleChange('solution_gita', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="life_application">Life Application</Label>
                    <AIGenerateButton
                      label="Generate"
                      disabled={!formData.english_meaning}
                      onGenerate={() => handleAIGenerate('life_application', 'life_application')}
                      onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                    />
                  </div>
                  <Textarea
                    id="life_application"
                    className="min-h-[100px]"
                    placeholder="How to apply this in daily life?"
                    value={formData.life_application || ''}
                    onChange={(e) => handleChange('life_application', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="practical_action">Practical Action</Label>
                    <AIGenerateButton
                      label="Generate"
                      disabled={!formData.english_meaning}
                      onGenerate={() => handleAIGenerate('practical_action', 'practical_action')}
                      onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                    />
                  </div>
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
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="story_type">Story Type</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.story_type || 'corporate'}
                        onValueChange={(value) => handleChange('story_type', value as StoryType)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {storyTypes.length > 0 ? (
                            storyTypes.map(st => (
                              <SelectItem key={st.id} value={st.name}>
                                {st.display_name}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="corporate">Corporate</SelectItem>
                              <SelectItem value="family">Family</SelectItem>
                              <SelectItem value="youth">Youth</SelectItem>
                              <SelectItem value="global">Global</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={() => setShowStoryTypeManager(true)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <AIGenerateButton
                    label="Auto-Suggest Type"
                    disabled={!formData.modern_story && !formData.english_meaning}
                    onGenerate={handleSuggestStoryType}
                    onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="modern_story">Story Content</Label>
                    <AIGenerateButton
                      label="Generate Story"
                      disabled={!formData.english_meaning}
                      onGenerate={() => handleAIGenerate('modern_story', 'modern_story')}
                      onError={(err) => toast({ title: 'Error', description: err, variant: 'destructive' })}
                    />
                  </div>
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

      {/* Modals */}
      <AddProblemModal
        open={showAddProblem}
        onOpenChange={setShowAddProblem}
        onProblemCreated={handleProblemCreated}
      />
      <StoryTypeManager
        open={showStoryTypeManager}
        onOpenChange={setShowStoryTypeManager}
        onTypesUpdated={loadStoryTypes}
      />
    </AdminLayout>
  );
}
