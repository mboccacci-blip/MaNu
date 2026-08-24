# Setup: Pagos ($3.99) + Emails + Leads a Javier

> Estado del código: **todo implementado y funcionando**. Lo único que falta
> son las cuentas externas (Stripe, Resend) y pegar 5 variables de entorno.
> Tiempo estimado total: **30-45 minutos**.

## Qué hace cada pieza (ya en el código)

| Pieza | Archivo | Qué hace |
|---|---|---|
| Modal de pago | `src/components/PaymentModal.jsx` | Reemplaza el alert "próximamente". Muestra la oferta real y redirige a Stripe. |
| Verificación de pago | `functions/api/verify-session.js` | Al volver de Stripe (`?paid=1&session_id=...`), verifica server-side que la sesión esté PAGADA antes de activar el tier. Paywall estricto. |
| Informe PDF (W15) | `src/utils/reportPdf.js` | 3 páginas: MN exacto + proyección, trayectoria año a año + costo de esperar, metodología + disclaimers. Se genera en el navegador (jsPDF, chunk separado). |
| Card del informe | `src/components/PremiumReportCard.jsx` | Para usuarios paid: descargar PDF / reenviar por email. Visible también en `?demo=1`. |
| Email premium (W16) | `functions/api/send-report.js` | Tarjeta HTML con el dashboard del MN + PDF adjunto, vía Resend. |
| Lead a Javier (W48) | `functions/api/notify-lead.js` | Cada lead de asesor le llega por email a `ADVISOR_EMAIL` con el perfil completo. Cambiar de asesor = cambiar una variable. |
| Cómo calculamos (W46) | `src/components/MethodologyModal.jsx` | Transparencia metodológica. Links en footer y bajo el MN. |

## Paso 1 — Stripe (cuando se resuelva la cuenta)

1. Dashboard → **Payment Links** → crear:
   - Producto "MaNu PRO — Perfil Full", **$3.99 USD, one-time**.
   - **Collect customers' email: ON** (decisión D3).
   - After payment → **Redirect** a:
     `https://magic-number.app/?paid=1&session_id={CHECKOUT_SESSION_ID}`
     (el placeholder `{CHECKOUT_SESSION_ID}` va literal — Stripe lo reemplaza).
2. Copiar la URL del link (`https://buy.stripe.com/...`).
3. Dashboard → Developers → API keys → copiar la **Secret key** (`sk_live_...`).
4. En Cloudflare Pages → Settings → Environment variables:
   - `VITE_STRIPE_LINK` = URL del Payment Link
   - `STRIPE_SECRET_KEY` = sk_live_...
5. Redeploy. Listo: pago real end-to-end.

> **Para probar sin cobrar de verdad**: usar el modo Test de Stripe
> (link de test + `sk_test_...`) con la tarjeta `4242 4242 4242 4242`.

## Paso 2 — Resend (emails)

1. Crear cuenta en [resend.com](https://resend.com) (free: 3.000 emails/mes).
2. **Domains** → agregar `magic-number.app` → cargar los registros DNS que
   pide (SPF/DKIM) en Cloudflare DNS → verificar.
3. **API Keys** → crear una key (`re_...`).
4. En Cloudflare Pages → Environment variables:
   - `RESEND_API_KEY` = re_...
   - `FROM_EMAIL` = `MaNu PRO <informes@magic-number.app>`

> Sin dominio verificado se puede probar con `FROM_EMAIL` por defecto
> (`onboarding@resend.dev`), pero solo manda al email de la cuenta Resend.

## Paso 3 — Lead routing a Javier

En Cloudflare Pages → Environment variables:
- `ADVISOR_EMAIL` = email de Javier (o el nuestro hasta que dé el OK)
- `LEADS_BCC` = (opcional) nuestro email para auditar cada lead

**Esto es "el enchufe"**: si mañana el asesor es otro, se cambia esta
variable y nada más.

## Paso 4 — Deploy

```bash
cd app
npm install        # una vez (agrega jspdf)
npm test           # 40/40
npm run build
npx wrangler pages deploy dist
```

> **Importante**: `wrangler pages deploy` toma la carpeta `functions/` del
> directorio actual (app/) y la publica como Pages Functions. Verificar
> después del deploy: `https://magic-number.app/api/verify-session` debe
> responder JSON (`bad_session_id`), no 404.

## Cómo demostrar el flujo completo HOY (sin Stripe todavía)

1. `npm run dev` → abrir la app local.
2. Cargar datos → paywall → "Desbloquear Perfil Full" → botón
   **"DEV — Simular pago exitoso"** (solo existe en dev local).
3. Se activa el tier paid, se descarga el PDF premium al instante y (si
   Resend está configurado) llega el email.
4. En producción, para mostrar la experiencia paid a Javier: `?demo=1`
   (banner de demo + informe PDF descargable con datos de ejemplo).

## Matriz de fallback (nada se rompe si falta config)

| Config faltante | Comportamiento |
|---|---|
| Sin `VITE_STRIPE_LINK` (prod) | El botón de pago muestra "casi listo" + sugiere la opción gratis por email. Nada se rompe. |
| Sin `STRIPE_SECRET_KEY` | `/api/verify-session` responde `not_configured`; el tier NUNCA se activa sin verificación. |
| Sin `RESEND_API_KEY` | El PDF se descarga igual (client-side). El email falla silenciosamente y la UI ofrece descargar. |
| Sin `ADVISOR_EMAIL` | El lead queda en Supabase como siempre; solo no sale la notificación. |
