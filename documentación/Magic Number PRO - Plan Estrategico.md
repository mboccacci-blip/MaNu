# Magic Number PRO — Strategic Plan v2

## The Core Thesis: The Emotional Trigger

Magic Number PRO is **not a platform, not a broker, not a robo-advisor.** It is a **revelation moment** — the 10 minutes that change how someone thinks about their financial future forever.

The app's sole purpose is to create a single emotional and intellectual chain reaction:

```
Curiosity → Reality Check → Urgency → Hope + Complexity → "I need professional help"
```

### The 5-Step Emotional Journey

| Step | User feels | What the app shows | Result |
|---|---|---|---|
| 1. **Curiosity** | *"¿Cuánto necesito?"* | Simple entry: age, income, savings, desired retirement spend | Engagement |
| 2. **Reality Check** | 😳 *"Estoy lejos..."* | Magic Number revealed (e.g., $1.2M needed, $45K saved) | Paywall conversion |
| 3. **Urgency** | 😰 *"Estoy en zona roja"* | Score 0-100, gap analysis, emergency fund status | Emotional lock-in |
| 4. **Hope + Complexity** | 💡 *"Hay opciones, pero es complejo"* | 3-lever simulator, investment profiles, debt events, Year-by-Year chart | Self-education |
| 5. **Action** | 🎯 *"Necesito ayuda profesional"* | Advisor CTA — organic, not forced | **High-intent lead** |

> [!IMPORTANT]
> **This is NOT a SmartAsset-style cold lead.** SmartAsset throws 3 advisors at someone who barely filled out a calculator. Our lead arrives saying: *"My Magic Number is $800K, I have $120K, my Score is 45, and I know I need 60/40 but don't know how to start."* That lead is worth **10x more.**

---

## Monetization Architecture

### Revenue Stream 1: User Payments (B2C)

**Tier 1 — Unlock ($19.99 one-time)**

The paywall sits at the moment of **maximum emotional tension**: the user has entered their data, the app says *"Tu Magic Number está listo"* — but it's blurred.

| Free (The Hook) | Paid — Unlock |
|---|---|
| Age, income, savings inputs | ✅ **The actual Magic Number** |
| Teaser range ("Yellow Zone") | ✅ Exact Score (0-100) |
| 2-3 Learn modules | ✅ Full gap analysis + 3-lever simulator |
| Basic gap indicator | ✅ All 15 expense categories + income override |
| | ✅ Investment profiles + projections |
| | ✅ Year-by-Year chart |
| | ✅ Opportunity Cost, Save More?, Earn tabs |
| | ✅ Emergency Fund analysis |
| | ✅ Basic Financial Snapshot (copyable) |

**Tier 2 — PRO Report ($49.99 one-time)**

| Feature |
|---|
| ✅ Everything in Unlock |
| ✅ **Branded PDF Financial Snapshot** |
| ✅ Custom Portfolio builder (blended returns) |
| ✅ Monte Carlo simulation |
| ✅ Couple Mode |
| ✅ Debt optimizer (avalanche/snowball) |
| ✅ "Modo Convénceme" (shareable partner report) |
| ✅ Detailed Social Security / pension input |
| ✅ **Priority CTA: "Hablá con un asesor certificado →"** |

### Revenue Stream 2: Advisor Leads (B2B) — The Primary Engine

**Why our leads are premium:**

| SmartAsset lead | Magic Number PRO lead |
|---|---|
| Filled a basic 5-field calculator | Completed deep 7-input analysis + expenses + debts + portfolio |
| Got 3 advisors thrown at them | **Chose** to contact an advisor |
| Cold — wasn't really looking for help | Hot — **self-discovered** they need help |
| Data: name, email, rough assets | Data: **Score, Magic Number, gap, savings rate, debt load, investment profile, emergency fund months** |

**Advisor pricing (phased):**

| Phase | Model | Price |
|---|---|---|
| Launch (0-500 leads/mo) | CPA (pay per lead) | $75-$200/lead |
| Scale (500+ leads/mo) | Monthly subscription + CPA | $500-$2K/mo + lower CPA |
| Mature | SmartAsset-style AMP | Tiered subs $1K-$5K/mo |

### Revenue Stream 3: Exit (Long-term)

