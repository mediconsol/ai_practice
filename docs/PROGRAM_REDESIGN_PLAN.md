# AI 프로그램 시스템 재설계 계획

## 📋 개요

**현재 문제점:**
- 프로그램이 단순히 프롬프트 목록 필터링만 수행
- 독립적인 미니 애플리케이션으로 동작하지 않음
- AI 실시간 대화, 아티팩트 생성, 템플릿 관리 기능 부재

**목표:**
프로그램을 독립적인 AI 기반 애플리케이션으로 재구성하여, 각 프로그램이 고유한 UI와 워크플로우를 가지도록 함

---

## 🎯 비즈니스 전략

### Phase 1: MVP (현재)
- 하드코딩된 3-5개 대표 프로그램 구현
- 사용자들이 무료로 사용
- 피드백 수집

### Phase 2: 커뮤니티 (3-6개월 후)
- 사용자 프로그램 요청 접수 시스템
- 우수 공유 프롬프트를 프로그램으로 전환
- 기여자 리워드 시스템

### Phase 3: 수익화 (6-12개월 후)
- 프리미엄 프로그램 (유료)
- 커스텀 프로그램 개발 서비스
- 기업용 전용 프로그램

---

## 🏗️ 기술 아키텍처

### 프로그램 타입 시스템

```typescript
type ProgramType = 'chat' | 'form' | 'template';

interface ProgramConfig {
  // Chat Type
  system_prompt?: string;
  artifacts_enabled?: boolean;

  // Form Type
  form_schema?: FormField[];
  output_template?: string;

  // Template Type
  templates?: Template[];

  // Common
  ai_provider?: 'openai' | 'claude' | 'gemini';
  ai_model?: string;
}
```

### 1. Chat Type (AI 대화형)
**특징:**
- 자유로운 AI 대화
- 실시간 아티팩트 생성 (HTML, 문서 등)
- Claude 아티팩트 스타일 UI

**예시 프로그램:**
- 환자 안내문 생성기
- 의학 논문 작성 도우미
- 진료 기록 요약기

**UI 구조:**
```
┌─────────────────┬──────────────────┐
│                 │                  │
│   채팅 영역      │   미리보기 영역   │
│                 │   (아티팩트)      │
│                 │                  │
└─────────────────┴──────────────────┘
```

### 2. Form Type (구조화된 입력/출력)
**특징:**
- 정해진 입력 폼
- AI가 폼 데이터 처리
- 포맷된 결과 출력

**예시 프로그램:**
- 처방전 생성기
- 진단서 작성기
- 검사 결과 해석기

**UI 구조:**
```
┌──────────────────────────────────┐
│        입력 폼                     │
│  ┌────────────┐ ┌────────────┐   │
│  │ 환자명     │ │ 나이       │   │
│  └────────────┘ └────────────┘   │
│  ┌──────────────────────────┐    │
│  │ 증상                     │    │
│  └──────────────────────────┘    │
├──────────────────────────────────┤
│        [생성하기]                 │
├──────────────────────────────────┤
│        출력 결과                  │
│  (다운로드, 복사, 인쇄)           │
└──────────────────────────────────┘
```

### 3. Template Type (템플릿 기반)
**특징:**
- 미리 만든 템플릿 선택
- 세부 내용만 입력/수정
- 빠른 문서 생성

**예시 프로그램:**
- 수술 동의서 생성기
- 검사 설명서 생성기
- 환자 교육 자료

**UI 구조:**
```
┌──────────────────────────────────┐
│    템플릿 선택                    │
│  [템플릿1] [템플릿2] [템플릿3]    │
├──────────────────────────────────┤
│    템플릿 커스터마이징             │
│  (AI 대화로 내용 수정)            │
├──────────────────────────────────┤
│    최종 미리보기                  │
│  (다운로드, 복사, 인쇄)           │
└──────────────────────────────────┘
```

---

## 📅 단계별 작업 계획

### Step 1: 기반 인프라 구축 (2-3일) ✅ 완료

#### 1.1 DB 스키마 업데이트 ✅
- [x] programs 테이블에 `program_type`, `config` 필드 추가
- [x] Supabase 마이그레이션 작성 및 실행
- [x] TypeScript 타입 정의 업데이트 (ProgramType, ProgramConfig, FormField, ProgramTemplate)

#### 1.2 라우팅 구조 설계 ✅
- [x] `/programs/:id/run` 라우트 추가
- [x] 프로그램 타입별 동적 라우팅 설정
- [x] App.tsx 라우터 업데이트
- [x] ProgramRunner 페이지 생성

