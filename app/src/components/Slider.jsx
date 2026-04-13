import Tip from './Tip.jsx';

export default function Slider({ label, value, onChange, min, max, step, format, color, tip }) {
  min = min || 0; max = max || 100; step = step || 1; color = color || "#0099cc";
  var pctV = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", letterSpacing: "0.3px", textTransform: "uppercase" }}>{label}{tip && <Tip text={tip} />}</label>
        <span style={{ fontSize: 15, fontWeight: 700, color: color, fontFamily: "Inter,sans-serif", letterSpacing: "-0.5px" }}>{format ? format(value) : value}</span>
      </div>}
      <div style={{ position: "relative", height: 32, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", width: "100%", height: 6, borderRadius: 3, background: "rgba(15,23,42,0.08)" }} />
        <div style={{ position: "absolute", width: pctV + "%", height: 6, borderRadius: 3, background: "linear-gradient(90deg," + color + "99," + color + ")", transition: "width 0.1s", boxShadow: "0 0 8px " + color + "40" }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={function (e) { onChange(Number(e.target.value)) }}
          style={{ position: "absolute", width: "100%", height: 6, opacity: 0, cursor: "pointer", margin: 0, zIndex: 2 }} />
        <div style={{ position: "absolute", left: "calc(" + pctV + "% - 10px)", width: 20, height: 20, borderRadius: "50%", background: "#ffffff", border: "2px solid " + color, boxShadow: "0 0 8px " + color + "60, 0 2px 6px rgba(15,23,42,0.15)", pointerEvents: "none", transition: "left 0.1s" }} />
      </div>
    </div>
  );
}
