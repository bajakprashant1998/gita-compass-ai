import { supabase } from '@/integrations/supabase/client';
import type {
  AdminStats,
  Language,
  AISearchRule,
  AdminActivityLog,
  AdminShlok,
  AdminProblem,
  ShlokFilters,
  ActivityFilters,
  ShlokStatus,
  AIGenerationType,
  AIGenerationRequest,
} from '@/types/admin';

// Re-export types for convenience
export type { AIGenerationType, AIGenerationRequest };

// ============================================
// AI GENERATION
// ============================================

export async function generateAIContent(
  type: AIGenerationType,
  params: Omit<AIGenerationRequest, 'type'>
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('admin-ai-generate', {
    body: { type, ...params },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data?.content || '';
}

export async function generateAIContentWithMeta(
  type: AIGenerationType,
  params: Omit<AIGenerationRequest, 'type'>
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke('admin-ai-generate', {
    body: { type, ...params },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data || {};
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getAdminStats(): Promise<AdminStats> {
  const [chaptersRes, shloksRes, problemsRes, languagesRes] = await Promise.all([
    supabase.from('chapters').select('id', { count: 'exact', head: true }),
    supabase.from('shloks').select('id, status'),
    supabase.from('problems').select('id', { count: 'exact', head: true }),
    supabase.from('languages').select('id', { count: 'exact', head: true }).eq('enabled', true),
  ]);

  const shloks = shloksRes.data || [];
  const publishedCount = shloks.filter(s => s.status === 'published').length;
  const draftCount = shloks.filter(s => s.status === 'draft').length;

  return {
    totalChapters: chaptersRes.count || 0,
    totalShloks: shloks.length,
    publishedShloks: publishedCount,
    draftShloks: draftCount,
    totalProblems: problemsRes.count || 0,
    activeLanguages: languagesRes.count || 0,
  };
}

// ============================================
// SHLOK MANAGEMENT
// ============================================

export async function getAdminShloks(filters: ShlokFilters): Promise<{
  data: AdminShlok[];
  count: number;
}> {
  let query = supabase
    .from('shloks')
    .select(`
      *,
      chapter:chapters(id, chapter_number, title_english)
    `, { count: 'exact' });

  if (filters.chapter) {
    query = query.eq('chapter_id', filters.chapter);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.or(`sanskrit_text.ilike.%${filters.search}%,english_meaning.ilike.%${filters.search}%`);
  }

  const from = (filters.page - 1) * filters.perPage;
  const to = from + filters.perPage - 1;

  query = query.order('verse_number', { ascending: true }).range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: (data || []) as unknown as AdminShlok[],
    count: count || 0,
  };
}

export async function getShlokById(id: string): Promise<AdminShlok | null> {
  const { data, error } = await supabase
    .from('shloks')
    .select(`
      *,
      chapter:chapters(id, chapter_number, title_english)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    // Get problem mappings
    const { data: problemMappings } = await supabase
      .from('shlok_problems')
      .select(`
        relevance_score,
        problem:problems(id, name)
      `)
      .eq('shlok_id', id);

    return {
      ...data,
      problems: problemMappings?.map(pm => ({
        id: (pm.problem as any)?.id,
        name: (pm.problem as any)?.name,
        relevance_score: pm.relevance_score || 5,
      })) || [],
    } as unknown as AdminShlok;
  }

  return null;
}

export async function createShlok(data: Partial<AdminShlok>): Promise<AdminShlok> {
  const { data: newShlok, error } = await supabase
    .from('shloks')
    .insert({
      chapter_id: data.chapter_id!,
      verse_number: data.verse_number!,
      sanskrit_text: data.sanskrit_text!,
      transliteration: data.transliteration,
      hindi_meaning: data.hindi_meaning,
      english_meaning: data.english_meaning!,
      life_application: data.life_application,
      practical_action: data.practical_action,
      modern_story: data.modern_story,
      problem_context: data.problem_context,
      solution_gita: data.solution_gita,
      status: data.status || 'draft',
      story_type: data.story_type,
      sanskrit_audio_url: data.sanskrit_audio_url,
      scheduled_publish_at: data.scheduled_publish_at,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;

  return newShlok as unknown as AdminShlok;
}

export async function updateShlok(id: string, data: Partial<AdminShlok>): Promise<AdminShlok> {
  const updateData: Record<string, unknown> = { ...data };
  
  // Set published_at when status changes to published
  if (data.status === 'published') {
    updateData.published_at = new Date().toISOString();
  }

  // Remove nested objects
  delete updateData.chapter;
  delete updateData.problems;

  const { data: updatedShlok, error } = await supabase
    .from('shloks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return updatedShlok as unknown as AdminShlok;
}

export async function deleteShlok(id: string): Promise<void> {
  const { error } = await supabase.from('shloks').delete().eq('id', id);
  if (error) throw error;
}

export async function bulkUpdateShlokStatus(ids: string[], status: ShlokStatus): Promise<void> {
  const updateData: Record<string, unknown> = { status };
  
  if (status === 'published') {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('shloks')
    .update(updateData)
    .in('id', ids);

  if (error) throw error;
}

// ============================================
// PROBLEM MANAGEMENT
// ============================================

export async function getAdminProblems(): Promise<AdminProblem[]> {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;

  // Get shlok counts for each problem
  const problemIds = data?.map(p => p.id) || [];
  const { data: counts } = await supabase
    .from('shlok_problems')
    .select('problem_id')
    .in('problem_id', problemIds);

  const countMap = (counts || []).reduce((acc, curr) => {
    acc[curr.problem_id] = (acc[curr.problem_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (data || []).map(p => ({
    ...p,
    shlok_count: countMap[p.id] || 0,
  })) as unknown as AdminProblem[];
}

export async function createProblem(data: Partial<AdminProblem>): Promise<AdminProblem> {
  const { data: newProblem, error } = await supabase
    .from('problems')
    .insert({
      name: data.name!,
      slug: data.slug!,
      description_english: data.description_english,
      description_hindi: data.description_hindi,
      icon: data.icon,
      color: data.color,
      category: data.category,
      display_order: data.display_order || 0,
    })
    .select()
    .single();

  if (error) throw error;

  return newProblem as unknown as AdminProblem;
}

export async function updateProblem(id: string, data: Partial<AdminProblem>): Promise<AdminProblem> {
  const updateData = { ...data };
  delete updateData.shlok_count;

  const { data: updatedProblem, error } = await supabase
    .from('problems')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return updatedProblem as unknown as AdminProblem;
}

export async function deleteProblem(id: string): Promise<void> {
  const { error } = await supabase.from('problems').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// CHAPTER MANAGEMENT
// ============================================

export async function getChapters() {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .order('chapter_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateChapter(id: string, data: Partial<{
  title_english: string;
  title_hindi: string;
  title_sanskrit: string;
  theme: string;
  description_english: string;
  description_hindi: string;
}>) {
  const { data: updated, error } = await supabase
    .from('chapters')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

// ============================================
// LANGUAGE MANAGEMENT
// ============================================

export async function getLanguages(): Promise<Language[]> {
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data || []) as Language[];
}

export async function toggleLanguage(id: string, enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('languages')
    .update({ enabled })
    .eq('id', id);

  if (error) throw error;
}

export async function createLanguage(data: Partial<Language>): Promise<Language> {
  const { data: newLang, error } = await supabase
    .from('languages')
    .insert({
      code: data.code!,
      name: data.name!,
      native_name: data.native_name!,
      enabled: data.enabled ?? false,
      display_order: data.display_order || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return newLang as Language;
}

// ============================================
// AI SEARCH RULES
// ============================================

export async function getAIRules(): Promise<AISearchRule[]> {
  const { data, error } = await supabase
    .from('ai_search_rules')
    .select(`
      *,
      problem:problems(id, name, slug)
    `)
    .order('priority', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as AISearchRule[];
}

export async function createAIRule(data: Partial<AISearchRule>): Promise<AISearchRule> {
  const { data: newRule, error } = await supabase
    .from('ai_search_rules')
    .insert({
      keywords: data.keywords || [],
      problem_id: data.problem_id,
      fallback_shloks: data.fallback_shloks || [],
      priority: data.priority || 5,
      enabled: data.enabled ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return newRule as unknown as AISearchRule;
}

export async function updateAIRule(id: string, data: Partial<AISearchRule>): Promise<AISearchRule> {
  const updateData = { ...data };
  delete updateData.problem;

  const { data: updated, error } = await supabase
    .from('ai_search_rules')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated as unknown as AISearchRule;
}

export async function deleteAIRule(id: string): Promise<void> {
  const { error } = await supabase.from('ai_search_rules').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// ACTIVITY LOG
// ============================================

export async function getActivityLog(filters: ActivityFilters): Promise<{
  data: AdminActivityLog[];
  count: number;
}> {
  let query = supabase
    .from('admin_activity_log')
    .select('*', { count: 'exact' });

  if (filters.entity_type) {
    query = query.eq('entity_type', filters.entity_type);
  }

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  const from = (filters.page - 1) * filters.perPage;
  const to = from + filters.perPage - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: (data || []) as unknown as AdminActivityLog[],
    count: count || 0,
  };
}

export async function logActivity(
  action: AdminActivityLog['action'],
  entityType: AdminActivityLog['entity_type'],
  entityId?: string,
  oldValue?: Record<string, unknown>,
  newValue?: Record<string, unknown>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;

  const { error } = await supabase.from('admin_activity_log').insert([{
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_value: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
    new_value: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
  }]);

  if (error) {
    console.error('Failed to log activity:', error);
  }
}

// ============================================
// SHLOK-PROBLEM MAPPING
// ============================================

export async function updateShlokProblems(
  shlokId: string,
  problems: Array<{ id: string; relevance_score: number }>
): Promise<void> {
  // Delete existing mappings
  await supabase.from('shlok_problems').delete().eq('shlok_id', shlokId);

  if (problems.length === 0) return;

  // Insert new mappings
  const { error } = await supabase.from('shlok_problems').insert(
    problems.map(p => ({
      shlok_id: shlokId,
      problem_id: p.id,
      relevance_score: p.relevance_score,
    }))
  );

  if (error) throw error;
}
