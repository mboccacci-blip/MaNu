const fs = require('fs');
const path = 'src/MagicNumberAppMain.jsx';

let lines = fs.readFileSync(path, 'utf8').split('\n');

const importIdx = lines.findIndex(l => l.includes("import ReportsTab"));
if (importIdx > -1) {
  lines.splice(importIdx + 1, 0, "import AchieveTab from './tabs/AchieveTab.jsx';", "import InactionTab from './tabs/InactionTab.jsx';", "import useFinancialEngine from './hooks/useFinancialEngine.js';");
}

const qIdx = lines.findIndex(l => l.trim() === "const q=\"'\";");
const goTabIdx = lines.findIndex(l => l.includes("var goTab=useCallback("));

if (qIdx > -1 && goTabIdx > -1) {
  const replacement = `  const engine = useFinancialEngine(store, t, lang);
  const {
    INFL, nAge, nInc, nP2I, nRentalEq, nRentalNet, totalIncome, nVac, totExp, nMortPay, nCarPay, nMortYrs, nCarYrs,
    totalMonthlyObligations, incomeFilledExp, hasIncomeData, mSavComputed, mSav, savRate, nRetAge, nYP, nDes, nEx,
    totalNetWorth, nSSRaw, nLegacy, ytr, nSS, totDebt, mortBal, carBal, totalDebtAll, nEI, nEIYrs, effectiveMSav,
    allDebts, debtEvents, TAX, adjProfiles, allProfiles, portReturn, portContribReturn, hasPortfolio, blendedPortReturn,
    desiredAfterSS, retProfReturn, retProfLabel, chartAccumReturn, chartRetireReturn, chartAccumLabel, chartRetireLabel,
    magic, mD, monthlyNeeded, ybYData, projs, maxProj, scenarios, costNSYears, costNSReturn, costNS,
    debtAn, probDebts, emergencyMonths, savOpps, totalSavOpp, earnProj, combinedImpact, costInRet, goalCalcs, totalGoalMo, goalImpactRate, goalRetImpact,
    simEffSav, simEffMo, simEffRet, simProjected, simGap, simPct, simNeededReturn, simNeededMonthly,
    revResult, hScore, bSR, bNW, percentiles
  } = engine;
`;
  lines.splice(qIdx, goTabIdx - qIdx, replacement);
}

const achieveIdx = lines.findIndex(l => l.includes('{tab==="achieve"&&<div className="fi">'));
const inactionIdx = lines.findIndex(l => l.includes('{tab==="inaction"&&<div className="fi">'));

if (achieveIdx > -1 && inactionIdx > -1) {
  lines.splice(achieveIdx, inactionIdx - achieveIdx, `{tab==="achieve"&&<AchieveTab tab={tab} goTab={goTab} tier={tier} engine={engine} isDemo={isDemo} />}`);
}

const inactionIdx2 = lines.findIndex(l => l.includes('{tab==="inaction"&&<div className="fi">'));
const saveIdx2 = lines.findIndex(l => l.includes('{tab==="save"&&<SaveTab'));

if (inactionIdx2 > -1 && saveIdx2 > -1) {
  lines.splice(inactionIdx2, saveIdx2 - inactionIdx2, `{tab==="inaction"&&<InactionTab tab={tab} goTab={goTab} tier={tier} engine={engine} />}`);
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Refactored MagicNumberAppMain.jsx');
