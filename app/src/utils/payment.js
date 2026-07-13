/**
 * MaNu PRO — Payment module ($3.99 micro-pago via Stripe Payment Link)
 *
 * "Plug-in ready": todo el flujo funciona hoy; cuando exista la cuenta de Stripe
 * solo hay que configurar UNA env var y el redirect del Payment Link.
 *
 * Config (Cloudflare Pages → Settings → Environment variables):
 *   VITE_STRIPE_LINK      — URL del Payment Link (ej: https://buy.stripe.com/xxxx)
 *
 * El Payment Link en Stripe debe configurarse con:
 *   - Precio: $3.99 USD one-time
 *   - Collect email: siempre (Stripe captura el email → decisión D3)
 *   - After payment → redirect a:
 *       https://magic-number.app/?paid=1&session_id={CHECKOUT_SESSION_ID}
 *
 * La verificación es SERVER-SIDE en /functions/api/verify-session.js
 * (requiere STRIPE_SECRET_KEY en el env de Pages). El paywall se mantiene
 * estricto: el tier "paid" solo se activa con una sesión verificada como pagada.
 *
 * Sandbox: en desarrollo local (npm run dev) sin VITE_STRIPE_LINK, el flujo
 * se puede simular para demos. NUNCA en producción.
 */

export var PAYMENT_LINK = import.meta.env.VITE_STRIPE_LINK || '';
export var IS_DEV = !!import.meta.env.DEV;
export var PRICE_LABEL = '$3.99';

/**
 * Start the checkout flow.
 * @param {Object} opts - { email?: string }
 * @returns {{ mode: 'redirect' | 'sandbox' | 'unavailable' }}
 */
export function startCheckout(opts) {
  opts = opts || {};
  if (PAYMENT_LINK) {
    var url = PAYMENT_LINK;
    var params = [];
    if (opts.email) params.push('prefilled_email=' + encodeURIComponent(opts.email));
    if (params.length) url += (url.indexOf('?') >= 0 ? '&' : '?') + params.join('&');
    window.location.href = url;
    return { mode: 'redirect' };
  }
  if (IS_DEV) return { mode: 'sandbox' };
  return { mode: 'unavailable' };
}

/**
 * Detect a return from Stripe: /?paid=1&session_id=cs_xxx
 * @returns {{ sessionId: string } | null}
 */
export function getReturnedSession() {
  if (typeof window === 'undefined') return null;
  var p = new URLSearchParams(window.location.search);
  if (p.get('paid') === '1' && p.get('session_id')) {
    return { sessionId: p.get('session_id') };
  }
  return null;
}

/** Remove payment params from the URL (avoid re-verification loops). */
export function clearReturnParams() {
  if (typeof window === 'undefined') return;
  var p = new URLSearchParams(window.location.search);
  p.delete('paid');
  p.delete('session_id');
  var clean = window.location.pathname + (p.toString() ? '?' + p.toString() : '');
  window.history.replaceState({}, '', clean);
}

/**
 * Verify a checkout session server-side.
 * @param {string} sessionId
 * @returns {Promise<{ paid: boolean, email?: string, error?: string }>}
 */
export async function verifySession(sessionId) {
  try {
    var res = await fetch('/api/verify-session?session_id=' + encodeURIComponent(sessionId));
    if (!res.ok) return { paid: false, error: 'verify_http_' + res.status };
    var data = await res.json();
    return { paid: !!data.paid, email: data.email || '' };
  } catch (e) {
    return { paid: false, error: e && e.message ? e.message : 'network_error' };
  }
}
