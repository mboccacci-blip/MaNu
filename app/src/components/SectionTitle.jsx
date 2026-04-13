import Tip from './Tip.jsx';

export default function SectionTitle({ children, sub, tip }) {
  return (
    <div style={{ marginBottom: sub ? 28 : 20 }}>
      <h2 style={{ fontFamily: "Outfit,sans-serif", fontSize: 20, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
        {children}{tip && <Tip text={tip} />}
      </h2>
      {sub && <p style={{ fontSize: 12, color: "#64748b", marginTop: 6, lineHeight: 1.6, fontFamily: "Inter,sans-serif" }}>{sub}</p>}
    </div>
  );
}
