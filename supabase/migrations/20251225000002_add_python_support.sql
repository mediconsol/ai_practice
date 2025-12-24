-- Python 지원 추가
-- 작성일: 2024-12-25

-- ============================================
-- 1. preview_mode CHECK 제약조건 업데이트
-- ============================================

-- 기존 CHECK 제약조건 삭제
ALTER TABLE collections
DROP CONSTRAINT IF EXISTS collections_preview_mode_check;

-- 새로운 CHECK 제약조건 추가 (python 포함)
ALTER TABLE collections
ADD CONSTRAINT collections_preview_mode_check
CHECK (preview_mode IN ('html', 'artifact', 'python'));

-- ============================================
-- 2. 코멘트 업데이트
-- ============================================

COMMENT ON COLUMN collections.preview_mode IS '미리보기 모드: html, artifact 또는 python';
COMMENT ON COLUMN collections.storage_path IS 'Supabase Storage에 저장된 파일 경로 (preview_mode=html 또는 python인 경우)';
COMMENT ON TABLE collections IS '사용자가 저장한 HTML/Python 프로그램 및 Claude 아티팩트 컬렉션';
