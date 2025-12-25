-- Create shared_content_likes table for execution results
CREATE TABLE IF NOT EXISTS shared_content_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  result_id UUID NOT NULL REFERENCES execution_results(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 한 사용자는 한 결과물에 한 번만 좋아요 가능
  UNIQUE(user_id, result_id)
);

-- Indexes for performance
CREATE INDEX idx_shared_content_likes_user_id ON shared_content_likes(user_id);
CREATE INDEX idx_shared_content_likes_result_id ON shared_content_likes(result_id);

-- RLS Policies
ALTER TABLE shared_content_likes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 좋아요 목록 조회 가능
CREATE POLICY "Anyone can view likes"
  ON shared_content_likes
  FOR SELECT
  USING (true);

-- 로그인한 사용자는 자신의 좋아요 추가 가능
CREATE POLICY "Users can add their own likes"
  ON shared_content_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 로그인한 사용자는 자신의 좋아요만 삭제 가능
CREATE POLICY "Users can delete their own likes"
  ON shared_content_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- RPC functions for incrementing/decrementing like counts
CREATE OR REPLACE FUNCTION increment_like_count(result_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE execution_results
  SET like_count = like_count + 1
  WHERE id = result_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_like_count(result_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE execution_results
  SET like_count = GREATEST(0, like_count - 1)
  WHERE id = result_id;
END;
$$;

-- RPC function for incrementing view count
CREATE OR REPLACE FUNCTION increment_view_count(result_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE execution_results
  SET view_count = view_count + 1
  WHERE id = result_id;
END;
$$;
