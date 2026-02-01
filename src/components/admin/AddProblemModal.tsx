import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { createProblem } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';

interface AddProblemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProblemCreated: (problem: { id: string; name: string }) => void;
}

const categories = [
  { value: 'mental', label: 'Mental / Emotional' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'career', label: 'Career / Work' },
  { value: 'ethics', label: 'Ethics / Moral' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'spiritual', label: 'Spiritual' },
];

export function AddProblemModal({ open, onOpenChange, onProblemCreated }: AddProblemModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'mental',
    description_english: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Problem name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const slug = generateSlug(formData.name);
      const newProblem = await createProblem({
        name: formData.name.trim(),
        slug,
        category: formData.category as 'mental' | 'leadership' | 'ethics' | 'career' | 'relationships' | 'spiritual',
        description_english: formData.description_english.trim() || undefined,
      });

      toast({
        title: 'Success',
        description: 'Problem created successfully',
      });

      onProblemCreated({ id: newProblem.id, name: newProblem.name });
      onOpenChange(false);
      setFormData({ name: '', category: 'mental', description_english: '' });
    } catch (error) {
      console.error('Failed to create problem:', error);
      toast({
        title: 'Error',
        description: 'Failed to create problem',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Problem</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="problem-name">Problem Name *</Label>
            <Input
              id="problem-name"
              placeholder="e.g., Fear of Failure"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            {formData.name && (
              <p className="text-xs text-muted-foreground">
                Slug: {generateSlug(formData.name)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem-category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem-desc">Description (Optional)</Label>
            <Textarea
              id="problem-desc"
              placeholder="Brief description of this problem..."
              value={formData.description_english}
              onChange={(e) => setFormData(prev => ({ ...prev, description_english: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Problem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
