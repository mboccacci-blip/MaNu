# AUDIT 2026-08-24 — Informe PDF premium

**Disparador:** feedback en audio de Federico Amui sobre un PDF premium generado por la app, acompañado de un Excel de verificación hecho con Copilot (`tasks/Magic_N_Tincho.xlsx`). Cierra el loop de **W64** (enviar ejemplos de PDF a Fede para evaluación técnica).

**Método:** las funciones reales de `app/src/utils/financial.js` se reejecutaron fuera de React con los parámetros del escenario, y se contrastaron contra las tres hojas del Excel (`Proyección`, `Magic Number`, `Retiro`) y contra los valores impresos en el PDF.

**Veredicto general:** Fede tiene razón en las cuatro observaciones. La página 1 está correcta al dólar. La página 2 arrastra **un bug real**, **una etiqueta engañosa** y **una inconsistencia de supuestos**. El costo de esperar, que no llegó a revisar, cae en la tercera categoría.

---

## Resumen

| Sección | Veredicto | Detalle |
|---|---|---|
| Página 1 | ✅ Correcta | MN, conservador, proyección y cobertura reproducen exacto |
| Trayectoria año a año | ❌ Bug confirmado | Corre al 4,0% real (60/40) en vez del 1,5% del usuario |
| Ahorro por perfil | ⚠️ Etiqueta engañosa | Muestra el incremento sobre lo que ya ahorra, no el total |
| Costo de esperar | ⚠️ Supuestos ajenos | Horizonte 20 años fijo y perfil 80/20, desacoplados del plan |
| Perfiles hardcodeados | ⚠️ Latente | Dos índices en duro que hoy aciertan de casualidad |
| Estado huérfano (H6) | ❌ Crítico | Campos persistidos que ninguna pantalla puede editar y el motor sí lee |

---

## Escenario reconstruido

Determinado sin ambigüedad a partir del Excel y de los valores del PDF.

| Parámetro | Valor | Origen |
|---|---:|---|
| Ahorro actual | $50.000 | Excel · hoja Proyección B5 |
| Ahorro mensual | $500 | Excel · B6 |
| Años hasta el retiro | 17 | Excel · B8 |
| Ingreso mensual deseado | $4.000 | PDF página 1 |
| Ingreso adicional / previsional | $1.000 | PDF página 1 |
| A cubrir con el capital | $3.000 | Excel · Magic Number B6 |
| Años en retiro | 20 | Excel · B5 |
| Perfil de retiro | Treasuries · 1,5% real | `retProfileIdx: 2` |

---

## Página 1 — reconciliación

| Concepto | PDF | Verificado | Excel de Fede | Veredicto |
|---|---:|---:|---:|---|
| Magic Number | $622.309 | $622.309 | $621.703 | ✅ Exacto |
| Escenario conservador (1,0%) | ~$652.000 | $652.612 | — | ✅ Correcto |
| Proyección al retiro | ~$180.000 | $180.399 | $180.615 | ✅ Correcto |
| Años de cobertura | 5 | 5 | 5 | ✅ Correcto |

La diferencia de **$606** contra el Excel no es error de ninguno de los dos: el Excel capitaliza a `tasa/12` y la app a `(1+tasa)^(1/12)−1`, que es la conversión geométricamente correcta. Sobre 240 meses da 0,1%.

> **Acción sugerida:** dejarlo explicitado en la metodología (`MethodologyModal` + sección `method1` del PDF) para que no reaparezca como discrepancia en la próxima revisión externa.

---

## H1 — La trayectoria año a año corre a otra tasa que el resto del informe

**Severidad: crítica · Bug real**

> *"Esa trayectoria año a año evidentemente está asumiendo otra tasa de interés, y no 1,5% real."* — F. Amui

Confirmado, y la tasa se puede nombrar. La tabla y el gráfico de la página 2 se alimentan de `ybYData`, que se calcula con `chartAccumReturn` — un índice de perfil **distinto** del que usa el Magic Number.

- `retProfileIdx: 2` → Treasuries, **1,5% real** → alimenta el MN y la página 1
- `chartProfileIdx: 3` → 60/40, **4,0% real** → alimenta la trayectoria de la página 2

| Año 17 calculado con… | Tasa real | Saldo | Coincide con |
|---|---:|---:|---|
| `chartAccumReturn` · 60/40 | 4,00% | **$242.168** | el PDF, al dólar |
| `retProfReturn` · Treasuries | 1,50% | **$180.399** | la página 1 |

Que el valor reproducido dé **$242.168 exacto** cierra el diagnóstico: no hay otra explicación posible. El desvío es de **$61.769**, un 34% de sobreestimación justo en la cifra que el usuario lee como "cuánto voy a tener".

