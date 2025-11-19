/**
 * PostHog client for Next.js
 * 
 * Handles PostHog initialization and event tracking in a Next.js environment.
 * Safe for SSR - no-ops on server side.
 */

let posthog: any = null;
let isInitialized = false;

/**
 * Initialize PostHog client (browser only)
 */
export function initPostHog() {
  if (typeof window === 'undefined') {
    return; // SSR guard
  }

  if (isInitialized) {
    console.log('[PostHog] Already initialized, skipping');
    return;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!posthogKey) {
    console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_KEY is missing');
    return;
  }

  try {
    // Dynamic import to avoid SSR issues
    import('posthog-js').then(({ default: posthogModule }) => {
      posthog = posthogModule;
      posthog.init(posthogKey, {
        api_host: posthogHost,
        loaded: (ph: any) => {
          console.log('[PostHog] Initialized with host:', posthogHost);
          posthog = ph;
          isInitialized = true;
        },
      });
    }).catch((err) => {
      console.error('[PostHog] Failed to load PostHog:', err);
    });
  } catch (err) {
    console.error('[PostHog] Initialization error:', err);
  }
}

/**
 * Track an event with PostHog
 * 
 * @param name - Event name
 * @param properties - Optional event properties
 */
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') {
    return; // SSR guard
  }

  console.log('[TRACK EVENT]', name, properties);

  // Initialize if not already done
  if (!isInitialized) {
    initPostHog();
    // Wait a bit for initialization, then track
    setTimeout(() => {
      if (isInitialized && posthog) {
        try {
          posthog.capture(name, properties);
        } catch (e) {
          console.error('[PostHog] capture error', e);
        }
      }
    }, 100);
    return;
  }

  if (posthog) {
    try {
      posthog.capture(name, properties);
    } catch (e) {
      console.error('[PostHog] capture error', e);
    }
  }
}

/**
 * Identify a user with PostHog
 * 
 * @param id - User identifier (email, user ID, etc.)
 * @param traits - Optional user traits/properties
 */
export function identifyUser(id: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined') {
    return; // SSR guard
  }

  console.log('[PostHog] identifyUser', id, traits);

  if (!isInitialized) {
    initPostHog();
    setTimeout(() => {
      if (isInitialized && posthog) {
        try {
          posthog.identify(id, traits);
        } catch (e) {
          console.error('[PostHog] identify error', e);
        }
      }
    }, 100);
    return;
  }

  if (posthog) {
    try {
      posthog.identify(id, traits);
    } catch (e) {
      console.error('[PostHog] identify error', e);
    }
  }
}

/**
 * Get the PostHog client instance (for advanced usage)
 * Returns null on server or if not initialized
 */
export function getPostHogClient() {
  if (typeof window === 'undefined' || !isInitialized) {
    return null;
  }
  return posthog;
}

export const posthogClient = {
  init: initPostHog,
  track: trackEvent,
  identify: identifyUser,
  getClient: getPostHogClient,
};

