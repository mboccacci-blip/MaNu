# Magic Number PRO — Informe de Progreso (Fases 0–2)

**Fecha:** 25 de Marzo, 2026 · v2  
**Preparado por:** Equipo de Desarrollo  
**Framework:** Senior Orchestration Workflow

---

## Resumen Ejecutivo

Magic Number PRO es una aplicación web de planificación financiera que calcula cuánto necesita ahorrar una persona para retirarse ("su número mágico"), con 16 herramientas interactivas: simuladores, comparadores de inversión, análisis de deuda, y un health score integral.

El proyecto se encuentra en **Fase 2 de refactorización**, con el código original del socio fundador ya funcionando sobre una stack moderna (React 19 + Vite 6). Las Fases 0 y 1 están **completas**. El avance está sujeto a **3 decisiones bloqueantes** del equipo fundador que impiden implementar pagos, paywall y documentos legales.

| Fase | Estado | Avance |
|------|--------|--------|
| Fase 0 — Reconstruir Repo | ✅ COMPLETA | 100% |
| Fase 1 — Spec de Refactorización | ✅ COMPLETA | 75% (1 tarea bloqueada) |
| Fase 2 — Refactor + Auth + Pagos | 🔄 EN PROGRESO | ~40% |
| Decisiones bloqueantes | 🔴 | 3 pendientes |

---

## Fase 0 — Reconstruir Repo ✅ COMPLETA

**Objetivo:** Montar el código original del socio sobre un proyecto moderno y reproducible, con build verificado.

| Tarea | Estado | Detalle |
|-------|--------|---------|
| Obtener JSX original del socio | ✅ Hecho | `sabit-financial-planner - 3.24.26.jsx` |
| Crear proyecto React + Vite | ✅ Hecho | React 19.1 + Vite 6.0 |
| Verificar `npm run dev` | ✅ Hecho | localhost:3000 funcional |
| Verificar `vite build` | ✅ Hecho | 28 módulos, ~760ms |
| Paridad visual con MVP original | ✅ Hecho | Confirmado por el usuario |
| Crear `.gitignore` | ✅ Hecho | node_modules, dist excluidos |
| Inicializar Git con commit baseline | ✅ Hecho | Commit `9537a53` |

**Resultado:** 7/7 tareas completadas. El proyecto compila y corre sin errores.

---

## Fase 1 — Spec de Refactorización ✅ COMPLETA (parte técnica)

**Objetivo:** Analizar el monolito, clasificar todo el estado, diseñar la arquitectura modular y documentar la spec de refactorización.

| Tarea | Estado | Detalle |
|-------|--------|---------|
| Clasificar los 71 `useState` | ✅ Hecho | 16 UI-local, 55 sesión/persistente |
| Diseñar estructura de componentes | ✅ Hecho | constants, utils, components, hooks, tabs |
| Escribir spec completa de refactorización | ✅ Hecho | Documentada y revisada |
| T&C y Privacy Policy | 🔒 Bloqueado | Depende de D2 (estructura jurídica) |

**Resultado:** 3/4 tareas completadas. La tarea restante está bloqueada por decisión D2.

### Hallazgos Clave del Análisis

| Métrica | Valor |
|---------|-------|
| Líneas de código (App.jsx) | 1,979 |
| Variables de estado (useState) | 71 |
| Tabs / Pantallas | 16 |
| Funciones financieras | 9 |
| Componentes UI inline | ~13 |

---

## Fase 2 — Refactor en Progreso 🔄 (~40%)

**Objetivo:** Desacoplar el monolito de 1,979 líneas en módulos manejables, sin romper funcionalidad.

### ✅ Lo que ya está hecho

