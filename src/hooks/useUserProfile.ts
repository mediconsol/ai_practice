import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, ProfileUpdateData } from "@/types/settings";

/**
 * 사용자 프로필 조회
 */
export function useUserProfile() {
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Failed to fetch user profile:", error);
        throw error;
      }

      return data as UserProfile;
    },
  });
}

/**
 * 프로필 업데이트
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: ProfileUpdateData) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("로그인이 필요합니다.");
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        title: "프로필이 업데이트되었습니다",
        description: "변경사항이 성공적으로 저장되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "프로필 업데이트 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
