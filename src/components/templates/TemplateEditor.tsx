import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import type { ChatMessage as ChatMessageType } from "@/components/chat/types";
import type { ProgramTemplate, AIProvider } from "@/lib/supabase";
import { createAIService } from "@/services/ai";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

interface TemplateEditorProps {
  template: ProgramTemplate;
  systemPrompt?: string;
  aiProvider?: AIProvider;
  aiModel?: string;
  onBack: () => void;
  onComplete: (finalContent: string) => void;
}

export function TemplateEditor({
  template,
  systemPrompt,
  aiProvider = 'openai',
  aiModel,
  onBack,
  onComplete,
}: TemplateEditorProps) {
  const [currentContent, setCurrentContent] = useState(template.content);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageRef = useRef<string>('');

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    currentMessageRef.current = '';

    try {
      const aiService = createAIService(aiProvider, aiModel);

      // 시스템 프롬프트 구성
      const contextPrompt = `현재 템플릿 내용:\n\n${currentContent}\n\n사용자의 수정 요청에 따라 템플릿을 수정해주세요. 수정된 전체 템플릿 내용을 제공하세요.`;

      const aiMessages = [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'system' as const, content: contextPrompt },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        { role: 'user' as const, content },
      ];

      const aiMessageId = `assistant-${Date.now()}`;

      abortControllerRef.current = aiService.chatStream(
        aiMessages,
        (chunk) => {
          if (chunk.delta) {
            currentMessageRef.current += chunk.delta;

            setMessages((prev) => {
              const existing = prev.find(m => m.id === aiMessageId);
              if (existing) {
                return prev.map(m =>
                  m.id === aiMessageId
                    ? { ...m, content: currentMessageRef.current }
                    : m
                );
              } else {
                return [
                  ...prev,
                  {
                    id: aiMessageId,
                    role: 'assistant' as const,
                    content: currentMessageRef.current,
                    timestamp: new Date(),
                  },
                ];
              }
            });
          }
        },
        () => {
          // 완료 시 템플릿 내용 업데이트
          if (currentMessageRef.current) {
            setCurrentContent(currentMessageRef.current);
          }
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        (error) => {
          console.error('AI 응답 에러:', error);
          toast.error('AI 응답 생성 실패', {
            description: error.message,
          });
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      );
    } catch (error: any) {
      console.error('메시지 전송 실패:', error);
      toast.error('메시지 전송 실패', {
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      toast.info('AI 응답 생성이 중단되었습니다');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-sm text-muted-foreground">
              AI와 대화하며 템플릿을 수정하세요
            </p>
          </div>
        </div>
        <Button
          onClick={() => onComplete(currentContent)}
          className="gap-2"
        >
          <Check className="w-4 h-4" />
          완료
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* Left: Template Preview */}
        <div className="flex flex-col border border-border rounded-lg overflow-hidden h-[50vh] lg:h-auto">
          <div className="bg-muted px-4 py-2 border-b border-border">
            <h4 className="font-medium text-sm">템플릿 미리보기</h4>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <Textarea
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              className="min-h-full resize-none font-mono text-sm border-none focus-visible:ring-0"
              placeholder="템플릿 내용..."
            />
          </div>
        </div>

        {/* Right: Chat */}
        <div className="flex flex-col border border-border rounded-lg overflow-hidden h-[50vh] lg:h-auto">
          <div className="bg-muted px-4 py-2 border-b border-border">
            <h4 className="font-medium text-sm">AI 수정 도우미</h4>
          </div>
          <div className="flex-1 overflow-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center p-4">
                <div className="text-muted-foreground text-sm">
                  <p className="mb-2">템플릿 수정이 필요한 부분을 말씀해주세요.</p>
                  <p className="text-xs">
                    예: "환자 이름을 홍길동으로 변경해줘"<br />
                    "날짜 형식을 YYYY-MM-DD로 바꿔줘"
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-border">
            <ChatInput
              onSend={handleSendMessage}
              onStop={handleStopGeneration}
              isLoading={isLoading}
              placeholder="수정 요청을 입력하세요..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
