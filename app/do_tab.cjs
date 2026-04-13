const fs = require('fs');
const src = fs.readFileSync('app/src/MagicNumberAppMain.jsx', 'utf8');
const lines = src.split(/\r?\n/);

// Find retirement start and end
const retStart = lines.findIndex(l => l.includes('tab==="retirement"'));
const investComment = lines.findIndex(l => l.includes('=== INVESTMENT'));
const retEnd = investComment - 2; // blank line + </div>}
console.log('Retirement: line ' + (retStart+1) + ' to ' + (retEnd+1));

const inner = lines.slice(retStart + 1, retEnd).join('\r\n');

const imports = [
  "import Cd from '../components/Card.jsx';",
  "import ST from '../components/SectionTitle.jsx';",
  "import NavButtons from '../components/NavButtons.jsx';",
  "import Icon from '../components/Icon.jsx';",
  "import TabBtn from '../components/TabButton.jsx';",
  "import MultiLineChart from '../components/MultiLineChart.jsx';",
  "import ANum from '../components/AnimatedNumber.jsx';",
  "import { useTranslation } from '../i18n/index.jsx';",
  "import { fmt, fmtC, pct } from '../utils/formatters.js';",
].join('\r\n');

const props = 'tab, goTab, tier, lang, nAge, nRetAge, nYP, nEx, nDes, nSS, nLegacy, ytr, mSav, magic, mD, desiredAfterSS, nMortPay, nMortYrs, retProfLabel, retProfReturn, retProfileIdx, setRetProfileIdx, adjProfiles, allProfiles, hasPortfolio, monthlyNeeded, ybYData, chartProfileIdx, setChartProfileIdx, chartRetireIdx, setChartRetireIdx, chartAccumReturn, chartRetireReturn, debtEvents, magicRevealed, blendedPortReturn, TAX, assetTax, INFL';

const out = imports + '\r\n\r\nexport default function RetirementTab({ ' + props + ' }) {\r\n  const { t } = useTranslation();\r\n  return (\r\n    <div className="fi">\r\n' + inner + '\r\n    </div>\r\n  );\r\n}\r\n';

fs.writeFileSync('app/src/tabs/RetirementTab.jsx', out, 'utf8');
console.log('RetirementTab.jsx created: ' + out.split('\n').length + ' lines');

// Replace in monolith
const ref = '{/* === RETIREMENT === */}\r\n{tab==="retirement"&&<RetirementTab tab={tab} goTab={goTab} tier={tier} lang={lang} nAge={nAge} nRetAge={nRetAge} nYP={nYP} nEx={nEx} nDes={nDes} nSS={nSS} nLegacy={nLegacy} ytr={ytr} mSav={mSav} magic={magic} mD={mD} desiredAfterSS={desiredAfterSS} nMortPay={nMortPay} nMortYrs={nMortYrs} retProfLabel={retProfLabel} retProfReturn={retProfReturn} retProfileIdx={retProfileIdx} setRetProfileIdx={setRetProfileIdx} adjProfiles={adjProfiles} allProfiles={allProfiles} hasPortfolio={hasPortfolio} monthlyNeeded={monthlyNeeded} ybYData={ybYData} chartProfileIdx={chartProfileIdx} setChartProfileIdx={setChartProfileIdx} chartRetireIdx={chartRetireIdx} setChartRetireIdx={setChartRetireIdx} chartAccumReturn={chartAccumReturn} chartRetireReturn={chartRetireReturn} debtEvents={debtEvents} magicRevealed={magicRevealed} blendedPortReturn={blendedPortReturn} TAX={TAX} assetTax={assetTax} INFL={INFL} />}';

const commentLine = lines.findIndex(l => l.includes('=== RETIREMENT ==='));
const newLines = [...lines.slice(0, commentLine), ref, ...lines.slice(retEnd + 1)];
fs.writeFileSync('app/src/MagicNumberAppMain.jsx', newLines.join('\r\n'), 'utf8');
console.log('Monolith updated: ' + newLines.length + ' lines');
