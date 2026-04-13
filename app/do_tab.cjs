const fs = require('fs');
const src = fs.readFileSync('app/src/MagicNumberAppMain.jsx', 'utf8');
const lines = src.split(/\r?\n/);

// Debts tab: line 635 to ~755 (1-indexed). Inner: 636-754 (0-indexed: 635-753)
// Find end: line before "=== RETIREMENT ===" comment
const retirementLine = lines.findIndex(l => l.includes('=== RETIREMENT ==='));
const debtsEnd = retirementLine - 1; // blank line before comment
const debtsClosing = debtsEnd - 1; // </div>}
console.log('Debts inner: lines 636 to ' + (debtsClosing) + ' (0-indexed: 635 to ' + (debtsClosing - 1) + ')');

const inner = lines.slice(635, debtsClosing).join('\r\n');

const imports = [
  "import Cd from '../components/Card.jsx';",
  "import ST from '../components/SectionTitle.jsx';",
  "import NI from '../components/NumberInput.jsx';",
  "import Toggle from '../components/Toggle.jsx';",
  "import NavButtons from '../components/NavButtons.jsx';",
  "import Icon from '../components/Icon.jsx';",
  "import { useTranslation } from '../i18n/index.jsx';",
  "import { fmt, pct } from '../utils/formatters.js';",
].join('\r\n');

const props = 'tab, goTab, tier, lang, ownsHome, nMortPay, noMortgage, setNoMortgage, mortgageYearsLeft, setMortgageYearsLeft, mortgageBalance, setMortgageBalance, mortgageRate, setMortgageRate, nMortYrs, nAge, nEx, mortBal, noDebts, setNoDebts, noCarLoan, setNoCarLoan, carBalance, setCarBalance, carYearsLeft, setCarYearsLeft, carRate, setCarRate, carPayment, setCarPayment, debts, aD, uD, rD, debtAn, probDebts, totalMonthlyObligations, emergencyMonths, PROFILES';

const out = imports + '\r\n\r\nexport default function DebtsTab({ ' + props + ' }) {\r\n  const { t } = useTranslation();\r\n  return (\r\n    <div className="fi">\r\n' + inner + '\r\n    </div>\r\n  );\r\n}\r\n';

fs.writeFileSync('app/src/tabs/DebtsTab.jsx', out, 'utf8');
console.log('DebtsTab.jsx created: ' + out.split('\n').length + ' lines');

// Replace in monolith
const ref = '{/* === DEBTS === */}\r\n{tab==="debts"&&<DebtsTab tab={tab} goTab={goTab} tier={tier} lang={lang} ownsHome={ownsHome} nMortPay={nMortPay} noMortgage={noMortgage} setNoMortgage={setNoMortgage} mortgageYearsLeft={mortgageYearsLeft} setMortgageYearsLeft={setMortgageYearsLeft} mortgageBalance={mortgageBalance} setMortgageBalance={setMortgageBalance} mortgageRate={mortgageRate} setMortgageRate={setMortgageRate} nMortYrs={nMortYrs} nAge={nAge} nEx={nEx} mortBal={mortBal} noDebts={noDebts} setNoDebts={setNoDebts} noCarLoan={noCarLoan} setNoCarLoan={setNoCarLoan} carBalance={carBalance} setCarBalance={setCarBalance} carYearsLeft={carYearsLeft} setCarYearsLeft={setCarYearsLeft} carRate={carRate} setCarRate={setCarRate} carPayment={carPayment} setCarPayment={setCarPayment} debts={debts} aD={aD} uD={uD} rD={rD} debtAn={debtAn} probDebts={probDebts} totalMonthlyObligations={totalMonthlyObligations} emergencyMonths={emergencyMonths} PROFILES={PROFILES} />}';

// Remove lines 634 (comment) through debtsClosing (0-indexed)
const newLines = [...lines.slice(0, 633), ref, ...lines.slice(debtsClosing + 1)];
fs.writeFileSync('app/src/MagicNumberAppMain.jsx', newLines.join('\r\n'), 'utf8');
console.log('Monolith updated: ' + newLines.length + ' lines');
