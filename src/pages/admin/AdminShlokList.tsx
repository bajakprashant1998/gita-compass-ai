import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getAdminShloks, getChapters, bulkUpdateShlokStatus, deleteShlok } from '@/lib/adminApi';
import type { AdminShlok, ShlokFilters, ShlokStatus } from '@/types/admin';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AIBulkGenerateModal } from '@/components/admin/AIBulkGenerateModal';

const statusConfig: Record<ShlokStatus, { label: string; icon: React.ReactNode; className: string }> = {
  published: {
    label: 'Published',
    icon: <CheckCircle className="h-3 w-3" />,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  draft: {
    label: 'Draft',
    icon: <Clock className="h-3 w-3" />,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  scheduled: {
    label: 'Scheduled',
    icon: <Calendar className="h-3 w-3" />,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
};

export default function AdminShlokList() {
  const [shloks, setShloks] = useState<AdminShlok[]>([]);
  const [chapters, setChapters] = useState<{ id: string; chapter_number: number; title_english: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showBulkAI, setShowBulkAI] = useState(false);
  const [filters, setFilters] = useState<ShlokFilters>({
    page: 1,
    perPage: 25,
  });
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    console.log('AdminShlokList: Starting data load...');
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );

      const [shloksData, chaptersData] = await Promise.race([
        Promise.all([
          getAdminShloks(filters),
          getChapters(),
        ]),
        timeoutPromise
      ]) as [any, any];

      console.log('AdminShlokList: Data loaded', { count: shloksData.count });
      setShloks(shloksData.data);
      setTotalCount(shloksData.count || 0);
      setChapters(chaptersData);
    } catch (error: any) {
      console.error('Failed to load shloks:', error);
      toast({
        title: 'Connection Issue',
        description: 'Failed to load data. Please try logging out and back in.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? shloks.map(s => s.id) : []);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(i => i !== id)
    );
  };

  const handleBulkPublish = async (status: ShlokStatus) => {
    if (selectedIds.length === 0) return;

    try {
      await bulkUpdateShlokStatus(selectedIds, status);
      toast({
        title: 'Success',
        description: `${selectedIds.length} shloks updated to ${status}`,
      });
      setSelectedIds([]);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update shloks',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteShlok(deleteId);
      toast({ title: 'Success', description: 'Shlok deleted' });
      setDeleteId(null);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete shlok',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(totalCount / filters.perPage);

  return (
    <div className="space-y-6">
      <AdminHeader title="Shloks" subtitle={`Manage all ${totalCount} shloks`} />

      <div className="container">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shloks..."
                className="pl-9"
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              />
            </div>
          </div>

          <Select
            value={filters.chapter || 'all'}
            onValueChange={(value) => setFilters(prev => ({
              ...prev,
              chapter: value === 'all' ? undefined : value,
              page: 1,
            }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Chapters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {chapters.map(ch => (
                <SelectItem key={ch.id} value={ch.id}>
                  Chapter {ch.chapter_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => setFilters(prev => ({
              ...prev,
              status: value === 'all' ? undefined : value as ShlokStatus,
              page: 1,
            }))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild>
            <Link to="/admin/shloks/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Shlok
            </Link>
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">{selectedIds.length} selected</span>
            <Button size="sm" variant="outline" onClick={() => handleBulkPublish('published')}>
              Publish Selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkPublish('draft')}>
              Mark as Draft
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowBulkAI(true)}>
              <Sparkles className="h-4 w-4 mr-1" />
              AI Fill Missing
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.length === shloks.length && shloks.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[100px]">Chapter</TableHead>
                <TableHead className="w-[80px]">Verse</TableHead>
                <TableHead>Sanskrit</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : shloks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No shloks found
                  </TableCell>
                </TableRow>
              ) : (
                shloks.map((shlok) => {
                  const status = statusConfig[shlok.status as ShlokStatus] || statusConfig.draft;
                  return (
                    <TableRow key={shlok.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(shlok.id)}
                          onCheckedChange={(checked) => handleSelect(shlok.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {shlok.chapter?.chapter_number || '-'}
                      </TableCell>
                      <TableCell>{shlok.verse_number}</TableCell>
                      <TableCell className="max-w-[300px] truncate font-serif">
                        {shlok.sanskrit_text.substring(0, 60)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('gap-1', status.className)}>
                          {status.icon}
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button asChild size="icon" variant="ghost">
                            <Link to={`/admin/shloks/edit/${shlok.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setDeleteId(shlok.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {((filters.page - 1) * filters.perPage) + 1} to{' '}
              {Math.min(filters.page * filters.perPage, totalCount)} of {totalCount}
            </span>
            <Select
              value={String(filters.perPage)}
              onValueChange={(value) => setFilters(prev => ({ ...prev, perPage: Number(value), page: 1 }))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={filters.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {filters.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={filters.page >= totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Shlok</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this shlok? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk AI Modal */}
        <AIBulkGenerateModal
          open={showBulkAI}
          onOpenChange={setShowBulkAI}
          selectedShlokIds={selectedIds}
          onComplete={() => {
            setSelectedIds([]);
            loadData();
          }}
        />
      </div>
    </div>
  );
}
