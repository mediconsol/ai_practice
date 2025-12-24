import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  History as HistoryIcon,
  Sparkles,
  Clock,
  Copy,
  RotateCcw,
  ChevronRight,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { historyItems, type HistoryItem } from "@/data/history";

type HistoryItemProps = HistoryItem;

function HistoryItem({ 
  promptTitle, 
  promptPreview, 
  resultPreview, 
  aiProvider, 
  timestamp, 
  duration,
  status
}: HistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 animate-fade-in">
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "w-2 h-2 rounded-full",
                status === "success" ? "bg-success" : "bg-destructive"
              )} />
              <h3 className="font-medium text-card-foreground truncate">
                {promptTitle}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {promptPreview}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiProvider}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{timestamp}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <ChevronRight className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              isExpanded && "rotate-90"
            )} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-4 animate-fade-in">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">프롬프트</p>
            <div className="bg-muted/50 rounded-lg p-3 text-sm font-mono">
              {promptPreview}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">결과</p>
            <div className="bg-accent/50 rounded-lg p-3 text-sm">
              {resultPreview}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Copy className="w-4 h-4" />
              프롬프트 복사
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RotateCcw className="w-4 h-4" />
              다시 실행
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  const filteredItems = historyItems.filter(item => {
    const matchesSearch = item.promptTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.promptPreview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const successCount = historyItems.filter(h => h.status === "success").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">실행 히스토리</h1>
          <p className="text-muted-foreground">
            AI 실행 기록을 확인하고 이전 결과를 다시 사용하세요
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          내보내기
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{historyItems.length}</p>
          <p className="text-sm text-muted-foreground">전체 실행</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-success">{successCount}</p>
          <p className="text-sm text-muted-foreground">성공</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-destructive">{historyItems.length - successCount}</p>
          <p className="text-sm text-muted-foreground">실패</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-primary">1.7초</p>
          <p className="text-sm text-muted-foreground">평균 응답</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="히스토리 검색..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={dateFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("all")}
          >
            전체
          </Button>
          <Button
            variant={dateFilter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("today")}
          >
            오늘
          </Button>
          <Button
            variant={dateFilter === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("week")}
          >
            이번 주
          </Button>
          <Button
            variant={dateFilter === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("month")}
          >
            이번 달
          </Button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredItems.map((item, index) => (
          <div 
            key={item.id}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <HistoryItem {...item} />
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <HistoryIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">실행 기록이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
