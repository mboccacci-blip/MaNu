# MaNu PRO — Tasks Ledger
> Actualizado: 2026-04-17 — Sincronizacion post-audit con HEAD `2d8b5db`

---

## Decisiones Pendientes (Fundadores)
- [x] **D1** — Precio B2C: **$14.99** one-time ("Fotografia Financiera") — Decidido 2026-03-25
- [x] **D3** — Captura de email: **Solo al comprar o pedir asesor** — Decidido 2026-03-25
- [ ] **D2** — Estructura juridica: tentativo Persona Fisica (MVP) — confirmar al activar Stripe
- [ ] **D4** — GTM secuencia: cerrar 3 contratos B2B PRIMERO, luego trafico B2C

---

## FASES COMPLETADAS

### Fase 0 — Reconstruccion del Repo [COMPLETA]
- [x] JSX original obtenido del socio (`sabit-financial-planner - 3.24.26.jsx`)
- [x] `package.json` con React + Vite configurado
- [x] `npm run dev` funcional (localhost:3000)
- [x] `vite build` exitoso
- [x] Paridad visual y de calculos verificada
- [x] Git inicializado, `.gitignore` creado

### Fase 1 — Spec + Polish Inicial [COMPLETA]
- [x] 55 `useState` clasificados → persistibles vs UI local
- [x] Estructura de directorios disenada (`components/`, `utils/`, `hooks/`, `tabs/`)
- [x] `refactoring_spec.md` escrita
- [x] Workflow de orquestacion configurado (`.agent/workflows/`, `tasks/`)

### Sprint Mar-Abr — Bug Fixes y UX [COMPLETO]
- [x] Textos, tooltips, labels corregidos (EN + ES)
- [x] LandingPage reescrita: freemium-honest, CTA orientado a resultado
- [x] `localStorage` persistence via `usePersistedState.js`
- [x] Phosphor Icons integrados (`@phosphor-icons/react`) — 0 emojis en codebase
- [x] Cero emojis verificado: 2,660+ lineas auditadas
- [x] Tab navigation por nombre — no por indice (robustez)
- [x] `constants.js` migrado — TABS y PROFILES usan Phosphor

### Sprint 13-Abr — Partner Feedback (8 puntos) [COMPLETO]
- [x] Bug YbY 4.3% portfolio → defaults `[1,1,1,1,1,1,1]` (suma 7%, hasPortfolio=false desde inicio)
- [x] Rango MN free reducido: `0.85× a 1.15×`, redondeo $25K (spread ~30%)
- [x] Option B: reverse calculator (edad fija, drawdown simulation) implementado
- [x] `profById(id, list)` — profile lookup desacoplado de indices hardcoded
- [x] Cash Investor profile eliminado → 6 perfiles restantes
- [x] Tooltips, sliders, icons corregidos
- [x] Color cyan unificado: fallback `hexToRgb()` → `#0099cc`
- [x] Commits: `1baf502`, `e266f2a`

### Sprint 13-Abr — Lead Capture (Supabase) [COMPLETO]
- [x] Supabase proyecto `manu-pro` configurado (region Sao Paulo)
- [x] Tabla `leads`: 26 columnas, RLS INSERT anonimo / SELECT solo admin
- [x] `LeadCaptureModal.jsx`: preview financiero + formulario (nombre, email, tel)
- [x] `supabase.js` client con `submitLead()` — snapshot financiero completo
- [x] CSP actualizado (connect-src incluye Supabase)
- [x] Env vars configuradas en Cloudflare Pages
- [x] Test E2E: 2 leads verificados en Supabase dashboard
- [x] Commits: `210b902`, `6697e66`

### Sprint 13-Abr — Analytics (Supabase) [COMPLETO]
- [x] Tabla `analytics_events`: 9 columnas, RLS + indices
- [x] `analytics.js`: batching 5s / 20 eventos → Supabase (reemplaza PostHog stub)
- [x] 4 eventos instrumentados: `tab_viewed`, `language_changed`, `advisor_cta_clicked`, `lead_submitted`
- [x] Flush automatico en `visibilitychange` y `beforeunload`
- [x] Commit: `1813138`

### Sprint 13-Abr — Modularizacion Fase 3 [COMPLETA — 100%]
- [x] Zustand store (`useAppStore.js`, 250 lineas): 55 useState migrados, persist middleware, sanitizador `merge()`
- [x] `useFinancialEngine.js` (354 lineas): motor financiero extraido completamente
  - `fvVariable()`, `yearByYear()`, `pvA()`, `profById()`, `revResult`
  - Portfolio blended return, health score 0-100, benchmark Fed Survey
- [x] 16/16 tabs extraidas a `src/tabs/`:
  - Dashboard, Learn, Assumptions, Portfolio, Goals, Score, Reports
  - Save, Earn, Cost, Situation, Debts, Retirement, Invest
  - **Achieve** (AchieveTab.jsx — 41KB, declarado complejo, extraido)
  - **Inaction** (InactionTab.jsx — 15KB, extraido)
- [x] 15 componentes en `src/components/`:
  - AnimatedNumber, NumberInput, SectionTitle, Gauge, Slider
  - MiniChart, MultiLineChart, AdvisorCTA, NavButtons, Icon
  - LeadCaptureModal, Card, Tip, Toggle, TabButton
