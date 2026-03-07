import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Trash2, ArrowUp, ArrowDown, Eye, Pencil, X,
  GripVertical, Image, FileText, ArrowLeft, Save, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Slide {
  text: string;
  subtext: string;
  verse_ref: string;
  gradient: string;
}

interface WebStory {
  id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  slides: Slide[];
  shlok_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const GRADIENTS = [
  'from-orange-600 via-amber-500 to-yellow-400',
  'from-purple-700 via-violet-600 to-indigo-500',
  'from-emerald-700 via-teal-600 to-cyan-500',
  'from-rose-700 via-pink-600 to-fuchsia-500',
  'from-blue-800 via-blue-600 to-sky-400',
  'from-amber-800 via-orange-600 to-red-500',
  'from-slate-800 via-zinc-700 to-stone-600',
  'from-indigo-800 via-purple-600 to-pink-500',
];

const emptySlide: Slide = { text: '', subtext: '', verse_ref: '', gradient: GRADIENTS[0] };

async function adminStoryAction(action: 'create' | 'update' | 'delete', body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('admin-crud', {
    body: { table: 'web_stories', operation: action, ...body },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export default function AdminWebStories() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<WebStory | null>(null);
  const [isNew, setIsNew] = useState(false);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['admin-web-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('web_stories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as WebStory[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (story: WebStory) => {
      const payload = {
        title: story.title,
        slug: story.slug,
        meta_description: story.meta_description,
        slides: story.slides,
        shlok_id: story.shlok_id || null,
        published: story.published,
      };
      if (isNew) {
        return adminStoryAction('create', { data: payload });
      }
      return adminStoryAction('update', { id: story.id, data: payload });
    },
    onSuccess: () => {
      toast.success(isNew ? 'Story created!' : 'Story updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-web-stories'] });
      setEditing(null);
      setIsNew(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminStoryAction('delete', { id }),
    onSuccess: () => {
      toast.success('Story deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-web-stories'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (editing) {
    return (
      <StoryEditor
        story={editing}
        onSave={(s) => saveMutation.mutate(s)}
        onCancel={() => { setEditing(null); setIsNew(false); }}
        saving={saveMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Web Stories</h1>
          <p className="text-sm text-muted-foreground">Create visual swipeable stories for Google discovery</p>
        </div>
        <Button
          onClick={() => {
            setIsNew(true);
            setEditing({
              id: '',
              title: '',
              slug: '',
              meta_description: '',
              slides: [{ ...emptySlide }],
              shlok_id: null,
              published: false,
              created_at: '',
              updated_at: '',
            });
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> New Story
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse bg-muted rounded-xl" />)}
        </div>
      ) : stories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No web stories yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {stories.map(story => (
            <Card key={story.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br",
                    (story.slides as Slide[])?.[0]?.gradient || GRADIENTS[0]
                  )}>
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{story.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">/stories/{story.slug}</span>
                      <Badge variant={story.published ? 'default' : 'secondary'} className="text-[10px]">
                        {story.published ? 'Published' : 'Draft'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(story.slides as Slide[])?.length || 0} slides
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={`/stories/${story.slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(story)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Delete "${story.title}"?`)) deleteMutation.mutate(story.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Slide Editor ────────────────────────────────────────

function StoryEditor({
  story,
  onSave,
  onCancel,
  saving,
}: {
  story: WebStory;
  onSave: (s: WebStory) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<WebStory>({ ...story, slides: [...(story.slides as Slide[])] });

  const updateSlide = (idx: number, field: keyof Slide, value: string) => {
    const slides = [...form.slides];
    slides[idx] = { ...slides[idx], [field]: value };
    setForm({ ...form, slides });
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    const slides = [...form.slides];
    const target = idx + dir;
    if (target < 0 || target >= slides.length) return;
    [slides[idx], slides[target]] = [slides[target], slides[idx]];
    setForm({ ...form, slides });
  };

  const removeSlide = (idx: number) => {
    if (form.slides.length <= 1) return;
    setForm({ ...form, slides: form.slides.filter((_, i) => i !== idx) });
  };

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold flex-1">{story.id ? 'Edit Story' : 'New Story'}</h1>
        <Button onClick={() => onSave(form)} disabled={saving || !form.title || !form.slug} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Meta Fields */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Story Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold">Title</Label>
              <Input
                value={form.title}
                onChange={e => {
                  const title = e.target.value;
                  setForm({ ...form, title, slug: form.slug || autoSlug(title) });
                }}
                placeholder="Story title"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Slug</Label>
              <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="story-slug" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Meta Description</Label>
            <Textarea
              value={form.meta_description || ''}
              onChange={e => setForm({ ...form, meta_description: e.target.value })}
              rows={2}
              placeholder="Short description for SEO"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.published} onCheckedChange={published => setForm({ ...form, published })} />
            <Label className="text-sm">Published</Label>
          </div>
        </CardContent>
      </Card>

      {/* Slides */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Slides ({form.slides.length})</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setForm({ ...form, slides: [...form.slides, { ...emptySlide, gradient: GRADIENTS[form.slides.length % GRADIENTS.length] }] })}
            className="gap-1"
          >
            <Plus className="h-3 w-3" /> Add Slide
          </Button>
        </div>

        {form.slides.map((slide, idx) => (
          <Card key={idx} className="overflow-hidden">
            <div className={cn("h-2 bg-gradient-to-r", slide.gradient)} />
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Slide {idx + 1}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSlide(idx, -1)} disabled={idx === 0}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSlide(idx, 1)} disabled={idx === form.slides.length - 1}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removeSlide(idx)}
                    disabled={form.slides.length <= 1}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs">Main Text</Label>
                <Textarea value={slide.text} onChange={e => updateSlide(idx, 'text', e.target.value)} rows={2} placeholder="Main verse or quote text" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Subtext</Label>
                  <Input value={slide.subtext} onChange={e => updateSlide(idx, 'subtext', e.target.value)} placeholder="Translation or meaning" />
                </div>
                <div>
                  <Label className="text-xs">Verse Reference</Label>
                  <Input value={slide.verse_ref} onChange={e => updateSlide(idx, 'verse_ref', e.target.value)} placeholder="e.g. Chapter 2, Verse 47" />
                </div>
              </div>

              {/* Gradient Picker */}
              <div>
                <Label className="text-xs mb-1.5 block">Background Gradient</Label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENTS.map(g => (
                    <button
                      key={g}
                      onClick={() => updateSlide(idx, 'gradient', g)}
                      className={cn(
                        "w-8 h-8 rounded-lg bg-gradient-to-br transition-all",
                        g,
                        slide.gradient === g ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className={cn("rounded-xl bg-gradient-to-br p-6 text-white text-center", slide.gradient)}>
                <p className="text-lg font-bold leading-snug">{slide.text || 'Preview text...'}</p>
                {slide.subtext && <p className="text-sm mt-2 opacity-90">{slide.subtext}</p>}
                {slide.verse_ref && <p className="text-xs mt-3 opacity-70">{slide.verse_ref}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
