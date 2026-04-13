const fs = require('fs');
const src = fs.readFileSync('app/src/MagicNumberAppMain.jsx', 'utf8');
const lines = src.split(/\r?\n/);
// Situation: lines 632-704 (inner content, 0-indexed: 631-703)
const inner = lines.slice(631, 704).join('\r\n');

const imports = [
  "import Cd from '../components/Card.jsx';",
  "import ST from '../components/SectionTitle.jsx';",
  "import NI from '../components/NumberInput.jsx';",
  "import NavButtons from '../components/NavButtons.jsx';",
  "import Icon from '../components/Icon.jsx';",
  "import Tip from '../components/Tip.jsx';",
  "import { useTranslation } from '../i18n/index.jsx';",
  "import { fmt } from '../utils/formatters.js';",
].join('\r\n');

const props = 'tab, goTab, tier, lang, coupleMode, hasRental, monthlyIncome, setMonthlyIncome, partner2Income, setPartner2Income, vacationAnnual, setVacationAnnual, nEx, nRentalEq, totalNetWorth, ownsHome, setOwnsHome, mortgagePayment, setMortgagePayment, nMortPay, expenses, aE, uE, rE, nVac, mSav, totalIncome, totalMonthlyObligations, totExp, nInc, nP2I, nRentalNet, nCarPay, debtEvents';

const out = imports + '\r\n\r\nexport default function SituationTab({ ' + props + ' }) {\r\n  const { t } = useTranslation();\r\n  return (\r\n    <div className="fi">\r\n' + inner + '\r\n    </div>\r\n  );\r\n}\r\n';

fs.writeFileSync('app/src/tabs/SituationTab.jsx', out, 'utf8');
console.log('SituationTab.jsx created: ' + out.split('\n').length + ' lines');

// Now replace in monolith: lines 630-705 (0-indexed) with component reference
const ref = '{/* === INCOME === */}\r\n{tab==="situation"&&<SituationTab tab={tab} goTab={goTab} tier={tier} lang={lang} coupleMode={coupleMode} hasRental={hasRental} monthlyIncome={monthlyIncome} setMonthlyIncome={setMonthlyIncome} partner2Income={partner2Income} setPartner2Income={setPartner2Income} vacationAnnual={vacationAnnual} setVacationAnnual={setVacationAnnual} nEx={nEx} nRentalEq={nRentalEq} totalNetWorth={totalNetWorth} ownsHome={ownsHome} setOwnsHome={setOwnsHome} mortgagePayment={mortgagePayment} setMortgagePayment={setMortgagePayment} nMortPay={nMortPay} expenses={expenses} aE={aE} uE={uE} rE={rE} nVac={nVac} mSav={mSav} totalIncome={totalIncome} totalMonthlyObligations={totalMonthlyObligations} totExp={totExp} nInc={nInc} nP2I={nP2I} nRentalNet={nRentalNet} nCarPay={nCarPay} debtEvents={debtEvents} />}';

const newLines = [...lines.slice(0, 629), ref, ...lines.slice(705)];
fs.writeFileSync('app/src/MagicNumberAppMain.jsx', newLines.join('\r\n'), 'utf8');
console.log('Monolith updated: ' + newLines.length + ' lines');
