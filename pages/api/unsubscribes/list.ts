/**
 * API Route: /api/unsubscribes/list
 * 
 * Returns a list of all unsubscribed emails (for admin/manual removal from Resend).
 * 
 * GET /api/unsubscribes/list?format=json|csv&limit=1000&since=2024-01-01
 * 
 * Query parameters:
 * - format: 'json' (default) or 'csv'
 * - limit: Maximum number of results (default: 1000, max: 10000)
 * - since: ISO date string to get only unsubscribes after this date
 * 
 * This is useful for:
 * - Seeing who unsubscribed so you can manually remove them from Resend
 * - Exporting a CSV to import into spreadsheets
 * - Running periodic cleanup jobs
 * 
 * ⚠️ SECURITY NOTE: Consider adding authentication if you expose this endpoint
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface ListResponse {
  emails?: string[];
  records?: Array<{
    email: string;
    reason: string | null;
    created_at: string;
  }>;
  csv?: string;
  count?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ListResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed. Use GET.',
    });
  }

  try {
    const format = (req.query.format as string) || 'json';
    const limit = Math.min(
      parseInt((req.query.limit as string) || '1000', 10),
      10000
    );
    const since = req.query.since as string | undefined;

    let query = supabaseAdmin
      .from('email_unsubscribes')
      .select('email, reason, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by date if provided
    if (since) {
      query = query.gte('created_at', since);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error in unsubscribes list API:', error);
      return res.status(500).json({
        error: 'Failed to fetch unsubscribed emails',
      });
    }

    if (format === 'csv') {
      // Return as CSV
      const csvRows = ['email,reason,created_at'];
      data?.forEach((record) => {
        const email = record.email;
        const reason = record.reason ? `"${record.reason.replace(/"/g, '""')}"` : '';
        const createdAt = record.created_at;
        csvRows.push(`${email},${reason},${createdAt}`);
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="unsubscribes-${new Date().toISOString().split('T')[0]}.csv"`
      );
      return res.status(200).send(csvRows.join('\n') as any);
    }

    // Return as JSON
    if (format === 'json') {
      const emailsOnly = req.query.emailsOnly === 'true';

      if (emailsOnly) {
        // Return just array of email addresses
        return res.status(200).json({
          emails: data?.map((r) => r.email) || [],
          count: data?.length || 0,
        });
      }

      // Return full records
      return res.status(200).json({
        records: data || [],
        count: data?.length || 0,
      });
    }

    return res.status(400).json({
      error: 'Invalid format. Use "json" or "csv"',
    });
  } catch (err) {
    console.error('Unexpected error in unsubscribes list API:', err);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