#### 1.3 공통 컴포넌트 개발 ✅
- [x] AI 채팅 컴포넌트 (`ChatInterface`, `ChatMessage`, `ChatInput`)
- [x] 아티팩트 미리보기 컴포넌트 (`ArtifactPreview`)
- [x] Chat 타입 정의 (`types.ts`)
- [x] ChatProgramRunner 통합 컴포넌트
- [ ] 동적 폼 생성기 (`DynamicForm`) - Step 3에서 구현
- [ ] 템플릿 선택기 (`TemplateSelector`) - Step 4에서 구현

**실제 작업량:** ~6시간
**완료일:** 2025-12-24

---

### Step 2: Chat Type 프로그램 구현 (3-4일) ✅ 완료

#### 2.1 핵심 컴포넌트 ✅
- [x] `ChatProgramRunner.tsx` - 메인 실행 컴포넌트
- [x] `ChatInterface.tsx` - 대화 UI (Step 1에서 완료)
- [x] `ArtifactPreview.tsx` - HTML/마크다운/코드 렌더링
- [x] 대화 히스토리 자동 관리

#### 2.2 AI 통합 ✅
- [x] AI Service 추상화 레이어 (`IAIService`)
- [x] OpenAI Streaming API 통합
- [x] 아티팩트 파싱 로직 (`artifactParser.ts`)
- [x] 대화 컨텍스트 관리 (메시지 히스토리)
- [x] 에러 핸들링 및 Toast 알림
- [x] 스트리밍 중단 기능

#### 2.3 샘플 프로그램: 환자 안내문 생성기 ✅
- [x] 시스템 프롬프트 작성 (HTML 아티팩트 생성 포함)
- [x] 프로그램 설정 및 DB 시드 (`seed_sample_programs.sql`)
- [x] 진료 기록 요약기, 의학 논문 도우미 샘플도 추가
- [x] .env.example 파일 추가

**실제 작업량:** ~4시간
**완료일:** 2025-12-24

**구현된 파일:**
- `src/services/ai/types.ts` - AI 서비스 타입 정의
- `src/services/ai/artifactParser.ts` - 아티팩트 파싱 유틸리티
- `src/services/ai/openai.ts` - OpenAI API 구현
- `src/services/ai/factory.ts` - AI Service 팩토리
- `supabase/seed_sample_programs.sql` - 샘플 프로그램 3개
- `.env.example` - 환경변수 예제

---

### Step 3: Form Type 프로그램 구현 (2-3일) ✅ 완료

#### 3.1 핵심 컴포넌트 ✅
- [x] `FormProgramRunner.tsx` - 메인 실행 컴포넌트
- [x] `DynamicFormBuilder.tsx` - react-hook-form 기반 동적 폼 생성
- [x] `FormOutputRenderer.tsx` - 결과 표시 및 다운로드/인쇄
- [x] 입력 검증 (react-hook-form 통합)

#### 3.2 폼 스키마 구현 ✅
**지원하는 필드 타입:**
- text, textarea, number, select, date, checkbox
- 필수/선택 검증
- 최소/최대값, 패턴 검증
- placeholder, options 지원

**FormField 인터페이스** (src/lib/supabase.ts에 정의됨)
```typescript
interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}
```

#### 3.3 샘플 프로그램 ✅
- [x] **진단서 작성기** - 9개 필드 (환자정보, 진단내용, 치료계획)
- [x] **처방전 생성기** - 5개 필드 (환자정보, 처방약물, 투약기간)
- [x] 입력 폼 스키마 JSONB로 DB 저장
- [x] 출력 템플릿 및 시스템 프롬프트 작성

**실제 작업량:** ~2.5시간
**완료일:** 2025-12-24

**구현된 파일:**
- `src/components/forms/DynamicFormBuilder.tsx` - 동적 폼 생성기
- `src/components/forms/FormOutputRenderer.tsx` - 결과 렌더러
- `src/components/programs/FormProgramRunner.tsx` - Form 실행기
- Updated `supabase/seed_sample_programs.sql` - 진단서/처방전 샘플

---

### Step 4: Template Type 프로그램 구현 (2-3일) ✅ 완료

#### 4.1 핵심 컴포넌트 ✅
- [x] `TemplateProgramRunner.tsx` - 메인 실행 컴포넌트
- [x] `TemplateSelector.tsx` - 템플릿 선택 UI (TemplateGallery 대신)
- [x] `TemplateEditor.tsx` - 템플릿 수정 (AI 채팅 통합)
- [x] 최종 미리보기 (FormOutputRenderer 재사용)

