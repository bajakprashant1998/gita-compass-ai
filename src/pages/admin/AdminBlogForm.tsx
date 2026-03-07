import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, X, Sparkles, Wand2, RefreshCw, Upload, ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  tags: string[];
  published: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
}

const defaultForm: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  author: 'Bhagavad Gita Gyan',
  tags: [],
  published: false,
  meta_title: '',
  meta_description: '',
  meta_keywords: [],
};

function CoverImageUploader({ coverImage, onChange }: { coverImage: string; onChange: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file, { cacheControl: '31536000', upsert: false });

    if (error) {
      toast.error('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);
    onChange(urlData.publicUrl);
    toast.success('Cover image uploaded!');
    setUploading(false);
  };

  const handleRemove = async () => {
    if (coverImage) {
      // Try to delete from storage if it's our bucket
      try {
        const url = new URL(coverImage);
        const pathMatch = url.pathname.match(/\/blog-images\/(.+)$/);
        if (pathMatch) {
          await supabase.storage.from('blog-images').remove([pathMatch[1]]);
        }
      } catch { /* ignore */ }
    }
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label>Cover Image</Label>
      {coverImage ? (
        <div className="relative group">
          <img
            src={coverImage}
            alt="Cover preview"
            className="w-full h-48 rounded-xl object-cover border border-border"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground bg-muted/20"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8" />
              <span className="text-sm font-medium">Click to upload cover image</span>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP • Max 5MB</span>
            </>
          )}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}


  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [form, setForm] = useState<BlogFormData>(defaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [regenerating, setRegenerating] = useState<string | null>(null);

  // AI generation state
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('informative and inspiring');
  const [aiLength, setAiLength] = useState('1000-1200 words');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            toast.error('Post not found');
            navigate('/admin/blog');
            return;
          }
          setForm({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || '',
            content: data.content,
            cover_image: data.cover_image || '',
            author: data.author,
            tags: data.tags || [],
            published: data.published,
            meta_title: data.meta_title || '',
            meta_description: data.meta_description || '',
            meta_keywords: data.meta_keywords || [],
          });
          setIsLoading(false);
        });
    }
  }, [id, isEditing, navigate]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !form.meta_keywords.includes(kw)) {
      setForm(prev => ({ ...prev, meta_keywords: [...prev.meta_keywords, kw] }));
    }
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    setForm(prev => ({ ...prev, meta_keywords: prev.meta_keywords.filter(k => k !== kw) }));
  };

  const handleRegenerateSection = async (section: 'title' | 'excerpt' | 'seo') => {
    if (!form.content.trim() && !form.title.trim()) {
      toast.error('Add some content or title first before regenerating');
      return;
    }

    setRegenerating(section);
    try {
      const { data, error } = await supabase.functions.invoke('admin-ai-generate', {
        body: {
          type: 'blog_section',
          blog_section: section,
          blog_content: form.content,
          blog_title: form.title,
        },
      });

      if (error) throw error;

      if (section === 'title' && data?.title) {
        setForm(prev => ({ ...prev, title: data.title, slug: isEditing ? prev.slug : generateSlug(data.title) }));
        toast.success('Title regenerated!');
      } else if (section === 'excerpt' && data?.excerpt) {
        setForm(prev => ({ ...prev, excerpt: data.excerpt }));
        toast.success('Excerpt regenerated!');
      } else if (section === 'seo') {
        setForm(prev => ({
          ...prev,
          meta_title: data?.meta_title || prev.meta_title,
          meta_description: data?.meta_description || prev.meta_description,
          meta_keywords: data?.meta_keywords || prev.meta_keywords,
        }));
        toast.success('SEO fields regenerated!');
      } else {
        toast.error('AI returned unexpected format');
      }
    } catch (err: unknown) {
      console.error('Regenerate section error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to regenerate');
    } finally {
      setRegenerating(null);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error('Please enter a topic for the blog post');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-ai-generate', {
        body: {
          type: 'blog_post',
          blog_topic: aiTopic,
          blog_tone: aiTone,
          blog_length: aiLength,
        },
      });

      if (error) throw error;

      if (data?.title) {
        setForm(prev => ({
          ...prev,
          title: data.title || prev.title,
          slug: generateSlug(data.title || prev.title),
          excerpt: data.excerpt || prev.excerpt,
          content: data.content || prev.content,
          tags: data.tags || prev.tags,
          meta_title: data.meta_title || prev.meta_title,
          meta_description: data.meta_description || prev.meta_description,
          meta_keywords: data.meta_keywords || prev.meta_keywords,
        }));
        toast.success('Blog post generated! Review and edit before publishing.');
      } else {
        toast.error('AI returned unexpected format. Please try again.');
      }
    } catch (err: unknown) {
      console.error('AI generate error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to generate blog post');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('Slug is required');
      return;
    }
    if (!form.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setIsSaving(true);

    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      cover_image: form.cover_image || null,
      author: form.author,
      tags: form.tags,
      published: form.published,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      meta_keywords: form.meta_keywords.length > 0 ? form.meta_keywords : null,
    };

    let error;
    if (isEditing) {
      ({ error } = await supabase.from('blog_posts').update(payload).eq('id', id));
    } else {
      ({ error } = await supabase.from('blog_posts').insert(payload));
    }

    if (error) {
      toast.error(error.message || 'Failed to save post');
    } else {
      toast.success(isEditing ? 'Post updated' : 'Post created');
      navigate('/admin/blog');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Post' : 'New Blog Post'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={form.published}
              onCheckedChange={v => setForm(prev => ({ ...prev, published: v }))}
            />
            <Label className="text-sm">{form.published ? 'Published' : 'Draft'}</Label>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      {/* AI Blog Generator */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-amber-500/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">AI Blog Generator</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Topic / Title Idea</Label>
              <Input
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                placeholder="e.g., How Karma Yoga can transform your work life..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Tone</Label>
                <Select value={aiTone} onValueChange={setAiTone}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informative and inspiring">Informative & Inspiring</SelectItem>
                    <SelectItem value="conversational and relatable">Conversational & Relatable</SelectItem>
                    <SelectItem value="scholarly and philosophical">Scholarly & Philosophical</SelectItem>
                    <SelectItem value="practical and actionable">Practical & Actionable</SelectItem>
                    <SelectItem value="storytelling and narrative">Storytelling & Narrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Length</Label>
                <Select value={aiLength} onValueChange={setAiLength}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500-700 words">Short (~600 words)</SelectItem>
                    <SelectItem value="1000-1200 words">Medium (~1100 words)</SelectItem>
                    <SelectItem value="1500-2000 words">Long (~1700 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleAIGenerate}
              disabled={isGenerating || !aiTopic.trim()}
              className="w-full gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Blog Post...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate Blog Post
                </>
              )}
            </Button>
            {form.content && !isEditing && (
              <p className="text-xs text-muted-foreground text-center">
                ⚠️ Generating will overwrite current content
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Title</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs h-7"
                disabled={regenerating === 'title' || (!form.content.trim() && !form.title.trim())}
                onClick={() => handleRegenerateSection('title')}
              >
                {regenerating === 'title' ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Regenerate
              </Button>
            </div>
            <Input
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Blog post title..."
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="blog-post-slug"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Excerpt</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs h-7"
                disabled={regenerating === 'excerpt' || (!form.content.trim() && !form.title.trim())}
                onClick={() => handleRegenerateSection('excerpt')}
              >
                {regenerating === 'excerpt' ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Regenerate
              </Button>
            </div>
            <Textarea
              value={form.excerpt}
              onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief summary of the post..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Content (Markdown supported)</Label>
            <Textarea
              value={form.content}
              onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your blog post content here... (Markdown supported)"
              rows={20}
              className="font-mono text-sm"
            />
          </div>

          <CoverImageUploader
            coverImage={form.cover_image}
            onChange={(url) => setForm(prev => ({ ...prev, cover_image: url }))}
          />

          <div className="space-y-2">
            <Label>Author</Label>
            <Input
              value={form.author}
              onChange={e => setForm(prev => ({ ...prev, author: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            <div className="flex gap-1 flex-wrap mt-2">
              {form.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6 mt-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={regenerating === 'seo' || (!form.content.trim() && !form.title.trim())}
              onClick={() => handleRegenerateSection('seo')}
            >
              {regenerating === 'seo' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Regenerate All SEO
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Meta Title</Label>
            <Input
              value={form.meta_title}
              onChange={e => setForm(prev => ({ ...prev, meta_title: e.target.value }))}
              placeholder="SEO title (max 60 chars)"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">{form.meta_title.length}/60</p>
          </div>

          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Textarea
              value={form.meta_description}
              onChange={e => setForm(prev => ({ ...prev, meta_description: e.target.value }))}
              placeholder="SEO description (max 160 chars)"
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{form.meta_description.length}/160</p>
          </div>

          <div className="space-y-2">
            <Label>Meta Keywords</Label>
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={e => setKeywordInput(e.target.value)}
                placeholder="Add a keyword..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              />
              <Button type="button" variant="outline" onClick={addKeyword}>Add</Button>
            </div>
            <div className="flex gap-1 flex-wrap mt-2">
              {form.meta_keywords.map(kw => (
                <Badge key={kw} variant="outline" className="gap-1">
                  {kw}
                  <button onClick={() => removeKeyword(kw)}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
