import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, RefreshCw, AlertTriangle, Info } from "lucide-react";

export function TokenAutomationGuide() {
  return (
    <div className="space-y-4">
      {/* 자동 관리 시스템 */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          토큰 자동 관리
        </h4>
        <div className="grid gap-3">
          {/* 월간 자동 리셋 */}
          <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">월간 자동 리셋</p>
                <Badge variant="outline" className="text-xs">자동</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                매월 1일 00:00(UTC)에 토큰 사용량이 자동으로 0으로 초기화됩니다.
              </p>
            </div>
          </div>

          {/* 실시간 경고 배너 */}
          <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">실시간 경고 배너</p>
                <Badge variant="outline" className="text-xs">자동</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                토큰 사용량이 70%를 초과하면 모든 페이지 상단에 경고 배너가 자동으로 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 경고 시스템 */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          경고 레벨 시스템
        </h4>
        <div className="space-y-2">
          {/* 70-79% */}
          <div className="flex items-center gap-3 p-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">70-79%</Badge>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">알림</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                토큰 사용량 주의가 필요합니다
              </p>
            </div>
          </div>

          {/* 80-89% */}
          <div className="flex items-center gap-3 p-2 rounded-lg border border-warning/20 bg-warning/10">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-warning hover:bg-warning/90 text-xs">80-89%</Badge>
                <span className="text-sm font-medium text-warning">주의</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                토큰 사용량이 높습니다. Pro 플랜을 고려하세요
              </p>
            </div>
          </div>

          {/* 90-99% */}
          <div className="flex items-center gap-3 p-2 rounded-lg border border-destructive/20 bg-destructive/10">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">90-99%</Badge>
                <span className="text-sm font-medium text-destructive">경고</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                토큰이 거의 소진되었습니다. 곧 AI 실행이 제한됩니다
              </p>
            </div>
          </div>

          {/* 100%+ */}
          <div className="flex items-center gap-3 p-2 rounded-lg border border-destructive/30 bg-destructive/20">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">100%+</Badge>
                <span className="text-sm font-medium text-destructive">임계</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                토큰을 모두 사용했습니다. AI 실행이 차단됩니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <div className="flex gap-2 mb-2">
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">토큰 사용량 갱신</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              토큰 사용량은 30초마다 자동으로 갱신됩니다.
              AI 실행 시 실시간으로 토큰 체크가 이루어지며,
              제한을 초과하면 즉시 업그레이드 안내 다이얼로그가 표시됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