**No es solo del PDF.** El mismo `ybYData` alimenta el gráfico de trayectoria en la app (`AchieveTab.jsx:301`, `RetirementTab.jsx:125`). El selector de perfil del gráfico existe y es visible, pero es un control aparte del perfil de retiro, arranca en 60/40 y no se persiste (`chartProfileIdx` no está en `PERSISTED_FIELDS`). En la práctica nadie los alinea.

### Ubicación

- `app/src/hooks/useFinancialEngine.js:178-180` — `ybYData` usa `chartAccumReturn` / `chartRetireReturn`
- `app/src/store/useAppStore.js:65-67` — defaults `retProfileIdx: 2`, `chartProfileIdx: 3`, `chartRetireIdx: 2`
- `app/src/utils/reportPdf.js:261` y `:403` — consumo en el PDF

### Corrección propuesta

Lo mínimo y seguro: no tocar el gráfico interactivo y darle al informe su propia serie coherente.

```js
// useFinancialEngine.js — nueva serie, exclusiva del informe
var ybYReport = useMemo(function(){ if(ytr<=0||nDes<=0) return [];
  return yearByYear(nEx, mSav, retProfReturn, ytr, nYP,
                    desiredAfterSS, INFL, debtEvents, retProfReturn);
}, [nEx,mSav,retProfReturn,ytr,nYP,desiredAfterSS,INFL,debtEvents]);

// reportPdf.js:261 y :403
- var data = engine.ybYData;
+ var data = engine.ybYReport;
```

Alternativa de fondo: que `chartProfileIdx` arranque igualado a `retProfileIdx` y que el selector del gráfico se presente explícitamente como *"¿y si invirtiera distinto?"* en vez de como un control neutro.

---

## H2 — "Ahorro necesario" muestra el incremento, no el total

**Severidad: alta · Etiqueta engañosa (el cálculo es correcto)**

> *"Si jugás con el número mensual, vas a ver que no vas a llegar al 622.000. Ahí también hay algo que me parece que no está okay."* — F. Amui

`monthlyNeeded` descuenta primero lo que el usuario **ya** proyecta ahorrando sus $500 y devuelve solo el faltante. La columna se titula **"Ahorro necesario"** bajo la bajada *"Para llegar a tu Magic Number a tiempo, empezando hoy"*. Cualquiera lo lee como el total.

| Perfil | Real | Muestra el PDF | Total verdadero | Adonde llegás con el número del PDF |
|---|---:|---:|---:|---:|
| Vault | −2,50% | $3.054 | $3.554 | $539.334 |
| CDs | 1,00% | $2.034 | $2.534 | $511.220 |
| **Treasuries** | **1,50%** | **$1.905** | **$2.405** | **$506.311** |
| 60 / 40 | 4,00% | $1.313 | $1.813 | $477.535 |
| 80 / 20 | 5,00% | $1.101 | $1.601 | $463.745 |
| 100% Equities | 6,50% | $808 | $1.308 | $440.139 |

La última columna es exactamente el experimento que hizo Fede en el Excel: poner el número del PDF como aporte mensual y ver que no llega a $622.309. Nunca iba a llegar — le falta siempre el $500 que el motor ya dio por descontado.

### Ubicación

- `app/src/hooks/useFinancialEngine.js:160-176` — `monthlyNeeded`
- `app/src/utils/reportPdf.js:437-438` (`monthlyTitle`, `monthlySub`) y bloques `es`/`en` → `colNeeded: 'Ahorro necesario'`
- `app/src/tabs/RetirementTab.jsx:110` — consume el mismo dato

### Corrección propuesta

**a) Rápida, cero riesgo:** renombrar la columna a *"Ahorro adicional"* y la bajada a *"Además de los $500 que ya ahorrás por mes"*. Cambio de una línea en los bloques `es` y `en` de `reportPdf.js`.

**b) Recomendada:** devolver ambas cifras desde `monthlyNeeded` — `monthly` (adicional) y `monthlyTotal` — y mostrar las dos columnas. Es lo que el lector espera ver y elimina la ambigüedad de raíz. Requiere tocar también `RetirementTab.jsx:110`.

---

## H3 — El costo de esperar corre con horizonte y perfil ajenos al plan

**Severidad: media · Inconsistencia de supuestos**

> *"Lo del costo de esperar no lo chequeé, pero por ahí está mal porque si estos están mal de la página 2, capaz que ese también."* — F. Amui

La intuición apunta bien, aunque el mecanismo es otro. Los números son internamente correctos, pero se calculan con `store.ciH` (**20 años fijos**) y `store.ciDelayProf` (**80/20, 5,0% real**) — los controles de la pestaña Inaction — en vez del horizonte real de 17 años y del perfil del usuario.

