import type { IAIService, AIMessage, AIStreamChunk, AIServiceConfig } from './types';
import { parseArtifacts, detectCodeBlockArtifacts } from './artifactParser';

export class OpenAIService implements IAIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async chat(messages: AIMessage[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API 호출 실패');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  chatStream(
    messages: AIMessage[],
    onChunk: (chunk: AIStreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): AbortController {
    const abortController = new AbortController();

    (async () => {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model || 'gpt-4o',
            messages: messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            temperature: this.config.temperature || 0.7,
            max_tokens: this.config.maxTokens,
            stream: true,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'OpenAI API 호출 실패');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is null');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;

            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const delta = json.choices[0]?.delta?.content || '';

                if (delta) {
                  fullContent += delta;

                  onChunk({
                    delta,
                    isComplete: false,
                  });
                }
              } catch (e) {
                console.warn('Failed to parse SSE line:', trimmed, e);
              }
            }
          }
        }

        // 완료 시 아티팩트 파싱
        const contentWithArtifacts = detectCodeBlockArtifacts(fullContent);
        const parsed = parseArtifacts(contentWithArtifacts);

        if (parsed.artifacts.length > 0) {
          onChunk({
            delta: '',
            isComplete: true,
            artifact: parsed.artifacts[0], // 첫 번째 아티팩트만 사용
          });
        }

        onComplete();
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          onError(error);
        }
      }
    })();

    return abortController;
  }
}
