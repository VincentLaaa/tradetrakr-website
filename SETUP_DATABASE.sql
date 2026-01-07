-- =====================================================
-- COPY AND PASTE THIS ENTIRE BLOCK INTO SUPABASE SQL EDITOR
-- =====================================================
-- 
-- Steps:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Click "New Query"
-- 3. Copy ALL the SQL below (everything between the === lines)
-- 4. Paste into the SQL editor
-- 5. Click "Run" or press Cmd/Ctrl + Enter
-- 
-- =====================================================

-- Create the email_unsubscribes table
create table if not exists public.email_unsubscribes (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  reason text,
  created_at timestamptz not null default now()
);

-- Create an index on email for faster lookups
create index if not exists idx_email_unsubscribes_email on public.email_unsubscribes(email);

-- Enable Row Level Security (RLS)
alter table public.email_unsubscribes enable row level security;

-- Create a policy that allows service role to do everything
-- (Service role bypasses RLS anyway, but this is good practice)
create policy "Service role can manage unsubscribes"
  on public.email_unsubscribes
  for all
  using (true)
  with check (true);

-- =====================================================
-- DONE! The table is now created and ready to use.
-- =====================================================



