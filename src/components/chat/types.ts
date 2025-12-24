// 채팅 메시지 타입 정의

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  artifact?: Artifact;
}

export interface Artifact {
  id: string;
  type: 'html' | 'markdown' | 'code' | 'mermaid';
  title?: string;
  content: string;
  language?: string; // for code type
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
