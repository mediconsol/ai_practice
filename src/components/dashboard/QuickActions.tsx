import { Play, Boxes, Archive, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const actions = [
  {
    icon: Play,
    title: "프롬프트 작업실",
    description: "프롬프트를 입력하고 AI 응답을 즉시 실행해보세요",
    details: "ChatGPT, Claude, Gemini 등 다양한 AI 모델을 선택하여 사용할 수 있습니다",
    iconColor: "text-primary",
    bgGradient: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
    hoverBg: "hover:from-primary/15 hover:via-primary/10",
    borderColor: "border-primary/20",
    url: "/ai-execute",
    badge: "시작하기",
    badgeColor: "bg-primary/10 text-primary",
  },
  {
    icon: Boxes,
    title: "AI도구 제작실",
    description: "대화형 챗봇, 입력 폼, 프로그램을 직접 만들어보세요",
    details: "코드 없이 AI로 나만의 업무 도구를 생성하고 바로 사용할 수 있습니다",
    iconColor: "text-blue-600 dark:text-blue-400",
    bgGradient: "bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent",
    hoverBg: "hover:from-blue-500/15 hover:via-blue-500/10",
    borderColor: "border-blue-500/20",
    url: "/programs",
    badge: "직접 만들기",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Archive,
    title: "AI소스 수집함",
    description: "Claude, ChatGPT, Gemini에서 만든 소스코드를 즉시 미리보기로 확인하세요",
    details: "HTML, React, Python, Artifact 코드를 입력하면 바로 실행되는 라이브 미리보기 제공",
    iconColor: "text-purple-600 dark:text-purple-400",
    bgGradient: "bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent",
    hoverBg: "hover:from-purple-500/15 hover:via-purple-500/10",
    borderColor: "border-purple-500/20",
    url: "/program-collections",
    badge: "라이브 미리보기",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    icon: BookOpen,
    title: "사용자 매뉴얼",
    description: "메디콘솔 AI 플랫폼의 주요 기능과 활용법을 배워보세요",
    details: "단계별 가이드와 활용 팁으로 빠르게 익히기",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgGradient: "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent",
    hoverBg: "hover:from-emerald-500/15 hover:via-emerald-500/10",
    borderColor: "border-emerald-500/20",
    url: "/user-guide",
    badge: "도움말",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Link
          key={action.title}
          to={action.url}
          className={cn(
            "group relative rounded-xl p-6 text-left transition-all duration-300 animate-fade-in block border",
            action.bgGradient,
            action.hoverBg,
            action.borderColor,
            "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className={cn("text-xs font-medium border-0", action.badgeColor)}>
              {action.badge}
            </Badge>
          </div>

          {/* Icon */}
          <div className="mb-4">
            <div className={cn(
              "inline-flex p-3 rounded-xl transition-all duration-300",
              "group-hover:scale-110 group-hover:rotate-3",
              "bg-background/50 backdrop-blur-sm shadow-sm"
            )}>
              <action.icon className={cn("w-6 h-6", action.iconColor)} strokeWidth={2} />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2 mb-4">
            <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {action.description}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {action.details}
            </p>
          </div>

          {/* Arrow indicator */}
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
            <span>시작하기</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
          </div>

          {/* Sparkles effect on hover */}
          <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className={cn("w-4 h-4", action.iconColor)} />
          </div>
        </Link>
      ))}
    </div>
  );
}
