import { memo } from "react";
import { cn } from "@/lib/utils";
import { User, Bot, FileCode } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "./types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

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
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap text-foreground">{message.content}</p>
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
