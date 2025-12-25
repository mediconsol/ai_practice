-- Migration: Add token usage tracking to profiles
-- Created: 2025-12-25
-- Purpose: Track token usage per user for SaaS billing

-- Add token tracking columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tokens_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS token_limit INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS tokens_reset_at TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month');

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_token_usage ON profiles(id, tokens_used_this_month);

-- Add comments
COMMENT ON COLUMN profiles.tokens_used_this_month IS 'Number of tokens used in current month';
COMMENT ON COLUMN profiles.token_limit IS 'Monthly token limit based on subscription tier (-1 for unlimited)';
COMMENT ON COLUMN profiles.tokens_reset_at IS 'Next token reset date (first day of next month)';

-- Set token limits based on subscription tier
UPDATE profiles
SET token_limit = CASE subscription_tier
  WHEN 'free' THEN 10000
  WHEN 'pro' THEN 100000
  WHEN 'enterprise' THEN -1
  ELSE 10000
END
WHERE token_limit IS NULL OR token_limit = 0;

-- Function to increment token usage
CREATE OR REPLACE FUNCTION increment_token_usage(
  p_user_id UUID,
  p_tokens_used INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_current_usage INTEGER;
  v_limit INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
  v_result JSONB;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT tokens_used_this_month, token_limit, tokens_reset_at
  INTO v_current_usage, v_limit, v_reset_at
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if reset is needed
  IF v_reset_at <= NOW() THEN
    UPDATE profiles
    SET
      tokens_used_this_month = 0,
      tokens_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
      updated_at = NOW()
    WHERE id = p_user_id;
    v_current_usage := 0;
    v_reset_at := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
  END IF;

  -- Check limit (skip if unlimited)
  IF v_limit > 0 AND (v_current_usage + p_tokens_used) > v_limit THEN
    v_result := jsonb_build_object(
      'success', false,
      'error', 'TOKEN_LIMIT_EXCEEDED',
      'current_usage', v_current_usage,
      'limit', v_limit,
      'remaining', v_limit - v_current_usage
    );
    RETURN v_result;
  END IF;

  -- Increment usage
  UPDATE profiles
  SET
    tokens_used_this_month = tokens_used_this_month + p_tokens_used,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Return success
  v_result := jsonb_build_object(
    'success', true,
    'current_usage', v_current_usage + p_tokens_used,
    'limit', v_limit,
    'remaining', CASE WHEN v_limit = -1 THEN -1 ELSE v_limit - (v_current_usage + p_tokens_used) END
  );
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can use tokens
CREATE OR REPLACE FUNCTION check_token_limit(
  p_user_id UUID,
  p_required_tokens INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_current_usage INTEGER;
  v_limit INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
  v_result JSONB;
BEGIN
  SELECT tokens_used_this_month, token_limit, tokens_reset_at
  INTO v_current_usage, v_limit, v_reset_at
  FROM profiles
  WHERE id = p_user_id;

  -- Check if reset is needed
  IF v_reset_at <= NOW() THEN
    v_current_usage := 0;
  END IF;

  -- Check limit
  IF v_limit = -1 THEN
    -- Unlimited
    v_result := jsonb_build_object(
      'allowed', true,
      'unlimited', true,
      'current_usage', v_current_usage,
      'limit', -1
    );
  ELSIF (v_current_usage + p_required_tokens) <= v_limit THEN
    -- Within limit
    v_result := jsonb_build_object(
      'allowed', true,
      'unlimited', false,
      'current_usage', v_current_usage,
      'limit', v_limit,
      'remaining', v_limit - v_current_usage
    );
  ELSE
    -- Exceeded limit
    v_result := jsonb_build_object(
      'allowed', false,
      'unlimited', false,
      'current_usage', v_current_usage,
      'limit', v_limit,
      'remaining', v_limit - v_current_usage
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_token_usage(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_token_limit(UUID, INTEGER) TO authenticated;
