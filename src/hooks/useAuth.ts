import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  hospital?: string;
  department?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// 회원가입
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password, fullName, hospital, department }: SignUpData) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            hospital: hospital || null,
            department: department || null,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("회원가입이 완료되었습니다!", {
        description: "이메일을 확인하여 인증을 완료해주세요.",
      });
    },
    onError: (error: Error) => {
      toast.error("회원가입 실패", {
        description: error.message,
      });
    },
  });
}

// 로그인
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: SignInData) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("로그인되었습니다");
    },
    onError: (error: Error) => {
      toast.error("로그인 실패", {
        description: error.message,
      });
    },
  });
}

// 로그아웃
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear(); // 모든 캐시 제거
      toast.success("로그아웃되었습니다");
    },
    onError: (error: Error) => {
      toast.error("로그아웃 실패", {
        description: error.message,
      });
    },
  });
}

// 현재 사용자 조회
export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user ?? null;
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  });
}

// 세션 조회
export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  });
}
