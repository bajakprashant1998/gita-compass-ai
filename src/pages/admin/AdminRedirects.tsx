import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ArrowRight, Globe, Link2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRedirects() {
  const queryClient = useQueryClient();
  const [fromPath, setFromPath] = useState('');
  const [toPath, setToPath] = useState('');
  const [redirectType, setRedirectType] = useState(301);

  const { data: redirects, isLoading } = useQuery({
    queryKey: ['admin-redirects'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('seo_redirects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from('seo_redirects').insert({
        from_path: fromPath,
        to_path: toPath,
        redirect_type: redirectType,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-redirects'] });
      setFromPath('');
      setToPath('');
      toast.success('Redirect added');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('seo_redirects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-redirects'] });
      toast.success('Redirect deleted');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await (supabase as any).from('seo_redirects').update({ is_active: active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-redirects'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="h-6 w-6 text-primary" />
          Redirect Manager
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage 301/302 redirects to prevent SEO penalties and fix broken links
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Redirect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="From path (e.g., /old-page)"
              value={fromPath}
              onChange={(e) => setFromPath(e.target.value)}
              className="flex-1"
            />
            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 self-center hidden sm:block" />
            <Input
              placeholder="To path (e.g., /new-page)"
              value={toPath}
              onChange={(e) => setToPath(e.target.value)}
              className="flex-1"
            />
            <select
              value={redirectType}
              onChange={(e) => setRedirectType(Number(e.target.value))}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value={301}>301 (Permanent)</option>
              <option value={302}>302 (Temporary)</option>
            </select>
            <Button
              onClick={() => addMutation.mutate()}
              disabled={!fromPath || !toPath || addMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Active Redirects ({redirects?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-32 animate-pulse bg-muted rounded" />
          ) : redirects && redirects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hits</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirects.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm">{r.from_path}</TableCell>
                    <TableCell className="font-mono text-sm">{r.to_path}</TableCell>
                    <TableCell>
                      <Badge variant={r.redirect_type === 301 ? 'default' : 'secondary'}>
                        {r.redirect_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => toggleMutation.mutate({ id: r.id, active: !r.is_active })}>
                        <Badge variant={r.is_active ? 'default' : 'outline'} className="cursor-pointer">
                          {r.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <BarChart3 className="h-3 w-3" /> {r.hit_count}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(r.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No redirects configured yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
