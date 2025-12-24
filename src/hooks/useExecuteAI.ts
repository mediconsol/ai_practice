import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ExecuteAIParams {
  prompt: string;
  provider: 'openai' | 'gemini' | 'claude';
  model?: string;
  promptId?: string;
  variables?: Record<string, string>;
}

interface ExecuteAIResponse {
  success: boolean;
  result?: string;
  durationMs?: number;
  tokenUsage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  provider?: string;
  model?: string;
  error?: string;
}

export function useExecuteAI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ExecuteAIParams): Promise<ExecuteAIResponse> => {
      // 인증 확인
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('로그인이 필요합니다.');
      }

      // Edge Function 호출
      const { data, error } = await supabase.functions.invoke('execute-ai', {
        body: params,
      });

      if (error) {
        throw new Error(error.message || 'AI 실행 중 오류가 발생했습니다.');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI 응답 생성에 실패했습니다.');
      }

      return data;
    },
    onSuccess: (data) => {
      // 히스토리 쿼리 무효화 (새로고침)
      queryClient.invalidateQueries({ queryKey: ['execution-history'] });

      // 프롬프트 사용 횟수 업데이트를 위한 쿼리 무효화
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['prompts'] });
      }

      toast.success('AI 실행 완료', {
        description: `${data.durationMs}ms | ${data.tokenUsage?.total_tokens || 0} 토큰`,
      });
    },
    onError: (error: Error) => {
      toast.error('AI 실행 실패', {
        description: error.message,
      });
    },
  });
}

// 사용 예시:
// const executeAI = useExecuteAI();
//
// const handleExecute = async () => {
//   const result = await executeAI.mutateAsync({
//     prompt: "당뇨병 환자 안내문을 작성해주세요",
//     provider: "openai",
//     model: "gpt-4o-mini",
//   });
//   console.log(result.result);
// };
