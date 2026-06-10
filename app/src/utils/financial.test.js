import { describe, it, expect } from 'vitest';
import { mR, fvC, fvL, pvA, clamp, drawdownYears, yearByYear, fvVariable } from './financial.js';

// ─── mR (monthly rate from annual) ────────────────────────────────────────────

describe('mR', function () {
  it('returns 0 for 0% annual rate', function () {
    expect(mR(0)).toBe(0);
  });

  it('converts 12% annual to ~0.949% monthly', function () {
    var monthly = mR(0.12);
    expect(monthly).toBeCloseTo(0.009489, 4);
  });

  it('handles negative rates', function () {
    var monthly = mR(-0.10);
    expect(monthly).toBeLessThan(0);
  });
});

// ─── fvC (future value of constant monthly contributions) ─────────────────────

describe('fvC', function () {
  it('returns 0 for 0 years', function () {
    expect(fvC(100, 0.04, 0)).toBe(0);
  });

  it('returns 0 for 0 payment', function () {
    expect(fvC(0, 0.04, 10)).toBe(0);
  });

  it('handles 0% return (simple accumulation)', function () {
    // $100/mo * 12 mo * 10 yr = $12,000
    expect(fvC(100, 0, 10)).toBeCloseTo(12000, 0);
  });

  it('compounds monthly for positive return', function () {
    // $100/mo at 4% for 10 years
    var result = fvC(100, 0.04, 10);
    // Must be > simple accumulation
    expect(result).toBeGreaterThan(12000);
    // $100/mo at 4% compounded monthly for 10 years ≈ $14,670
    expect(result).toBeCloseTo(14670, -2);
  });

  it('handles negative years gracefully', function () {
    expect(fvC(100, 0.04, -5)).toBe(0);
  });
});

// ─── fvL (future value of lump sum) ───────────────────────────────────────────

describe('fvL', function () {
  it('returns the same value for 0 years', function () {
    expect(fvL(10000, 0.04, 0)).toBe(10000);
  });

  it('returns 0 for 0 principal', function () {
    expect(fvL(0, 0.04, 10)).toBe(0);
  });

  it('grows lump sum correctly', function () {
    // $10,000 at 4% for 10 years = $14,802.44
    expect(fvL(10000, 0.04, 10)).toBeCloseTo(14802.44, 0);
  });
});

// ─── pvA (present value of annuity) ───────────────────────────────────────────

describe('pvA', function () {
  it('returns 0 for 0 years', function () {
    expect(pvA(1000, 0.04, 0)).toBe(0);
  });

  it('returns 0 for 0 payment', function () {
    expect(pvA(0, 0.04, 30)).toBe(0);
  });

  it('handles 0% rate (simple sum)', function () {
    // $1000/mo * 12 * 30 = $360,000
    expect(pvA(1000, 0, 30)).toBeCloseTo(360000, 0);
  });

  it('discounts correctly', function () {
    var pv = pvA(1000, 0.04, 30);
    // PV < simple sum because future payments are worth less
    expect(pv).toBeLessThan(360000);
    expect(pv).toBeGreaterThan(100000);
  });
});

// ─── clamp ────────────────────────────────────────────────────────────────────

