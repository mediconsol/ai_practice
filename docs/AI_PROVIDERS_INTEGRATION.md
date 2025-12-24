# AI Providers 통합 가이드

## 개요

mediconsol_ai_practice는 3개의 주요 AI Provider를 지원합니다:
- **OpenAI** (GPT-4, GPT-4o)
- **Anthropic Claude** (Claude 3.5 Sonnet, Opus)
- **Google Gemini** (Gemini Pro, Ultra)

## 설정 방법

### 1. API 키 발급

#### OpenAI
1. https://platform.openai.com/api-keys 방문
2. "Create new secret key" 클릭
3. 키 복사

#### Anthropic Claude
1. https://console.anthropic.com/settings/keys 방문
2. "Create Key" 클릭
3. 키 복사

#### Google Gemini
1. https://makersuite.google.com/app/apikey 방문
2. "Get API Key" 클릭
3. 키 복사

### 2. 환경 변수 설정

`.env.example` 파일을 `.env.local`로 복사:

```bash
cp .env.example .env.local
```

`.env.local` 파일에 발급받은 API 키 입력:

```bash
# OpenAI
VITE_OPENAI_API_KEY=sk-proj-xxxxx

# Claude
VITE_CLAUDE_API_KEY=sk-ant-xxxxx

# Gemini
VITE_GEMINI_API_KEY=AIzaSyxxxxx
```

### 3. 개발 서버 재시작

환경 변수 변경 후 반드시 개발 서버를 재시작하세요:

```bash
npm run dev
```

## 프로그램에서 AI Provider 설정

프로그램 생성 시 `config` 객체에서 AI Provider와 모델을 설정할 수 있습니다:

```typescript
{
  ai_provider: 'openai' | 'claude' | 'gemini',
  ai_model: 'gpt-4o' | 'claude-3-5-sonnet-20241022' | 'gemini-pro'
}
```

### 기본 모델

각 Provider의 기본 모델:

- **OpenAI**: `gpt-4o`
- **Claude**: `claude-3-5-sonnet-20241022`
- **Gemini**: `gemini-pro`

## 지원 기능

### 공통 기능
- ✅ 일반 채팅 (chat)
- ✅ 스트리밍 채팅 (chatStream)
- ✅ 중단 기능 (AbortController)

### Provider별 특징

#### OpenAI
- JSON 모드 지원
- Function calling 지원
- Vision (이미지 분석) 지원 (GPT-4o)

#### Claude
- 긴 컨텍스트 (200K tokens)
- 높은 정확도
- 안전성 강화

#### Gemini
- 멀티모달 (텍스트, 이미지, 비디오)
- 빠른 응답 속도
- 무료 할당량 제공

## 구현 세부사항

### AI Service Interface

모든 Provider는 `IAIService` 인터페이스를 구현합니다:

```typescript
interface IAIService {
  chat(messages: ChatMessage[]): Promise<string>;
  chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): AbortController;
}
```

### Factory Pattern

`createAIService` 팩토리 함수를 통해 Provider별 서비스를 생성:

```typescript
import { createAIService } from '@/services/ai';

const aiService = createAIService('openai', 'gpt-4o');
const result = await aiService.chat([
  { role: 'user', content: '안녕하세요' }
]);
```

## 에러 처리

### API 키 누락

```
Error: API key for openai not found.
Please set VITE_OPENAI_API_KEY in your .env.local file.
```

**해결방법:**
1. `.env.local` 파일에 API 키 추가
2. 개발 서버 재시작

### Rate Limit

각 Provider마다 요청 제한이 있습니다:

- **OpenAI**: Tier별 상이 (https://platform.openai.com/docs/guides/rate-limits)
- **Claude**: 분당 요청 수 제한
- **Gemini**: 일일 무료 할당량

**해결방법:**
- 요청 간격 조절
- 유료 플랜 업그레이드
- 에러 재시도 로직 추가

## 비용 최적화

### 1. 적절한 모델 선택

- **간단한 작업**: GPT-3.5, Claude Haiku, Gemini Pro
- **복잡한 작업**: GPT-4o, Claude Sonnet/Opus, Gemini Ultra

### 2. 컨텍스트 관리

- 불필요한 메시지 히스토리 제거
- 시스템 프롬프트 최적화
- 토큰 수 모니터링

### 3. 캐싱 활용

- 동일한 질문에 대한 응답 캐싱
- React Query로 서버 상태 관리

## 보안

### API 키 보호

- ✅ `.env.local`은 `.gitignore`에 포함
- ✅ 환경 변수는 클라이언트에서만 사용 (`VITE_` 접두사)
- ⚠️ 프로덕션 환경에서는 백엔드 프록시 사용 권장

### 백엔드 프록시 (권장)

프로덕션 환경에서는 API 키를 클라이언트에 노출하지 않도록 백엔드 프록시를 구현하세요:

```
Client → Your Backend → AI Provider
```

**장점:**
- API 키 보호
- Rate limiting 제어
- 사용량 모니터링
- 비용 관리

## 트러블슈팅

### CORS 에러

Anthropic/OpenAI SDK가 브라우저에서 직접 호출 시 CORS 에러가 발생할 수 있습니다.

**해결방법:**
```typescript
// Claude
new Anthropic({
  apiKey: config.apiKey,
  dangerouslyAllowBrowser: true, // 개발 환경만
});
```

프로덕션에서는 백엔드 프록시 사용을 권장합니다.

### 스트리밍이 작동하지 않음

1. API 키 확인
2. 브라우저 콘솔 에러 확인
3. AbortController 정상 작동 확인

## 참고 자료

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic Claude API Docs](https://docs.anthropic.com)
- [Google AI Studio Docs](https://ai.google.dev)

---

**작성일:** 2025-12-24
**버전:** 1.0.0
