import type { IAIService, AIProvider, AIServiceConfig } from './types';
import { OpenAIService } from './openai';
import { ClaudeService } from './claude';
import { GeminiService } from './gemini';

/**
 * AI Service Factory
 * Provider에 따라 적절한 AI Service 인스턴스를 생성
 */
export function createAIService(
  provider: AIProvider,
  model?: string,
  apiKey?: string
): IAIService {
  const config: AIServiceConfig = {
    provider,
    model: model || getDefaultModel(provider),
    apiKey: apiKey || getAPIKey(provider),
    temperature: 0.7,
  };

  switch (provider) {
    case 'openai':
      return new OpenAIService(config);

    case 'claude':
      return new ClaudeService(config);

    case 'gemini':
      return new GeminiService(config);

    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

function getDefaultModel(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return 'gpt-4o';
    case 'claude':
      return 'claude-3-5-sonnet-20241022';
    case 'gemini':
      return 'gemini-pro';
    default:
      return 'gpt-4o';
  }
}

function getAPIKey(provider: AIProvider): string {
  const key = (() => {
    switch (provider) {
      case 'openai':
        return import.meta.env.VITE_OPENAI_API_KEY;
      case 'claude':
        return import.meta.env.VITE_CLAUDE_API_KEY;
      case 'gemini':
        return import.meta.env.VITE_GEMINI_API_KEY;
      default:
        return '';
    }
  })();

  if (!key) {
    throw new Error(
      `API key for ${provider} not found. Please set VITE_${provider.toUpperCase()}_API_KEY in your .env.local file.`
    );
  }

  return key;
}
