-- ================================================
-- Phase 2: 프로그램 수집함 공유 기능 추가
-- ================================================
-- 작성일: 2024-12-25
-- 목적: collections 테이블에 공유 관련 필드 추가 및 collection_likes 테이블 생성

-- ================================================
-- 1. collections 테이블에 공유 관련 필드 추가
-- ================================================

ALTER TABLE collections
ADD COLUMN is_shared BOOLEAN DEFAULT false,
ADD COLUMN shared_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN view_count INTEGER DEFAULT 0,
ADD COLUMN like_count INTEGER DEFAULT 0;

-- 인덱스 추가 (공유 컬렉션 조회 최적화)
CREATE INDEX idx_collections_is_shared ON collections(is_shared);
CREATE INDEX idx_collections_shared_at ON collections(shared_at);

-- ================================================
-- 2. collection_likes 테이블 생성 (좋아요 관리)
-- ================================================

CREATE TABLE collection_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, user_id)
);

CREATE INDEX idx_collection_likes_collection_id ON collection_likes(collection_id);
CREATE INDEX idx_collection_likes_user_id ON collection_likes(user_id);

-- ================================================
-- 3. RLS 정책 업데이트
-- ================================================

-- 기존 SELECT 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Users can view own collections" ON collections;

CREATE POLICY "Users can view own or shared collections"
  ON collections FOR SELECT
  USING (
    auth.uid() = user_id OR is_shared = true
  );

-- ================================================
-- 4. Storage RLS 정책 업데이트
-- ================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can read own collection files" ON storage.objects;

-- 공유된 컬렉션의 파일은 누구나 읽기 가능
CREATE POLICY "Users can read own or shared collection files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'collections' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      EXISTS (
        SELECT 1 FROM collections
        WHERE storage_path = name
        AND is_shared = true
      )
    )
  );

-- ================================================
-- 5. collection_likes RLS 정책
-- ================================================

ALTER TABLE collection_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON collection_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON collection_likes FOR ALL
  USING (auth.uid() = user_id);

-- ================================================
-- 6. 트리거: like_count 자동 업데이트
-- ================================================

CREATE OR REPLACE FUNCTION update_collection_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collections
    SET like_count = like_count + 1
    WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collections
    SET like_count = like_count - 1
    WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collection_like_count
AFTER INSERT OR DELETE ON collection_likes
FOR EACH ROW EXECUTE FUNCTION update_collection_like_count();

-- ================================================
-- 7. RPC 함수: 조회수 증가
-- ================================================

CREATE OR REPLACE FUNCTION increment_collection_view_count(collection_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE collections
  SET view_count = view_count + 1
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
