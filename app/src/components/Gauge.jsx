import { useTranslation } from '../i18n/index.jsx';

export default function Gauge({ value }) {
  var { t } = useTranslation();
  var p = Math.min(value, 100);
  var c = p >= 70 ? "#0099cc" : p >= 40 ? "#d97706" : "#dc2626";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 200, height: 114, margin: "0 auto" }}>
        <svg viewBox="0 0 160 90" style={{ width: "100%", height: "100%" }}>
          <path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke={c} strokeWidth="14" strokeLinecap="round" strokeDasharray={p * 2.04 + " 999"} style={{ transition: "all 1.4s cubic-bezier(0.4,0,0.2,1)", filter: "drop-shadow(0 0 8px " + c + ")" }} />
        </svg>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 44, fontWeight: 900, color: c, lineHeight: 1, letterSpacing: "-2px", textShadow: "0 0 20px " + c + "80" }}>{Math.round(value)}</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 12, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "Inter,sans-serif" }}>{t('app.outOf100')}</div>
    </div>
  );
}
