-- ====================================================
-- Supabase Migration: onboarding_sessions table
-- ====================================================
-- 
-- This table stores anonymous onboarding quiz sessions.
-- No auth required - uses sessionId (UUID) as primary key.
--
-- Run this in Supabase SQL Editor:
-- 1. Go to your Supabase project dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Paste this SQL and click "Run"
-- ====================================================

-- Drop existing table if you want to start fresh (WARNING: deletes all data)
-- DROP TABLE IF EXISTS onboarding_sessions;

-- Create the table
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  quiz_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_step_id TEXT,
  completed BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'homepage_hero',
  email TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_created_at 
  ON onboarding_sessions(created_at DESC);

-- Create index on completed for filtering
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_completed 
  ON onboarding_sessions(completed);

-- Create index on email for lookups (if provided)
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_email 
  ON onboarding_sessions(email) 
  WHERE email IS NOT NULL;

-- Enable Row Level Security (RLS) - but allow all operations via service role
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything (for API routes)
CREATE POLICY "Service role can do everything"
  ON onboarding_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Allow anonymous reads/writes (if you want direct client access)
-- CREATE POLICY "Allow anonymous access"
--   ON onboarding_sessions
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

