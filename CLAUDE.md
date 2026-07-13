# MaNu PRO — Contexto del Proyecto

> Este archivo complementa las reglas globales de `~/.claude/CLAUDE.md`.

## Que es MaNu PRO
Calculadora de planificacion financiera para el retiro. Mercado objetivo: hispanohablantes LATAM (580M+ personas). Calcula tu "Magic Number" — el monto exacto que necesitas para retirarte. Modelo freemium con cascada B2B de leads. Dominios: magic-number.app + minumeromagico.com

## Stack
- **Frontend**: React 19.1, Vite 6, vanilla CSS (sin Tailwind), Phosphor Icons (SVG)
- **Charts**: SVG custom (MiniChart, MultiLineChart, Gauge) — zero librerias de charts
- **i18n**: Context API custom con hook useTranslation, 400+ keys EN/ES
- **Hosting**: Cloudflare Pages (migrado de Netlify, abr-2026)
- **Backend**: Supabase (PostgreSQL) — tablas leads + analytics_events
- **URL Activa**: https://magic-number.app

## Arquitectura
- `MagicNumberAppMain.jsx` — Orquestador (~170 lineas)
- **EngineContext** (`hooks/EngineContext.jsx`): Proveedor central. 16 tabs consumen `useEngine()`.
- **Motor financiero**: `hooks/useFinancialEngine.js` (~380 lineas). Usa `retProfReturn` (perfil usuario).
- **Matematica pura**: `utils/financial.js` — 8 funciones exportadas, compounding mensual. 40 tests vitest.
- **Estado**: Zustand store con `persist` middleware + `merge()` sanitizer.
- **Analytics**: `utils/analytics.js` — Supabase, batching 5s/20 eventos. SIN PII.
- **Routing**: `useState("achieve")` — sin router.

## Estado Actual (Junio 2026)
- MVP desplegado en produccion. Motor financiero completo.
- 0 usuarios, 0 revenue. 5% time allocation semanal.
- HEAD: `9cae203`. Tests: 40/40. Build: 860 KB.
- Audit CERRADO: 27/27 hallazgos + 4 fixes externos + 3 refactors + 3 features.

## MVP Scope (3 tabs visibles)
- **Achieve** (Magic Number), **Inaction** (Cost of Inaction), **Learn** (Glossary)
- Los otros 13 tabs existen en el codigo pero estan ocultos.
- Tier Free: MN mostrado como rango +-20%.
- Tier Micro-pago ($3.99): PDF descargable + email.
- Tier B2B: "Consultar a un Asesor Financiero" — leads.

## Partnership (Federico Amui — NO confundir con Federico Poletto de PRISMA)
- Estructura 50-50 equity. Fede capitaliza 100% inversion inicial.
- B2B VALIDADO: asesores necesitan leads, NO herramientas.
- Proximos pasos: (1) version final producto (PDF + Stripe), (2) presentacion Javier, (3) presupuesto pauta.

## Reglas del Proyecto
- Motor financiero tiene 40 tests — correr `npm test` antes de pushear.
- NUNCA modificar el sanitizer `merge()` de Zustand sin autorizacion.
- Mantener las 3 capas de crash protection (?reset=1, ErrorBoundary, sanitizer).
- Paywall freemium estricto. Email transaccional solo enriquece, NO desbloquea tabs.
- Perfiles de inversion: exactamente 6 (Cash Investor fue eliminado abr-2026).
- Nunca agregar metricas falsas ni social proof inventado.

## Deploy
`npx wrangler pages deploy dist` (manual via CLI)
Git remote: `github.com/mboccacci-blip/MaNu.git` (branch: master)
