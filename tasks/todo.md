# Tasks Ledger

## Decisiones Bloqueantes (Equipo Fundador)
- [x] **D1** — Precio del Basic: **$14.99** (lifetime) ✅ Decidido 2026-03-25
- [ ] **D2** — Estructura jurídica: tentativo **Persona Física (MVP)** — no urgente, se confirma al activar Stripe
- [x] **D3** — Momento de captura del email: **Solo al comprar o pedir asesor** ✅ Decidido 2026-03-25

## Fase 0: Reconstruir Repo
- [x] Obtener JSX original del socio (`sabit-financial-planner - 3.24.26.jsx`)
- [x] Crear `package.json` con React + Vite
- [x] Verificar `npm run dev` funcional (localhost:3000 ✅)
- [x] Verificar `vite build` exitoso (28 modules, 722ms ✅)
- [x] Verificar paridad visual y de cálculos con MVP original (confirmado por usuario)
- [x] Crear `.gitignore`
- [x] Inicializar Git con commit baseline (`9537a53`)

## Fase 1: Spec de Refactorización
- [x] Clasificar cada `useState` → UI local (16) / sesión-persistente (55)
- [x] Diseñar estructura de componentes (`components/`, `utils/`, `hooks/`, `tabs/`)
- [x] Escribir spec completa (`refactoring_spec.md`)
- [ ] T&C y Privacy Policy (Termly/Iubenda)

## Fase 2: Refactor + Auth + Pagos (Sprint 1-2)
- [ ] Desacoplar monolito en componentes
- [ ] Implementar Zustand para estado de sesión
- [ ] Implementar Supabase Auth
- [ ] Implementar Supabase DB para perfiles
- [ ] Implementar Stripe Checkout
- [ ] Implementar paywall con seguridad backend (token Supabase)
- [ ] PostHog con eventos pre-definidos
- [ ] **Diff de comportamiento** contra MVP original (OBLIGATORIO)

## Fase 3-5: Pendiente
- [ ] Lead form + CRM + CTA asesor
- [ ] Trust layer + outreach piloto
- [ ] Validación + contenido TikTok
- [ ] i18n + region-awareness (Sprint 7+)

## Completed
- [x] Análisis profundo del informe original (`analisis_informe_mnpro.md`)
- [x] Setup workflow de orquestación (`.agent/workflows/`, `tasks/`)
- [x] Informe Técnico v2 mejorado (`informe_tecnico_mnpro_v2.md`)

---
## Project Context
Magic Number Pro project, managed with the Senior Orchestration Workflow.