#### 4.2 템플릿 시스템 ✅
- [x] 템플릿 저장 구조 설계 (JSONB에 templates 배열)
- [x] 템플릿 변수 표시 (대괄호 표기법)
- [x] AI 기반 템플릿 커스터마이징 (Split-view 에디터)
- [x] 3단계 워크플로우 (select → edit → result)

#### 4.3 샘플 프로그램: 수술 동의서 생성기 ✅
- [x] 3개 기본 템플릿 제작 (일반수술, 복강경, 마취)
- [x] 변수 및 섹션 정의 (각 템플릿별 variables 배열)
- [x] AI 수정 프롬프트 작성 (시스템 프롬프트)
- [x] ProgramRunner 통합

**실제 작업량:** ~2시간
**완료일:** 2025-12-24

**구현된 파일:**
- `src/components/templates/TemplateSelector.tsx` - 템플릿 갤러리
- `src/components/templates/TemplateEditor.tsx` - Split-view 에디터
- `src/components/programs/TemplateProgramRunner.tsx` - Template 실행기
- Updated `supabase/migrations/seed_sample_programs.sql` - 수술 동의서 샘플

---

### Step 5: 통합 및 최적화 (1-2일) ✅ 완료

#### 5.1 프로그램 실행 페이지 통합 ✅
- [x] 타입별 컴포넌트 동적 로딩 (ProgramRunner에서 program_type 기반 라우팅)
- [x] 프로그램 메타데이터 표시 (헤더에 title, category, program_type 표시)
- [x] 사용 통계 트래킹 (useIncrementProgramUsage 훅 + RPC 함수)
- [x] 프로그램 실행 버튼 연결 (Programs → ProgramRunner)

#### 5.2 UX 개선 ✅
- [x] 로딩 상태 처리 (스피너 + 안내 메시지)
- [x] 에러 바운더리 (ErrorBoundary 컴포넌트 + 친절한 에러 UI)
- [x] 응답성 개선 (모바일) - TemplateEditor 수직 배치, 각 섹션 50vh

#### 5.3 성능 최적화 ✅
- [x] 메모이제이션 (ChatMessage, ProgramCard - React.memo)
- [x] 콜백 메모이제이션 (Programs.tsx - useCallback)
- [x] 필터링 최적화 (useMemo로 filteredPrograms, categories)

**실제 작업량:** ~1.5시간
**완료일:** 2025-12-24

**구현된 파일:**
- `src/components/ErrorBoundary.tsx` - 에러 바운더리 컴포넌트
- Updated `src/pages/ProgramRunner.tsx` - 사용 통계 트래킹
- Updated `src/hooks/usePrograms.ts` - useIncrementProgramUsage 훅
- `supabase/migrations/20251224000002_add_increment_program_usage_function.sql` - RPC 함수
- Updated `src/App.tsx` - ErrorBoundary 적용
- Updated `src/components/chat/ChatMessage.tsx` - React.memo
- Updated `src/components/dashboard/ProgramCard.tsx` - React.memo
- Updated `src/components/templates/TemplateEditor.tsx` - 모바일 반응형
- Updated `src/pages/Programs.tsx` - useCallback

---

### Step 6: 추가 샘플 프로그램 제작 (2-3일)

각 프로그램당 4-8시간 예상

- [ ] **의학 논문 작성 도우미** (Chat Type)
- [ ] **처방전 생성기** (Form Type)
- [ ] **검사 설명서 생성기** (Template Type)
- [ ] **진료 기록 요약기** (Chat Type)

**예상 작업량:** 16-24시간

---

## 📊 전체 타임라인

| 단계 | 작업 내용 | 예상 기간 | 실제 기간 | 우선순위 | 상태 |
|-----|----------|----------|----------|---------|------|
| Step 1 | 기반 인프라 | 2-3일 | ~6시간 | 🔴 High | ✅ |
| Step 2 | Chat Type | 3-4일 | ~4시간 | 🔴 High | ✅ |
| Step 3 | Form Type | 2-3일 | ~2.5시간 | 🟡 Medium | ✅ |
| Step 4 | Template Type | 2-3일 | ~2시간 | 🟡 Medium | ✅ |
| Step 5 | 통합 & 최적화 | 1-2일 | ~1.5시간 | 🔴 High | ✅ |
| Step 6 | 추가 프로그램 | 2-3일 | - | 🟢 Low | ⏸️ |

**총 예상 기간:** 12-18일 (실제 작업 시간 기준)
**실제 소요 시간:** ~16시간 (Steps 1-5 완료)

