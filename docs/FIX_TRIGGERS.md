# 트리거 수정 가이드

> **문제**: `quick-check.sql` 실행 결과 triggers 현재값 4, 예상값 5
> **원인**: 트리거 1개 누락 (아마도 `on_auth_user_created`)
> **해결 시간**: 5분

---

## 🔍 Step 1: 문제 진단 (2분)

### Supabase Dashboard 접속
https://app.supabase.com/project/jkhpwsbogsgkqrspublx

### SQL Editor에서 진단 SQL 실행

**파일 열기**: `supabase/diagnose-triggers.sql`

**실행 방법**:
1. SQL Editor > New query
2. 파일 내용 복사 → 붙여넣기
3. Run 버튼 클릭

**결과 확인**:
```
현재 트리거 목록이 표시됩니다.
아마도 4개만 있을 것입니다:
✅ update_profiles_updated_at
✅ update_programs_updated_at
✅ update_prompts_updated_at
✅ update_projects_updated_at
❌ on_auth_user_created (이것이 없음)
```

---

## 🔧 Step 2: 트리거 수정 (2분)

### 수정 SQL 실행

**파일 열기**: `supabase/fix-missing-trigger.sql`

**실행 방법**:
1. SQL Editor > New query
2. 파일 내용 **전체** 복사 → 붙여넣기
3. Run 버튼 클릭

**예상 결과**:
```
✅ 함수 2개 생성/업데이트
✅ 트리거 5개 생성
✅ 검증 쿼리 통과
```

**SQL 하단의 검증 쿼리 결과**:
```
trigger_count: 5

trigger_name                   | event_object_table | event
-------------------------------|-------------------|------------------
on_auth_user_created          | users             | AFTER INSERT
update_profiles_updated_at    | profiles          | BEFORE UPDATE
update_programs_updated_at    | programs          | BEFORE UPDATE
update_prompts_updated_at     | prompts           | BEFORE UPDATE
update_projects_updated_at    | projects          | BEFORE UPDATE
```

---

## ✅ Step 3: 재검증 (1분)

### quick-check.sql 다시 실행

**파일 열기**: `supabase/quick-check.sql`

**실행 방법**:
1. SQL Editor > New query (또는 이전 쿼리 재사용)
2. 파일 내용 복사 → 붙여넣기
3. Run 버튼 클릭

**기대 결과**:
```
항목        | 현재값 | 예상값 | 상태
-----------|--------|--------|------
tables     | 6      | 6      | ✅
rls_enabled| 6      | 6      | ✅
rls_policies| 7+    | 7      | ✅
indexes    | 8+     | 8      | ✅
triggers   | 5      | 5      | ✅  ← 이제 5개!
functions  | 2      | 2      | ✅
```

**✅ 모두 체크 = 완벽!**

---

## 🎯 Step 4: 트리거 동작 테스트 (선택, 3분)

### 회원가입 트리거 테스트

이제 `on_auth_user_created` 트리거가 제대로 작동하는지 테스트해봅시다.

**방법 1: 실제 회원가입 (추천)**
```bash
# 로그인 페이지 구현 후
# http://localhost:8080/signup 에서 회원가입

# 그 다음 Supabase Dashboard > Table Editor > profiles 확인
# 새 사용자가 자동으로 추가되었는지 확인
```

**방법 2: SQL로 테스트 (지금 당장)**
```sql
-- Supabase Dashboard > SQL Editor

-- 1. 현재 profiles 개수 확인
SELECT COUNT(*) FROM profiles;

-- 2. 테스트 사용자 생성 (실제 회원가입 흉내)
-- 주의: 이 방법은 실제 인증을 거치지 않으므로 테스트 목적으로만 사용

-- 3. profiles 테이블 확인
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
-- 회원가입 시 자동으로 profile이 생성됩니다
```

### updated_at 트리거 테스트

```sql
-- Supabase Dashboard > SQL Editor

-- 1. 특정 프롬프트 선택
SELECT id, title, updated_at FROM prompts LIMIT 1;

-- 2. 해당 프롬프트 수정
UPDATE prompts
SET title = '수정된 제목'
WHERE id = '<위에서 확인한 id>';

-- 3. updated_at이 자동으로 갱신되었는지 확인
SELECT id, title, updated_at FROM prompts WHERE id = '<위에서 확인한 id>';
-- updated_at이 현재 시각으로 변경되어야 함
```

---

## 🐛 문제 해결

