import { useState, useEffect, useRef } from "react";

export default function Tip({ text }) {
  var [o, setO] = useState(false);
  var ref = useRef(null);

  useEffect(function() {
    if (!o) return;
    var c = function(e) {
      if (ref.current && !ref.current.contains(e.target)) setO(false);
    };
    document.addEventListener("mousedown", c);
    return function() { document.removeEventListener("mousedown", c); };
  }, [o]);

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 6 }}>
      <span onClick={function() { setO(!o); }} style={{ width: 18, height: 18, borderRadius: "50%", background: o ? "rgba(0,153,204,0.18)" : "rgba(0,153,204,0.09)", color: "#0099cc", fontSize: 11, fontFamily: "Outfit,sans-serif", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 700, border: "1px solid rgba(0,153,204,0.22)" }}>?</span>
      {o && <span style={{ position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#e2e8f0", padding: "12px 16px", borderRadius: 12, fontSize: 13, width: 280, zIndex: 1000, lineHeight: 1.5, boxShadow: "0 8px 24px rgba(15,23,42,0.20)", fontFamily: "Outfit,sans-serif", border: "1px solid rgba(15,23,42,0.15)" }}>
        {text}
        <span style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid #1e293b" }} />
      </span>}
    </span>
  );
}
