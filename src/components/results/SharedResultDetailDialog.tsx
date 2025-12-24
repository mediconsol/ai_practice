import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Play, Download, Heart, Eye, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useToggleLike,
  useCheckLike,
  useIncrementViewCount,
} from "@/hooks/useExecutionResults";

interface SharedResultDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  onSaveToMyAssets?: (id: string) => void;
}

export function SharedResultDetailDialog({
  open,
  onOpenChange,
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
  onSaveToMyAssets,
}: SharedResultDetailDialogProps) {
  const navigate = useNavigate();
  const toggleLike = useToggleLike();
  const { data: isLiked = false } = useCheckLike(id);
  const incrementViewCount = useIncrementViewCount();

  const handleCopyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("결과물을 클립보드에 복사했습니다");
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast.success("프롬프트를 클립보드에 복사했습니다");
  };

  const handleReExecute = () => {
    incrementViewCount.mutate(id);
    navigate("/ai-execute", { state: { prompt } });
    onOpenChange(false);
  };

  const handleSaveToMyAssets = () => {
    incrementViewCount.mutate(id);
    if (onSaveToMyAssets) {
      onSaveToMyAssets(id);
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 flex-wrap">
                <Badge variant="default">{category}</Badge>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  공유됨
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </DialogDescription>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {viewCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1 hover:text-destructive transition-colors"
                onClick={handleToggleLike}
              >
                <Heart
                  className={cn(
                    "w-4 h-4",
                    isLiked && "fill-destructive text-destructive"
                  )}
                />
                <span>{likeCount}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Memo */}
          {memo && (
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground italic">{memo}</p>
            </div>
          )}

          {/* Prompt Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                프롬프트
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyPrompt}
                className="h-7"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                복사
              </Button>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                {prompt}
              </pre>
            </div>
          </div>

          {/* Result Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">
                실행 결과
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyResult}
                className="h-7"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                복사
              </Button>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg border border-border max-h-[500px] overflow-y-auto">
              <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* AI Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            {aiProvider && (
              <span className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs">
                  {getProviderName(aiProvider)}
                </Badge>
                {aiModel && <span className="text-muted-foreground/60">{aiModel}</span>}
              </span>
            )}
            {executionTimeMs && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {(executionTimeMs / 1000).toFixed(2)}초
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={handleReExecute}>
              <Play className="w-4 h-4 mr-2" />
              이 프롬프트로 실행
            </Button>
            <Button onClick={handleSaveToMyAssets}>
              <Download className="w-4 h-4 mr-2" />
              내 자산에 저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