### 여전히 트리거가 4개인 경우

**증상**: `fix-missing-trigger.sql` 실행 후에도 4개

**원인**: auth.users 트리거는 `trigger_schema = 'auth'`이므로 쿼리에서 제외되었을 수 있음

**해결**:
```sql
-- Supabase Dashboard > SQL Editor

-- auth.users 트리거만 확인
SELECT
  trigger_name,
  event_object_schema,
  event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND trigger_name = 'on_auth_user_created';

-- 결과가 비어있으면 트리거가 없는 것
-- 다시 fix-missing-trigger.sql의 Step 3 부분만 실행
```

### 함수 생성 권한 오류

**증상**: `permission denied for schema public`

**해결**:
```sql
-- Supabase Dashboard > SQL Editor

-- 권한 확인
SELECT current_user;

-- postgres 사용자로 실행해야 합니다
-- Supabase Dashboard에서는 기본적으로 postgres 권한으로 실행됩니다
```

### auth.users 테이블 접근 불가

**증상**: `permission denied for table users`

**해결**:
```sql
-- SECURITY DEFINER 권한이 필요합니다
-- fix-missing-trigger.sql의 handle_new_user 함수는 이미 SECURITY DEFINER로 설정됨

-- 함수 권한 확인
SELECT
  routine_name,
  security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- security_type이 'DEFINER'여야 합니다
```

---

## 📋 트리거 설명

### 1. update_profiles_updated_at
**대상**: `profiles` 테이블
**시점**: UPDATE 전 (BEFORE UPDATE)
**기능**: `updated_at` 컬럼을 현재 시각으로 자동 갱신

### 2. update_programs_updated_at
**대상**: `programs` 테이블
**시점**: UPDATE 전 (BEFORE UPDATE)
**기능**: `updated_at` 컬럼을 현재 시각으로 자동 갱신

### 3. update_prompts_updated_at
**대상**: `prompts` 테이블
**시점**: UPDATE 전 (BEFORE UPDATE)
**기능**: `updated_at` 컬럼을 현재 시각으로 자동 갱신

### 4. update_projects_updated_at
**대상**: `projects` 테이블
**시점**: UPDATE 전 (BEFORE UPDATE)
**기능**: `updated_at` 컬럼을 현재 시각으로 자동 갱신

### 5. on_auth_user_created ⭐ (이것이 누락되었을 가능성 높음)
**대상**: `auth.users` 테이블 (Supabase 인증 시스템)
**시점**: INSERT 후 (AFTER INSERT)
**기능**: 새 사용자 생성 시 `profiles` 테이블에 자동으로 프로필 생성
**중요도**: ⭐⭐⭐ 매우 중요 (회원가입 시 필수)

---

## ✅ 완료 체크리스트

- [ ] **Step 1**: `diagnose-triggers.sql` 실행 → 문제 확인
- [ ] **Step 2**: `fix-missing-trigger.sql` 실행 → 트리거 수정
- [ ] **Step 3**: `quick-check.sql` 재실행 → triggers 5/5 ✅ 확인
- [ ] **Step 4**: 트리거 동작 테스트 (선택)

---

## 🎉 성공 확인

`quick-check.sql` 실행 결과:
```
✅ tables: 6/6
✅ rls_enabled: 6/6
✅ rls_policies: 7/7
✅ indexes: 8/8
✅ triggers: 5/5  ← 이제 5개!
✅ functions: 2/2
```

**축하합니다! 데이터베이스 스키마가 완벽하게 설정되었습니다! 🎉**

---

## 📚 관련 문서

- [SCHEMA_VERIFICATION.md](./SCHEMA_VERIFICATION.md) - 전체 스키마 검증 가이드
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase 설정 가이드
- [QUICK_CHECKLIST.md](./QUICK_CHECKLIST.md) - 다음 단계 확인

---

## 💬 다음 단계

스키마가 정상적으로 확인되면:

### 1️⃣ AI 실행 테스트
```bash
npm run dev
# http://localhost:8080/ai-execute 접속
# "당뇨병 환자 안내문 작성" 테스트
```

### 2️⃣ 히스토리 확인
- Supabase Dashboard > Table Editor
- `execution_history` 테이블에 데이터 저장 확인

### 3️⃣ 인증 시스템 구현 시작
- [TODO_ROADMAP.md](./TODO_ROADMAP.md) 참고
- Week 3, Day 1-2: 로그인/회원가입 페이지 구현