Build clean metrics → acquisition by fintech (NuBank, SoFi, Betterment), bank (BBVA, Santander), or financial media (NerdWallet, Investopedia).

---

## Go-To-Market: The Trigger Funnel

### Channel Strategy

The funnel matches the emotional journey — each channel targets a step:

| Channel | Purpose | Content type | Step targeted |
|---|---|---|---|
| **TikTok / Reels / Shorts** | Create curiosity | *"¿A qué edad te jubilás con $5K/mes?"* | Step 1: Curiosity |
| **SEO mini-calculators** | Capture high-intent search traffic | Standalone Opportunity Cost, Retirement Age tools | Step 1-2 |
| **The app itself** | Convert curiosity → paid user → lead | Full Magic Number experience | Steps 2-5 |
| **Email post-purchase** | Nurture, upsell Tier 2, surface advisor CTA | *"Tu Score mejoró 5 puntos este mes"* | Step 4-5 |
| **Advisor network** | Monetize the lead | Certified advisors by region | Step 5 |

### Phase 1 — Validate (Months 1-3)
- Launch English version on Cloudflare Pages
- 30 short-form videos on TikTok/Reels
- Stripe integration ($19.99 / $49.99)
- Recruit 5 pilot advisors via cold outreach (CFPs in USA, registered advisors in LATAM/Spain)
- Target: 1K free users, 50 paid, 10 leads

### Phase 2 — Scale (Months 4-8)
- Spanish version (LATAM + Spain)
- SEO mini-calculators (3-5 standalone pages)
- Paid ads testing ($500-$1K/mo)
- Advisor network: 20+ across USA, LATAM, Spain
- Target: 10K free users, 500 paid, 100+ leads/mo

### Phase 3 — Dominate (Months 9-18)
- White-label for advisor firms
- Localization (PT-BR, FR, DE)
- PWA → native app wrapper
- Build acquisition data room
- Target: 100K+ users, $50K+/mo revenue

---

## Product Roadmap

### Sprint 1-2 (Immediate)
1. **Paywall UX** — Blurred Magic Number + emotional CTA
2. **Stripe Checkout** — Tier 1 ($19.99) + Tier 2 ($49.99)
3. **Simple auth** — Email magic link or Google OAuth
4. **Analytics** — PostHog/Mixpanel for funnel tracking

### Sprint 3-4
5. **Spanish localization** (i18n framework)
6. **Advisor CTA flow** — Lead form + CRM (Airtable/HubSpot free)
7. **PDF Report** (Tier 2)
8. **SEO mini-calculators** (3 standalone landing pages)

### Sprint 5-8
9. Monte Carlo simulation
10. Couple Mode
11. Modularize codebase (Vite + components)
12. Advisor dashboard portal

---

## Technical Architecture (Light)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Vite + React | SEO, splitting, scale |
| Auth | Clerk / Supabase Auth | Fast, cheap |
| Payments | Stripe Checkout | Global, standard |
| DB | Supabase (Postgres) | Free tier, persistence |
| Analytics | PostHog | Generous free tier |
| CRM | Airtable → HubSpot | Lead management |
| PDF | @react-pdf/renderer | Client-side, free |
| i18n | react-i18next | Standard |
| Hosting | Cloudflare Pages + Workers | Near-zero cost |

---

## Advisor Network: External Recruitment Strategy

The advisor network is built 100% externally, in 3 phases:

| Phase | Strategy | Target |
|---|---|---|
| **Pilot** | Cold outreach to certified advisors (CFPs, CNV-registered, EAFs). Offer free/discounted leads in exchange for feedback. | 5-10 advisors |
| **Growth** | CPA model ($75-$200/lead). Recruit via LinkedIn, advisor forums, fintech events. | 20-50 advisors |
| **Platform** | Self-service portal (AMP-style). Advisors subscribe directly. | 100+ advisors |

---

## Pending Decisions

> [!IMPORTANT]
> 1. **¿$19.99 y $49.99 funcionan como precios, o preferís otros montos?**
> 2. **¿Primera prioridad de build: paywall + pagos, o localización al español?**
> 3. **¿Dominio? ¿Ya tienen magicnumber.app o similar, o hay que buscar?**
