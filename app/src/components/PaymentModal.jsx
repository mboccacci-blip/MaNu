import { useState } from 'react';
import Icon from './Icon.jsx';
import { startCheckout, PRICE_LABEL, PAYMENT_LINK, IS_DEV } from '../utils/payment.js';
import { track, EVENTS } from '../utils/analytics.js';

/**
 * PaymentModal — Perfil Full ($3.99) checkout entry point.
 *
 * - Con VITE_STRIPE_LINK configurado: redirige al Payment Link de Stripe
 *   (Stripe captura el email — decisión D3). Al volver, Main verifica la
 *   sesión server-side y activa el tier "paid".
 * - En desarrollo local sin link: permite simular el pago (sandbox) para
 *   probar el flujo completo (PDF + email). NUNCA disponible en producción.
 * - En producción sin link: informa que el pago estará disponible pronto.
 */
export default function PaymentModal({ show, onClose, lang, tier, sourceTab, userEmail, onSandboxSuccess }) {
  const [status, setStatus] = useState('idle'); // idle | redirecting | unavailable

  if (!show) return null;

  var t = {
    title: lang === 'en' ? 'Full Profile — ' + PRICE_LABEL : 'Perfil Full — ' + PRICE_LABEL,
    subtitle: lang === 'en' ? 'One-time payment. Yours forever.' : 'Pago único. Tuyo para siempre.',
    b1: lang === 'en' ? 'Your exact Magic Number (no ranges)' : 'Tu Magic Number exacto (sin rangos)',
    b2: lang === 'en' ? 'Premium PDF report: your full retirement plan, downloadable and emailed' : 'Informe PDF premium: tu plan de retiro completo, descargable y por email',
    b3: lang === 'en' ? 'Interactive simulator with all investment profiles' : 'Simulador interactivo con todos los perfiles de inversión',
    b4: lang === 'en' ? 'Every analysis module unlocked' : 'Todos los módulos de análisis desbloqueados',
    pay: lang === 'en' ? 'Pay ' + PRICE_LABEL + ' with card' : 'Pagar ' + PRICE_LABEL + ' con tarjeta',
    paySub: lang === 'en' ? 'Secure payment via Stripe. Your email is captured at checkout to send your report.' : 'Pago seguro vía Stripe. Tu email se captura en el checkout para enviarte el informe.',
    redirecting: lang === 'en' ? 'Redirecting to secure checkout...' : 'Redirigiendo al pago seguro...',
    unavailable: lang === 'en' ? 'Payments are almost ready. Leave your email in the free option and we’ll let you know the moment it’s live.' : 'Los pagos están casi listos. Dejá tu email en la opción gratis y te avisamos apenas esté disponible.',
    sandbox: lang === 'en' ? 'DEV — Simulate successful payment' : 'DEV — Simular pago exitoso',
    close: lang === 'en' ? 'Close' : 'Cerrar',
    secure: lang === 'en' ? 'Processed by Stripe. We never see your card.' : 'Procesado por Stripe. Nunca vemos tu tarjeta.',
  };

  function handlePay() {
    track(EVENTS.CHECKOUT_STARTED, { source_tab: sourceTab || null, has_link: !!PAYMENT_LINK }, { lang: lang, tier: tier });
    var r = startCheckout({ email: userEmail });
    if (r.mode === 'redirect') { setStatus('redirecting'); return; }
    if (r.mode === 'sandbox') { onSandboxSuccess && onSandboxSuccess(); return; }
    setStatus('unavailable');
  }

  var benefits = [t.b1, t.b2, t.b3, t.b4];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 18, padding: '28px 26px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={function (e) { e.stopPropagation(); }}>
        <button onClick={onClose} aria-label={t.close} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(15,23,42,0.05)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: '#64748b', fontSize: 14, fontWeight: 700 }}>×</button>

        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ marginBottom: 8 }}><Icon name="lock-open" size={30} weight="regular" color="#eab308" /></div>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 21, fontWeight: 800, color: '#0f172a' }}>{t.title}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{t.subtitle}</div>
        </div>

        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {benefits.map(function (b, i) {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.10)' }}>
                <Icon name="check-circle" size={16} weight="fill" color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{b}</span>
              </div>
            );
          })}
        </div>

        {status === 'unavailable' ? (
          <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 13, color: '#92400e', lineHeight: 1.6, textAlign: 'center' }}>
            <Icon name="info" size={14} weight="regular" /> {t.unavailable}
          </div>
        ) : (
          <>
            <button className="bp" disabled={status === 'redirecting'} onClick={handlePay} style={{ width: '100%', padding: '14px 24px', fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg,#a16207,#ca8a04)', opacity: status === 'redirecting' ? 0.6 : 1 }}>
              {status === 'redirecting' ? t.redirecting : t.pay + ' →'}
            </button>
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 10, textAlign: 'center', lineHeight: 1.5 }}>
              <Icon name="lock" size={10} weight="regular" /> {t.secure}
              <div style={{ marginTop: 4 }}>{t.paySub}</div>
            </div>
            {IS_DEV && !PAYMENT_LINK && (
              <button onClick={function () { onSandboxSuccess && onSandboxSuccess(); }} style={{ width: '100%', marginTop: 12, padding: '10px 16px', borderRadius: 10, background: 'rgba(124,58,237,0.08)', border: '1px dashed rgba(124,58,237,0.4)', color: '#7c3aed', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                🧪 {t.sandbox}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
