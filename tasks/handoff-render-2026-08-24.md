# Handoff — Verificación de render del PDF regenerado

> Pegá lo que sigue como prompt. Tarea distinta de las anteriores: **no es matemática, es render.**

---

## Contexto

En la branch `fix/pdf-audit-h1-h5` (commit `967d7e6`) se corrigieron cinco hallazgos del informe PDF premium. Los 44 tests pasan y los valores están verificados de forma independiente. **La matemática está cerrada — no la revalides.**

Lo que falta es lo que ningún test cubre: **cómo se ve el PDF**. Tres strings crecieron de largo y uno pasó a ser dinámico. `wrapText` puede empujar el layout y romper cajas de altura fija.

Objetivo: generar el PDF en ES y en EN, mirarlos, y reportar si algo se desborda, se solapa o queda huérfano.

---

## Cómo generar el PDF

```
cd app
npm run dev
```

Abrí la app en el browser. En la pestaña **Achieve** (la primera) cargá exactamente este escenario:

| Campo | Valor |
|---|---|
| Edad actual | 48 |
| Edad de retiro | 65 |
| Años de retiro planificados | 20 |
| Ingreso mensual deseado | 4000 |
| Ingreso previsional / adicional | 1000 |
| Ahorros actuales | 50000 |
| Ahorro mensual | 500 |
| Herencia deseada | vacío |
| Impuesto sobre activos | 0 |

Edad 48 y retiro a 65 dan los 17 años del audit. **No toques el perfil de inversión ni el selector de perfil del gráfico**: los defaults (Treasuries para el retiro, 60/40 para el gráfico interactivo) son parte de lo que se está verificando.

Para desbloquear el PDF: abrí el modal de pago y usá el botón **"DEV — Simular pago exitoso"**. Aparece solo si `VITE_STRIPE_LINK` está vacío, que es el caso en el `.env` local. Después, botón **"Descargar PDF"** en la tarjeta del informe premium.

Repetí con el idioma en inglés.

---

## Chequeo rápido de que estás en el escenario correcto

Antes de mirar el layout, confirmá estos cuatro números en el PDF. Si alguno no coincide, cargaste mal los datos — corregí y regenerá antes de seguir.

| Dónde | Valor |
|---|---:|
| Página 1, Magic Number | $622,309 |
| Página 1, proyección al retiro | $180,399 |
| Página 2, trayectoria año 17 | $180,399 |
| Página 2, costo de esperar "empezando hoy" | $180,399 |

---

## Qué mirar (en orden de riesgo)

### 1. El hero de la página 1 — riesgo alto

`heroPhrase` ahora agrega un paréntesis cuando hay ingreso adicional:

> "Juntando este capital a tus 65 años, te asegurás $4,000 por mes durante 20 años de retiro. **($3,000 de tu capital + $1,000 de ingreso adicional)**"

El problema: el texto se escribe dentro de una caja de **altura fija**.

```js
// reportPdf.js:332-333
doc.roundedRect(M + 10, y + 20, CW - 20, 13, 2, 2, 'FD');   // alto fijo: 13mm
y = wrapText(doc, L.heroPhrase({...}), W/2 - (CW-30)/2, y + 25.5, CW - 30, 9.5, INK, 4.4) + 4;
```

Ancho útil 144mm, primera línea en `y+25.5`, interlineado 4.4mm, caja de `y+20` a `y+33`. Dos líneas entran justo. **Tres líneas se salen de la caja.**

Verificá: ¿el texto queda dentro del recuadro celeste, o pisa el borde inferior? Hacelo en los dos idiomas — el inglés es más corto y puede entrar donde el español no.

### 2. La línea del escenario conservador — riesgo alto

Va inmediatamente debajo del hero y su `y` sale de lo que devolvió `wrapText`. Si el hero creció, esta línea baja con él. Verificá que no se solape con el recuadro ni con el título "Tus datos".

### 3. `monthlySub` en la página 2 — riesgo medio

Pasó de texto fijo a función con el ahorro interpolado:

> "Para llegar a tu Magic Number a tiempo, además de los $500/mes que ya ahorrás:"

Verificá que no invada el encabezado de la tabla que viene abajo, y que la tilde de **además** y de **ahorrás** se rendericen bien (el archivo está en UTF-8 y jsPDF con helvetica a veces come acentos — si aparecen cuadraditos o caracteres raros, decilo, es un hallazgo).

### 4. Encabezado de columna "Ahorro adicional" / "Additional savings" — riesgo medio

Es más largo que el anterior y está alineado a la derecha en `M + CW - 3`. Verificá que no se pise con la columna "Retorno real" a su izquierda.

### 5. Costo de esperar — riesgo bajo

El subtítulo ahora dice "17 años de horizonte" en vez de 20 fijo, y las filas son [1, 3, 5, 10]. Verificá que el texto cierre bien y que la sección no haya quedado partida entre páginas.

### 6. Saltos de página en general

`page2` creció. Los guardas `ensure()` existen, pero mirá que ninguna sección haya quedado con el título en el pie de una página y la tabla en la siguiente.

---

## Entregable

1. Los dos PDF guardados en `ejemplos/` como `informe-premium-2026-08-24-es.pdf` y `-en.pdf`.
2. Un reporte con los 6 puntos de arriba: OK, o qué se rompió y en qué página.
3. Si algo se desborda, **no lo arregles a ojo**: describí el síntoma con la medida concreta (cuántas líneas ocupó, dónde se solapa) y proponé el ajuste antes de aplicarlo. La caja del hero probablemente necesite altura dinámica en vez de 13mm fijos, y eso toca el `y` de todo lo que sigue.

---

## Reglas

- No pushear a master (push a master = deploy automático a producción).
- Si tocás código, `npm test` antes de commitear, y commiteá sobre la misma branch `fix/pdf-audit-h1-h5`.
- Nada de em dashes en copy ni en i18n.
- Paridad ES/EN en cualquier string que cambies.
