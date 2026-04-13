const fs = require('fs');
const src = fs.readFileSync('app/src/MagicNumberAppMain.jsx', 'utf8');
const lines = src.split(/\r?\n/);

const achStart = lines.findIndex(l => l.includes('tab==="achieve"'));
const inactionComment = lines.findIndex(l => l.includes('COST OF INACTION'));
const achEnd = inactionComment - 2;
console.log('Achieve: line ' + (achStart+1) + ' to ' + (achEnd+1) + ' (inaction comment at ' + (inactionComment+1) + ')');

const inner = lines.slice(achStart + 1, achEnd).join('\r\n');

const imports = [
  "import Cd from '../components/Card.jsx';",
  "import ST from '../components/SectionTitle.jsx';",
  "import NI from '../components/NumberInput.jsx';",
  "import Toggle from '../components/Toggle.jsx';",
  "import Slider from '../components/Slider.jsx';",
  "import NavButtons from '../components/NavButtons.jsx';",
  "import Icon from '../components/Icon.jsx';",
  "import Tip from '../components/Tip.jsx';",
  "import TabBtn from '../components/TabButton.jsx';",
  "import MiniChart from '../components/MiniChart.jsx';",
  "import MultiLineChart from '../components/MultiLineChart.jsx';",
  "import ANum from '../components/AnimatedNumber.jsx';",
  "import { useTranslation } from '../i18n/index.jsx';",
  "import { fmt, fmtC, pct } from '../utils/formatters.js';",
].join('\r\n');

const props = 'tab, goTab, tier, lang, nAge, nRetAge, nYP, nEx, nDes, nSS, nLegacy, ytr, mSav, magic, mD, desiredAfterSS, age, setAge, retireAge, setRetireAge, yearsInRetirement, setYearsInRetirement, existingSavings, setExistingSavings, desiredRetIncome, setDesiredRetIncome, socialSecurity, setSocialSecurity, legacyAmount, setLegacyAmount, retProfileIdx, setRetProfileIdx, adjProfiles, allProfiles, hasPortfolio, retProfLabel, retProfReturn, magicRevealed, blendedPortReturn, q, paidHint, monthlyNeeded, ybYData, chartProfileIdx, setChartProfileIdx, chartRetireIdx, setChartRetireIdx, chartAccumReturn, chartRetireReturn, debtEvents, TAX, assetTax, INFL, showNom, setShowNom, projYears, setProjYears, projs, maxProj, customReturn, setCustomReturn';

const out = imports + '\r\n\r\nexport default function AchieveTab({ ' + props + ' }) {\r\n  const { t } = useTranslation();\r\n  return (\r\n    <div className="fi">\r\n' + inner + '\r\n    </div>\r\n  );\r\n}\r\n';

fs.writeFileSync('app/src/tabs/AchieveTab.jsx', out, 'utf8');
console.log('AchieveTab.jsx created: ' + out.split('\n').length + ' lines');

const ref = '{/* === YOUR MAGIC NUMBER === */}\r\n{tab==="achieve"&&<AchieveTab tab={tab} goTab={goTab} tier={tier} lang={lang} nAge={nAge} nRetAge={nRetAge} nYP={nYP} nEx={nEx} nDes={nDes} nSS={nSS} nLegacy={nLegacy} ytr={ytr} mSav={mSav} magic={magic} mD={mD} desiredAfterSS={desiredAfterSS} age={age} setAge={setAge} retireAge={retireAge} setRetireAge={setRetireAge} yearsInRetirement={yearsInRetirement} setYearsInRetirement={setYearsInRetirement} existingSavings={existingSavings} setExistingSavings={setExistingSavings} desiredRetIncome={desiredRetIncome} setDesiredRetIncome={setDesiredRetIncome} socialSecurity={socialSecurity} setSocialSecurity={setSocialSecurity} legacyAmount={legacyAmount} setLegacyAmount={setLegacyAmount} retProfileIdx={retProfileIdx} setRetProfileIdx={setRetProfileIdx} adjProfiles={adjProfiles} allProfiles={allProfiles} hasPortfolio={hasPortfolio} retProfLabel={retProfLabel} retProfReturn={retProfReturn} magicRevealed={magicRevealed} blendedPortReturn={blendedPortReturn} q={q} paidHint={paidHint} monthlyNeeded={monthlyNeeded} ybYData={ybYData} chartProfileIdx={chartProfileIdx} setChartProfileIdx={setChartProfileIdx} chartRetireIdx={chartRetireIdx} setChartRetireIdx={setChartRetireIdx} chartAccumReturn={chartAccumReturn} chartRetireReturn={chartRetireReturn} debtEvents={debtEvents} TAX={TAX} assetTax={assetTax} INFL={INFL} showNom={showNom} setShowNom={setShowNom} projYears={projYears} setProjYears={setProjYears} projs={projs} maxProj={maxProj} customReturn={customReturn} setCustomReturn={setCustomReturn} />}';

const commentLine = lines.findIndex(l => l.includes('=== YOUR MAGIC NUMBER ==='));
const newLines = [...lines.slice(0, commentLine), ref, ...lines.slice(achEnd + 1)];
fs.writeFileSync('app/src/MagicNumberAppMain.jsx', newLines.join('\r\n'), 'utf8');
console.log('Monolith updated: ' + newLines.length + ' lines');
