const fs = require('fs');
const src = fs.readFileSync('app/src/MagicNumberAppMain.jsx', 'utf8');
const lines = src.split(/\r?\n/);

const invStart = lines.findIndex(l => l.includes('tab==="invest"'));
const portfolioComment = lines.findIndex(l => l.includes('=== PORTFOLIO ==='));
const invEnd = portfolioComment - 2;
console.log('Invest: line ' + (invStart+1) + ' to ' + (invEnd+1));

const inner = lines.slice(invStart + 1, invEnd).join('\r\n');

const imports = [
  "import Cd from '../components/Card.jsx';",
  "import ST from '../components/SectionTitle.jsx';",
  "import NI from '../components/NumberInput.jsx';",
  "import Toggle from '../components/Toggle.jsx';",
  "import NavButtons from '../components/NavButtons.jsx';",
  "import Icon from '../components/Icon.jsx';",
  "import Tip from '../components/Tip.jsx';",
  "import TabBtn from '../components/TabButton.jsx';",
  "import MultiLineChart from '../components/MultiLineChart.jsx';",
  "import { useTranslation } from '../i18n/index.jsx';",
  "import { fmt, fmtC, pct } from '../utils/formatters.js';",
].join('\r\n');

const props = 'tab, goTab, tier, lang, mSav, nEx, projYears, setProjYears, projs, maxProj, showNom, setShowNom, customReturn, setCustomReturn, customInflation, INFL, showScenarios, setShowScenarios, scenProfileIdx, setScenProfileIdx, scenarios, allProfiles, adjProfiles, hasPortfolio, blendedPortReturn, costNS, costNSProfileIdx, setCostNSProfileIdx, costNSReturn, magic, debtEvents';

const out = imports + '\r\n\r\nexport default function InvestTab({ ' + props + ' }) {\r\n  const { t } = useTranslation();\r\n  return (\r\n    <div className="fi">\r\n' + inner + '\r\n    </div>\r\n  );\r\n}\r\n';

fs.writeFileSync('app/src/tabs/InvestTab.jsx', out, 'utf8');
console.log('InvestTab.jsx created: ' + out.split('\n').length + ' lines');

const ref = '{/* === INVESTMENT ALTERNATIVES === */}\r\n{tab==="invest"&&<InvestTab tab={tab} goTab={goTab} tier={tier} lang={lang} mSav={mSav} nEx={nEx} projYears={projYears} setProjYears={setProjYears} projs={projs} maxProj={maxProj} showNom={showNom} setShowNom={setShowNom} customReturn={customReturn} setCustomReturn={setCustomReturn} customInflation={customInflation} INFL={INFL} showScenarios={showScenarios} setShowScenarios={setShowScenarios} scenProfileIdx={scenProfileIdx} setScenProfileIdx={setScenProfileIdx} scenarios={scenarios} allProfiles={allProfiles} adjProfiles={adjProfiles} hasPortfolio={hasPortfolio} blendedPortReturn={blendedPortReturn} costNS={costNS} costNSProfileIdx={costNSProfileIdx} setCostNSProfileIdx={setCostNSProfileIdx} costNSReturn={costNSReturn} magic={magic} debtEvents={debtEvents} />}';

const commentLine = lines.findIndex(l => l.includes('=== INVESTMENT ALTERNATIVES ==='));
const newLines = [...lines.slice(0, commentLine), ref, ...lines.slice(invEnd + 1)];
fs.writeFileSync('app/src/MagicNumberAppMain.jsx', newLines.join('\r\n'), 'utf8');
console.log('Monolith updated: ' + newLines.length + ' lines');
