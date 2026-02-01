import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Loader2 } from 'lucide-react';
import { getChapters } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';

interface Chapter {
  id: string;
  chapter_number: number;
  title_english: string;
  title_hindi?: string;
  title_sanskrit?: string;
  theme: string;
  verse_count?: number;
}

export default function AdminChapterList() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const data = await getChapters();
        setChapters(data);
      } catch (error) {
        console.error('Failed to load chapters:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chapters',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadChapters();
  }, [toast]);

  return (
    <AdminLayout title="Chapters" subtitle="Manage the 18 chapters of Bhagavad Gita">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead>English Title</TableHead>
              <TableHead>Hindi Title</TableHead>
              <TableHead>Sanskrit</TableHead>
              <TableHead>Theme</TableHead>
              <TableHead className="text-center">Verses</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : chapters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No chapters found
                </TableCell>
              </TableRow>
            ) : (
              chapters.map((chapter) => (
                <TableRow key={chapter.id}>
                  <TableCell className="font-bold">{chapter.chapter_number}</TableCell>
                  <TableCell className="font-medium">{chapter.title_english}</TableCell>
                  <TableCell>{chapter.title_hindi || '-'}</TableCell>
                  <TableCell className="font-serif">{chapter.title_sanskrit || '-'}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {chapter.theme}
                  </TableCell>
                  <TableCell className="text-center">{chapter.verse_count || 0}</TableCell>
                  <TableCell>
                    <Button asChild size="icon" variant="ghost">
                      <Link to={`/admin/chapters/edit/${chapter.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
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
