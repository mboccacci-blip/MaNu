---
description: Proceso de auto-evaluación y rollback de los Tiers de la Arquitectura de Restricciones
---

# Evaluación de Tiers — Constraint Architecture v2.0

> Este proceso mide si cada Tier está aportando valor o restando productividad.
> Si un Tier falla la evaluación, se revierte al comportamiento anterior.
> Fecha de activación: 2026-04-01

---

## Calendario de Evaluación

| Tier | Reglas Incluidas | Evaluación | Rollback Deadline |
|------|-----------------|------------|-------------------|
| 🔴 Tier 1 (Crítico) | Step 0, 5-File Rule, Anti-MIRAGE | Día 7 | Día 10 |
| 🟠 Tier 2 (Alto) | Browser Checklist, Verification Matrix, KI Expansion | Día 14 | Día 17 |
| 🔵 Tier 3 (Estratégico) | Counterfactual Audit, Anti-Bias, Phased Pipeline | Día 21 | Día 24 |
| 🟢 Tier 4 (Operacional) | Monthly Audit, Self-Eval Gate, Lessons→KIs | Día 30 | Día 33 |

---

## Métricas de Evaluación por Tier

### 🔴 Tier 1 — Evaluar el Día 7 (2026-04-08)

**Métricas cuantitativas:**

| Métrica | Umbral Aceptable | Umbral de Rollback |
|---------|------------------|--------------------|
| Tareas completadas por sesión | ≥80% del baseline pre-v2.0 | <60% del baseline |
| Veces que Step 0 detectó código muerto real | ≥1 en 7 días | 0 (no encuentra nada útil) |
| Veces que 5-File Rule forzó una pausa útil | ≥1 | 0 (solo ralentiza) |
| Veces que Anti-MIRAGE evitó una fabricación | Cualquier valor ≥0 | N/A (no se revierte) |

**Evaluación cualitativa (preguntar al usuario):**
1. ¿Sientes que Step 0 agrega valor o solo agrega fricción?
2. ¿El 5-File Limit ha prevenido errores o solo te hace esperar?
3. ¿El protocolo Anti-MIRAGE ha sido relevante en algún caso?

**Decisiones posibles:**
- ✅ **MANTENER** — Las métricas están en umbral aceptable
- 🔧 **AJUSTAR** — Cambiar parámetros (ej: 200→300 líneas para Step 0, 5→7 archivos)
- ❌ **ROLLBACK** — Revertir la regla al comportamiento de v1.0

---

### 🟠 Tier 2 — Evaluar el Día 14 (2026-04-15)

**Métricas cuantitativas:**

| Métrica | Umbral Aceptable | Umbral de Rollback |
|---------|------------------|--------------------|
| Browser Checklist: errores de UI detectados early | ≥1 en 14 días | 0 (checklist inútil) |
| Verification Matrix: builds que pasaron en primer intento | ≥70% | <50% (matrix mal calibrada) |
| Falsos positivos del checklist (verificación innecesaria) | <30% del total | >50% (demasiado estricto) |

**Evaluación cualitativa:**
1. ¿La Verification Matrix por proyecto refleja los checks que realmente importan?
2. ¿El Browser Checklist ha detectado algo que habríamos pasado por alto?
3. ¿Algún check debería agregarse o removerse?

---

### 🔵 Tier 3 — Evaluar el Día 21 (2026-04-22)

> Solo aplica si el sistema Polymarket está en desarrollo activo.

**Métricas cuantitativas:**

| Métrica | Umbral Aceptable | Umbral de Rollback |
|---------|------------------|--------------------|
| Mirages detectados por auditor contrafactual | Cualquier valor (dato nuevo) | N/A |
| Falsos positivos del auditor (claims válidos rechazados) | <20% | >40% |
| Confianza de agentes: distribución LOW/MED/HIGH | Distribución normal | >80% siempre HIGH (sesgo) |

