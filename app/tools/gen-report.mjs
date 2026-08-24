/**
 * Genera el PDF premium sin browser.
 * Uso:  node tools/gen-report.mjs <escenario.json> <es|en> <salida.pdf>
 * El engine real se importa con useMemo shimeado (useMemo(fn) -> fn()).
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC  = resolve(HERE, '../src');

// ── 1. engine sin React ───────────────────────────────────────────────
const tmp = mkdtempSync(join(tmpdir(), 'manu-'));
let eng = readFileSync(join(SRC, 'hooks/useFinancialEngine.js'), 'utf8')
  .replace(/import\s*\{\s*useMemo\s*\}\s*from\s*["']react["'];?/,
           'const useMemo = function (fn) { return fn(); };')
  .replace(/from '\.\.\//g, `from '${pathToFileURL(SRC).href}/`);
const engPath = join(tmp, 'engine.mjs');
writeFileSync(engPath, eng);
const { default: useFinancialEngine } = await import(pathToFileURL(engPath).href);

// ── 2. traductor (mismo shape que i18n/index.jsx) ─────────────────────
const dict = {
  es: (await import(pathToFileURL(join(SRC, 'i18n/es.js')).href)).default,
  en: (await import(pathToFileURL(join(SRC, 'i18n/en.js')).href)).default,
};
function makeT(lang) {
  const D = dict[lang] || dict.es;
  return function t(key, params) {
    let v = key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), D);
    if (typeof v !== 'string') return undefined;
    if (params) for (const p in params) v = v.split('{' + p + '}').join(params[p]);
    return v;
  };
}

// ── 3. store = defaults del store real + escenario ────────────────────
const storeSrc = readFileSync(join(SRC, 'store/useAppStore.js'), 'utf8');
const expSrc  = 'const DEFAULT_EXP = ' + storeSrc.split('const DEFAULT_EXP = ')[1].split('\n];')[0] + '\n];';
const body    = storeSrc.split('const INITIAL_STATE = {')[1].split('\n};')[0];
const DEFAULTS = new Function(expSrc + '; return {' + body.replace(/\/\/.*$/gm, '') + '}')();

const [scenarioPath, langArg, outPath] = process.argv.slice(2);
const lang = langArg === 'en' ? 'en' : 'es';
const scenario = JSON.parse(readFileSync(resolve(scenarioPath), 'utf8'));
const store = Object.assign({}, DEFAULTS, scenario);

// ── 4. generar ────────────────────────────────────────────────────────
const engine = useFinancialEngine(store, makeT(lang), lang);
const { reportAsBase64 } = await import(pathToFileURL(join(SRC, 'utils/reportPdf.js')).href);
const b64 = reportAsBase64({ engine, store, lang });
writeFileSync(resolve(outPath), Buffer.from(b64, 'base64'));

const f = n => '$' + Math.round(n).toLocaleString('en-US');
console.log(`${outPath}  [${lang}]`);
console.log('  Magic Number      ', f(engine.magic.real));
console.log('  Conservador       ', f(engine.magic.conservative), `(${(engine.magic.conservativeRate*100).toFixed(1)}%)`);
console.log('  Trayectoria ytr   ', f(engine.ybYReport[engine.ytr].balance));
console.log('  Perfil            ', engine.retProfLabel);