| Supuesto | Página 1 y MN | Costo de esperar |
|---|---:|---:|
| Horizonte | 17 años | 20 años |
| Tasa real | 1,50% | 5,00% |
| "Empezando hoy" | $180.399 | $335.567 |

El mismo informe le dice al usuario que va a tener $180.399 y, tres párrafos abajo, $335.567. No hay error de fórmula, pero sí una contradicción visible que destruye la credibilidad de la pieza — que es justo lo que Fede está midiendo.

### Ubicación

`app/src/utils/reportPdf.js:241-242`

### Corrección propuesta

Usar `engine.ytr` y `engine.retProfReturn` en lugar de `store.ciH` y `store.ciDelayProf`. Si se quiere conservar la comparación optimista, mostrarla como una fila extra rotulada, nunca como el escenario base.

---

## H4 — "Te asegurás $4.000 por mes" omite de dónde sale cada dólar

**Severidad: baja · Redacción**

> *"Sí, en verdad son 3.000 que necesitás sacar de los ahorros porque 1.000 te vienen del ingreso adicional, pero bueno, está, no pasa nada."* — F. Amui

Fede mismo lo minimiza y tiene razón: la frase es cierta. Pero el hero usa `engine.nDes` (bruto, $4.000) mientras el Magic Number se calcula sobre `desiredAfterSS` ($3.000). Para un lector que después audita el número — que es exactamente lo que pasó — el hilo se corta ahí.

### Ubicación

`app/src/utils/reportPdf.js:333` → `heroPhrase`

### Corrección propuesta

Una cláusula condicional cuando `nSS > 0`:

> *"…te asegurás $4.000 por mes durante 20 años: $3.000 de tu capital más $1.000 de tu ingreso adicional."*

Cuesta una línea y elimina la única pregunta que quedó sin responder de la página 1.

---

## H5 — Dos perfiles hardcodeados que hoy aciertan de casualidad

**Severidad: latente · No afecta este PDF**

Aparecieron auditando lo anterior. Ninguno afecta este informe, porque este usuario está en Treasuries y los índices coinciden. Con cualquier otro perfil, fallan.

- **`app/src/utils/reportPdf.js:232`** — los años de cobertura usan `adjProfiles[2]` (Treasuries) en duro, no `retProfReturn`. Un usuario en 100% Equities vería su MN calculado al 6,5% y su cobertura simulada al 1,5%.
- **`app/src/hooks/useFinancialEngine.js:149`** — el escenario conservador siempre usa CDs (1,0%). Para un usuario en Vault (−2,5%) el "conservador" daría un número *mejor* que el base, que es un sinsentido visible.

### Corrección propuesta

Derivar ambos de `retProfReturn`: la cobertura usándolo directamente, y el conservador como `retProfReturn − 0,5pp` con piso. Hoy da 1,0% para este usuario — el mismo $652.612 que Fede validó — y escala bien para el resto.

---

## H6 — Estado huérfano: campos persistidos que ninguna pantalla puede editar

**Severidad: crítica · Detectado el 24-ago-2026 al preparar la verificación de render**

`socialSecurity` (ingreso previsional / adicional) se eliminó del UI el 29-abr-2026 (commit `e128b87`), pero sigue en el store, se sigue persistiendo en localStorage y el motor lo sigue restando: `desiredAfterSS = Math.max(nDes - nSS, 0)`, y el Magic Number se calcula sobre eso.

**Consecuencia:** el PDF auditado por Fede daba $622.309 porque el localStorage de Martín conserva `socialSecurity: "1000"` desde antes de abril. Un usuario nuevo hoy, con los mismos 7 campos, ve **$829.745** — 33% más. El escenario del audit no era reproducible desde la UI, y nadie lo notó durante cuatro meses.

**No es un caso aislado.** Barrido de los 38 campos persistidos que el motor lee:

| Categoría | Cantidad | Detalle |
|---|---:|---|
| Huérfano total | 1 | `socialSecurity` — ninguna pantalla lo escribe |
| Riesgo latente | 29 | solo editables desde las 13 tabs ocultas del MVP |
| Sanos | 8 | los de AchieveTab |

Segunda instancia viva, sobre un campo **visible**: si un localStorage viejo trae ingresos y 5 gastos de SituationTab, `hasIncomeData` queda `true` y `mSav` se calcula como `totalIncome - totalMonthlyObligations`, ignorando el campo "Ahorro mensual actual (estimado)" que el usuario sí ve y edita.

**Mecanismo que lo hizo invisible:** `AchieveTab.jsx:32` declara `setSocialSecurity` y nunca lo invoca. Cualquier búsqueda por "¿quién escribe este campo?" lo cuenta como escrito. Un setter declarado no es un escritor.

