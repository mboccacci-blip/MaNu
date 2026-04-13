import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Submit a lead to Supabase with the user's financial profile snapshot.
 * @param {Object} contact - { name, email, phone }
 * @param {Object} financials - Financial data snapshot from app state
 * @returns {Object} { success: boolean, error?: string }
 */
export async function submitLead(contact, financials) {
  if (!supabase) {
    console.warn('[MaNu] Supabase not configured — lead not saved');
    return { success: false, error: 'Supabase not configured' };
  }

  const lead = {
    // Contact
    name: contact.name || null,
    email: contact.email,
    phone: contact.phone || null,
    // Demographics
    age: financials.age || null,
    retirement_age: financials.retirementAge || null,
    years_in_retirement: financials.yearsInRetirement || null,
    // Income & Expenses
    monthly_income: financials.monthlyIncome || null,
    monthly_expenses: financials.monthlyExpenses || null,
    monthly_savings: financials.monthlySavings || null,
    savings_rate: financials.savingsRate || null,
    // Assets & Debts
    current_savings: financials.currentSavings || null,
    total_debt: financials.totalDebt || null,
    // Magic Number
    magic_number: financials.magicNumber || null,
    mn_progress_pct: financials.mnProgressPct || null,
    health_score: financials.healthScore || null,
    desired_income: financials.desiredIncome || null,
    social_security: financials.socialSecurity || null,
    legacy_amount: financials.legacyAmount || null,
    // Investment context
    investment_profile: financials.investmentProfile || null,
    // App context
    tier: financials.tier || 'free',
    source_tab: financials.sourceTab || null,
    lang: financials.lang || 'es',
    // Technical
    user_agent: navigator.userAgent,
    referrer: document.referrer || null,
  };

  const { error } = await supabase.from('leads').insert([lead]);

  if (error) {
    console.error('[MaNu] Lead submission error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
