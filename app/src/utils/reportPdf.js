/**
 * MaNu PRO — Premium PDF Report (W15)
 *
 * Genera el informe descargable del micro-pago ($3.99) a partir del motor
 * financiero. Este módulo se importa SIEMPRE con dynamic import() para que
 * jsPDF quede en un chunk separado y no infle el bundle principal:
 *
 *   const { downloadReport } = await import('../utils/reportPdf.js');
 *
 * Contenido (3 páginas A4):
 *   1. Magic Number exacto + datos del usuario + proyección al retiro
 *   2. Trayectoria año a año (gráfico + tabla) + cuánto ahorrar por perfil
 *      + costo de esperar
 *   3. Metodología ("Cómo calculamos") + supuestos + disclaimers
 */
import { jsPDF } from 'jspdf';
import { fvVariable, drawdownYears } from './financial.js';

// ── Palette (matches app) ────────────────────────────────────────────
var INK = [15, 23, 42];        // #0f172a
var SLATE = [100, 116, 139];   // #64748b
var SLATE_L = [148, 163, 184]; // #94a3b8
var BLUE = [59, 130, 246];     // #3b82f6
var BLUE_L = [96, 165, 250];   // #60a5fa
var GREEN = [34, 197, 94];     // #22c55e
var AMBER = [245, 158, 11];    // #f59e0b
var RED = [239, 68, 68];       // #ef4444
var BG = [248, 250, 252];      // #f8fafc
var LINE = [226, 232, 240];    // #e2e8f0

var M = 18;      // page margin (mm)
var W = 210;     // A4 width
var CW = W - M * 2; // content width

