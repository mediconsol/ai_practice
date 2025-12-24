# Supabase 백엔드 설정 가이드

이 문서는 메디콘솔 AI 플랫폼의 Supabase 백엔드를 설정하는 방법을 안내합니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [Supabase 프로젝트 생성](#supabase-프로젝트-생성)
3. [데이터베이스 스키마 설정](#데이터베이스-스키마-설정)
4. [Edge Functions 배포](#edge-functions-배포)
5. [프론트엔드 연동](#프론트엔드-연동)
6. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
7. [문제 해결](#문제-해결)

---

## 사전 준비

### 필요한 것들

- [Supabase](https://supabase.com) 계정
- [Node.js](https://nodejs.org) 18+ 설치
- Supabase CLI 설치
- AI API 키:
  - [OpenAI API Key](https://platform.openai.com/api-keys)
  - [Google Gemini API Key](https://makersuite.google.com/app/apikey) (선택)
  - [Anthropic Claude API Key](https://console.anthropic.com/) (선택)

### Supabase CLI 설치

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (모든 플랫폼)
npm install -g supabase
```

설치 확인:
```bash
supabase --version
```

---

## Supabase 프로젝트 생성

### 1. Supabase Dashboard에서 프로젝트 생성

1. https://app.supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: mediconsol-ai
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수!)
   - **Region**: Northeast Asia (Seoul) - ap-northeast-1
4. "Create new project" 클릭 (약 2분 소요)

### 2. 프로젝트 설정 확인

프로젝트 생성 후 Settings > API에서 다음 정보 확인:

- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbGc...` (공개 키)
- **service_role key**: `eyJhbGc...` (비밀 키 - 절대 노출 금지!)

---

## 데이터베이스 스키마 설정

### 방법 1: SQL Editor 사용 (추천)

1. Supabase Dashboard > SQL Editor
2. "New query" 클릭
3. 아래 SQL 전체 복사하여 붙여넣기
4. "Run" 클릭

```sql
-- 사용자 프로필 테이블
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  hospital TEXT,
  department TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI 프로그램 테이블
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  gradient TEXT,
  is_public BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프롬프트 테이블
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로젝트 테이블
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로젝트-프롬프트 연결 테이블
CREATE TABLE project_prompts (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER,
  PRIMARY KEY (project_id, prompt_id)
);

-- 실행 히스토리 테이블
CREATE TABLE execution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  prompt_title TEXT NOT NULL,
  prompt_content TEXT NOT NULL,
  ai_provider TEXT NOT NULL,
  ai_model TEXT,
  result_content TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  duration_ms INTEGER,
  token_usage JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_programs_user_id ON programs(user_id);
CREATE INDEX idx_programs_category ON programs(category);
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_program_id ON prompts(program_id);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_history_user_id ON execution_history(user_id);
CREATE INDEX idx_history_created_at ON execution_history(created_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_history ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 자기 데이터만 조회/수정
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can manage own programs"
  ON programs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public programs"
  ON programs FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own prompts"
  ON prompts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own project_prompts"
  ON project_prompts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_prompts.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own history"
  ON execution_history FOR ALL
  USING (auth.uid() = user_id);

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 함수: 회원가입 시 자동으로 프로필 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 방법 2: Supabase CLI 사용

```bash
# 프로젝트 연결
supabase login
supabase link --project-ref your-project-ref

# 마이그레이션 생성
supabase migration new initial_schema

# 위 SQL을 supabase/migrations/XXXXXX_initial_schema.sql에 붙여넣기

# 마이그레이션 적용
supabase db push
```

---

## Edge Functions 배포

### 1. Supabase CLI로 로그인

```bash
supabase login
```

### 2. 프로젝트 연결

```bash
# 프로젝트 ID는 Supabase Dashboard > Settings > General에서 확인
supabase link --project-ref your-project-ref
```

### 3. 환경 변수 설정

Supabase Dashboard > Settings > Edge Functions > Secrets에서 설정:

```
OPENAI_API_KEY=sk-proj-xxxxx
GEMINI_API_KEY=AIzaxxxxx
CLAUDE_API_KEY=sk-ant-xxxxx
```

또는 CLI로 설정:

```bash
# OpenAI
supabase secrets set OPENAI_API_KEY=sk-proj-xxxxx

# Gemini
supabase secrets set GEMINI_API_KEY=AIzaxxxxx

# Claude
supabase secrets set CLAUDE_API_KEY=sk-ant-xxxxx
```

### 4. Edge Functions 배포

```bash
# 모든 함수 배포
supabase functions deploy execute-ai
supabase functions deploy export-prompts
supabase functions deploy import-prompts

# 또는 한 번에
supabase functions deploy
```

배포 확인:
```bash
supabase functions list
```

### 5. 함수 테스트

```bash
# execute-ai 테스트
curl -i --location --request POST \
  'https://your-project.supabase.co/functions/v1/execute-ai' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"prompt":"안녕하세요","provider":"openai"}'
```

---

## 프론트엔드 연동

### 1. Supabase 클라이언트 설치

```bash
npm install @supabase/supabase-js
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Supabase 클라이언트 초기화

`src/lib/supabase.ts` 파일이 이미 생성되어 있으므로 확인만:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4. 사용 예시

```typescript
// AI 실행
const { data, error } = await supabase.functions.invoke('execute-ai', {
  body: {
    prompt: '당뇨병 환자 안내문을 작성해주세요',
    provider: 'openai',
  }
});

// 프롬프트 조회
const { data: prompts } = await supabase
  .from('prompts')
  .select('*')
  .order('created_at', { ascending: false });
```

---

## 로컬 개발 환경 설정

### 1. Supabase 로컬 시작

```bash
# Docker Desktop 실행 필요
supabase start
```

출력되는 정보:
- API URL: `http://localhost:54321`
- Studio URL: `http://localhost:54323`
- anon key, service_role key 등

### 2. 로컬 환경 변수

`.env.local`:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=로컬에서_출력된_anon_key
```

### 3. Edge Functions 로컬 실행

```bash
# 특정 함수 실행
supabase functions serve execute-ai --env-file supabase/functions/.env

# 모든 함수 실행
supabase functions serve --env-file supabase/functions/.env
```

### 4. 로컬에서 함수 테스트

```bash
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/execute-ai' \
  --header 'Authorization: Bearer YOUR_LOCAL_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"prompt":"테스트","provider":"openai"}'
```

---

## 문제 해결

### Edge Function 배포 실패

**오류**: `Error: Failed to deploy function`

**해결**:
```bash
# 로그 확인
supabase functions logs execute-ai

# 함수 삭제 후 재배포
supabase functions delete execute-ai
supabase functions deploy execute-ai
```

### RLS 정책 문제

**오류**: `new row violates row-level security policy`

**해결**:
1. Supabase Dashboard > Authentication > Policies 확인
2. 정책이 올바르게 설정되었는지 확인
3. `auth.uid()`가 올바른 user_id와 매칭되는지 확인

### CORS 오류

**오류**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**해결**:
- Edge Function 코드에 `corsHeaders` 추가 확인
- Supabase Dashboard > Settings > API > CORS 설정 확인

### API 키 관련 오류

**오류**: `OpenAI API error: Incorrect API key`

**해결**:
```bash
# Secrets 재설정
supabase secrets set OPENAI_API_KEY=올바른_키

# 함수 재배포
supabase functions deploy execute-ai
```

---

## 다음 단계

1. ✅ 데이터베이스 스키마 생성 완료
2. ✅ Edge Functions 배포 완료
3. 🔄 프론트엔드에서 Supabase 연동
4. 🔄 인증 시스템 구현
5. 🔄 프로덕션 배포

---

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Edge Functions 가이드](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI 레퍼런스](https://supabase.com/docs/reference/cli/introduction)
