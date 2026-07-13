/**
 * MaNu PRO — Premium delivery (W15 + W16)
 *
 * Entrega del micro-pago: descarga del PDF en el navegador y envío por
 * email (Cloudflare Pages Function /api/send-report + Resend).
 * El PDF se genera client-side (jsPDF, dynamic import) — cero backend
 * para la descarga; el email solo necesita la Function configurada.
 */
import { track, EVENTS } from './analytics.js';

/** Download the premium PDF. Returns { success, filename? }. */
export async function downloadPremiumPdf(engine, store, lang, tier) {
  try {
    var mod = await import('./reportPdf.js');
    var filename = mod.downloadReport({ engine: engine, store: store, lang: lang });
    track(EVENTS.PDF_DOWNLOADED, { filename: filename }, { lang: lang, tier: tier || 'paid' });
    return { success: true, filename: filename };
  } catch (e) {
    console.error('[MaNu] PDF generation failed:', e);
    return { success: false, error: e && e.message };
  }
}

/** Email the premium report (PDF attached) via /api/send-report. */
export async function emailPremiumReport(engine, store, lang, email, tier) {
  if (!email) return { success: false, error: 'no_email' };
  try {
    var mod = await import('./reportPdf.js');
    var pdfBase64 = mod.reportAsBase64({ engine: engine, store: store, lang: lang });
    var payload = {
      email: email,
      lang: lang === 'en' ? 'en' : 'es',
      pdfBase64: pdfBase64,
      summary: {
        magicNumber: Math.round(engine.magic.real || 0),
        retirementAge: engine.nRetAge || null,
        yearsInRetirement: engine.nYP || null,
        desiredIncome: engine.nDes || null,
        currentSavings: engine.nEx || null,
        monthlySavings: Math.max(engine.mSav || 0, 0),
        investmentProfile: engine.retProfLabel || null,
      },
    };
    var res = await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { success: false, error: 'http_' + res.status };
    track(EVENTS.REPORT_EMAILED, {}, { lang: lang, tier: tier || 'paid' });
    return { success: true };
  } catch (e) {
    console.warn('[MaNu] report email failed (non-blocking):', e);
    return { success: false, error: e && e.message };
  }
}
