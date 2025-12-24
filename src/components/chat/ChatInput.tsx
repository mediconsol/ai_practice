import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onStop,
  disabled = false,
  isLoading = false,
  placeholder = "메시지를 입력하세요...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || disabled || isLoading) return;

    onSend(trimmedInput);
    setInput("");

    // 텍스트영역 높이 리셋
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // 자동 높이 조절
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-4xl mx-auto flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={cn(
            "min-h-[60px] max-h-[200px] resize-none",
            "focus-visible:ring-primary"
          )}
          rows={1}
        />

        {isLoading ? (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={onStop}
            className="shrink-0"
          >
            <StopCircle className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-2 text-xs text-muted-foreground">
        <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted border border-border rounded">
          Enter
        </kbd>{" "}
        전송 ·{" "}
        <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted border border-border rounded">
          Shift + Enter
        </kbd>{" "}
        줄바꿈
      </div>
    </div>
  );
}
