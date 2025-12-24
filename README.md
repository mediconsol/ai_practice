# 메디콘솔 AI 프랙티스 플랫폼

> 의료 전문가를 위한 AI 활용 구현 플랫폼

---

## 📋 프로젝트 정보

**서비스명**: 메디콘솔 AI 프랙티스
**웹사이트**: [mediconsol.co.kr](https://mediconsol.co.kr)
**운영사**: 메디콘솔 (병원경영솔루션)
**문의**: admin@mediconsol.com

---

## 🎯 프로젝트 개요

메디콘솔 AI 프랙티스는 의료인이 자신의 업무에 맞는 AI 활용 방식을 직접 만들고 실행하는 플랫폼입니다.

### 핵심 기능

- **AI 프로그램 관리**: 문서 요약, 환자 안내문, 교육 자료 등 8개 카테고리
- **프롬프트 자산화**: 프롬프트 생성, 저장, 재사용, 가져오기/내보내기
- **AI 실행 환경**: OpenAI, Google Gemini, Anthropic Claude 통합
- **실행 히스토리**: 모든 AI 실행 기록 저장 및 관리
- **프로젝트 관리**: 프롬프트를 묶어서 프로젝트 단위로 관리

---

## 🛠️ 기술 스택

### 프론트엔드
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **React Router v6** - 클라이언트 라우팅
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트 라이브러리
- **React Query** - 서버 상태 관리

### 백엔드
- **Supabase** - BaaS 플랫폼
- **PostgreSQL 15** - 데이터베이스
- **Edge Functions** - 서버리스 함수 (Deno)
- **Row Level Security** - 데이터 보안

### AI 통합
- **OpenAI API** - GPT-4o-mini
- **Google Gemini API** - Gemini Pro
- **Anthropic API** - Claude 3.5 Sonnet

---

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+ 및 npm
- Supabase 계정
- AI API 키 (OpenAI, Gemini, Claude 중 하나 이상)

### 설치

```bash
# 저장소 클론
git clone https://github.com/mediconsol/ai_practice.git
cd ai_practice

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 Supabase URL과 API 키 입력

# 개발 서버 실행
npm run dev
```

개발 서버가 **http://localhost:7800** 에서 실행됩니다.

---

## 📂 프로젝트 구조

```
mediconsol_ai_practice/
├── src/
│   ├── components/        # React 컴포넌트
│   │   ├── layout/       # 레이아웃 컴포넌트
│   │   ├── dashboard/    # 대시보드 컴포넌트
│   │   └── ui/           # shadcn/ui 컴포넌트
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── Dashboard.tsx
│   │   ├── Programs.tsx
│   │   ├── Prompts.tsx
│   │   ├── AIExecute.tsx
│   │   ├── Projects.tsx
│   │   └── History.tsx
│   ├── hooks/            # React 커스텀 훅
│   │   ├── useExecuteAI.ts
│   │   └── usePrompts.ts
│   ├── data/             # 데이터 정의
│   ├── lib/              # 유틸리티 및 설정
│   └── App.tsx
├── supabase/
│   ├── functions/        # Edge Functions
│   │   ├── execute-ai/
│   │   ├── export-prompts/
│   │   └── import-prompts/
│   ├── config.toml       # Supabase 설정
│   └── *.sql             # SQL 스크립트
├── docs/                 # 문서
│   ├── IMPLEMENTATION_REVIEW.md
│   ├── TODO_ROADMAP.md
│   ├── SUPABASE_SETUP.md
│   └── ...
└── package.json
```

---

## 📖 주요 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 대시보드 | `/` | 빠른 실행, 통계, 최근 프롬프트 |
| AI 프로그램 | `/programs` | 8개 AI 프로그램 카테고리 |
| 프롬프트 자산 | `/prompts` | 프롬프트 라이브러리 관리 |
| AI 실행 | `/ai-execute` | 프롬프트 실행 및 결과 확인 |
| 내 프로젝트 | `/projects` | 프로젝트 단위 관리 |
| 실행 히스토리 | `/history` | AI 실행 기록 조회 |

---

## 🔧 개발 명령어

```bash
# 개발 서버 실행 (포트 7800)
npm run dev

# 프로덕션 빌드
npm run build

# 개발 모드 빌드
npm run build:dev

# 린트 검사
npm run lint

# 빌드 미리보기
npm run preview
```

---

## 🗄️ 데이터베이스

### 테이블 구조
- `profiles` - 사용자 프로필
- `programs` - AI 프로그램
- `prompts` - 프롬프트 자산
- `projects` - 프로젝트
- `project_prompts` - 프로젝트-프롬프트 연결
- `execution_history` - AI 실행 기록

### 스키마 설정
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref <YOUR_PROJECT_ID>

# 스키마 검증
# Supabase Dashboard > SQL Editor에서 supabase/quick-check.sql 실행
```

상세한 설정 방법은 `docs/SUPABASE_SETUP.md` 참조

---

## 🔐 환경 변수

`.env.local` 파일에 다음 변수를 설정하세요:

```env
# Supabase 설정
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 개발 모드
VITE_DEV_MODE=true
VITE_API_TIMEOUT=30000
```

**주의**: `.env.local` 파일은 절대 Git에 커밋하지 마세요.

---

## 📚 문서

상세한 문서는 `docs/` 폴더를 참조하세요:

- [구현 현황 리뷰](./docs/IMPLEMENTATION_REVIEW.md) - 전체 진행 상황
- [개발 로드맵](./docs/TODO_ROADMAP.md) - 향후 개발 계획
- [빠른 체크리스트](./docs/QUICK_CHECKLIST.md) - 즉시 할 일
- [Supabase 설정](./docs/SUPABASE_SETUP.md) - 백엔드 설정 가이드
- [프론트엔드 연동](./docs/FRONTEND_INTEGRATION.md) - 프론트-백 연동
- [배포 성공 가이드](./docs/DEPLOYMENT_SUCCESS.md) - Edge Functions 배포

---

## 🎯 개발 현황

**현재 진행률**: 60%

✅ **완료** (Phase 1-2):
- 프론트엔드 UI 6개 페이지
- Supabase 백엔드 인프라
- 3개 Edge Functions 배포
- AI 통합 (OpenAI, Gemini)

🔄 **진행중** (Phase 3):
- 인증 시스템 구현
- DB 연동 완료

⏳ **예정** (Phase 4-6):
- 프롬프트 마법사
- 프로그램/프로젝트 고도화
- 프로덕션 배포

상세한 로드맵은 [TODO_ROADMAP.md](./docs/TODO_ROADMAP.md) 참조

---

## 🤝 기여

이 프로젝트는 메디콘솔 내부 프로젝트입니다.

---

## 📞 문의

**운영사**: 메디콘솔
**웹사이트**: https://mediconsol.co.kr
**이메일**: admin@mediconsol.com
**서비스**: 병원경영솔루션

---

## 📄 라이선스

Copyright © 2025 메디콘솔(MediConsol). All rights reserved.

---

**Built with ❤️ by MediConsol Team**
