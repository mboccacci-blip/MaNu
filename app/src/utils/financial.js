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

/** Simulate retirement drawdown: how many years does startBalance last?
 *  Returns number of FULL years of coverage (capped at maxYears).
 *  A year is only counted if the balance remains positive after withdrawal. */
export function drawdownYears(startBalance, annualWithdraw, returnRate, maxYears) {
  var bal = startBalance, yrs = 0;
  while (yrs < maxYears) {
    bal = bal * (1 + returnRate) - annualWithdraw;
    if (bal <= 0) break;
    yrs++;
  }
  if (bal > 0) yrs = maxYears;
  return yrs;
}

/** Clamp value between min and max */
export function clamp(v, mn, mx) {
  return Math.max(mn, Math.min(mx, v));
}

/** Year-by-year projection with accumulation and withdrawal phases.
 *  Uses monthly compounding for contributions/withdrawals (consistent with fvC). */
export function yearByYear(existingSavings, baseMonthlySav, accumReturn, yearsAccum, yearsRetire, monthlySpend, inflation, debtEvents, retireReturn) {
  var rRet = retireReturn != null ? retireReturn : accumReturn;
  var mAccum = mR(accumReturn);
  var mRet = mR(rRet);
  var data = [];
  var bal = existingSavings;
  for (var y = 0; y <= yearsAccum + yearsRetire; y++) {
    data.push({ year: y, balance: Math.max(bal, 0), phase: y <= yearsAccum ? "accumulation" : "withdrawal" });
    if (y < yearsAccum) {
      var extraSav = 0;
      if (debtEvents) {
        debtEvents.forEach(function(ev) { if (y >= ev.endsAtYear) extraSav += ev.monthlyAmount; });
      }
      var moSav = baseMonthlySav + extraSav;
      for (var mo = 0; mo < 12; mo++) {
        bal = bal * (1 + mAccum) + moSav;
      }
    } else {
      for (var mo = 0; mo < 12; mo++) {
        bal = bal * (1 + mRet) - monthlySpend;
      }
    }
    if (bal < 0) bal = 0;
  }
  return data;
}

/** Future value with variable contributions (accounts for debt payoff events).
 *  Uses monthly compounding (consistent with fvC). */
export function fvVariable(existingSavings, baseMonthlySav, realReturn, years, debtEvents) {
  var bal = existingSavings;
  var m = mR(realReturn);
  for (var y = 0; y < years; y++) {
    var extraSav = 0;
    if (debtEvents) {
      debtEvents.forEach(function(ev) { if (y >= ev.endsAtYear) extraSav += ev.monthlyAmount; });
    }
    var moSav = baseMonthlySav + extraSav;
    for (var mo = 0; mo < 12; mo++) {
      bal = bal * (1 + m) + moSav;
    }
    if (bal < 0) bal = 0;
  }
  return bal;
}
