import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, X, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  useTokenUsage,
  useTokenUsagePercentage,
  useRemainingTokens,
} from "@/hooks/useTokenUsage";

export function TokenWarningBanner() {
  const navigate = useNavigate();
  const { data: tokenInfo } = useTokenUsage();
  const usagePercentage = useTokenUsagePercentage();
  const remainingTokens = useRemainingTokens();
  const [isDismissed, setIsDismissed] = useState(false);

  // 무제한 사용자는 배너 표시 안함
  if (!tokenInfo || tokenInfo.token_limit === -1) {
    return null;
  }

  // 70% 미만 사용 시 배너 표시 안함
  if (usagePercentage < 70) {
    return null;
  }

  // 사용자가 닫은 경우 표시 안함
  if (isDismissed) {
    return null;
  }

  // 경고 레벨 결정
  const getWarningLevel = () => {
    if (usagePercentage >= 100) return "critical";
    if (usagePercentage >= 90) return "high";
    if (usagePercentage >= 80) return "medium";
    return "low";
  };

  const warningLevel = getWarningLevel();

  // 레벨별 스타일 및 메시지
  const config = {
    critical: {
      variant: "destructive" as const,
      icon: AlertTriangle,
      title: "토큰을 모두 사용했습니다",
      description: "더 이상 AI를 실행할 수 없습니다. Pro 플랜으로 업그레이드하세요.",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
      textColor: "text-destructive",
      buttonText: "지금 업그레이드",
    },
    high: {
      variant: "destructive" as const,
      icon: AlertTriangle,
      title: "토큰이 거의 소진되었습니다",
      description: `${remainingTokens.toLocaleString()} 토큰만 남았습니다. 곧 AI 실행이 제한됩니다.`,
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
      textColor: "text-destructive",
      buttonText: "업그레이드",
    },
    medium: {
      variant: "default" as const,
      icon: TrendingUp,
      title: "토큰 사용량이 높습니다",
      description: `${remainingTokens.toLocaleString()} 토큰 남음. Pro 플랜을 고려해보세요.`,
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
      textColor: "text-warning",
      buttonText: "플랜 보기",
    },
    low: {
      variant: "default" as const,
      icon: TrendingUp,
      title: "토큰 사용량 알림",
      description: `이번 달 ${usagePercentage}% 사용 중입니다. ${remainingTokens.toLocaleString()} 토큰 남음.`,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-900 dark:text-blue-100",
      buttonText: "상세 보기",
    },
  };

  const { variant, icon: Icon, title, description, bgColor, borderColor, textColor, buttonText } =
    config[warningLevel];

  const handleAction = () => {
    if (warningLevel === "critical" || warningLevel === "high") {
      navigate("/settings?tab=usage");
    } else {
      navigate("/settings?tab=usage");
    }
  };

  return (
    <div className="w-full px-4 py-2 animate-slide-down">
      <Alert variant={variant} className={`${bgColor} ${borderColor} relative`}>
        <Icon className={`h-4 w-4 ${textColor}`} />
        <AlertTitle className={textColor}>{title}</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm">{description}</p>
            {/* 프로그레스 바 */}
            <div className="mt-2 flex items-center gap-2">
              <Progress
                value={usagePercentage}
                className="h-2 flex-1"
                indicatorClassName={
                  warningLevel === "critical" || warningLevel === "high"
                    ? "bg-destructive"
                    : warningLevel === "medium"
                    ? "bg-warning"
                    : "bg-primary"
                }
              />
              <span className="text-xs font-medium tabular-nums">
                {usagePercentage}%
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={warningLevel === "critical" || warningLevel === "high" ? "default" : "outline"}
              onClick={handleAction}
              className="shrink-0"
            >
              {(warningLevel === "critical" || warningLevel === "high") && (
                <Crown className="mr-1 h-3 w-3" />
              )}
              {buttonText}
            </Button>

            {/* 닫기 버튼 (critical 제외) */}
            {warningLevel !== "critical" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDismissed(true)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
