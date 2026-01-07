# Supabase OAuth Setup Guide

If Google sign-in/sign-up stopped working after reactivating Supabase, follow these steps:

## Step 1: Enable Google Provider in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/afqsiqoksuuddplockbd
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list and click on it
4. Toggle **Enable Google provider** to ON
5. If you haven't already, you'll need to:
   - Create a Google OAuth client ID and secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Enter your **Client ID** and **Client Secret** in Supabase
   - Add authorized redirect URIs in Google Cloud Console (see Step 2)

## Step 2: Configure Redirect URLs

### In Supabase Dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Add these redirect URLs to the **Redirect URLs** list:
   - `https://tradetrakr.com/onboarding.html`
   - `https://tradetrakr.com/download.html`
   - `https://www.tradetrakr.com/onboarding.html` (if using www)
   - `https://www.tradetrakr.com/download.html` (if using www)
   - For local development: `http://localhost:3000/onboarding.html` and `http://localhost:3000/download.html`

### In Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add these **Authorized redirect URIs**:
   - `https://afqsiqoksuuddplockbd.supabase.co/auth/v1/callback`
   - (Supabase automatically handles the callback - you only need the Supabase callback URL)

## Step 3: Verify Site URL

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Make sure **Site URL** is set to: `https://tradetrakr.com`

## Step 4: Test the Configuration

1. Try clicking "Sign up with Google" or "Sign in with Google"
2. Check the browser console (F12) for any error messages
3. The improved error handling will show specific issues if something is misconfigured

## Common Issues

- **"OAuth redirect URL not configured"**: Add the redirect URLs from Step 2
- **"Google OAuth provider not enabled"**: Enable the Google provider in Supabase
- **"Failed to start OAuth flow"**: Check that your Google OAuth credentials are correct in Supabase
- **No error but nothing happens**: Check browser console for blocked popups or CORS issues

## Testing Locally

If testing locally, make sure to:
1. Add `http://localhost:PORT/onboarding.html` and `http://localhost:PORT/download.html` to Supabase redirect URLs
2. Use your local development URL when testing

