import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface SaveResultParams {
  title: string;
  category: string;
  prompt: string;
  result: string;
  memo?: string;
  isFavorite: boolean;
  aiProvider?: string;
  aiModel?: string;
  executionTimeMs?: number;
  tokenUsage?: any;
}

export function useSaveResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SaveResultParams) => {
      // 사용자 확인
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("로그인이 필요합니다.");
      }

      // execution_results 테이블에 삽입
      const { data, error } = await supabase
        .from("execution_results")
        .insert({
          user_id: session.user.id,
          title: params.title,
          category: params.category,
          prompt: params.prompt,
          result: params.result,
          memo: params.memo || null,
          is_favorite: params.isFavorite,
          ai_provider: params.aiProvider || null,
          ai_model: params.aiModel || null,
          execution_time_ms: params.executionTimeMs || null,
          token_usage: params.tokenUsage || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "실행 결과 저장에 실패했습니다.");
      }

      return data;
    },
    onSuccess: () => {
      // execution_results 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["execution-results"] });
      queryClient.invalidateQueries({ queryKey: ["my-results"] });

      toast.success("실행 결과가 저장되었습니다", {
        description: "마이페이지에서 확인하세요.",
      });
    },
    onError: (error: Error) => {
      toast.error("실행 결과 저장 실패", {
        description: error.message,
      });
    },
  });
}
