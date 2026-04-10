---
description: Analizar cualquier propuesta (inversión, negocio, proyecto, idea) con el pipeline adversarial de 5 fases
---

// turbo-all

# /analyze — Pipeline de Análisis Adversarial Universal

## Pre-requisitos

1. Leer los criterios personalizados del usuario:

```
view_file config/criteria.md
```

2. Identificar la propuesta a analizar. El usuario puede:
   - Pegarla directamente en el chat
   - Crear un archivo en `proposals/` y referenciarlo
   - Decir "analiza [nombre]" si ya existe en `proposals/`

3. Si no hay propuesta clara, preguntar: "¿Qué propuesta quieres analizar? Puedes pegarla aquí o indicarme el archivo."

---

## Ejecución del Pipeline

Ejecutar las 5 fases **en orden estricto**. No saltar fases. No combinar fases.

### REGLAS ANTI-MIRAGE (aplican a TODAS las fases)

1. NUNCA inventar, asumir ni rellenar datos que no estén en la propuesta proporcionada.
2. Si un dato es necesario y NO está: marcarlo `[DATO AUSENTE: descripción]`
3. Cada afirmación cuantitativa debe citar fuente: `[CITADO]`, `[EXTERNO]` o `[ASUMIDO]`
4. Si los datos son insuficientes para un veredicto, el veredicto es "INSUFICIENTE" — no "probablemente".

---

### FASE 1 — SCANNER (Radiografía Inicial)

**Paso 1.1: Detectar tipo de propuesta**

Clasificar en una de estas categorías (o proponer una nueva):

| Tipo | Ejemplos |
|------|----------|
| 💰 Inversión financiera | Acciones, crypto, fondos, préstamos |
| 🎲 Mercado de predicción | Polymarket, apuestas deportivas |
| 🏗️ Negocio / Emprendimiento | Startup, importación, franquicia, agencia |
| 🏠 Real estate | Compra, desarrollo, alquiler, flip |
| 💻 Proyecto tecnológico | App, SaaS, plataforma, automatización |
| 🤝 Propuesta de sociedad | Joint venture, partnership, inversión compartida |
| 📋 Otro | Describir la categoría |

**Paso 1.2: Extraer datos según tipo**

Adaptar la tabla de extracción al tipo detectado:

**Para TODOS los tipos, extraer:**

| Campo | Valor |
|-------|-------|
| **Nombre** | [extraer] |
| **Tipo detectado** | [del paso 1.1] |
| **Quién propone** | [extraer o DATO AUSENTE] |
| **Tesis central** | [resumir en 2-3 líneas] |
| **Qué se necesita de ti** | [dinero, tiempo, expertise, todo — extraer o DATO AUSENTE] |
| **Timeline** | [extraer o DATO AUSENTE] |
| **Qué ganas si sale bien** | [extraer o DATO AUSENTE] |
| **Qué pierdes si sale mal** | [extraer o DATO AUSENTE] |

**Campos adicionales según tipo:**

Si 💰 Inversión:
| Monto de entrada | Retorno esperado (%) | Horizonte | Liquidez | Riesgo declarado |

Si 🎲 Mercado de predicción:
| Odds actuales | Fecha resolución | Volumen/Liquidez | Edge estimado |

Si 🏗️ Negocio:
| Inversión inicial | Costos operativos | Revenue estimado | Break-even | Mercado target | Competencia |

Si 🏠 Real estate:
| Precio propiedad | Costos adicionales (reforma, legal) | Valor estimado post | Rentabilidad alquiler | Ubicación | Estado legal |

Si 💻 Proyecto tech:
| Costo de desarrollo | Time-to-market | Mercado objetivo | Modelo de monetización | Competencia directa | Ventaja técnica |

Si 🤝 Sociedad:
| Qué aporta cada parte | Participación propuesta | Estructura legal | Exit strategy | Track record del socio |

**Paso 1.3: Filtros de elegibilidad** (cruzar con `config/criteria.md`)
- ¿Tiene timeline definido? [SÍ/NO]
- ¿Los datos son verificables? [SÍ/NO/PARCIAL]
- ¿Cae en algún sweet spot? [SÍ: cuál / NO]
- ¿Tiene red flags? [SÍ: cuál / NO]
- **% de datos presentes vs ausentes**: X de Y campos completados

Si datos presentes < 40% → ⚠️ ADVERTENCIA: Propuesta con información muy escasa. El análisis será preliminar.

---

### FASE 2 — DEBATE ADVERSARIAL (Bull vs. Bear)

Adaptar el lenguaje al tipo de propuesta (no usar jerga financiera si es un proyecto tech, por ejemplo).

#### 🟢 AGENTE BULL (A favor)

1. **Tesis**: Por qué HACER esto es una buena decisión [2-3 líneas]
2. **Argumentos** (hasta 5, cada uno con etiqueta de fuente):
   - Arg 1: ... `[CITADO/EXTERNO/ASUMIDO]`
   - Arg 2: ...
   - ...
3. **Confianza**: `LOW | MEDIUM | HIGH`
   - Si < HIGH: "Mi confianza subiría si tuviera: [dato específico]"
4. **Mejor escenario realista**: ¿Qué pasa si todo sale bien? (no fantasía, sino el caso optimista plausible)
5. **Lo que me preocupa incluso a mí**: El punto más débil de mi propio caso

#### 🔴 AGENTE BEAR (En contra)

1. **Tesis**: Por qué NO HACER esto es la decisión correcta [2-3 líneas]
2. **Argumentos** (hasta 5, cada uno con etiqueta de fuente):
   - Arg 1: ... `[CITADO/EXTERNO/ASUMIDO]`
   - Arg 2: ...
   - ...
