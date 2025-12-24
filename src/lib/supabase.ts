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
      collections: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          preview_mode: 'html' | 'artifact';
          artifact_url: string | null;
          storage_path: string | null;
          memo: string | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Tables<'collections'>, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Tables<'collections'>>;
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

// ============================================
// Storage 헬퍼 함수
// ============================================

/**
 * 컬렉션 파일을 Supabase Storage에 업로드
 * @param userId 사용자 ID
 * @param collectionId 컬렉션 ID
 * @param content 파일 내용 (HTML, Python 또는 React/JSX 코드)
 * @param extension 파일 확장자 ('html', 'py', 'jsx')
 * @returns 업로드된 파일 경로와 에러 정보
 */
export async function uploadCollectionFile(
  userId: string,
  collectionId: string,
  content: string,
  extension: 'html' | 'py' | 'jsx' = 'html'
): Promise<{ path: string | null; error: Error | null }> {
  const filePath = `${userId}/${collectionId}.${extension}`;
  const mimeType = extension === 'py' ? 'text/x-python' : extension === 'jsx' ? 'text/jsx' : 'text/html';

  const { error } = await supabase.storage
    .from('collections')
    .upload(filePath, new Blob([content], { type: mimeType }), {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Storage upload error:', error);
    return { path: null, error };
  }

  return { path: filePath, error: null };
}

/**
 * HTML 컬렉션 파일을 Supabase Storage에서 다운로드
 * @param storagePath Storage 파일 경로
 * @returns HTML 소스 코드와 에러 정보
 */
export async function downloadCollectionFile(
  storagePath: string
): Promise<{ content: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from('collections')
    .download(storagePath);

  if (error || !data) {
    console.error('Storage download error:', error);
    return { content: null, error };
  }

  const content = await data.text();
  return { content, error: null };
}

/**
 * HTML 컬렉션 파일을 Supabase Storage에서 삭제
 * @param storagePath Storage 파일 경로
 * @returns 에러 정보
 */
export async function deleteCollectionFile(
  storagePath: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage
    .from('collections')
    .remove([storagePath]);

  if (error) {
    console.error('Storage delete error:', error);
  }

  return { error };
}

/**
 * Storage 파일의 공개 URL 생성
 * @param storagePath Storage 파일 경로
 * @returns 공개 URL
 */
export function getCollectionPublicUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from('collections')
    .getPublicUrl(storagePath);

  return data.publicUrl;
}
