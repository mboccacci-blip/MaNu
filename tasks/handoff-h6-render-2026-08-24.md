# Handoff — H6 (estado huérfano) + verificación de render

> Pegá lo que sigue como prompt. Continúa el trabajo de la branch `fix/pdf-audit-h1-h5` (commit `967d7e6`).

---

## Contexto

Al preparar la verificación de render del PDF apareció un problema de otra clase, más grande que H1-H5. No es un error de cálculo: es **estado huérfano**.

`socialSecurity` (ingreso previsional / adicional) se eliminó del UI el 29-abr-2026 en el commit `e128b87`. Pero el campo **sigue en el store, sigue persistiéndose en localStorage, y el motor lo sigue restando**:

```js
var desiredAfterSS = Math.max(nDes - nSS, 0);   // el Magic Number se calcula sobre esto
```

Ninguna pantalla lo muestra ni permite editarlo. Cualquiera que haya cargado un valor antes de abril arrastra un descuento invisible sobre el número principal del producto. Es exactamente por eso que el PDF que auditó el socio daba $622.309 y un usuario nuevo hoy vería $829.745 con los mismos 7 campos: 33% de diferencia, invisible.

**No es un caso aislado.** Un barrido de los 38 campos persistidos que el motor lee da:

- **1 huérfano total** — `socialSecurity`: nadie lo escribe.
- **29 de riesgo latente** — persistidos y leídos por el motor, pero solo editables desde las 13 tabs ocultas del MVP.
- **8 sanos** — los de AchieveTab.

Y hay una segunda instancia viva, sobre un campo **visible**:

```js
const hasIncomeData = monthlyIncome !== "" && totalIncome > 0 && incomeFilledExp >= 5;
const mSav = hasIncomeData ? mSavComputed : (Number(manualMonthlySav) || 0);
```

Si un localStorage viejo trae ingresos y cinco gastos cargados desde SituationTab (tab oculta), `hasIncomeData` queda en `true` y el campo **"Ahorro mensual actual (estimado)" que el usuario sí ve en pantalla deja de usarse**. Tipea 500, el motor calcula con otra cosa, sin ninguna señal.

---

## H6 — Trabajo a hacer

### H6a — Dejar de persistir lo inalcanzable

En `app/src/store/useAppStore.js`, reducir `PERSISTED_FIELDS` a los campos editables desde las 3 tabs visibles del MVP:

```
age, retirementAge, yearsPostRet, desiredIncome, existingSavings,
legacy, assetTax, manualMonthlySav, tier, userEmail
```

Dejá comentado en el archivo que la lista está acotada al MVP de 3 tabs y que hay que ampliarla cuando se destapen las demás. Es reversible por diseño.

### H6b — Limpiar el localStorage ya existente (leer esto con atención)

`PERSISTED_FIELDS` solo controla la **escritura**, vía `partialize`. La lectura pasa por `merge()`, que hace:

```js
var merged = Object.assign({}, current, persisted || {});
```

Eso aplica **todas** las claves que estén en el blob guardado, sin filtrar. Así que achicar `PERSISTED_FIELDS` no limpia nada de lo que ya está en el navegador de nadie: un blob viejo con `socialSecurity: "1000"` se va a seguir aplicando.

**No toques `merge()`** — está protegido por regla del proyecto y necesita autorización explícita.

La forma correcta es subir la versión del `persist` y agregar un `migrate` que descarte las claves que ya no se persisten:

```js
{
  name: 'manu-pro-state',
  version: 2,                       // era 1
  migrate: function (persistedState, version) {
    if (version < 2) {
      var clean = {};
      PERSISTED_FIELDS.forEach(function (k) {
        if (persistedState && persistedState[k] !== undefined) clean[k] = persistedState[k];
      });
      return clean;
    }
    return persistedState;
  },
  partialize: ...,
  merge: ...                        // sin cambios
}
```

Verificá a mano en el browser: cargá un `manu-pro-state` con `version: 1` y `socialSecurity: "1000"` en localStorage, recargá, y confirmá que el Magic Number pasa a calcularse sobre los $4.000 completos.

### H6c — El test que generaliza el hallazgo

`app/src/store/reachability.test.js`. La regla: **todo campo persistido que el motor lea tiene que ser escribible desde una tab visible del MVP.**

Implementación: leer `useAppStore.js` y extraer `PERSISTED_FIELDS`; leer `useFinancialEngine.js` para saber cuáles lee el motor; recorrer `src/tabs/*.jsx` buscando escritores. Ojo con el detalle que hizo invisible este bug durante cuatro meses: **un setter declarado no es un escritor.** `AchieveTab.jsx:32` define `setSocialSecurity` y nunca lo invoca. El test tiene que exigir que el nombre del setter aparezca más de una vez en el archivo, o buscar directamente `sf('campo'` en un handler inline.

Que el test falle hoy si se revierte H6a. Verificalo.

### H6d — NO purgar `socialSecurity` del motor

