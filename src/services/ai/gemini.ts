import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IAIService, AIServiceConfig, ChatMessage, StreamChunk } from './types';

/**
 * Google Gemini AI Service Implementation
 * Google Generative AI API를 사용한 AI 서비스
 */
export class GeminiService implements IAIService {
  private client: GoogleGenerativeAI;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  /**
   * 일반 채팅 (non-streaming)
   */
  async chat(messages: ChatMessage[]): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.config.model,
    });

    const chat = model.startChat({
      history: this.convertToHistory(messages),
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: 4096,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;

    return response.text();
  }

  /**
   * 스트리밍 채팅
   */
  chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): AbortController {
    const abortController = new AbortController();

    (async () => {
      try {
        const model = this.client.getGenerativeModel({
          model: this.config.model,
        });

        const chat = model.startChat({
          history: this.convertToHistory(messages),
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: 4096,
          },
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessageStream(lastMessage.content);

        for await (const chunk of result.stream) {
          if (abortController.signal.aborted) {
            break;
          }

          const text = chunk.text();
          onChunk({
            delta: text,
            content: text,
          });
        }

        if (!abortController.signal.aborted) {
          onComplete();
        }
      } catch (error: any) {
        if (!abortController.signal.aborted) {
          onError(error);
        }
      }
    })();

    return abortController;
  }

  /**
   * ChatMessage를 Gemini 히스토리 형식으로 변환
   */
  private convertToHistory(messages: ChatMessage[]): Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }> {
    // 시스템 메시지 제외하고, 마지막 메시지 전까지만 히스토리로 변환
    return messages
      .slice(0, -1)
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
  }
}
