# API Keys Setup

## Step 1: Create .env.local file

Create a file named `.env.local` in the root directory with the following content:

```env
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_LO47KQpxfSNd98yppCvf1Pm8ZLNiDsA2ujOcrrW0LbI
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Supabase (Server-side only - never expose service role key to client)
SUPABASE_URL=https://afqsiqoksuuddplockbd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcXNpcW9rc3V1ZGRwbG9ja2JkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMzY2OSwiZXhwIjoyMDc4OTk5NjY5fQ.PBQ7lAvYP5Z7Cq3wTZg3Go2Y89Ks1J0P66-ETJDj2lQ
```

**Important**: 
- This file should already be in `.gitignore` - never commit it to git
- The `SUPABASE_SERVICE_ROLE_KEY` is sensitive - keep it secret

## Step 2: Create Database Table in Supabase

Go to your Supabase dashboard (https://supabase.com/dashboard/project/afqsiqoksuuddplockbd) and run this SQL in the SQL Editor:

```sql
CREATE TABLE onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT,
  quiz_answers JSONB,
  last_step_id TEXT,
  completed BOOLEAN DEFAULT FALSE,
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- Optional: Create an index on email for faster lookups
CREATE INDEX idx_onboarding_sessions_email ON onboarding_sessions(email);

-- Optional: Create an index on completed for analytics queries
CREATE INDEX idx_onboarding_sessions_completed ON onboarding_sessions(completed);
```

## Step 3: Install Dependencies

Run this command in your terminal:

```bash
npm install next react react-dom posthog-js @supabase/supabase-js typescript @types/react @types/node tailwindcss autoprefixer postcss
```

## Step 4: Verify Setup

1. Make sure `.env.local` exists with your keys
2. Verify the `onboarding_sessions` table exists in Supabase
3. Test the onboarding flow by running `npm run dev` and clicking "Get Started Free"

## Security Notes

- ✅ Your PostHog key is safe to use in client-side code (it's prefixed with `NEXT_PUBLIC_`)
- ⚠️ Your Supabase Service Role Key should NEVER be exposed to the browser - it's only used in API routes
- ✅ The `.env.local` file is automatically ignored by git (should be in `.gitignore`)

