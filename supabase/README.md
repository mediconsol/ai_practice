# Supabase Edge Functions

메디콘솔 AI 플랫폼의 백엔드 Edge Functions입니다.

## 📁 구조

```
supabase/
├── functions/
│   ├── execute-ai/          # AI 실행 (OpenAI, Gemini, Claude)
│   │   └── index.ts
│   ├── export-prompts/      # 프롬프트 JSON/CSV 내보내기
│   │   └── index.ts
│   ├── import-prompts/      # 프롬프트 JSON 가져오기
│   │   └── index.ts
│   └── .env.example         # 환경 변수 예시
├── config.toml              # Supabase CLI 설정
└── README.md
```

## 🚀 빠른 시작

### 1. 환경 변수 설정

Supabase Dashboard > Settings > Edge Functions > Secrets:

```bash
OPENAI_API_KEY=sk-proj-xxxxx
GEMINI_API_KEY=AIzaxxxxx
CLAUDE_API_KEY=sk-ant-xxxxx
```

### 2. 함수 배포

```bash
# 로그인 및 프로젝트 연결
supabase login
supabase link --project-ref your-project-ref

# 전체 배포
supabase functions deploy

# 개별 배포
supabase functions deploy execute-ai
supabase functions deploy export-prompts
supabase functions deploy import-prompts
```

### 3. 로컬 개발

```bash
# Supabase 로컬 시작 (Docker 필요)
supabase start

# Edge Functions 로컬 실행
supabase functions serve
```

## 📡 API 사용법

### 1. execute-ai - AI 실행

**엔드포인트**: `POST /functions/v1/execute-ai`

**요청**:
```json
{
  "prompt": "당뇨병 환자를 위한 식이요법 안내문을 작성해주세요",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "promptId": "uuid-optional",
  "variables": {
    "disease": "당뇨병"
  }
}
```

**응답**:
```json
{
  "success": true,
  "result": "당뇨병 환자를 위한 식이요법...",
  "durationMs": 1234,
  "tokenUsage": {
    "prompt_tokens": 100,
    "completion_tokens": 200,
    "total_tokens": 300
  },
  "provider": "openai",
  "model": "gpt-4o-mini"
}
```

**지원 AI 제공자**:
- `openai` - GPT-4o, GPT-4o-mini
- `gemini` - Gemini Pro, Gemini Pro Vision
- `claude` - Claude 3.5 Sonnet, Claude 3 Opus

### 2. export-prompts - 프롬프트 내보내기

**엔드포인트**: `POST /functions/v1/export-prompts`

**요청**:
```json
{
  "format": "json",
  "includeHistory": false,
  "promptIds": ["uuid1", "uuid2"]
}
```

**응답**: JSON 또는 CSV 파일 다운로드

### 3. import-prompts - 프롬프트 가져오기

**엔드포인트**: `POST /functions/v1/import-prompts`

**요청**:
```json
{
  "prompts": [
    {
      "title": "당뇨병 안내문",
      "content": "...",
      "category": "환자 안내문",
      "isFavorite": true
    }
  ],
  "overwriteDuplicates": false,
  "programId": "uuid-optional"
}
```

**응답**:
```json
{
  "success": true,
  "imported": 5,
  "updated": 0,
  "skipped": 2,
  "total": 7
}
```

## 🔒 보안

- ✅ JWT 인증 필수 (`Authorization: Bearer <token>`)
- ✅ Row Level Security (RLS) 적용
- ✅ API 키는 서버에서만 사용 (클라이언트 노출 방지)
- ✅ CORS 헤더 설정

## 📊 모니터링

```bash
# 함수 로그 확인
supabase functions logs execute-ai

# 실시간 로그 스트리밍
supabase functions logs execute-ai --follow
```

Supabase Dashboard > Edge Functions > Logs에서 시각적 모니터링 가능

## 🧪 테스트

```bash
# cURL 테스트
curl -i --location --request POST \
  'https://your-project.supabase.co/functions/v1/execute-ai' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "테스트 프롬프트",
    "provider": "openai"
  }'
```

## 💡 개발 팁

1. **환경 변수 관리**: `.env` 파일 사용하지 말고 Supabase Secrets 사용
2. **로깅**: `console.log()` 사용 시 Supabase Dashboard에서 확인 가능
3. **타입 안정성**: TypeScript로 작성되어 있음
4. **에러 처리**: 모든 함수에 try-catch 구현됨

## 📖 더 알아보기

- [Supabase Setup Guide](../docs/SUPABASE_SETUP.md) - 상세 설정 가이드
- [Supabase 공식 문서](https://supabase.com/docs/guides/functions)
