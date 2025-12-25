import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Check, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SUBSCRIPTION_LIMITS } from "@/types/token";
import { useTokenUsage } from "@/hooks/useTokenUsage";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: "limit_exceeded" | "low_tokens" | "general";
}

export function UpgradeDialog({ open, onOpenChange, reason = "general" }: UpgradeDialogProps) {
  const navigate = useNavigate();
  const { data: tokenInfo } = useTokenUsage();

  const handleViewSettings = () => {
    onOpenChange(false);
    navigate("/settings?tab=usage");
  };

  const getReasonMessage = () => {
    switch (reason) {
      case "limit_exceeded":
        return {
          title: "토큰을 모두 사용했습니다",
          description: "이번 달 무료 토큰을 모두 사용했습니다. Pro 플랜으로 업그레이드하여 계속 사용하세요.",
          icon: <TrendingUp className="h-12 w-12 text-destructive" />,
        };
      case "low_tokens":
        return {
          title: "토큰이 부족합니다",
          description: "남은 토큰이 얼마 없습니다. 업그레이드하여 걱정 없이 사용하세요.",
          icon: <Zap className="h-12 w-12 text-warning" />,
        };
      default:
        return {
          title: "더 많은 기능을 사용하세요",
          description: "Pro 플랜으로 업그레이드하여 무제한으로 AI를 활용하세요.",
          icon: <Crown className="h-12 w-12 text-primary" />,
        };
    }
  };

  const message = getReasonMessage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex flex-col items-center text-center mb-4">
            {message.icon}
            <DialogTitle className="mt-4 text-2xl">{message.title}</DialogTitle>
            <DialogDescription className="mt-2">{message.description}</DialogDescription>
          </div>
        </DialogHeader>

        {/* 현재 사용량 (제한 초과 시만 표시) */}
        {reason === "limit_exceeded" && tokenInfo && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-destructive font-medium">이번 달 사용량</span>
              <span className="text-destructive font-bold">
                {tokenInfo.tokens_used_this_month.toLocaleString()} / {tokenInfo.token_limit.toLocaleString()} 토큰 (100%)
              </span>
            </div>
          </div>
        )}

        {/* 플랜 비교 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pro 플랜 */}
          <Card className="border-2 border-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary">인기</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Pro
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-primary">
                  {SUBSCRIPTION_LIMITS.pro.price.toLocaleString()}원
                </span>
                <span className="text-sm text-muted-foreground"> / 월</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm font-semibold mb-2">
                월 {(SUBSCRIPTION_LIMITS.pro.monthly_tokens / 1000).toFixed(0)}만 토큰
              </div>
              {SUBSCRIPTION_LIMITS.pro.features?.map((feature, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
              <Button className="w-full mt-4" size="lg">
                Pro로 업그레이드
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise 플랜 */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Enterprise
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-primary">
                  {SUBSCRIPTION_LIMITS.enterprise.price.toLocaleString()}원
                </span>
                <span className="text-sm text-muted-foreground"> / 월</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm font-semibold mb-2 text-primary">
                무제한 토큰
              </div>
              {SUBSCRIPTION_LIMITS.enterprise.features?.map((feature, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" size="lg">
                문의하기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 하단 액션 */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <Button variant="ghost" onClick={handleViewSettings}>
            사용량 상세 보기
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            나중에
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
