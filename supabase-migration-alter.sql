-- ====================================================
-- Supabase Migration: ALTER existing onboarding_sessions table
-- ====================================================
-- 
-- Use this if you already have the table and want to add missing columns
-- without losing existing data.
--
-- Run this in Supabase SQL Editor
-- ====================================================

-- Add columns if they don't exist (PostgreSQL doesn't have IF NOT EXISTS for columns)
DO $$ 
BEGIN
  -- Add quiz_answers if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_sessions' AND column_name = 'quiz_answers'
  ) THEN
    ALTER TABLE onboarding_sessions ADD COLUMN quiz_answers JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add last_step_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_sessions' AND column_name = 'last_step_id'
  ) THEN
    ALTER TABLE onboarding_sessions ADD COLUMN last_step_id TEXT;
  END IF;

  -- Add completed if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_sessions' AND column_name = 'completed'
  ) THEN
    ALTER TABLE onboarding_sessions ADD COLUMN completed BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add source if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_sessions' AND column_name = 'source'
  ) THEN
    ALTER TABLE onboarding_sessions ADD COLUMN source TEXT DEFAULT 'homepage_hero';
  END IF;

  -- Add email if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_sessions' AND column_name = 'email'
  ) THEN
    ALTER TABLE onboarding_sessions ADD COLUMN email TEXT;
  END IF;

  -- Add utm_source if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_sessions' AND column_name = 'utm_source'
  ) THEN
    ALTER TABLE onboarding_sessions ADD COLUMN utm_source TEXT;
  END IF;

  -- Add utm_medium if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_sessions' AND column_name = 'utm_medium'
  ) THEN
    ALTER TABLE onboarding_sessions ADD COLUMN utm_medium TEXT;
  END IF;

  -- Add utm_campaign if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_sessions' AND column_name = 'utm_campaign'
  ) THEN
    ALTER TABLE onboarding_sessions ADD COLUMN utm_campaign TEXT;
  END IF;

  -- Ensure created_at has default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_sessions' 
    AND column_name = 'created_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE onboarding_sessions 
    ALTER COLUMN created_at SET DEFAULT NOW();
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_created_at 
  ON onboarding_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_completed 
  ON onboarding_sessions(completed);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_email 
  ON onboarding_sessions(email) 
  WHERE email IS NOT NULL;

-- Enable RLS if not already enabled
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then recreate
DROP POLICY IF EXISTS "Service role can do everything" ON onboarding_sessions;

CREATE POLICY "Service role can do everything"
  ON onboarding_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

