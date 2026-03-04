import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Check, ChevronLeft, ChevronRight, Eye, Trash2, Calendar, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface Submission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function AdminContactSubmissions() {
  const [page, setPage] = useState(1);
  const [viewItem, setViewItem] = useState<Submission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const perPage = 15;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contacts', page],
    queryFn: async () => {
      const from = (page - 1) * perPage;
      const { data, count, error } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + perPage - 1);
      if (error) throw error;
      return { items: (data || []) as Submission[], total: count || 0 };
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_submissions').update({ read: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-contacts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('admin-crud', {
        body: { table: 'contact_submissions', operation: 'delete', id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast.success('Submission deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  const handleView = (item: Submission) => {
    setViewItem(item);
    if (!item.read) markRead.mutate(item.id);
  };

  const totalPages = Math.ceil((data?.total || 0) / perPage);
  const unreadCount = data?.items.filter(i => !i.read).length || 0;

  return (
    <div>
      <AdminHeader
        title="Contact Submissions"
        subtitle={`${data?.total || 0} submissions · ${unreadCount} unread`}
        icon={<Mail className="w-5 h-5" />}
      />

      <Card className="rounded-2xl border-border/60 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_140px_100px_80px] gap-4 px-5 py-3 border-b border-border/40 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Submission</span>
            <span>Date</span>
            <span className="text-center">Status</span>
            <span className="text-center">Actions</span>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <div className="divide-y divide-border/30">
              {data.items.map(item => (
                <div key={item.id} className="grid grid-cols-[1fr_140px_100px_80px] gap-4 px-5 py-3.5 items-center hover:bg-muted/20 transition-colors">
                  <div className="min-w-0 cursor-pointer" onClick={() => handleView(item)}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-semibold truncate">{item.name}</span>
                      {!item.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs font-medium text-foreground/80 truncate">{item.subject}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{item.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(item.created_at!), 'MMM d, yyyy')}
                  </div>
                  <div className="text-center">
                    <Badge variant={item.read ? 'secondary' : 'default'} className="text-[10px]">
                      {item.read ? 'Read' : 'New'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(item)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No submissions yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              {viewItem?.subject}
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">From</span>
                  <p className="font-medium">{viewItem.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Email</span>
                  <p className="font-medium">{viewItem.email}</p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Date</span>
                <p className="text-sm">{format(new Date(viewItem.created_at), 'PPP p')}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm whitespace-pre-wrap">{viewItem.message}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${viewItem.email}?subject=Re: ${viewItem.subject}`}>
                  Reply via Email
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete submission?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
