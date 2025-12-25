-- Migration: Add user preferences to profiles table
-- Created: 2025-12-25
-- Purpose: Add preferences column to store user settings for AI and interface

-- Add preferences column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{
  "ai": {
    "default_provider": "openai",
    "default_models": {
      "openai": "gpt-4o",
      "claude": "claude-3-5-sonnet-20241022",
      "gemini": "gemini-pro"
    },
    "default_temperature": 0.7,
    "default_max_tokens": 2000
  },
  "interface": {
    "default_view_mode": "grid",
    "theme": "system"
  }
}'::jsonb;

-- Add index for better query performance on preferences
CREATE INDEX IF NOT EXISTS idx_profiles_preferences ON profiles USING gin(preferences);

-- Add comment to the column
COMMENT ON COLUMN profiles.preferences IS 'User preferences for AI settings, interface customization, etc.';

-- Update existing rows to have the default preferences if they have NULL
UPDATE profiles
SET preferences = '{
  "ai": {
    "default_provider": "openai",
    "default_models": {
      "openai": "gpt-4o",
      "claude": "claude-3-5-sonnet-20241022",
      "gemini": "gemini-pro"
    },
    "default_temperature": 0.7,
    "default_max_tokens": 2000
  },
  "interface": {
    "default_view_mode": "grid",
    "theme": "system"
  }
}'::jsonb
WHERE preferences IS NULL OR preferences = '{}'::jsonb;
