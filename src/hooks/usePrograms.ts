import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { toast } from 'sonner';

type Program = Database['public']['Tables']['programs']['Row'];
type ProgramInsert = Database['public']['Tables']['programs']['Insert'];
type ProgramUpdate = Database['public']['Tables']['programs']['Update'];

export interface ProgramWithPromptCount extends Program {
  prompt_count: number;
}

// 모든 프로그램 조회 (공개 프로그램 + 내 프로그램)
export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // 공개 프로그램 또는 내가 만든 프로그램
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          prompts(count)
        `)
        .or(`is_public.eq.true${user ? `,user_id.eq.${user.id}` : ''}`)
        .order('usage_count', { ascending: false });

      if (error) throw error;

      // prompt_count 추가
      return (data as any[]).map((program) => ({
        ...program,
        prompt_count: program.prompts[0]?.count || 0,
        prompts: undefined, // 불필요한 필드 제거
      })) as ProgramWithPromptCount[];
    },
  });
}

// 내 프로그램만 조회
export function useMyPrograms() {
  return useQuery({
    queryKey: ['my-programs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          prompts(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data as any[]).map((program) => ({
        ...program,
        prompt_count: program.prompts[0]?.count || 0,
        prompts: undefined,
      })) as ProgramWithPromptCount[];
    },
  });
}

// 공개 프로그램만 조회
export function usePublicPrograms() {
  return useQuery({
    queryKey: ['public-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          prompts(count)
        `)
        .eq('is_public', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;

      return (data as any[]).map((program) => ({
        ...program,
        prompt_count: program.prompts[0]?.count || 0,
        prompts: undefined,
      })) as ProgramWithPromptCount[];
    },
  });
}

// 프로그램 생성
export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProgram: Omit<ProgramInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await supabase
        .from('programs')
        .insert({
          ...newProgram,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['my-programs'] });
      toast.success('프로그램이 생성되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프로그램 생성 실패', {
        description: error.message,
      });
    },
  });
}

// 프로그램 수정
export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProgramUpdate }) => {
      const { data, error } = await supabase
        .from('programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['my-programs'] });
      toast.success('프로그램이 수정되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프로그램 수정 실패', {
        description: error.message,
      });
    },
  });
}

// 프로그램 삭제
export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['my-programs'] });
      toast.success('프로그램이 삭제되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프로그램 삭제 실패', {
        description: error.message,
      });
    },
  });
}

// 프로그램 사용 횟수 증가
export function useIncrementProgramUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('increment_program_usage', {
        program_id: id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
    onError: (error: Error) => {
      console.error('프로그램 사용 횟수 증가 실패:', error);
    },
  });
}
