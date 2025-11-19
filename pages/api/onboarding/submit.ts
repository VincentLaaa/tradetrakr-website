/**
 * API Route: /api/onboarding/submit
 * 
 * Handles submission of onboarding quiz answers to Supabase.
 * 
 * DATABASE SCHEMA (Supabase table: onboarding_sessions):
 * 
 * - id: uuid (primary key, default uuid_generate_v4())
 * - created_at: timestamp with time zone (default now())
 * - email: text (nullable)
 * - quiz_answers: jsonb (stores OnboardingAnswers object)
 * - last_step_id: text (e.g., "email_capture", "pricing")
 * - completed: boolean (default false)
 * - source: text (e.g., "homepage_hero", "pricing_section")
 * - utm_source: text (nullable, for future UTM tracking)
 * - utm_medium: text (nullable)
 * - utm_campaign: text (nullable)
 * 
 * This route upserts based on sessionId (id field).
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { OnboardingAnswers } from '@/lib/types/onboarding';

interface OnboardingSubmissionRequest {
  sessionId: string;
  answers: OnboardingAnswers;
  completed: boolean;
  lastStepId: string;
  source?: string;
}

interface ApiResponse {
  success?: boolean;
  error?: string;
  sessionId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[ONBOARDING API] Incoming request');

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('[ONBOARDING API] Parsed body:', body);

    const {
      sessionId,
      answers,
      completed,
      lastStepId,
      source,
    }: {
      sessionId: string;
      answers: OnboardingAnswers;
      completed: boolean;
      lastStepId?: string;
      source?: string;
    } = body;

    if (!sessionId || !answers) {
      console.warn('[ONBOARDING API] Missing sessionId or answers');
      return res.status(400).json({ error: 'Missing fields' });
    }

    const email = answers.email || null;

    const { data, error } = await supabaseAdmin
      .from('onboarding_sessions')
      .upsert(
        {
          id: sessionId,
          quiz_answers: answers,
          completed: !!completed,
          last_step_id: lastStepId || null,
          source: source || 'homepage_hero',
          email,
        },
        { onConflict: 'id' }
      )
      .select();

    console.log('[ONBOARDING API] Supabase upsert result:', { data, error });

    if (error) {
      console.error('[ONBOARDING API] Supabase error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (e: any) {
    console.error('[ONBOARDING API] Exception:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

