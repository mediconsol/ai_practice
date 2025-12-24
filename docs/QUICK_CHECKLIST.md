# 빠른 체크리스트

> **현재 Phase**: 3 (인증 + DB 연동)
> **다음 작업**: 스키마 검증 → 인증 구현
> **최종 업데이트**: 2025-12-24

---

## ⚡ 지금 당장 해야 할 일 (이번 주)

### 🔥 우선순위 1: 스키마 검증 (10분)

```bash
# Supabase Dashboard 접속
# https://app.supabase.com/project/jkhpwsbogsgkqrspublx

# SQL Editor에서 실행:
```

**파일**: `supabase/quick-check.sql` 복사 → SQL Editor에 붙여넣기 → Run

**기대 결과**:
```
✅ tables: 6/6
✅ rls_enabled: 6/6
✅ rls_policies: 7/7
✅ indexes: 8/8
✅ triggers: 5/5
✅ functions: 2/2
```

---

### 🔥 우선순위 2: AI 실행 테스트 (5분)

```bash
npm run dev
```

1. http://localhost:8080/ai-execute 접속
2. 프롬프트 입력: "당뇨병 환자를 위한 식이요법 안내문을 작성해주세요"
3. AI 제공자: ChatGPT 선택
4. 실행 버튼 클릭
5. 결과 확인

**확인 사항**:
- [ ] AI 응답 표시됨
- [ ] 실행 시간 표시됨
- [ ] 토큰 사용량 표시됨

**Supabase Dashboard에서 확인**:
- Table Editor > `execution_history` 테이블에 데이터 추가되었는지 확인

---

### 🔥 우선순위 3: Claude API 키 설정 (선택, 3분)

```bash
# Claude API 키가 있다면:
supabase secrets set CLAUDE_API_KEY=sk-ant-...

# 확인:
supabase secrets list
```

---

## 📋 이번 주 할 일 (Week 3)

### Day 1-2: 인증 UI (예상 13시간)

- [ ] **Task 3.1**: 로그인 페이지 (`src/pages/Login.tsx`) - 4시간
  - [ ] 이메일/비밀번호 폼
  - [ ] 로그인 로직 (`supabase.auth.signInWithPassword`)
  - [ ] 에러 처리
  - [ ] 라우트 추가 (`/login`)

- [ ] **Task 3.2**: 회원가입 페이지 (`src/pages/Signup.tsx`) - 4시간
  - [ ] 회원가입 폼
  - [ ] 이메일 인증 안내
  - [ ] 라우트 추가 (`/signup`)

- [ ] **Task 3.3**: Protected Routes (`src/components/auth/ProtectedRoute.tsx`) - 2시간
  - [ ] 세션 확인 컴포넌트
  - [ ] `App.tsx`에 적용

- [ ] **Task 3.4**: 사용자 프로필 (`src/components/layout/UserProfile.tsx`) - 3시간
  - [ ] 사이드바에 사용자 정보 표시
  - [ ] 드롭다운 메뉴 (프로필/설정/로그아웃)

### Day 3-4: DB 연동 (예상 10시간)

- [ ] **Task 3.5**: `src/hooks/usePrograms.ts` - 2시간
  - [ ] usePrograms, useCreateProgram, useUpdateProgram, useDeleteProgram

- [ ] **Task 3.6**: `src/hooks/useProjects.ts` - 2시간
  - [ ] useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject
  - [ ] useAddPromptToProject, useRemovePromptFromProject

- [ ] **Task 3.7**: `src/hooks/useHistory.ts` - 2시간
  - [ ] useHistory (with filters), useHistoryItem, useDeleteHistory

- [ ] **Task 3.8**: 페이지 DB 연동 - 4시간
  - [ ] `Programs.tsx`: mock data → usePrograms hook
  - [ ] `Projects.tsx`: mock data → useProjects hook
  - [ ] `History.tsx`: mock data → useHistory hook

### Day 5: JWT 활성화 및 테스트 (예상 3시간)

