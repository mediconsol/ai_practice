import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { UserPreferences, AIPreferences } from "@/types/settings";

/**
 * 사용자 환경설정 조회
 */
export function useUserPreferences() {
  return useQuery<UserPreferences | null>({
    queryKey: ["userPreferences"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Failed to fetch user preferences:", error);
        throw error;
      }

      return data?.preferences as UserPreferences;
    },
  });
}

/**
 * AI 환경설정만 조회
 */
export function useAIPreferences() {
  const { data: preferences } = useUserPreferences();
  return preferences?.ai;
}

/**
 * 사용자 환경설정 업데이트
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("로그인이 필요합니다.");
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id)
        .select("preferences")
        .single();

      if (error) {
        throw error;
      }

      return data?.preferences as UserPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        title: "설정이 저장되었습니다",
        description: "환경설정이 성공적으로 업데이트되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "설정 저장 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * AI 환경설정만 업데이트
 */
export function useUpdateAIPreferences() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: currentPreferences } = useUserPreferences();

  return useMutation({
    mutationFn: async (aiPreferences: AIPreferences) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("로그인이 필요합니다.");
      }

      // 기존 preferences와 병합
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        ai: aiPreferences,
      } as UserPreferences;

      const { data, error } = await supabase
        .from("profiles")
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id)
        .select("preferences")
        .single();

      if (error) {
        throw error;
      }

      return data?.preferences as UserPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        title: "AI 설정이 저장되었습니다",
        description: "기본 AI 환경설정이 업데이트되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "AI 설정 저장 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
