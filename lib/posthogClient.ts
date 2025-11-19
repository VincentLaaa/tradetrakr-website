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
    return;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!posthogKey) {
    console.warn('PostHog key not found. Analytics will be disabled.');
    return;
  }

  try {
    // Dynamic import to avoid SSR issues
    import('posthog-js').then(({ default: posthogModule }) => {
      posthog = posthogModule;
      posthog.init(posthogKey, {
        api_host: posthogHost,
        loaded: (ph: any) => {
          posthog = ph;
        },
      });
      isInitialized = true;
    }).catch((err) => {
      console.error('Failed to load PostHog:', err);
    });
  } catch (err) {
    console.error('PostHog initialization error:', err);
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

  // Initialize if not already done
  if (!isInitialized && !posthog) {
    initPostHog();
    // Wait a bit for initialization, then track
    setTimeout(() => {
      if (posthog) {
        posthog.capture(name, properties);
      }
    }, 100);
    return;
  }

  if (posthog) {
    try {
      posthog.capture(name, properties);
    } catch (err) {
      console.error('PostHog tracking error:', err);
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

  if (!isInitialized && !posthog) {
    initPostHog();
    setTimeout(() => {
      if (posthog) {
        posthog.identify(id, traits);
      }
    }, 100);
    return;
  }

  if (posthog) {
    try {
      posthog.identify(id, traits);
    } catch (err) {
      console.error('PostHog identify error:', err);
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

// Auto-initialize on import in browser
if (typeof window !== 'undefined') {
  initPostHog();
}

export const posthogClient = {
  init: initPostHog,
  track: trackEvent,
  identify: identifyUser,
  getClient: getPostHogClient,
};

