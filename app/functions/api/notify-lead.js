/**
 * MaNu PRO — Advisor Lead Notification (W48: "el enchufe" B2B)
 *
 * POST /api/notify-lead
 * Body: { contact: { name, email, phone }, financials: {...} }
 *
 * Cuando un usuario pide hablar con un asesor, este endpoint le manda el
 * lead completo por email al asesor configurado (Javier). Cambiar de
 * asesor = cambiar UNA env var. El lead ya quedó guardado en Supabase
 * antes de llamar acá — esto es solo la notificación en tiempo real.
 *
 * Env vars (Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY — re_...
 *   ADVISOR_EMAIL  — email del asesor que recibe los leads
 *   FROM_EMAIL     — ej: "MaNu PRO <leads@magic-number.app>"
 *   LEADS_BCC      — (opcional) copia oculta para los fundadores
 */

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function money(n) {
  if (n == null || n === '' || isNaN(n)) return '—';
  return '$' + Math.round(n).toLocaleString('en-US');
}

export async function onRequestPost(context) {
  var env = context.env;
  if (!env.RESEND_API_KEY || !env.ADVISOR_EMAIL) {
    return json({ ok: false, error: 'not_configured' }, 501);
  }

  var body;
  try { body = await context.request.json(); } catch (e) { return json({ ok: false, error: 'bad_json' }, 400); }

  var c = body.contact || {};
  var f = body.financials || {};
  if (!EMAIL_RE.test((c.email || '').trim())) return json({ ok: false, error: 'bad_email' }, 400);

  var rows = [
    ['Nombre', esc(c.name) || '—'],
    ['Email', esc(c.email)],
    ['Teléfono', esc(c.phone) || '—'],
    ['—', '—'],
    ['Edad', esc(f.age) || '—'],
    ['Edad de retiro', esc(f.retirementAge) || '—'],
    ['Años de retiro', esc(f.yearsInRetirement) || '—'],
    ['Magic Number', money(f.magicNumber)],
    ['Progreso hacia MN', f.mnProgressPct != null ? Number(f.mnProgressPct).toFixed(1) + '%' : '—'],
    ['Ingreso mensual', money(f.monthlyIncome)],
    ['Gastos mensuales', money(f.monthlyExpenses)],
    ['Ahorro mensual', money(f.monthlySavings)],
    ['Ahorro actual', money(f.currentSavings)],
    ['Deuda total', money(f.totalDebt)],
    ['Ingreso deseado en retiro', money(f.desiredIncome)],
    ['Perfil de inversión', esc(f.investmentProfile) || '—'],
    ['Health Score', f.healthScore != null ? esc(f.healthScore) + '/100' : '—'],
    ['—', '—'],
    ['Tier', esc(f.tier) || 'free'],
    ['Tab de origen', esc(f.sourceTab) || '—'],
    ['Idioma', esc(f.lang) || 'es'],
    ['Consentimiento', f.consent_given ? 'Sí (' + esc(f.consent_timestamp) + ')' : 'No registrado'],
  ];

  var rowsHtml = rows.map(function (r) {
    if (r[0] === '—') return '<tr><td colspan="2" style="padding:6px 0;"><hr style="border:none;border-top:1px solid #e2e8f0;"/></td></tr>';
    return '<tr>' +
      '<td style="padding:7px 12px;color:#64748b;font-size:13px;">' + r[0] + '</td>' +
      '<td style="padding:7px 12px;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">' + r[1] + '</td>' +
      '</tr>';
  }).join('');

  var html = '<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">' +
    '<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;margin:0 auto;background:#ffffff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;">' +
    '<tr><td style="background:#0f172a;padding:18px 24px;">' +
    '<span style="color:#60a5fa;font-weight:800;font-size:15px;">MaNu PRO</span> ' +
    '<span style="color:#94a3b8;font-size:13px;">· Nuevo lead para asesor</span>' +
    '</td></tr>' +
    '<tr><td style="padding:20px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + rowsHtml + '</table></td></tr>' +
    '<tr><td style="padding:0 24px 22px;color:#94a3b8;font-size:11px;line-height:1.6;">El usuario aceptó compartir su perfil financiero con un asesor verificado. Datos enviados automáticamente desde magic-number.app.</td></tr>' +
    '</table></body></html>';

  var subject = 'Nuevo lead MaNu: ' + (c.name || c.email) +
    (f.magicNumber ? ' — MN ' + money(f.magicNumber) : '');

  var payload = {
    from: env.FROM_EMAIL || 'MaNu PRO <onboarding@resend.dev>',
    to: [env.ADVISOR_EMAIL],
    reply_to: c.email,
    subject: subject,
    html: html,
  };
  if (env.LEADS_BCC) payload.bcc = [env.LEADS_BCC];

  try {
    var res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return json({ ok: false, error: 'resend_' + res.status }, 502);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: 'resend_unreachable' }, 502);
  }
}
