-- Migration: Add foreign key relationships to profiles table for author joins
-- Created: 2025-12-25
-- Purpose: Enable Supabase auto-joins for author information

-- First, ensure the execution_results table exists
CREATE TABLE IF NOT EXISTS execution_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  prompt TEXT NOT NULL,
  result TEXT,
  memo TEXT,
  ai_provider TEXT,
  ai_model TEXT,
  execution_time_ms INTEGER,
  is_shared BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to profiles table for execution_results if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'execution_results_user_id_fkey_profiles'
    AND table_name = 'execution_results'
  ) THEN
    ALTER TABLE execution_results
    ADD CONSTRAINT execution_results_user_id_fkey_profiles
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key to profiles table for programs if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'programs_user_id_fkey_profiles'
    AND table_name = 'programs'
  ) THEN
    ALTER TABLE programs
    ADD CONSTRAINT programs_user_id_fkey_profiles
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key to profiles table for collections if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'collections_user_id_fkey_profiles'
    AND table_name = 'collections'
  ) THEN
    ALTER TABLE collections
    ADD CONSTRAINT collections_user_id_fkey_profiles
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on execution_results if not already enabled
ALTER TABLE execution_results ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for execution_results if they don't exist
DO $$
BEGIN
  -- Policy for viewing own results
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'execution_results'
    AND policyname = 'Users can view own execution results'
  ) THEN
    CREATE POLICY "Users can view own execution results"
      ON execution_results
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Policy for viewing shared results
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'execution_results'
    AND policyname = 'Anyone can view shared execution results'
  ) THEN
    CREATE POLICY "Anyone can view shared execution results"
      ON execution_results
      FOR SELECT
      USING (is_shared = true);
  END IF;

  -- Policy for inserting own results
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'execution_results'
    AND policyname = 'Users can insert own execution results'
  ) THEN
    CREATE POLICY "Users can insert own execution results"
      ON execution_results
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for updating own results
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'execution_results'
    AND policyname = 'Users can update own execution results'
  ) THEN
    CREATE POLICY "Users can update own execution results"
      ON execution_results
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for deleting own results
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'execution_results'
    AND policyname = 'Users can delete own execution results'
  ) THEN
    CREATE POLICY "Users can delete own execution results"
      ON execution_results
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_execution_results_user_id ON execution_results(user_id);
CREATE INDEX IF NOT EXISTS idx_execution_results_is_shared ON execution_results(is_shared);
CREATE INDEX IF NOT EXISTS idx_execution_results_created_at ON execution_results(created_at DESC);

-- Add updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_execution_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_execution_results_updated_at ON execution_results;
CREATE TRIGGER trigger_update_execution_results_updated_at
  BEFORE UPDATE ON execution_results
  FOR EACH ROW
  EXECUTE FUNCTION update_execution_results_updated_at();
