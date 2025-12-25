-- 테이블 존재 여부 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'shared_content_likes'
) as table_exists;

-- 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'shared_content_likes'
ORDER BY ordinal_position;

-- RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'shared_content_likes';

-- RPC 함수 존재 확인
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('increment_like_count', 'decrement_like_count', 'increment_view_count');
