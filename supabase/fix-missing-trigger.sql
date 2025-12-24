-- 누락된 트리거 수정 SQL
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- ===========================================
-- Step 1: 함수 재생성 (안전하게)
-- ===========================================

-- update_updated_at_column 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- handle_new_user 함수 (회원가입 시 프로필 자동 생성)
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

-- ===========================================
-- Step 2: 트리거 재생성 (DROP IF EXISTS 사용)
-- ===========================================

-- profiles 테이블
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- programs 테이블
DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- prompts 테이블
DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- projects 테이블
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Step 3: auth.users 트리거 생성 (중요!)
-- ===========================================

-- 기존 트리거 삭제 (있다면)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 새 사용자 생성 시 프로필 자동 생성 트리거
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- Step 4: 검증
-- ===========================================

-- 트리거 개수 확인 (5개여야 함)
SELECT COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
   OR (event_object_schema = 'auth' AND trigger_name = 'on_auth_user_created');

-- 트리거 목록 확인
SELECT
  trigger_name,
  event_object_table,
  action_timing || ' ' || event_manipulation as event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
   OR (event_object_schema = 'auth' AND trigger_name = 'on_auth_user_created')
ORDER BY event_object_table, trigger_name;

-- ===========================================
-- 완료 메시지
-- ===========================================
--
-- ✅ 5개 트리거가 모두 생성되었습니다:
-- 1. update_profiles_updated_at (profiles)
-- 2. update_programs_updated_at (programs)
-- 3. update_prompts_updated_at (prompts)
-- 4. update_projects_updated_at (projects)
-- 5. on_auth_user_created (auth.users)
--
-- 이제 quick-check.sql을 다시 실행하여 확인하세요!
