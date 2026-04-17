# MaNu PRO — Roadmap (Actualizado 17-Abr-2026)

## Estado Actual — Snapshot

| Dimension | Score | Notas |
|-----------|:-----:|-------|
| Motor Financiero | 9/10 | Extraido, 354 lineas, robusto |
| UX/UI | 9/10 | Estable, responsive |
| Landing Page | 9.5/10 | Reescrita: freemium-honest |
| i18n (EN/ES) | 9/10 | 400+ keys, ambos idiomas completos |
| Arquitectura | **10/10** | Monolito desmontado: 16 tabs + 15 componentes |
| Analytics | 8/10 | 4 eventos Supabase, live en produccion |
| Lead Capture | 9/10 | Supabase live, 2 leads test verificados |
| AdvisorCTA | 10/10 | Self-contained, presente en los 16 tabs |
| Auth / Payments | 0/10 | No iniciado (pendiente D2) |
| PDF / Email | 0/10 | BLOQUEANTE — siguiente sprint |
| Tests | 0/10 | 6 edge cases definidos, no escritos |
| Trust Layer (Legal) | 3/10 | Disclaimer en footer, T&C pendiente D2 |

**HEAD commit:** `2d8b5db` — AdvisorCTA global (16 tabs)
**Produccion:** https://magic-number.app | https://master.manu-pro.pages.dev/
**Revenue:** $0 | **Users:** 0 (pre-launch) | **Leads:** 2 (test) | **Analytics:** live

---

## Arquitectura Actual (17-Abr-2026)

```
app/src/
├── MagicNumberAppMain.jsx      # Orchestrator — 277 lineas (era 2,194)
├── LandingPage.jsx             # Landing — 19KB, freemium-honest
├── main.jsx                    # Entry point con ErrorBoundary
├── index.jsx
├── constants.js                # TABS, PROFILES, colores (Phosphor icons)
├── components/ (15 archivos)
│   ├── AdvisorCTA.jsx          # Self-contained: store + tracking internos
│   ├── LeadCaptureModal.jsx    # Supabase submit + financial preview
│   ├── AnimatedNumber.jsx
│   ├── Card.jsx
│   ├── Gauge.jsx
│   ├── Icon.jsx                # 24 iconos Phosphor mapeados
│   ├── MiniChart.jsx
│   ├── MultiLineChart.jsx
│   ├── NavButtons.jsx
│   ├── NumberInput.jsx
│   ├── SectionTitle.jsx
│   ├── Slider.jsx
│   ├── TabButton.jsx
│   ├── Tip.jsx
│   └── Toggle.jsx
├── hooks/
│   ├── useFinancialEngine.js   # Motor financiero — 354 lineas
│   └── usePersistedState.js    # Helper localStorage
├── i18n/
│   ├── en.js                   # 400+ keys ingles
│   └── es.js                   # 400+ keys espanol
├── lib/
│   └── supabase.js             # Client + submitLead()
├── store/
│   └── useAppStore.js          # Zustand + persist + merge() sanitizer — 250 lineas
├── tabs/ (16 archivos)
│   ├── AchieveTab.jsx          # 41KB — tab principal MN (complejo)
│   ├── AssumptionsTab.jsx
│   ├── CostTab.jsx
│   ├── DashboardTab.jsx
│   ├── DebtsTab.jsx
│   ├── EarnTab.jsx
│   ├── GoalsTab.jsx
│   ├── InactionTab.jsx         # 15KB — tab inaccion
│   ├── InvestTab.jsx
│   ├── LearnTab.jsx
│   ├── PortfolioTab.jsx
│   ├── ReportsTab.jsx
│   ├── RetirementTab.jsx
│   ├── SaveTab.jsx
│   ├── ScoreTab.jsx
│   └── SituationTab.jsx
└── utils/
    ├── analytics.js            # Supabase-backed, batching 5s/20 eventos
    ├── financial.js            # Funciones puras testeables
    └── formatters.js
```

