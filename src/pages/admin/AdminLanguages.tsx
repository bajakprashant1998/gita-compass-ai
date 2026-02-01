import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { getLanguages, toggleLanguage, createLanguage } from '@/lib/adminApi';
import type { Language } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

export default function AdminLanguages() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newLang, setNewLang] = useState({
    code: '',
    name: '',
    native_name: '',
  });

  const loadLanguages = async () => {
    try {
      const data = await getLanguages();
      setLanguages(data);
    } catch (error) {
      console.error('Failed to load languages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load languages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggleLanguage(id, enabled);
      setLanguages(prev =>
        prev.map(l => (l.id === id ? { ...l, enabled } : l))
      );
      toast({
        title: 'Success',
        description: `Language ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update language',
        variant: 'destructive',
      });
    }
  };

  const handleAddLanguage = async () => {
    if (!newLang.code || !newLang.name || !newLang.native_name) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);

    try {
      await createLanguage({
        code: newLang.code.toLowerCase(),
        name: newLang.name,
        native_name: newLang.native_name,
        enabled: false,
        display_order: languages.length + 1,
      });

      toast({ title: 'Success', description: 'Language added' });
      setDialogOpen(false);
      setNewLang({ code: '', name: '', native_name: '' });
      loadLanguages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add language',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AdminLayout title="Languages" subtitle="Manage supported languages">
      <div className="flex justify-end mb-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Language</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="code">Language Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., es, fr, de"
                  value={newLang.code}
                  onChange={(e) => setNewLang(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name (English)</Label>
                <Input
                  id="name"
                  placeholder="e.g., Spanish"
                  value={newLang.name}
                  onChange={(e) => setNewLang(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="native">Native Name</Label>
                <Input
                  id="native"
                  placeholder="e.g., Español"
                  value={newLang.native_name}
                  onChange={(e) => setNewLang(prev => ({ ...prev, native_name: e.target.value }))}
                />
              </div>
              <Button onClick={handleAddLanguage} disabled={isAdding} className="w-full">
                {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Add Language
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Native Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : languages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No languages found
                </TableCell>
              </TableRow>
            ) : (
              languages.map((lang) => (
                <TableRow key={lang.id}>
                  <TableCell className="font-mono font-medium">{lang.code.toUpperCase()}</TableCell>
                  <TableCell>{lang.name}</TableCell>
                  <TableCell>{lang.native_name}</TableCell>
                  <TableCell>
                    <Badge variant={lang.enabled ? 'default' : 'secondary'}>
                      {lang.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={lang.enabled}
                      onCheckedChange={(checked) => handleToggle(lang.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
