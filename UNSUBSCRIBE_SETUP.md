# Email Unsubscribe System Setup

This document explains how to set up and use the email unsubscribe system for TradeTrakR.

## 📋 Overview

The unsubscribe system allows users to opt-out of marketing emails through a simple web form. Unsubscribed emails are stored in Supabase and can be queried to exclude them from future email campaigns.

## 🚀 Setup Instructions

### 1. Environment Variables

Add these environment variables to your `.env.local` file (local development) and your hosting platform (production):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** 
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only and must NEVER be exposed to the client
- Get these values from your Supabase project settings

### 2. Database Setup ⚠️ REQUIRED

**You MUST create the database table before the unsubscribe system will work!**

#### Step-by-Step:

1. **Open Supabase Dashboard:**
   - Go to https://app.supabase.com
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Copy & Paste SQL:**
   - Open the file `SETUP_DATABASE.sql` in this project
   - Copy ALL the SQL code (everything between the === lines)
   - Paste it into the SQL editor

4. **Run the SQL:**
   - Click the "Run" button (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned" message

**What this creates:**
- `email_unsubscribes` table with columns:
  - `id` - Unique identifier
  - `email` - Email address (unique, indexed)
  - `reason` - Optional reason for unsubscribing
  - `created_at` - Timestamp when user unsubscribed

### 3. Test the System

1. Start your Next.js dev server: `npm run dev`
2. Visit: `http://localhost:3000/unsubscribe?email=test@example.com`
3. The email should be pre-filled
4. Click "Unsubscribe" to test the flow

## 📧 Email Link Format (Resend)

Use this link format in your Resend email HTML templates:

```html
<a href="https://tradetrakr.com/unsubscribe.html">
  Unsubscribe here
</a>
```

**Note:** Users will manually enter their email address on the unsubscribe page. No need to include email in the URL.

### Example Resend Email Template

```html
<!DOCTYPE html>
<html>
<body>
  <p>Thanks for subscribing to TradeTrakR updates!</p>
  <p>If you no longer wish to receive these emails, you can 
    <a href="https://tradetrakr.com/unsubscribe.html">unsubscribe here</a>.
  </p>
</body>
</html>
```

### Example Email HTML

```html
<!DOCTYPE html>
<html>
<body>
  <p>Thanks for subscribing to TradeTrakR updates!</p>
  <p>If you no longer wish to receive these emails, you can 
    <a href="https://tradetrakr.com/unsubscribe?email={{user_email}}">unsubscribe here</a>.
  </p>
</body>
</html>
```

## 🔍 Querying Unsubscribes (For Manual Removal from Resend)

Since Resend doesn't have automatic unsubscribe functionality, you'll need to:
1. Query the database to see who unsubscribed
2. Manually remove those emails from your Resend contact list

### Option 1: Using Helper Functions

```typescript
import { 
  getAllUnsubscribedEmails, 
  getUnsubscribedEmailsWithDetails,
  exportUnsubscribedEmailsAsCSV 
} from '@/lib/unsubscribeHelpers';

// Get all unsubscribed email addresses (simple array)
const emails = await getAllUnsubscribedEmails();
console.log('Unsubscribed emails:', emails);

// Get unsubscribed emails with details (reason, date)
const records = await getUnsubscribedEmailsWithDetails();
records.forEach(record => {
  console.log(`${record.email} unsubscribed on ${record.created_at}`);
});

// Export as CSV for spreadsheet/Resend import
const csv = await exportUnsubscribedEmailsAsCSV();
console.log(csv);
```

### Option 2: Using API Endpoint

Get JSON list of unsubscribed emails:
```bash
GET /api/unsubscribes/list?format=json
```

Get just email addresses (simple array):
```bash
GET /api/unsubscribes/list?format=json&emailsOnly=true
```

Download as CSV:
```bash
GET /api/unsubscribes/list?format=csv
```

Get unsubscribes since a specific date:
```bash
GET /api/unsubscribes/list?format=json&since=2024-01-01T00:00:00Z
```

### Option 3: Direct Supabase Query

```typescript
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Get all unsubscribed emails
const { data } = await supabaseAdmin
  .from('email_unsubscribes')
  .select('email, created_at, reason')
  .order('created_at', { ascending: false });

// Check if specific email is unsubscribed
const { data: record } = await supabaseAdmin
  .from('email_unsubscribes')
  .select('email')
  .eq('email', 'user@example.com')
  .single();

const isUnsubscribed = !!record;
```

### Manual Removal Workflow

1. **Weekly/Monthly:** Query unsubscribed emails:
   ```bash
   curl https://tradetrakr.com/api/unsubscribes/list?format=csv > unsubscribes.csv
   ```

2. **Remove from Resend:**
   - Open Resend dashboard
   - Go to Contacts/Audience
   - Remove each email from the CSV manually (or use Resend API if available)

3. **Optional:** Create a script to automate Resend removal using their API

## 📁 Files Created

- `lib/supabaseAdmin.ts` - Server-side Supabase client (updated with env vars)
- `pages/api/unsubscribe.ts` - API route for processing unsubscribes
- `pages/unsubscribe.tsx` - User-facing unsubscribe page
- `db/unsubscribes.sql` - Database schema SQL script

## 🔒 Security Notes

- The API route uses server-side Supabase client with service role key
- Email validation prevents malformed inputs
- Upsert operation prevents duplicate entries gracefully
- RLS (Row Level Security) is enabled on the table (though service role bypasses it)

## 🎨 Customization

### Styling

The unsubscribe page uses inline styles for simplicity. To customize:

1. Edit `pages/unsubscribe.tsx`
2. Modify the `styles` object at the bottom of the file
3. Or extract styles to a CSS module/file if preferred

### Success/Error Messages

Edit the messages in:
- `pages/unsubscribe.tsx` - User-facing messages
- `pages/api/unsubscribe.ts` - API error messages

## 📝 Notes

- This handles **global marketing unsubscribes** only
- You can later expand to handle specific email lists/tags if needed
- The system gracefully handles duplicate unsubscribe clicks (upsert)
- Consider adding an `updated_at` field if you need to track modifications

## 🐛 Troubleshooting

**Issue:** "Missing NEXT_PUBLIC_SUPABASE_URL environment variable"
- **Fix:** Make sure `.env.local` exists and has the correct variables

**Issue:** "Supabase error" in console
- **Fix:** Check that you've created the `email_unsubscribes` table in Supabase
- **Fix:** Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct

**Issue:** Email not pre-filling
- **Fix:** Check that the URL has `?email=...` query parameter
- **Fix:** Email providers may URL-encode the email - the page handles this

## ✅ Production Checklist

- [ ] Environment variables set in hosting platform
- [ ] Database table created in Supabase
- [ ] Test unsubscribe flow end-to-end
- [ ] Update email templates with unsubscribe links
- [ ] Verify email links work in actual emails
- [ ] Set up monitoring/logging for unsubscribe API calls