| Módulo Extraído | Archivo | Contenido |
|----------------|---------|-----------|
| Constantes | `src/constants.js` | PROFILES (7 perfiles de inversión), DEFAULT_EXP (5 gastos), BENCH_SR, BENCH_NW, TABS (16 tabs), INFLATION_DEFAULT |
| Formateadores | `src/utils/formatters.js` | `fmt()` (moneda), `fmtC()` (compacto: $1.2M), `pct()` (porcentajes) |
| Funciones financieras | `src/utils/financial.js` | `mR, fvC, fvL, pvA, gB, profByHorizon, clamp, yearByYear, fvVariable` — 9 funciones documentadas con JSDoc |
| Card | `src/components/Card.jsx` | Componente tarjeta con 6 variantes de glow (green, gold, orange, red, blue, purple) |
| TabButton | `src/components/TabButton.jsx` | Botón de tab con estado activo/inactivo y color customizable |
| Tip | `src/components/Tip.jsx` | Tooltip "?" con click-outside-to-close |
| Toggle | `src/components/Toggle.jsx` | Switch on/off con label y sub-label |

### ⏳ Lo que falta

| Tarea | Estado | Detalle |
|-------|--------|---------|
| Integrar imports en App.jsx | ⏳ Pendiente | App.jsx aún define todo inline; no usa los módulos ya extraídos |
| Extraer componentes restantes (~9) | ⏳ Pendiente | NI, ANum, ST, Gauge, Slider, MiniChart, MultiLineChart, AdvisorCTA, NavButtons |
| Extraer custom hook `useFinancials` | ⏳ Pendiente | Mover los 55 useState de sesión y ~20 useMemo derivados |
| Extraer 16 tabs a archivos individuales | ⏳ Pendiente | Dashboard, Learn, Your MN, Cost of Inaction, You, Income&Exp, Debts, Invest, Portfolio, Retirement, Save, Earn, Opp Cost, Int Needs, Score, Reports |
| Implementar Zustand para estado | ⏳ Pendiente | Reemplazar prop-drilling por store centralizado |
| Supabase Auth | 🔒 Bloqueado | Depende de D2 y D3 |
| Stripe Checkout | 🔒 Bloqueado | Depende de D1 y D2 |
| Paywall con seguridad backend | 🔒 Bloqueado | Depende de D1, D2, D3 |
| PostHog analytics | ⏳ Pendiente | Eventos pre-definidos de uso |
| Diff de comportamiento vs MVP | ⏳ Pendiente | OBLIGATORIO antes de deploy |

> **⚡ Nota importante:** Los módulos ya extraídos (constants, utils, components) están creados y probados, pero App.jsx aún no los importa. El archivo monolítico sigue funcionando con sus propias definiciones inline. La integración de imports es el siguiente paso lógico.

---

## Arquitectura Actual

### Estructura de Archivos

```
Magic Number/
├── ABRIR-DEMO.bat                           # Doble click para probar
├── documentación/                           # Docs del proyecto
├── tasks/
│   ├── todo.md                              # Backlog de tareas
│   └── lessons.md                           # Lecciones aprendidas
├── .agent/workflows/                        # Framework de orquestación
└── app/                                     # Proyecto React + Vite
    ├── package.json                         # React 19.1 + Vite 6.0
    ├── vite.config.js
    ├── dist/                                # Build de producción
    └── src/
        ├── App.jsx                          # Monolito (1,979 líneas)
        ├── main.jsx                         # Entry point
        ├── constants.js                     # ✅ Extraído
        ├── utils/                           # ✅ Extraído
        │   ├── formatters.js                # fmt, fmtC, pct
        │   └── financial.js                 # 9 funciones financieras
        └── components/                      # ✅ 4 de ~13
            ├── Card.jsx
            ├── TabButton.jsx
            ├── Tip.jsx
            └── Toggle.jsx
```

### Stack Tecnológico

| Componente | Actual | Target |
|-----------|--------|--------|
| Framework | React 19.1 | — |
| Bundler | Vite 6.0 | — |
| Estado | 71× useState (prop-drilling) | Zustand store |
| Auth | Ninguno | Supabase Auth |
| Pagos | Ninguno | Stripe Checkout |
| Analytics | Ninguno | PostHog |
| Deploy | Local | Vercel/Netlify |

---

## Métricas Técnicas

