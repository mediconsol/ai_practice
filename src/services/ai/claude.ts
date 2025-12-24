import Anthropic from '@anthropic-ai/sdk';
import type { IAIService, AIServiceConfig, ChatMessage, StreamChunk } from './types';

/**
 * Claude (Anthropic) AI Service Implementation
 * Anthropic API를 사용한 AI 서비스
 */
export class ClaudeService implements IAIService {
  private client: Anthropic;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true, // 브라우저에서 직접 호출
    });
  }

  /**
   * 일반 채팅 (non-streaming)
   */
  async chat(messages: ChatMessage[]): Promise<string> {
    const anthropicMessages = this.convertMessages(messages);
    const systemMessage = messages.find(m => m.role === 'system')?.content;

    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 4096,
      temperature: this.config.temperature,
      system: systemMessage,
      messages: anthropicMessages,
    });

    return response.content[0].type === 'text'
      ? response.content[0].text
      : '';
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
        const anthropicMessages = this.convertMessages(messages);
        const systemMessage = messages.find(m => m.role === 'system')?.content;

        const stream = await this.client.messages.create({
          model: this.config.model,
          max_tokens: 4096,
          temperature: this.config.temperature,
          system: systemMessage,
          messages: anthropicMessages,
          stream: true,
        });

        for await (const event of stream) {
          if (abortController.signal.aborted) {
            break;
          }

          if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              onChunk({
                delta: event.delta.text,
                content: event.delta.text,
              });
            }
          }
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
   * ChatMessage를 Anthropic 형식으로 변환
   */
  private convertMessages(messages: ChatMessage[]): Array<{
    role: 'user' | 'assistant';
    content: string;
  }> {
    return messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));
  }
}
