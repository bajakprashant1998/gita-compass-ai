export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_search_rules: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          fallback_shloks: string[] | null
          id: string
          keywords: string[]
          priority: number | null
          problem_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          fallback_shloks?: string[] | null
          id?: string
          keywords?: string[]
          priority?: number | null
          problem_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          fallback_shloks?: string[] | null
          id?: string
          keywords?: string[]
          priority?: number | null
          problem_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_search_rules_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          chapter_number: number
          created_at: string | null
          description_english: string | null
          description_hindi: string | null
          id: string
          theme: string
          title_english: string
          title_hindi: string | null
          title_sanskrit: string | null
          updated_at: string | null
          verse_count: number | null
        }
        Insert: {
          chapter_number: number
          created_at?: string | null
          description_english?: string | null
          description_hindi?: string | null
          id?: string
          theme: string
          title_english: string
          title_hindi?: string | null
          title_sanskrit?: string | null
          updated_at?: string | null
          verse_count?: number | null
        }
        Update: {
          chapter_number?: number
          created_at?: string | null
          description_english?: string | null
          description_hindi?: string | null
          id?: string
          theme?: string
          title_english?: string
          title_hindi?: string | null
          title_sanskrit?: string | null
          updated_at?: string | null
          verse_count?: number | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
          shlok_references: string[] | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
          shlok_references?: string[] | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
          shlok_references?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          shlok_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          shlok_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          shlok_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_shlok_id_fkey"
            columns: ["shlok_id"]
            isOneToOne: false
            referencedRelation: "shloks"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          display_order: number | null
          enabled: boolean | null
          id: string
          name: string
          native_name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          display_order?: number | null
          enabled?: boolean | null
          id?: string
          name: string
          native_name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          display_order?: number | null
          enabled?: boolean | null
          id?: string
          name?: string
          native_name?: string
        }
        Relationships: []
      }
      problems: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          description_english: string | null
          description_hindi: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description_english?: string | null
          description_hindi?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description_english?: string | null
          description_hindi?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          preferred_language: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          preferred_language?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          preferred_language?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shlok_problems: {
        Row: {
          id: string
          problem_id: string
          relevance_score: number | null
          shlok_id: string
        }
        Insert: {
          id?: string
          problem_id: string
          relevance_score?: number | null
          shlok_id: string
        }
        Update: {
          id?: string
          problem_id?: string
          relevance_score?: number | null
          shlok_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shlok_problems_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shlok_problems_shlok_id_fkey"
            columns: ["shlok_id"]
            isOneToOne: false
            referencedRelation: "shloks"
            referencedColumns: ["id"]
          },
        ]
      }
      shloks: {
        Row: {
          chapter_id: string
          created_at: string | null
          english_meaning: string
          hindi_meaning: string | null
          id: string
          life_application: string | null
          modern_story: string | null
          practical_action: string | null
          problem_context: string | null
          published_at: string | null
          sanskrit_audio_url: string | null
          sanskrit_text: string
          scheduled_publish_at: string | null
          solution_gita: string | null
          status: string | null
          story_type: string | null
          transliteration: string | null
          updated_at: string | null
          verse_number: number
        }
        Insert: {
          chapter_id: string
          created_at?: string | null
          english_meaning: string
          hindi_meaning?: string | null
          id?: string
          life_application?: string | null
          modern_story?: string | null
          practical_action?: string | null
          problem_context?: string | null
          published_at?: string | null
          sanskrit_audio_url?: string | null
          sanskrit_text: string
          scheduled_publish_at?: string | null
          solution_gita?: string | null
          status?: string | null
          story_type?: string | null
          transliteration?: string | null
          updated_at?: string | null
          verse_number: number
        }
        Update: {
          chapter_id?: string
          created_at?: string | null
          english_meaning?: string
          hindi_meaning?: string | null
          id?: string
          life_application?: string | null
          modern_story?: string | null
          practical_action?: string | null
          problem_context?: string | null
          published_at?: string | null
          sanskrit_audio_url?: string | null
          sanskrit_text?: string
          scheduled_publish_at?: string | null
          solution_gita?: string | null
          status?: string | null
          story_type?: string | null
          transliteration?: string | null
          updated_at?: string | null
          verse_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "shloks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      story_types: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          display_order: number | null
          id: string
          keywords: string[] | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          display_order?: number | null
          id?: string
          keywords?: string[] | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          display_order?: number | null
          id?: string
          keywords?: string[] | null
          name?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          daily_wisdom_enabled: boolean | null
          id: string
          notifications_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_wisdom_enabled?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_wisdom_enabled?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          chapters_explored: string[] | null
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          shloks_read: string[] | null
          total_reading_time: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chapters_explored?: string[] | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          shloks_read?: string[] | null
          total_reading_time?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chapters_explored?: string[] | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          shloks_read?: string[] | null
          total_reading_time?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
