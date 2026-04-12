---
description: Deploy de la app MaNu PRO a Netlify (producción)
---

# Deploy a Netlify — MaNu PRO

// turbo-all

## Pre-requisitos
- Netlify CLI ya está configurado y linkeado al proyecto `magic-number-mn`
- El directorio de trabajo es `C:\Users\mbocc\Dev\Magic Number\app`

## Pasos

### 1. Verificar que no hay errores en el dev server
Si hay un dev server corriendo, verificar que no tiene errores en consola.

### 2. Build de producción
```
npm run build
```
Esto genera `dist/` con los assets optimizados. Debe terminar sin errores.

### 3. Deploy a producción
```
npx netlify-cli deploy --prod --dir=dist --message="DESCRIPCIÓN DEL CAMBIO"
```
Reemplazar `DESCRIPCIÓN DEL CAMBIO` con un mensaje corto describiendo el deploy (ej: "Fix tabs layout" o "Phase 1 Freemium").

### 4. Verificar en producción
Abrir https://magic-number-mn.netlify.app/ (o https://magic-number.app/) y verificar que los cambios están live.

### 5. (Opcional) Commit local
Si no se hizo ya:
```
git -C "C:\Users\mbocc\Dev\Magic Number\app" add -A
```
```
git -C "C:\Users\mbocc\Dev\Magic Number\app" commit -m "DESCRIPCIÓN DEL CAMBIO"
```

## Notas
- **NO hay GitHub remote configurado** — el deploy se hace directamente con Netlify CLI (manual deploy), no con git push.
- El build command en `netlify.toml` es `npm run build` y el publish dir es `dist`.
- Los headers de seguridad (CSP, X-Frame-Options, etc.) se configuran en `netlify.toml`.
- Netlify account: mboccacci@gmail.com / team: mboccacci.
