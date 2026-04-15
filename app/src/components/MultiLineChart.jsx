import { useTranslation } from '../i18n/index.jsx';
import { fmtC } from '../utils/formatters.js';

export default function MultiLineChart({ series, width, height, labels, showYAxis }) {
  var { t } = useTranslation();
  height = height || 140;
  if (!series || series.length === 0 || !series[0].data || series[0].data.length < 2) return null;
  const allV = []; (series || []).forEach(function (s) { (s.data || []).forEach(function (d) { allV.push(d.v) }) });
  const maxV = Math.max.apply(null, allV); let minV = Math.min.apply(null, allV.filter(function (v) { return v >= 0 }));
  minV = Math.min(minV, 0); const range = maxV - minV || 1;
  var lPad = showYAxis ? 52 : 12; var pad = 12; var svgW = 600; var svgH = height; var plotW = svgW - lPad - pad; var plotH = svgH - pad - 10 - 20;
  var len = series[0].data.length;
  // Y-axis ticks
  var yTicks = [];
  if (showYAxis) {
    var nTicks = 4; for (var ti = 0; ti <= nTicks; ti++) { var tv = minV + range * (ti / nTicks); yTicks.push({ v: tv, y: pad + 10 + (1 - ti / nTicks) * plotH }) }
  }
  return (
    <svg viewBox={"0 0 " + svgW + " " + svgH} style={{ width: "100%", height: height }}>
      {showYAxis && yTicks.map(function (t, i) {
        return (<g key={"yt" + i}>
          <line x1={lPad} y1={t.y} x2={svgW - pad} y2={t.y} stroke="rgba(15,23,42,0.07)" strokeWidth="1" />
          <text x={lPad - 6} y={t.y + 4} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="Outfit,sans-serif">{fmtC(t.v)}</text>
        </g>)
      })}
      {series.map(function (s, si) {
        var pts = s.data.map(function (d, i) { return { x: lPad + i / (len - 1) * plotW, y: pad + 10 + (1 - (d.v - minV) / range) * plotH } });
        var line = pts.map(function (p, i) { return (i === 0 ? "M" : "L") + p.x + "," + p.y }).join(" ");
        if (s.fill) {
          var area = line + " L" + pts[pts.length - 1].x + "," + (svgH - pad) + " L" + pts[0].x + "," + (svgH - pad) + " Z";
          return <g key={si}><path d={area} fill={s.color} fillOpacity="0.08" /><path d={line} fill="none" stroke={s.color} strokeWidth={s.bold ? "3" : "1.5"} strokeLinecap="round" strokeDasharray={s.dash || "none"} /></g>
        }
        return <path key={si} d={line} fill="none" stroke={s.color} strokeWidth={s.bold ? "3" : "1.5"} strokeLinecap="round" strokeDasharray={s.dash || "none"} />
      })}
      {labels !== false && series[0].data.map(function (d, i) {
        if (!d.l) return null;
        var x = lPad + i / (len - 1) * plotW;
        return <text key={"l" + i} x={x} y={svgH - 2} textAnchor={i === 0 ? "start" : i === len - 1 ? "end" : "middle"} fill="#64748b" fontSize="10" fontFamily="Outfit,sans-serif">{(d.l || "").replace('Yr', t('app.yr')).replace('Año', t('app.yr'))}</text>
      }).filter(Boolean)}
    </svg>
  );
}
