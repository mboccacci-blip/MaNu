# Handoff — Correcciones post-review de `fix/pdf-audit-h1-h5`

> Pegá lo que sigue como prompt. Asume que ya hiciste el trabajo de H1-H5; si empezás una sesión nueva, leé antes `AUDIT_2026-08-24_pdf-premium.md` y `tasks/handoff-fix-pdf-2026-08-24.md` en la raíz del repo.

---

## Resultado del review

El trabajo de H1-H5 se revisó contra el audit. **El núcleo está correcto y verificado de forma independiente** (las funciones se reejecutaron fuera de React): `reportTrajectory(50000, 500, 0.015, 17, 20, 3000)` da $180.399 en el año 17, idéntico a `fvVariable`. H1, H2, H3, H4 y H5a quedan aprobados. `ybYData`, `monthlyNeeded`, `chartProfileIdx` y `merge()` quedaron intactos como corresponde, y no se introdujeron em dashes nuevos.

Quedan **tres correcciones** y **dos de pulido**. Nada de esto invalida lo hecho.

---

## R1 — El piso del escenario conservador invierte el resultado (bloqueante)

En `app/src/hooks/useFinancialEngine.js`, línea del cálculo de `conservativeRate`:

```js
var conservativeRate = Math.max(retProfReturn - 0.005, -0.025);   // ← el piso está mal
```

El piso de −2,5% no protege nada y rompe la premisa del escenario. `customInflation` es editable por el usuario **y persistida**, y el mercado objetivo es LATAM, así que tasas reales por debajo de −2,5% son alcanzables sin esfuerzo:

| Perfil | Base | "Conservador" | MN base | MN conservador | Problema |
|---|---:|---:|---:|---:|---|
| Vault, inflación 2,5% | −2,50% | −2,50% | $938.370 | $938.370 | imprime el mismo número dos veces |
| Vault, inflación 5% | −5,00% | −2,50% | $1.258.647 | $938.370 | el "conservador" sale $320k más barato |
| Treasuries, inflación 8% | −4,00% | −2,50% | $1.115.204 | $938.370 | ídem |

Un escenario conservador que pide **menos** capital que el base es peor que el bug original.

**Fix:** sacar el piso.

```js
var conservativeRate = retProfReturn - 0.005;
```

Verificado: la monotonía (`conservativeRate < retProfReturn` siempre, y por lo tanto `MN conservador > MN base`) se cumple en los 6 perfiles con inflaciones de 2,5% a 8%. Treasuries sigue dando **$652.612**, el valor que el socio ya validó.

**Agregá el test que lo fija.** Es la propiedad, no el número:

```js
describe('escenario conservador', function () {
  it('siempre exige mas capital que el escenario base', function () {
    [0.065, 0.04, 0.015, 0.01, -0.025, -0.05].forEach(function (r) {
      var c = r - 0.005;
      expect(pvA(3000, c, 20)).toBeGreaterThan(pvA(3000, r, 20));
    });
  });
});
```

---

## R2 — Typo que se imprime en el PDF (bloqueante)

`app/src/utils/reportPdf.js`, bloque `es`, `monthlySub`:

```
'Para llegar a tu Magic Number a tiempo, ademas de los '
                                          ^^^^^^ falta la tilde: además
```

La misma línea tiene `ahorrás` bien acentuado, así que es un desliz suelto.

Aprovechá y normalizá `heroPhrase` del bloque `es`: quedó con escapes `ñ` y `á` donde el resto del archivo usa caracteres acentuados literales. El output es idéntico, pero la inconsistencia sugiere un problema de encoding al editar — revisá que no haya quedado nada más raro en el archivo.

---

## R3 — La protección de regresión que el walkthrough declara no existe (bloqueante)

El walkthrough dice: *"Test de invariante previene regresion: si alguien reconecta `ybYData`, falla en rojo."*

