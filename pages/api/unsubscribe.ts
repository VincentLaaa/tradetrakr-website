/**
 * API Route: /api/unsubscribe
 * 
 * Handles email unsubscribe requests from the unsubscribe page.
 * 
 * POST /api/unsubscribe
 * Body: { email: string, reason?: string }
 * 
 * Validates the email and stores it in the email_unsubscribes table.
 * Uses upsert to handle duplicate unsubscribe clicks gracefully.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface UnsubscribeRequest {
  email: string;
  reason?: string;
}

interface UnsubscribeResponse {
  success: boolean;
  error?: string;
}

/**
 * Simple email validation regex
 * Matches basic email format (e.g., user@example.com)
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UnsubscribeResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    const body: UnsubscribeRequest = req.body;

    // Validate email exists
    if (!body.email || typeof body.email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Trim and lowercase the email
    const email = body.email.trim().toLowerCase();

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Prepare the reason (default if not provided)
    const reason = body.reason || 'user clicked unsubscribe page';

    // Upsert to Supabase (handles duplicates gracefully)
    const { data, error } = await supabaseAdmin
      .from('email_unsubscribes')
      .upsert(
        {
          email,
          reason,
        },
        {
          onConflict: 'email',
        }
      )
      .select()
      .single();

    if (error) {
      // Log the actual error server-side
      console.error('Supabase error in unsubscribe API:', error);
      
      // Return user-friendly error message
      return res.status(500).json({
        success: false,
        error: 'Something went wrong. Please try again later.',
      });
    }

    // Success
    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    // Log unexpected errors
    console.error('Unexpected error in unsubscribe API:', err);
    
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again later.',
    });
  }
}

