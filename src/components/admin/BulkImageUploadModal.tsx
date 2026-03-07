import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Loader2, ImageIcon, Check, X, Images } from 'lucide-react';
import { toast } from 'sonner';

interface BlogPostItem {
  id: string;
  title: string;
  cover_image: string | null;
}

interface UploadEntry {
  postId: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

export function BulkImageUploadModal({ open, onOpenChange, onComplete }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: () => void;
}) {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<Map<string, UploadEntry>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [filterNoCover, setFilterNoCover] = useState(true);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from('blog_posts')
      .select('id, title, cover_image')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, [open]);

  const displayPosts = filterNoCover ? posts.filter(p => !p.cover_image) : posts;

  const handleFileSelect = (postId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const preview = URL.createObjectURL(file);
    setUploads(prev => {
      const next = new Map(prev);
      next.set(postId, { postId, file, preview, status: 'pending' });
      return next;
    });
  };

  const removeUpload = (postId: string) => {
    setUploads(prev => {
      const next = new Map(prev);
      const entry = next.get(postId);
      if (entry) URL.revokeObjectURL(entry.preview);
      next.delete(postId);
      return next;
    });
  };

  const handleBulkUpload = async () => {
    const pending = Array.from(uploads.values()).filter(u => u.status === 'pending');
    if (pending.length === 0) {
      toast.error('No images selected to upload');
      return;
    }

    setIsUploading(true);
    let successCount = 0;

    for (const entry of pending) {
      setUploads(prev => {
        const next = new Map(prev);
        next.set(entry.postId, { ...entry, status: 'uploading' });
        return next;
      });

      try {
        const ext = entry.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, entry.file, { cacheControl: '31536000', upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);

        const { error: updateError } = await supabase.functions.invoke('admin-crud', {
          body: { table: 'blog_posts', operation: 'update', id: entry.postId, data: { cover_image: urlData.publicUrl } },
        });

        if (updateError) throw updateError;

        setUploads(prev => {
          const next = new Map(prev);
          next.set(entry.postId, { ...entry, status: 'done' });
          return next;
        });
        successCount++;
      } catch (err) {
        console.error('Bulk upload error for post:', entry.postId, err);
        setUploads(prev => {
          const next = new Map(prev);
          next.set(entry.postId, { ...entry, status: 'error' });
          return next;
        });
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      toast.success(`${successCount} image(s) uploaded successfully!`);
      onComplete();
    }
    if (successCount < pending.length) {
      toast.error(`${pending.length - successCount} upload(s) failed`);
    }
  };

  const pendingCount = Array.from(uploads.values()).filter(u => u.status === 'pending').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Images className="h-5 w-5 text-primary" />
            Bulk Cover Image Upload
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={filterNoCover} onCheckedChange={(v) => setFilterNoCover(!!v)} />
            Show only posts without cover image
          </label>
          <Badge variant="outline">{displayPosts.length} posts</Badge>
        </div>

        <ScrollArea className="flex-1 min-h-0 max-h-[50vh] pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">All posts have cover images! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayPosts.map(post => {
                const upload = uploads.get(post.id);
                return (
                  <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card">
                    {/* Preview / Upload area */}
                    <div className="relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-border bg-muted/30">
                      {upload ? (
                        <>
                          <img src={upload.preview} alt="" className="w-full h-full object-cover" />
                          {upload.status === 'uploading' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                            </div>
                          )}
                          {upload.status === 'done' && (
                            <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                          )}
                          {upload.status === 'error' && (
                            <div className="absolute inset-0 bg-destructive/30 flex items-center justify-center">
                              <X className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </>
                      ) : post.cover_image ? (
                        <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      {upload?.status === 'done' && <p className="text-xs text-green-600">✓ Uploaded</p>}
                      {upload?.status === 'error' && <p className="text-xs text-destructive">✗ Failed</p>}
                    </div>

                    {/* Actions */}
                    <div className="shrink-0">
                      {upload && upload.status === 'pending' ? (
                        <Button variant="ghost" size="sm" onClick={() => removeUpload(post.id)} className="text-destructive h-8">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      ) : upload?.status === 'done' ? null : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          disabled={isUploading}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileSelect(post.id, file);
                            };
                            input.click();
                          }}
                        >
                          <Upload className="h-3 w-3" />
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {pendingCount > 0 && (
          <div className="pt-3 border-t border-border/60">
            <Button
              onClick={handleBulkUpload}
              disabled={isUploading}
              className="w-full gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload {pendingCount} Image{pendingCount > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
