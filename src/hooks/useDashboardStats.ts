import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/useAuth";
import type { Database } from "@/lib/supabase";

type Prompt = Database['public']['Tables']['prompts']['Row'];

// 저장된 프롬프트 수
export function useSavedPromptsCount() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["savedPromptsCount", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;

      const { count, error } = await supabase
        .from("prompts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching prompts count:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!session?.user?.id,
  });
}

// 내 컬렉션 수
export function useMyCollectionsCount() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["myCollectionsCount", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;

      const { count, error } = await supabase
        .from("collections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching collections count:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!session?.user?.id,
  });
}

// 생성한 AI 도구 수
export function useMyProgramsCount() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["myProgramsCount", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;

      const { count, error } = await supabase
        .from("programs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching programs count:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!session?.user?.id,
  });
}

// AI 실행 횟수
export function useExecutionCount() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["executionCount", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { total: 0, today: 0 };

      // 전체 실행 횟수
      const { count: totalCount, error: totalError } = await supabase
        .from("ai_execution_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (totalError) {
        console.error("Error fetching total execution count:", totalError);
        return { total: 0, today: 0 };
      }

      // 오늘 실행 횟수
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { count: todayCount, error: todayError } = await supabase
        .from("ai_execution_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .gte("created_at", todayISO);

      if (todayError) {
        console.error("Error fetching today execution count:", todayError);
      }

      return {
        total: totalCount || 0,
        today: todayCount || 0,
      };
    },
    enabled: !!session?.user?.id,
  });
}

// 시간 절약 계산 (이번 달)
export function useTimeSaved() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["timeSaved", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;

      // 이번 달 실행 횟수
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayISO = firstDayOfMonth.toISOString();

      const { count, error } = await supabase
        .from("ai_execution_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .gte("created_at", firstDayISO);

      if (error) {
        console.error("Error fetching monthly execution count:", error);
        return 0;
      }

      // 평균적으로 AI 실행 1회당 4분 절약한다고 가정
      const minutesPerExecution = 4;
      const totalMinutes = (count || 0) * minutesPerExecution;
      const hours = totalMinutes / 60;

      return hours;
    },
    enabled: !!session?.user?.id,
  });
}

// 최근 변화 (이번 주 추가된 컬렉션 수)
export function useWeeklyCollectionChange() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["weeklyCollectionChange", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;

      // 이번 주 시작 (월요일)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - daysToMonday);
      monday.setHours(0, 0, 0, 0);
      const mondayISO = monday.toISOString();

      const { count, error } = await supabase
        .from("collections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .gte("created_at", mondayISO);

      if (error) {
        console.error("Error fetching weekly collection change:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!session?.user?.id,
  });
}

// 최근 프롬프트 3개 조회
export function useRecentPrompts() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["recentPrompts", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching recent prompts:", error);
        return [];
      }

      return data as Prompt[];
    },
    enabled: !!session?.user?.id,
  });
}
