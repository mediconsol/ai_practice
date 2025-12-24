import { Sparkles, Plus, FolderOpen, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    icon: Plus,
    title: "새 프로그램 만들기",
    description: "AI 도구 생성",
    color: "from-primary to-info",
  },
  {
    icon: Sparkles,
    title: "프롬프트 작업실",
    description: "프롬프트로 바로 실행",
    color: "from-success to-primary",
  },
  {
    icon: FolderOpen,
    title: "프롬프트 라이브러리",
    description: "저장된 자산 관리",
    color: "from-warning to-destructive",
  },
  {
    icon: Zap,
    title: "빠른 실행",
    description: "자주 쓰는 프롬프트",
    color: "from-info to-primary",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <button
          key={action.title}
          className={cn(
            "group relative overflow-hidden rounded-xl p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in",
            "bg-gradient-to-br",
            action.color
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <action.icon className="w-8 h-8 text-primary-foreground mb-3" />
          
          <h3 className="font-semibold text-primary-foreground mb-1">
            {action.title}
          </h3>
          <p className="text-sm text-primary-foreground/80">
            {action.description}
          </p>
        </button>
      ))}
    </div>
  );
}
