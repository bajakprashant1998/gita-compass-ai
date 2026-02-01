// Admin-specific types

export interface AdminStats {
  totalChapters: number;
  totalShloks: number;
  publishedShloks: number;
  draftShloks: number;
  totalProblems: number;
  activeLanguages: number;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  enabled: boolean;
  display_order: number;
  created_at?: string;
}

export interface AISearchRule {
  id: string;
  keywords: string[];
  problem_id?: string;
  fallback_shloks: string[];
  priority: number;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
  problem?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AdminActivityLog {
  id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete' | 'publish';
  entity_type: 'shlok' | 'problem' | 'chapter' | 'ai_rule' | 'language';
  entity_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  created_at?: string;
  user?: {
    display_name?: string;
    email?: string;
  };
}

export type ShlokStatus = 'draft' | 'published' | 'scheduled';
export type StoryType = 'corporate' | 'family' | 'youth' | 'global';
export type ProblemCategory = 'mental' | 'leadership' | 'ethics' | 'career' | 'relationships' | 'spiritual';

export type AIGenerationType = 
  | 'transliteration'
  | 'hindi_meaning'
  | 'english_meaning'
  | 'problem_context'
  | 'solution_gita'
  | 'life_application'
  | 'practical_action'
  | 'modern_story'
  | 'suggest_story_type'
  | 'chapter_description'
  | 'suggest_problems';

export interface AIGenerationRequest {
  type: AIGenerationType;
  sanskrit_text?: string;
  english_meaning?: string;
  verse_content?: string;
  story_type?: string;
  story_content?: string;
  chapter_title?: string;
  chapter_theme?: string;
  existing_problems?: Array<{ name: string; category: string }>;
}

export interface StoryTypeConfig {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  keywords: string[];
  display_order: number;
  created_at: string;
}

export interface AdminShlok {
  id: string;
  chapter_id: string;
  verse_number: number;
  sanskrit_text: string;
  transliteration?: string;
  hindi_meaning?: string;
  english_meaning: string;
  life_application?: string;
  practical_action?: string;
  modern_story?: string;
  problem_context?: string;
  solution_gita?: string;
  status: ShlokStatus;
  story_type?: StoryType;
  sanskrit_audio_url?: string;
  scheduled_publish_at?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  chapter?: {
    id: string;
    chapter_number: number;
    title_english: string;
  };
  problems?: Array<{
    id: string;
    name: string;
    relevance_score: number;
  }>;
}

export interface AdminProblem {
  id: string;
  name: string;
  slug: string;
  description_english?: string;
  description_hindi?: string;
  icon?: string;
  color?: string;
  category?: ProblemCategory;
  display_order: number;
  created_at?: string;
  shlok_count?: number;
}

export interface ShlokFilters {
  chapter?: string;
  status?: ShlokStatus;
  problem?: string;
  search?: string;
  page: number;
  perPage: number;
}

export interface ActivityFilters {
  user_id?: string;
  entity_type?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  perPage: number;
}
