# 설정(Settings) 화면 구현 계획

## 프로젝트 개요
메디콘솔 AI 프랙티스 플랫폼에 사용자 설정 화면을 추가하여 프로필, AI 설정, 계정 관리 등을 할 수 있도록 구현합니다.

## 현재 상태 분석

### 발견된 문제
- `AppSidebar.tsx:48`에 "설정" 메뉴(`/settings`)가 정의되어 있지만 실제 페이지 미구현
- `App.tsx`에 `/settings` 라우트 누락
- API 키가 환경 변수로만 관리되고 있음 (사용자별 관리 불가)

### 현재 시스템 구조
- **인증**: Supabase Auth 사용
- **AI 프로바이더**: OpenAI, Claude, Gemini 지원 (factory.ts)
- **사용자 프로필 테이블 구조** (src/lib/supabase.ts:77-90):
  - id, email, full_name, hospital, department, subscription_tier
  - created_at, updated_at

## 설정 화면 구성

### 1. 프로필 설정 (Profile Settings)
**목적**: 사용자의 기본 정보 관리

**포함 항목**:
- 이름 (full_name)
- 소속 병원 (hospital)
- 진료과/부서 (department)
- 구독 플랜 정보 (subscription_tier) - 읽기 전용

**구현 방식**:
- React Hook Form + Zod validation
- Supabase `profiles` 테이블 업데이트
- 실시간 저장 (자동 저장 또는 저장 버튼)

### 2. AI 설정 (AI Preferences)
**목적**: AI 실행 시 기본값 설정

**포함 항목**:
- 기본 AI 프로바이더 선택 (OpenAI/Claude/Gemini)
- 기본 모델 선택
  - OpenAI: gpt-4o, gpt-4o-mini 등
  - Claude: claude-3-5-sonnet-20241022 등
  - Gemini: gemini-pro 등
- Temperature 기본값 (0.0 - 1.0)
- Max Tokens 기본값

**구현 방식**:
- `profiles` 테이블에 `preferences` jsonb 컬럼 추가 (migration 필요)
- 또는 별도의 `user_preferences` 테이블 생성

**데이터 구조**:
```typescript
interface AIPreferences {
  default_provider: 'openai' | 'claude' | 'gemini';
  default_models: {
    openai?: string;
    claude?: string;
    gemini?: string;
  };
  default_temperature: number;
  default_max_tokens?: number;
}
```

### 3. 인터페이스 설정 (Interface Settings)
**목적**: UI/UX 개인화

**포함 항목**:
- 테마 (라이트/다크 모드) - 향후 구현
- 기본 뷰 모드 (그리드/리스트)
- 언어 설정 (현재는 한국어만, 향후 확장)

**구현 방식**:
- localStorage 또는 preferences 저장
- Context API로 전역 상태 관리

### 4. 계정 관리 (Account Management)
**목적**: 계정 보안 및 관리

**포함 항목**:
- 이메일 주소 (읽기 전용)
- 비밀번호 변경
- 계정 탈퇴

**구현 방식**:
- Supabase Auth API 사용
- `supabase.auth.updateUser()` - 비밀번호 변경
- `supabase.auth.signOut()` + 계정 삭제 로직

### 5. 데이터 관리 (Data Management)
**목적**: 사용자 데이터 관리

**포함 항목**:
- 전체 실행 히스토리 삭제
- 저장된 프롬프트 일괄 삭제
- 저장된 실행 결과 일괄 삭제
- 데이터 내보내기 (JSON 형식)
- 저장 공간 사용량 표시

**구현 방식**:
- Supabase RPC 함수로 일괄 삭제
- 데이터 내보내기: JSON.stringify() + Blob 다운로드

## 구현 단계

### Phase 1: 기본 구조 및 프로필 설정 ✅
1. ✅ Settings 페이지 컴포넌트 생성 (`src/pages/Settings.tsx`)
2. ✅ App.tsx에 라우트 추가
3. ✅ 프로필 설정 섹션 구현
   - 이름, 병원, 진료과 수정 폼
   - Supabase profiles 테이블 연동

### Phase 2: AI 설정 및 데이터베이스 확장
4. Supabase Migration 생성
   - `profiles` 테이블에 `preferences` jsonb 컬럼 추가
   ```sql
   ALTER TABLE profiles ADD COLUMN preferences jsonb DEFAULT '{}';
   ```
5. AI 설정 섹션 구현
   - 기본 프로바이더, 모델, temperature 설정
   - preferences 저장 및 불러오기

