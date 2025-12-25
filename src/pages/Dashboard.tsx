import {
  TrendingUp,
  MessageSquareText,
  Archive,
  Wrench
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TokenUsageWidget } from "@/components/dashboard/TokenUsageWidget";
import { RecentPromptWidget } from "@/components/dashboard/RecentPromptWidget";
import { SharedPromptCardSimple } from "@/components/dashboard/SharedPromptCardSimple";
import { SharedCollectionCardSimple } from "@/components/dashboard/SharedCollectionCardSimple";
import { SharedProgramCardSimple } from "@/components/dashboard/SharedProgramCardSimple";
import { Button } from "@/components/ui/button";
import { useSharedResults } from "@/hooks/useExecutionResults";
import { useSharedCollections } from "@/hooks/useCollections";
import { usePublicPrograms } from "@/hooks/usePrograms";
import { getIcon } from "@/lib/iconMap";
import { useNavigate } from "react-router-dom";
import {
  useSavedPromptsCount,
  useMyCollectionsCount,
  useMyProgramsCount,
  useTimeSaved,
  useWeeklyCollectionChange,
} from "@/hooks/useDashboardStats";

export default function Dashboard() {
  const navigate = useNavigate();

  // 통계 데이터 조회
  const { data: savedPromptsCount = 0 } = useSavedPromptsCount();
  const { data: myProgramsCount = 0 } = useMyProgramsCount();
  const { data: myCollectionsCount = 0 } = useMyCollectionsCount();
  const { data: timeSaved = 0 } = useTimeSaved();
  const { data: weeklyChange = 0 } = useWeeklyCollectionChange();

  // 공유 콘텐츠 조회
  const { data: sharedResults = [] } = useSharedResults();
  const { data: sharedCollections = [] } = useSharedCollections();
  const { data: publicPrograms = [] } = usePublicPrograms();

  // 최신 6개만 표시
  const recentSharedResults = sharedResults.slice(0, 6);
  const recentSharedCollections = sharedCollections.slice(0, 6);
  const recentPublicPrograms = publicPrograms.slice(0, 6);
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          AI 업무 프로그램을 만들어보세요 🚀
        </h1>
        <p className="text-muted-foreground">
          나만의 AI 업무 도구를 만들고, 프롬프트를 자산으로 관리하세요.
        </p>
      </div>

      {/* Quick Actions */}
      <section>
        <QuickActions />
      </section>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="저장된 프롬프트"
          value={savedPromptsCount}
          change="내 자산"
          changeType="neutral"
          icon={MessageSquareText}
        />
        <StatsCard
          title="생성한 AI도구"
          value={myProgramsCount}
          change="직접 만든 프로그램"
          changeType="neutral"
          icon={Wrench}
        />
        <StatsCard
          title="AI소스 수집함"
          value={myCollectionsCount}
          change={weeklyChange > 0 ? `+${weeklyChange}개 이번 주` : "이번 주 추가 없음"}
          changeType={weeklyChange > 0 ? "positive" : "neutral"}
          icon={Archive}
        />
        <StatsCard
          title="시간 절약"
          value={timeSaved > 0 ? `${timeSaved.toFixed(1)}h` : "0h"}
          change="이번 달 누적"
          changeType={timeSaved > 0 ? "positive" : "neutral"}
          icon={TrendingUp}
        />
      </section>

      {/* Token Usage & Recent Prompt */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TokenUsageWidget />
        <RecentPromptWidget />
      </section>

      {/* Shared Prompts Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">공유 프롬프트</h2>
            <p className="text-sm text-muted-foreground">
              다른 의료진이 공유한 우수 사례를 확인하세요
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/prompts?tab=shared")}
            className="text-sm font-medium text-primary hover:underline"
          >
            전체 보기 →
          </Button>
        </div>
        {recentSharedResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSharedResults.map((result, index) => (
              <div
                key={result.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SharedPromptCardSimple
                  result={result}
                  onViewMore={() => navigate("/prompts?tab=shared")}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">
              아직 공유된 프롬프트가 없습니다
            </p>
          </div>
        )}
      </section>

      {/* Shared Programs Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">공유 AI 도구</h2>
            <p className="text-sm text-muted-foreground">
              다른 의료진이 공유한 AI 도구를 사용해보세요
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/programs")}
            className="text-sm font-medium text-primary hover:underline"
          >
            전체 보기 →
          </Button>
        </div>
        {recentPublicPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPublicPrograms.map((program, index) => (
              <div
                key={program.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SharedProgramCardSimple
                  id={program.id}
                  title={program.title}
                  description={program.description || ""}
                  icon={getIcon(program.icon || "Sparkles")}
                  category={program.category}
                  promptCount={program.prompt_count}
                  usageCount={program.usage_count || 0}
                  gradient={program.gradient}
                  onViewMore={() => navigate("/programs")}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">
              아직 공유된 AI 도구가 없습니다
            </p>
          </div>
        )}
      </section>

      {/* Shared Collections Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">공유 AI소스 수집함</h2>
            <p className="text-sm text-muted-foreground">
              커뮤니티에서 공유한 AI소스 수집함을 사용해보세요
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/program-collections?tab=shared")}
            className="text-sm font-medium text-primary hover:underline"
          >
            전체 보기 →
          </Button>
        </div>
        {recentSharedCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSharedCollections.map((collection, index) => (
              <div
                key={collection.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SharedCollectionCardSimple
                  collection={collection}
                  onViewMore={() => navigate("/program-collections?tab=shared")}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">
              아직 공유된 AI소스 수집함이 없습니다
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
