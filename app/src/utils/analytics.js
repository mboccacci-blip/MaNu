/**
 * MaNu PRO — Analytics Module (Stub)
 * 
 * Ready for PostHog integration. Activate by setting VITE_POSTHOG_KEY
 * in your environment variables or Netlify deploy settings.
 * 
 * When no key is present:
 *   - Development: logs events to console
 *   - Production: silent no-op
 * 
 * Usage:
 *   import { track, pageView } from './utils/analytics.js';
 *   track('tab_viewed', { tab: 'retirement' });
 */

const POSTHOG_KEY = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_POSTHOG_KEY || ''
  : '';

const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.DEV
  : false;

let posthogInstance = null;
let initialized = false;

/**
 * Initialize PostHog (lazy, only when key exists)
 */
async function init() {
  if (initialized) return;
  initialized = true;

  if (!POSTHOG_KEY) {
    if (IS_DEV) console.log('[MaNu Analytics] No VITE_POSTHOG_KEY — running in stub mode');
    return;
  }

  try {
    const posthog = await import('posthog-js');
    posthogInstance = posthog.default || posthog;
    posthogInstance.init(POSTHOG_KEY, {
      api_host: 'https://us.i.posthog.com',
      autocapture: false,          // We define our own events
      capture_pageview: false,     // We call pageView() manually
      persistence: 'localStorage',
      loaded: function (ph) {
        if (IS_DEV) console.log('[MaNu Analytics] PostHog initialized');
        // Respect Do Not Track
        if (navigator.doNotTrack === '1') {
          ph.opt_out_capturing();
        }
      },
    });
  } catch (e) {
    if (IS_DEV) console.warn('[MaNu Analytics] PostHog import failed:', e.message);
  }
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Track a named event with optional properties.
 * @param {string} event - Event name (e.g. 'tab_viewed')
 * @param {Object} [props] - Event properties
 */
export function track(event, props) {
  if (posthogInstance) {
    posthogInstance.capture(event, props);
  } else if (IS_DEV && POSTHOG_KEY === '') {
    console.log(`[MaNu Analytics] track("${event}")`, props || '');
  }
}

/**
 * Record a page view.
 * @param {string} [path] - Optional path override
 */
export function pageView(path) {
  if (posthogInstance) {
    posthogInstance.capture('$pageview', { path: path || window.location.pathname });
  } else if (IS_DEV) {
    console.log('[MaNu Analytics] pageView:', path || window.location.pathname);
  }
}

/**
 * Identify a user (for future auth integration).
 * @param {string} userId
 * @param {Object} [traits]
 */
export function identify(userId, traits) {
  if (posthogInstance) {
    posthogInstance.identify(userId, traits);
  } else if (IS_DEV) {
    console.log('[MaNu Analytics] identify:', userId, traits || '');
  }
}

/**
 * Reset identification (e.g. on logout).
 */
export function reset() {
  if (posthogInstance) {
    posthogInstance.reset();
  }
}

// ── Predefined Event Names ──────────────────────────────────────────
// Use these constants for consistency across the app:
export const EVENTS = {
  TAB_VIEWED:             'tab_viewed',
  MAGIC_NUMBER_REVEALED:  'magic_number_revealed',
  LANGUAGE_CHANGED:       'language_changed',
  CTA_CLICKED:            'cta_clicked',
  DEMO_MODE_ENTERED:      'demo_mode_entered',
  DATA_CLEARED:           'data_cleared',
  LANDING_ENTERED_APP:    'landing_entered_app',
  PAYWALL_VIEWED:         'paywall_viewed',
  ADVISOR_CTA_CLICKED:    'advisor_cta_clicked',
  SCORE_VIEWED:           'score_viewed',
};

// Auto-initialize on import
init();
