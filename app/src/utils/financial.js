import { PROFILES } from '../constants.js';

/** Monthly rate from annual rate */
export function mR(r) {
  return r === 0 ? 0 : Math.pow(1 + r, 1 / 12) - 1;
}

/** Future value of constant monthly contributions */
export function fvC(pmt, r, y) {
  if (y <= 0 || pmt === 0) return 0;
  if (r === 0) return pmt * y * 12;
  var m = mR(r), n = y * 12;
  return pmt * ((Math.pow(1 + m, n) - 1) / m);
}

/** Future value of a lump sum */
export function fvL(pv, r, y) {
  if (pv === 0) return 0;
  if (y <= 0) return pv;
  return pv * Math.pow(1 + r, y);
}

/** Present value of an annuity */
export function pvA(pmt, r, y) {
  if (y <= 0 || pmt === 0) return 0;
  if (r === 0) return pmt * y * 12;
  var m = mR(r), n = y * 12;
  return pmt * ((1 - Math.pow(1 + m, -n)) / m);
}

/** Get benchmark bracket for age */
export function gB(d, a) {
  return d.find(function(b) { return a >= b.minAge && a <= b.maxAge; }) || d[0];
}

/** Suggest profile based on investment horizon */
export function profByHorizon(y) {
  if (y < 1) return PROFILES[0];
  if (y < 2) return PROFILES[1];
  if (y < 3) return PROFILES[3];
  if (y < 5) return PROFILES[4];
  if (y < 10) return PROFILES[5];
  return PROFILES[6];
}

/** Clamp value between min and max */
export function clamp(v, mn, mx) {
  return Math.max(mn, Math.min(mx, v));
}

/** Year-by-year projection with accumulation and withdrawal phases */
export function yearByYear(existingSavings, baseMonthlySav, accumReturn, yearsAccum, yearsRetire, monthlySpend, inflation, debtEvents, retireReturn) {
  var rRet = retireReturn != null ? retireReturn : accumReturn;
  var data = [];
  var bal = existingSavings;
  for (var y = 0; y <= yearsAccum + yearsRetire; y++) {
    data.push({ year: y, balance: Math.max(bal, 0), phase: y <= yearsAccum ? "accumulation" : "withdrawal" });
    if (y < yearsAccum) {
      var extraSav = 0;
      if (debtEvents) {
        debtEvents.forEach(function(ev) { if (y >= ev.endsAtYear) extraSav += ev.monthlyAmount; });
      }
      bal = bal * (1 + accumReturn) + (baseMonthlySav + extraSav) * 12;
    } else {
      bal = bal * (1 + rRet) - monthlySpend * 12;
    }
    if (bal < 0) bal = 0;
  }
  return data;
}

/** Future value with variable contributions (accounts for debt payoff events) */
export function fvVariable(existingSavings, baseMonthlySav, realReturn, years, debtEvents) {
  var bal = existingSavings;
  for (var y = 0; y < years; y++) {
    var extraSav = 0;
    if (debtEvents) {
      debtEvents.forEach(function(ev) { if (y >= ev.endsAtYear) extraSav += ev.monthlyAmount; });
    }
    bal = bal * (1 + realReturn) + (baseMonthlySav + extraSav) * 12;
    if (bal < 0) bal = 0;
  }
  return bal;
}
