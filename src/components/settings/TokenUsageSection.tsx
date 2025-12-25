import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Loader2, Zap, TrendingUp, Calendar, Crown } from "lucide-react";
import {
  useTokenUsage,
  useTokenUsagePercentage,
  useRemainingTokens,
  useNextResetDate,
} from "@/hooks/useTokenUsage";
import { SUBSCRIPTION_LIMITS } from "@/types/token";

export function TokenUsageSection() {
  const { data: tokenInfo, isLoading } = useTokenUsage();
  const usagePercentage = useTokenUsagePercentage();
  const remainingTokens = useRemainingTokens();
  const resetDate = useNextResetDate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tokenInfo) {
    return null;
  }

  const isUnlimited = tokenInfo.token_limit === -1;
  const currentPlan = SUBSCRIPTION_LIMITS[tokenInfo.subscription_tier];

  // 사용량에 따른 색상
  const getUsageColor = () => {
    if (isUnlimited) return "bg-purple-500";
    if (usagePercentage >= 90) return "bg-destructive";
    if (usagePercentage >= 70) return "bg-warning";
    return "bg-primary";
  };

  return (
    <div className="space-y-6">
      {/* 현재 플랜 표시 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">현재 플랜</h3>
          <p className="text-sm text-muted-foreground">
            {currentPlan.name} 플랜을 사용 중입니다
          </p>
        </div>
        <Badge variant={isUnlimited ? "default" : "outline"} className="gap-1">
          {isUnlimited && <Crown className="h-3 w-3" />}
          {currentPlan.name}
        </Badge>
      </div>

      {/* 사용량 카드 */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-4">
          {/* 사용량 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-medium">이번 달 토큰 사용량</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              {tokenInfo.tokens_used_this_month.toLocaleString()} /{" "}
              {isUnlimited
                ? "무제한"
                : tokenInfo.token_limit.toLocaleString()}{" "}
              토큰
            </span>
          </div>

          {/* 프로그레스 바 */}
          {!isUnlimited && (
            <>
              <Progress
                value={usagePercentage}
                className="h-3"
                indicatorClassName={getUsageColor()}
              />

              {/* 남은 토큰 */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    남은 토큰:{" "}
                    <span className="font-semibold text-foreground">
                      {remainingTokens.toLocaleString()}
                    </span>
                  </span>
                </div>
                <div className="text-muted-foreground">
                  {usagePercentage}% 사용
                </div>
              </div>
            </>
          )}

          {/* 무제한 메시지 */}
          {isUnlimited && (
            <div className="text-center py-4">
              <Crown className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">
                무제한 토큰을 사용하실 수 있습니다
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* 리셋 정보 */}
      {resetDate && !isUnlimited && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <Calendar className="h-4 w-4" />
          <span>
            다음 리셋:{" "}
            <span className="font-medium text-foreground">
              {resetDate.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </span>
        </div>
      )}

      {/* 경고 메시지 */}
      {!isUnlimited && usagePercentage >= 80 && (
        <div
          className={`p-4 rounded-lg border ${
            usagePercentage >= 90
              ? "bg-destructive/10 border-destructive/20"
              : "bg-warning/10 border-warning/20"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              usagePercentage >= 90 ? "text-destructive" : "text-warning"
            }`}
          >
            {usagePercentage >= 90
              ? "⚠️ 토큰이 거의 소진되었습니다!"
              : "⚡ 토큰 사용량이 80%를 넘었습니다"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            더 많은 토큰이 필요하신가요? Pro 플랜으로 업그레이드하세요.
          </p>
        </div>
      )}

      {/* 업그레이드 버튼 (무료 사용자만) */}
      {tokenInfo.subscription_tier === "free" && (
        <div className="space-y-3">
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">더 많은 토큰이 필요하신가요?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Pro 플랜 */}
              <Card className="p-4 hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-semibold">Pro</h5>
                    <p className="text-2xl font-bold text-primary">
                      {SUBSCRIPTION_LIMITS.pro.price.toLocaleString()}원
                    </p>
                    <p className="text-xs text-muted-foreground">/ 월</p>
                  </div>
                  <Badge>인기</Badge>
                </div>
                <ul className="space-y-1 mb-3">
                  {SUBSCRIPTION_LIMITS.pro.features?.map((feature, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="text-primary">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" size="sm">
                  Pro로 업그레이드
                </Button>
              </Card>

              {/* Enterprise 플랜 */}
              <Card className="p-4 border-primary/20 bg-primary/5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-semibold flex items-center gap-1">
                      <Crown className="h-4 w-4 text-primary" />
                      Enterprise
                    </h5>
                    <p className="text-2xl font-bold text-primary">
                      {SUBSCRIPTION_LIMITS.enterprise.price.toLocaleString()}원
                    </p>
                    <p className="text-xs text-muted-foreground">/ 월</p>
                  </div>
                </div>
                <ul className="space-y-1 mb-3">
                  {SUBSCRIPTION_LIMITS.enterprise.features?.map((feature, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="text-primary">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" size="sm" variant="outline">
                  문의하기
                </Button>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* 토큰 절약 팁 */}
      {!isUnlimited && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
            💡 토큰 절약 팁
          </h4>
          <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li>• 간결하고 명확한 프롬프트 작성</li>
            <li>• 불필요한 컨텍스트 제거</li>
            <li>• 적절한 AI 모델 선택 (작은 작업은 가벼운 모델로)</li>
            <li>• 최대 토큰 수 제한 설정</li>
          </ul>
        </div>
      )}
    </div>
  );
}
