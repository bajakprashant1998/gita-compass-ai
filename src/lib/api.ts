import { supabase } from '@/integrations/supabase/client';
import type { Chapter, Shlok, Problem } from '@/types';

export async function getChapters(): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .order('chapter_number');
  
  if (error) throw error;
  return data as Chapter[];
}

export async function getChapter(chapterNumber: number): Promise<Chapter | null> {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('chapter_number', chapterNumber)
    .single();
  
  if (error) throw error;
  return data as Chapter;
}

export async function getProblems(): Promise<Problem[]> {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data as Problem[];
}

export async function getProblem(slug: string): Promise<Problem | null> {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  return data as Problem;
}

export async function getShloksByChapter(chapterId: string): Promise<Shlok[]> {
  const { data, error } = await supabase
    .from('shloks')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('verse_number');
  
  if (error) throw error;
  return data as Shlok[];
}

export async function getShlok(shlokId: string): Promise<Shlok | null> {
  const { data, error } = await supabase
    .from('shloks')
    .select('*, chapters(*)')
    .eq('id', shlokId)
    .single();
  
  if (error) throw error;
  
  // Transform the response
  const shlok = data as any;
  return {
    ...shlok,
    chapter: shlok.chapters,
  } as Shlok;
}

export async function getShloksByProblem(problemId: string): Promise<Shlok[]> {
  const { data, error } = await supabase
    .from('shlok_problems')
    .select('shlok_id, shloks(*)')
    .eq('problem_id', problemId)
    .order('relevance_score', { ascending: false });
  
  if (error) throw error;
  
  return (data as any[]).map(item => item.shloks) as Shlok[];
}

export async function getRandomShlok(): Promise<Shlok | null> {
  const { data, error } = await supabase
    .from('shloks')
    .select('*, chapters(*)')
    .limit(10);
  
  if (error) throw error;
  if (!data || data.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * data.length);
  const shlok = data[randomIndex] as any;
  
  return {
    ...shlok,
    chapter: shlok.chapters,
  } as Shlok;
}

export async function searchShloks(query: string): Promise<Shlok[]> {
  const { data, error } = await supabase
    .from('shloks')
    .select('*, chapters(*)')
    .or(`english_meaning.ilike.%${query}%,life_application.ilike.%${query}%,practical_action.ilike.%${query}%`)
    .limit(20);
  
  if (error) throw error;
  
  return (data as any[]).map(item => ({
    ...item,
    chapter: item.chapters,
  })) as Shlok[];
}

export async function getStats() {
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
