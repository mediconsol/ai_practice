import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export interface ExecutionResult {
  id: string;
  user_id: string;
  title: string;
  category: string;
  prompt: string;
  result: string;
  memo: string | null;
  is_favorite: boolean;
  is_shared: boolean;
  ai_provider: string | null;
  ai_model: string | null;
  execution_time_ms: number | null;
  token_usage: any | null;
  shared_at: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

// 내 실행 결과 조회
export function useMyResults() {
  return useQuery({
    queryKey: ["my-results"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("로그인이 필요합니다.");
      }

      const { data, error } = await supabase
        .from("execution_results")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ExecutionResult[];
    },
  });
}

// 공유된 실행 결과 조회 (Phase 2에서 사용)
export function useSharedResults() {
  return useQuery({
    queryKey: ["shared-results"],
    queryFn: async () => {
      const { data, error} = await supabase
        .from("execution_results")
        .select("*")
        .eq("is_shared", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Manually fetch author information for each result
      const resultsWithAuthors = await Promise.all(
        (data || []).map(async (result) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, email, full_name, hospital, department")
            .eq("id", result.user_id)
            .maybeSingle();

          return {
            ...result,
            author: profile || null,
          };
        })
      );

      return resultsWithAuthors as any[];
    },
  });
}

// 실행 결과 수정
export function useUpdateResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ExecutionResult>;
    }) => {
      const { data, error } = await supabase
        .from("execution_results")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-results"] });
      queryClient.invalidateQueries({ queryKey: ["execution-results"] });
      toast.success("실행 결과가 수정되었습니다.");
    },
    onError: (error: Error) => {
      toast.error("실행 결과 수정 실패", {
        description: error.message,
      });
    },
  });
}

// 실행 결과 삭제
export function useDeleteResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("execution_results")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-results"] });
      queryClient.invalidateQueries({ queryKey: ["execution-results"] });
      toast.success("실행 결과가 삭제되었습니다.");
    },
    onError: (error: Error) => {
      toast.error("실행 결과 삭제 실패", {
        description: error.message,
      });
    },
  });
}

// 즐겨찾기 토글
export function useToggleResultFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isFavorite,
    }: {
      id: string;
      isFavorite: boolean;
    }) => {
      const { error } = await supabase
        .from("execution_results")
        .update({ is_favorite: !isFavorite })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-results"] });
      queryClient.invalidateQueries({ queryKey: ["execution-results"] });
    },
  });
}

// 공유 토글 (Phase 2에서 사용)
export function useToggleShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isShared,
    }: {
      id: string;
      isShared: boolean;
    }) => {
      const updates: any = {
        is_shared: !isShared,
      };

      // 공유 시작 시 shared_at 타임스탬프 설정
      if (!isShared) {
        updates.shared_at = new Date().toISOString();
      } else {
        updates.shared_at = null;
      }

      const { error } = await supabase
        .from("execution_results")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-results"] });
      queryClient.invalidateQueries({ queryKey: ["shared-results"] });
      queryClient.invalidateQueries({ queryKey: ["execution-results"] });

      if (variables.isShared) {
        toast.success("공유를 취소했습니다.");
      } else {
        toast.success("결과물을 공유했습니다.", {
          description: "다른 사용자들이 볼 수 있습니다.",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("공유 설정 실패", {
        description: error.message,
      });
    },
  });
}

