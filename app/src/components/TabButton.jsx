import Icon from './Icon.jsx';

export default function TabButton({ active, label, onClick, color, iconName }) {
  color = color || "#0055AA";
  var rgb = hexToRgb(color);
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "7px 16px",
        borderRadius: 10,
        border: active ? ("1px solid rgba(" + rgb + ",0.25)") : "1px solid transparent",
        background: active ? ("rgba(" + rgb + ",0.10)") : "rgba(255,255,255,0.02)",
        color: active ? color : "#4a5568",
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        fontFamily: "Inter,sans-serif",
        cursor: "pointer",
        transition: "all 0.15s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: active ? ("0 0 16px rgba(" + rgb + ",0.20)") : "none",
        letterSpacing: "-0.15px",
        whiteSpace: "nowrap",
      }}
    >
      {iconName && <Icon name={iconName} size={14} weight={active ? "regular" : "light"} />}
      {label}
    </button>
  );
}

function hexToRgb(hex) {
  if (!hex || hex.length < 7) return "0,85,170";
  try {
    return parseInt(hex.slice(1,3),16)+","+parseInt(hex.slice(3,5),16)+","+parseInt(hex.slice(5,7),16);
  } catch(e) { return "0,85,170"; }
}
