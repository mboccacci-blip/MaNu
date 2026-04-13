import { useState, useRef, useEffect } from "react";

export default function AnimatedNumber({ value, dur }) {
  dur = dur || 1800;
  var _s = useState(0), d = _s[0], setD = _s[1];
  var f = useRef(null);
  var p = useRef(0);
  useEffect(function () {
    var s = p.current;
    var st = performance.now();
    var a = function (now) {
      var pr = Math.min((now - st) / dur, 1);
      var e = 1 - Math.pow(1 - pr, 3);
      setD(Math.floor(s + (value - s) * e));
      if (pr < 1) f.current = requestAnimationFrame(a);
      else p.current = value;
    };
    f.current = requestAnimationFrame(a);
    return function () { cancelAnimationFrame(f.current) };
  }, [value, dur]);
  return "$" + d.toLocaleString("en-US");
}
