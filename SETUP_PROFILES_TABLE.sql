-- =====================================================
-- SETUP PROFILES TABLE AND AUTO-CREATE TRIGGER
-- COPY AND PASTE THIS ENTIRE BLOCK INTO SUPABASE SQL EDITOR
-- =====================================================
-- 
-- Steps:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Click "New Query"
-- 3. Copy ALL the SQL below
-- 4. Paste into the SQL editor
-- 5. Click "Run" or press Cmd/Ctrl + Enter
-- 
-- =====================================================

-- Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  subscription_tier TEXT DEFAULT 'free' NOT NULL,
  onboarding_complete BOOLEAN DEFAULT FALSE NOT NULL,
  whop_membership_id TEXT,
  whop_plan_id TEXT,
  whop_status TEXT,
  whop_last_sync_at TIMESTAMPTZ
);

-- Create index on subscription_tier for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, subscription_tier, onboarding_complete)
  VALUES (
    NEW.id,
    'free',
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- DONE! Now profiles will be automatically created
-- when users sign up via Google OAuth or email/password
-- =====================================================