---

## Proximas Fases

### Sprint Inmediato — PDF + Email (BLOQUEANTE B2C)

> Este sprint desbloquea el revenue B2C ($14.99 "Fotografia Financiera").

**PDF Generation**
- Instalar `@react-pdf/renderer`
- Template: Magic Number, Score, YbY projection, perfil de inversion
- Trigger desde tab Reports (tier paid/email)
- PDF local — sin servidor, costo $0

**Email Delivery**
- Resend account + dominio magic-number.app
- Supabase Edge Function: snapshot → PDF → Resend
- Trigger post-submit en LeadCaptureModal (tier Email)
- Template bilingue (EN/ES)

---

### Sprint Calidad — Tests (Pre-launch)

- Vitest para `financial.js`
- 6 edge cases definidos:
  1. Jubilacion inmediata
  2. Ahorro = 0
  3. Inflacion = 0%
  4. Retorno = 0%
  5. Deuda > activos
  6. Gastos en retiro = 0

---

### Fase 4 — Monetizacion (post-PDF)

> **Prerequisito:** Decision D2 (estructura juridica) para activar Stripe.

- Supabase Auth (magic link + Google)
- Stripe Checkout: $14.99 one-time
- Paywall backend-validated
- Privacy Policy + T&C

---

### Fase 5 — GTM (ongoing)

- Secuencia: 3 contratos B2B PRIMERO, luego trafico B2C
- Contenido TikTok/Reels/Shorts
- SEO: mini-calculadoras standalone, schema.org FinancialCalculator
- Red de asesores: 5 piloto, $75-$150/lead

---

## Infraestructura

| Servicio | Detalle | Costo |
|----------|---------|:-----:|
| **Cloudflare Pages** | Hosting + deploys (migrado desde Netlify) | $0 |
| **Supabase** | DB: `leads` (26 cols) + `analytics_events` (9 cols) | $0 |
| **GitHub** | Repo `mboccacci-blip/MaNu` | $0 |
| **Dominio** | magic-number.app | ~$12/anio |
| **Total** | | **$0/mes** |

### Protecciones Criticas (NO TOCAR sin autorizacion)
| Capa | Archivo | Proposito |
|------|---------|-----------|
| ErrorBoundary | `main.jsx` | Catch de crashes de React |
| Sanitizador | `store/useAppStore.js` → `merge()` | Previene crashes por localStorage corrupto |
| Reset URL | `?reset=1` | Manual recovery para usuarios bloqueados |

---

## Historial de Commits Relevantes

| Commit | Descripcion |
|--------|-------------|
| `2d8b5db` | AdvisorCTA global — self-contained en 16 tabs |
| `e266f2a` | 8-point partner feedback: Option B reverse calc, profById, 6 perfiles |
| `e3368c0` | Simulator tracking + email CTA + paid upgrade toast |
| `5475d3e` | Crash fix: localStorage corrupto + modal blanco + store sanitizacion |
| `1813138` | Analytics live con Supabase (4 eventos) |
| `210b902` `6697e66` | Lead capture Supabase full |
| `1baf502` | Fix portfolio defaults + rango MN free |
| `502bf45` `8580bed` | Modularizacion Fase 3 (16 tabs extraidas) |
| `08f6862` | 9 componentes extraidos del monolito |

---

## Modelo de Negocio Validado (Post-Directorio, Abr-2026)

| Stream | Producto | Precio | Proposito |
|--------|----------|--------|-----------|
| B2C | "Fotografia Financiera" (PDF one-time) | $14.99 | Liquidar CAC |
| B2B | Lead financiero (opt-in de usuario) | $75-$150/lead | Revenue engine |

**Metrica critica:** Conversion Tier 1 (rango) → Tier 2 (email) > 25%
**Costo operativo:** $0/mes
**GTM:** B2B primero (3 pilotos), luego escalar trafico B2C
