import { memo } from "react";
import { cn } from "@/lib/utils";
import { User, Bot, FileCode } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "./types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
  onArtifactClick?: (artifactId: string) => void;
}

export const ChatMessage = memo(function ChatMessage({ message, onArtifactClick }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        "flex gap-3 p-4 animate-fade-in",
        isUser ? "bg-background" : "bg-muted/30"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">
            {isUser ? "사용자" : "AI 어시스턴트"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(message.timestamp, { addSuffix: true, locale: ko })}
          </span>
        </div>

        {/* Message Text */}
        <div className="prose prose-sm max-w-none dark:prose-invert prose-slate prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:not-italic prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2 prose-ul:list-disc prose-ol:list-decimal prose-li:text-foreground">
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
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Artifact Preview */}
        {message.artifact && (
          <div
            className="mt-3 p-3 border border-border rounded-lg bg-card cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => onArtifactClick?.(message.artifact!.id)}
          >
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {message.artifact.title || "생성된 아티팩트"}
              </span>
              <span className="text-xs text-muted-foreground">
                {message.artifact.type}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              클릭하여 전체 화면으로 보기
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
