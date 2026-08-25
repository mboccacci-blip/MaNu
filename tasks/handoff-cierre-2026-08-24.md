# Handoff — Cierre de `fix/pdf-audit-h1-h5`

> Pegá lo que sigue como prompt. Es el último tramo: verificar, mergear, desplegar y dejar el repo ordenado.

---

## Estado actual

Repo: `C:\Users\mbocc\Dev\Magic Number`. Branch `fix/pdf-audit-h1-h5`, **tres commits, ninguno pusheado**:

| Commit | Contenido |
|---|---|
| `967d7e6` | H1-H5 del audit + R1-R3 del review + P1-P2 de pulido |
| `8cb7540` | H6 (estado huérfano) + `drawdownYears` a mensual + etiqueta de la fila de retiro + generador headless |

`master` está en `55de434` y **una commit adelante de `origin/master`** (ese avance es previo a este trabajo).

Diagnóstico completo en `AUDIT_2026-08-24_pdf-premium.md` (H1 a H6). Tests: **47/47** verificados con `npm ci` limpio.

Hay una herramienta nueva que te sirve para varias de las tareas de abajo: `app/tools/gen-report.mjs` genera el PDF premium **sin browser**, importando el motor real con `useMemo` shimeado.

```
cd app
node tools/gen-report.mjs tools/escenario-audit.json es salida.pdf
node tools/gen-report.mjs tools/escenario-audit.json en salida-en.pdf
```

Su salida en ES tiene texto idéntico a la generada por el browser, así que sirve como referencia para comparar.

---

## Tareas

### 1. Verificar la migración de H6b en el browser (bloqueante, no está verificada)

Es lo único de H6 que no se pudo comprobar: la migración `version 1 -> 2` se implementó pero nunca se corrió contra un localStorage real.

```
cd app && npm run dev
```

En la consola del browser, sembrá un estado viejo con la clave huérfana:

```js
localStorage.setItem('manu-pro-state', JSON.stringify({
  state: {
    age: "48", retirementAge: "65", yearsPostRet: "20",
    desiredIncome: "4000", socialSecurity: "1000",
    existingSavings: "50000", manualMonthlySav: "500"
  },
  version: 1
}));
location.reload();
```

**Qué tiene que pasar:** el Magic Number muestra **$829,745**, calculado sobre los $4.000 completos. Si muestra **$622,309**, la migración no corrió y `socialSecurity` se sigue filtrando: ese es exactamente el bug de H6 y hay que arreglarlo antes de seguir.

Confirmá también en la consola que `JSON.parse(localStorage.getItem('manu-pro-state')).state.socialSecurity` es `undefined` después del reload.

### 2. Correr la suite y el build

```
cd app
npm test          # 47/47
npm run build     # tiene que compilar limpio
```

Si algo falla, **pará acá** y reportá. No sigas al merge.

### 3. Merge a master y push

Solo si 1 y 2 pasaron.

```
git checkout master
git merge --no-ff fix/pdf-audit-h1-h5
git push origin master
```

**Push a master dispara el deploy automático a producción** (GitHub Actions + `wrangler-action@v3` a Cloudflare Pages). Mirá que la action termine en verde antes de dar el paso por cerrado.

### 4. Verificar en producción

Esperá a que termine el deploy y andá a **`https://magic-number.app`** — no a `master.manu-pro.pages.dev`, que sirve HTML cacheado viejo y ya generó un falso hallazgo en julio.

La app es React client-rendered: `web_fetch` no sirve, hay que abrirla en el browser.

Cargá el escenario de 7 campos (48 / 65 / 20 / 4000 / 50000 / 500 / herencia vacía / impuesto 0), desbloqueá el PDF y descargalo. **Empezá con `?reset=1`** para no arrastrar estado viejo.

Comparalo contra `ejemplos/informe-premium-2026-08-24-es.pdf`. Los valores clave:

| Dónde | Valor |
|---|---:|
| Magic Number | $829,745 |
| Escenario conservador | $870,149 |
| Proyección al retiro | $180,399 |
| Años de cobertura | 3 |
| Trayectoria, año 17 | $180,399 |
| Fase de la fila del año 17 | "Te jubilás" |
| Costo de esperar, "empezando hoy" | $180,399 |
| Tabla ahorro por perfil, Bonos del Tesoro | $2,799 adicional |

### 5. Limpieza del repo

- **`.git/index.lock.stale`** — borralo. Es un lock huérfano de un `git add` fallido; lo renombré para desbloquear git pero no tuve permiso de borrado.
- **`tasks/Magic_N_Tincho.xlsx`** — el Excel de verificación de Fede desapareció de `tasks/` en algún momento y no quedó versionado. Si lo encontrás en el disco, volvé a ponerlo ahí y commiteálo: es la evidencia de origen de todo el audit. Si no está, decilo y que Martín lo vuelva a bajar del chat.

### 6. Archivos pre-existentes sin commitear

Quedaron afuera a propósito porque no son de este trabajo:

```
 M MaNu-PRO-Propuesta-Javier.pdf
 M MaNu-PRO-Propuesta-Javier.pptx
 M docs/SETUP-PAGOS-EMAILS.md
?? .session/ .session_open HISTORIAL_AVANCES.md
?? docs/Briefing-Fede-Julio2026.docx
?? docs/MaNu-PRO-Sistema-de-Tiers.pdf
?? docs/Plan-Marketing-Redes.docx
```

**No los mezcles con este trabajo.** Revisá si `.session/` y `.session_open` deberían ir a `.gitignore` (parecen artefactos de sesión) y proponé un commit aparte para el resto. No lo ejecutes sin confirmación.

### 7. Actualizar `tasks/todo.md`

- **W64** (enviar ejemplos de PDF a Fede para evaluación técnica): cerrado. La devolución llegó, se auditó, se corrigió y hay informes regenerados en `ejemplos/`.
- **Abrir una tarea nueva** con el siguiente número W libre: *"Decidir el futuro del campo de ingreso previsional/adicional (`socialSecurity`)"*. Contexto: se removió del UI el 29-abr-2026 (`e128b87`) pero sigue en el motor, el store y el PDF; hoy `nSS` es siempre 0. Fede validó el split $3.000/$1.000 como comportamiento correcto sin saber que el input ya no existía. O el campo vuelve, o "ingreso necesario" pasa a significar neto de jubilación y hay que decirlo en el copy. **Decisión de Martín y Fede, no la tomes.**
- Actualizar la sección "Estado del Repositorio" con el HEAD nuevo y los tests en 47.

---

## Lo que NO es tuyo

- **El destino de `socialSecurity`** — decisión de producto (ver W nuevo arriba).
- **El gráfico de trayectoria** gasta más de media página en una línea plana en cero (de los 73 a los 85 en el escenario de referencia). Es criterio de diseño y Martín lo quiere mirar él. No lo toques.
- **Mandarle el PDF a Fede** — lo hace Martín.

---

## Reglas

- `npm test` antes de cualquier commit.
- No tocar `merge()` del store Zustand.
- Nada de em dashes en copy ni en i18n.
- Paridad ES/EN en cualquier string que cambies.
- Verificar producción SOLO en `magic-number.app`, nunca en `master.manu-pro.pages.dev`.

## Entregable

Reportá, en este orden: resultado de la verificación de migración en el browser (con el número que mostró el MN), `npm test`, `npm run build`, el hash del merge, el estado de la GitHub Action, la tabla de verificación en producción con los valores obtenidos, y qué pasó con el `.stale` y el Excel.

Si algo no coincide, decilo en vez de ajustar el criterio.
