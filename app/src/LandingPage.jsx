import { useState, useEffect } from 'react';
import './landing.css';
import Icon from './components/Icon';

/* ----------------------------------------------------------------
   Financial metrics — Magic Number PRO context
   ---------------------------------------------------------------- */
const INITIAL_METRICS = [
  {
    id: 'mn',
    icon: 'magic-wand',
    iconBg: 'rgba(0,212,255,0.10)',
    iconColor: '#00D4FF',
    name: 'Magic Number',
    sub: 'Retiro a los 60',
    value: 1_240_000,
    format: 'currency',
    change: +0.82,
  },
  {
    id: 'fire',
    icon: 'fire',
    iconBg: 'rgba(249,115,22,0.12)',
    iconColor: '#F97316',
    name: 'FIRE Rate',
    sub: 'Safe Withdrawal',
    value: 4.0,
    format: 'percent',
    change: 0,
  },
  {
    id: 'savings',
    icon: 'currency-dollar',
    iconBg: 'rgba(16,185,129,0.12)',
    iconColor: '#10B981',
    name: 'Ahorro mensual',
    sub: 'Objetivo sugerido',
    value: 3_250,
    format: 'currency',
    change: +1.14,
  },
  {
    id: 'inv',
    icon: 'chart-line-up',
    iconBg: 'rgba(167,139,250,0.12)',
    iconColor: '#A78BFA',
    name: 'Retorno anual',
    sub: 'Portafolio mixto',
    value: 8.4,
    format: 'percent',
    change: -0.21,
  },
  {
    id: 'years',
    icon: 'hourglass',
    iconBg: 'rgba(240,185,11,0.10)',
    iconColor: '#F0B90B',
    name: 'Años p/ retiro',
    sub: 'Según tu plan',
    value: 22,
    format: 'years',
    change: -4.55,
  },
];

const NEWS_ES = [
  { text: 'El interés compuesto es la fuerza más poderosa del universo — cuanto antes empieces, más crece', highlight: 'más crece' },
  { text: 'Los fondos indexados históricamente superaron a gestores activos en horizontes de 15+ años', highlight: 'superaron' },
  { text: 'El movimiento FIRE gana tracción en LATAM: retirarse antes de los 50 es posible con planificación', highlight: 'antes de los 50' },
];

const NEWS_EN = [
  { text: 'Compound interest is the most powerful force in the universe — the earlier you start, the more it grows', highlight: 'the more it grows' },
  { text: 'Index funds have historically outperformed active managers over 15+ year horizons', highlight: 'outperformed' },
  { text: 'The FIRE movement gains traction globally: retiring before 50 is possible with proper planning', highlight: 'before 50' },
];

/* ----------------------------------------------------------------
   Format helpers
   ---------------------------------------------------------------- */
function fmt(val, format, lang) {
  if (format === 'currency') {
    return new Intl.NumberFormat(lang === 'es' ? 'es-AR' : 'en-US', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 0,
    }).format(val);
  }
  if (format === 'percent') return `${val.toFixed(1)}%`;
  if (format === 'years') return lang === 'es' ? `${val} años` : `${val} yrs`;
  return val;
}

/* ----------------------------------------------------------------
   Translations
   ---------------------------------------------------------------- */
