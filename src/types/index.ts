export interface Chapter {
  id: string;
  chapter_number: number;
  title_english: string;
  title_hindi?: string;
  title_sanskrit?: string;
  theme: string;
  description_english?: string;
  description_hindi?: string;
  verse_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Problem {
  id: string;
  name: string;
  slug: string;
  description_english?: string;
  description_hindi?: string;
  icon?: string;
  color?: string;
  display_order: number;
  created_at?: string;
}

export interface Shlok {
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
  created_at?: string;
  updated_at?: string;
  chapter?: Chapter;
  problems?: Problem[];
}

export interface ShlokProblem {
  id: string;
  shlok_id: string;
  problem_id: string;
  relevance_score: number;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  preferred_language: 'english' | 'hindi';
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  daily_wisdom_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  shlok_id: string;
  created_at?: string;
  shlok?: Shlok;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  shlok_references?: string[];
  created_at?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  chapters_explored: string[];
  shloks_read: string[];
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  total_reading_time: number;
  created_at?: string;
  updated_at?: string;
}

export type Language = 'english' | 'hindi';
