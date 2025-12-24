// AI 서비스 공통 타입 정의

export type AIProvider = 'openai' | 'claude' | 'gemini';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIStreamChunk {
  delta: string;
  isComplete: boolean;
  artifact?: ParsedArtifact;
}

export interface ParsedArtifact {
  type: 'html' | 'markdown' | 'code' | 'mermaid';
  title?: string;
  content: string;
  language?: string;
}

export interface AIServiceConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IAIService {
  /**
   * 일반 채팅 완료 (Non-streaming)
   */
  chat(messages: AIMessage[]): Promise<string>;

  /**
   * 스트리밍 채팅
   */
  chatStream(
    messages: AIMessage[],
    onChunk: (chunk: AIStreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): AbortController;
}
