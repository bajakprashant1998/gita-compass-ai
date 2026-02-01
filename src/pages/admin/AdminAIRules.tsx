import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { getAIRules, getAdminProblems, createAIRule, updateAIRule, deleteAIRule } from '@/lib/adminApi';
import type { AISearchRule, AdminProblem } from '@/types/admin';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAIRules() {
  const [rules, setRules] = useState<AISearchRule[]>([]);
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editRule, setEditRule] = useState<AISearchRule | null>(null);
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<AISearchRule | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    keywords: '',
    problem_id: '',
    priority: 5,
    enabled: true,
  });

  const loadData = async () => {
    try {
      const [rulesData, problemsData] = await Promise.all([
        getAIRules(),
        getAdminProblems(),
      ]);
      setRules(rulesData);
      setProblems(problemsData);
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

  useEffect(() => {
    loadData();
  }, []);

  const openDialog = (rule?: AISearchRule) => {
    if (rule) {
      setEditRule(rule);
      setFormData({
        keywords: rule.keywords.join(', '),
        problem_id: rule.problem_id || '',
        priority: rule.priority,
        enabled: rule.enabled,
      });
    } else {
      setEditRule(null);
      setFormData({
        keywords: '',
        problem_id: '',
        priority: 5,
        enabled: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const keywordsArray = formData.keywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    if (keywordsArray.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one keyword is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const data = {
        keywords: keywordsArray,
        problem_id: formData.problem_id || undefined,
        priority: formData.priority,
        enabled: formData.enabled,
      };

      if (editRule) {
        await updateAIRule(editRule.id, data);
      } else {
        await createAIRule(data);
      }

      toast({ title: 'Success', description: editRule ? 'Rule updated' : 'Rule created' });
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save rule',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteAIRule(deleteId);
      toast({ title: 'Success', description: 'Rule deleted' });
      setDeleteId(null);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive',
      });
    }
  };

  const handleTest = () => {
    const query = testQuery.toLowerCase();
    const match = rules.find(rule =>
      rule.enabled && rule.keywords.some(k => query.includes(k.toLowerCase()))
    );
    setTestResult(match || null);
  };

  return (
    <AdminLayout title="AI Search Rules" subtitle="Configure keyword-to-problem mappings">
      {/* Test Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Test Rule Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter a search query to test..."
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTest}>Test</Button>
          </div>
          {testQuery && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              {testResult ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Matched Rule:</p>
                  <p className="font-medium">
                    Keywords: {testResult.keywords.join(', ')}
                  </p>
                  <p>
                    Problem: {testResult.problem?.name || 'None assigned'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Priority: {testResult.priority}/10
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No matching rule found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules Table */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keywords</TableHead>
              <TableHead>Problem</TableHead>
              <TableHead className="text-center">Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No rules configured
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {rule.keywords.slice(0, 3).map((kw, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                      {rule.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{rule.keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{rule.problem?.name || '-'}</TableCell>
                  <TableCell className="text-center">{rule.priority}/10</TableCell>
                  <TableCell>
                    <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openDialog(rule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeleteId(rule.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editRule ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Textarea
                id="keywords"
                placeholder="fear, afraid, scared, anxious"
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problem">Link to Problem</Label>
              <Select
                value={formData.problem_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, problem_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a problem" />
                </SelectTrigger>
                <SelectContent>
                  {problems.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority: {formData.priority}/10</Label>
              <Slider
                value={[formData.priority]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, priority: value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enabled</Label>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this AI search rule?
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
