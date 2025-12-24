import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// TypeScript 타입 정의
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// Database 타입은 Supabase CLI로 자동 생성 예정
// supabase gen types typescript --local > src/lib/database.types.ts

// 프로그램 타입 정의
export type ProgramType = 'chat' | 'form' | 'template';

// 프로그램 설정 타입
export interface ProgramConfig {
  // Chat Type
  system_prompt?: string;
  artifacts_enabled?: boolean;

  // Form Type
  form_schema?: FormField[];
  output_template?: string;

  // Template Type
  templates?: ProgramTemplate[];

  // Common
  ai_provider?: 'openai' | 'claude' | 'gemini';
  ai_model?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ProgramTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  variables?: string[];
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          hospital: string | null;
          department: string | null;
          subscription_tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Tables<'profiles'>, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Tables<'profiles'>>;
      };
      programs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          icon: string | null;
          gradient: string | null;
          is_public: boolean;
          is_new: boolean;
          program_type: ProgramType;
          config: ProgramConfig | null;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Tables<'programs'>, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Tables<'programs'>>;
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          program_id: string | null;
          title: string;
          content: string;
          category: string;
          is_favorite: boolean;
          usage_count: number;
          variables: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Tables<'prompts'>, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Tables<'prompts'>>;
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: 'active' | 'completed' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Tables<'projects'>, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Tables<'projects'>>;
      };
      execution_history: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string | null;
          prompt_title: string;
          prompt_content: string;
          ai_provider: string;
          ai_model: string | null;
          result_content: string | null;
          status: 'success' | 'error';
          error_message: string | null;
          duration_ms: number | null;
          token_usage: any | null;
          created_at: string;
        };
        Insert: Omit<Tables<'execution_history'>, 'id' | 'created_at'>;
        Update: Partial<Tables<'execution_history'>>;
      };
    };
    Enums: {
      subscription_tier: 'free' | 'pro' | 'enterprise';
      project_status: 'active' | 'completed' | 'archived';
      execution_status: 'success' | 'error';
      ai_provider: 'openai' | 'gemini' | 'claude' | 'internal';
      program_type: 'chat' | 'form' | 'template';
    };
  };
}