Que el campo vuelva al UI o se elimine del producto es una decisión abierta, del dueño del proyecto y su socio. **Dejá `socialSecurity` en el store, en el motor y en la fila `dSS` del PDF, y dejá el condicional de `heroPhrase` (H4) donde está.** Sacarlo de `PERSISTED_FIELDS` alcanza para que `nSS` sea 0 en la práctica y no se filtre ningún valor viejo. Si mañana el campo vuelve, todo el camino sigue armado.

Consecuencia a tener presente: con `nSS = 0`, el paréntesis que agregó H4 no se renderiza nunca. Es código correcto e inerte, no un error.

---

## Verificación de render

El PDF se genera **client-side** con jsPDF, así que `npm run dev` sobre la branch produce el mismo archivo que produciría producción. No hace falta desplegar nada.

### Preparación

```
cd app
npm run dev
```

**Antes de cargar datos, limpiá el estado**: abrí la app con `?reset=1`, o borrá `manu-pro-state` del localStorage. Si arrancás con un blob viejo vas a estar verificando otro escenario sin saberlo — que es justamente el problema que estamos arreglando.

En la pestaña **Tu MN** cargá los 7 campos:

| Campo | Valor |
|---|---|
| Tu edad | 48 |
| Edad de jubilación | 65 |
| ¿Cuántos años estarás jubilado? | 20 |
| Ingreso mensual necesario en tu jubilación | 4000 |
| Ahorros e inversiones actuales | 50000 |
| Ahorro mensual actual (estimado) | 500 |
| Herencia a dejar | vacío |
| Impuesto Anual sobre Activos | 0.0% (default) |

No toques el selector de perfil del gráfico: el default 60/40 es parte de lo que se verifica.

Para desbloquear el PDF: abrí el modal de pago y usá **"DEV — Simular pago exitoso"**. Aparece porque `VITE_STRIPE_LINK` está vacío en el `.env` local. Después, **"Descargar PDF"**. Repetí en inglés.

### Chequeo de que estás en el escenario correcto

| Dónde | Valor |
|---|---:|
| Magic Number | $829,745 |
| Escenario conservador (1,0% real) | $870,149 |
| Proyección al retiro | $180,399 |
| % del Magic Number | 22% |
| Años de cobertura | 3 |
| Trayectoria, año 17 | $180,399 |
| Costo de esperar, "empezando hoy" | $180,399 |
| Tabla ahorro por perfil, Treasuries | $2,799 adicional |

Si alguno no coincide, cargaste mal los datos o quedó estado viejo. Corregí y regenerá antes de mirar el layout.

### Qué mirar

**1. `monthlySub` en la página 2 — riesgo alto.** Pasó de texto fijo a función con el ahorro interpolado: *"Para llegar a tu Magic Number a tiempo, además de los $500/mes que ya ahorrás:"*. Verificá que no invada el encabezado de la tabla, y que **además** y **ahorrás** rendericen con tilde. jsPDF con helvetica a veces come acentos: si aparecen cuadraditos, es un hallazgo.

**2. Encabezado "Ahorro adicional" / "Additional savings" — riesgo medio.** Más largo que el anterior, alineado a la derecha en `M + CW - 3`. Que no se pise con "Retorno real".

**3. El hero de la página 1 — riesgo bajo en este escenario.** La caja es de altura fija:

```js
doc.roundedRect(M + 10, y + 20, CW - 20, 13, 2, 2, 'FD');   // 13mm fijos
y = wrapText(doc, L.heroPhrase({...}), ..., CW - 30, 9.5, INK, 4.4) + 4;
```

Ancho útil 144mm, interlineado 4.4mm, caja de `y+20` a `y+33`: dos líneas entran, tres se salen. Con `nSS = 0` el paréntesis de H4 no aparece, así que el riesgo es menor — pero miralo igual, y si algún día vuelve el campo esta caja necesita altura dinámica.

**4. Escenario conservador.** Va debajo del hero y su `y` sale de `wrapText`. Que no se solape con el recuadro ni con "Tus datos".

**5. Costo de esperar.** El subtítulo ahora dice "17 años de horizonte". Que cierre bien y no quede partido entre páginas.

**6. Saltos de página.** `page2` creció. Que ninguna sección quede con el título al pie de una página y la tabla en la siguiente.

Si algo se desborda, **no lo arregles a ojo**: describí el síntoma con la medida (cuántas líneas ocupó, dónde se solapa) y proponé el ajuste antes de aplicarlo. Darle altura dinámica al hero mueve el `y` de toda la página 1.

---

## Entregable

1. Los dos PDF en `ejemplos/` como `informe-premium-2026-08-24-es.pdf` y `-en.pdf`.
2. Reporte de los 6 puntos de render: OK, o qué se rompió y en qué página.
3. Resultado de H6a-H6d, incluida la verificación manual de la migración en el browser.
4. `npm test` con el test de reachability incluido.

## Reglas

- No pushear a master (push a master = deploy automático a producción).
- Commitear sobre `fix/pdf-audit-h1-h5`. `npm test` antes de commitear.
- **No tocar `merge()`** del store Zustand.
- Nada de em dashes en copy ni en i18n.
- Paridad ES/EN en cualquier string que cambies.