| Métrica | Valor | Observación |
|---------|-------|-------------|
| Build status | ✅ Exitoso | 28 módulos, ~760ms |
| Bundle size (gzip) | 97.88 KB | Archivo JS único |
| Dev server | ✅ Funcional | localhost:3000 con HMR |
| Preview build | ✅ Funcional | localhost:4173 vía ABRIR-DEMO.bat |
| Git | ✅ Inicializado | Baseline commit: `9537a53` |
| Tests | ⏳ Sin configurar | Pendiente para Fase 2 |

---

## Decisiones Bloqueantes del Equipo Fundador

> ⚠️ **Sin estas 3 decisiones no podemos implementar:** pagos (Stripe), paywall, autenticación, ni documentos legales (T&C / Privacy Policy). Todo lo que no depende de estas decisiones está avanzando normalmente.

| ID | Decisión | Qué Bloquea | Estado |
|----|----------|-------------|--------|
| **D1** | Precio del plan Basic | Stripe Checkout, pricing page | ✅ **$14.99** (lifetime) |
| **D2** | Estructura jurídica | T&C, Privacy Policy, cuenta Stripe | 🟡 Tentativo: **Persona Física (MVP)** — se confirma al activar Stripe |
| **D3** | Momento de captura del email | Paywall, lead form, auth flow | ✅ **Solo al comprar o pedir asesor** |

> ✅ **Actualización 25/03/2026:** D1 y D3 resueltas. D2 no es bloqueante para la refactorización actual - solo se necesita al momento de activar pagos.

---

## Pendientes y Próximos Pasos

### Inmediato (No requiere decisiones)

1. **Integrar imports en App.jsx** — Que App.jsx use constants.js, utils/, y components/ en vez de definiciones inline duplicadas
2. **Extraer los 9 componentes restantes** — NI, ANum, ST, Gauge, Slider, MiniChart, MultiLineChart, AdvisorCTA, NavButtons
3. **Crear custom hook `useFinancials`** — Centralizar los 55 useState de sesión y ~20 useMemo derivados
4. **Extraer 16 tabs a `src/tabs/`** — Cada tab en su propio archivo para mantenibilidad
5. **Implementar Zustand** — Reemplazar prop-drilling por un store centralizado

### Requiere Decisiones (D1+D2+D3)

- 🔒 Supabase Auth — Login/registro
- 🔒 Supabase DB — Perfiles de usuario
- 🔒 Stripe Checkout — Cobros
- 🔒 Paywall con seguridad backend (token Supabase)
- 🔒 T&C y Privacy Policy (Termly/Iubenda)

### Fases 3–5 (Futuro)

- Lead form + CRM + CTA asesor financiero
- Trust layer + outreach piloto a asesores
- Validación + contenido TikTok
- i18n + region-awareness (Sprint 7+)
- PostHog analytics con eventos pre-definidos

---

## Lecciones Aprendidas

| # | Error | Corrección |
|---|-------|-----------|
| 1 | Iniciar trabajo sin verificar frameworks operativos del proyecto | Siempre leer `lessons.md` → `senior-orchestration.md` → `todo.md` antes de comenzar |
| 2 | Over-engineering: 6+ iteraciones de scripts complejos en vez de pedir ayuda | Si el mismo error aparece 2+ veces, escalar al usuario. Herramientas rotas → preguntar inmediatamente |
| 3 | Re-ejecutar script de limpieza sobre archivo ya verificado, rompiendo el build | Nunca modificar un archivo verificado sin correr Babel parse check primero. Preferir verificación en dev mode |

---

## Cómo Probar la App

### Opción 1: Doble click
1. Asegurate de tener Node.js instalado
2. Abrí la carpeta `Magic Number/`
3. Hacé doble click en **ABRIR-DEMO.bat**
4. Se abre automáticamente en `http://localhost:4173`

### Opción 2: Desde el código fuente
```
cd app
npm install
npm run dev
```
Se abre en `http://localhost:3000`

---

*Magic Number PRO v0.1.0 — Informe generado el 25 de Marzo de 2026*  
*Preparado con el framework de Senior Orchestration Workflow*
