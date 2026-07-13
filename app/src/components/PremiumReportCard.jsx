import { useState } from 'react';
import Card from './Card.jsx';
import Icon from './Icon.jsx';
import useAppStore from '../store/useAppStore.js';
import { useEngine } from '../hooks/EngineContext.jsx';
import { downloadPremiumPdf, emailPremiumReport } from '../utils/premiumDelivery.js';

/**
 * PremiumReportCard — visible solo para tier "paid" (y demo).
 * Descarga el informe PDF premium y permite reenviarlo por email.
 */
export default function PremiumReportCard() {
  var { engine, tier, lang, isDemo } = useEngine();
  var store = useAppStore();
  var [downloading, setDownloading] = useState(false);
  var [emailState, setEmailState] = useState('idle'); // idle | sending | sent | error

  if (tier !== 'paid' && !isDemo) return null;
  if (!(engine.magic && engine.magic.real > 0)) return null;

  var t = {
    label: lang === 'en' ? 'YOUR PREMIUM REPORT' : 'TU INFORME PREMIUM',
    title: lang === 'en' ? 'Your full retirement plan, in PDF' : 'Tu plan de retiro completo, en PDF',
    sub: lang === 'en'
      ? 'Exact Magic Number, year-by-year trajectory, savings targets per profile, cost of waiting and full methodology. If you entered income, debts, expenses or goals, those analyses are added automatically.'
      : 'Magic Number exacto, trayectoria año a año, metas de ahorro por perfil, costo de esperar y metodología completa. Si cargaste ingresos, deudas, gastos o metas, esos análisis se agregan automáticamente.',
    download: lang === 'en' ? 'Download PDF' : 'Descargar PDF',
    downloading: lang === 'en' ? 'Generating...' : 'Generando...',
    email: lang === 'en' ? 'Send to my email' : 'Enviar a mi email',
    sending: lang === 'en' ? 'Sending...' : 'Enviando...',
    sent: lang === 'en' ? 'Sent! Check your inbox.' : '¡Enviado! Revisá tu casilla.',
    error: lang === 'en' ? 'Could not send. Try downloading instead.' : 'No se pudo enviar. Probá descargarlo.',
    updates: lang === 'en' ? 'The report always uses your latest numbers.' : 'El informe siempre usa tus números más recientes.',
  };

  function handleDownload() {
    setDownloading(true);
    downloadPremiumPdf(engine, store, lang, tier).then(function () { setDownloading(false); });
  }
  function handleEmail() {
    setEmailState('sending');
    emailPremiumReport(engine, store, lang, store.userEmail, tier).then(function (r) {
      setEmailState(r.success ? 'sent' : 'error');
    });
  }

  return (
    <Card glow="gold" style={{ padding: '26px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#a16207', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
        <Icon name="file-text" size={12} weight="regular" /> {t.label}
      </div>
      <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{t.title}</div>
      <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 16px' }}>{t.sub}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="bp" disabled={downloading} onClick={handleDownload} style={{ padding: '12px 26px', fontSize: 13.5, fontWeight: 700, background: 'linear-gradient(135deg,#a16207,#ca8a04)', opacity: downloading ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Icon name="download-simple" size={16} weight="bold" /> {downloading ? t.downloading : t.download}
        </button>
        {store.userEmail && emailState !== 'sent' && (
          <button disabled={emailState === 'sending'} onClick={handleEmail} style={{ padding: '12px 22px', borderRadius: 12, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)', color: '#3b82f6', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', opacity: emailState === 'sending' ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Icon name="paper-plane-tilt" size={15} weight="regular" /> {emailState === 'sending' ? t.sending : t.email}
          </button>
        )}
      </div>
      {emailState === 'sent' && <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: '#22c55e' }}><Icon name="check-circle" size={13} weight="fill" /> {t.sent}</div>}
      {emailState === 'error' && <div style={{ marginTop: 10, fontSize: 12, color: '#ef4444' }}>{t.error}</div>}
      <div style={{ marginTop: 10, fontSize: 10.5, color: '#94a3b8' }}>{t.updates}</div>
    </Card>
  );
}