3. **Confianza**: `LOW | MEDIUM | HIGH`
   - Si < HIGH: "Mi confianza subiría si tuviera: [dato específico]"
4. **Peor escenario realista**: ¿Qué pasa si sale mal? (no catastrofismo, sino el caso adverso plausible)
5. **Lo que reconozco del lado contrario**: El punto más fuerte del Bull

---

### FASE 3 — AUDITORÍA CONTRAFACTUAL

Revisar CADA argumento de AMBOS agentes:

| # | Agente | Argumento (resumen) | Etiqueta | Veredicto |
|---|--------|---------------------|----------|-----------|
| 1 | Bull | ... | CITADO | ✅ Grounded |
| 2 | Bull | ... | ASUMIDO | 🚫 Mirage |
| ... | ... | ... | ... | ... |

**Criterios del auditor:**
- **✅ Grounded**: Basado en datos de la propuesta o hechos verificables del mundo real
- **⚠️ Parcial**: Mezcla datos reales con inferencias razonables pero no confirmadas
- **🚫 Mirage**: Suena convincente pero NO tiene base en datos proporcionados

**Resumen:**
```
Bull: X/Y argumentos grounded (Z%)
Bear: X/Y argumentos grounded (Z%)
Mirages totales: N de M (P%)
```

Si mirages > 30% → ⚠️ WARNING: Análisis limitado por datos insuficientes.

---

### FASE 4 — SÍNTESIS Y VEREDICTO

Basarse EXCLUSIVAMENTE en argumentos ✅ y ⚠️. Descartar todos los 🚫.

**Matriz de Decisión** (dimensiones adaptadas al tipo):

**Dimensiones universales (todos los tipos):**

| Dimensión | Score (1-5) | Justificación (1 línea) |
|-----------|-------------|------------------------|
| Calidad de datos disponibles | /5 | |
| Fortaleza Bull post-auditoría | /5 | |
| Fortaleza Bear post-auditoría | /5 | |
| Ratio riesgo/beneficio | /5 | |

**Dimensiones adicionales según tipo:**

Si 💰/🎲 Inversión/Mercado:
| Liquidez / salida | /5 | |
| Edge vs. mercado | /5 | |

Si 🏗️ Negocio:
| Viabilidad operativa | /5 | |
| Ventaja competitiva | /5 | |
| Escalabilidad | /5 | |

Si 🏠 Real estate:
| Ubicación y tendencia | /5 | |
| Estado legal/regulatorio | /5 | |
| Potencial de valorización | /5 | |

Si 💻 Proyecto tech:
| Factibilidad técnica | /5 | |
| Product-market fit | /5 | |
| Modelo de monetización | /5 | |

Si 🤝 Sociedad:
| Confianza en el socio/partner | /5 | |
| Alineación de incentivos | /5 | |
| Claridad del acuerdo | /5 | |

**Promedio ponderado: X/5**

Cruzar con umbrales de `config/criteria.md`.

---

**Veredicto:**

# ✅ ADELANTE | ❌ NO PROCEDER | 🔍 INVESTIGAR MÁS

- **✅ ADELANTE**: Bull > Bear post-auditoría Y datos suficientes Y promedio ≥3.0
- **❌ NO PROCEDER**: Bear ≥ Bull post-auditoría O promedio < 2.5 O red flags críticos
- **🔍 INVESTIGAR MÁS**: Mirages > 30% O demasiados DATO AUSENTE O promedio entre 2.5-3.0

**Confianza del veredicto**: `LOW | MEDIUM | HIGH`

**Condiciones de invalidación** (qué cambiaría este veredicto):
1. [condición específica]
2. [condición específica]

**Comparación con alternativas**: Si se mencionó una alternativa en la propuesta, ¿cómo se compara? Si no se mencionó: "¿Has considerado alternativas? Podrían cambiar el análisis."

---

### FASE 5 — MAPA DE DATOS FALTANTES Y PRÓXIMOS PASOS

**Datos faltantes:**

| # | Dato faltante | Fase | Impacto | Cómo obtenerlo |
|---|---------------|------|---------|----------------|
| 1 | ... | Scanner | ALTO | [fuente] |

Si veredicto fue INVESTIGAR MÁS: "Con los datos #X, #Y, #Z el análisis podría resolverse. ¿Puedes conseguirlos?"

**Preguntas que deberías hacerle al proponente:**
1. [pregunta concreta basada en los DATO AUSENTE de alto impacto]
2. [pregunta concreta]
3. [pregunta concreta]

**Due diligence sugerido** (según tipo):
- Para Real Estate: verificar título, cargas, zonificación, comparables de zona
- Para Negocio: pedir estados financieros, hablar con clientes actuales, verificar permisos
- Para Tech: validar con usuarios potenciales, estimar costos reales de desarrollo, revisar competencia
- Para Sociedad: verificar track record del socio, consultar legales sobre estructura
- Para Inversión: verificar broker/plataforma, entender mecanismo de liquidez y salida

---

## Post-análisis

4. Guardar el análisis completo en `analyses/` con el formato:

```
analyses/YYYY-MM-DD_nombre-propuesta.md
```

El archivo debe incluir:
- Cabecera: Nombre, Tipo, Fecha, Veredicto (1 línea)
- Las 5 fases completas

5. Actualizar `analyses/_index.md` agregando una fila a la tabla.

6. Confirmar al usuario: "Análisis guardado. ¿Quieres profundizar en algún punto, aportar datos faltantes para re-analizar, o analizar otra propuesta?"
