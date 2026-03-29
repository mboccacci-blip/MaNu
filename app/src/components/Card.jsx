export default function Card({ children, style, glow, onClick }) {
  var glowClass = glow ? " glow-" + glow : "";
  var clickClass = onClick ? " clickable" : "";
  return (
    <div
      className={"mn-card" + glowClass + clickClass}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
