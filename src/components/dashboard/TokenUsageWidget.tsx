import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useTokenUsage,
  useTokenUsagePercentage,
  useRemainingTokens,
} from "@/hooks/useTokenUsage";

export function TokenUsageWidget() {
  const { data: tokenInfo, isLoading } = useTokenUsage();
  const usagePercentage = useTokenUsagePercentage();
  const remainingTokens = useRemainingTokens();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            토큰 사용량
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tokenInfo) {
    return null;
  }

  const isUnlimited = tokenInfo.token_limit === -1;
  const isLowTokens = usagePercentage >= 80 && !isUnlimited;

  return (
    <Card className="col-span-full lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            토큰 사용량
          </CardTitle>
          {isUnlimited && (
            <Badge variant="default" className="gap-1">
              <Crown className="h-3 w-3" />
              무제한
            </Badge>
          )}
          {isLowTokens && (
            <Badge variant="destructive" className="gap-1">
              ⚠️ {usagePercentage}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 사용량 표시 */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {tokenInfo.tokens_used_this_month.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                / {isUnlimited ? "무제한" : tokenInfo.token_limit.toLocaleString()} 토큰
              </span>
            </div>
            {!isUnlimited && (
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">남은 토큰</p>
                <p className="text-lg font-semibold">
                  {remainingTokens.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* 프로그레스 바 */}
          {!isUnlimited && (
            <Progress
              value={usagePercentage}
              className="h-2"
              indicatorClassName={
                usagePercentage >= 90
                  ? "bg-destructive"
                  : usagePercentage >= 70
                  ? "bg-warning"
                  : "bg-primary"
              }
            />
          )}

          {/* 무제한 메시지 */}
          {isUnlimited && (
            <div className="flex items-center gap-2 text-primary py-2">
              <Crown className="h-5 w-5" />
              <span className="text-sm font-medium">
                무제한으로 AI를 사용하실 수 있습니다
              </span>
            </div>
          )}
        </div>

        {/* 경고 또는 업그레이드 안내 */}
        {!isUnlimited && (
          <div className="flex items-center justify-between pt-2 border-t">
            {isLowTokens ? (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">
                  토큰이 {100 - usagePercentage}% 남았습니다
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>이번 달 {usagePercentage}% 사용 중</span>
              </div>
            )}

            <Button
              variant={isLowTokens ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/settings?tab=usage")}
              className="gap-1"
            >
              상세 보기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
