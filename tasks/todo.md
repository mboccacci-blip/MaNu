# MaNu PRO — Tasks Ledger
> Actualizado: 2026-04-24 — W3+W10 completados. W1/W2/W4/W5 previos.

---

## Decisiones Vigentes
- [x] **D1** — Precio B2C: **$3.99** micro-pago (baja de $14.99) — Decidido 17-Abr-2026
- [x] **D3** — Captura de email: en el flujo de pago de $3.99 — Decidido 17-Abr-2026
- [x] **D4** — MVP = 3 tabs: Achieve, Inaction, Learn — Decidido 17-Abr-2026
- [x] **D5** — Default jubilacion: Treasuries 1.5% real (Fede: "1 o 1.5 pondria") — Confirmado 18-Abr-2026
- [x] **D6** — Rango free: ±15% (sin cambio) — Confirmado 17-Abr-2026
- [x] **D7** — Premium $14.99: en STAND-BY — Decidido 17-Abr-2026
- [x] **D8** — Learn: podar a solo terminos de Achieve + Inaction — Decidido 17-Abr-2026
- [ ] **D9** — Frase debajo del MN: 3 opciones propuestas, PENDIENTE eleccion de Martin
- [ ] **D2** — Estructura juridica: orientacion Argentina, Stripe + investigar MercadoPago. No bloqueante.

---

## SPRINT ACTUAL — MVP Pivot (Post-reunion 17-Abr)

### Infra
- [x] **W1** — DNS magic-number.app apuntado a Cloudflare Pages (produccion activa) — 18-Abr-2026

### UI — Ocultar tabs y ajustar MVP
- [x] **W2** — Solo 3 tabs visibles (Achieve, Inaction, Learn) — ya funcionaba, verificado 18-Abr
- [x] **W3** — Podar Learn tab: solo terminos de Achieve + Inaction — 24-Abr-2026 (removidas Volatility + Real Estate Equity, 6 secciones restantes)
- [x] **W7** — Rediseno Achieve: card bicolumna Ahorro Proyectado + Anos de Cobertura — 24-Abr-2026
- [x] **W14** — Palancas (sliders) en reverse calculator para ahorro actual y mensual — 24-Abr-2026

### Motor Financiero
- [x] **W4** — Default Treasuries 1.5% real (retProfileIdx: 3→2) — 18-Abr-2026
- [x] **W5** — Sliders retorno real: min=-3% (AchieveTab, 2 sliders) — 18-Abr-2026
- [x] **W6** — Etiqueta 'Custom rate' / 'Retorno personalizado' cuando slider no coincide con preset — 24-Abr-2026

### UI/UX Polish
- [x] **W8** — Dinamica de palancas: ya implementado (React reactivity + confetti onTrack card) — verificado 24-Abr-2026
- [x] **W9** — Simplificar grafico free tier: solo acumulacion (sin drawdown), titulo 'Crecimiento de Ahorros' — 24-Abr-2026
- [ ] **W13** — Frase debajo del MN (implementar opcion elegida — D9 PENDIENTE)
- [ ] **W20** — Traduccion EN de la frase elegida

### Copy / i18n / Bugs
- [x] **W10** — Fix keys i18n expuestas (achieve.cannotRetireBy100 + common.monthAbbr) — 24-Abr-2026
- [x] **W11** — Revision copy MVP: 2 refs a tabs ocultas en Learn (EN+ES), 1 key namespace wrong (achieve.atRetAge→retirement.atRetAge) — 24-Abr-2026
- [x] **W12** — Fix bug navegacion tabs: FREE_NAV y fullOrder en NavButtons invertidos vs TABS — 24-Abr-2026

### Infra (próxima sesión)
- [ ] **W21** — Migrar Cloudflare Pages de Direct Upload a Git integration. Recrear proyecto con repo GitHub para deploy automático en push a master. Re-configurar custom domain.

### Post-MVP-fixes (construir después de estabilizar las 3 tabs)
- [ ] **W15** — PDF basado en 3 tabs MVP (descargable al instante)
- [ ] **W16** — Email con tarjeta HTML (dashboard macro del MN) + PDF adjunto
- [ ] **W17** — Integracion Stripe ($3.99 micro-pago)
- [ ] **W18** — Admin Dashboard (emails + leads para fundadores)
- [ ] **W19** — Investigar Mercado Pago + Stripe

---

## FASES COMPLETADAS (referencia historica)

### Fase 0-1 — Repo + Spec [COMPLETAS]
### Sprint Mar-Abr — Bug Fixes, UX, Phosphor Icons [COMPLETO]
### Sprint 13-Abr — Partner Feedback (8 puntos) [COMPLETO]
### Sprint 13-Abr — Lead Capture + Analytics + Supabase [COMPLETO]
### Sprint 13-Abr — Modularizacion Fase 3 (100%) [COMPLETA]
### Sprint 15-Abr — AdvisorCTA Global + UX Polish [COMPLETO]

> Detalle completo en ROADMAP.md y en el KI del proyecto.

---

## Estado del Repositorio
- **Branch:** `master`
- **Remote:** `origin` → `github.com/mboccacci-blip/MaNu.git`
- **HEAD:** `fc1889e` — chore: trigger production build for custom domain
- **Local = Remote:** sincronizado (pendiente commit de W4+W5)
- **Active URL:** https://manu-pro.pages.dev/ (Cloudflare Pages — Production)
- **Dominio custom:** magic-number.app — ACTIVO (Cloudflare Pages, Direct Upload)
- **Revenue:** $0 | **Users:** 0 | **Leads:** 2 (test)