---

## 🎯 MVP 범위 결정

### 최소 기능 (2주 내 완성) ✅ 완료!
- ✅ Step 1: 인프라
- ✅ Step 2: Chat Type + 샘플 3개 (환자 안내문, 진료 기록 요약, 의학 논문 도우미)
- ✅ Step 3: Form Type + 샘플 2개 (진단서, 처방전)
- ✅ Step 4: Template Type + 샘플 1개 (수술 동의서 - 템플릿 3개)
- ✅ Step 5: 통합 및 최적화 (모든 타입)

**MVP 완성일:** 2025-12-24
**총 소요 시간:** ~16시간
**샘플 프로그램 수:** 6개 (총 12개 프로그램 타입 인스턴스)

### 확장 기능 (이후)
- [ ] Step 6: 추가 프로그램 3-4개
- [ ] 프로그램 요청 시스템
- [ ] 리워드 시스템
- [ ] 프로그램 마켓플레이스

---

## 🔧 기술 스택 추가 필요 사항

### AI Streaming
```bash
npm install ai eventsource-parser
```

### 마크다운/HTML 렌더링
```bash
npm install react-markdown rehype-sanitize
npm install @uiw/react-md-editor
```

### 폼 빌더
```bash
npm install react-hook-form zod @hookform/resolvers
```

### 코드 하이라이팅
```bash
npm install prismjs react-syntax-highlighter
```

---

## 📝 다음 액션

### 즉시 시작 (Step 1)
1. DB 스키마 업데이트 마이그레이션 작성
2. TypeScript 타입 정의 업데이트
3. 라우터 구조 설계

### 의사결정 필요
- [ ] MVP 범위 최종 확정 (2주 vs 4주)
- [ ] 첫 샘플 프로그램 선택 (환자 안내문 생성기?)
- [ ] AI Provider 선택 (OpenAI? Claude? 둘 다?)
- [ ] 아티팩트 렌더링 방식 (iframe? Shadow DOM?)

---

## 💡 참고 사항

### Claude Artifacts 참고
- Claude.ai의 아티팩트 시스템 벤치마킹
- 실시간 렌더링 및 코드 실행
- 안전한 샌드박스 환경

### 유사 서비스
- Cursor AI (코딩 어시스턴트)
- v0.dev (UI 생성)
- ChatGPT Code Interpreter

### 보안 고려사항
- XSS 방지 (HTML 렌더링 시)
- 사용자 입력 검증
- API 키 관리
- Rate Limiting

---

## 🎉 프로젝트 상태 요약

**MVP 단계 완료!** Steps 1-5가 모두 성공적으로 구현되었습니다.

### 구현된 기능
- ✅ 3가지 프로그램 타입 (Chat, Form, Template)
- ✅ 6개 샘플 프로그램 (실제 의료 업무용)
- ✅ AI 스트리밍 통합 (OpenAI)
- ✅ 아티팩트 시스템 (HTML 실시간 렌더링)
- ✅ 동적 폼 생성 및 검증
- ✅ 템플릿 에디터 (Split-view + AI 수정)
- ✅ 사용 통계 트래킹
- ✅ 에러 바운더리
- ✅ 모바일 반응형
- ✅ 성능 최적화 (메모이제이션)

### 다음 단계
- [ ] Step 6: 추가 프로그램 개발 (선택사항)
- ✅ **Claude API, Gemini API 통합 (2025-12-24 완료)**
- [ ] 프로그램 요청 시스템
- [ ] 리워드 및 마켓플레이스

### AI Provider 통합 (추가 완료)
- ✅ OpenAI (GPT-4, GPT-4o) - 스트리밍 지원
- ✅ Anthropic Claude (Claude 3.5 Sonnet, Opus) - 스트리밍 지원
- ✅ Google Gemini (Gemini Pro, Ultra) - 스트리밍 지원
- ✅ Factory Pattern으로 Provider 추상화
- ✅ API 키 환경 변수 관리
- ✅ 에러 핸들링 및 AbortController

**추가 구현 파일:**
- `src/services/ai/claude.ts` - Claude API 구현
- `src/services/ai/gemini.ts` - Gemini API 구현
- Updated `src/services/ai/factory.ts` - 3개 Provider 지원
- `docs/AI_PROVIDERS_INTEGRATION.md` - 통합 가이드

---

**작성일:** 2025-12-24
**최종 수정일:** 2025-12-24 (MVP 완료)
**작성자:** AI Assistant
**검토자:** -
