---
description: Deploy de la app MaNu PRO a Cloudflare Pages (producción)
---

# Deploy a Cloudflare Pages — MaNu PRO

// turbo-all

## Pre-requisitos
- Wrangler CLI autenticado (token de Cloudflare configurado)
- El directorio de trabajo es `C:\Users\mbocc\Dev\Magic Number\app`
- Proyecto: `manu-pro` → `manu-pro.pages.dev`

## Pasos

### 1. Build de producción
```
npm run build
```
Esto genera `dist/` con los assets optimizados. Debe terminar sin errores.

### 2. Deploy a producción
```
npx wrangler pages deploy dist --project-name=manu-pro --commit-message="DESCRIPCIÓN DEL CAMBIO"
```
Reemplazar `DESCRIPCIÓN DEL CAMBIO` con un mensaje corto describiendo el deploy.

### 3. Verificar en producción
Abrir https://master.manu-pro.pages.dev/ y verificar que los cambios están live.
**NOTA:** `https://manu-pro.pages.dev/` NO funciona. Usar siempre el alias `master.`.

### 4. (Opcional) Git commit
Si no se hizo ya:
```
git -C "C:\Users\mbocc\Dev\Magic Number" add app/src/
```
```
git -C "C:\Users\mbocc\Dev\Magic Number" commit -m "DESCRIPCIÓN DEL CAMBIO"
```

## Notas
- **Migrado de Netlify a Cloudflare Pages el 15-Apr-2026.** Netlify bloqueado hasta 28-Apr (plan gratuito agotado).
- Los headers de seguridad se configuran en `_headers` dentro de `public/`.
- Cloudflare account: mboccacci@gmail.com.
