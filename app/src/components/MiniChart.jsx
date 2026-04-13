import { useTranslation } from '../i18n/index.jsx';

export default function MiniChart({ data, width, height, color, fillColor, labels, yPrefix, showDots }) {
  var { t } = useTranslation();
  width = width || "100%"; height = height || 120; color = color || "#22c55e"; yPrefix = yPrefix || "$";
  if (!data || data.length < 2) return null;
  var maxV = Math.max.apply(null, data.map(function (d) { return d.v }));
  var minV = Math.min.apply(null, data.map(function (d) { return d.v }));
  var range = maxV - minV || 1;
  var pad = 12; var svgW = 600; var svgH = height; var plotW = svgW - pad * 2; var plotH = svgH - pad * 2 - 20;
  var pts = data.map(function (d, i) { return { x: pad + i / (data.length - 1) * plotW, y: pad + 10 + (1 - (d.v - minV) / range) * plotH, v: d.v, l: d.l } });
  var line = pts.map(function (p, i) { return (i === 0 ? "M" : "L") + p.x + "," + p.y }).join(" ");
  var area = line + " L" + pts[pts.length - 1].x + "," + (svgH - pad) + " L" + pts[0].x + "," + (svgH - pad) + " Z";
  return (
    <svg viewBox={"0 0 " + svgW + " " + svgH} style={{ width: width, height: height }}>
      <defs><linearGradient id={"g_" + color.replace("#", "")} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {fillColor !== false && <path d={area} fill={"url(#g_" + color.replace("#", "") + ")"} />}
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {showDots !== false && pts.filter(function (_, i) { return i === 0 || i === pts.length - 1 || data.length <= 12 }).map(function (p, i) { return <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="#ffffff" strokeWidth="2" /> })}
      {labels !== false && pts.filter(function (_, i) { return i === 0 || i === pts.length - 1 || (data.length <= 12 && data.length > 2 && i % Math.ceil(data.length / 6) === 0) }).map(function (p, i) { return <text key={"t" + i} x={p.x} y={svgH - 2} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="Outfit,sans-serif">{(p.l || "").replace('Yr', t('app.yr')).replace('Año', t('app.yr'))}</text> })}
    </svg>
  );
}
