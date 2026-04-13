# MaNu PRO — Tasks Ledger
> Actualizado: 2026-04-13 — modularización Fase 3 casi completa

---

## Decisiones Bloqueantes (Equipo Fundador)
- [x] **D1** — Precio del Basic: **$14.99** (lifetime) ✅ Decidido 2026-03-25
- [ ] **D2** — Estructura jurídica: tentativo **Persona Física (MVP)** — no urgente, se confirma al activar Stripe
- [x] **D3** — Momento de captura del email: **Solo al comprar o pedir asesor** ✅ Decidido 2026-03-25

---

## Fase 0: Reconstruir Repo ✅ COMPLETA
- [x] Obtener JSX original del socio (`sabit-financial-planner - 3.24.26.jsx`)
- [x] Crear `package.json` con React + Vite
- [x] Verificar `npm run dev` funcional (localhost:3000)
- [x] Verificar `vite build` exitoso (28 modules, 722ms)
- [x] Verificar paridad visual y de cálculos con MVP original
- [x] Crear `.gitignore`
- [x] Inicializar Git con commit baseline (`9537a53`)

## Fase 1: Spec + Polish Inicial ✅ COMPLETA
- [x] Clasificar cada `useState` → UI local (16) / sesión-persistente (55)
- [x] Diseñar estructura de componentes (`components/`, `utils/`, `hooks/`, `tabs/`)
- [x] Escribir spec completa (`refactoring_spec.md`)
- [x] Análisis profundo del informe original (`analisis_informe_mnpro.md`)
- [x] Setup workflow de orquestación (`.agent/workflows/`, `tasks/`)
- [x] Informe Técnico v2 mejorado (`informe_tecnico_mnpro_v2.md`)

---

## Sprint 29-Mar-2026 — Commits realizados

### Phase A — Bug fixes críticos ✅
- [x] Correcciones en textos, tooltips y labels (EN + ES)
- [x] Fixes en LandingPage, i18n (en.js, es.js)
- [x] SS today dollars, yellow text, tooltips, labels, Magic Number naming
- [x] Commit: `8908fae`

### Phase C — Refinamiento de copy ✅
- [x] Guía renombrada, tooltips mejorados
- [x] Textos de intro y "price of waiting" refinados
- [x] Commit: `421d7d6`

### LocalStorage Persistence ✅
- [x] `hooks/usePersistedState.js` — saveState, loadState, clearState
- [x] Main app importa y usa estas funciones — datos sobreviven reload
- [x] Commit: `3b66c5e`

### Phase D — Phosphor Icons (PARCIAL)
- [x] `@phosphor-icons/react` instalado en package.json
- [x] `Icon.jsx` creado — 24 íconos Phosphor mapeados, peso `light`
- [x] `constants.js` migrado — cero emojis en TABS y PROFILES
- [x] `TabButton.jsx` actualizado — usa `Icon.jsx`, color default `#0055AA`
- [x] Commit: `42893ac`
- [ ] **83 líneas con emojis inline en `MagicNumberAppMain.jsx`** (88 emojis) — section headers, badges, decoración dentro de tabs — NO reemplazados
- [ ] **22 emojis en `LandingPage.jsx`** — íconos de métricas, garantías, CTAs

### Sprint 10-Abr-2026 — Feedback del Socio ✅
- [x] Informe de estatus para socios generado y enviado
- [x] Auditoría delta (análisis adversarial 3-Abr vs estado real 9-Abr)
- [x] **Feedback #1**: "No arrancar con Ingresos y Gastos" → ya estaba así, confirmado
- [x] **Feedback #2**: Gráfico Year-by-Year duplicado en tab "Tu MN" (achieve)
  - [x] Versión completa (paid/email): `MultiLineChart` + selectores de perfil acumulación/retiro + badges
  - [x] Versión simplificada (free): perfil fijo, sin selectores, con teaser de upgrade
- [x] `npm run build` verificado — sin errores
- [x] Verificación visual en browser — gráfico visible, selectores interactivos funcionan
- [x] Commit + push + deploy a producción ✅ (`fe99476`)