**Eso es falso.** Los tests viven en `financial.test.js` y solo ejercitan funciones puras. Nada verifica que `reportPdf.js` lea `ybYReport`. Si mañana alguien vuelve las líneas 261 y 403 a `engine.ybYData`, los 42 tests siguen en verde y el bug vuelve idéntico.

No es un defecto del código: es que la garantía que creíamos tener no está. Hay que construirla.

**Opción recomendada — reducir dos puntos de falla a uno.** Hoy la serie se elige en dos lugares (`drawChart` y `page2`). Pasala como parámetro desde un único punto:

```js
// una sola seleccion, en generateReportPdf o en prepData
var trajectory = engine.ybYReport;
// drawChart(doc, y, engine, L, trajectory) y page2(..., trajectory)
```

**Más el tripwire.** Es crudo pero atrapa exactamente esta regresión y cuesta cinco líneas:

```js
// reportPdf.wiring.test.js
import { readFileSync } from 'fs';
it('el PDF no consume ybYData (serie del grafico interactivo)', function () {
  var src = readFileSync(new URL('./reportPdf.js', import.meta.url), 'utf8');
  expect(src).not.toMatch(/engine\.ybYData/);
});
```

Sé honesto en el reporte final sobre qué garantiza cada cosa: el tripwire es un cable de alarma sobre el nombre, no un invariante sobre el comportamiento. Si preferís otra forma de cerrarlo, proponela; lo que no vale es declarar la protección sin tenerla.

---

## P1 y P2 — Pulido (no bloqueantes)

**P1.** El filtro nuevo `[1, 3, 5, 10].filter(function (d) { return d < h; })` deja la sección del costo de esperar con título, subtítulo y fila "empezando hoy" pero **cero filas de comparación** cuando `ytr <= 1`. Guardá la sección con `d.inaction.rows.length > 0`.

**P2.** `inactionSub` ahora imprime `ytr` dinámico, así que "1 años" pasó a ser alcanzable. Singular/plural en ambos idiomas.

---

## Reglas (recordatorio)

- **Los cambios de H1-H5 están sin commitear.** La branch `fix/pdf-audit-h1-h5` apunta al mismo SHA que `master`; todo vive en el working tree. Commiteá el trabajo completo (H1-H5 + R1-R3 + P1-P2) en la branch.
- **No pushear a master.** Push a master dispara deploy automático a producción (GitHub Actions + Cloudflare Pages). Dejá la branch local para revisión.
- `npm test` desde `app/` antes de commitear.
- Nada de em dashes en copy ni en i18n.
- Paridad ES/EN en toda key nueva o modificada.
- No tocar `merge()` del store Zustand.

---

## Criterio de aceptación

Escenario base — ahorro $50.000 · $500/mes · 17 años · Treasuries 1,5% real · deseado $4.000/mes · adicional $1.000/mes · 20 años de retiro:

| Qué | Esperado |
|---|---:|
| Magic Number | $622.309 |
| Escenario conservador | $652.612 (sin cambios respecto de ahora) |
| Proyección al retiro | $180.399 |
| Trayectoria, año 17 | $180.399 |
| Costo de esperar, "empezando hoy" | $180.399 |

Casos borde nuevos que hay que verificar (no estaban en el criterio anterior):

| Caso | Esperado |
|---|---|
| Vault, inflación 2,5% | conservador **estrictamente mayor** que el MN base, no igual |
| Vault, inflación 5% | conservador estrictamente mayor que el MN base |
| `ytr = 1` | la sección "costo de esperar" no se renderiza, o se renderiza con filas |
| `grep 'ademas' reportPdf.js` | sin resultados |
| `grep 'engine.ybYData' reportPdf.js` | sin resultados |

Al terminar informá: archivos tocados, diff, resultado de `npm test`, y las dos tablas con los valores efectivamente obtenidos. Si algo no coincide, decilo en vez de ajustar el criterio.
