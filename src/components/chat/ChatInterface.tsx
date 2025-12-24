import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { ChatMessage as ChatMessageType } from "./types";
import { Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  onStopGeneration?: () => void;
  onArtifactClick?: (artifactId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  emptyState?: React.ReactNode;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onStopGeneration,
  onArtifactClick,
  isLoading = false,
  disabled = false,
  placeholder,
  emptyState,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 추가되면 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
      >
        {messages.length === 0 && emptyState ? (
          <div className="flex items-center justify-center h-full">
            {emptyState}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onArtifactClick={onArtifactClick}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 p-4 bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">AI 어시스턴트</div>
                  <div className="text-muted-foreground text-sm">응답 생성 중...</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={onSendMessage}
        onStop={onStopGeneration}
        disabled={disabled}
        isLoading={isLoading}
        placeholder={placeholder}
      />
    </div>
  );
}
