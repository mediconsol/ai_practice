import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { toast } from 'sonner';

type Prompt = Database['public']['Tables']['prompts']['Row'];
type PromptInsert = Database['public']['Tables']['prompts']['Insert'];
type PromptUpdate = Database['public']['Tables']['prompts']['Update'];

// 프롬프트 목록 조회
export function usePrompts() {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Prompt[];
    },
  });
}

// 프롬프트 생성
export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPrompt: Omit<PromptInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await supabase
        .from('prompts')
        .insert({
          ...newPrompt,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success('프롬프트가 생성되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프롬프트 생성 실패', {
        description: error.message,
      });
    },
  });
}

// 프롬프트 수정
export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PromptUpdate }) => {
      const { data, error } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success('프롬프트가 수정되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프롬프트 수정 실패', {
        description: error.message,
      });
    },
  });
}

// 프롬프트 삭제
export function useDeletePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success('프롬프트가 삭제되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프롬프트 삭제 실패', {
        description: error.message,
      });
    },
  });
}

// 즐겨찾기 토글
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('prompts')
        .update({ is_favorite: !isFavorite })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

// 프롬프트 내보내기
export function useExportPrompts() {
  return useMutation({
    mutationFn: async ({ format, promptIds }: {
      format: 'json' | 'csv';
      promptIds?: string[]
    }) => {
      const { data, error } = await supabase.functions.invoke('export-prompts', {
        body: { format, promptIds },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // 파일 다운로드
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: variables.format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompts-${new Date().toISOString().split('T')[0]}.${variables.format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('프롬프트를 내보냈습니다.');
    },
    onError: (error: Error) => {
      toast.error('내보내기 실패', {
        description: error.message,
      });
    },
  });
}

// 프롬프트 가져오기
export function useImportPrompts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prompts: any[]) => {
      const { data, error } = await supabase.functions.invoke('import-prompts', {
        body: { prompts },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success(`${data.imported}개의 프롬프트를 가져왔습니다.`, {
        description: data.skipped > 0 ? `${data.skipped}개 건너뜀` : undefined,
      });
    },
    onError: (error: Error) => {
      toast.error('가져오기 실패', {
        description: error.message,
      });
    },
  });
}