### Sprint 13-Abr-2026 — Feedback del Socio (Audio)
- [x] **Feedback #3 — BUG: Gráfico YbY mostraba 4.3% (Mi Cartera)** ✅ CORREGIDO
  - **Root cause**: `portAlloc=[0,0,0,0,30,40,30]` y `portContribAlloc=[0,0,0,0,20,30,50]` sumaban 100% → `hasPortfolio=true` desde el inicio
  - **Fix**: Defaults cambiados a `[1,1,1,1,1,1,1]` (suma 7%, `hasPortfolio=false`). El usuario puede ajustar en tab Portfolio.
  - Archivos: `MagicNumberAppMain.jsx` líneas 195-196, 326
- [x] **Feedback #4 — Rango del Magic Number para free users reducido** ✅ CORREGIDO
  - Antes: `0.75 × MN` a `1.30 × MN` redondeado a $50K (spread ~55%)
  - Ahora: `0.85 × MN` a `1.15 × MN` redondeado a $25K (spread ~30%)
  - Archivo: `MagicNumberAppMain.jsx` líneas 1455, 1457
- [x] **Feedback #5 — "Se ve muy bien en el teléfono"** ✅ Positivo (sin acción)
- [x] **Feedback #6 — Emojis/íconos** ✅ YA ESTABAN COMPLETADOS
  - Revisión completa de las 2,166 líneas de `MagicNumberAppMain.jsx` + 494 de `LandingPage.jsx`: **cero emojis encontrados**
  - El conteo anterior (83+22) era stale del sprint de Marzo. Phase D los reemplazó todos.
- [x] `npm run build` verificado — sin errores (627KB, 4.42s)
- [x] Commit `1baf502` + push + deploy a producción ✅

### Sprint 13-Abr-2026 — Sistema de Captura de Leads (Supabase)
- [x] **Supabase configurado** — Proyecto `manu-pro`, región São Paulo
  - URL: `https://gnpewzezjlziiuqblpak.supabase.co`
  - Tabla `leads` con 26 columnas (contacto + financieras + contexto)
  - RLS habilitado: INSERT anónimo permitido, SELECT solo admin
- [x] **LeadCaptureModal.jsx** creado — modal premium con:
  - Preview de datos financieros que verá el asesor (Score, MN, progreso, ahorro, perfil)
  - Formulario: nombre, email*, teléfono
  - Estados: idle → sending → success/error
  - i18n completo (ES/EN)
- [x] **AdvisorCTA conectado** — 5 instancias ahora abren el modal
- [x] **Supabase client** (`lib/supabase.js`) — con `submitLead()` que captura snapshot financiero completo
- [x] **CSP actualizado** — `connect-src` incluye dominio Supabase
- [x] **Env vars en Netlify** — `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` configuradas
- [x] **Test E2E exitoso** — 2 leads de prueba confirmados en Supabase dashboard
- [x] Deploy a producción ✅ commits `210b902` + `6697e66`

### Sprint 13-Abr-2026 — Design Tokens + Modularización Paso 1
- [x] **Color cyan unificado** — Fallback `hexToRgb()` de `#0055AA` a `#0099cc` (commit `9e369f6`)
- [x] **9 componentes extraídos** del monolito a archivos individuales (commit `08f6862`):
  - AnimatedNumber, NumberInput, SectionTitle, Gauge, Slider, MiniChart, MultiLineChart, AdvisorCTA, NavButtons
  - Monolito reducido de 2,194 a 2,111 líneas | 15 componentes en `/components/`

### Sprint 13-Abr-2026 — Analytics con Supabase
- [x] **Tabla `analytics_events`** creada en Supabase con RLS + índices
- [x] **analytics.js reescrito** — usa Supabase en vez de PostHog, con batching (5s/20 eventos)
- [x] **4 eventos instrumentados**:
  - `tab_viewed` — cada cambio de tab con nombre + lang + tier
  - `language_changed` — con idioma origen/destino
  - `advisor_cta_clicked` — con tab de origen (5 instancias)
  - `lead_submitted` — tras envío exitoso de lead
- [x] Deploy a producción ✅ commit `1813138`

