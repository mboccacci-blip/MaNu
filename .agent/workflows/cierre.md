---
description: Workflow de cierre de sesión — actualizar KIs, todo.md, y documentar decisiones
---

# Cierre de Sesión — Ingest Karpathy

// turbo-all

## Qué es esto
Al final de cada sesión productiva, este workflow asegura que el conocimiento generado se persista para sesiones futuras. Es la operación "Ingest" del patrón Karpathy.

## Checklist de cierre

### 1. ¿Se aprendió algo nuevo?
Si se descubrió un patrón, bug, o decisión arquitectónica:
- Actualizar el Knowledge Item correspondiente del proyecto
- Si no existe KI para el proyecto → crearlo
- Si es un patrón general → actualizar `constraint-architecture` o `common-pitfalls`

### 2. ¿Se tomaron decisiones?
Si se decidió algo (stack, enfoque, prioridad):
- Documentar en el artifact del proyecto o en el KI
- Si es una decisión cross-proyecto → actualizar `hub-central`

### 3. ¿Hay tareas pendientes?
- Actualizar `tasks/todo.md` del proyecto activo
- Marcar completadas, agregar nuevas, actualizar prioridades

### 4. ¿Se modificó código significativo?
Para PRISMA:
- Actualizar `HISTORIAL_AVANCES.md`

Para MaNu PRO:
- Actualizar `tasks/todo.md`

Para Genealogía:
- Actualizar el changelog en el KI `genealogy-project`

### 5. Resumen ejecutivo
Generar una frase de resumen de lo que se logró en la sesión para que el "yo futuro" pueda entender el estado en 5 segundos.

## Principio
> "El error más caro es empezar cada sesión de cero porque no invertimos 2 minutos en guardar el estado."