function money(n) {
  if (n == null || isNaN(n)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
function moneyC(n) {
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
  return money(n);
}
function pctS(n) { return (n * 100).toFixed(1) + '%'; }

// ── Strings ──────────────────────────────────────────────────────────
var STR = {
  es: {
    title: 'Informe Premium — Plan de Retiro',
    generated: 'Generado el',
    heroLabel: 'TU MAGIC NUMBER',
    heroPhrase: function (d) { var base = 'Juntando este capital a tus ' + d.retAge + ' años, te asegurás ' + money(d.desired) + ' por mes durante ' + d.yp + ' años de retiro.'; if (d.ss > 0) base += ' (' + money(d.desiredAfterSS) + ' de tu capital + ' + money(d.ss) + ' de ingreso adicional)'; return base; },
    conservative: function (d) { return 'Escenario conservador (invirtiendo el capital a ' + pctS(d.rate) + ' real durante el retiro): ' + money(d.value); },
    yourData: 'Tus datos',
    dAge: 'Edad actual', dRetAge: 'Edad de retiro', dYP: 'Años de retiro planificados',
    dDesired: 'Ingreso mensual necesario', dSS: 'Ingreso previsional / adicional', dSavings: 'Ahorro actual',
    dMonthly: 'Ahorro mensual', dLegacy: 'Herencia deseada', dTax: 'Impuesto anual a los activos',
    dProfile: 'Perfil de inversión', perMonth: '/mes', perYear: '/año',
    projTitle: 'Tu proyección al retiro',
    projSavings: 'Ahorro proyectado', atAge: function (a) { return 'a los ' + a + ' años'; },
    ofGoal: function (p, g) { return p + '% de tu Magic Number (' + moneyC(g) + ')'; },
    coverage: 'Años de cobertura', coverageUntil: function (a) { return a >= 160 ? 'más de 60 años' : 'hasta los ' + a; },
    covered: 'CUBIERTO', short: 'TE FALTA',
    projAssumption: function (d) { return 'Asume que invertís desde hoy hasta el retiro al ' + pctS(d.rate) + ' real (' + d.profile + '), con capitalización mensual y valores en dólares constantes de hoy.'; },
    trajTitle: 'Tu trayectoria año a año',
    trajAccum: 'Acumulación', trajDraw: 'Retiro (consumo)', retirementAt: 'Retiro',
    colYear: 'Año', colAge: 'Edad', colBalance: 'Saldo proyectado', colPhase: 'Fase',
    phaseA: 'Acumulación', phaseD: 'Retiro',
    monthlyTitle: 'Cuánto ahorrar por mes, según el perfil de inversión',
    monthlySub: function (mSav) { return 'Para llegar a tu Magic Number a tiempo, además de los ' + money(Math.max(mSav, 0)) + '/mes que ya ahorrás:'; },
    colProfile: 'Perfil', colReturn: 'Retorno real', colNeeded: 'Ahorro adicional',
    surplusBy: function (v) { return 'Superás la meta por ' + moneyC(v); },
    inactionTitle: 'El costo de esperar',
    inactionSub: function (d) { return 'Si en vez de empezar hoy esperás, esto es lo que dejás de acumular (' + d.name + ', ' + d.years + (d.years === 1 ? ' año' : ' años') + ' de horizonte):'; },
    startToday: 'Empezando hoy', waitN: function (n) { return 'Esperando ' + n + (n === 1 ? ' año' : ' años'); },
    lost: function (v) { return '-' + moneyC(v); },
    extrasScoreTitle: 'Tu salud financiera — Score',
    extrasRecs: 'Recomendaciones prioritarias',
    extrasDebtsTitle: 'Tus deudas',
    extrasDebtsSub: function (total) { return 'Deuda total: ' + money(total) + '. Regla general: una deuda con tasa mayor al retorno esperado de tus inversiones conviene cancelarla antes de invertir.'; },
    colDebt: 'Deuda', colBalance2: 'Saldo', colRate: 'Tasa', colSev: 'Severidad',
    sevLabels: { critical: 'Crítica', high: 'Alta', moderate: 'Moderada', low: 'Baja' },
    extrasSavTitle: 'Oportunidades de ahorro',
    extrasSavSub: 'Recortando gastos discrecionales (con los porcentajes que ajustaste en la app):',
    colExpense: 'Gasto', colCurrent: 'Actual', colCut: 'Recorte', colSaved: 'Ahorro/mes', colImp20: 'A 20 años',
    savTotal: 'Total',
    extrasGoalsTitle: 'Tus metas intermedias',
    colGoal: 'Meta', colAmount: 'Monto', colYears2: 'Años', colPerMo: 'Ahorro/mes',
    goalFallback: function (i) { return 'Meta ' + i; },
    goalImpact: function (d) { return 'Financiar estas metas reduce tu capital proyectado al retiro en ' + moneyC(d.diff) + ' (' + d.pct.toFixed(0) + '% de tu Magic Number).'; },
    methodTitle: 'Cómo calculamos — Metodología',
    method1T: 'Tu Magic Number',
    method1: 'Es el valor presente de una renta mensual: el capital que, invertido durante tu retiro, te permite retirar tu ingreso mensual necesario (neto de ingresos previsionales) durante los años que planificaste, más el capital que quieras dejar como herencia. Se calcula con capitalización mensual.',
    method2T: 'Retornos reales, no nominales',
    method2: 'Todos los cálculos usan retornos REALES (descontada la inflación) y se expresan en dólares constantes de hoy. Así, los montos que ves mantienen su poder de compra: no te dejamos "ganar" con números inflados.',
    method3T: 'Perfiles de inversión',
    method3: 'Cada perfil usa un retorno nominal histórico de largo plazo, al que restamos la inflación esperada. Si configurás un impuesto anual a los activos, también lo restamos (drag fiscal) para los cálculos.',
    colNominal: 'Retorno nominal', colReal: 'Retorno real (inflación ' ,
    method4T: 'Proyecciones y cobertura',
    method4: 'El ahorro proyectado capitaliza mes a mes tu ahorro actual más los aportes mensuales (incluyendo el aumento de ahorro cuando terminás de pagar deudas). Los años de cobertura simulan el retiro: cada año el capital rinde y se descuenta tu gasto; contamos cuántos años completos dura.',
    method5T: 'Límites del modelo',
    method5: 'El modelo no contempla impuestos locales específicos, secuencia de retornos (volatilidad año a año), ni cambios en tus ingresos o gastos. Los retornos históricos no garantizan retornos futuros. Es una herramienta educativa de planificación, no una promesa.',
    disclaimerT: 'Aviso importante',
    disclaimer: 'Este informe es educativo y no constituye asesoramiento financiero, legal ni impositivo. Las proyecciones son estimaciones basadas en los supuestos descriptos y en los datos que ingresaste. Antes de tomar decisiones de inversión, consultá con un asesor financiero matriculado.',
    ctaT: '¿Querés ayuda profesional con tu plan?',
    cta: 'En magic-number.app podés pedir que un asesor financiero verificado revise tu perfil y te contacte.',
    footer: function (p, t, date) { return 'MaNu PRO · magic-number.app · Informe generado el ' + date + ' · Página ' + p + ' de ' + t; },
    notAdvice: 'Este documento no es asesoramiento financiero.',
  },
  en: {
    title: 'Premium Report — Retirement Plan',
    generated: 'Generated on',
    heroLabel: 'YOUR MAGIC NUMBER',
    heroPhrase: function (d) { var base = 'Accumulating this capital by age ' + d.retAge + ', you secure ' + money(d.desired) + ' per month for ' + d.yp + ' years of retirement.'; if (d.ss > 0) base += ' (' + money(d.desiredAfterSS) + ' from your capital + ' + money(d.ss) + ' from additional income)'; return base; },
    conservative: function (d) { return 'Conservative scenario (investing the capital at ' + pctS(d.rate) + ' real during retirement): ' + money(d.value); },
    yourData: 'Your data',
    dAge: 'Current age', dRetAge: 'Retirement age', dYP: 'Planned years in retirement',
    dDesired: 'Required monthly income', dSS: 'Pension / additional income', dSavings: 'Current savings',
    dMonthly: 'Monthly savings', dLegacy: 'Desired legacy', dTax: 'Annual asset tax',
    dProfile: 'Investment profile', perMonth: '/mo', perYear: '/yr',
    projTitle: 'Your projection at retirement',
    projSavings: 'Projected savings', atAge: function (a) { return 'at age ' + a; },
    ofGoal: function (p, g) { return p + '% of your Magic Number (' + moneyC(g) + ')'; },
    coverage: 'Years of coverage', coverageUntil: function (a) { return a >= 160 ? 'more than 60 years' : 'until age ' + a; },
    covered: 'COVERED', short: 'SHORTFALL',
    projAssumption: function (d) { return 'Assumes investing from today until retirement at ' + pctS(d.rate) + ' real (' + d.profile + '), with monthly compounding, in constant (today) dollars.'; },
    trajTitle: 'Your year-by-year trajectory',
    trajAccum: 'Accumulation', trajDraw: 'Retirement (drawdown)', retirementAt: 'Retirement',
    colYear: 'Year', colAge: 'Age', colBalance: 'Projected balance', colPhase: 'Phase',
    phaseA: 'Accumulation', phaseD: 'Drawdown',
    monthlyTitle: 'How much to save per month, by investment profile',
    monthlySub: function (mSav) { return 'To reach your Magic Number on time, on top of the ' + money(Math.max(mSav, 0)) + '/mo you already save:'; },
    colProfile: 'Profile', colReturn: 'Real return', colNeeded: 'Additional savings',
    surplusBy: function (v) { return 'You exceed the goal by ' + moneyC(v); },
    inactionTitle: 'The cost of waiting',
    inactionSub: function (d) { return 'If you wait instead of starting today, this is what you give up (' + d.name + ', ' + d.years + '-year horizon):'; },
    startToday: 'Starting today', waitN: function (n) { return 'Waiting ' + n + (n === 1 ? ' year' : ' years'); },
    lost: function (v) { return '-' + moneyC(v); },
    extrasScoreTitle: 'Your financial health — Score',
    extrasRecs: 'Priority recommendations',
    extrasDebtsTitle: 'Your debts',
    extrasDebtsSub: function (total) { return 'Total debt: ' + money(total) + '. Rule of thumb: debt with a rate higher than your expected investment return is worth paying off before investing.'; },
    colDebt: 'Debt', colBalance2: 'Balance', colRate: 'Rate', colSev: 'Severity',
    sevLabels: { critical: 'Critical', high: 'High', moderate: 'Moderate', low: 'Low' },
    extrasSavTitle: 'Savings opportunities',
    extrasSavSub: 'Cutting discretionary expenses (with the percentages you set in the app):',
    colExpense: 'Expense', colCurrent: 'Current', colCut: 'Cut', colSaved: 'Saved/mo', colImp20: 'In 20 years',
    savTotal: 'Total',
    extrasGoalsTitle: 'Your intermediate goals',
    colGoal: 'Goal', colAmount: 'Amount', colYears2: 'Years', colPerMo: 'Savings/mo',
    goalFallback: function (i) { return 'Goal ' + i; },
    goalImpact: function (d) { return 'Funding these goals reduces your projected retirement capital by ' + moneyC(d.diff) + ' (' + d.pct.toFixed(0) + '% of your Magic Number).'; },
    methodTitle: 'How we calculate — Methodology',
    method1T: 'Your Magic Number',
    method1: 'It is the present value of a monthly annuity: the capital that, invested through retirement, lets you withdraw your required monthly income (net of pension income) for the years you planned, plus any legacy capital. Computed with monthly compounding.',
    method2T: 'Real returns, not nominal',
    method2: 'All calculations use REAL returns (net of inflation) and are expressed in constant (today) dollars, so every amount keeps its purchasing power — no inflated feel-good numbers.',
    method3T: 'Investment profiles',
    method3: 'Each profile uses a long-term historical nominal return minus expected inflation. If you set an annual asset tax, we also subtract it (tax drag) in calculations.',
    colNominal: 'Nominal return', colReal: 'Real return (inflation ',
    method4T: 'Projections and coverage',
    method4: 'Projected savings compound your current savings plus monthly contributions month by month (including the savings boost when debts are paid off). Years of coverage simulate retirement: each year the capital earns returns and your spending is withdrawn; we count full years it lasts.',
    method5T: 'Model limitations',
    method5: 'The model does not account for local taxes, sequence-of-returns risk (year-to-year volatility), or changes in your income or expenses. Historical returns do not guarantee future returns. This is an educational planning tool, not a promise.',
    disclaimerT: 'Important notice',
    disclaimer: 'This report is educational and does not constitute financial, legal or tax advice. Projections are estimates based on the described assumptions and the data you entered. Consult a licensed financial advisor before making investment decisions.',
    ctaT: 'Want professional help with your plan?',
    cta: 'At magic-number.app you can request that a verified financial advisor review your profile and contact you.',
    footer: function (p, t, date) { return 'MaNu PRO · magic-number.app · Report generated on ' + date + ' · Page ' + p + ' of ' + t; },
    notAdvice: 'This document is not financial advice.',
  },
};

// ── Low-level helpers ────────────────────────────────────────────────
function setFill(doc, c) { doc.setFillColor(c[0], c[1], c[2]); }
function setDraw(doc, c) { doc.setDrawColor(c[0], c[1], c[2]); }
function setText(doc, c) { doc.setTextColor(c[0], c[1], c[2]); }

function sectionTitle(doc, y, label) {
  setFill(doc, BLUE);
  doc.roundedRect(M, y - 3.4, 1.6, 4.6, 0.8, 0.8, 'F');
  setText(doc, INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text(label, M + 4.5, y);
  return y + 7;
}

function kvTable(doc, y, rows) {
  doc.setFontSize(9.5);
  var rowH = 7.2;
  rows.forEach(function (r, i) {
    if (i % 2 === 0) { setFill(doc, BG); doc.rect(M, y - 4.6, CW, rowH, 'F'); }
    doc.setFont('helvetica', 'normal'); setText(doc, SLATE);
    doc.text(r[0], M + 3, y);
    doc.setFont('helvetica', 'bold'); setText(doc, INK);
    doc.text(String(r[1]), M + CW - 3, y, { align: 'right' });
    y += rowH;
  });
  return y;
}

function wrapText(doc, text, x, y, width, size, color, lineH, style) {
  doc.setFont('helvetica', style || 'normal');
  doc.setFontSize(size);
  setText(doc, color);
  var lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * (lineH || size * 0.42);
}

function footerAll(doc, L, dateStr) {
  var n = doc.getNumberOfPages();
  for (var i = 1; i <= n; i++) {
    doc.setPage(i);
    setDraw(doc, LINE); doc.setLineWidth(0.2); doc.setLineDashPattern([], 0);
    doc.line(M, 285, W - M, 285);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); setText(doc, SLATE_L);
    doc.text(L.footer(i, n, dateStr), W / 2, 290, { align: 'center' });
  }
}

// ── Data prep ────────────────────────────────────────────────────────
function prepData(engine, store) {
  var mSavPos = Math.max(engine.mSav, 0);
  var baseProjected = engine.ytr > 0
    ? fvVariable(engine.nEx, mSavPos, engine.retProfReturn, engine.ytr, engine.debtEvents)
    : engine.nEx;
  var basePct = engine.magic.real > 0 ? baseProjected / engine.magic.real * 100 : 0;
  var baseCoverage = null;
  if (baseProjected > 0 && engine.desiredAfterSS > 0 && engine.nYP > 0) {
    var retR = engine.retProfReturn;
    var yrs = drawdownYears(baseProjected, engine.desiredAfterSS * 12, retR, 60);
    baseCoverage = { years: yrs, untilAge: engine.nRetAge + yrs, sufficient: yrs >= engine.nYP };
  }
  var canonical = engine.adjProfiles.filter(function (p) { return p.name === engine.retProfLabel; })[0] || engine.adjProfiles[2];

  // Cost of waiting — uses retProfReturn and ytr (horizon to retirement)
  var inaction = null;
  if (engine.nEx > 0 || mSavPos > 0) {
    var h = engine.ytr;
    var rInact = engine.retProfReturn;
    var today = fvVariable(engine.nEx, mSavPos, rInact, h, []);
    var rows = [1, 3, 5, 10].filter(function (d) { return d < h; }).map(function (d) {
      var v = fvVariable(engine.nEx, mSavPos, rInact, Math.max(h - d, 0), []);
      return { delay: d, val: v, lost: today - v };
    });
    inaction = { horizon: h, profName: engine.retProfLabel, today: today, rows: rows };
  }
  return { baseProjected: baseProjected, basePct: basePct, baseCoverage: baseCoverage, canonical: canonical, inaction: inaction };
}

// ── Chart (year-by-year trajectory) ──────────────────────────────────
/** Page-break guard: if not enough room, start a new page. */
function ensure(doc, y, needed) {
  if (y + needed > 278) { doc.addPage(); return 20; }
  return y;
}

function drawChart(doc, y, engine, L, trajectory) {
  var data = trajectory;
  var x0 = M + 12, w = CW - 14, h = 40;
  var maxV = 1;
  data.forEach(function (d) { if (d.balance > maxV) maxV = d.balance; });
  var n = data.length - 1 || 1;

  // grid + y labels
  doc.setFontSize(7); setText(doc, SLATE_L);
  doc.setLineWidth(0.15);
  for (var g = 0; g <= 4; g++) {
    var gy = y + h - (h * g / 4);
    setDraw(doc, LINE); doc.setLineDashPattern([], 0);
    doc.line(x0, gy, x0 + w, gy);
    doc.text(moneyC(maxV * g / 4), x0 - 1.5, gy + 1, { align: 'right' });
  }
  // retirement divider
  var xRet = x0 + w * (engine.ytr / n);
  setDraw(doc, SLATE_L); doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(xRet, y, xRet, y + h);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7.5); setText(doc, SLATE);
  doc.text(L.retirementAt + ' (' + (engine.nAge + engine.ytr) + ')', xRet, y - 1.5, { align: 'center' });

  // polyline in two phases
  function plot(fromIdx, toIdx, color) {
    setDraw(doc, color); doc.setLineWidth(0.7);
    for (var i = fromIdx; i < toIdx; i++) {
      var xa = x0 + w * (i / n), ya = y + h - h * (data[i].balance / maxV);
      var xb = x0 + w * ((i + 1) / n), yb = y + h - h * (data[i + 1].balance / maxV);
      doc.line(xa, ya, xb, yb);
    }
  }
  plot(0, Math.min(engine.ytr, n), GREEN);
  plot(Math.min(engine.ytr, n), n, AMBER);

  // x labels (ages)
  doc.setFontSize(7); setText(doc, SLATE_L);
  doc.text(String(engine.nAge), x0, y + h + 4);
  doc.text(String(engine.nAge + n), x0 + w, y + h + 4, { align: 'right' });

  // legend
  var ly = y + h + 9;
  setDraw(doc, GREEN); doc.setLineWidth(1); doc.line(x0, ly - 1.2, x0 + 6, ly - 1.2);
  doc.setFontSize(8); setText(doc, SLATE); doc.text(L.trajAccum, x0 + 8, ly);
  var lx2 = x0 + 8 + doc.getTextWidth(L.trajAccum) + 8;
  setDraw(doc, AMBER); doc.line(lx2, ly - 1.2, lx2 + 6, ly - 1.2);
  doc.text(L.trajDraw, lx2 + 8, ly);
  return ly + 6;
}

// ── Pages ────────────────────────────────────────────────────────────
function page1(doc, engine, store, L, d, dateStr) {
  // Header band
  setFill(doc, INK); doc.rect(0, 0, W, 30, 'F');
  setFill(doc, BLUE); doc.roundedRect(M, 9.5, 11, 11, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); setText(doc, [255, 255, 255]);
  doc.text('MN', M + 5.5, 16.6, { align: 'center' });
  doc.setFontSize(14);
  doc.text('MaNu PRO', M + 15, 14.5);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setText(doc, [180, 200, 230]);
  doc.text(L.title, M + 15, 20.5);
  doc.setFontSize(8.5);
  doc.text(L.generated + ' ' + dateStr, W - M, 16.5, { align: 'right' });

  // Hero MN
  var y = 46;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); setText(doc, BLUE);
  doc.text(L.heroLabel, W / 2, y, { align: 'center' });
  doc.setFontSize(34); setText(doc, INK);
  doc.text(money(Math.round(engine.magic.real)), W / 2, y + 14, { align: 'center' });
  setFill(doc, [239, 246, 255]); setDraw(doc, [191, 219, 254]); doc.setLineWidth(0.3);
  doc.roundedRect(M + 10, y + 20, CW - 20, 13, 2, 2, 'FD');
  y = wrapText(doc, L.heroPhrase({ retAge: engine.nRetAge, desired: engine.nDes, yp: engine.nYP, ss: engine.nSS, desiredAfterSS: engine.desiredAfterSS }), W / 2 - (CW - 30) / 2, y + 25.5, CW - 30, 9.5, INK, 4.4) + 4;
  if (engine.magic.conservative > 0 && engine.magic.conservativeRate != null) {
    y = wrapText(doc, L.conservative({ rate: engine.magic.conservativeRate, value: Math.round(engine.magic.conservative) }), M + 10, y + 3, CW - 20, 8, SLATE, 3.8, 'italic') + 2;
  }

  // Datos
  y = sectionTitle(doc, y + 6, L.yourData);
  var rows = [
    [L.dAge, engine.nAge], [L.dRetAge, engine.nRetAge], [L.dYP, engine.nYP],
    [L.dDesired, money(engine.nDes) + L.perMonth],
  ];
  if (engine.nSS > 0) rows.push([L.dSS, money(engine.nSS) + L.perMonth]);
  rows.push([L.dSavings, money(engine.nEx)]);
  rows.push([L.dMonthly, money(Math.max(engine.mSav, 0)) + L.perMonth]);
  if (engine.nLegacy > 0) rows.push([L.dLegacy, money(engine.nLegacy)]);
  if (engine.TAX > 0) rows.push([L.dTax, (engine.TAX * 100).toFixed(1) + '%' + L.perYear]);
  rows.push([L.dProfile, engine.retProfLabel + ' (' + pctS(d.canonical.realReturn) + ' real)']);
  y = kvTable(doc, y + 2, rows);

  // Proyección
  y = sectionTitle(doc, y + 8, L.projTitle);
  var boxW = (CW - 6) / 2, boxH = 34, bx = M, by = y;
  // Box 1: projected savings
  var ok1 = d.baseProjected >= engine.magic.real;
  setFill(doc, ok1 ? [240, 253, 244] : [254, 242, 242]); setDraw(doc, ok1 ? [187, 247, 208] : [254, 202, 202]);
  doc.roundedRect(bx, by, boxW, boxH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setText(doc, ok1 ? GREEN : RED);
  doc.text(L.projSavings.toUpperCase(), bx + boxW / 2, by + 6, { align: 'center' });
  doc.setFontSize(17); setText(doc, INK);
  doc.text(moneyC(d.baseProjected), bx + boxW / 2, by + 14.5, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setText(doc, SLATE);
  doc.text(L.atAge(engine.nRetAge), bx + boxW / 2, by + 20, { align: 'center' });
  // progress bar
  var pbW = boxW - 16, pbX = bx + 8, pbY = by + 24;
  setFill(doc, LINE); doc.roundedRect(pbX, pbY, pbW, 2.6, 1.3, 1.3, 'F');
  setFill(doc, ok1 ? GREEN : d.basePct >= 60 ? AMBER : RED);
  doc.roundedRect(pbX, pbY, Math.max(Math.min(d.basePct, 100) / 100 * pbW, 2.6), 2.6, 1.3, 1.3, 'F');
  doc.setFontSize(7.5); setText(doc, ok1 ? GREEN : d.basePct >= 60 ? AMBER : RED);
  doc.setFont('helvetica', 'bold');
  doc.text(L.ofGoal(d.basePct.toFixed(0), engine.magic.real), bx + boxW / 2, pbY + 6.5, { align: 'center' });
  // Box 2: coverage
  var bx2 = M + boxW + 6;
  var cov = d.baseCoverage;
  var ok2 = cov && cov.sufficient;
  setFill(doc, ok2 ? [240, 253, 244] : [254, 242, 242]); setDraw(doc, ok2 ? [187, 247, 208] : [254, 202, 202]);
  doc.roundedRect(bx2, by, boxW, boxH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setText(doc, ok2 ? GREEN : RED);
  doc.text(L.coverage.toUpperCase(), bx2 + boxW / 2, by + 6, { align: 'center' });
  if (cov) {
    doc.setFontSize(17); setText(doc, INK);
    doc.text((cov.years >= 60 ? '60+' : cov.years) + '', bx2 + boxW / 2, by + 14.5, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setText(doc, SLATE);
    doc.text(L.coverageUntil(cov.untilAge), bx2 + boxW / 2, by + 20, { align: 'center' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); setText(doc, ok2 ? GREEN : RED);
    doc.text(ok2 ? L.covered : L.short, bx2 + boxW / 2, by + 28, { align: 'center' });
  } else {
    doc.setFontSize(12); setText(doc, SLATE_L);
    doc.text('—', bx2 + boxW / 2, by + 17, { align: 'center' });
  }
  y = by + boxH + 6;
  wrapText(doc, L.projAssumption({ rate: d.canonical.realReturn, profile: engine.retProfLabel }), M, y, CW, 8, SLATE, 3.8, 'italic');
}

function page2(doc, engine, store, L, d, trajectory) {
  var y = 20;
  // Chart
  y = sectionTitle(doc, y, L.trajTitle);
  y = drawChart(doc, y + 4, engine, L, trajectory) + 2;

  // Year-by-year table (sampled)
  var data = trajectory;
  var total = data.length - 1;
  var step = Math.max(1, Math.ceil(total / 8));
  var idxs = [];
  for (var i = 0; i <= total; i += step) idxs.push(i);
  if (idxs.indexOf(engine.ytr) === -1) { idxs.push(engine.ytr); }
  if (idxs.indexOf(total) === -1) idxs.push(total);
  idxs.sort(function (a, b) { return a - b; });

  var rowH = 5.0;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); setText(doc, SLATE);
  setFill(doc, BG); doc.rect(M, y - 4, CW, rowH + 1, 'F');
  doc.text(L.colYear, M + 3, y); doc.text(L.colAge, M + 30, y);
  doc.text(L.colBalance, M + 100, y, { align: 'right' });
  doc.text(L.colPhase, M + CW - 3, y, { align: 'right' });
  y += rowH + 1;
  idxs.forEach(function (ix, k) {
    var r = data[ix];
    var isRet = ix === engine.ytr;
    if (isRet) { setFill(doc, [239, 246, 255]); doc.rect(M, y - 4, CW, rowH, 'F'); }
    else if (k % 2 === 1) { setFill(doc, BG); doc.rect(M, y - 4, CW, rowH, 'F'); }
    doc.setFont('helvetica', isRet ? 'bold' : 'normal'); doc.setFontSize(8);
    setText(doc, isRet ? BLUE : SLATE);
    doc.text(String(r.year), M + 3, y);
    doc.text(String(engine.nAge + r.year), M + 30, y);
    setText(doc, isRet ? BLUE : INK);
    doc.text(money(Math.round(r.balance)), M + 100, y, { align: 'right' });
    setText(doc, r.phase === 'accumulation' ? GREEN : AMBER);
    doc.text(r.phase === 'accumulation' ? L.phaseA : L.phaseD, M + CW - 3, y, { align: 'right' });
    y += rowH;
  });

  // Monthly needed by profile
  y = ensure(doc, y + 8, 70);
  y = sectionTitle(doc, y, L.monthlyTitle);
  y = wrapText(doc, L.monthlySub(engine.mSav), M, y, CW, 8.5, SLATE, 4) + 2;
  var mn = engine.monthlyNeeded || [];
  var rowH2 = 5.5;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); setText(doc, SLATE);
  setFill(doc, BG); doc.rect(M, y - 4, CW, rowH2 + 0.5, 'F');
  doc.text(L.colProfile, M + 3, y);
  doc.text(L.colReturn, M + 95, y, { align: 'right' });
  doc.text(L.colNeeded, M + CW - 3, y, { align: 'right' });
  y += rowH2 + 0.5;
  mn.slice(0, 7).forEach(function (p, k) {
    if (k % 2 === 1) { setFill(doc, BG); doc.rect(M, y - 4, CW, rowH2, 'F'); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); setText(doc, INK);
    doc.text(p.name, M + 3, y);
    setText(doc, SLATE);
    doc.text(pctS(p.realReturn), M + 95, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    if (p.monthly > 0) { setText(doc, INK); doc.text(money(Math.round(p.monthly)) + L.perMonth, M + CW - 3, y, { align: 'right' }); }
    else { setText(doc, GREEN); doc.text(L.surplusBy(p.surplus), M + CW - 3, y, { align: 'right' }); }
    y += rowH2;
  });

  // Cost of waiting
  if (d.inaction && d.inaction.rows.length > 0) {
    y = ensure(doc, y + 8, 50);
    y = sectionTitle(doc, y, L.inactionTitle);
    y = wrapText(doc, L.inactionSub({ name: d.inaction.profName, years: d.inaction.horizon }), M, y, CW, 8.5, SLATE, 4) + 2;
    var rowH3 = 5.5;
    setFill(doc, [240, 253, 244]); doc.rect(M, y - 4, CW, rowH3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); setText(doc, GREEN);
    doc.text(L.startToday, M + 3, y);
    doc.text(money(Math.round(d.inaction.today)), M + CW - 3, y, { align: 'right' });
    y += rowH3;
    d.inaction.rows.forEach(function (r, k) {
      if (k % 2 === 1) { setFill(doc, BG); doc.rect(M, y - 4, CW, rowH3, 'F'); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); setText(doc, INK);
      doc.text(L.waitN(r.delay), M + 3, y);
      setText(doc, SLATE);
      doc.text(money(Math.round(r.val)), M + 110, y, { align: 'right' });
      doc.setFont('helvetica', 'bold'); setText(doc, RED);
      doc.text(L.lost(r.lost), M + CW - 3, y, { align: 'right' });
      y += rowH3;
    });
  }
  return y;
}

// ── Conditional extras (aparecen SOLO si el usuario cargó esos datos) ─
function pageExtras(doc, engine, store, L, y) {
  // Health Score — requiere datos reales de ingresos (si no, el score engaña)
  if (engine.hasIncomeData && engine.hScore && engine.hScore.bd && engine.hScore.bd.length) {
    var bd = engine.hScore.bd;
    var recs = (engine.hScore.recs || []).slice(0, 3);
    y = ensure(doc, y + 8, 30 + bd.length * 5.5 + recs.length * 10);
    y = sectionTitle(doc, y, L.extrasScoreTitle);
    var sc = engine.hScore.s;
    var scColor = sc >= 70 ? GREEN : sc >= 40 ? AMBER : RED;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); setText(doc, scColor);
    doc.text(sc + ' / 100', M + 3, y + 4);
    y += 12;
    bd.forEach(function (b, k) {
      if (k % 2 === 0) { setFill(doc, BG); doc.rect(M, y - 4, CW, 5.5, 'F'); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); setText(doc, INK);
      doc.text(String(b.l), M + 3, y);
      doc.setFont('helvetica', 'bold');
      setText(doc, b.st === 'good' ? GREEN : b.st === 'ok' ? AMBER : RED);
      doc.text(b.s + ' / ' + b.m, M + CW - 3, y, { align: 'right' });
      y += 5.5;
    });
    if (recs.length) {
      y += 4;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); setText(doc, INK);
      doc.text(L.extrasRecs, M + 3, y); y += 5;
      recs.forEach(function (r) {
        y = wrapText(doc, '• ' + r.text, M + 3, y, CW - 6, 8, SLATE, 3.8) + 2;
      });
    }
  }

  // Deudas — requiere deudas cargadas con tasa
  var debts = (!store.noDebts && engine.debtAn) ? engine.debtAn.slice(0, 8) : [];
  if (debts.length) {
    y = ensure(doc, y + 8, 34 + debts.length * 5.5);
    y = sectionTitle(doc, y, L.extrasDebtsTitle);
    y = wrapText(doc, L.extrasDebtsSub(engine.totalDebtAll), M, y, CW, 8.5, SLATE, 4) + 2;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); setText(doc, SLATE);
    setFill(doc, BG); doc.rect(M, y - 4, CW, 6, 'F');
    doc.text(L.colDebt, M + 3, y);
    doc.text(L.colBalance2, M + 90, y, { align: 'right' });
    doc.text(L.colRate, M + 120, y, { align: 'right' });
    doc.text(L.colSev, M + CW - 3, y, { align: 'right' });
    y += 6;
    debts.forEach(function (dd, k) {
      if (k % 2 === 1) { setFill(doc, BG); doc.rect(M, y - 4, CW, 5.5, 'F'); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); setText(doc, INK);
      doc.text(String(dd.name || '').slice(0, 42), M + 3, y);
      doc.text(money(dd.bal), M + 90, y, { align: 'right' });
      setText(doc, SLATE);
      doc.text(Number(dd.rate).toFixed(1) + '%', M + 120, y, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      setText(doc, dd.sev === 'critical' ? RED : dd.sev === 'high' || dd.sev === 'moderate' ? AMBER : GREEN);
      doc.text(L.sevLabels[dd.sev] || String(dd.sev), M + CW - 3, y, { align: 'right' });
      y += 5.5;
    });
  }

  // Oportunidades de ahorro — requiere gastos discrecionales cargados
  var opps = (engine.savOpps || []).slice(0, 6);
  if (opps.length && engine.totalSavOpp && engine.totalSavOpp.mo > 0) {
    y = ensure(doc, y + 8, 36 + (opps.length + 1) * 5.5);
    y = sectionTitle(doc, y, L.extrasSavTitle);
    y = wrapText(doc, L.extrasSavSub, M, y, CW, 8.5, SLATE, 4) + 2;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); setText(doc, SLATE);
    setFill(doc, BG); doc.rect(M, y - 4, CW, 6, 'F');
    doc.text(L.colExpense, M + 3, y);
    doc.text(L.colCurrent, M + 78, y, { align: 'right' });
    doc.text(L.colCut, M + 102, y, { align: 'right' });
    doc.text(L.colSaved, M + 132, y, { align: 'right' });
    doc.text(L.colImp20, M + CW - 3, y, { align: 'right' });
    y += 6;
    opps.forEach(function (o, k) {
      if (k % 2 === 1) { setFill(doc, BG); doc.rect(M, y - 4, CW, 5.5, 'F'); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); setText(doc, INK);
      doc.text(String(o.name || '').slice(0, 30), M + 3, y);
      setText(doc, SLATE);
      doc.text(money(o.cur), M + 78, y, { align: 'right' });
      doc.text(o.cutPct + '%', M + 102, y, { align: 'right' });
      doc.setFont('helvetica', 'bold'); setText(doc, GREEN);
      doc.text(money(o.saved), M + 132, y, { align: 'right' });
      setText(doc, INK);
      doc.text(moneyC(o.imp20), M + CW - 3, y, { align: 'right' });
      y += 5.5;
    });
    setFill(doc, [240, 253, 244]); doc.rect(M, y - 4, CW, 6, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); setText(doc, [22, 101, 52]);
    doc.text(L.savTotal, M + 3, y);
    doc.text(money(engine.totalSavOpp.mo), M + 132, y, { align: 'right' });
    doc.text(moneyC(engine.totalSavOpp.imp20), M + CW - 3, y, { align: 'right' });
    y += 6;
  }

  // Metas intermedias — requiere metas válidas cargadas
  var goals = (engine.goalCalcs || []).filter(function (g) { return g.valid; }).slice(0, 8);
  if (goals.length) {
    y = ensure(doc, y + 8, 34 + goals.length * 5.5);
    y = sectionTitle(doc, y, L.extrasGoalsTitle);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); setText(doc, SLATE);
    setFill(doc, BG); doc.rect(M, y - 4, CW, 6, 'F');
    doc.text(L.colGoal, M + 3, y);
    doc.text(L.colAmount, M + 85, y, { align: 'right' });
    doc.text(L.colYears2, M + 110, y, { align: 'right' });
    doc.text(L.colPerMo, M + CW - 3, y, { align: 'right' });
    y += 6;
    goals.forEach(function (g, k) {
      if (k % 2 === 1) { setFill(doc, BG); doc.rect(M, y - 4, CW, 5.5, 'F'); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); setText(doc, INK);
      doc.text(String(g.name || L.goalFallback(k + 1)).slice(0, 40), M + 3, y);
      doc.text(money(g.nAmt), M + 85, y, { align: 'right' });
      setText(doc, SLATE);
      doc.text(String(g.nYrs), M + 110, y, { align: 'right' });
      doc.setFont('helvetica', 'bold'); setText(doc, INK);
      doc.text(money(Math.round(g.mo)) + L.perMonth, M + CW - 3, y, { align: 'right' });
      y += 5.5;
    });
    if (engine.goalRetImpact && engine.goalRetImpact.diff > 0) {
      y = wrapText(doc, L.goalImpact({ diff: engine.goalRetImpact.diff, pct: engine.goalRetImpact.pctOfMagic }), M, y + 2, CW, 8, [146, 64, 14], 3.8, 'italic') + 2;
    }
  }
  return y;
}