**Evaluación cualitativa:**
1. ¿El pipeline fraccionado permite flujo de trabajo viable?
2. ¿Los checkpoints humanos son demasiado frecuentes para el volumen?
3. ¿El auditor contrafactual agrega latencia inaceptable?

---

### 🟢 Tier 4 — Evaluar el Día 30 (2026-05-01)

**Métricas cuantitativas:**

| Métrica | Umbral Aceptable | Umbral de Rollback |
|---------|------------------|--------------------|
| Self-Eval Gate: tareas que requirieron re-trabajo | <20% (gate efectivo) | >40% (gate inútil) |
| Token count total de instrucciones | <2000 tokens | >3000 tokens |
| Reglas removidas en auditoría | ≥1 redundancia encontrada | Auditoría no trova nada |

**Evaluación cualitativa:**
1. ¿La Self-Eval de 3 preguntas se siente como ceremonia vacía o catch real?
2. ¿El workflow se ha vuelto demasiado largo para ser efectivo? (paradoja de Lehmann)
3. ¿Las lessons migradas a KIs han sido útiles en nuevas conversaciones?

---

## Proceso de Rollback

### Paso 1: Declarar Rollback
Cuando una métrica cruza el umbral de rollback:
```
[ROLLBACK] Tier X, Regla Y
Razón: [métrica específica que falló]
Fecha: YYYY-MM-DD
```

### Paso 2: Revertir
- Comentar (no borrar) la regla en `senior-orchestration.md` con prefijo `<!-- ROLLED BACK: `
- Agregar nota en `tasks/lessons.md` explicando POR QUÉ falló
- Restaurar el comportamiento de v1.0 para esa regla específica

### Paso 3: Analizar
- ¿Falló la regla en sí o solo la calibración? (ej: 5 archivos → 8 archivos)
- ¿Hay una versión más ligera que aporte valor sin la fricción?
- Documentar la decisión para futura referencia

### Paso 4: Re-evaluar (Opcional)
- Si se ajustó la calibración: re-activar con nuevos umbrales
- Nuevo período de evaluación: 7 días desde la re-activación
- Máximo 2 intentos de re-calibración antes de descarte definitivo

---

## Registro de Evaluaciones

### Evaluación Tier 1 — Día 7 (2026-04-08)
| Regla | Status | Notas |
|-------|--------|-------|
| Step 0: Clean Before Build | ⏳ Pendiente | |
| 5-File Rule | ⏳ Pendiente | |
| Anti-MIRAGE Protocol | ⏳ Pendiente | |

### Evaluación Tier 2 — Día 14 (2026-04-15)
| Regla | Status | Notas |
|-------|--------|-------|
| Browser Verification Checklist | ⏳ Pendiente | |
| Project Verification Matrix | ⏳ Pendiente | |

### Evaluación Tier 3 — Día 21 (2026-04-22)
| Regla | Status | Notas |
|-------|--------|-------|
| Counterfactual Verification | ⏳ Pendiente | |
| Anti-Bias Guardrails | ⏳ Pendiente | |
| Phased Pipeline | ⏳ Pendiente | |

### Evaluación Tier 4 — Día 30 (2026-05-01)
| Regla | Status | Notas |
|-------|--------|-------|
| Self-Eval 3-Question Gate | ⏳ Pendiente | |
| Monthly Context Audit | ⏳ Pendiente | |
| Lessons → KI Migration | ⏳ Pendiente | |

---

## Baseline Pre-v2.0 (Establecer hoy)

Para poder comparar, registrar el estado actual:

- **Productividad baseline**: ~[X] tareas/features completadas por sesión típica
- **Error rate baseline**: ~[X] rollbacks o fixes post-entrega por semana
- **Tiempo por tarea baseline**: Estimación cualitativa del usuario

> ⚠️ El usuario debe completar estos baselines en la primera sesión de trabajo post-activación para que las evaluaciones del Día 7 tengan referencia.
