import { supabase } from '@/integrations/supabase/client';
import type { Chapter, Shlok, Problem } from '@/types';

// Helper for public data queries that don't need auth
async function publicQuery<T>(table: string, params: string = ''): Promise<T[]> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}${params ? '?' + params : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

export async function getChapters(): Promise<Chapter[]> {
  return publicQuery<Chapter>('chapters', 'select=*&order=chapter_number');
}

export async function getChapter(chapterNumber: number): Promise<Chapter | null> {
  const data = await publicQuery<Chapter>('chapters', `select=*&chapter_number=eq.${chapterNumber}`);
  return data[0] || null;
}

export async function getProblems(): Promise<Problem[]> {
  return publicQuery<Problem>('problems', 'select=*&order=display_order');
}

export async function getProblem(slug: string): Promise<Problem | null> {
  const data = await publicQuery<Problem>('problems', `select=*&slug=eq.${slug}`);
  return data[0] || null;
}

export async function getShloksByChapter(chapterId: string): Promise<Shlok[]> {
  return publicQuery<Shlok>('shloks', `select=*&chapter_id=eq.${chapterId}&order=verse_number`);
}

export async function getShlok(shlokId: string): Promise<Shlok | null> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shloks?select=*,chapters(*)&id=eq.${shlokId}`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  const data = await response.json();
  if (!data || data.length === 0) return null;
  
  // Fetch problems for this shlok
  const problemsUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shlok_problems?select=problems(*)&shlok_id=eq.${shlokId}&order=relevance_score.desc`;
  const problemsResponse = await fetch(problemsUrl, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  
  const problemData = problemsResponse.ok ? await problemsResponse.json() : [];
  
  const shlok = data[0];
  return {
    ...shlok,
    chapter: shlok.chapters,
    problems: problemData?.map((p: any) => p.problems).filter(Boolean) || [],
  } as Shlok;
}

export async function getShloksByProblem(problemId: string): Promise<Shlok[]> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shlok_problems?select=shlok_id,shloks(*,chapters(*))&problem_id=eq.${problemId}&order=relevance_score.desc`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  const data = await response.json();
  
  return data.map((item: any) => ({
    ...item.shloks,
    chapter: item.shloks?.chapters,
  })) as Shlok[];
}

export async function getShlokByChapterAndVerse(chapterNumber: number, verseNumber: number): Promise<Shlok | null> {
  // First get the chapter by chapter_number
  const chapters = await publicQuery<Chapter>('chapters', `select=id&chapter_number=eq.${chapterNumber}`);
  
  if (!chapters || chapters.length === 0) return null;
  const chapter = chapters[0];
  
  // Then get the shlok by chapter_id and verse_number
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shloks?select=*,chapters(*)&chapter_id=eq.${chapter.id}&verse_number=eq.${verseNumber}`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  const data = await response.json();
  if (!data || data.length === 0) return null;
  
  // Fetch problems for this shlok
  const shlokData = data[0];
  const problemsUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shlok_problems?select=problems(*)&shlok_id=eq.${shlokData.id}&order=relevance_score.desc`;
  const problemsResponse = await fetch(problemsUrl, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  
  const problemData = problemsResponse.ok ? await problemsResponse.json() : [];
  
  return {
    ...shlokData,
    chapter: shlokData.chapters,
    problems: problemData?.map((p: any) => p.problems).filter(Boolean) || [],
  } as Shlok;
}

export async function getRandomShlok(): Promise<Shlok | null> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shloks?select=*,chapters(*)&limit=10`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  const data = await response.json();
  if (!data || data.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * data.length);
  const shlok = data[randomIndex];
  
  return {
    ...shlok,
    chapter: shlok.chapters,
  } as Shlok;
}

// Sanitize special characters that could break PostgREST queries
function sanitizeSearchQuery(query: string): string {
  return query.replace(/[%_(),.*]/g, '');
}

export async function searchShloks(query: string): Promise<Shlok[]> {
  const sanitizedQuery = sanitizeSearchQuery(query);
  const encodedQuery = encodeURIComponent(`%${sanitizedQuery}%`);
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shloks?select=*,chapters(*)&or=(english_meaning.ilike.${encodedQuery},life_application.ilike.${encodedQuery},practical_action.ilike.${encodedQuery})&limit=20`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  const data = await response.json();
  
  return data.map((item: any) => ({
    ...item,
    chapter: item.chapters,
  })) as Shlok[];
}

export async function getStats() {
  // Use Supabase client for count queries (these don't block on auth)
  const [chaptersResult, shloksResult, problemsResult] = await Promise.all([
    supabase.from('chapters').select('id', { count: 'exact', head: true }),
    supabase.from('shloks').select('id', { count: 'exact', head: true }),
    supabase.from('problems').select('id', { count: 'exact', head: true }),
  ]);
  
  return {
    chapters: chaptersResult.count || 18,
    shloks: shloksResult.count || 700,
    problems: problemsResult.count || 8,
  };
}

// Get translation for a shlok in a specific language
export async function getShlokTranslation(shlokId: string, languageCode: string) {
  const { data, error } = await supabase
    .from('shlok_translations')
    .select('*')
    .eq('shlok_id', shlokId)
    .eq('language_code', languageCode)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

// Get all enabled languages
export async function getLanguages() {
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .eq('enabled', true)
    .order('display_order');
  
  if (error) throw error;
  return data || [];
}