### Phase 3: 계정 관리
6. 비밀번호 변경 기능 구현
   - Supabase Auth updateUser 활용
7. 계정 탈퇴 기능 구현
   - 확인 다이얼로그
   - 관련 데이터 삭제 처리

### Phase 4: 데이터 관리
8. 데이터 관리 섹션 구현
   - 실행 히스토리 삭제
   - 프롬프트 일괄 삭제
   - 결과 일괄 삭제
9. 데이터 내보내기 기능
   - JSON 형식으로 다운로드

### Phase 5: UI/UX 개선
10. 인터페이스 설정 섹션
11. 저장 상태 피드백 (Toast 알림)
12. 로딩 상태 처리
13. 에러 핸들링

## 기술 스택

### 사용할 라이브러리
- **폼 관리**: React Hook Form + Zod
- **UI 컴포넌트**: shadcn/ui
  - Tabs (섹션 구분)
  - Card (각 설정 그룹)
  - Form, Input, Select, Switch
  - AlertDialog (확인 다이얼로그)
  - Button
- **데이터베이스**: Supabase
- **상태 관리**: React Query (@tanstack/react-query)

### 파일 구조
```
src/
├── pages/
│   └── Settings.tsx              # 메인 설정 페이지
├── components/
│   └── settings/
│       ├── ProfileSection.tsx    # 프로필 설정
│       ├── AIPreferencesSection.tsx  # AI 설정
│       ├── AccountSection.tsx    # 계정 관리
│       ├── DataSection.tsx       # 데이터 관리
│       └── InterfaceSection.tsx  # 인터페이스 설정
├── hooks/
│   ├── useUserProfile.ts         # 프로필 CRUD
│   └── useUserPreferences.ts     # 환경설정 CRUD
└── types/
    └── settings.ts               # 설정 관련 타입
```

## 데이터베이스 변경사항

### Migration: Add preferences column
```sql
-- 20251225_add_user_preferences.sql

-- profiles 테이블에 preferences 컬럼 추가
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{
  "ai": {
    "default_provider": "openai",
    "default_models": {
      "openai": "gpt-4o",
      "claude": "claude-3-5-sonnet-20241022",
      "gemini": "gemini-pro"
    },
    "default_temperature": 0.7
  },
  "interface": {
    "default_view_mode": "grid"
  }
}'::jsonb;

-- preferences 컬럼 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_profiles_preferences ON profiles USING gin(preferences);
```

## UI/UX 디자인 가이드

### 레이아웃
- Tabs 컴포넌트로 섹션 구분
  - "프로필", "AI 설정", "계정", "데이터 관리"
- 각 섹션은 Card 컴포넌트로 그룹화
- 2-column 레이아웃 (라벨 | 입력 필드)

### 색상 및 스타일
- 프로젝트 기본 테마 유지 (Teal-blue gradient)
- 위험한 작업(삭제, 탈퇴)은 destructive 버튼 사용
- 저장 성공 시 초록색 Toast, 에러 시 빨간색 Toast

### 반응형
- 모바일: 1-column 레이아웃
- 태블릿/데스크톱: 2-column 레이아웃

## 보안 고려사항

1. **비밀번호 변경**: 현재 비밀번호 확인 필수
2. **계정 탈퇴**: 최종 확인 다이얼로그 2단계
3. **데이터 삭제**: 되돌릴 수 없음 경고 표시
4. **API 키**: 현재는 환경 변수 사용, 향후 암호화 저장 고려

## 예상 소요 시간

- Phase 1 (기본 구조 + 프로필): 2시간
- Phase 2 (AI 설정 + DB): 2시간
- Phase 3 (계정 관리): 1.5시간
- Phase 4 (데이터 관리): 1.5시간
- Phase 5 (UI/UX 개선): 1시간

**총 예상 시간**: 8시간

## 성공 기준

- [ ] 사용자가 프로필 정보를 수정하고 저장할 수 있다
- [ ] 기본 AI 설정을 변경하고 AI 실행 시 반영된다
- [ ] 비밀번호를 안전하게 변경할 수 있다
- [ ] 데이터를 일괄 삭제할 수 있다
- [ ] 데이터를 JSON으로 내보낼 수 있다
- [ ] 모든 작업에 대해 적절한 피드백이 제공된다
- [ ] 모바일/데스크톱 모두에서 잘 작동한다

## 다음 단계

1. Phase 1 구현 시작
2. 각 Phase 완료 후 테스트
3. 사용자 피드백 수집
4. 필요시 기능 추가/수정
