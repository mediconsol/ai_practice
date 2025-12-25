import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FileText, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecentPrompts } from "@/hooks/useDashboardStats";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export function RecentPromptWidget() {
  const { data: recentPrompts = [], isLoading } = useRecentPrompts();
  const navigate = useNavigate();
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            최근 프롬프트
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

  return (
    <Card className="col-span-full lg:col-span-1 border-info/20 bg-gradient-to-br from-info/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-info" />
          최근 프롬프트
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentPrompts.length > 0 ? (
          <>
            {/* 프롬프트 슬라이드 */}
            <Carousel
              plugins={[autoplayPlugin.current]}
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent>
                {recentPrompts.map((prompt) => (
                  <CarouselItem key={prompt.id}>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {prompt.title}
                          </h3>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {prompt.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {prompt.content}
                        </p>
                      </div>

                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>
                          {format(new Date(prompt.created_at), "M월 d일 HH:mm", {
                            locale: ko,
                          })}
                        </span>
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          <span>{prompt.usage_count}회 사용</span>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {recentPrompts.length > 1 && (
                <>
                  <CarouselPrevious className="left-0" />
                  <CarouselNext className="right-0" />
                </>
              )}
            </Carousel>

            {/* 전체 보기 버튼 */}
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/prompts")}
                className="w-full gap-1"
              >
                내 프롬프트 전체 보기
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mb-4">
              저장된 프롬프트가 없습니다
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/ai-execute")}
            >
              프롬프트 작업실로 이동
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