**Por qué las auditorías anteriores no lo vieron:** todas trabajaron desde el código hacia afuera — leer el motor, verificar fórmulas, verificar el cableado. Desde la perspectiva del motor todo es coherente. La pregunta que faltaba es la inversa: **¿este estado es alcanzable por un usuario?**

### Corrección

- **H6a** — acotar `PERSISTED_FIELDS` a los 8 campos de AchieveTab + `tier`/`userEmail`.
- **H6b** — subir `version` del persist a 2 y agregar `migrate` que descarte las claves fuera de la lista. Achicar `PERSISTED_FIELDS` NO limpia lo ya guardado: `partialize` filtra la escritura, pero `merge()` hace `Object.assign({}, current, persisted)` y aplica todas las claves del blob. No tocar `merge()` (regla del proyecto).
- **H6c** — `store/reachability.test.js`: todo campo persistido que el motor lea debe ser escribible desde una tab visible. El test debe exigir que el setter se **invoque**, no solo que se declare.
- **H6d** — NO purgar `socialSecurity` del motor ni del PDF. Que el campo vuelva o se elimine es decisión de producto, abierta. Sacarlo de `PERSISTED_FIELDS` alcanza para que `nSS` sea 0 y no se filtre nada viejo. El condicional de H4 queda inerte pero correcto.

---

## Por qué los 40 tests no lo agarraron

Los 40 tests de `financial.test.js` pasan y están bien escritos, pero cubren funciones puras: `pvA` descuenta bien, `fvVariable` capitaliza bien, `drawdownYears` cuenta bien.

H1 no es un error de fórmula — es **la fórmula correcta alimentada con el argumento equivocado**. Ningún test unitario puede ver eso.

Lo que falta es un test de invariante a nivel motor:

```js
// dado un store, el saldo de la trayectoria en el año de retiro
// debe ser igual a la proyección que muestra la página 1
expect(ybY[ytr].balance).toBeCloseTo(
  fvVariable(nEx, mSav, retProfReturn, ytr, debtEvents), 0
);
```

Una sola aserción que habría fallado en rojo desde el día que se escribió el PDF. Vale agregar la misma familia de chequeos para las tres cifras que el informe repite en más de un lugar.

---

## Novedades del proyecto (contexto)

- **Sesión 14 (21-ago), commit `55de434`.** Decisiones de la reunión con Fede: **D10 — B2B puro** y **D11 — anonimato**. Tareas nuevas W61 a W65.
- **W61 — B2B puro.** Eliminar Stripe, PaymentModal y verify-session; simplificar tiers a free/email; **reconvertir o eliminar el PDF**. Análisis de impacto hecho (15 archivos + 3 functions), marcado "no ejecutar sin confirmación".
- **W64 — enviar PDFs de ejemplo a Fede.** Este feedback es la devolución de esa tarea. La tarea funcionó.
- **W60 — Supabase.** Sigue en watchlist: pausa por inactividad, restauración manual desde el dashboard, 90 días de plazo. Mientras esté pausado, leads, analytics y email premium fallan en silencio.
- **Sin commitear en el working tree:** `HISTORIAL_AVANCES.md`, `.session/`, los DOCX de briefing y plan de marketing, `docs/MaNu-PRO-Sistema-de-Tiers.pdf` y el Excel de Fede ya copiado en `tasks/`.

**Tensión a tener presente:** si W61 avanza hacia B2B puro, el PDF deja de ser un producto de $3,99 y pasa a ser el **lead magnet** — la pieza que un asesor financiero mira antes de decidir si el lead vale. Eso sube el costo de estos bugs en vez de bajarlo. Corregir antes de reconvertir.

---

## Plan sugerido

1. **Contestarle a Fede con el diagnóstico.** Tiene razón en las cuatro observaciones y el $242.168 se reprodujo al dólar. Confirmarlo rápido vale más que llegar con el fix hecho pero tarde.
2. **H1 y H2 primero.** Son los dos que rompen la confianza en el número. H1 toca el motor y pide test de regresión; H2 puede salir como cambio de copy.
3. **Test de invariante antes de tocar el motor.** Escribirlo primero, verlo fallar, después corregir.
4. **H3 y H4 en el mismo push.** Bajo riesgo, y son los que hacen que el informe se lea como una sola voz en vez de tres calculadoras distintas.
5. **Regenerar el PDF con el mismo perfil y mandárselo.** Que Fede vuelva a correr su Excel contra la versión corregida. Cierra W64 con evidencia, no con promesa.

---

*MaNu PRO · magic-number.app · 24 de agosto de 2026*
