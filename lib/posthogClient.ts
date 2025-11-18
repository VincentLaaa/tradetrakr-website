/**
 * PostHog client for Next.js
 * 
 * Handles PostHog initialization and event tracking in a Next.js environment.
 * Safe for SSR - no-ops on server side.
 * 
 * DEBUG MODE: This version includes extensive console logging to help debug
 * event tracking issues.
 */

let posthog: any = null;
let isInitialized = false;

/**
 * Initialize PostHog client (browser only)
 */
export function initPosthog() {
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
    import('posthog-js').then((posthogModule) => {
      posthog = posthogModule.default || posthogModule;
      posthog.init(posthogKey, {
        api_host: posthogHost,
        loaded: (ph: any) => {
          console.log('[PostHog] Loaded callback fired');
          posthog = ph;
        },
      });
      isInitialized = true;
      console.log('[PostHog] Initialized with host:', posthogHost);
    }).catch((err: any) => {
      console.error('[PostHog] Failed to load PostHog module:', err);
    });
  } catch (err: any) {
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

  if (!isInitialized) {
    console.warn('[PostHog] Not initialized yet, initializing now...');
    initPosthog();
    // Wait a bit for initialization, then track
    setTimeout(() => {
      try {
        posthog.capture(name, properties);
        console.log('[PostHog] Event captured after delayed init:', name);
      } catch (e: any) {
        console.error('[PostHog] capture error', e);
      }
    }, 100);
    return;
  }

  try {
    posthog.capture(name, properties);
    console.log('[PostHog] Event captured successfully:', name);
  } catch (e: any) {
    console.error('[PostHog] capture error', e);
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

  console.log('[PostHog] identifyUser called:', id, traits);

  if (!isInitialized) {
    console.warn('[PostHog] Not initialized yet, initializing now...');
    initPosthog();
    setTimeout(() => {
      try {
        posthog.identify(id, traits);
        console.log('[PostHog] User identified after delayed init:', id);
      } catch (e: any) {
        console.error('[PostHog] identify error', e);
      }
    }, 100);
    return;
  }

  try {
    posthog.identify(id, traits);
    console.log('[PostHog] User identified successfully:', id);
  } catch (e: any) {
    console.error('[PostHog] identify error', e);
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
