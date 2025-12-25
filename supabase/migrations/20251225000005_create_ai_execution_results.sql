-- Migration: Create AI execution results table
-- Created: 2025-12-25
-- Purpose: Store AI execution history and results

-- ============================================
-- 1. Create ai_execution_results table
-- ============================================
CREATE TABLE IF NOT EXISTS ai_execution_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 실행 정보
  prompt TEXT NOT NULL,
  result TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, error
  error_message TEXT,

  -- AI 설정
  provider TEXT NOT NULL, -- openai, claude, gemini
  model TEXT NOT NULL,
  temperature NUMERIC,
  max_tokens INTEGER,

  -- 토큰 사용량
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ai_execution_results_user_id
  ON ai_execution_results(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_execution_results_created_at
  ON ai_execution_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_execution_results_user_created
  ON ai_execution_results(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_execution_results_status
  ON ai_execution_results(status);

-- ============================================
-- 3. Enable RLS
-- ============================================
ALTER TABLE ai_execution_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Create RLS policies
-- ============================================

-- 사용자는 자신의 실행 결과만 조회 가능
CREATE POLICY "Users can view their own execution results"
  ON ai_execution_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 실행 결과만 생성 가능
CREATE POLICY "Users can create their own execution results"
  ON ai_execution_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 실행 결과만 업데이트 가능
CREATE POLICY "Users can update their own execution results"
  ON ai_execution_results
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 실행 결과만 삭제 가능
CREATE POLICY "Users can delete their own execution results"
  ON ai_execution_results
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. Create updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_ai_execution_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_execution_results_updated_at
  BEFORE UPDATE ON ai_execution_results
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_execution_results_updated_at();

-- ============================================
-- 6. Comments
-- ============================================
COMMENT ON TABLE ai_execution_results IS 'Stores AI execution history and results for analytics';
COMMENT ON COLUMN ai_execution_results.user_id IS 'User who executed the AI';
COMMENT ON COLUMN ai_execution_results.prompt IS 'Input prompt text';
COMMENT ON COLUMN ai_execution_results.result IS 'AI generated result';
COMMENT ON COLUMN ai_execution_results.status IS 'Execution status: pending, success, error';
COMMENT ON COLUMN ai_execution_results.total_tokens IS 'Total tokens used (input + output)';
