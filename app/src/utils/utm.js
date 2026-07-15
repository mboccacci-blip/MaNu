/**
 * MaNu PRO — UTM capture (W56)
 *
 * Captura utm_source/medium/campaign/content/term de la URL al cargar la app,
 * las persiste 30 días en localStorage (first-touch + last-touch) y las expone
 * para analytics y leads. Así sabemos qué video/campaña produjo cada cálculo
 * y cada lead. Sin PII: las UTMs son etiquetas de campaña, no datos personales.
 *
 * Convención sugerida (ver docs/PLAN-MARKETING-REDES.md):
 *   utm_source = ig | tt | yt | gads     utm_medium = paid | organic | ugc
 *   utm_campaign = <eje><n>-<variante>   ej: costoesperar5-a
 */

var KEY = 'manu-utm';
var TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

var cached = null; // cache por sesión (captureUtms corre antes que cualquier track)

/** Llamar UNA vez, lo antes posible en el arranque (main.jsx). */
export function captureUtms() {
  if (typeof window === 'undefined') return;
  try {
    var params = new URLSearchParams(window.location.search);
    var found = {};
    var has = false;
    UTM_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v) { found[k] = String(v).slice(0, 120); has = true; }
    });
    if (!has) return;
    var now = Date.now();
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { stored = null; }
    var keepFirst = stored && stored.first && (now - (stored.ts || 0)) < TTL_MS;
    localStorage.setItem(KEY, JSON.stringify({
      first: keepFirst ? stored.first : found,
      last: found,
      ts: now,
    }));
    cached = null; // invalidar cache
  } catch (e) { /* la atribución nunca rompe la app */ }
}

/**
 * UTMs vigentes (last-touch). Si el primer contacto fue otra campaña,
 * agrega utm_source_first / utm_campaign_first. Devuelve {} si no hay.
 */
export function getUtms() {
  if (typeof window === 'undefined') return {};
  if (cached !== null) return cached;
  try {
    var stored = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!stored || !stored.last || (Date.now() - (stored.ts || 0)) > TTL_MS) {
      cached = {};
      return cached;
    }
    var out = {};
    UTM_KEYS.forEach(function (k) { if (stored.last[k]) out[k] = stored.last[k]; });
    if (stored.first && stored.first.utm_source && stored.first.utm_source !== out.utm_source) {
      out.utm_source_first = stored.first.utm_source;
      if (stored.first.utm_campaign) out.utm_campaign_first = stored.first.utm_campaign;
    }
    cached = out;
    return out;
  } catch (e) {
    cached = {};
    return cached;
  }
}

/** Solo las 5 columnas estándar (para la tabla leads). */
export function getUtmColumns() {
  var u = getUtms();
  var out = {};
  UTM_KEYS.forEach(function (k) { if (u[k]) out[k] = u[k]; });
  return out;
}