function page3(doc, engine, L) {
  var y = 20;
  y = sectionTitle(doc, y, L.methodTitle);
  function block(title, body) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); setText(doc, INK);
    doc.text(title, M, y + 2);
    y = wrapText(doc, body, M, y + 7, CW, 8.8, SLATE, 4.1) + 4;
  }
  block(L.method1T, L.method1);
  block(L.method2T, L.method2);
  block(L.method3T, L.method3);

  // Profiles table
  var rowH = 5.8;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); setText(doc, SLATE);
  setFill(doc, BG); doc.rect(M, y - 4, CW, rowH + 0.5, 'F');
  doc.text(L.colProfile, M + 3, y);
  doc.text(L.colNominal, M + 105, y, { align: 'right' });
  doc.text(L.colReal + pctS(engine.INFL) + ')', M + CW - 3, y, { align: 'right' });
  y += rowH + 0.5;
  engine.adjProfiles.forEach(function (p, k) {
    if (k % 2 === 1) { setFill(doc, BG); doc.rect(M, y - 4, CW, rowH, 'F'); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); setText(doc, INK);
    doc.text(p.name, M + 3, y);
    setText(doc, SLATE);
    doc.text(pctS(p.nomReturn), M + 105, y, { align: 'right' });
    doc.setFont('helvetica', 'bold'); setText(doc, INK);
    doc.text(pctS(p.realReturn), M + CW - 3, y, { align: 'right' });
    y += rowH;
  });
  y += 5;
  block(L.method4T, L.method4);
  block(L.method5T, L.method5);

  // Disclaimer box
  setFill(doc, [254, 252, 232]); setDraw(doc, [253, 230, 138]); doc.setLineWidth(0.3);
  var dy = y + 2;
  doc.roundedRect(M, dy, CW, 24, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); setText(doc, [146, 64, 14]);
  doc.text(L.disclaimerT, M + 5, dy + 6.5);
  wrapText(doc, L.disclaimer, M + 5, dy + 11.5, CW - 10, 8, [120, 72, 20], 3.8);
  y = dy + 30;

  // Advisor CTA
  setFill(doc, [240, 253, 244]); setDraw(doc, [187, 247, 208]);
  doc.roundedRect(M, y, CW, 18, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); setText(doc, [22, 101, 52]);
  doc.text(L.ctaT, M + 5, y + 7);
  wrapText(doc, L.cta, M + 5, y + 12.5, CW - 10, 8.2, [22, 101, 52], 3.8);
}

// ── Public API ───────────────────────────────────────────────────────
export function buildReport(input) {
  var engine = input.engine, store = input.store;
  var lang = input.lang === 'en' ? 'en' : 'es';
  var L = STR[lang];
  var now = new Date();
  var dateStr = now.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  var d = prepData(engine, store);

  var trajectory = engine.ybYReport;

  var doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  page1(doc, engine, store, L, d, dateStr);
  doc.addPage();
  var y2 = page2(doc, engine, store, L, d, trajectory);
  pageExtras(doc, engine, store, L, y2);
  doc.addPage();
  page3(doc, engine, L);
  footerAll(doc, L, dateStr);
  return doc;
}

/** Download the report in the browser. Returns the filename. */
export function downloadReport(input) {
  var doc = buildReport(input);
  var iso = new Date().toISOString().slice(0, 10);
  var name = (input.lang === 'en' ? 'MagicNumber-Report-' : 'MagicNumber-Informe-') + iso + '.pdf';
  doc.save(name);
  return name;
}

/** Base64 (no data-uri prefix) for email attachment. */
export function reportAsBase64(input) {
  var doc = buildReport(input);
  var uri = doc.output('datauristring');
  return uri.slice(uri.indexOf(',') + 1);
}