const T = {
  es: {
    navFeatures:  'Funciones',
    navPricing:   'Estadísticas',
    navFaq:       '',
    freeBadge:    'EMPEZ\u00c1 GRATIS',
    login:        'Ver App',
    register:     'Empezar ahora',
    freePill:     'Sin registro · Sin tarjeta · Resultado en minutos',
    h1a:          'Calculá tu',
    h1b:          'Magic Number.',
    sub:          'Descubrí exactamente cuánto necesitás para alcanzar tu libertad financiera. Sin formularios, sin datos personales — solo abrís y empezás.',
    noReg1:       'Sin registro',
    noReg2:       'Sin tarjeta de crédito',
    noReg3:       'Resultado en segundos',
    cta:          'Calculá en 3 minutos cuánto necesitás',
    g1:           'Empez\u00e1 gratis',
    g2:           'Sin crear cuenta',
    g3:           'Corre en tu navegador',
    badge1num:    '16',
    badge1lbl:    'Módulos de análisis',
    badge2num:    '7+',
    badge2lbl:    'Perfiles de inversión',
    badge3num:    '0-100',
    badge3lbl:    'Score de salud financiera',
    tabPop:       'Indicadores',
    tabNew:       'Contexto',
    viewMore:     'Ver en vivo →',
    news:         'Contexto financiero',
    previewNote:  'Así se ve tu dashboard personalizado.',
    previewLink:  'Abrí la app para ver el tuyo →',
    feat1title:   'Tu Magic Number',
    feat1desc:    'El capital exacto que necesitás acumular para que tus inversiones cubran tu estilo de vida para siempre.',
    feat2title:   'Simulador FIRE',
    feat2desc:    'Explorá distintos escenarios de retiro: cuándo, cuánto ahorrás, qué retorno esperás. Decidí con datos reales.',
    feat3title:   'Analítica Personal',
    feat3desc:    'Visualizá tu avance, identificá brechas y recibí insights sobre cómo acelerar tu camino a la libertad financiera.',
    stat1num:     '10 min',
    stat1lbl:     'Calculá tu número',
    stat2num:     '3',
    stat2lbl:     'Escenarios simultáneos',
    stat3num:     '15+',
    stat3lbl:     'Categorías de gasto',
    stat4num:     '100%',
    stat4lbl:     'Gratis · Siempre',
    ctaH2:        'Tu futuro empieza hoy.',
    ctaP:         'Descubrí exactamente cuánto necesitás para tu retiro.',
    ctaFreeNote:  'Sin registro · Sin datos · Sin tarjeta',
    ctaMain:      'Calcul\u00e1 tu Magic Number',
    ctaSecond:    'Ver demo completo →',
    footerCopy:   'MaNu PRO · Calculá. Planificá. Retírate libre.',
    footerPriv:   'Privacidad',
    footerTerms:  'Términos',
    footerContact:'Contacto',
  },
  en: {
    navFeatures:  'Features',
    navPricing:   'Stats',
    navFaq:       '',
    freeBadge:    'START FREE',
    login:        'Open App',
    register:     'Get started',
    freePill:     'No signup · No credit card · Results in minutes',
    h1a:          'Calculate your',
    h1b:          'Magic Number.',
    sub:          'Find exactly how much you need to achieve financial freedom. No forms, no personal data — just open and start.',
    noReg1:       'No signup required',
    noReg2:       'No credit card',
    noReg3:       'Results in seconds',
    cta:          'Find your number in 3 minutes',
    g1:           'Start free',
    g2:           'No account needed',
    g3:           'Runs in your browser',
    badge1num:    '16',
    badge1lbl:    'Analysis modules',
    badge2num:    '7+',
    badge2lbl:    'Investment profiles',
    badge3num:    '0-100',
    badge3lbl:    'Financial health score',
    tabPop:       'Metrics',
    tabNew:       'Context',
    viewMore:     'See live →',
    news:         'Financial context',
    previewNote:  'This is your personalized dashboard.',
    previewLink:  'Open the app to see yours →',
    feat1title:   'Your Magic Number',
    feat1desc:    'The exact capital you need so your investments cover your lifestyle forever — no guesswork.',
    feat2title:   'FIRE Simulator',
    feat2desc:    'Explore retirement scenarios: when you retire, savings rate, expected return. Decide with real data.',
    feat3title:   'Personal Analytics',
    feat3desc:    'Track your progress, spot gaps, and get automatic insights on how to accelerate your financial freedom.',
    stat1num:     '10 min',
    stat1lbl:     'Calculate your number',
    stat2num:     '3',
    stat2lbl:     'Simultaneous scenarios',
    stat3num:     '15+',
    stat3lbl:     'Expense categories',
    stat4num:     '100%',
    stat4lbl:     'Free · Always',
    ctaH2:        'Your future starts today.',
    ctaP:         'Find exactly how much you need for retirement.',
    ctaFreeNote:  'No signup · No data · No credit card',
    ctaMain:      'Calculate your Magic Number',
    ctaSecond:    'View full demo →',
    footerCopy:   'MaNu PRO · Calculate. Plan. Retire free.',
    footerPriv:   'Privacy',
    footerTerms:  'Terms',
    footerContact:'Contact',
  },
};

/* ----------------------------------------------------------------
   Ticker Panel — LEFT side
   ---------------------------------------------------------------- */
