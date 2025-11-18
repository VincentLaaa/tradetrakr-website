# Onboarding Funnel Setup Guide

This document describes the onboarding funnel implementation for TradeTrakR.

## Overview

The onboarding funnel is a multi-step modal flow that:
- Collects user information through a quiz
- Tracks events with PostHog for funnel analysis
- Stores answers in Supabase for user profiling
- Provides a smooth, app-like onboarding experience

## Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "posthog-js": "^1.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

Install with:
```bash
npm install
```

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Supabase (Server-side only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

## Database Setup

Create a table in Supabase called `onboarding_sessions` with the following schema:

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
```

## File Structure

```
├── lib/
│   ├── posthogClient.ts          # PostHog initialization and tracking
│   ├── supabaseAdmin.ts          # Server-side Supabase client
│   └── types/
│       └── onboarding.ts         # TypeScript types
├── components/
│   └── OnboardingModal.tsx       # Main onboarding modal component
├── pages/
│   ├── index.tsx                 # Landing page with CTA
│   └── api/
│       └── onboarding/
│           └── submit.ts         # API route for saving answers
└── next.config.js                # Next.js configuration
```

## Onboarding Flow Steps

1. **Welcome** - Introduction screen
2. **Profile Experience** - Single choice: experience level
3. **Prop Firms** - Multi-select: which prop firms they trade with
4. **Biggest Pain** - Single choice: main struggle
5. **Failed Evals** - Single choice: number of failed evaluations
6. **Encouragement** - Personalized summary screen
7. **Email Capture** - Email input with validation
8. **Pricing** - Final CTA to start free trial

## Event Tracking

The following PostHog events are tracked:

- `onboarding_started` - When modal opens
- `onboarding_step_viewed` - Each time a step is shown
- `onboarding_step_completed` - When user advances from a step
- `onboarding_answer_submitted` - When user answers a question
- `onboarding_closed` - When user closes modal (with reason)
- `signup_submitted` - When user clicks "Start Free Trial"
- `landing_get_started_clicked` - When CTA button is clicked

## Usage

The onboarding modal is integrated into the landing page (`pages/index.tsx`). Clicking "Get Started Free" opens the modal.

To use the modal in other pages:

```tsx
import OnboardingModal from '@/components/OnboardingModal';

function MyPage() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Get Started</button>
      <OnboardingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCompleted={() => {
          // Handle completion (e.g., redirect to signup)
        }}
        entryPoint="my_page"
      />
    </>
  );
}
```

## Next Steps / TODOs

1. **Authentication Integration**: Connect onboarding completion to user signup/authentication flow
2. **UTM Tracking**: Add UTM parameter capture from URL and store in database
3. **Email Integration**: Send welcome email when onboarding is completed
4. **Analytics Dashboard**: Build PostHog dashboard for funnel analysis
5. **A/B Testing**: Use PostHog to test different onboarding flows

## Testing

1. Test the modal opens and closes correctly
2. Verify all steps render properly
3. Check that answers are saved to Supabase
4. Confirm PostHog events are firing
5. Test email validation
6. Verify session persistence (reopening modal should maintain progress)

