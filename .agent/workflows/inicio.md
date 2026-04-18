---
description: Workflow de inicio de sesion — cargar contexto del workspace activo para retomar trabajo donde se dejo
---

# Inicio de Sesion — Bootstrap Karpathy

// turbo-all

## Que es esto
Al comienzo de cada sesion productiva, este workflow carga el contexto del workspace activo para que el agente pueda retomar el trabajo exactamente donde se dejo. Es la operacion inversa al `/cierre`.

## Secuencia de carga

### 1. Identificar el workspace activo
- Leer el `Workspace URI` declarado en `user_information` (fuente de verdad absoluta)
- Clasificar:
  - **Hub Central** (`c:\Users\mbocc\.gemini\antigravity`) → tareas admin/infra/tooling
  - **Workspace de proyecto** (`c:\Users\mbocc\Dev\*` u OneDrive) → trabajo de producto
- Localizar el `.workspace_anchor` en la raiz del workspace como confirmacion

### 2. Leer reglas del workspace
- Leer `.agent/rules/*.md` dentro del workspace activo (si existen)
- Reportar que reglas especificas de proyecto estan activas (si las hay)

### 3. Leer workflows disponibles
- Listar `.agent/workflows/*.md` del workspace activo
- Identificar que slash commands estan disponibles para esta sesion

### 4. Cargar estado de tareas pendientes
Buscar en este orden (del mas especifico al mas general):
- `todo.md` en la raiz del workspace
- `tasks/todo.md` si existe subdirectorio
- Artifact `task.md` de conversaciones anteriores (solo del proyecto activo)
- Reportar: tareas en progreso (`[/]`), pendientes (`[ ]`), y las ultimas 3 completadas (`[x]`)

### 5. Consultar KIs relevantes (SCOPING ESTRICTO)
- **Workspace de PROYECTO:** Leer SOLO el KI de ese proyecto. No traer contexto de otros proyectos salvo instruccion explicita del usuario.
- **Hub Central:** Leer SOLO el KI hub-central y tareas administrativas pendientes (fiscal, infra, tooling). NO volcar status de proyectos individuales — para eso existe `/status`.
- Si hay un KI del proyecto, leer su artifact completo para recuperar el estado detallado.
- Reportar: ultima accion documentada + decisiones clave vigentes.

### 6. Leer documentacion critica del proyecto (si existe)
Buscar archivos de referencia clave segun el tipo de proyecto:
- `HISTORIAL_AVANCES.md` / `historial.md`
- `README.md` o `docs/*.md` si contienen estado operativo
- Solo leer los archivos que existan; no buscar exhaustivamente

### 7. Presentar briefing ejecutivo de inicio
Generar un resumen estructurado. **Maximo 10 lineas.** Sin detalles de proyectos ajenos al workspace. NO mencionar documentos activos del IDE ni citar reglas defensivas. El briefing debe responder UNA pregunta: "Que hago ahora?"

```
WORKSPACE: [nombre del proyecto]
ULTIMO CIERRE: [fecha/sesion de la ultima actividad documentada]
ESTADO: [En progreso / Bloqueado / Listo para continuar]

PENDIENTE CRITICO:
- [item 1]
- [item 2]

LISTO PARA CONTINUAR DESDE: [descripcion concreta de donde retomar]
```

## Principio
> "El contexto no recuperado es tiempo perdido. Un buen bootstrap elimina los primeros 10 minutos de reorientacion."

## Notas de uso
- Este workflow es **agnostico al proyecto**: funciona en cualquier workspace
- Si el workspace no tiene `.agent/` local, el agente usa exclusivamente los KIs y la documentacion en la raiz del proyecto
- El scoping es estricto: SOLO se carga contexto del proyecto activo
