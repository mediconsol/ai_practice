import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useCheckTokenLimit, useIncrementTokenUsage } from './useTokenUsage';

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
  const checkTokenLimit = useCheckTokenLimit();
  const incrementTokenUsage = useIncrementTokenUsage();

  return useMutation({
    mutationFn: async (params: ExecuteAIParams): Promise<ExecuteAIResponse> => {
      // 1. 인증 확인
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('로그인이 필요합니다.');
      }

      // 2. 예상 토큰 수 계산 (대략적)
      // 영어 기준 1 토큰 ≈ 4자, 한글 기준 1 토큰 ≈ 2-3자
      // 입력 + 예상 출력을 고려하여 계산
      const estimatedInputTokens = Math.ceil(params.prompt.length / 3);
      const estimatedOutputTokens = 500; // 평균 출력 길이 가정
      const estimatedTotalTokens = estimatedInputTokens + estimatedOutputTokens;

      // 3. 토큰 제한 체크
      try {
        const limitCheck = await checkTokenLimit.mutateAsync(estimatedTotalTokens);

        if (!limitCheck.allowed) {
          const error: any = new Error('TOKEN_LIMIT_EXCEEDED');
          error.tokenInfo = limitCheck;
          throw error;
        }
      } catch (error: any) {
        if (error.message === 'TOKEN_LIMIT_EXCEEDED') {
          throw error;
        }
        // 토큰 체크 실패 시 경고만 하고 계속 진행 (서비스 연속성)
        console.warn('Token check failed, proceeding anyway:', error);
      }

      // 4. AI 실행 (Edge Function 호출)
      const { data, error } = await supabase.functions.invoke('execute-ai', {
        body: params,
      });

      if (error) {
        throw new Error(error.message || 'AI 실행 중 오류가 발생했습니다.');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI 응답 생성에 실패했습니다.');
      }

      // 5. 실제 사용 토큰 기록
      if (data.tokenUsage?.total_tokens) {
        try {
          await incrementTokenUsage.mutateAsync(data.tokenUsage.total_tokens);
        } catch (error) {
          // 토큰 기록 실패 시 경고만 하고 계속 진행
          console.error('Failed to record token usage:', error);
        }
      }

      return data;
    },
    onSuccess: (data) => {
      // 히스토리 쿼리 무효화 (새로고침)
      queryClient.invalidateQueries({ queryKey: ['execution-history'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });

      // 프롬프트 사용 횟수 업데이트를 위한 쿼리 무효화
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['prompts'] });
      }

      // 토큰 사용량 캐시 무효화 (실시간 업데이트)
      queryClient.invalidateQueries({ queryKey: ['tokenUsage'] });

      toast.success('AI 실행 완료', {
        description: `${data.durationMs}ms | ${data.tokenUsage?.total_tokens || 0} 토큰`,
      });
    },
    onError: (error: any) => {
      if (error.message === 'TOKEN_LIMIT_EXCEEDED') {
        // 토큰 제한 초과는 별도 처리 (다이얼로그)
        toast.error('토큰 제한 초과', {
          description: '이번 달 토큰을 모두 사용했습니다.',
        });
      } else {
        toast.error('AI 실행 실패', {
          description: error.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
      }
    },
  });
}

// 사용 예시:
// const executeAI = useExecuteAI();
//
// const handleExecute = async () => {
//   try {
//     const result = await executeAI.mutateAsync({
//       prompt: "당뇨병 환자 안내문을 작성해주세요",
//       provider: "openai",
//       model: "gpt-4o-mini",
//     });
//     console.log(result.result);
//   } catch (error) {
//     if (error.message === 'TOKEN_LIMIT_EXCEEDED') {
//       // 업그레이드 다이얼로그 표시
//       setUpgradeDialogOpen(true);
//     }
//   }
// };
