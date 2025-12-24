import {
  TrendingUp,
  Sparkles,
  MessageSquareText,
  Boxes
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProgramCard } from "@/components/dashboard/ProgramCard";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { programs } from "@/data/programs";
import { prompts } from "@/data/prompts";

// Dashboard에는 상위 6개 프로그램만 표시
const aiPrograms = programs.slice(0, 6);

// Dashboard에는 최근 3개 프롬프트만 표시
const recentPrompts = prompts.slice(0, 3);

export default function Dashboard() {
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
          title="내 AI 프로그램"
          value={6}
          change="+2개 이번 주"
          changeType="positive"
          icon={Boxes}
        />
        <StatsCard
          title="저장된 프롬프트"
          value={42}
          change="내 자산"
          changeType="neutral"
          icon={MessageSquareText}
        />
        <StatsCard
          title="AI 실행 횟수"
          value={128}
          change="오늘 12회"
          changeType="positive"
          icon={Sparkles}
        />
        <StatsCard
          title="시간 절약"
          value="8.5h"
          change="이번 달 누적"
          changeType="positive"
          icon={TrendingUp}
        />
      </section>

      {/* AI Programs Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI 업무 프로그램</h2>
            <p className="text-sm text-muted-foreground">
              의료 업무에 바로 적용할 수 있는 AI 프로그램
            </p>
          </div>
          <button className="text-sm font-medium text-primary hover:underline">
            전체 보기 →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiPrograms.map((program, index) => (
            <div 
              key={program.title}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProgramCard {...program} />
            </div>
          ))}
        </div>
      </section>

      {/* Recent Prompts Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">최근 사용 프롬프트</h2>
            <p className="text-sm text-muted-foreground">내 프롬프트에서 빠르게 실행</p>
          </div>
          <button className="text-sm font-medium text-primary hover:underline">
            라이브러리 →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentPrompts.map((prompt) => (
            <PromptCard key={prompt.title} {...prompt} />
          ))}
        </div>
      </section>
    </div>
  );
}