function TickerPanel({ lang, t, onEnter }) {
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [flashMap, setFlashMap] = useState({});
  const [activeTab, setActiveTab] = useState('metrics');
  const news = lang === 'es' ? NEWS_ES : NEWS_EN;

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => {
        if (m.format === 'years' || m.format === 'percent') return m;
        const jitter = (Math.random() - 0.48) * m.value * 0.0015;
        return { ...m, value: m.value + jitter };
      }));
      const id = INITIAL_METRICS[Math.floor(Math.random() * INITIAL_METRICS.length)].id;
      setFlashMap(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setFlashMap(prev => ({ ...prev, [id]: false })), 400);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lp-hero-right">
      <div className="lp-panel">
        <div className="lp-panel-header">
          <div className="lp-panel-tabs">
            <button
              className={`lp-panel-tab${activeTab === 'metrics' ? ' active' : ''}`}
              onClick={() => setActiveTab('metrics')}
            >
              {t.tabPop}
            </button>
            <button
              className={`lp-panel-tab${activeTab === 'news' ? ' active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              {t.tabNew}
            </button>
          </div>
          <button className="lp-panel-link" onClick={onEnter}>{t.viewMore}</button>
        </div>

        {activeTab === 'metrics' ? (
          <>
            {metrics.map(m => (
              <div key={m.id} className="lp-metric-row" onClick={onEnter}>
                <div className="lp-metric-left">
                  <div className="lp-metric-icon" style={{ background: m.iconBg, color: m.iconColor }}>
                    <Icon name={m.icon} size={20} weight="regular" />
                  </div>
                  <div>
                    <div className="lp-metric-name">{m.name}</div>
                    <div className="lp-metric-sub">{m.sub}</div>
                  </div>
                </div>
                <div className="lp-metric-right">
                  <div className={`lp-metric-val${flashMap[m.id] ? ' animate' : ''}`}>
                    {fmt(m.value, m.format, lang)}
                  </div>
                  <div className={`lp-metric-change ${m.change >= 0 ? 'pos' : 'neg'}`}>
                    {m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
            <div className="lp-panel-preview-label">
              {t.previewNote}{' '}
              <span onClick={onEnter}>{t.previewLink}</span>
            </div>
          </>
        ) : (
          <div>
            {news.map((n, i) => (
              <div key={i} className="lp-news-item">
                {n.text.split(n.highlight).map((part, j) =>
                  j === 0
                    ? <span key={j}>{part}</span>
                    : <span key={j}><span className="lp-news-highlight">{n.highlight}</span>{part}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {activeTab === 'metrics' && (
        <div className="lp-news-panel">
          <div className="lp-news-title">{t.news}</div>
          {news.slice(0, 2).map((n, i) => (
            <div key={i} className="lp-news-item">
              {n.text.split(n.highlight).map((part, j) =>
                j === 0
                  ? <span key={j}>{part}</span>
                  : <span key={j}><span>{n.highlight}</span>{part}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   Main Landing Page
   ---------------------------------------------------------------- */
export default function LandingPage({ onEnter, initialLang = 'es' }) {
  const [lang, setLang] = useState(initialLang);
  const t = T[lang];

  return (
    <div className="lp-root">
      {/* ---- NAVBAR ---- */}
      {/* a11y: skip-to-content link for keyboard users */}
      <nav className="lp-nav" role="navigation" aria-label="Main navigation">
        <div className="lp-nav-left">
          <a className="lp-nav-logo" href="#" onClick={e => e.preventDefault()}>
            <div className="lp-nav-logo-icon">MN</div>
            <span className="lp-nav-logo-name">MaNu <span>PRO</span></span>
          </a>
          <span className="lp-nav-free-badge">{t.freeBadge}</span>
        </div>

        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link" onClick={e => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>{t.navFeatures}</a>
          <a href="#stats" className="lp-nav-link" onClick={e => { e.preventDefault(); document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' }); }}>{t.navPricing}</a>
          {t.navFaq && <a href="#cta" className="lp-nav-link" onClick={e => { e.preventDefault(); document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }); }}>{t.navFaq}</a>}
        </div>

        <div className="lp-nav-actions">
          <button className="lp-lang-btn" onClick={() => setLang(l => l === 'es' ? 'en' : 'es')}>
            {lang === 'es' ? 'EN' : 'ES'}
          </button>
          <button className="lp-btn-ghost" onClick={onEnter}>{t.login}</button>
          <button className="lp-btn-cyan" onClick={onEnter}>{t.register}</button>
        </div>
      </nav>

      <main>
      {/* ---- HERO (panel LEFT, text RIGHT) ---- */}
      <section className="lp-hero">

        {/* LEFT — Ticker panel */}
        <TickerPanel lang={lang} t={t} onEnter={onEnter} />

        {/* RIGHT — Text & CTA */}
        <div className="lp-hero-left">

          {/* Free pill */}
          <div className="lp-free-pill lp-fade-up lp-fade-up-d1">
            <span className="lp-free-pill-dot" />
            <span className="lp-free-pill-text">{t.freePill}</span>
          </div>

          {/* Headline */}
          <h1 className="lp-hero-headline lp-fade-up lp-fade-up-d2">
            {t.h1a}<br />
            <span className="hl-gradient">{t.h1b}</span>
          </h1>

          {/* Sub */}
          <p className="lp-hero-sub lp-fade-up lp-fade-up-d3">{t.sub}</p>

          {/* No-register checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} className="lp-fade-up lp-fade-up-d3">
            {[t.noReg1, t.noReg2, t.noReg3].map((item, i) => (
              <div key={i} className="lp-no-reg">
                <span style={{ color: '#10B981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="check-circle" size={14} weight="fill" color="#10B981" /> {item}</span>
              </div>
            ))}
          </div>

          {/* CTA block */}
          <div className="lp-cta-block lp-fade-up lp-fade-up-d4">
            <button className="lp-cta-main" onClick={onEnter}>{t.cta}</button>
            <div className="lp-cta-guarantees">
              {[
                { icon: 'infinity', label: t.g1 },
                { icon: 'lock-open', label: t.g2 },
                { icon: 'lightning', label: t.g3 },
              ].map((g, i) => (
                <div key={i} className="lp-guarantee">
                  <span className="lp-guarantee-icon"><Icon name={g.icon} size={16} weight="regular" /></span>
                  <span>{g.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats badges */}
          <div className="lp-badges lp-fade-up lp-fade-up-d5">
            <div className="lp-badge">
              <span className="lp-badge-num">{t.badge1num}</span>
              <span className="lp-badge-label">{t.badge1lbl}</span>
            </div>
            <div className="lp-badge-divider" />
            <div className="lp-badge">
              <span className="lp-badge-num">{t.badge2num}</span>
              <span className="lp-badge-label">{t.badge2lbl}</span>
            </div>
            <div className="lp-badge-divider" />
            <div className="lp-badge">
              <span className="lp-badge-num">{t.badge3num}</span>
              <span className="lp-badge-label">{t.badge3lbl}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FEATURES ---- */}
      <section className="lp-features" id="features">
        <div className="lp-features-inner">
          <div className="lp-feat">
            <div className="lp-feat-icon"><Icon name="magic-wand" size={24} weight="regular" /></div>
            <h2 className="lp-feat-title">{t.feat1title}</h2>
            <p className="lp-feat-desc">{t.feat1desc}</p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-icon purple"><Icon name="fire" size={24} weight="regular" /></div>
            <h2 className="lp-feat-title">{t.feat2title}</h2>
            <p className="lp-feat-desc">{t.feat2desc}</p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-icon gold"><Icon name="chart-bar" size={24} weight="regular" /></div>
            <h2 className="lp-feat-title">{t.feat3title}</h2>
            <p className="lp-feat-desc">{t.feat3desc}</p>
          </div>
        </div>
      </section>

      {/* ---- STATS ---- */}
      <section className="lp-stats-section" id="stats">
        <div className="lp-stats">
          <div>
            <div className="lp-stat-num">{t.stat1num}</div>
            <div className="lp-stat-label">{t.stat1lbl}</div>
          </div>
          <div>
            <div className="lp-stat-num">{t.stat2num}</div>
            <div className="lp-stat-label">{t.stat2lbl}</div>
          </div>
          <div>
            <div className="lp-stat-num">{t.stat3num}</div>
            <div className="lp-stat-label">{t.stat3lbl}</div>
          </div>
          <div>
            <div className="lp-stat-num">{t.stat4num}</div>
            <div className="lp-stat-label">{t.stat4lbl}</div>
          </div>
        </div>
      </section>

      {/* ---- SECOND CTA ---- */}
      <section className="lp-cta-section" id="cta">
        <div className="lp-cta-inner">
          <div className="lp-cta-text">
            <h2>{t.ctaH2}</h2>
            <p>{t.ctaP}</p>
            <p className="lp-cta-free-note">{t.ctaFreeNote}</p>
          </div>
          <div className="lp-cta-actions">
            <button className="lp-btn-ghost" onClick={function(){window.location.href = window.location.pathname + '?demo=1';}}>{t.ctaSecond}</button>
            <button className="lp-btn-cyan" onClick={onEnter} style={{ padding: '14px 28px', fontSize: 15 }}>
              {t.ctaMain}
            </button>
          </div>
        </div>
      </section>

      </main>
      {/* ---- FOOTER ---- */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <span className="lp-footer-copy">
            © 2026 <span>MaNu PRO</span>. {t.footerCopy}
          </span>
          <div className="lp-footer-links">
            <a className="lp-footer-link" href="/privacy.html" target="_blank" rel="noopener">{t.footerPriv}</a>
            <a className="lp-footer-link" href="/terms.html" target="_blank" rel="noopener">{t.footerTerms}</a>
            <a className="lp-footer-link" href="#">{t.footerContact}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
