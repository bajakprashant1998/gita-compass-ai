import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getShlokByChapterAndVerse, getShlok } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

export default function ShlokByVerseRedirect() {
  const { chapterNumber, verseNumber, shlokId } = useParams<{ 
    chapterNumber?: string; 
    verseNumber?: string;
    shlokId?: string;
  }>();
  const navigate = useNavigate();

  // Handle old /shlok/:shlokId URLs - redirect to new format
  const { data: shlokById } = useQuery({
    queryKey: ['shlok', shlokId],
    queryFn: () => getShlok(shlokId!),
    enabled: !!shlokId,
  });

  // Handle old /chapter/:chapterNumber/verse/:verseNumber URLs
  const { data: shlokByVerse, isLoading, error } = useQuery({
    queryKey: ['shlok-by-verse', chapterNumber, verseNumber],
    queryFn: () => getShlokByChapterAndVerse(Number(chapterNumber), Number(verseNumber)),
    enabled: !!chapterNumber && !!verseNumber && !shlokId,
  });

  useEffect(() => {
    // Redirect from /shlok/:id to /chapters/:chapter/verse/:verse
    if (shlokById?.chapter?.chapter_number) {
      navigate(`/chapters/${shlokById.chapter.chapter_number}/verse/${shlokById.verse_number}`, { replace: true });
    }
  }, [shlokById, navigate]);

  useEffect(() => {
    // Redirect from /chapter/:chapterNumber/verse/:verseNumber to /chapters/:chapterNumber/verse/:verseNumber
    if (shlokByVerse && chapterNumber && verseNumber) {
      navigate(`/chapters/${chapterNumber}/verse/${verseNumber}`, { replace: true });
    }
  }, [shlokByVerse, chapterNumber, verseNumber, navigate]);

  if (isLoading || shlokById) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-8 w-64 animate-pulse rounded bg-muted mx-auto mb-4" />
            <p className="text-muted-foreground">Loading verse...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || (!shlokByVerse && !shlokById)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Verse Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {shlokId 
              ? 'This verse could not be found.' 
              : `Chapter ${chapterNumber}, Verse ${verseNumber} could not be found.`
            }
          </p>
          <a href="/chapters" className="text-primary hover:underline">
            Browse all chapters
          </a>
        </div>
      </Layout>
    );
  }

  return null;
}
