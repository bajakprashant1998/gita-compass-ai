import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StoryType {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  keywords: string[];
  display_order: number;
}

interface StoryTypeManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTypesUpdated?: () => void;
}

export function StoryTypeManager({ open, onOpenChange, onTypesUpdated }: StoryTypeManagerProps) {
  const { toast } = useToast();
  const [storyTypes, setStoryTypes] = useState<StoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingType, setEditingType] = useState<StoryType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    keywords: '',
  });

  const loadStoryTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('story_types')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setStoryTypes(data || []);
    } catch (error) {
      console.error('Failed to load story types:', error);
      toast({
        title: 'Error',
        description: 'Failed to load story types',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadStoryTypes();
    }
  }, [open]);

  const handleEdit = (type: StoryType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      display_name: type.display_name,
      description: type.description || '',
      keywords: type.keywords.join(', '),
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingType(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      keywords: '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.display_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and display name are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const keywords = formData.keywords
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(Boolean);

      const saveData = {
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        display_name: formData.display_name,
        description: formData.description || null,
        keywords,
        display_order: editingType?.display_order || storyTypes.length + 1,
      };

      if (editingType) {
        const { error } = await supabase
          .from('story_types')
          .update(saveData)
          .eq('id', editingType.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('story_types')
          .insert(saveData);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: editingType ? 'Story type updated' : 'Story type created',
      });

      setIsEditing(false);
      loadStoryTypes();
      onTypesUpdated?.();
    } catch (error) {
      console.error('Failed to save story type:', error);
      toast({
        title: 'Error',
        description: 'Failed to save story type',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story type?')) return;

    try {
      const { error } = await supabase
        .from('story_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Story type deleted',
      });

      loadStoryTypes();
      onTypesUpdated?.();
    } catch (error) {
      console.error('Failed to delete story type:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete story type',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? editingType
                ? 'Edit Story Type'
                : 'Create Story Type'
              : 'Manage Story Types'}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="st-name">Internal Name *</Label>
                <Input
                  id="st-name"
                  placeholder="e.g., corporate"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="st-display">Display Name *</Label>
                <Input
                  id="st-display"
                  placeholder="e.g., Corporate / Business"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="st-desc">Description</Label>
              <Textarea
                id="st-desc"
                placeholder="When to use this story type..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="st-keywords">Keywords (comma-separated)</Label>
              <Input
                id="st-keywords"
                placeholder="office, boss, team, deadline"
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Keywords help AI auto-detect the appropriate story type
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingType ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {storyTypes.map(type => (
                    <Card key={type.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{type.display_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {type.name}
                            </Badge>
                          </div>
                          {type.description && (
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          )}
                          {type.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {type.keywords.slice(0, 5).map(kw => (
                                <Badge key={kw} variant="secondary" className="text-xs">
                                  {kw}
                                </Badge>
                              ))}
                              {type.keywords.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{type.keywords.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(type)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDelete(type.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button onClick={handleCreate} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Story Type
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
