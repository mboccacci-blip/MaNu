/**
 * MaNu PRO — Analytics Module (Supabase-backed)
 * 
 * Tracks user events to the `analytics_events` table in Supabase.
 * Falls back to console logging in dev mode if Supabase is not configured.
 * 
 * Usage:
 *   import { track, pageView, EVENTS } from './utils/analytics.js';
 *   track(EVENTS.TAB_VIEWED, { tab: 'retirement' });
 */

import { supabase } from '../lib/supabase.js';

const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.DEV
  : false;

// Simple session ID — persists per browser tab
const SESSION_ID = 'manu_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);

// ── Internal queue (batch events to reduce DB calls) ────────────────
let eventQueue = [];
let flushTimer = null;
const FLUSH_INTERVAL = 5000; // flush every 5 seconds
const MAX_QUEUE = 20;        // or when queue hits 20 events

async function flush() {
  if (eventQueue.length === 0) return;
  
  const batch = eventQueue.splice(0);
  
  if (!supabase) {
    if (IS_DEV) {
      batch.forEach(function(e) {
        console.log('[MaNu Analytics]', e.event, e.props || '');
      });
    }
    return;
  }

  try {
    await supabase.from('analytics_events').insert(batch);
  } catch (e) {
    if (IS_DEV) console.warn('[MaNu Analytics] flush error:', e.message);
    // Don't re-queue — analytics should never block the app
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(function() {
    flushTimer = null;
    flush();
  }, FLUSH_INTERVAL);
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('beforeunload', flush);
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Track a named event with optional properties.
 * Events are batched and sent every 5s to minimize DB calls.
 * @param {string} event - Event name (use EVENTS constants)
 * @param {Object} [props] - Event properties
 * @param {Object} [context] - { lang, tier } from app state
 */
export function track(event, props, context) {
  var ctx = context || {};
  eventQueue.push({
    event: event,
    props: props || {},
    session_id: SESSION_ID,
    lang: ctx.lang || 'es',
    tier: ctx.tier || 'free',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    referrer: typeof document !== 'undefined' ? (document.referrer || null) : null,
  });

  if (eventQueue.length >= MAX_QUEUE) {
    flush();
  } else {
    scheduleFlush();
  }
}

/**
 * Record a page view.
 * @param {string} [path] - Optional path override
 * @param {Object} [context] - { lang, tier }
 */
export function pageView(path, context) {
  track('page_view', { path: path || (typeof window !== 'undefined' ? window.location.pathname : '/') }, context);
}

/**
 * Identify a user (for future auth integration).
 * @param {string} userId
 * @param {Object} [traits]
 */
export function identify(userId, traits) {
  track('identify', { user_id: userId, ...traits });
}

/**
 * Reset identification (e.g. on logout).
 */
export function reset() {
  // No-op for now, will be needed when auth is added
}

// ── Predefined Event Names ──────────────────────────────────────────
export const EVENTS = {
  PAGE_VIEW:              'page_view',
  TAB_VIEWED:             'tab_viewed',
  MAGIC_NUMBER_CALCULATED:'magic_number_calculated',
  LANGUAGE_CHANGED:       'language_changed',
  CTA_CLICKED:            'cta_clicked',
  DEMO_MODE_ENTERED:      'demo_mode_entered',
  DATA_CLEARED:           'data_cleared',
  LANDING_ENTERED_APP:    'landing_entered_app',
  PAYWALL_VIEWED:         'paywall_viewed',
  ADVISOR_CTA_CLICKED:    'advisor_cta_clicked',
  LEAD_SUBMITTED:         'lead_submitted',
  SCORE_VIEWED:           'score_viewed',
  EMAIL_SUBMITTED:        'email_submitted',
  TIER_CHANGED:           'tier_changed',
  SIMULATOR_INTERACTION:  'simulator_interaction',
};
