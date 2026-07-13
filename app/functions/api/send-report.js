/**
 * MaNu PRO — Send Premium Report Email (W16)
 *
 * POST /api/send-report
 * Body: { email, lang, pdfBase64, summary: { magicNumber, retirementAge,
 *         yearsInRetirement, desiredIncome, currentSavings, monthlySavings,
 *         investmentProfile } }
 *
 * Envía la "tarjeta HTML" (dashboard macro del MN) + el informe PDF adjunto
 * vía Resend (resend.com — free tier 3.000 emails/mes).
 *
 * Env vars (Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY — re_...
 *   FROM_EMAIL     — ej: "MaNu PRO <informes@magic-number.app>"
 *                    (el dominio debe estar verificado en Resend)
 *
 * Regla de producto: este email SOLO enriquece la compra — nunca desbloquea tiers.
 */

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MAX_PDF_B64 = 6 * 1024 * 1024; // ~4.5MB PDF

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function money(n) {
  if (n == null || isNaN(n)) return '$0';
  return '$' + Math.round(n).toLocaleString('en-US');
}

function buildHtml(lang, s) {
  var es = lang !== 'en';
  var title = es ? 'Tu Magic Number' : 'Your Magic Number';
  var phrase = es
    ? 'Juntando este capital a tus ' + s.retirementAge + ' años, te asegurás ' + money(s.desiredIncome) + ' por mes durante ' + s.yearsInRetirement + ' años de retiro.'
    : 'Accumulating this capital by age ' + s.retirementAge + ', you secure ' + money(s.desiredIncome) + ' per month for ' + s.yearsInRetirement + ' years of retirement.';
  var rows = [
    [es ? 'Edad de retiro' : 'Retirement age', s.retirementAge],
    [es ? 'Años de retiro' : 'Years in retirement', s.yearsInRetirement],
    [es ? 'Ingreso mensual necesario' : 'Required monthly income', money(s.desiredIncome)],
    [es ? 'Ahorro actual' : 'Current savings', money(s.currentSavings)],
    [es ? 'Ahorro mensual' : 'Monthly savings', money(s.monthlySavings)],
    [es ? 'Perfil de inversión' : 'Investment profile', s.investmentProfile || '—'],
  ];
  var rowsHtml = rows
    .map(function (r) {
      return '<tr>' +
        '<td style="padding:8px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #1e293b;">' + r[0] + '</td>' +
        '<td style="padding:8px 12px;color:#f1f5f9;font-size:13px;font-weight:700;text-align:right;border-bottom:1px solid #1e293b;">' + r[1] + '</td>' +
        '</tr>';
    })
    .join('');
  var attached = es
    ? 'Tu informe premium completo está adjunto en PDF: trayectoria año a año, metas de ahorro por perfil, costo de esperar y metodología.'
    : 'Your full premium report is attached as a PDF: year-by-year trajectory, savings targets per profile, cost of waiting and methodology.';
  var disclaimer = es
    ? 'Este email es educativo y no constituye asesoramiento financiero. MaNu PRO · magic-number.app'
    : 'This email is educational and does not constitute financial advice. MaNu PRO · magic-number.app';

  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;"><tr><td align="center">' +
    '<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">' +
    // Header
    '<tr><td style="padding:0 20px 14px;text-align:center;">' +
    '<span style="display:inline-block;background:#3b82f6;color:#fff;font-weight:800;border-radius:8px;padding:6px 10px;font-size:14px;">MN</span>' +
    '<span style="color:#0f172a;font-size:18px;font-weight:800;margin-left:8px;">MaNu PRO</span>' +
    '</td></tr>' +
    // Card
    '<tr><td style="padding:0 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:16px;overflow:hidden;">' +
    '<tr><td style="padding:32px 28px 10px;text-align:center;">' +
    '<div style="color:#60a5fa;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">' + title + '</div>' +
    '<div style="color:#ffffff;font-size:42px;font-weight:900;margin:10px 0 6px;">' + money(s.magicNumber) + '</div>' +
    '<div style="color:#94a3b8;font-size:13px;line-height:1.6;max-width:400px;margin:0 auto;">' + phrase + '</div>' +
    '</td></tr>' +
    '<tr><td style="padding:18px 28px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + rowsHtml + '</table></td></tr>' +
    '<tr><td style="padding:16px 28px 28px;text-align:center;">' +
    '<a href="https://magic-number.app" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;">' + (es ? 'Abrir mi plan' : 'Open my plan') + ' →</a>' +
    '</td></tr>' +
    '</table></td></tr>' +
    // Attached note + footer
    '<tr><td style="padding:16px 32px 6px;color:#475569;font-size:12.5px;line-height:1.6;text-align:center;">📎 ' + attached + '</td></tr>' +
    '<tr><td style="padding:10px 32px 24px;color:#94a3b8;font-size:11px;line-height:1.6;text-align:center;">' + disclaimer + '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

export async function onRequestPost(context) {
  var env = context.env;
  if (!env.RESEND_API_KEY) return json({ ok: false, error: 'not_configured' }, 501);

  var body;
  try { body = await context.request.json(); } catch (e) { return json({ ok: false, error: 'bad_json' }, 400); }

  var email = (body.email || '').trim();
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'bad_email' }, 400);
  var lang = body.lang === 'en' ? 'en' : 'es';
  var summary = body.summary || {};
  var pdfBase64 = typeof body.pdfBase64 === 'string' ? body.pdfBase64 : '';
  if (pdfBase64.length > MAX_PDF_B64) return json({ ok: false, error: 'pdf_too_large' }, 413);

  var from = env.FROM_EMAIL || 'MaNu PRO <onboarding@resend.dev>';
  var subject = lang === 'en'
    ? 'Your Magic Number: ' + money(summary.magicNumber) + ' — Premium Report'
    : 'Tu Magic Number: ' + money(summary.magicNumber) + ' — Informe Premium';

  var payload = {
    from: from,
    to: [email],
    subject: subject,
    html: buildHtml(lang, summary),
  };
  if (pdfBase64) {
    payload.attachments = [{
      filename: lang === 'en' ? 'MagicNumber-Report.pdf' : 'MagicNumber-Informe.pdf',
      content: pdfBase64,
    }];
  }

  try {
    var res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      var errText = await res.text();
      return json({ ok: false, error: 'resend_' + res.status, detail: errText.slice(0, 300) }, 502);
    }
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: 'resend_unreachable' }, 502);
  }
}
