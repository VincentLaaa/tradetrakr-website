/**
 * Helper functions for managing email unsubscribes
 * 
 * Since Resend doesn't have built-in unsubscribe functionality,
 * these helpers help you query the database to see who unsubscribed
 * so you can manually remove them from your Resend contact list.
 */

import { supabaseAdmin } from './supabaseAdmin';

/**
 * Get all unsubscribed email addresses
 * 
 * Use this to get a list of emails to manually remove from Resend.
 * 
 * @param limit - Maximum number of results (default: 1000)
 * @returns Array of email addresses
 */
export async function getAllUnsubscribedEmails(limit: number = 1000): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_unsubscribes')
      .select('email')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching unsubscribed emails:', error);
      throw error;
    }

    return data?.map((row) => row.email) || [];
  } catch (err) {
    console.error('Unexpected error in getAllUnsubscribedEmails:', err);
    throw err;
  }
}

/**
 * Get unsubscribed emails with details (for logging/reporting)
 * 
 * @param limit - Maximum number of results (default: 1000)
 * @returns Array of unsubscribe records with email, reason, and date
 */
export async function getUnsubscribedEmailsWithDetails(
  limit: number = 1000
): Promise<
  Array<{
    email: string;
    reason: string | null;
    created_at: string;
  }>
> {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_unsubscribes')
      .select('email, reason, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching unsubscribed emails with details:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getUnsubscribedEmailsWithDetails:', err);
    throw err;
  }
}

/**
 * Check if a specific email is unsubscribed
 * 
 * Useful before sending emails to check if recipient has unsubscribed.
 * 
 * @param email - Email address to check
 * @returns true if unsubscribed, false otherwise
 */
export async function isEmailUnsubscribed(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_unsubscribes')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      // If no record found, email is not unsubscribed
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error('Error checking unsubscribe status:', error);
      throw error;
    }

    return !!data;
  } catch (err) {
    console.error('Unexpected error in isEmailUnsubscribed:', err);
    throw err;
  }
}

/**
 * Get unsubscribed emails since a specific date
 * 
 * Useful for periodic cleanup jobs to get only new unsubscribes.
 * 
 * @param sinceDate - ISO date string (e.g., '2024-01-01T00:00:00Z')
 * @returns Array of unsubscribe records
 */
export async function getUnsubscribedEmailsSince(
  sinceDate: string
): Promise<
  Array<{
    email: string;
    reason: string | null;
    created_at: string;
  }>
> {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_unsubscribes')
      .select('email, reason, created_at')
      .gte('created_at', sinceDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unsubscribed emails since date:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getUnsubscribedEmailsSince:', err);
    throw err;
  }
}

/**
 * Export unsubscribed emails as CSV string
 * 
 * Useful for importing into spreadsheets or Resend bulk operations.
 * 
 * @returns CSV string with headers: email,reason,created_at
 */
export async function exportUnsubscribedEmailsAsCSV(): Promise<string> {
  try {
    const records = await getUnsubscribedEmailsWithDetails(10000);

    // CSV header
    const csvRows = ['email,reason,created_at'];

    // CSV rows
    records.forEach((record) => {
      const email = record.email;
      const reason = record.reason ? `"${record.reason.replace(/"/g, '""')}"` : '';
      const createdAt = record.created_at;
      csvRows.push(`${email},${reason},${createdAt}`);
    });

    return csvRows.join('\n');
  } catch (err) {
    console.error('Error exporting unsubscribed emails as CSV:', err);
    throw err;
  }
}

