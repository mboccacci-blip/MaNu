# MaNu PRO — Tasks Ledger
> Actualizado: 2026-04-29 (sesion 3) — W3+W6+W7+W8+W9+W10+W11+W12+W14+W21+W22+W23+W24+W25+W26 completados. Score: 19/26.

---

## Decisiones Vigentes
- [x] **D1** — Precio B2C: **$3.99** micro-pago (baja de $14.99) — Decidido 17-Abr-2026
- [x] **D3** — Captura de email: en el flujo de pago de $3.99 — Decidido 17-Abr-2026
- [x] **D4** — MVP = 3 tabs: Achieve, Inaction, Learn — Decidido 17-Abr-2026
- [x] **D5** — Default jubilacion: Treasuries 1.5% real (Fede: "1 o 1.5 pondria") — Confirmado 18-Abr-2026
- [x] **D6** — Rango free: ±15% (sin cambio) — Confirmado 17-Abr-2026
- [x] **D7** — Premium $14.99: en STAND-BY — Decidido 17-Abr-2026
- [x] **D8** — Learn: podar a solo terminos de Achieve + Inaction — Decidido 17-Abr-2026
- [x] **D9** — Frase debajo del MN: simplificada a "Juntando este capital a tus X anos..." — Decidido 24-Abr-2026
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
- [x] **W13** — Frase debajo del MN simplificada ("Juntando este capital...") — 24-Abr-2026
- [x] **W20** — Traduccion EN de la frase ("Accumulating this capital...") — 24-Abr-2026

### Copy / i18n / Bugs
- [x] **W10** — Fix keys i18n expuestas (achieve.cannotRetireBy100 + common.monthAbbr) — 24-Abr-2026
- [x] **W11** — Revision copy MVP: namespace wrong (retirement.atRetAge→achieve.atRetAge), achieve.short→cannotRetireBy100 — 24-Abr-2026
- [x] **W12** — Fix bug navegacion tabs: FREE_NAV y fullOrder en NavButtons — 24-Abr-2026
- [x] **W22** — /mo -> /mes i18n: 22 instancias en 8 tabs reemplazadas con t('app.perMonth') — 24-Abr-2026
- [x] **W23** — Eliminada card redundante del reverse calc (info ya en 2 columnas) — 24-Abr-2026
- [x] **W24** — Restaurado campo "Anos de jubilacion" en Datos Esenciales (quitado solo del reverse calc) — 24-Abr-2026
- [x] **W25** — Eliminado campo "Ingreso adicional en tu jubilación" de AchieveTab (socialSecurity queda en store default=0, motor no se afecta) — 29-Abr-2026
- [x] **W26** — Label "Ingreso mensual deseado" → "Ingreso mensual necesario" (ES) / "Required monthly income" (EN) — 29-Abr-2026

### Infra (próxima sesión)
- [x] **W21** — GitHub Actions auto-deploy: workflow + secrets + test push exitoso (run #24906193912) — 24-Abr-2026

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
- **HEAD:** `e128b87` — fix: remove additional retirement income field, rename desired->required income label
- **Local = Remote:** sincronizado (push exitoso, GitHub Actions auto-deploy)
- **Active URL:** https://manu-pro.pages.dev/ (Cloudflare Pages — Production)
- **Dominio custom:** magic-number.app — ACTIVO (Cloudflare Pages)
- **Deploy:** GitHub Actions auto on push to master
- **Revenue:** $0 | **Users:** 0 | **Leads:** 2 (test)