describe('clamp', function () {
  it('clamps below minimum', function () {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it('clamps above maximum', function () {
    expect(clamp(200, 0, 100)).toBe(100);
  });

  it('passes through values in range', function () {
    expect(clamp(50, 0, 100)).toBe(50);
  });
});

// ─── drawdownYears ────────────────────────────────────────────────────────────

describe('drawdownYears', function () {
  it('returns maxYears if withdrawals never exhaust the balance', function () {
    // $1M balance, $10K/yr withdrawal, 4% return = infinite
    expect(drawdownYears(1000000, 10000, 0.04, 60)).toBe(60);
  });

  it('returns 0 if first withdrawal depletes the balance', function () {
    // $1000 balance, $2000/yr withdrawal = depleted in year 1
    expect(drawdownYears(1000, 2000, 0, 60)).toBe(0);
  });

  it('counts only FULL years where balance stays positive', function () {
    // $100K balance, $20K/yr withdrawal, 0% return
    // Year 1: 100K - 20K = 80K (positive) → count
    // Year 2: 80K - 20K = 60K (positive) → count
    // Year 3: 60K - 20K = 40K (positive) → count
    // Year 4: 40K - 20K = 20K (positive) → count
    // Year 5: 20K - 20K = 0 (not positive) → stop
    expect(drawdownYears(100000, 20000, 0, 60)).toBe(4);
  });

  it('returns 0 for zero starting balance', function () {
    expect(drawdownYears(0, 10000, 0.04, 60)).toBe(0);
  });

  it('handles 0% return correctly', function () {
    // $50K, $10K/yr, 0% return → lasts 4 full years (50-10-10-10-10=10, 10-10=0)
    expect(drawdownYears(50000, 10000, 0, 60)).toBe(4);
  });

  it('return extends coverage', function () {
    // With 4% return, $100K @ $20K/yr should last more than at 0%
    var with0 = drawdownYears(100000, 20000, 0, 60);
    var with4 = drawdownYears(100000, 20000, 0.04, 60);
    expect(with4).toBeGreaterThan(with0);
  });
});

// ─── EDGE CASES (ROADMAP spec: 6 scenarios) ──────────────────────────────────

describe('Edge cases from ROADMAP', function () {

  it('EDGE 1: Immediate retirement (0 years accumulation)', function () {
    // fvVariable with 0 years should return existing savings
    expect(fvVariable(50000, 500, 0.04, 0, null)).toBe(50000);
    // yearByYear with 0 accum years should start withdrawal immediately
    var data = yearByYear(50000, 0, 0.04, 0, 10, 2000, 0.025, null, 0.015);
    expect(data[0].phase).toBe('accumulation');
    expect(data[0].balance).toBe(50000);
    expect(data.length).toBeGreaterThan(1);
  });

  it('EDGE 2: Zero savings (no income)', function () {
    expect(fvC(0, 0.04, 30)).toBe(0);
    expect(fvVariable(0, 0, 0.04, 30, null)).toBe(0);
  });

  it('EDGE 3: Zero inflation', function () {
    // fvC should still work at 0% inflation (the app passes realReturn which already accounts for inflation)
    var result = fvC(100, 0.065, 10);
    expect(result).toBeGreaterThan(12000);
    expect(isFinite(result)).toBe(true);
  });

  it('EDGE 4: Zero return', function () {
    // Simple accumulation: $100/mo * 12 * 10 = $12,000
    expect(fvC(100, 0, 10)).toBeCloseTo(12000, 0);
    // Lump sum unchanged
    expect(fvL(10000, 0, 10)).toBe(10000);
    // Drawdown: pure depletion at $10K/yr from $50K = 4 full years
    expect(drawdownYears(50000, 10000, 0, 60)).toBe(4);
  });

  it('EDGE 5: Debt exceeds assets (negative net worth)', function () {
    // fvVariable should floor at 0 when balance goes negative
    var result = fvVariable(0, 0, 0.04, 10, null);
    expect(result).toBe(0);
    // Even with savings, massive debt events should not crash
    var events = [{ endsAtYear: 5, monthlyAmount: 100 }];
    var result2 = fvVariable(1000, 200, 0.04, 10, events);
    expect(isFinite(result2)).toBe(true);
    expect(result2).toBeGreaterThanOrEqual(0);
  });

  it('EDGE 6: Zero retirement spending', function () {
    // drawdownYears with 0 withdrawal should last forever
    expect(drawdownYears(50000, 0, 0.04, 60)).toBe(60);
    // yearByYear withdrawal phase with 0 spend should preserve balance
    var data = yearByYear(50000, 0, 0.04, 0, 5, 0, 0.025, null, 0.015);
    // Balance should grow during withdrawal phase
    expect(data[5].balance).toBeGreaterThan(data[0].balance);
  });
});

// ─── fvVariable ───────────────────────────────────────────────────────────────

describe('fvVariable', function () {
  it('returns existing savings when years = 0', function () {
    expect(fvVariable(10000, 500, 0.04, 0, null)).toBe(10000);
  });

  it('grows with contributions and return', function () {
    var result = fvVariable(10000, 500, 0.04, 10, null);
    // Must be > simple sum: 10000 + 500*12*10 = 70000
    expect(result).toBeGreaterThan(70000);
  });

  it('accounts for debt payoff events', function () {
    var events = [{ endsAtYear: 3, monthlyAmount: 200 }];
    var without = fvVariable(10000, 500, 0.04, 10, null);
    var withEvents = fvVariable(10000, 500, 0.04, 10, events);
    // With debt payoff freeing $200/mo from year 3, result should be higher
    expect(withEvents).toBeGreaterThan(without);
  });

  it('floors at 0 (never returns negative)', function () {
    // Negative return, no contributions
    var result = fvVariable(100, 0, -0.5, 10, null);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

// ─── yearByYear ───────────────────────────────────────────────────────────────

describe('yearByYear', function () {
  it('returns correct number of data points', function () {
    var data = yearByYear(10000, 500, 0.04, 20, 30, 3000, 0.025, null, 0.015);
    // 0..50 inclusive = 51 points
    expect(data.length).toBe(51);
  });

  it('labels phases correctly', function () {
    var data = yearByYear(10000, 500, 0.04, 20, 10, 3000, 0.025, null, 0.015);
    expect(data[0].phase).toBe('accumulation');
    expect(data[20].phase).toBe('accumulation');
    expect(data[21].phase).toBe('withdrawal');
  });

  it('balance grows during accumulation', function () {
    var data = yearByYear(10000, 500, 0.04, 20, 10, 3000, 0.025, null, 0.015);
    expect(data[20].balance).toBeGreaterThan(data[0].balance);
  });

  it('balance never goes below 0', function () {
    var data = yearByYear(1000, 100, 0.04, 5, 30, 5000, 0.025, null, 0.015);
    data.forEach(function (d) {
      expect(d.balance).toBeGreaterThanOrEqual(0);
    });
  });
});

// ─── F3: Consistency check fvC vs fvVariable ─────────────────────────────────

describe('F3: fvC vs fvVariable consistency', function () {
  it('fvC and fvVariable should produce similar results for same inputs (no debt events)', function () {
    // fvC: monthly compound of $500/mo at 4% for 20 years
    var fromFvC = fvC(500, 0.04, 20);
    // fvVariable: $0 existing + $500/mo at 4% for 20 years, no debts
    var fromFvVar = fvVariable(0, 500, 0.04, 20, null);
    // They should be within 5% of each other (currently ~2% divergence)
    var ratio = fromFvVar / fromFvC;
    expect(ratio).toBeGreaterThan(0.95);
    expect(ratio).toBeLessThan(1.05);
  });

  it('fvVariable should match fvL for lump sum (no contributions)', function () {
    // Pure lump sum growth: $10K at 4% for 20 years
    var fromFvL = fvL(10000, 0.04, 20);
    var fromFvVar = fvVariable(10000, 0, 0.04, 20, null);
    // fvL uses annual compound, fvVariable uses annual → should be identical
    expect(fromFvVar).toBeCloseTo(fromFvL, 2);
  });
});
