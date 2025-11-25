/**
 * Supabase Admin Client (Server-side only)
 * 
 * ⚠️ CRITICAL: This client uses the service role key and should NEVER be imported
 * into client-side code. Only use in API routes and server components.
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL (public URL, safe to expose)
 * - SUPABASE_SERVICE_ROLE_KEY (server-side only, NEVER expose to client)
 * 
 * Where to set these:
 * - Local dev: Create a `.env.local` file in the project root
 * - Production: Set in your hosting platform's environment variable settings
 *   (Vercel, Netlify, etc.)
 */

import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

/**
 * Supabase admin client with service role key
 * Has full database access - use only in server-side code
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * 📦 DATABASE SCHEMA: email_unsubscribes table
 * 
 * Run this SQL manually in your Supabase SQL editor to create the table:
 * 
 * ```sql
 * create table if not exists public.email_unsubscribes (
 *   id uuid primary key default uuid_generate_v4(),
 *   email text unique not null,
 *   reason text,
 *   created_at timestamptz not null default now()
 * );
 * 
 * -- Optional: Create an index on email for faster lookups
 * create index if not exists idx_email_unsubscribes_email on public.email_unsubscribes(email);
 * 
 * -- Optional: Enable Row Level Security (RLS) if you want to restrict access
 * -- For now, we'll rely on the service role key for access
 * alter table public.email_unsubscribes enable row level security;
 * 
 * -- Create a policy that allows service role to do everything
 * -- (Service role bypasses RLS anyway, but this is good practice)
 * create policy "Service role can manage unsubscribes"
 *   on public.email_unsubscribes
 *   for all
 *   using (true)
 *   with check (true);
 * ```
 * 
 * Note: This table stores global marketing unsubscribes.
 * You can later expand this to handle specific email lists/tags if needed.
 */

