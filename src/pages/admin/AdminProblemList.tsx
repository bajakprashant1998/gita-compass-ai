import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { getAdminProblems, deleteProblem } from '@/lib/adminApi';
import type { AdminProblem, ProblemCategory } from '@/types/admin';
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

const categoryColors: Record<ProblemCategory, string> = {
  mental: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  leadership: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ethics: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  career: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  relationships: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  spiritual: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

export default function AdminProblemList() {
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadProblems = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminProblems();
      setProblems(data);
    } catch (error) {
      console.error('Failed to load problems:', error);
      toast({
        title: 'Error',
        description: 'Failed to load problems',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteProblem(deleteId);
      toast({ title: 'Success', description: 'Problem deleted' });
      setDeleteId(null);
      loadProblems();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete problem',
        variant: 'destructive',
      });
    }
  };

  const filteredProblems = problems.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Problems" subtitle={`Manage ${problems.length} problem tags`}>
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Search problems..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button asChild className="ml-auto">
          <Link to="/admin/problems/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Problem
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Linked Shloks</TableHead>
              <TableHead>Order</TableHead>
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
            ) : filteredProblems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No problems found
                </TableCell>
              </TableRow>
            ) : (
              filteredProblems.map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell className="font-medium">{problem.name}</TableCell>
                  <TableCell className="text-muted-foreground">/problems/{problem.slug}</TableCell>
                  <TableCell>
                    {problem.category && (
                      <Badge variant="outline" className={categoryColors[problem.category]}>
                        {problem.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{problem.shlok_count || 0}</TableCell>
                  <TableCell>{problem.display_order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button asChild size="icon" variant="ghost">
                        <Link to={`/admin/problems/edit/${problem.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeleteId(problem.id)}
                      >
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

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Problem</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this problem? This will also remove all shlok mappings.
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
    </AdminLayout>
  );
}
