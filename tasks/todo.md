# MaNu PRO — Tasks Ledger
> Actualizado: 2026-04-17 — Post-reunion con Fede. PIVOT de modelo de negocio.

---

## Decisiones Vigentes
- [x] **D1** — Precio B2C: **$3.99** micro-pago (baja de $14.99) — Decidido 17-Abr-2026
- [x] **D3** — Captura de email: en el flujo de pago de $3.99 — Decidido 17-Abr-2026
- [x] **D4** — MVP = 3 tabs: Achieve, Inaction, Learn — Decidido 17-Abr-2026
- [x] **D5** — Default jubilacion: Bonos del Tesoro 0.5% real — Decidido 17-Abr-2026
- [x] **D6** — Rango free: ±15% (sin cambio) — Confirmado 17-Abr-2026
- [x] **D7** — Premium $14.99: en STAND-BY — Decidido 17-Abr-2026
- [x] **D8** — Learn: podar a solo terminos de Achieve + Inaction — Decidido 17-Abr-2026
- [ ] **D9** — Frase debajo del MN: 3 opciones propuestas, PENDIENTE eleccion de Martin
- [ ] **D2** — Estructura juridica: orientacion Argentina, Stripe + investigar MercadoPago. No bloqueante.

---

## SPRINT ACTUAL — MVP Pivot (Post-reunion 17-Abr)

### Infra (URGENTE — Fede necesita link para demos B2B)
- [ ] **W1** — Resolver DNS: apuntar magic-number.app a Cloudflare Pages (o pagar fee Netlify)

### UI — Ocultar tabs y ajustar MVP
- [ ] **W2** — Ocultar 13 tabs, mostrar solo Achieve, Inaction, Learn
- [ ] **W3** — Podar Learn tab: solo terminos de Achieve + Inaction
- [ ] **W7** — Rediseno Achieve: 2 columnas (Ahorro Proyectado + Anos de cobertura)
- [ ] **W14** — Palancas en seccion "Para cuantos anos te alcanza" (mensual jubilacion, ahorro mensual, retorno real)

### Motor Financiero
- [ ] **W4** — Eliminar selector "Estrategia jubilacion" + default Bonos del Tesoro 0.5%
- [ ] **W5** — Permitir retorno real negativo en sliders (primeras 3 palancas)
- [ ] **W6** — Etiqueta "Perfil de retorno personalizado" cuando % no coincide con preset

### UI/UX Polish
- [ ] **W8** — Dinamica de palancas: numeros suben en tiempo real + "Alcanzaste tu objetivo"
- [ ] **W9** — Simplificar grafico acumulacion (solo hasta jubilacion, sin curva de retiro)
- [ ] **W13** — Frase debajo del MN (implementar opcion elegida — D9 PENDIENTE)
- [ ] **W20** — Traduccion EN de la frase elegida

### Copy / i18n / Bugs
- [ ] **W10** — Fix keys i18n expuestas (ACHIEVE.CANNOTRETIREBY100 etc.)
- [ ] **W11** — Revision integral de copy y puntuacion (EN + ES)
- [ ] **W12** — Fix bug navegacion tabs superiores (verificar en Demo Y Premium)

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
- **HEAD:** `2d8b5db` — feat: AdvisorCTA global
- **Local = Remote:** sincronizado
- **Active URL:** https://master.manu-pro.pages.dev/ (Cloudflare Pages)
- **Dominio custom:** magic-number.app — CAIDO hasta 28-Abr (Netlify)
- **Revenue:** $0 | **Users:** 0 | **Leads:** 2 (test)
