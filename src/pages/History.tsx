import { useState, useMemo } from "react";
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
  Download,
  MoreVertical,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useHistory, useDeleteHistory } from "@/hooks/useHistory";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { ConvertToProgramDialog } from "@/components/prompts/ConvertToProgramDialog";
import type { Database } from "@/lib/supabase";

type ExecutionHistory = Database['public']['Tables']['execution_history']['Row'];

// 프롬프트 내용에서 의미있는 제목 추출
const generateTitleFromPrompt = (content: string, maxLength: number = 40): string => {
  if (!content) return "제목 없음";

  // 첫 줄 또는 첫 문장을 추출
  const firstLine = content.split('\n')[0].trim();
  const firstSentence = firstLine.split(/[.!?。]/)[0].trim();

  // maxLength로 제한
  const title = (firstSentence || firstLine).substring(0, maxLength);

  // 너무 짧으면 조금 더 추가
  if (title.length < 15 && content.length > maxLength) {
    return content.substring(0, maxLength).trim() + '...';
  }

  return title || "제목 없음";
};

interface HistoryItemProps {
  id: string;
  prompt_title: string | null;
  prompt_content: string;
  result_content: string | null;
  ai_provider: string;
  created_at: string;
  duration_ms: number | null;
  status: string | null;
  onConvertToProgram?: (title: string, content: string, result?: string | null) => void;
  onDelete?: (id: string, title: string) => void;
}

function HistoryItem({
  id,
  prompt_title,
  prompt_content,
  result_content,
  ai_provider,
  created_at,
  duration_ms,
  status,
  onConvertToProgram,
  onDelete
}: HistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt_content);
    toast.success("프롬프트를 복사했습니다");
  };

  const handleCopyResult = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (result_content) {
      navigator.clipboard.writeText(result_content);
      toast.success("결과를 복사했습니다");
    }
  };

  const durationText = duration_ms
    ? duration_ms >= 1000
      ? `${(duration_ms / 1000).toFixed(1)}초`
      : `${duration_ms}ms`
    : "-";

  // 제목이 "AI 실행" 또는 "제목 없음"이면 프롬프트 내용에서 자동 생성
  const displayTitle = useMemo(() => {
    if (!prompt_title || prompt_title === "AI 실행" || prompt_title === "제목 없음") {
      return generateTitleFromPrompt(prompt_content);
    }
    return prompt_title;
  }, [prompt_title, prompt_content]);

  const handleConvertToProgram = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConvertToProgram) {
      onConvertToProgram(displayTitle, prompt_content, result_content);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id, displayTitle);
    }
  };

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
                {displayTitle}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {prompt_content}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{ai_provider}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{durationText}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: ko })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyPrompt}>
              <Copy className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyPrompt}>
                  <Copy className="w-4 h-4 mr-2" />
                  프롬프트 복사
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyResult} disabled={!result_content}>
                  <Copy className="w-4 h-4 mr-2" />
                  결과 복사
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleConvertToProgram}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  프로그램으로 만들기
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <div className="bg-muted/50 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap">
              {prompt_content}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">결과</p>
            <div className="bg-accent/50 rounded-lg p-3 text-sm whitespace-pre-wrap">
              {result_content || "결과가 없습니다."}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyPrompt}>
              <Copy className="w-4 h-4" />
              프롬프트 복사
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyResult}>
              <Copy className="w-4 h-4" />
              결과 복사
            </Button>
            <Button variant="default" size="sm" className="gap-1.5" onClick={handleConvertToProgram}>
              <Sparkles className="w-4 h-4" />
              프로그램으로 만들기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [promptToConvert, setPromptToConvert] = useState<{
    title: string;
    content: string;
    result?: string | null;
  } | null>(null);
  const { data: historyItems = [], isLoading } = useHistory();
  const deleteHistory = useDeleteHistory();

  const handleConvertToProgram = (title: string, content: string, result?: string | null) => {
    setPromptToConvert({ title, content, result: result || null });
    setConvertDialogOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`"${title}" 실행 기록을 삭제하시겠습니까?`)) {
      deleteHistory.mutate(id);
    }
  };

  const filteredItems = useMemo(() => {
    return historyItems.filter(item => {
      const matchesSearch =
        item.prompt_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.prompt_content?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [historyItems, searchQuery]);

  const successCount = historyItems.filter(h => h.status === "success").length;
  const avgDuration = historyItems.length > 0
    ? historyItems
        .filter(h => h.duration_ms)
        .reduce((acc, h) => acc + (h.duration_ms || 0), 0) / historyItems.filter(h => h.duration_ms).length
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">실행 기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-3xl font-bold text-primary">{avgDuration > 0 ? `${(avgDuration / 1000).toFixed(1)}초` : "-"}</p>
          <p className="text-sm text-muted-foreground">평균 응답</p>
        </div>
      </div>

      {/* Search */}
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
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <HistoryItem
              id={item.id}
              prompt_title={item.prompt_title}
              prompt_content={item.prompt_content}
              result_content={item.result_content}
              ai_provider={item.ai_provider}
              created_at={item.created_at}
              duration_ms={item.duration_ms}
              status={item.status}
              onConvertToProgram={handleConvertToProgram}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <HistoryIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">실행 기록이 없습니다.</p>
        </div>
      )}

      {/* Convert to Program Dialog */}
      {promptToConvert && (
        <ConvertToProgramDialog
          open={convertDialogOpen}
          onOpenChange={setConvertDialogOpen}
          promptTitle={promptToConvert.title}
          promptContent={promptToConvert.content}
          promptCategory="문서 처리"
          promptResult={promptToConvert.result}
        />
      )}
    </div>
  );
}
