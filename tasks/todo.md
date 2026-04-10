# MaNu PRO — Tasks Ledger
> Actualizado: 2026-04-10 — refleja estado real verificado

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
- [ ] **Pendiente**: commit + push de los cambios del gráfico YbY

---

## Deuda Técnica & Design System
| #  | Ítem                      | Estado      | Detalle |
|----|---------------------------|-------------|---------|
| 1  | Emojis inline en app      | ❌ Pendiente | 83 líneas / 88 emojis en `MagicNumberAppMain.jsx` |
| 2  | Emojis en landing          | ❌ Pendiente | 22 emojis en `LandingPage.jsx` |
| 3  | Fuente body                | ❌ Pendiente | `index.css` body usa `Outfit` como base. Inter tiene presencia pero Outfit domina el `body {}` principal |
| 4  | Color CSS global `--cyan`  | ❌ Pendiente | `--cyan` sigue siendo `#0099cc` en tokens. TabButton hardcodea `#0055AA` — inconsistencia |
| 5  | Font-size base             | ❌ Pendiente | Sigue en `14px` — se planificó subir a `15px` |
| 6  | Card glows                 | 🟡 Revisar  | 7 variantes `.mn-card.glow-*` con box-shadow cromático en CSS — evaluar si mantener |
| 7  | Desacoplar monolito        | ❌ Pendiente | **~2,166 líneas** en archivo principal (+81 del gráfico YbY), 9+ componentes inline |

---

## Fase 2: Refactor + Auth + Pagos (Bloqueado parcialmente por D2)
- [ ] Desacoplar monolito en componentes
- [ ] Implementar Zustand para estado de sesión
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
- **Último commit:** `42893ac` — feat: Phase D - Phosphor Icons, copy refinements, exclude large media
- **Estado:** Local tiene cambios sin commitear (gráfico YbY en achieve tab)
