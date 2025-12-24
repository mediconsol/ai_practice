-- 트리거 진단 SQL
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- ===========================================
-- 1. 현재 존재하는 트리거 확인
-- ===========================================
SELECT
  trigger_name,
  event_object_schema,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' OR event_object_schema = 'auth'
ORDER BY event_object_table, trigger_name;

-- ===========================================
-- 2. 예상되는 트리거 목록
-- ===========================================
--
-- ✅ update_profiles_updated_at (profiles 테이블)
-- ✅ update_programs_updated_at (programs 테이블)
-- ✅ update_prompts_updated_at (prompts 테이블)
-- ✅ update_projects_updated_at (projects 테이블)
-- ❓ on_auth_user_created (auth.users 테이블)
--
-- 총 5개 예상

-- ===========================================
-- 3. 트리거 함수 확인
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
-- ✅ update_updated_at_column
-- ✅ handle_new_user

-- ===========================================
-- 4. auth.users 트리거 확인 (중요!)
-- ===========================================
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';

-- 이 결과가 비어있다면 회원가입 트리거가 없는 것입니다.
