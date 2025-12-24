-- 프로그램 수집함 기능을 위한 테이블 및 Storage 설정
-- 작성일: 2024-12-25

-- ============================================
-- 1. collections 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  preview_mode TEXT NOT NULL CHECK (preview_mode IN ('html', 'artifact')),
  artifact_url TEXT,
  storage_path TEXT,
  memo TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. 인덱스 생성
-- ============================================

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_category ON collections(category);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collections_is_favorite ON collections(is_favorite) WHERE is_favorite = true;

-- ============================================
-- 3. RLS 정책 설정
-- ============================================

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 컬렉션만 조회 가능
CREATE POLICY "Users can view own collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 컬렉션만 생성 가능
CREATE POLICY "Users can create own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 컬렉션만 수정 가능
CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 컬렉션만 삭제 가능
CREATE POLICY "Users can delete own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. updated_at 자동 갱신 트리거
-- ============================================

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. Storage 버킷 생성
-- ============================================

-- collections 버킷 생성 (이미 존재하지 않는 경우)
INSERT INTO storage.buckets (id, name, public)
VALUES ('collections', 'collections', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. Storage RLS 정책 설정
-- ============================================

-- Storage 객체에 대한 RLS 활성화는 자동으로 되어 있음

-- 사용자는 자신의 폴더에만 업로드 가능
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'collections' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 사용자는 자신의 폴더 파일만 조회 가능
CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'collections' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 사용자는 자신의 폴더 파일만 수정 가능 (덮어쓰기)
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'collections' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'collections' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 사용자는 자신의 폴더 파일만 삭제 가능
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'collections' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- 7. 코멘트 추가
-- ============================================

COMMENT ON TABLE collections IS '사용자가 저장한 HTML 프로그램 및 Claude 아티팩트 컬렉션';
COMMENT ON COLUMN collections.preview_mode IS '미리보기 모드: html 또는 artifact';
COMMENT ON COLUMN collections.artifact_url IS 'Claude artifact URL (preview_mode=artifact인 경우)';
COMMENT ON COLUMN collections.storage_path IS 'Supabase Storage에 저장된 HTML 파일 경로 (preview_mode=html인 경우)';
