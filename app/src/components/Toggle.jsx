export default function Toggle({ value, onChange, label, sub }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", borderRadius: 14, marginBottom: 12,
        background: value ? "rgba(0,153,204,0.06)" : "rgba(15,23,42,0.025)",
        border: value ? "1px solid rgba(0,153,204,0.22)" : "1px solid rgba(15,23,42,0.09)",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)", cursor: "pointer",
        boxShadow: value ? "0 0 16px rgba(0,153,204,0.08)" : "none",
      }}
      onClick={function() { onChange(!value); }}
    >
      <div style={{
        width: 44, height: 24, borderRadius: 12, position: "relative",
        background: value ? "rgba(0,153,204,0.25)" : "rgba(15,23,42,0.10)",
        flexShrink: 0, transition: "background 0.2s",
        boxShadow: value ? "0 0 10px rgba(0,153,204,0.2) inset" : "none",
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: "50%",
          background: value ? "#0099cc" : "#64748b",
          position: "absolute", top: 3, left: value ? 23 : 3,
          transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: value ? "0 0 8px rgba(0,153,204,0.5), 0 1px 4px rgba(15,23,42,0.15)" : "0 1px 4px rgba(15,23,42,0.15)",
        }} />
      </div>
      <div>
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: value ? "#0099cc" : "#475569",
          fontFamily: "Inter,sans-serif", letterSpacing: "-0.1px",
        }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontFamily: "Inter,sans-serif" }}>{sub}</div>}
      </div>
    </div>
  );
}
