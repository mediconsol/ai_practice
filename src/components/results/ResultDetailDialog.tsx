import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Play, Download } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResultDetailDialogProps {
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
}

export function ResultDetailDialog({
  open,
  onOpenChange,
  title,
  category,
  prompt,
  result,
  memo,
  aiProvider,
  aiModel,
  executionTimeMs,
  createdAt,
}: ResultDetailDialogProps) {
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
    onOpenChange(false);
    navigate("/ai-execute", { state: { prompt } });
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("파일을 다운로드했습니다");
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-primary bg-accent px-2 py-0.5 rounded-full">
                  {category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Memo */}
          {memo && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">메모</h3>
              <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg">
                {memo}
              </p>
            </div>
          )}

          {/* Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">프롬프트</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleCopyPrompt}
              >
                <Copy className="w-3 h-3 mr-1" />
                복사
              </Button>
            </div>
            <div className="text-sm text-foreground bg-muted/50 p-4 rounded-lg whitespace-pre-wrap font-mono">
              {prompt}
            </div>
          </div>

          {/* Result */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">실행 결과</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleDownload}
                >
                  <Download className="w-3 h-3 mr-1" />
                  다운로드
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleCopyResult}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  복사
                </Button>
              </div>
            </div>
            <div className="text-sm bg-muted/50 p-4 rounded-lg prose prose-sm max-w-none dark:prose-invert prose-slate prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:not-italic prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2 prose-ul:list-disc prose-ol:list-decimal prose-li:text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // 코드 블록 커스터마이징
                  code({className, children, ...props}: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  // 표 커스터마이징
                  table({children}: any) {
                    return (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full">{children}</table>
                      </div>
                    );
                  },
                  // 인용구 커스터마이징
                  blockquote({children}: any) {
                    return (
                      <blockquote className="border-l-4 pl-4 py-2 my-4">
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">실행 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">AI 제공자:</span>
                <p className="font-medium text-foreground">
                  {getProviderName(aiProvider)}
                </p>
              </div>
              {aiModel && (
                <div>
                  <span className="text-muted-foreground">모델:</span>
                  <p className="font-medium text-foreground">{aiModel}</p>
                </div>
              )}
              {executionTimeMs && (
                <div>
                  <span className="text-muted-foreground">실행 시간:</span>
                  <p className="font-medium text-foreground">
                    {(executionTimeMs / 1000).toFixed(2)}초
                  </p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">생성일:</span>
                <p className="font-medium text-foreground">
                  {new Date(createdAt).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button onClick={handleReExecute}>
            <Play className="w-4 h-4 mr-2" />
            다시 실행
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
