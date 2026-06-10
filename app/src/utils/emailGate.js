/**
 * MaNu PRO — Email Gate Helper
 *
 * Centralized email-gate logic: validates email, inserts a lead into the
 * `leads` table (with error handling + retry), and tracks the analytics event.
 * Replaces duplicated inline blocks in AchieveTab and InactionTab.
 */

import { submitLead } from '../lib/supabase.js';
import { track, EVENTS } from './analytics.js';

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Submit an email gate entry.
 * @param {Object} params
 * @param {string} params.email - User email
 * @param {string} params.lang - Current language
 * @param {string} params.tier - Current tier
 * @param {string} params.tab - Source tab
 * @param {Object} params.engine - Financial engine results (for lead snapshot)
 * @param {Object} params.store - Store fields needed for lead snapshot
 * @returns {{ success: boolean, error?: string }}
 */
export async function submitEmailGate(params) {
  var email = (params.email || '').trim();
  var lang = params.lang || 'es';

  // 1. Validate
  if (!EMAIL_RE.test(email)) {
    return {
      success: false,
      error: lang === 'en' ? 'Enter a valid email' : 'Ingresá un email válido',
    };
  }

  // 2. Build financial snapshot for leads table
  var engine = params.engine || {};
  var store = params.store || {};
  var financials = {
    age: engine.nAge || null,
    retirementAge: engine.nRetAge || null,
    yearsInRetirement: engine.nYP || null,
    monthlyIncome: engine.totalIncome || null,
    monthlyExpenses: engine.totExp || null,
    monthlySavings: engine.mSav,
    savingsRate: engine.savRate || null,
    currentSavings: engine.nEx || null,
    totalDebt: store.noDebts ? 0 : (engine.totalDebtAll || null),
    magicNumber: engine.magic ? engine.magic.real || null : null,
    mnProgressPct: engine.mD ? engine.mD.p || null : null,
    healthScore: engine.hScore ? engine.hScore.s || null : null,
    desiredIncome: engine.nDes || null,
    socialSecurity: engine.nSS || null,
    legacyAmount: engine.nLegacy || null,
    investmentProfile: engine.retProfLabel || null,
    tier: params.tier || 'free',
    sourceTab: params.tab || null,
    lang: lang,
  };

  // 3. Insert into leads table (with one retry)
  var result = await submitLead({ email: email }, financials);
  if (!result.success) {
    // Retry once
    result = await submitLead({ email: email }, financials);
  }

  // 4. Track analytics event (complementary — fire-and-forget is OK for analytics)
  track(EVENTS.EMAIL_SUBMITTED, { email: email }, { lang: lang, tier: params.tier || 'free' });

  // 5. Track tier change
  track(EVENTS.TIER_CHANGED, { from: params.tier, to: 'email' }, { lang: lang, tier: 'email' });

  if (!result.success) {
    return {
      success: false,
      error: lang === 'en'
        ? 'Could not save your email. Please try again.'
        : 'No pudimos guardar tu email. Intentá de nuevo.',
    };
  }

  return { success: true };
}
