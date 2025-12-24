-- 빠른 스키마 확인 (30초)
-- Supabase Dashboard > SQL Editor에 붙여넣고 실행하세요

-- ===========================================
-- 빠른 체크리스트
-- ===========================================

WITH schema_check AS (
  -- 테이블 체크
  SELECT 'tables' as check_type,
         COUNT(DISTINCT table_name) as actual_count,
         6 as expected_count,
         CASE WHEN COUNT(DISTINCT table_name) = 6 THEN '✅' ELSE '❌' END as status
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'programs', 'prompts', 'projects', 'project_prompts', 'execution_history')

  UNION ALL

  -- RLS 활성화 체크
  SELECT 'rls_enabled' as check_type,
         COUNT(*) as actual_count,
         6 as expected_count,
         CASE WHEN COUNT(*) = 6 THEN '✅' ELSE '❌' END as status
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'programs', 'prompts', 'projects', 'project_prompts', 'execution_history')
    AND rowsecurity = true

  UNION ALL

  -- RLS 정책 체크
  SELECT 'rls_policies' as check_type,
         COUNT(*) as actual_count,
         7 as expected_count,
         CASE WHEN COUNT(*) >= 7 THEN '✅' ELSE '⚠️' END as status
  FROM pg_policies
  WHERE schemaname = 'public'

  UNION ALL

  -- 인덱스 체크
  SELECT 'indexes' as check_type,
         COUNT(*) as actual_count,
         8 as expected_count,
         CASE WHEN COUNT(*) >= 8 THEN '✅' ELSE '⚠️' END as status
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'

  UNION ALL

  -- 트리거 체크
  SELECT 'triggers' as check_type,
         COUNT(*) as actual_count,
         5 as expected_count,
         CASE WHEN COUNT(*) >= 5 THEN '✅' ELSE '⚠️' END as status
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'

  UNION ALL

  -- 함수 체크
  SELECT 'functions' as check_type,
         COUNT(*) as actual_count,
         2 as expected_count,
         CASE WHEN COUNT(*) >= 2 THEN '✅' ELSE '❌' END as status
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN ('update_updated_at_column', 'handle_new_user')
)
SELECT
  check_type as "항목",
  actual_count as "현재값",
  expected_count as "예상값",
  status as "상태"
FROM schema_check
ORDER BY
  CASE check_type
    WHEN 'tables' THEN 1
    WHEN 'rls_enabled' THEN 2
    WHEN 'rls_policies' THEN 3
    WHEN 'indexes' THEN 4
    WHEN 'triggers' THEN 5
    WHEN 'functions' THEN 6
  END;

-- ===========================================
-- 결과 해석
-- ===========================================
--
-- ✅ 모두 체크 = 완벽! 다음 단계로 진행하세요
-- ⚠️ 일부 체크 = 기본 기능은 작동하지만 최적화 필요
-- ❌ 체크 실패 = 스키마 재적용 필요
--
-- ===========================================


-- 추가: 각 테이블 존재 여부 상세 확인
SELECT
  UNNEST(ARRAY['profiles', 'programs', 'prompts', 'projects', 'project_prompts', 'execution_history']) as "테이블명",
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = UNNEST(ARRAY['profiles', 'programs', 'prompts', 'projects', 'project_prompts', 'execution_history'])
    ) THEN '✅ 존재'
    ELSE '❌ 없음'
  END as "상태";
