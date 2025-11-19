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
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: OnboardingSubmissionRequest = req.body;

    // Validate required fields
    if (!body.sessionId || typeof body.sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required and must be a string' });
    }

    if (!body.answers || typeof body.answers !== 'object') {
      return res.status(400).json({ error: 'answers is required and must be an object' });
    }

    if (typeof body.completed !== 'boolean') {
      return res.status(400).json({ error: 'completed is required and must be a boolean' });
    }

    if (!body.lastStepId || typeof body.lastStepId !== 'string') {
      return res.status(400).json({ error: 'lastStepId is required and must be a string' });
    }

    // Validate answers structure (basic checks)
    const answers = body.answers as OnboardingAnswers;
    if (
      answers.experienceLevel !== undefined &&
      typeof answers.experienceLevel !== 'string'
    ) {
      return res.status(400).json({ error: 'answers.experienceLevel must be a string' });
    }

    if (answers.propFirms !== undefined && !Array.isArray(answers.propFirms)) {
      return res.status(400).json({ error: 'answers.propFirms must be an array' });
    }

    if (answers.biggestPain !== undefined && typeof answers.biggestPain !== 'string') {
      return res.status(400).json({ error: 'answers.biggestPain must be a string' });
    }

    if (
      answers.failedEvalsBand !== undefined &&
      typeof answers.failedEvalsBand !== 'string'
    ) {
      return res.status(400).json({ error: 'answers.failedEvalsBand must be a string' });
    }

    if (answers.email !== undefined && typeof answers.email !== 'string') {
      return res.status(400).json({ error: 'answers.email must be a string' });
    }

    // Validate email format if provided
    if (answers.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(answers.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Prepare data for Supabase
    const insertData: {
      id: string;
      quiz_answers: OnboardingAnswers;
      last_step_id: string;
      completed: boolean;
      source: string;
      email?: string;
    } = {
      id: body.sessionId,
      quiz_answers: answers,
      last_step_id: body.lastStepId,
      completed: body.completed,
      source: body.source || 'homepage_hero',
    };

    // Set email if provided
    if (answers.email) {
      insertData.email = answers.email;
    }

    // Upsert to Supabase
    const { data, error } = await supabaseAdmin
      .from('onboarding_sessions')
      .upsert(insertData, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'Failed to save onboarding data',
      });
    }

    return res.status(200).json({
      success: true,
      sessionId: body.sessionId,
    });
  } catch (err) {
    console.error('Unexpected error in onboarding submit:', err);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

