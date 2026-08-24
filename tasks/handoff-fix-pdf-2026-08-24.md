# Handoff — Corrección del informe PDF premium (MaNu PRO)

> Pegá todo lo que sigue como prompt inicial. Es autocontenido: no asume ninguna conversación previa.

---

## Contexto

Repo: `C:\Users\mbocc\Dev\Magic Number` — MaNu PRO, calculadora de planificación de retiro (React 19 + Vite, motor financiero propio).

Un socio del proyecto auditó un PDF premium generado por la app y encontró que la página 2 se contradice con la página 1. Ya está hecho el diagnóstico completo, reproducido numéricamente al dólar, y está en la raíz del repo:

**Leé primero `AUDIT_2026-08-24_pdf-premium.md`.** Es la especificación de esta tarea. Contiene los cinco hallazgos (H1 a H5) con causa raíz en `archivo:línea`, los números verificados y el fix propuesto para cada uno.

**No re-diagnostiques.** Los números del audit fueron verificados reejecutando `app/src/utils/financial.js` fuera de React contra un Excel independiente. Si tu cálculo no coincide con el audit, asumí que el error es tuyo y paralo ahí para consultar.

---

## Alcance

**Hacer:** H1, H2, H3, H4, H5 — en ese orden, con el test de invariante antes de H1.

**No hacer** (son decisiones de producto, no de implementación):

- No cambiar el default de `chartProfileIdx` en `useAppStore.js`. Es la solución obvia a H1 y es incorrecta: cambia silenciosamente el gráfico interactivo de la app, que es otra funcionalidad. La corrección es una serie separada para el informe.
- No convertir `monthlyNeeded.monthly` en el total. Ver "Trampas" abajo.
- No tocar `MethodologyModal.jsx` ni ninguna sección de metodología más allá de lo que pide H1-H5.
- No refactorizar nada que no esté en el audit.

---

## Orden de trabajo

### Paso 0 — Baseline

```
cd app
npm test          # debe dar 40/40 antes de empezar
```

### Paso 1 — Hacer el bug irrepresentable (antes de arreglarlo)

La causa raíz de H1 es que `yearByYear()` recibe **dos tasas independientes** (acumulación y retiro) y el informe le pasaba dos distintas por accidente. El fix correcto no es solo corregir el argumento: es que el informe no pueda pasar dos.

En `app/src/utils/financial.js`, agregá un helper puro que tome **una sola** tasa:

```js
/** Trayectoria del informe: una única tasa para acumulación y retiro.
 *  Garantiza que el saldo en `yearsAccum` coincida con fvVariable() al mismo rate. */
export function reportTrajectory(existingSavings, monthlySav, rate, yearsAccum, yearsRetire, monthlySpend, debtEvents) {
  return yearByYear(existingSavings, monthlySav, rate, yearsAccum, yearsRetire, monthlySpend, 0, debtEvents, rate);
}
```

Y en `app/src/utils/financial.test.js`, el test de invariante. **Escribilo y corré `npm test` ANTES de tocar el motor** — tiene que fallar en rojo si lo apuntás a la ruta vieja, y pasar con la nueva:

```js
describe('reportTrajectory: invariante informe/página 1', function () {
  // Escenario del audit 2026-08-24
  var nEx = 50000, mSav = 500, ytr = 17, nYP = 20, spend = 3000, rate = 0.015;

  it('el saldo en el año de retiro coincide con la proyección de la página 1', function () {
    var traj = reportTrajectory(nEx, mSav, rate, ytr, nYP, spend, []);
    var proj = fvVariable(nEx, mSav, rate, ytr, []);
    expect(traj[ytr].balance).toBeCloseTo(proj, 0);
  });

  it('reproduce los valores auditados', function () {
    var traj = reportTrajectory(nEx, mSav, rate, ytr, nYP, spend, []);
    expect(Math.round(traj[ytr].balance)).toBe(180399);   // NO 242168
  });
});
```

### Paso 2 — H1

- `app/src/hooks/useFinancialEngine.js`: agregar `ybYReport` calculado con `reportTrajectory(nEx, mSav, retProfReturn, ytr, nYP, desiredAfterSS, debtEvents)` y exportarlo en el return del hook. **Dejar `ybYData` intacto** — lo consumen `AchieveTab.jsx` y `RetirementTab.jsx` y no se toca.
- `app/src/utils/reportPdf.js:261` y `:403`: cambiar `engine.ybYData` → `engine.ybYReport`.

### Paso 3 — H2

Esto es una **regresión de copy, no un cambio de lógica**. La app ya tiene la redacción correcta y el PDF la perdió. Portala:

| Ya existe en la app | Qué dice |
|---|---|
| `es.js:281` | `extraMonthly: "Ahorro Mensual Extra Necesario"` |
| `es.js:282` | `extraMonthlyTip: "...ADICIONAL a tus ahorros actuales..."` |
| `es.js:332` | `needExtraBeyond: "Necesitás {extra}/mes extra además de tus actuales {current}/mes"` |
| `en.js:280-281, 331` | equivalentes en inglés |

En `app/src/utils/reportPdf.js`, en los bloques `es` **y** `en`:

- `colNeeded`: `'Ahorro necesario'` → `'Ahorro adicional'` / `'Savings needed'` → `'Additional savings'`
- `monthlySub`: agregarle que es **además** del ahorro mensual actual, interpolando `engine.mSav`. No dejar la cifra suelta sin decir de qué es adicional.

No cambies la lógica de `monthlyNeeded`.

### Paso 4 — H3

`app/src/utils/reportPdf.js:241-242`: reemplazar `store.ciH` por `engine.ytr` y `store.ciDelayProf` por `engine.retProfReturn`. Actualizar `inactionSub` para que el nombre del perfil y el horizonte que imprime sean los que efectivamente se usaron.

### Paso 5 — H4

`app/src/utils/reportPdf.js:333` → `heroPhrase`. Cuando `engine.nSS > 0`, desglosar de dónde sale cada parte del ingreso. Ambos idiomas.

### Paso 6 — H5

- `app/src/utils/reportPdf.js:232`: `adjProfiles[2]` → `engine.retProfReturn`.
- `app/src/hooks/useFinancialEngine.js:149`: el escenario conservador debe derivarse de `retProfReturn − 0.005` con piso, no del perfil CDs hardcodeado. Con el escenario del audit tiene que seguir dando **$652.612** (verificalo: es el valor que el socio ya validó).

---

## Trampas conocidas

**1. `monthlyNeeded.monthly` tiene dos consumidores que dependen de que sea el incremento:**

- `app/src/tabs/RetirementTab.jsx:110` → `var covered = p.monthly === 0`
- `app/src/utils/reportPdf.js:454` → `if (p.monthly > 0) {...} else { surplusBy(p.surplus) }`

Si lo convertís en el total, el estado "cubierto" no se dispara nunca y ambas vistas se rompen en silencio. Si hace falta el total, agregalo como campo **nuevo** (`monthlyTotal`), no reemplaces `monthly`.

**2. `ybYData` alimenta dos tabs de la app.** `AchieveTab.jsx:301` y `RetirementTab.jsx:125`. La serie nueva es exclusiva del PDF.

**3. `chartProfileIdx` no está en `PERSISTED_FIELDS`.** Cualquier "fix" que dependa de que el usuario lo haya elegido bien no funciona: se resetea en cada carga.

---

## Reglas del proyecto (obligatorias)

- **`npm test` antes de cualquier commit.** El motor tiene 40 tests (41+ después de este trabajo).
- **`push a master = deploy a producción automático** (GitHub Actions + Cloudflare Pages). **No pushees a master.** Trabajá en una branch y dejá el PR/diff para revisión.
- **Nada de em dashes (—) en copy ni en i18n.** Se hizo una limpieza completa de sesgo de IA en la sesión 14; no los reintroduzcas. Usá dos puntos, paréntesis o punto seguido.
- **Nunca modificar el sanitizer `merge()` del store Zustand** sin autorización explícita.
- **i18n con paridad ES/EN.** Toda key nueva o modificada va en los dos idiomas.
- Los perfiles de inversión son exactamente 6. No agregar ni renombrar.
- Nada de métricas inventadas ni social proof falso.

---

## Criterio de aceptación

Escenario: ahorro actual $50.000 · ahorro mensual $500 · 17 años al retiro · perfil Treasuries (1,5% real) · ingreso deseado $4.000/mes · ingreso adicional $1.000/mes · 20 años en retiro.

| Qué | Valor esperado | Antes daba |
|---|---:|---:|
| Magic Number | $622.309 | $622.309 (ya estaba bien) |
| Escenario conservador | $652.612 | $652.612 (no debe cambiar) |
| Proyección al retiro (pág. 1) | $180.399 | $180.399 (ya estaba bien) |
| **Trayectoria, año 17 (pág. 2)** | **$180.399** | **$242.168** ← el bug |
| Tabla ahorro por perfil, Treasuries | $1.905, etiquetado como **extra/adicional** | $1.905 etiquetado como total |
| Costo de esperar, "empezando hoy" | $180.399 | $335.567 |
| `npm test` | 42/42 o más | 40/40 |

Al terminar, informá: los archivos tocados, el diff, el resultado de `npm test`, y la tabla de arriba con los valores efectivamente obtenidos. Si alguno no coincide, decilo explícitamente en vez de ajustar el criterio.
