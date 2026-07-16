# MaNu PRO — Tasks Ledger
> Actualizado: 2026-07-16 (sesion 13) — Stripe OPERATIVO (cuenta Divit). Bug fix critico: Supabase no funcionaba en produccion (env vars faltantes en build). Briefing enviado a Fede. PRODUCCION 100%.

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
- [x] **W27** — Retornos canonicos FIJOS (display) vs efectivos (con tax drag, para calculos) — 29-Abr-2026
- [x] **W28** — Eliminada seccion redundante "Para Cuantos Anos Te Alcanza" (archivada en tasks/archive_reverse_calculator.jsx) — 29-Abr-2026
- [x] **W29** — Texto intro actualizado (1.5% base, 7 numeros) — 29-Abr-2026
- [x] **W30** — Fix bug i18n retirement.atRetAge → achieve.atRetAge — 29-Abr-2026
- [x] **W31** — Resumen fijo (baseProjected + baseCoverage) debajo del MN, NO cambia con sliders — 29-Abr-2026
- [x] **W32** — Resultado simulacion dos columnas (simProjected + simCoverage) debajo de palancas, SI cambia — 29-Abr-2026
- [x] **W33** — Rangos sliders: mensual 0-10K, retorno -2% a 10.5% — 29-Abr-2026
- [x] **W34** — Disclaimers: nota ambar retornos historicos + warning contextual >6.5% + nota italica supuesto 1.5% — 29-Abr-2026
- [x] **W35** — Tax warning reescrito: "reduce el rendimiento neto de la cartera en X puntos porcentuales" — 29-Abr-2026

