/**
 * Unsubscribe Page: /unsubscribe
 * 
 * Allows users to unsubscribe from TradeTrakR marketing emails.
 * 
 * URL format for email links (Resend):
 * https://tradetrakr.com/unsubscribe?email={{{contact.email}}}
 * 
 * ({{{contact.email}}} will be replaced by Resend with the recipient's actual email)
 * 
 * Note: Unsubscribes are stored in the database. You'll need to manually remove
 * unsubscribed emails from your Resend contact list.
 */

import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

interface UnsubscribePageProps {
  initialEmail: string | null;
}

export default function UnsubscribePage({ initialEmail }: UnsubscribePageProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  /**
   * Validates email format (client-side validation)
   */
  const isValidEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handles the unsubscribe form submission
   */
  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous messages
    setMessage(null);

    // Validate email is provided
    if (!email.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter your email address',
      });
      return;
    }

    // Validate email format
    if (!isValidEmailFormat(email.trim())) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid email address',
      });
      return;
    }

    // Disable button and show loading state
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          reason: 'user clicked unsubscribe page',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: "You've been unsubscribed. You won't receive future marketing emails from TradeTrakR.",
        });
        // Clear the email field on success
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Something went wrong. Please try again later.',
        });
      }
    } catch (err) {
      console.error('Error submitting unsubscribe request:', err);
      setMessage({
        type: 'error',
        text: 'Connection error. Please check your internet connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Unsubscribe | TradeTrakR</title>
        <meta name="description" content="Unsubscribe from TradeTrakR marketing emails" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Unsubscribe from TradeTrakR emails</h1>
          <p style={styles.description}>
            We're sorry to see you go! Enter your email address below to unsubscribe from
            marketing emails.
          </p>

          {!initialEmail && (
            <p style={styles.noEmailNotice}>
              No email attached to this link. Please enter the email you want to unsubscribe.
            </p>
          )}

          <form onSubmit={handleUnsubscribe} style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  ...(isSubmitting && styles.inputDisabled),
                }}
                autoFocus={!initialEmail}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00f3ff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2a2a2a';
                }}
              />
            </div>

            {message && (
              <div
                style={{
                  ...styles.message,
                  ...(message.type === 'success' ? styles.successMessage : styles.errorMessage),
                }}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.button,
                ...(isSubmitting && styles.buttonDisabled),
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }
              }}
            >
              {isSubmitting ? 'Unsubscribing...' : 'Unsubscribe'}
            </button>
          </form>

          <p style={styles.footer}>
            If you continue to receive emails after unsubscribing, please{' '}
            <a href="mailto:support@tradetrakr.com" style={styles.link}>
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * Server-side props: Extract email from query parameter
 */
export const getServerSideProps: GetServerSideProps<UnsubscribePageProps> = async (context) => {
  const email = context.query.email;

  return {
    props: {
      initialEmail: typeof email === 'string' ? email : null,
    },
  };
};

/**
 * Styles (inline CSS for simplicity)
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    border: '1px solid #2a2a2a',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 12px 0',
    textAlign: 'center',
  },
  description: {
    fontSize: '16px',
    color: '#a0a0a0',
    margin: '0 0 24px 0',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  noEmailNotice: {
    fontSize: '14px',
    color: '#ffa500',
    margin: '0 0 24px 0',
    padding: '12px',
    backgroundColor: '#2a1a00',
    borderRadius: '6px',
    border: '1px solid #ffa500',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e0e0e0',
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    color: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  button: {
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, opacity 0.2s',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  successMessage: {
    backgroundColor: '#1a3a1a',
    border: '1px solid #22c55e',
    color: '#22c55e',
  },
  errorMessage: {
    backgroundColor: '#3a1a1a',
    border: '1px solid #ef4444',
    color: '#ef4444',
  },
  footer: {
    marginTop: '24px',
    fontSize: '14px',
    color: '#808080',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  link: {
    color: '#00f3ff',
    textDecoration: 'none',
  },
};

/**
 * 📧 EMAIL LINK FORMAT (Resend)
 * 
 * Use this exact link format in your Resend email HTML templates:
 * 
 * ```html
 * <a href="https://tradetrakr.com/unsubscribe?email={{{contact.email}}}">
 *   Unsubscribe here
 * </a>
 * ```
 * 
 * Resend uses triple curly braces {{{contact.email}}} for email variables.
 * 
 * The unsubscribe page will automatically pre-fill the email field
 * when users click the link.
 * 
 * 🔄 Manual Removal Process:
 * 
 * Since Resend doesn't have automatic unsubscribe functionality:
 * 1. Users unsubscribe through this page → stored in database
 * 2. Query the email_unsubscribes table to see who unsubscribed
 * 3. Manually remove those emails from your Resend contact list
 * 
 * See UNSUBSCRIBE_SETUP.md for query examples.
 */

