import Tip from './Tip.jsx';

export default function NumberInput({ label, value, onChange, prefix, placeholder, tip, min, max, style: os, suffix }) {
  if (prefix === undefined) prefix = "$";
  if (!placeholder) placeholder = "";
  if (min === undefined) min = 0;
  var raw = String(value).replace(/,/g, "");
  var display = (raw && !isNaN(Number(raw)) && Number(raw) >= 1000) ? Number(raw).toLocaleString("en-US") : raw;
  function handleChange(e) { var v = e.target.value.replace(/,/g, "").replace(/[^0-9.\-]/g, ""); onChange(v) }
  return (
    <div style={Object.assign({ marginBottom: 18 }, os)}>
      {label && <label style={{ display: "flex", alignItems: "center", marginBottom: 7, fontSize: 11, fontWeight: 600, color: "#64748b", fontFamily: "Inter,sans-serif", letterSpacing: "0.6px", textTransform: "uppercase" }}>{label}{tip && <Tip text={tip} />}</label>}
      <div style={{ display: "flex", alignItems: "center", background: "rgba(248,250,253,0.98)", borderRadius: 12, border: "1px solid rgba(15,23,42,0.12)", padding: "0 16px", transition: "border-color 0.2s", boxShadow: "0 1px 4px rgba(15,23,42,0.07)" }}>
        {prefix && <span style={{ color: "#94a3b8", fontSize: 15, fontWeight: 700, marginRight: 4, fontFamily: "Inter,sans-serif" }}>{prefix}</span>}
        <input type="text" inputMode="numeric" value={display} onChange={handleChange} placeholder={placeholder} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#0f172a", fontSize: 17, fontWeight: 600, padding: "14px 0", fontFamily: "Inter,sans-serif", width: "100%", letterSpacing: "-0.5px" }} />
        {suffix && <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500, marginLeft: 4, fontFamily: "Inter,sans-serif" }}>{suffix}</span>}
      </div>
    </div>
  );
}
