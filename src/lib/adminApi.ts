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
// ADMIN CRUD HELPER (Uses Edge Function)
// ============================================

type TableName =
  | 'shloks'
  | 'problems'
  | 'chapters'
  | 'languages'
  | 'ai_search_rules'
  | 'shlok_problems'
  | 'admin_activity_log';

type Operation = 'create' | 'update' | 'delete' | 'bulk_update' | 'upsert';

async function adminCrud<T>(
  table: TableName,
  operation: Operation,
  options: {
    data?: Record<string, unknown>;
    id?: string;
    ids?: string[];
    conflictColumns?: string;
  } = {}
): Promise<T> {
  const { data, error } = await supabase.functions.invoke('admin-crud', {
    body: { table, operation, ...options },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data as T;
}

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

  if (chaptersRes.error) throw new Error(`Chapters Error: ${chaptersRes.error.message}`);
  if (shloksRes.error) throw new Error(`Shloks Error: ${shloksRes.error.message}`);
  if (problemsRes.error) throw new Error(`Problems Error: ${problemsRes.error.message}`);
  if (languagesRes.error) throw new Error(`Languages Error: ${languagesRes.error.message}`);

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
    // Sanitize special characters that could break PostgREST queries
    const sanitizedSearch = filters.search.replace(/[%_(),.*]/g, '');
    query = query.or(`sanskrit_text.ilike.%${sanitizedSearch}%,english_meaning.ilike.%${sanitizedSearch}%`);
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
  const insertData = {
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
  };

  return adminCrud<AdminShlok>('shloks', 'create', { data: insertData });
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

  return adminCrud<AdminShlok>('shloks', 'update', { id, data: updateData });
}

export async function deleteShlok(id: string): Promise<void> {
  await adminCrud<{ success: boolean }>('shloks', 'delete', { id });
}

export async function bulkUpdateShlokStatus(ids: string[], status: ShlokStatus): Promise<void> {
  const updateData: Record<string, unknown> = { status };

  if (status === 'published') {
    updateData.published_at = new Date().toISOString();
  }

  await adminCrud<{ success: boolean }>('shloks', 'bulk_update', { ids, data: updateData });
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
  const insertData = {
    name: data.name!,
    slug: data.slug!,
    description_english: data.description_english,
    description_hindi: data.description_hindi,
    icon: data.icon,
    color: data.color,
    category: data.category,
    display_order: data.display_order || 0,
  };

  return adminCrud<AdminProblem>('problems', 'create', { data: insertData });
}

export async function updateProblem(id: string, data: Partial<AdminProblem>): Promise<AdminProblem> {
  const updateData = { ...data };
  delete updateData.shlok_count;

  return adminCrud<AdminProblem>('problems', 'update', { id, data: updateData });
}

export async function deleteProblem(id: string): Promise<void> {
  await adminCrud<{ success: boolean }>('problems', 'delete', { id });
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
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
}>) {
  return adminCrud('chapters', 'update', { id, data });
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
  await adminCrud('languages', 'update', { id, data: { enabled } });
}

export async function createLanguage(data: Partial<Language>): Promise<Language> {
  const insertData = {
    code: data.code!,
    name: data.name!,
    native_name: data.native_name!,
    enabled: data.enabled ?? false,
    display_order: data.display_order || 0,
  };

  return adminCrud<Language>('languages', 'create', { data: insertData });
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
  const insertData = {
    keywords: data.keywords || [],
    problem_id: data.problem_id,
    fallback_shloks: data.fallback_shloks || [],
    priority: data.priority || 5,
    enabled: data.enabled ?? true,
  };

  return adminCrud<AISearchRule>('ai_search_rules', 'create', { data: insertData });
}

export async function updateAIRule(id: string, data: Partial<AISearchRule>): Promise<AISearchRule> {
  const updateData = { ...data };
  delete updateData.problem;

  return adminCrud<AISearchRule>('ai_search_rules', 'update', { id, data: updateData });
}

export async function deleteAIRule(id: string): Promise<void> {
  await adminCrud<{ success: boolean }>('ai_search_rules', 'delete', { id });
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

  // Use a placeholder user ID if not authenticated (for dev mode)
  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  try {
    await adminCrud('admin_activity_log', 'create', {
      data: {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_value: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
        new_value: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      },
    });
  } catch (error) {
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
  // First, get existing problem mappings for this shlok
  const { data: existingMappings } = await supabase
    .from('shlok_problems')
    .select('id, problem_id')
    .eq('shlok_id', shlokId);

  const existingProblemIds = new Set((existingMappings || []).map(m => m.problem_id));
  const newProblemIds = new Set(problems.map(p => p.id));

  // Delete mappings that are no longer needed
  const toDelete = (existingMappings || []).filter(m => !newProblemIds.has(m.problem_id));
  for (const mapping of toDelete) {
    await adminCrud('shlok_problems', 'delete', { id: mapping.id });
  }

  // Upsert new/updated mappings (only those that don't already exist or need update)
  for (const p of problems) {
    if (!existingProblemIds.has(p.id)) {
      // Only create if it doesn't exist
      await adminCrud('shlok_problems', 'create', {
        data: {
          shlok_id: shlokId,
          problem_id: p.id,
          relevance_score: p.relevance_score,
        },
      });
    } else {
      // Update existing mapping's relevance score
      const existingMapping = existingMappings?.find(m => m.problem_id === p.id);
      if (existingMapping) {
        await adminCrud('shlok_problems', 'update', {
          id: existingMapping.id,
          data: { relevance_score: p.relevance_score },
        });
      }
    }
  }
}
