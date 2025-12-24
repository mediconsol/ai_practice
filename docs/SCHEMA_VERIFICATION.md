# 데이터베이스 스키마 검증 가이드

마이그레이션이 제대로 적용되었는지 확인하는 방법입니다.

## 🚀 빠른 확인 (30초)

### 1. Supabase Dashboard 접속

https://app.supabase.com/project/jkhpwsbogsgkqrspublx

### 2. SQL Editor 열기

왼쪽 메뉴 > **SQL Editor** 클릭

### 3. 빠른 체크 쿼리 실행

**New query** 클릭 후 아래 파일 내용 복사:

```bash
# 프로젝트 루트에서
cat supabase/quick-check.sql
```

또는 직접 파일 열기: `supabase/quick-check.sql`

### 4. Run 버튼 클릭

### 5. 결과 확인

**예상 결과:**

| 항목 | 현재값 | 예상값 | 상태 |
|------|--------|--------|------|
| tables | 6 | 6 | ✅ |
| rls_enabled | 6 | 6 | ✅ |
| rls_policies | 7+ | 7 | ✅ |
| indexes | 8+ | 8 | ✅ |
| triggers | 5+ | 5 | ✅ |
| functions | 2 | 2 | ✅ |

**✅ 모두 체크 = 완벽!** 다음 단계로 진행하세요.

---

## 🔍 상세 확인 (5분)

더 자세히 확인하려면:

```bash
cat supabase/verify-schema.sql
```

이 파일은 10개 섹션으로 나뉘어 있습니다:
1. 테이블 존재 확인
2. 테이블별 컬럼 확인
3. 인덱스 확인
4. RLS 활성화 확인
5. RLS 정책 확인
6. 트리거 확인
7. 함수 확인
8. 외래 키 제약 조건 확인
9. 데이터 삽입 테스트 (선택)
10. 전체 요약

**사용 방법:**
- 전체를 한 번에 실행하거나
- 섹션별로 나눠서 실행

---

## ❌ 문제 해결

### 테이블이 없는 경우

**증상:**
```
tables: 0/6 ❌
```

**해결:**

1. **올바른 프로젝트인지 확인**
   ```bash
   supabase projects list
   # jkhpwsbogsgkqrspublx가 맞는지 확인
   ```

2. **마이그레이션 재실행**

   **방법 1: SQL Editor 사용 (추천)**
   - Supabase Dashboard > SQL Editor
   - `docs/SUPABASE_SETUP.md`의 SQL 전체 복사
   - 붙여넣기 후 Run

   **방법 2: CLI 사용**
   ```bash
   # 마이그레이션 파일 생성
   supabase migration new initial_schema

   # docs/SUPABASE_SETUP.md의 SQL을 복사하여
   # supabase/migrations/XXXXXX_initial_schema.sql에 붙여넣기

   # 적용
   supabase db push
   ```

### RLS 정책이 없는 경우

**증상:**
```
rls_policies: 0/7 ❌
```

**해결:**

RLS 정책만 재생성:

```sql
-- Supabase SQL Editor에서 실행

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own programs" ON programs;
DROP POLICY IF EXISTS "Users can view public programs" ON programs;
DROP POLICY IF EXISTS "Users can manage own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;
DROP POLICY IF EXISTS "Users can manage own project_prompts" ON project_prompts;
DROP POLICY IF EXISTS "Users can manage own history" ON execution_history;

-- 정책 재생성 (docs/SUPABASE_SETUP.md의 RLS 정책 섹션 복사)
-- CREATE POLICY ... 부분만 실행
```

### 트리거가 없는 경우

**증상:**
```
triggers: 0/5 ❌
```

**해결:**

```sql
-- 함수 재생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 재생성
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

-- 회원가입 트리거
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

---

## 📊 테이블별 수동 확인

### 방법 1: Table Editor 사용

1. Supabase Dashboard > **Table Editor**
2. 왼쪽에서 각 테이블 확인:
   - ✅ profiles
   - ✅ programs
   - ✅ prompts
   - ✅ projects
   - ✅ project_prompts
   - ✅ execution_history

### 방법 2: SQL로 확인

```sql
-- 각 테이블의 데이터 개수 확인
SELECT
  'profiles' as table_name,
  COUNT(*) as row_count
FROM profiles
UNION ALL
SELECT 'programs', COUNT(*) FROM programs
UNION ALL
SELECT 'prompts', COUNT(*) FROM prompts
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'project_prompts', COUNT(*) FROM project_prompts
UNION ALL
SELECT 'execution_history', COUNT(*) FROM execution_history;
```

초기 상태에서는 모두 0개가 정상입니다.

---

## ✅ 검증 완료 후 다음 단계

스키마가 정상적으로 확인되면:

### 1️⃣ Edge Functions 배포 상태 확인

```bash
supabase functions list
```

**예상 결과:**
```
┌────────────────┬──────────┬─────────┐
│ NAME           │ VERSION  │ STATUS  │
├────────────────┼──────────┼─────────┤
│ execute-ai     │ v1       │ ACTIVE  │
│ export-prompts │ v1       │ ACTIVE  │
│ import-prompts │ v1       │ ACTIVE  │
└────────────────┴──────────┴─────────┘
```

**배포 안 되어 있다면:**
```bash
supabase functions deploy execute-ai
supabase functions deploy export-prompts
supabase functions deploy import-prompts
```

### 2️⃣ API Secrets 확인

```bash
supabase secrets list
```

**예상 결과:**
```
OPENAI_API_KEY
GEMINI_API_KEY
CLAUDE_API_KEY (선택)
```

**설정 안 되어 있다면:**
```bash
# docs/api_key.txt 참고
supabase secrets set OPENAI_API_KEY=sk-proj-...
supabase secrets set GEMINI_API_KEY=AIza...
```

### 3️⃣ 프론트엔드 테스트

```bash
npm run dev
```

http://localhost:8080/ai-execute 접속 후:
1. 프롬프트 입력
2. AI 제공자 선택
3. 실행 버튼 클릭
4. 결과 확인!

---

## 🎯 검증 체크리스트

완료된 항목에 체크하세요:

- [ ] **데이터베이스 스키마**
  - [ ] 6개 테이블 존재
  - [ ] RLS 활성화됨
  - [ ] RLS 정책 7개 이상
  - [ ] 인덱스 8개 이상
  - [ ] 트리거 5개 이상
  - [ ] 함수 2개 이상

- [ ] **Edge Functions**
  - [ ] execute-ai 배포됨
  - [ ] export-prompts 배포됨
  - [ ] import-prompts 배포됨

- [ ] **API Secrets**
  - [ ] OPENAI_API_KEY 설정됨
  - [ ] GEMINI_API_KEY 설정됨

- [ ] **프론트엔드**
  - [ ] .env.local 설정됨
  - [ ] npm run dev 실행됨
  - [ ] /ai-execute 페이지 접근 가능

- [ ] **통합 테스트**
  - [ ] AI 실행 성공
  - [ ] 결과 표시됨
  - [ ] 히스토리 저장됨

---

## 📚 참고 문서

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - 전체 설정 가이드
- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - 프론트엔드 연동
- [supabase/README.md](../supabase/README.md) - Edge Functions API

---

## 💬 도움이 필요하신가요?

**스키마 검증 결과를 공유해주세요:**

1. `supabase/quick-check.sql` 실행 결과 스크린샷
2. 에러 메시지 (있다면)
3. `supabase functions list` 결과

그러면 다음 단계를 정확히 안내드리겠습니다!
