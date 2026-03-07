import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, PenSquare, Images } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
import { BulkImageUploadModal } from '@/components/admin/BulkImageUploadModal';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  author: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function AdminBlogList() {
  const { isReady } = useAdminAuthContext();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkImageOpen, setBulkImageOpen] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, published, author, tags, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load blog posts');
      console.error(error);
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isReady) return;
    fetchPosts();
  }, [isReady]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { data, error } = await supabase.functions.invoke('admin-crud', {
        body: { table: 'blog_posts', operation: 'delete', id: deleteId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Post deleted');
      setPosts(prev => prev.filter(p => p.id !== deleteId));
    } catch (err) {
      toast.error('Failed to delete post');
    }
    setDeleteId(null);
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-crud', {
        body: { table: 'blog_posts', operation: 'update', id: post.id, data: { published: !post.published } },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: !p.published } : p));
      toast.success(post.published ? 'Post unpublished' : 'Post published');
    } catch (err) {
      toast.error('Failed to update post');
    }
  };

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Blog Posts"
        subtitle={`${posts.length} total posts`}
        icon={<PenSquare className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setBulkImageOpen(true)}>
              <Images className="w-4 h-4 mr-2" /> Bulk Images
            </Button>
            <Button asChild>
              <Link to="/admin/blog/create">
                <Plus className="w-4 h-4 mr-2" /> New Post
              </Link>
            </Button>
          </div>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="border border-border/60 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No blog posts found</TableCell>
                </TableRow>
              ) : (
                filtered.map(post => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-[250px] truncate">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant={post.published ? 'default' : 'secondary'}>{post.published ? 'Published' : 'Draft'}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{post.author}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {(post.tags || []).slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(new Date(post.updated_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => togglePublish(post)} title={post.published ? 'Unpublish' : 'Publish'}>
                          {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/blog/edit/${post.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(post.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this blog post?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <BulkImageUploadModal
        open={bulkImageOpen}
        onOpenChange={setBulkImageOpen}
        onComplete={fetchPosts}
      />
    </div>
  );
}