### Sprint 13-Abr-2026 — Modularización Fase 3 (Tabs)
- [x] **Zustand Store** — 55 useState migrados a `useAppStore.js` (240 líneas, persist middleware)
- [x] **14/16 tabs extraídas** a `src/tabs/` — monolito de 2,194 → 1,095 líneas (-50.1%)
  - Dashboard, Learn, Assumptions, Portfolio, Goals, Score, Reports
  - Save, Earn, Cost, Situation, Debts, Retirement, Invest
- [x] **Encoding**: 0 issues UTF-8 (evitado `Set-Content` de PowerShell)
- [x] **Runtime verificado** — todas las tabs renderizan correctamente en browser
- [ ] **AchieveTab** (inline) — 242 líneas, ~30 `useMemo` dependencias. Requiere calc engine extraction primero
- [ ] **InactionTab** (inline) — 148 líneas, misma dependencia de vars computadas
- [x] Commits: `a162a9d` → `502bf45` (12 commits atómicos)
- [ ] **Deploy pendiente** — Netlify monthly limit alcanzado (Apr-2026)



## Deuda Técnica & Design System
| #  | Ítem                      | Estado      | Detalle |
|----|---------------------------|-------------|---------|
| 1  | Emojis inline en app      | ✅ Completado | Verificado 13-Abr: 0 emojis en 2,166 líneas |
| 2  | Emojis en landing          | ✅ Completado | Verificado 13-Abr: 0 emojis en 494 líneas |
| 3  | Fuente body                | ✅ Correcto   | `Outfit` como display + `Inter` para labels/inputs — es intencional |
| 4  | Color CSS global `--cyan`  | ✅ Corregido  | Fallback de `hexToRgb()` en TabButton era `#0055AA`, corregido a `#0099cc` (commit `9e369f6`) |
| 5  | Font-size base             | ✅ Ya estaba  | `index.css` línea 85: `font-size: 15px` — ya estaba correcto |
| 6  | Card glows                 | ✅ Revisado   | 7 variantes `.mn-card.glow-*` se mantienen — dan identidad visual premium |
| 7  | Desacoplar monolito        | ✅ 87.5%     | 14/16 tabs extraídas. Monolito de 2,194→1,095 líneas. Faltan Achieve e Inaction (dependen de ~30 useMemo) |
| 8  | Zustand state management   | ✅ Completado | `useAppStore.js` — 55 fields, persist middleware, 240 líneas |
| 9  | Calc Engine extraction     | ❌ Pendiente | ~30 useMemo en monolito → extraer a `useFinancialEngine.js` hook |

---

## Fase 4: Refactor Final + Auth + Pagos
- [ ] Extraer calc engine a `src/hooks/useFinancialEngine.js` (~30 useMemo)
- [ ] Extraer AchieveTab + InactionTab (tras calc engine)
- [ ] Implementar Supabase Auth
- [ ] Implementar Supabase DB para perfiles
- [ ] Implementar Stripe Checkout
- [ ] Implementar paywall con seguridad backend (token Supabase)
- [ ] PostHog con eventos pre-definidos
- [ ] **Diff de comportamiento** contra MVP original (OBLIGATORIO)
- [ ] T&C y Privacy Policy (Termly/Iubenda) — bloqueado por D2

## Fase 3-5: Futuro
- [ ] Lead form + CRM + CTA asesor
- [ ] Trust layer + outreach piloto
- [ ] Validación + contenido TikTok
- [ ] i18n + region-awareness (Sprint 7+)

---

## Quick Wins Identificados (del informe de estatus)
- [ ] **QW1** — Activar PostHog (~5 min): crear cuenta, copiar API key → `VITE_POSTHOG_KEY` en Netlify. El stub `analytics.js` ya existe.
- [ ] **QW2** — Contactar 3 asesores financieros (1 hr): LinkedIn, mensaje de 3 líneas, validación B2B
- [ ] **QW3** — Compartir link con 10 personas (~20 min): WhatsApp, feedback > 0 feedback

---

## Git Status
- **Branch:** `master`
- **Remote:** `origin` → `github.com/mboccacci-blip/MaNu.git`
- **Último commit:** `502bf45` — Revert: keep Achieve+Inaction inline — 14/16 tabs extracted, 1095 lines
- **Estado:** Local = Remoto ✅ sincronizado
- **Producción:** https://magic-number.app — ⚠️ deploy pendiente (Netlify monthly limit)
