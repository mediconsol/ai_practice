import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { toast } from 'sonner';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export interface ProjectWithPromptCount extends Project {
  prompt_count: number;
}

// 내 프로젝트 조회 (프롬프트 수 포함)
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_prompts(count)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // prompt_count 추가
      return (data as any[]).map((project) => ({
        ...project,
        prompt_count: project.project_prompts[0]?.count || 0,
        project_prompts: undefined, // 불필요한 필드 제거
      })) as ProjectWithPromptCount[];
    },
  });
}

// 프로젝트 상세 조회 (포함된 프롬프트 목록)
export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_prompts(
            prompt_id,
            prompts(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// 프로젝트 생성
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProject: Omit<ProjectInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...newProject,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('프로젝트가 생성되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프로젝트 생성 실패', {
        description: error.message,
      });
    },
  });
}

// 프로젝트 수정
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProjectUpdate }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('프로젝트가 수정되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프로젝트 수정 실패', {
        description: error.message,
      });
    },
  });
}

// 프로젝트 삭제
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('프로젝트가 삭제되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프로젝트 삭제 실패', {
        description: error.message,
      });
    },
  });
}

// 프로젝트에 프롬프트 추가
export function useAddPromptToProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, promptId }: { projectId: string; promptId: string }) => {
      const { data, error } = await supabase
        .from('project_prompts')
        .insert({
          project_id: projectId,
          prompt_id: promptId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('프롬프트가 추가되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프롬프트 추가 실패', {
        description: error.message,
      });
    },
  });
}

// 프로젝트에서 프롬프트 제거
export function useRemovePromptFromProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, promptId }: { projectId: string; promptId: string }) => {
      const { error } = await supabase
        .from('project_prompts')
        .delete()
        .eq('project_id', projectId)
        .eq('prompt_id', promptId);

      if (error) throw error;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('프롬프트가 제거되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('프롬프트 제거 실패', {
        description: error.message,
      });
    },
  });
}
