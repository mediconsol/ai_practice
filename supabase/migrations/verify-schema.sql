-- 스키마 검증 SQL
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- ===========================================
-- 1. 테이블 존재 확인
-- ===========================================
SELECT
  table_name,
  CASE
    WHEN table_name IN ('profiles', 'programs', 'prompts', 'projects', 'project_prompts', 'execution_history')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'programs', 'prompts', 'projects', 'project_prompts', 'execution_history')
ORDER BY table_name;

-- 예상 결과: 6개 테이블 모두 EXISTS
-- profiles, programs, prompts, projects, project_prompts, execution_history


-- ===========================================
-- 2. 테이블별 컬럼 확인
-- ===========================================

-- profiles 테이블 컬럼
SELECT 'profiles' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
-- 예상: id, email, full_name, hospital, department, subscription_tier, created_at, updated_at

-- programs 테이블 컬럼
SELECT 'programs' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'programs'
ORDER BY ordinal_position;
-- 예상: id, user_id, title, description, category, icon, gradient, is_public, is_new, usage_count, created_at, updated_at

-- prompts 테이블 컬럼
SELECT 'prompts' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'prompts'
ORDER BY ordinal_position;
-- 예상: id, user_id, program_id, title, content, category, is_favorite, usage_count, variables, created_at, updated_at

-- execution_history 테이블 컬럼
SELECT 'execution_history' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'execution_history'
ORDER BY ordinal_position;
-- 예상: id, user_id, prompt_id, prompt_title, prompt_content, ai_provider, ai_model, result_content, status, error_message, duration_ms, token_usage, created_at


-- ===========================================
-- 3. 인덱스 확인
-- ===========================================
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'programs', 'prompts', 'projects', 'execution_history')
ORDER BY tablename, indexname;

-- 예상 인덱스:
-- idx_programs_user_id
-- idx_programs_category
-- idx_prompts_user_id
-- idx_prompts_program_id
-- idx_prompts_category
-- idx_projects_user_id
-- idx_history_user_id
-- idx_history_created_at


-- ===========================================
-- 4. RLS (Row Level Security) 활성화 확인
-- ===========================================
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'programs', 'prompts', 'projects', 'project_prompts', 'execution_history')
ORDER BY tablename;

-- 모든 테이블의 rls_enabled가 true여야 함


-- ===========================================
-- 5. RLS 정책 확인
-- ===========================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 예상 정책:
-- profiles: Users can view own profile, Users can update own profile
-- programs: Users can manage own programs, Users can view public programs
-- prompts: Users can manage own prompts
-- projects: Users can manage own projects
-- project_prompts: Users can manage own project_prompts
-- execution_history: Users can manage own history


-- ===========================================
-- 6. 트리거 확인
-- ===========================================
SELECT
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 예상 트리거:
-- update_profiles_updated_at (BEFORE UPDATE)
-- update_programs_updated_at (BEFORE UPDATE)
-- update_prompts_updated_at (BEFORE UPDATE)
-- update_projects_updated_at (BEFORE UPDATE)
-- on_auth_user_created (AFTER INSERT on auth.users)


-- ===========================================
-- 7. 함수 확인
-- ===========================================
SELECT
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('update_updated_at_column', 'handle_new_user')
ORDER BY routine_name;

-- 예상 함수:
-- update_updated_at_column (FUNCTION)
-- handle_new_user (FUNCTION)


-- ===========================================
-- 8. 외래 키 제약 조건 확인
-- ===========================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('profiles', 'programs', 'prompts', 'projects', 'project_prompts', 'execution_history')
ORDER BY tc.table_name, kcu.column_name;

-- 예상 외래 키:
-- profiles.id -> auth.users.id
-- programs.user_id -> profiles.id
-- prompts.user_id -> profiles.id
-- prompts.program_id -> programs.id
-- projects.user_id -> profiles.id
-- project_prompts.project_id -> projects.id
-- project_prompts.prompt_id -> prompts.id
-- execution_history.user_id -> profiles.id
-- execution_history.prompt_id -> prompts.id


-- ===========================================
-- 9. 간단한 데이터 삽입 테스트 (선택사항)
-- ===========================================
-- 이 쿼리는 실행하지 마세요. 참고용입니다.
-- 실제 테스트는 인증된 사용자로 해야 합니다.

/*
-- 테스트 프로그램 삽입 예시 (실행하지 마세요)
INSERT INTO programs (user_id, title, description, category)
VALUES (auth.uid(), '테스트 프로그램', '설명', '문서 처리');

-- 테스트 프롬프트 삽입 예시 (실행하지 마세요)
INSERT INTO prompts (user_id, title, content, category)
VALUES (auth.uid(), '테스트 프롬프트', '내용', '환자 안내문');
*/


-- ===========================================
-- 10. 전체 요약
-- ===========================================
SELECT
  '테이블 수' as category,
  COUNT(*) as count,
  '6개 예상' as expected
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'programs', 'prompts', 'projects', 'project_prompts', 'execution_history')

UNION ALL

SELECT
  '인덱스 수' as category,
  COUNT(*) as count,
  '8개 이상 예상' as expected
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('programs', 'prompts', 'projects', 'execution_history')
  AND indexname LIKE 'idx_%'

UNION ALL

SELECT
  'RLS 활성화된 테이블' as category,
  COUNT(*) as count,
  '6개 예상' as expected
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'programs', 'prompts', 'projects', 'project_prompts', 'execution_history')
  AND rowsecurity = true

UNION ALL

SELECT
  'RLS 정책 수' as category,
  COUNT(*) as count,
  '7개 이상 예상' as expected
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT
  '트리거 수' as category,
  COUNT(*) as count,
  '5개 예상' as expected
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('profiles', 'programs', 'prompts', 'projects')

UNION ALL

SELECT
  '함수 수' as category,
  COUNT(*) as count,
  '2개 예상' as expected
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('update_updated_at_column', 'handle_new_user');


-- ===========================================
-- 결과 해석
-- ===========================================
--
-- ✅ 모든 항목이 예상값과 일치하면 스키마가 완벽하게 적용된 것입니다.
--
-- ⚠️ 일부 항목이 누락되었다면:
--   1. docs/SUPABASE_SETUP.md의 SQL을 다시 실행
--   2. 또는 supabase db push 명령 재실행
--
-- ❌ 대부분의 테이블이 없다면:
--   1. 올바른 프로젝트에 연결되었는지 확인
--   2. supabase link --project-ref 확인
--   3. 마이그레이션 SQL 재실행 필요
