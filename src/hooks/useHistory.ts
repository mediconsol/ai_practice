import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { toast } from 'sonner';

type ExecutionHistory = Database['public']['Tables']['execution_history']['Row'];

// 실행 히스토리 조회
export function useHistory(limit?: number) {
  return useQuery({
    queryKey: ['history', limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('execution_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ExecutionHistory[];
    },
  });
}

// 특정 실행 기록 상세 조회
export function useHistoryById(id: string) {
  return useQuery({
    queryKey: ['history', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('execution_history')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ExecutionHistory;
    },
    enabled: !!id,
  });
}

// 실행 기록 삭제
export function useDeleteHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('execution_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success('실행 기록이 삭제되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('실행 기록 삭제 실패', {
        description: error.message,
      });
    },
  });
}

// 여러 실행 기록 일괄 삭제
export function useBulkDeleteHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('execution_history')
        .delete()
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success('선택한 실행 기록이 삭제되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('실행 기록 삭제 실패', {
        description: error.message,
      });
    },
  });
}

// AI 제공자별 필터링
export function useHistoryByProvider(provider: string) {
  return useQuery({
    queryKey: ['history', 'provider', provider],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('execution_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('ai_provider', provider)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExecutionHistory[];
    },
    enabled: !!provider,
  });
}

// 상태별 필터링 (성공/실패)
export function useHistoryByStatus(status: 'success' | 'error') {
  return useQuery({
    queryKey: ['history', 'status', status],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('execution_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExecutionHistory[];
    },
    enabled: !!status,
  });
}