// 공유 콘텐츠를 내 자산에 저장 (Phase 2)
export function useSaveSharedToMyAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sharedResultId: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("로그인이 필요합니다.");
      }

      // 공유 결과물 조회
      const { data: sharedResult, error: fetchError } = await supabase
        .from("execution_results")
        .select("*")
        .eq("id", sharedResultId)
        .eq("is_shared", true)
        .single();

      if (fetchError || !sharedResult) {
        throw new Error("공유 콘텐츠를 찾을 수 없습니다.");
      }

      // 내 자산으로 복사 (is_shared = false로 저장)
      const { data, error } = await supabase
        .from("execution_results")
        .insert({
          user_id: session.user.id,
          title: `${sharedResult.title} (공유)`,
          category: sharedResult.category,
          prompt: sharedResult.prompt,
          result: sharedResult.result,
          memo: sharedResult.memo
            ? `${sharedResult.memo}\n\n[공유 콘텐츠에서 저장됨]`
            : "[공유 콘텐츠에서 저장됨]",
          is_favorite: false,
          is_shared: false,
          ai_provider: sharedResult.ai_provider,
          ai_model: sharedResult.ai_model,
          execution_time_ms: sharedResult.execution_time_ms,
          token_usage: sharedResult.token_usage,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "내 자산에 저장하는데 실패했습니다.");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-results"] });
      queryClient.invalidateQueries({ queryKey: ["execution-results"] });

      toast.success("내 자산에 저장되었습니다", {
        description: "마이페이지에서 확인하세요.",
      });
    },
    onError: (error: Error) => {
      toast.error("저장 실패", {
        description: error.message,
      });
    },
  });
}

// 좋아요 토글 (Phase 3)
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resultId }: { resultId: string }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("로그인이 필요합니다.");
      }

      // 이미 좋아요를 눌렀는지 확인
      const { data: existingLike } = await supabase
        .from("shared_content_likes")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("result_id", resultId)
        .single();

      if (existingLike) {
        // 좋아요 취소
        const { error: deleteError } = await supabase
          .from("shared_content_likes")
          .delete()
          .eq("user_id", session.user.id)
          .eq("result_id", resultId);

        if (deleteError) throw deleteError;

        // like_count 감소
        const { error: updateError } = await supabase.rpc(
          "decrement_like_count",
          { result_id: resultId }
        );

        if (updateError) {
          // RPC 함수가 없으면 직접 업데이트
          const { data: result } = await supabase
            .from("execution_results")
            .select("like_count")
            .eq("id", resultId)
            .single();

          if (result) {
            await supabase
              .from("execution_results")
              .update({ like_count: Math.max(0, result.like_count - 1) })
              .eq("id", resultId);
          }
        }

        return { action: "unlike" };
      } else {
        // 좋아요 추가
        const { error: insertError } = await supabase
          .from("shared_content_likes")
          .insert({
            user_id: session.user.id,
            result_id: resultId,
          });

        if (insertError) throw insertError;

        // like_count 증가
        const { error: updateError } = await supabase.rpc(
          "increment_like_count",
          { result_id: resultId }
        );

        if (updateError) {
          // RPC 함수가 없으면 직접 업데이트
          const { data: result } = await supabase
            .from("execution_results")
            .select("like_count")
            .eq("id", resultId)
            .single();

          if (result) {
            await supabase
              .from("execution_results")
              .update({ like_count: result.like_count + 1 })
              .eq("id", resultId);
          }
        }

        return { action: "like" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shared-results"] });
      queryClient.invalidateQueries({ queryKey: ["execution-results"] });

      if (data.action === "like") {
        toast.success("좋아요!");
      }
    },
    onError: (error: Error) => {
      toast.error("좋아요 실패", {
        description: error.message,
      });
    },
  });
}

// 사용자가 좋아요를 눌렀는지 확인 (Phase 3)
export function useCheckLike(resultId: string) {
  return useQuery({
    queryKey: ["check-like", resultId],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return false;
      }

      const { data, error } = await supabase
        .from("shared_content_likes")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("result_id", resultId)
        .maybeSingle();

      if (error) {
        console.error("Error checking like:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!resultId,
  });
}

// 조회수 증가 (Phase 3)
export function useIncrementViewCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultId: string) => {
      // RPC 함수 시도
      const { error: rpcError } = await supabase.rpc("increment_view_count", {
        result_id: resultId,
      });

      if (rpcError) {
        // RPC 함수가 없으면 직접 업데이트
        const { data: result } = await supabase
          .from("execution_results")
          .select("view_count")
          .eq("id", resultId)
          .single();

        if (result) {
          await supabase
            .from("execution_results")
            .update({ view_count: result.view_count + 1 })
            .eq("id", resultId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-results"] });
      queryClient.invalidateQueries({ queryKey: ["execution-results"] });
    },
    // 에러가 발생해도 사용자에게 알리지 않음 (조회수는 중요하지 않은 기능)
    onError: () => {},
  });
}