- [ ] **Task 3.9**: Edge Functions JWT 활성화 - 1시간
  ```bash
  # --no-verify-jwt 플래그 제거하고 재배포
  supabase functions deploy execute-ai
  supabase functions deploy export-prompts
  supabase functions deploy import-prompts
  ```

- [ ] **Task 3.10**: 통합 테스트 - 2시간
  - [ ] 회원가입 → 이메일 인증
  - [ ] 로그인 → Dashboard
  - [ ] 프롬프트 CRUD
  - [ ] AI 실행
  - [ ] 로그아웃

---

## 📅 다음 주 할 일 (Week 4)

### 프롬프트 마법사 구현

- [ ] 질문 플로우 설계 (`src/data/promptWizard.ts`)
- [ ] 프롬프트 생성 엔진 (`src/lib/promptGenerator.ts`)
- [ ] 마법사 UI (`src/pages/PromptWizard.tsx`)
- [ ] 테스트 및 최적화

---

## 🐛 현재 알려진 이슈

### 해결 필요
1. **Claude API 키 미설정** - Claude 모델 사용 불가 (해결: API 키 발급 후 설정)
2. **Mock 데이터 혼재** - Programs/Projects/History 페이지 (해결: Week 3 Day 3-4)
3. **JWT 검증 비활성화** - 보안 위험 (해결: Week 3 Day 5)

### 확인 필요
1. **스키마 검증 미완료** - DB 마이그레이션 성공 여부 불명 (해결: 우선순위 1)

---

## ✅ 완료 체크리스트

### Phase 1-2 (완료)
- [x] 6개 페이지 UI 구현
- [x] Supabase 프로젝트 설정
- [x] 3개 Edge Functions 배포
- [x] AI 통합 (OpenAI, Gemini)
- [x] React Query 훅 (`useExecuteAI`, `usePrompts`)
- [x] 문서화 (6개 가이드)

### Phase 3 (진행중 - 40%)
- [x] DB 스키마 완료
- [x] RLS 정책 완료
- [ ] 인증 UI (0%)
- [ ] DB 연동 완료 (20% - AIExecute만 완료)
- [ ] JWT 활성화 (0%)

---

## 🎯 주간 목표

### Week 3 (현재)
**완료 조건**:
✅ 로그인/회원가입 페이지 작동
✅ 모든 페이지 실제 DB 데이터 표시
✅ Edge Functions JWT 검증 활성화
✅ 통합 테스트 통과

**데모 시나리오**:
1. 회원가입 → 로그인
2. 프롬프트 생성
3. AI 실행
4. 히스토리 확인
5. 로그아웃

---

## 📞 빠른 명령어

### 개발
```bash
# 로컬 개발 서버
npm run dev

# 빌드 테스트
npm run build
```

### Supabase
```bash
# Edge Functions 상태 확인
supabase functions list

# API Secrets 확인
supabase secrets list

# 로그 확인
supabase functions logs execute-ai --follow
```

### Git
```bash
# 현재 작업 커밋
git add .
git commit -m "feat: 인증 UI 구현"
git push
```

---

## 📚 참고 문서

**전체 로드맵**: [TODO_ROADMAP.md](./TODO_ROADMAP.md)
**구현 현황**: [IMPLEMENTATION_REVIEW.md](./IMPLEMENTATION_REVIEW.md)
**백엔드 가이드**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
**프론트 연동**: [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)

---

## 💡 팁

1. **하루 시작**: `npm run dev` → AI 실행 테스트로 모든 시스템 정상 확인
2. **코드 작성 전**: 관련 문서 먼저 읽기
3. **막힐 때**: Supabase Dashboard > Logs 확인
4. **배포 전**: 반드시 로컬 빌드 성공 확인 (`npm run build`)
5. **하루 마무리**: 진행 상황을 이 문서에 체크

---

**다음**: [TODO_ROADMAP.md](./TODO_ROADMAP.md)에서 상세 가이드 확인
