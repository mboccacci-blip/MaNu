import { useTranslation } from '../i18n/index.jsx';
import Icon from './Icon.jsx';

export default function AdvisorCTA({ msg, onContact }) {
  var { t: tr } = useTranslation();
  return (
    <div style={{ marginTop: 16, padding: "20px 24px", borderRadius: 14, background: "linear-gradient(135deg,rgba(34,197,94,0.06),rgba(96,165,250,0.06))", border: "1px solid rgba(34,197,94,0.15)", textAlign: "center" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{msg || tr('advisor.readyToAct')}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 14, maxWidth: 380, margin: "0 auto 14px" }}>{tr('advisor.ctaBody')}</div>
      <a href="#" onClick={function (e) { e.preventDefault(); if (onContact) onContact() }} style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", fontFamily: "Outfit,sans-serif", boxShadow: "0 4px 15px rgba(34,197,94,0.3)" }}>{tr('advisor.ctaButton')}</a>
      <div style={{ fontSize: 10, color: "#475569", marginTop: 8 }}>{tr('advisor.freeConsult')}</div>
    </div>
  );
}
