/**
 * MaNu PRO — Verify Stripe Checkout Session (W17)
 *
 * GET /api/verify-session?session_id=cs_xxx
 *
 * Verifica SERVER-SIDE que la sesión de checkout esté pagada antes de que
 * el cliente active el tier "paid". Mantiene el paywall estricto: el
 * cliente nunca puede desbloquear sin un pago real verificado.
 *
 * Env vars (Cloudflare Pages → Settings → Environment variables):
 *   STRIPE_SECRET_KEY — sk_live_... (o sk_test_... para pruebas)
 *
 * Respuestas:
 *   200 { paid: true,  email: "..." }
 *   200 { paid: false, error: "..." }
 *   501 { paid: false, error: "not_configured" }  ← Stripe aún sin cuenta
 */

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestGet(context) {
  var env = context.env;
  var url = new URL(context.request.url);
  var sessionId = url.searchParams.get('session_id') || '';

  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return json({ paid: false, error: 'bad_session_id' }, 400);
  }
  if (!env.STRIPE_SECRET_KEY) {
    return json({ paid: false, error: 'not_configured' }, 501);
  }

  try {
    var res = await fetch(
      'https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId),
      { headers: { Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY } }
    );
    if (!res.ok) return json({ paid: false, error: 'stripe_' + res.status }, 502);
    var s = await res.json();
    var paid = s.payment_status === 'paid';
    var email =
      (s.customer_details && s.customer_details.email) || s.customer_email || '';
    return json({ paid: paid, email: paid ? email : '' });
  } catch (e) {
    return json({ paid: false, error: 'stripe_unreachable' }, 502);
  }
}
