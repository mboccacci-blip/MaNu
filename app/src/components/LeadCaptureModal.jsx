import { useState } from 'react';
import Icon from './Icon';
import { submitLead } from '../lib/supabase';
import { track, EVENTS } from '../utils/analytics.js';

/**
 * LeadCaptureModal — Premium modal that captures advisor leads
 * with the user's financial profile automatically attached.
 */
export default function LeadCaptureModal({ show, onClose, financials, lang }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  if (!show) return null;

  const t = {
    title: lang === 'en' ? 'Connect with a Financial Advisor' : 'Conectá con un Asesor Financiero',
    subtitle: lang === 'en'
      ? 'A qualified advisor will receive your financial profile and contact you with personalized guidance.'
      : 'Un asesor calificado recibirá tu perfil financiero y te contactará con orientación personalizada.',
    nameLabel: lang === 'en' ? 'Your name' : 'Tu nombre',
    emailLabel: lang === 'en' ? 'Email' : 'Email',
    phoneLabel: lang === 'en' ? 'Phone (optional)' : 'Teléfono (opcional)',
    whatWeShare: lang === 'en' ? 'What your advisor will see:' : 'Lo que verá tu asesor:',
    submit: lang === 'en' ? 'Send my profile' : 'Enviar mi perfil',
    sending: lang === 'en' ? 'Sending...' : 'Enviando...',
    successTitle: lang === 'en' ? 'Profile sent!' : '¡Perfil enviado!',
    successMsg: lang === 'en'
      ? 'A financial advisor will review your profile and reach out soon.'
      : 'Un asesor financiero revisará tu perfil y te contactará pronto.',
    close: lang === 'en' ? 'Close' : 'Cerrar',
    errorMsg: lang === 'en' ? 'Something went wrong. Please try again.' : 'Algo salió mal. Intentá de nuevo.',
    invalidEmail: lang === 'en' ? 'Please enter a valid email' : 'Ingresá un email válido',
    privacy: lang === 'en'
      ? 'Your data is only shared with verified advisors. We never sell your information.'
      : 'Tu información solo se comparte con asesores verificados. Nunca vendemos tus datos.',
  };

  function fmt(v) {
    if (v == null || isNaN(v)) return '—';
    return '$' + Math.round(v).toLocaleString('en-US');
  }

  var highlights = [
    financials.healthScore != null && { label: lang === 'en' ? 'Health Score' : 'Score Financiero', value: financials.healthScore + '/100', color: financials.healthScore >= 70 ? '#22c55e' : financials.healthScore >= 40 ? '#eab308' : '#ef4444' },
    financials.magicNumber > 0 && { label: 'Magic Number', value: fmt(financials.magicNumber), color: '#60a5fa' },
    financials.mnProgressPct != null && { label: lang === 'en' ? 'Progress' : 'Progreso', value: financials.mnProgressPct.toFixed(1) + '%', color: financials.mnProgressPct >= 100 ? '#22c55e' : '#f59e0b' },
    financials.monthlySavings != null && { label: lang === 'en' ? 'Monthly savings' : 'Ahorro mensual', value: fmt(financials.monthlySavings), color: financials.monthlySavings > 0 ? '#22c55e' : '#ef4444' },
    financials.currentSavings > 0 && { label: lang === 'en' ? 'Current savings' : 'Ahorros actuales', value: fmt(financials.currentSavings), color: '#60a5fa' },
    financials.investmentProfile && { label: lang === 'en' ? 'Profile' : 'Perfil', value: financials.investmentProfile, color: '#a78bfa' },
  ].filter(Boolean);

  async function handleSubmit(e) {
    e.preventDefault();
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setErrorMsg(t.invalidEmail);
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    var result = await submitLead({ name: name, email: email, phone: phone }, financials);
    if (result.success) {
      setStatus('success');
      track(EVENTS.LEAD_SUBMITTED, { tier: financials.tier, source_tab: financials.sourceTab }, { lang: lang, tier: financials.tier });
    } else {
      setStatus('error');
      setErrorMsg(t.errorMsg);
    }
  }

  // Overlay + modal styles
  var overlay = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: 20,
    animation: 'fadeIn 0.2s ease-out',
  };
  var modal = {
    background: '#ffffff',
    borderRadius: 20, padding: '32px 28px', maxWidth: 440, width: '100%',
    border: '1px solid #e2e8f0',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    maxHeight: '90vh', overflowY: 'auto',
    animation: 'slideUp 0.3s ease-out',
    position: 'relative',
  };
  var inputStyle = {
    width: '100%', background: '#ffffff',
    border: '1px solid #cbd5e1', borderRadius: 12,
    color: '#0f172a', fontSize: 15, padding: '13px 16px',
    fontFamily: 'Outfit,sans-serif', outline: 'none',
    transition: 'border 0.2s',
    boxSizing: 'border-box',
  };

  // Success state
  if (status === 'success') {
    return (
      <div style={overlay} onClick={onClose}>
        <div style={modal} onClick={function(e){e.stopPropagation()}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}><Icon name="check-circle" size={48} weight="fill" color="#22c55e" /></div>
            <div style={{fontFamily:'Outfit,sans-serif',fontSize:22,fontWeight:700,color:'#22c55e',marginBottom:8}}>{t.successTitle}</div>
            <p style={{fontSize:14,color:'#94a3b8',lineHeight:1.6,marginBottom:24}}>{t.successMsg}</p>
            <button onClick={onClose} className="bp" style={{padding:'14px 32px',fontSize:15,fontWeight:700}}>{t.close}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={function(e){e.stopPropagation()}}>
        {/* Close button */}
        <button onClick={onClose} style={{position:'absolute',top:16,right:16,background:'none',border:'none',color:'#64748b',fontSize:20,cursor:'pointer',padding:4}}>×</button>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:36,marginBottom:12}}><Icon name="handshake" size={36} weight="regular" color="#60a5fa" /></div>
          <div style={{fontFamily:'Outfit,sans-serif',fontSize:20,fontWeight:700,color:'#0f172a',marginBottom:6}}>{t.title}</div>
          <p style={{fontSize:13,color:'#64748b',lineHeight:1.6,maxWidth:360,margin:'0 auto'}}>{t.subtitle}</p>
        </div>

        {/* Financial highlights preview */}
        {highlights.length > 0 && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>{t.whatWeShare}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {highlights.map(function(h){return(
                <div key={h.label} style={{padding:'5px 10px',borderRadius:8,background:'#f1f5f9',border:'1px solid #e2e8f0',fontSize:11}}>
                  <span style={{color:'#475569'}}>{h.label}: </span>
                  <strong style={{color:h.color}}>{h.value}</strong>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{display:'grid',gap:12,marginBottom:16}}>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#334155',marginBottom:4,display:'block'}}>{t.nameLabel}</label>
              <input type="text" value={name} onChange={function(e){setName(e.target.value)}} style={inputStyle} />
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#334155',marginBottom:4,display:'block'}}>{t.emailLabel} *</label>
              <input type="email" value={email} onChange={function(e){setEmail(e.target.value);setErrorMsg('')}} style={{...inputStyle, borderColor: errorMsg ? '#ef4444' : 'rgba(96,165,250,0.15)'}} required />
              {errorMsg && <div style={{color:'#ef4444',fontSize:11,marginTop:4}}>{errorMsg}</div>}
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#334155',marginBottom:4,display:'block'}}>{t.phoneLabel}</label>
              <input type="tel" inputMode="numeric" value={phone} onChange={function(e){setPhone(e.target.value.replace(/[^0-9+\-() ]/g,''))}} onBlur={function(){var d=phone.replace(/[^0-9]/g,'');if(d.length>0&&d.length<7){setErrorMsg(lang==='en'?'Phone number seems too short':'El teléfono parece muy corto')}}} placeholder={lang==='en'?'+1 (555) 123-4567':'+54 11 1234-5678'} style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={status==='sending'} className="bp" style={{width:'100%',padding:'14px 24px',fontSize:15,fontWeight:700,opacity:status==='sending'?0.7:1}}>
            {status === 'sending' ? t.sending : t.submit}
          </button>
        </form>

        {/* Privacy note */}
        <div style={{marginTop:14,fontSize:11,color:'#64748b',textAlign:'center',lineHeight:1.5}}>
          <Icon name="lock" size={11} weight="regular" /> {t.privacy}
        </div>
      </div>
    </div>
  );
}
