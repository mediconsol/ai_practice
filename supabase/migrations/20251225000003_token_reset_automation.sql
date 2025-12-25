-- Migration: Token reset automation
-- Created: 2025-12-25
-- Purpose: Automated monthly token reset using pg_cron

-- ============================================
-- 1. Enable pg_cron extension (if not already enabled)
-- ============================================
-- Note: pg_cron requires superuser privileges
-- In Supabase, this is managed through the dashboard or CLI
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- 2. Create function to reset tokens for all users
-- ============================================
CREATE OR REPLACE FUNCTION reset_monthly_tokens()
RETURNS void AS $$
BEGIN
  -- Reset tokens for users whose reset date has passed
  UPDATE profiles
  SET
    tokens_used_this_month = 0,
    tokens_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
    updated_at = NOW()
  WHERE tokens_reset_at <= NOW();

  -- Log the reset
  RAISE NOTICE 'Monthly token reset completed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION reset_monthly_tokens() TO authenticated;

-- ============================================
-- 3. Schedule monthly reset (requires pg_cron)
-- ============================================
-- This runs on the 1st of every month at 00:00 UTC
-- Uncomment if pg_cron is available:
/*
SELECT cron.schedule(
  'monthly-token-reset',
  '0 0 1 * *',
  $$SELECT reset_monthly_tokens();$$
);
*/

-- ============================================
-- 4. Manual reset function (for testing)
-- ============================================
CREATE OR REPLACE FUNCTION manual_reset_tokens(p_user_id UUID DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
  v_affected_count INTEGER;
BEGIN
  IF p_user_id IS NOT NULL THEN
    -- Reset specific user
    UPDATE profiles
    SET
      tokens_used_this_month = 0,
      tokens_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
      updated_at = NOW()
    WHERE id = p_user_id;

    GET DIAGNOSTICS v_affected_count = ROW_COUNT;
  ELSE
    -- Reset all users
    UPDATE profiles
    SET
      tokens_used_this_month = 0,
      tokens_reset_at = DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
      updated_at = NOW();

    GET DIAGNOSTICS v_affected_count = ROW_COUNT;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'affected_users', v_affected_count,
    'reset_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION manual_reset_tokens(UUID) TO authenticated;

-- ============================================
-- 5. Function to check if user needs token warning
-- ============================================
CREATE OR REPLACE FUNCTION check_token_warning(p_user_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_usage INTEGER;
  v_limit INTEGER;
  v_percentage NUMERIC;
  v_warning_level TEXT;
BEGIN
  SELECT tokens_used_this_month, token_limit
  INTO v_usage, v_limit
  FROM profiles
  WHERE id = p_user_id;

  -- Calculate percentage
  IF v_limit = -1 THEN
    -- Unlimited
    RETURN jsonb_build_object(
      'needs_warning', false,
      'unlimited', true
    );
  END IF;

  v_percentage := (v_usage::NUMERIC / v_limit::NUMERIC) * 100;

  -- Determine warning level
  IF v_percentage >= 100 THEN
    v_warning_level := 'critical'; -- 100% - Exceeded
  ELSIF v_percentage >= 90 THEN
    v_warning_level := 'high'; -- 90-99% - Very high
  ELSIF v_percentage >= 80 THEN
    v_warning_level := 'medium'; -- 80-89% - High
  ELSIF v_percentage >= 70 THEN
    v_warning_level := 'low'; -- 70-79% - Warning
  ELSE
    v_warning_level := 'none'; -- <70% - OK
  END IF;

  RETURN jsonb_build_object(
    'needs_warning', v_percentage >= 70,
    'warning_level', v_warning_level,
    'percentage', ROUND(v_percentage, 1),
    'usage', v_usage,
    'limit', v_limit,
    'remaining', v_limit - v_usage
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_token_warning(UUID) TO authenticated;

-- ============================================
-- 6. Comments
-- ============================================
COMMENT ON FUNCTION reset_monthly_tokens() IS 'Resets token usage for all users at the start of each month';
COMMENT ON FUNCTION manual_reset_tokens(UUID) IS 'Manually reset tokens for a specific user or all users (for testing)';
COMMENT ON FUNCTION check_token_warning(UUID) IS 'Check if user needs a token usage warning (70%, 80%, 90%, 100%)';