- [x] Monolito `MagicNumberAppMain.jsx`: 2,194 → 277 lineas (-87.4%)
- [x] Commits: `502bf45` → `2d8b5db` (serie de commits atomicos)

### Sprint 15-Abr — AdvisorCTA Global + UX Polish [COMPLETO]
- [x] AdvisorCTA convertido en componente self-contained (accede al store + tracking internamente)
- [x] AdvisorCTA presente en **todos los 16 tabs**
- [x] Simulator tracking instrumentado
- [x] Email CTA copy actualizado
- [x] Toast de upgrade para tier paid
- [x] Boton duplicado "Ver App" eliminado de nav
- [x] Informe de estatus para socios generado (15-Abr)
- [x] Crash protection: fix localStorage corrupto + modal blanco + validacion tel
- [x] Sanitizacion store reforzada
- [x] **Migracion Netlify → Cloudflare Pages completada**
- [x] Commits: `5475d3e` → `2d8b5db`

---

## BACKLOG ACTIVO (Priorizado — 17-Abr-2026)

### [BLOQUEANTE B2C] PDF Generation
- [ ] Instalar `@react-pdf/renderer`
- [ ] Disenar template "Fotografia Financiera" (Magic Number, Score, YbY chart, perfil)
- [ ] Trigger: boton en tab Reports (tier paid/email)
- [ ] PDF descargable localmente (sin servidor)
- [ ] Tests visuales en browser

### [BLOQUEANTE B2C] Email Delivery
- [ ] Configurar Resend account + dominio magic-number.app
- [ ] Supabase Edge Function: recibe snapshot financiero → genera PDF → envia via Resend
- [ ] Trigger desde LeadCaptureModal tras submit exitoso (tier Email)
- [ ] Template de email con PDF adjunto (EN/ES)

### [PRE-LAUNCH] Tests Unitarios Motor Financiero
- [ ] Instalar Vitest
- [ ] 6 edge cases en `financial.js`:
  - Jubilacion inmediata (age = retirement age)
  - Ahorro = 0 (MN depende solo de inversion existente)
  - Inflacion = 0%
  - Retorno esperado = 0%
  - Deuda mayor que activos
  - Magic Number = 0 (gastos en retiro = 0)

### [PRE-LAUNCH] Copy / Purga
- [ ] Eliminar toda referencia a "lifetime" del codebase (modelo cambio a one-time)
- [ ] Revisar si hay referencias a "Netlify" en codigo o docs de usuario

### [PRE-LAUNCH] beforeunload Warning
- [ ] Implementar warning al salir para usuarios tier paid con datos no guardados

### [PRE-LAUNCH] Conversion T1 → T2 (Analytics)
- [ ] Evento `tier_upgrade_attempted` cuando free user intenta acceder a feature email
- [ ] Evento `tier_upgrade_completed` al ingresar email
- [ ] Dashboard de conversion en Supabase (target: >25%)

### [FUTURE] Auth + Stripe
- [ ] Supabase Auth (magic link + Google)
- [ ] Stripe Checkout: $14.99 one-time
- [ ] Paywall backend-validated (token Supabase)
- [ ] T&C y Privacy Policy (pendiente decision D2)

### [FUTURE] GTM
- [ ] Contactar 3 asesores financieros para contratos B2B piloto ($75-150/lead)
- [ ] Compartir link con 10 personas para feedback inicial
- [ ] Contenido TikTok/Reels/Shorts (hook "tu numero magico")

---

## Deuda Tecnica Resuelta
| Item | Estado | Sprint |
|------|--------|--------|
| Emojis inline | ELIMINADOS — 0 en 2,660+ lineas | Mar-2026 |
| Monolito MagicNumberAppMain | DESMONTADO — 2,194 → 277 lineas | Abr-2026 |
| Zustand store | COMPLETO — 55 fields + persist + merge() sanitizer | 13-Abr |
| Motor financiero | EXTRAIDO — useFinancialEngine.js 354 lineas | 13-Abr |
| 16 tabs modulares | COMPLETO — todos en src/tabs/ | 13-Abr → 15-Abr |
| AdvisorCTA global | COMPLETO — self-contained en 16 tabs | 15-Abr |
| Lead capture | COMPLETO — Supabase live | 13-Abr |
| Analytics | COMPLETO — 4 eventos, Supabase | 13-Abr |
| Hosting Netlify | MIGRADO a Cloudflare Pages | 15-Abr |
| Crash protection | 3 capas activas (?reset=1, ErrorBoundary, merge()) | 15-Abr |

---

## Estado del Repositorio
- **Branch:** `master`
- **Remote:** `origin` → `github.com/mboccacci-blip/MaNu.git`
- **HEAD:** `2d8b5db` — feat: AdvisorCTA global - self-contained component in all 16 tabs
- **Local = Remote:** sincronizado
- **Produccion:** https://master.manu-pro.pages.dev/ (Cloudflare Pages)
- **Dominio custom:** https://magic-number.app
- **Revenue:** $0 | **Users:** 0 (pre-launch) | **Leads:** 2 (test) | **Analytics:** live
