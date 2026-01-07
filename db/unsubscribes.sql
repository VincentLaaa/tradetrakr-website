/**
 * Database Schema: email_unsubscribes table
 * 
 * Run this SQL manually in your Supabase SQL editor to create the table.
 * 
 * This table stores email addresses that have unsubscribed from marketing emails.
 * The upsert operation (onConflict: 'email') ensures that clicking unsubscribe
 * multiple times won't cause errors.
 */

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

/**
 * Notes:
 * - This table handles global marketing unsubscribes
 * - You can later expand this to handle specific email lists/tags if needed
 * - The 'reason' field can store additional context (e.g., "user clicked unsubscribe link", "bounced email", etc.)
 * - Consider adding an 'updated_at' field if you need to track when unsubscribes were last modified
 */



