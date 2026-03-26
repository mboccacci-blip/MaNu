# Competitive Analysis: Welfi & SmartAsset

Reference research for **Magic Number PRO** positioning and strategy.

---

## 1. SmartAsset (USA) — The Gold Standard for Lead Gen

| Metric | Value |
|---|---|
| **URL** | [smartasset.com](https://smartasset.com) |
| **Founded** | 2012, New York |
| **Valuation** | **$1B+** (unicorn since June 2021, Series D $110M) |
| **Total raised** | $161M+ across 8 rounds |
| **Monthly users** | ~59 million (Jan 2025) |
| **Revenue** | ~$100M ARR (2021 estimate, likely higher now) |
| **Acquisition** | Bought DeftSales (prospect engagement) in Apr 2023 |

### How They Make Money

SmartAsset's model is **exactly what we want to replicate**, adapted for our markets:

1. **Free tools attract massive traffic** — 20+ calculators (retirement, 401k, Social Security, taxes, mortgage, savings), all SEO-optimized. This is their **content moat**: they rank top 3 on Google for hundreds of high-intent financial queries.

2. **Advisor Marketing Platform (AMP)** — Launched March 2024. Advisors subscribe at **$2,000+/month** across tiers (Discover, Accelerate, Scale). Includes:
   - Pre-qualified phone + email referrals
   - Automated marketing campaigns
   - CRM integrations
   - Reporting dashboard

3. **Lead qualification** — Users complete a 25-30 question survey. SmartAsset's in-house concierge team validates contact info before passing leads to advisors. Average AUM per lead: **~$986K**.

4. **Historic pricing** — Before AMP subscription model, they charged **$25-$680 per lead** depending on investable assets.

5. **Results** — In 2024, helped advisors close **~$30B in new AUM**. One firm (Pure Financial Advisors) generated **$1B+ in new AUM** through SmartAsset alone.

### UX & Product Strategy

- **Clean, simple calculators** — Few inputs, instant results. No login required.
- **SEO-first** — Massive content library (guides, reviews, comparisons) + calculators. Each tool is a standalone landing page.
- **Soft CTA everywhere** — *"Do you need professional help? Speak with a financial advisor today"* appears on every page, never feels pushy.
- **Assumes you live to 95** — Simple, conservative assumptions. Calculates gap between projected savings and needed retirement income.
- **Free forever** — No paywall on any calculator. Revenue is 100% from the advisor side (B2B).

### Key Takeaway for Magic Number PRO

> [!IMPORTANT]
> SmartAsset proves that **financial calculators + advisor leads = billion-dollar business**. But they monetize **only from advisors (B2B)**. We have an advantage: **we also charge users (B2C + B2B)**, creating a dual revenue stream. Our Magic Number is also far more sophisticated than SmartAsset's basic retirement calculator.

---

## 2. Welfi (Argentina) — LATAM Fintech Reference

| Metric | Value |
|---|---|
| **URL** | [welfi.com.ar](https://welfi.com.ar) |
| **Founded** | 2021, Mendoza, Argentina |
| **Founders** | Tomás Ametla, Federico Robbio, Francisco Quirós |
| **Entity** | MAQCAPITALES S.A.S. — AAGI CNV Matrícula Nº 1305 |
| **Regulation** | CNV (Comisión Nacional de Valores) |
| **Model** | Robo-advisor / goal-based investing |

### How They Make Money

1. **Free account opening** — No maintenance fees, no transfer costs, no buy/sell commissions on stocks/CEDEARs.
2. **Annual admin fee** — 1% to 1.95% on CEDEAR/stock portfolios, depending on invested amount.
3. **Transaction fee** — 1% per transaction on ARGY bond/stock pack (no additional admin fee).
4. **Managed portfolios** — Automated, designed by their team. Revenue from spread on managed products.

### Product & UX

- **"Primer asesor financiero virtual de Argentina"** positioning
- **Onboarding quiz** — Financial health test + investor profile → personalized recommendations
- **Goal-based investing** — 9 portfolios across 4 products: Emergency Fund, Retirement Fund, Goal Investing, Thematic Investing
- **CEDEARs** — Invest in Apple, Tesla, Netflix, Google via Argentine market instruments
- **Dollar hedging** — MEP dollar instruments for peso devaluation protection
- **Welfi Pesos** — High-liquidity mutual fund investments in ARS
- **48-72 hour liquidity** on withdrawals
- **Educational content** integrated into the experience

### Key Takeaway for Magic Number PRO

> [!IMPORTANT]
> Welfi validates that **LATAM users want financial planning tools with local context** (inflation hedging, local regulations, goal-based approach). But Welfi is a **broker** (they hold and manage money). We are a **planning + education + lead-gen tool** — much lighter, cheaper to operate, no regulatory burden of handling money. This is a major advantage.

---

## 3. Strategic Comparison Matrix

| Dimension | SmartAsset | Welfi | Magic Number PRO |
|---|---|---|---|
| **Revenue model** | 100% B2B (advisor leads) | B2C (fees on assets) | **Hybrid: B2C ($20-$50 paywall) + B2B (advisor leads)** |
| **User pays?** | Never | Commissions on investments | **One-time payment** |
| **Regulatory burden** | None (info only) | Heavy (CNV, handles money) | **None (info only)** |
| **Infrastructure cost** | High (massive content, servers) | Medium (broker infra) | **Very low (Cloudflare Pages)** |
| **Depth of analysis** | Basic (5-6 inputs) | Moderate (quiz + allocation) | **Deep (7 core inputs + 15 expense categories + debts + portfolio builder + Monte Carlo)** |
| **Localization** | English only | Spanish (Argentina) only | **English + Spanish (multi-market)** |
| **Lead quality** | High (avg $986K AUM/lead) | N/A (they are the advisor) | **High potential (Score + Magic Number + gap = gold for advisors)** |
| **Exit potential** | $1B+ achieved | Regional player | **Acquirable by fintech, banks, or financial media** |

---

## 4. What We Steal (Strategically) From Each

### From SmartAsset:
1. **SEO calculator strategy** — Build 3-5 standalone mini-calculators as landing pages (opportunity cost, retirement age estimator, savings rate calculator). Each one = SEO magnet.
2. **Soft CTA pattern** — *"Tu situación financiera es única. Un asesor certificado puede ayudarte"* — not pushy, just present.
3. **Lead qualification data** — Our Score (0-100), Magic Number gap, savings rate, debt load = **better lead data than SmartAsset's 25-question survey**, because the user self-discovers it through our tool.
4. **Advisor subscription model** — Start with CPA ($50-$150/lead), evolve to monthly subscription as volume grows.

### From Welfi:
1. **Goal-based framing** — The "inversión por objetivos" concept maps perfectly to our Intermediate Goals tab. Latin American users respond to goal-based narratives.
2. **Local context** — Inflation hedging language, pension system awareness, peso/dollar dynamics. Our Spanish version must speak LATAM, not just translate English.
3. **Onboarding quiz** — Their financial health test → profile → personalized recommendation flow is exactly what our Score tab should become in the funnel. **Free quiz → score → paywall → full analysis.**
4. **Trust signals** — Even though we don't handle money, showing security/trust badges (SSL, data privacy, advisor certifications) is critical for LATAM adoption.

---

## 5. Competitive Positioning Statement

> **Magic Number PRO** is the **SmartAsset of Latin America and the Hispanic world** — but smarter. While SmartAsset gives you a basic retirement number for free and sells your data to advisors, and Welfi manages your money with annual fees, **Magic Number PRO gives you the deepest, most honest financial clarity in 10 minutes, then connects you to the right professional.** We charge the user a small one-time fee for premium insights because **our analysis is worth it**, and we connect high-intent users to certified advisors because **both sides benefit**.

---

## 6. Pricing Insight from Competitors

| Platform | User cost | Advisor cost |
|---|---|---|
| SmartAsset | **$0** (always free) | $25-$680/lead → now $2K+/mo subscription |
| Welfi | **0% opening** + 1-1.95% annual fee on assets | N/A |
| Magic Number PRO | **$19.99** (Unlock) / **$49.99** (PRO Report) | **$50-$150/lead CPA** → evolve to subscription |

> [!TIP]
> Our $19.99 price is validated: if SmartAsset can charge advisors $680/lead and Welfi charges up to 1.95%/year on assets, a $20 one-time fee for the user is a no-brainer value proposition — especially since our analysis is significantly deeper than SmartAsset's free calculator.
