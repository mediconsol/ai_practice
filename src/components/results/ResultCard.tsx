import {
  Copy,
  Play,
  Star,
  MoreVertical,
  Share2,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ResultCardProps {
  id: string;
  title: string;
  category: string;
  prompt: string;
  result: string;
  memo?: string | null;
  isFavorite: boolean;
  isShared?: boolean;
  aiProvider?: string | null;
  aiModel?: string | null;
  executionTimeMs?: number | null;
  createdAt: string;
  onToggleFavorite?: (id: string, currentFavorite: boolean) => void;
  onToggleShare?: (id: string, currentShared: boolean) => void;
  onDelete?: (id: string, title: string) => void;
}

export function ResultCard({
  id,
  title,
  category,
  prompt,
  result,
  memo,
  isFavorite,
  isShared = false,
  aiProvider,
  aiModel,
  executionTimeMs,
  createdAt,
  onToggleFavorite,
  onToggleShare,
  onDelete,
}: ResultCardProps) {
  const navigate = useNavigate();

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast.success("프롬프트를 클립보드에 복사했습니다");
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("결과물을 클립보드에 복사했습니다");
  };

  const handleReExecute = () => {
    navigate("/ai-execute", { state: { prompt } });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id, isFavorite);
    }
  };

  const handleToggleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleShare) {
      onToggleShare(id, isShared);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id, title);
    }
  };

  const getProviderName = (provider: string | null | undefined) => {
    if (!provider) return "AI";
    const names: Record<string, string> = {
      openai: "ChatGPT",
      gemini: "Gemini",
      claude: "Claude",
    };
    return names[provider] || provider;
  };

  return (
    <div className="group bg-card rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-primary bg-accent px-2 py-0.5 rounded-full">
            {category}
          </span>
          {isShared && (
            <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              공유됨
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleToggleFavorite}
          >
            <Star
              className={cn(
                "w-4 h-4 transition-all",
                isFavorite
                  ? "fill-warning text-warning"
                  : "text-muted-foreground hover:text-warning"
              )}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReExecute}>
                <Play className="w-4 h-4 mr-2" />
                다시 실행
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyPrompt}>
                <Copy className="w-4 h-4 mr-2" />
                프롬프트 복사
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyResult}>
                <Copy className="w-4 h-4 mr-2" />
                결과물 복사
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleFavorite}>
                <Star className="w-4 h-4 mr-2" />
                {isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              </DropdownMenuItem>
              {onToggleShare && (
                <DropdownMenuItem onClick={handleToggleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  {isShared ? "공유 취소" : "공유하기"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Memo (if exists) */}
      {memo && (
        <p className="text-xs text-muted-foreground mb-3 italic bg-muted/30 p-2 rounded">
          {memo}
        </p>
      )}

      {/* Prompt Preview */}
      <div className="mb-3">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          프롬프트:
        </p>
        <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-3 rounded-lg max-h-[80px] overflow-y-auto">
          {prompt}
        </div>
      </div>

      {/* Result Preview */}
      <div className="mb-4">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          실행 결과:
        </p>
        <div className="text-xs text-card-foreground bg-muted/50 p-3 rounded-lg max-h-[150px] overflow-y-auto whitespace-pre-wrap">
          {result}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </span>
          {aiProvider && (
            <span className="text-xs text-muted-foreground/60">
              {getProviderName(aiProvider)}
              {executionTimeMs && ` • ${(executionTimeMs / 1000).toFixed(2)}초`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={handleCopyResult}
          >
            <Copy className="w-3 h-3 mr-1" />
            복사
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={handleReExecute}>
            <Play className="w-3 h-3 mr-1" />
            다시 실행
          </Button>
        </div>
      </div>
    </div>
  );
}
