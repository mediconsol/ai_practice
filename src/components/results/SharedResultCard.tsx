import { Copy, Play, Eye, Download, Heart, Maximize2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  useToggleLike,
  useCheckLike,
  useIncrementViewCount,
} from "@/hooks/useExecutionResults";

interface SharedResultCardProps {
  id: string;
  title: string;
  category: string;
  prompt: string;
  result: string;
  memo?: string | null;
  aiProvider?: string | null;
  aiModel?: string | null;
  executionTimeMs?: number | null;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  author?: {
    id: string;
    email?: string;
    full_name?: string;
    hospital?: string;
    department?: string;
  } | null;
  onSaveToMyAssets?: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

export function SharedResultCard({
  id,
  title,
  category,
  prompt,
  result,
  memo,
  aiProvider,
  aiModel,
  executionTimeMs,
  createdAt,
  viewCount,
  likeCount,
  author,
  onSaveToMyAssets,
  onViewDetail,
}: SharedResultCardProps) {
  const navigate = useNavigate();
  const toggleLike = useToggleLike();
  const { data: isLiked = false } = useCheckLike(id);
  const incrementViewCount = useIncrementViewCount();

  const handleCopyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("결과물을 클립보드에 복사했습니다");
  };

  const handleReExecute = () => {
    incrementViewCount.mutate(id);
    navigate("/ai-execute", { state: { prompt } });
  };

  const handleSaveToMyAssets = () => {
    incrementViewCount.mutate(id);
    if (onSaveToMyAssets) {
      onSaveToMyAssets(id);
    }
  };

  const handleToggleLike = () => {
    toggleLike.mutate({ resultId: id });
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
          <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
            공유됨
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {viewCount}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 gap-1 hover:text-destructive transition-colors"
            onClick={handleToggleLike}
          >
            <Heart
              className={cn(
                "w-3 h-3",
                isLiked && "fill-destructive text-destructive"
              )}
            />
            <span>{likeCount}</span>
          </Button>
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
        <div className="flex flex-col gap-1.5">
          {/* Author Info */}
          {author && (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5 border">
                <AvatarFallback className="bg-gradient-to-br from-primary to-info text-white text-[10px] font-semibold">
                  {author.full_name?.substring(0, 2).toUpperCase() || <User className="w-3 h-3" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  {author.full_name || '익명'}
                </span>
                {author.hospital && (
                  <span className="text-[10px] text-muted-foreground">
                    {author.hospital}{author.department && ` · ${author.department}`}
                  </span>
                )}
              </div>
            </div>
          )}
          {/* Time & Provider Info */}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">
              {createdAt && new Date(createdAt).toString() !== 'Invalid Date'
                ? formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })
                : '날짜 정보 없음'}
            </span>
            {aiProvider && (
              <span className="text-xs text-muted-foreground/60">
                {getProviderName(aiProvider)}
                {executionTimeMs && ` • ${(executionTimeMs / 1000).toFixed(2)}초`}
              </span>
            )}
          </div>
        </div>
        <TooltipProvider>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onViewDetail?.(id)}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>상세보기</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleCopyResult}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>결과 복사</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleReExecute}
                >
                  <Play className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>이 프롬프트로 실행</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleSaveToMyAssets}
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>내 자산에 저장</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
