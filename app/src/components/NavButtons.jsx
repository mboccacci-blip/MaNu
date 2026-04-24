import { useTranslation } from '../i18n/index.jsx';

export default function NavButtons({ tab, goTab, tier }) {
  var { t: tr } = useTranslation();
  var fullOrder = ["achieve", "inaction", "assumptions", "situation", "debts", "invest", "portfolio", "retirement", "save", "earn", "cost", "goals", "score", "reports", "learn"];
  var FREE_NAV = ["achieve", "inaction", "learn"];
  var order = tier === "paid" ? fullOrder : FREE_NAV;
  var idx = order.indexOf(tab); if (idx < 0) return null;
  var prev = idx > 0 ? order[idx - 1] : null; var next = idx < order.length - 1 ? order[idx + 1] : null;
  var lb = function (id) { return tr('tabs.' + id) || id; };
  return (
    <div style={{ display: "flex", justifyContent: prev && next ? "space-between" : next ? "flex-end" : "flex-start", marginTop: 24, gap: 12 }}>
      {prev && <button onClick={function () { goTab(prev) }} style={{ background: "rgba(255,255,255,0.03)", color: "#4a5568", border: "1px solid rgba(255,255,255,0.07)", padding: "12px 28px", borderRadius: 12, fontSize: 13, fontWeight: 600, fontFamily: "Inter,sans-serif", cursor: "pointer", letterSpacing: "-0.2px", transition: "all 0.2s" }}>← {lb(prev)}</button>}
      {next && <button className="bp" onClick={function () { goTab(next) }} style={{ fontFamily: "Inter,sans-serif", letterSpacing: "-0.2px" }}>{lb(next)} →</button>}
    </div>
  );
}
