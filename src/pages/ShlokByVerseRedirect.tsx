import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getShlokByChapterAndVerse } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

export default function ShlokByVerseRedirect() {
  const { chapterNumber, verseNumber } = useParams<{ chapterNumber: string; verseNumber: string }>();
  const navigate = useNavigate();

  const { data: shlok, isLoading, error } = useQuery({
    queryKey: ['shlok-by-verse', chapterNumber, verseNumber],
    queryFn: () => getShlokByChapterAndVerse(Number(chapterNumber), Number(verseNumber)),
    enabled: !!chapterNumber && !!verseNumber,
  });

  useEffect(() => {
    if (shlok?.id) {
      navigate(`/shlok/${shlok.id}`, { replace: true });
    }
  }, [shlok, navigate]);

  if (isLoading) {
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

  if (error || !shlok) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Verse Not Found</h1>
          <p className="text-muted-foreground mb-4">
            Chapter {chapterNumber}, Verse {verseNumber} could not be found.
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
