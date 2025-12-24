import { useState, useRef } from "react";
import { ChatInterface, ArtifactPreview } from "@/components/chat";
import type { ChatMessage, Artifact } from "@/components/chat/types";
import { createAIService } from "@/services/ai";
import type { AIProvider } from "@/services/ai";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ChatProgramRunnerProps {
  programId: string;
  programTitle: string;
  systemPrompt?: string;
  aiProvider?: AIProvider;
  aiModel?: string;
}

export function ChatProgramRunner({
  programId,
  programTitle,
  systemPrompt,
  aiProvider = 'openai',
  aiModel,
}: ChatProgramRunnerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageRef = useRef<string>('');

  const handleSendMessage = async (content: string) => {
    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    currentMessageRef.current = '';

    try {
      // AI 서비스 생성
      const aiService = createAIService(aiProvider, aiModel);

      // 메시지 히스토리 생성
      const aiMessages = [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        { role: 'user' as const, content },
      ];

      // AI 응답 ID 미리 생성
      const aiMessageId = `assistant-${Date.now()}`;
      let artifact: Artifact | undefined;

      // 스트리밍 시작
      abortControllerRef.current = aiService.chatStream(
        aiMessages,
        // onChunk
        (chunk) => {
          if (chunk.artifact) {
            // 아티팩트 발견
            artifact = {
              id: `artifact-${Date.now()}`,
              ...chunk.artifact,
            };
          } else if (chunk.delta) {
            // 텍스트 델타
            currentMessageRef.current += chunk.delta;

            // 메시지 업데이트
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
        // onComplete
        () => {
          // 아티팩트 추가
          if (artifact) {
            setMessages((prev) =>
              prev.map(m =>
                m.id === aiMessageId
                  ? { ...m, artifact }
                  : m
              )
            );
          }
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        // onError
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
      console.error("메시지 전송 실패:", error);
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

  const handleArtifactClick = (artifactId: string) => {
    // 모든 메시지에서 아티팩트 찾기
    for (const message of messages) {
      if (message.artifact?.id === artifactId) {
        setSelectedArtifact(message.artifact);
        break;
      }
    }
  };

  const emptyState = (
    <div className="text-center p-8">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{programTitle}</h3>
      <p className="text-muted-foreground mb-4">
        {systemPrompt || "AI와 대화를 시작하세요"}
      </p>
      <div className="text-sm text-muted-foreground">
        아래에 메시지를 입력하여 대화를 시작하세요
      </div>
    </div>
  );

  return (
    <>
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        onStopGeneration={handleStopGeneration}
        onArtifactClick={handleArtifactClick}
        isLoading={isLoading}
        placeholder="메시지를 입력하세요..."
        emptyState={emptyState}
      />

      <ArtifactPreview
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
      />
    </>
  );
}
