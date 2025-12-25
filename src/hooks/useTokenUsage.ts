import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type {
  UserTokenInfo,
  TokenCheckResult,
  TokenIncrementResult,
} from "@/types/token";

/**
 * 사용자 토큰 사용량 조회
 */
export function useTokenUsage() {
  return useQuery<UserTokenInfo | null>({
    queryKey: ["tokenUsage"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "tokens_used_this_month, token_limit, tokens_reset_at, subscription_tier"
        )
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Failed to fetch token usage:", error);
        throw error;
      }

      return data as UserTokenInfo;
    },
    // 30초마다 자동 갱신
    refetchInterval: 30000,
  });
}

/**
 * 토큰 제한 체크
 */
export function useCheckTokenLimit() {
  return useMutation<TokenCheckResult, Error, number>({
    mutationFn: async (requiredTokens: number) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("로그인이 필요합니다.");
      }

      const { data, error } = await supabase.rpc("check_token_limit", {
        p_user_id: session.user.id,
        p_required_tokens: requiredTokens,
      });

      if (error) {
        throw error;
      }

      return data as TokenCheckResult;
    },
  });
}

/**
 * 토큰 사용량 증가
 */
export function useIncrementTokenUsage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<TokenIncrementResult, Error, number>({
    mutationFn: async (tokensUsed: number) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("로그인이 필요합니다.");
      }

      const { data, error } = await supabase.rpc("increment_token_usage", {
        p_user_id: session.user.id,
        p_tokens_used: tokensUsed,
      });

      if (error) {
        throw error;
      }

      const result = data as TokenIncrementResult;

      if (!result.success) {
        throw new Error(result.error || "토큰 증가 실패");
      }

      return result;
    },
    onSuccess: () => {
      // 토큰 사용량 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["tokenUsage"] });
    },
    onError: (error: Error) => {
      if (error.message === "TOKEN_LIMIT_EXCEEDED") {
        toast({
          title: "토큰 제한 초과",
          description: "이번 달 토큰을 모두 사용했습니다. Pro 플랜으로 업그레이드하세요.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "토큰 기록 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });
}

/**
 * 토큰 사용량 백분율 계산
 */
export function useTokenUsagePercentage() {
  const { data: tokenInfo } = useTokenUsage();

  if (!tokenInfo) return 0;

  // 무제한인 경우 0% 반환
  if (tokenInfo.token_limit === -1) return 0;

  const percentage =
    (tokenInfo.tokens_used_this_month / tokenInfo.token_limit) * 100;

  return Math.min(Math.round(percentage), 100);
}

/**
 * 남은 토큰 수 계산
 */
export function useRemainingTokens() {
  const { data: tokenInfo } = useTokenUsage();

  if (!tokenInfo) return 0;

  // 무제한인 경우 -1 반환
  if (tokenInfo.token_limit === -1) return -1;

  return Math.max(
    0,
    tokenInfo.token_limit - tokenInfo.tokens_used_this_month
  );
}

/**
 * 다음 리셋 날짜 계산
 */
export function useNextResetDate() {
  const { data: tokenInfo } = useTokenUsage();

  if (!tokenInfo) return null;

  return new Date(tokenInfo.tokens_reset_at);
}