### Infra
- [x] **W21** — GitHub Actions auto-deploy: workflow + secrets + test push exitoso (run #24906193912) — 24-Abr-2026
- [x] **W52** — Fix deploy pipeline: `pages-action@v1` → `wrangler-action@v3`. La v1 usaba Direct Upload API que NO soporta Pages Functions. Las 3 funciones serverless nunca se habian deployeado a produccion. Tambien removido paths filter para permitir redeploys sin cambios en app/ — 13-Jul-2026
- [x] **W53** — Resend setup completo: cuenta creada, dominio `magic-number.app` verificado (DKIM+SPF+MX+DMARC en Cloudflare DNS), API key generada, env vars (`RESEND_API_KEY`, `FROM_EMAIL`, `ADVISOR_EMAIL`) cargadas como secrets en Cloudflare Pages — 13-Jul-2026
- [x] **W54** — Meta tags SEO corregidos: "16 modulos" → "3 minutos, 6 perfiles" en description, og:description y twitter:title — 13-Jul-2026

### Post-MVP-fixes (construir después de estabilizar las 3 tabs)
- [x] **W15** — PDF premium (jsPDF client-side, chunk separado, ES/EN): MN exacto + proyección, trayectoria año a año + ahorro por perfil + costo de esperar, metodología + disclaimers. ADEMÁS secciones condicionales (solo si hay datos cargados): Health Score, análisis de deudas, oportunidades de ahorro, metas intermedias. `src/utils/reportPdf.js` — 06-Jul-2026
- [x] **W16** — Email tarjeta HTML + PDF adjunto vía Resend: `functions/api/send-report.js` + `src/utils/premiumDelivery.js`. **OPERATIVO EN PRODUCCION** — Resend configurado, dominio verificado, email de prueba enviado exitosamente 13-Jul-2026
- [x] **W17** — Flujo Stripe completo: PaymentModal + Payment Link (VITE_STRIPE_LINK) + verificación server-side (`functions/api/verify-session.js`) + entrega automática post-pago + sandbox dev. **OPERATIVO EN PRODUCCION** via cuenta Divit (empresa hermano). Payment Link configurado, STRIPE_SECRET_KEY en Cloudflare Pages, VITE_STRIPE_LINK en GitHub Actions. Paywall estricto: tier paid SOLO con sesión verificada — 16-Jul-2026
- [ ] **W18** — Admin Dashboard (emails + leads para fundadores)
- [ ] **W19** — Investigar Mercado Pago + Stripe
- [x] **W56** — Captura de UTMs end-to-end COMPLETO: `src/utils/utm.js` (first+last touch, 30 dias, localStorage), merge en props de TODOS los eventos analytics, columnas utm_* en leads con fallback anti-perdida, "Campana de origen" en email al asesor. Migracion SQL corrida en Supabase (5 columnas + 2 indices). Commit `1996be1`. Deploy auto OK — 15-Jul-2026
- [ ] **W57** — Meta Pixel + CAPI con evento custom MagicNumberCalculated (solo si se pauta por conversiones; con UTMs alcanza para el test inicial)

### Estrategia / Partnership (sesion 9, 12-Jun-2026 - Post-reunión Fede Amui)
- [x] **W45** — Conversacion con Fede: Realizada 12-Jun. Acuerdos: versión final, presentación para Javier, estrategia publicitaria.
- [x] **W46** — "Cómo calculamos" (`MethodologyModal.jsx`): 7 secciones + tabla de perfiles. Links en footer y bajo el MN (free y unlocked). Cierra el audit externo — 06-Jul-2026
- [x] **W47** — Versión final A NIVEL CÓDIGO (sesión 10, 06-Jul-2026). Pendiente solo config externa: (1) cuenta Stripe → VITE_STRIPE_LINK + STRIPE_SECRET_KEY, (2) Resend → RESEND_API_KEY + dominio, (3) ADVISOR_EMAIL. Ver docs/SETUP-PAGOS-EMAILS.md
- [x] **W48** — Presentación para Javier ARMADA: `MaNu-PRO-Propuesta-Javier.pptx` (+PDF) en raíz del repo. 11 slides con notas de orador: problema (CPL USD 20-40 LATAM), producto, informe premium, embudo, el lead (mockup del email real), propuesta de COMISIÓN POR CLIENTE CONVERTIDO (modelo referido, % a acordar), escenarios conservadores de pauta (300/500/1000 USD → 4-24 leads/mes, supuestos citados), confianza técnica, equipo+plan, next steps con QR. Abierto: % de comisión y fecha de reunión — 13-Jul-2026
- [x] **W55** — Assets de marca: og-image 1200×630 (preview WhatsApp/redes), íconos PWA 192/512 + apple-touch (instalable como app desktop), site.webmanifest, meta tags og:image — 13-Jul-2026
- [x] **W56** — og-image optimizada para WhatsApp: logo-first design legible a 80px (thumbnail compression), JPG 35KB, CORP cross-origin headers en `_headers`. 3 iteraciones hasta diseño final — 14-Jul-2026
- [ ] **W49** — Estrategia de Pauta y Presupuesto: PLAN ARMADO en `docs/PLAN-MARKETING-REDES.md` (14-Jul-2026): video-first IG/TikTok, 16 guiones honestos (sin testimonios inventados), produccion Fastlane+UGC, escenarios USD 300/500/1000, calendario 4 semanas, compliance Meta. Prerequisito tecnico W56 (UTMs) CUMPLIDO 15-Jul. FALTA: decision de presupuesto con Fede + consulta a Poletto (Google Ads como canal 2) + W57 (Meta Pixel, opcional).
- [ ] **W50** — Preparar reunion con Javier: (1) **Acordar % comision de referido con Fede ANTES de la reunion** — el deck lo deja abierto a proposito (slide 7), hay que entrar sabiendo el numero. (2) Coordinar fecha. (3) Prep de la reunion cuando haya fecha confirmada.
- [ ] **W51** — **Fastlane (usefastlane.ai) — Produccion video short-form**: Plataforma AI que genera TikTok/Reels/Shorts desde la URL del producto. Tier gratuito. Cuenta registrada. **Accion concreta: semana 1 del calendario de marketing (W49).** Activar cuando se confirme presupuesto con Fede.
- [ ] **W58** — Verificacion og-image WhatsApp: pegar link `magic-number.app?v=7` en WhatsApp desde telefono, esperar preview, confirmar que el logo-first design se lee bien en thumbnail. Loop abierto desde sesion 11b (rediseno og-image).
- [ ] **W59** — UX feedback Nico (beta tester, 16-Jul-2026): (1) Tooltip "Impuesto Anual sobre Activos" necesita rangos concretos para Argentina (ej: Bienes Personales 0.5%-1.75%). Decision tomada: dejar default en 0%, mejorar tooltip. (2) "Esperar me cuesta $X/mes" necesita contexto explicando de donde sale el numero. (3) Iconos perfiles 60/40 y 80/20: Nico lo resolvio encontrando el glosario, no critico.

### Landing/UX pendientes (auditoria 29-Abr-2026)
- [x] **W36** — Landing ya dice "3 min" (verificado en LandingPage.jsx) — tildado 06-Jul-2026
- [x] **W37** — Landing ya dice "3 Módulos esenciales" (sin "16 modulos" ni "15+ categorias"). ADEMÁS: corregido copy del paywall in-app que prometía "16 módulos" (ahora oferta real: MN exacto + PDF + módulos) y URL vieja manu-pro.pages.dev → magic-number.app en botón compartir — 06-Jul-2026
- [ ] **W38** — Landing: agregar hero screenshot/mockup del producto
- [ ] **W39** — Campo "Anos en jubilacion" → considerar "Hasta que edad planificas vivir"
- [ ] **W40** — Grafico ano-por-ano: hacerlo colapsable por defecto

### Audit 10-Jun-2026 (REACTIVACION)
- [x] **W41** — Audit tecnico completo (27 hallazgos) + 27/27 resueltos:
  - S1: .env en .gitignore
  - B1: email gate ahora trackea a Supabase
  - B2: regex InactionTab corregida
  - B3: Dashboard agregado a TABS
  - B4: IDs duplicados fix (store CRUD helpers)
  - F1: profByHorizon eliminada (crash PROFILES[6])
  - F2: 6x hard-coded 0.04 -> retProfReturn
  - F3: fvVariable + yearByYear unificados a monthly compounding
  - F5: off-by-one drawdown corregido
  - F7: comentario rango free corregido
  - Q1: drawdownYears centralizada (3 copias -> 1)
  - Q3: 40 tests unitarios para financial.js (Vitest)
  - Dead code: -3 archivos, -155 lineas netas
  - Store: goTab/setupDone/ciSav/ciMo eliminados, goal limits alineados
- [x] **W42** — F3 (monthly compounding), F4 (tax model = design choice, no-op), AR1 (god component refactored)
- [x] **W43** — 40 tests unitarios para financial.js (Vitest) — 100% passing
- [x] **W44** — AR1: MagicNumberAppMain refactored (309->170 lines, -45%). EngineContext + 16 tabs migrados a useAppStore()

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
- **Remote:** `origin` -> `github.com/mboccacci-blip/MaNu.git`
- **HEAD:** `88b7a3c` — chore: trigger redeploy with all env vars (Supabase + Stripe)
- **Local = Remote:** sincronizado
- **Active URL:** https://magic-number.app (Cloudflare Pages — Production)
- **Dominio custom:** magic-number.app — ACTIVO (Cloudflare Pages)
- **Deploy:** GitHub Actions auto on push to master (`wrangler-action@v3`)
- **Serverless Functions:** 3/3 LIVE (`/api/verify-session`, `/api/send-report`, `/api/notify-lead`)
- **Resend:** Dominio verificado, email operativo desde `informes@magic-number.app`
- **Stripe:** OPERATIVO via cuenta Divit (empresa hermano). Payment Link + verificacion server-side funcionando.
- **Supabase:** OPERATIVO (fix sesion 13: env vars ahora se pasan al build step)
- **UTMs:** Captura end-to-end operativa (analytics + leads + email asesor). Supabase migrado.
- **Deck Javier:** PPTX+PDF en repo, 11 slides con notas de orador (nombre Javier removido por decision del usuario)
- **Briefing Fede:** Enviado por email 16-Jul-2026 (DOCX + deck + plan marketing)
- **Revenue:** $0 | **Users:** 0 | **Leads:** 2 (test)
- **Status:** ACTIVO — Produccion 100% operativa. Proximo: decisiones de negocio (comision %, presupuesto pauta, fecha Javier)
