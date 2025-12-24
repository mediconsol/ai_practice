import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface SavePromptParams {
  title: string;
  category: string;
  content: string;
  isFavorite: boolean;
}

export function useSavePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SavePromptParams) => {
      // 사용자 확인
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("로그인이 필요합니다.");
      }

      // 변수 감지 (예: {변수명} 형식)
      const variableMatches = params.content.match(/\{([^}]+)\}/g);
      const variables = variableMatches
        ? variableMatches.map((match) => match.replace(/[{}]/g, ""))
        : [];

      // prompts 테이블에 삽입
      const { data, error } = await supabase
        .from("prompts")
        .insert({
          user_id: session.user.id,
          title: params.title,
          content: params.content,
          category: params.category,
          is_favorite: params.isFavorite,
          usage_count: 0,
          variables: variables.length > 0 ? variables : null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "프롬프트 저장에 실패했습니다.");
      }

      return data;
    },
    onSuccess: () => {
      // prompts 쿼리 무효화 (Prompts 페이지 갱신)
      queryClient.invalidateQueries({ queryKey: ["prompts"] });

      toast.success("프롬프트가 저장되었습니다", {
        description: "프롬프트 자산 페이지에서 확인하세요.",
      });
    },
    onError: (error: Error) => {
      toast.error("프롬프트 저장 실패", {
        description: error.message,
      });
    },
  });
}
