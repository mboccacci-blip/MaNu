import { useState, useEffect, useRef, useCallback } from "react";
import { PROFILES, TABS } from './constants.js';
import { useTranslation } from './i18n/index.jsx';
import useAppStore from './store/useAppStore.js';
import Icon from './components/Icon.jsx';
import LeadCaptureModal from './components/LeadCaptureModal.jsx';
import { track, EVENTS } from './utils/analytics.js';
import AssumptionsTab from './tabs/AssumptionsTab.jsx';
import LearnTab from './tabs/LearnTab.jsx';
import DashboardTab from './tabs/DashboardTab.jsx';
import PortfolioTab from './tabs/PortfolioTab.jsx';
import ScoreTab from './tabs/ScoreTab.jsx';
import ReportsTab from './tabs/ReportsTab.jsx';
import AchieveTab from './tabs/AchieveTab.jsx';
import InactionTab from './tabs/InactionTab.jsx';
import useFinancialEngine from './hooks/useFinancialEngine.js';
import GoalsTab from './tabs/GoalsTab.jsx';
import SaveTab from './tabs/SaveTab.jsx';
import EarnTab from './tabs/EarnTab.jsx';
import CostTab from './tabs/CostTab.jsx';
import SituationTab from './tabs/SituationTab.jsx';
import DebtsTab from './tabs/DebtsTab.jsx';
import RetirementTab from './tabs/RetirementTab.jsx';
import InvestTab from './tabs/InvestTab.jsx';

export default function MagicNumberApp({onBack}){
  const {t, lang, toggleLang} = useTranslation();
  // Demo mode: ?demo=1 in URL grants full paid access
  const isDemo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';

  // ── Zustand Store ──────────────────────────────────────────────────
  const store = useAppStore();
  const sf = store.setField;

  // Destructure all state for backward compatibility with existing JSX
  const tab = store.tab;
  const setTab = function(v) { sf('tab', v); };
  const setupDone = store.setupDone;
  const setSetupDone = function(v) { sf('setupDone', v); };
  const tier = isDemo ? "paid" : store.tier;
  const setTier = function(v) { sf('tier', v); };
  const demoBannerVisible = isDemo ? true : store.demoBannerVisible;
  const setDemoBannerVisible = function(v) { sf('demoBannerVisible', v); };
  const showLeadModal = store.showLeadModal;
  const setShowLeadModal = function(v) { sf('showLeadModal', v); };
  const userEmail = store.userEmail;
  const setUserEmail = function(v) { sf('userEmail', v); };
  const emailError = store.emailError;
  const setEmailError = function(v) { sf('emailError', v); };
  const FREE_TABS = ["achieve", "inaction", "learn"];
  const [paidToast, setPaidToast] = useState(false);
  const prevTierRef = useRef(tier);

  // Detect upgrade to paid → show welcome toast once
  useEffect(function(){
    if(prevTierRef.current !== "paid" && tier === "paid" && !isDemo){
      setPaidToast(true);
      goTab("dashboard");
      setTimeout(function(){ setPaidToast(false); }, 6000);
    }
    prevTierRef.current = tier;
  }, [tier]);

  useEffect(function(){
    document.title = "MaNu PRO";
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('dashboard.welcomeSub') || "");
  }, [lang]);

  // Income & Basic
  const age = store.age; const setAge = function(v) { sf('age', v); };
  const monthlyIncome = store.monthlyIncome; const setMonthlyIncome = function(v) { sf('monthlyIncome', v); };
  const expenses = store.expenses; const setExpenses = function(v) { sf('expenses', v); };
  const nEId = useRef(store._nEId);
  const ownsHome = store.ownsHome; const setOwnsHome = function(v) { sf('ownsHome', v); };
  const vacationAnnual = store.vacationAnnual; const setVacationAnnual = function(v) { sf('vacationAnnual', v); };
  const coupleMode = store.coupleMode; const setCoupleMode = function(v) { sf('coupleMode', v); };
  const partner2Income = store.partner2Income; const setPartner2Income = function(v) { sf('partner2Income', v); };
  const hasRental = store.hasRental; const setHasRental = function(v) { sf('hasRental', v); };
  const rentalEquity = store.rentalEquity; const setRentalEquity = function(v) { sf('rentalEquity', v); };
  const rentalNetIncome = store.rentalNetIncome; const setRentalNetIncome = function(v) { sf('rentalNetIncome', v); };

  // Debts
  const debts = store.debts; const setDebts = function(v) { sf('debts', v); };
  const noDebts = store.noDebts; const setNoDebts = function(v) { sf('noDebts', v); };
  const noMortgage = store.noMortgage; const setNoMortgage = function(v) { sf('noMortgage', v); };
  const mortgageBalance = store.mortgageBalance; const setMortgageBalance = function(v) { sf('mortgageBalance', v); };
  const mortgageRate = store.mortgageRate; const setMortgageRate = function(v) { sf('mortgageRate', v); };
  const mortgagePayment = store.mortgagePayment; const setMortgagePayment = function(v) { sf('mortgagePayment', v); };
  const mortgageYearsLeft = store.mortgageYearsLeft; const setMortgageYearsLeft = function(v) { sf('mortgageYearsLeft', v); };
  const noCarLoan = store.noCarLoan; const setNoCarLoan = function(v) { sf('noCarLoan', v); };
  const carBalance = store.carBalance; const setCarBalance = function(v) { sf('carBalance', v); };
  const carRate = store.carRate; const setCarRate = function(v) { sf('carRate', v); };
  const carPayment = store.carPayment; const setCarPayment = function(v) { sf('carPayment', v); };
  const carYearsLeft = store.carYearsLeft; const setCarYearsLeft = function(v) { sf('carYearsLeft', v); };
  const nDId = useRef(store._nDId);

  // Retirement
  const retirementAge = store.retirementAge; const setRetirementAge = function(v) { sf('retirementAge', v); };
  const yearsPostRet = store.yearsPostRet; const setYearsPostRet = function(v) { sf('yearsPostRet', v); };
  const desiredIncome = store.desiredIncome; const setDesiredIncome = function(v) { sf('desiredIncome', v); };
  const existingSavings = store.existingSavings; const setExistingSavings = function(v) { sf('existingSavings', v); };
  const socialSecurity = store.socialSecurity; const setSocialSecurity = function(v) { sf('socialSecurity', v); };
  const magicRevealed = store.magicRevealed; const setMagicRevealed = function(v) { sf('magicRevealed', v); };
  const retProfileIdx = store.retProfileIdx; const setRetProfileIdx = function(v) { sf('retProfileIdx', v); };
  const chartProfileIdx = store.chartProfileIdx; const setChartProfileIdx = function(v) { sf('chartProfileIdx', v); };
  const chartRetireIdx = store.chartRetireIdx; const setChartRetireIdx = function(v) { sf('chartRetireIdx', v); };

  // Investment
  const showNom = store.showNom; const setShowNom = function(v) { sf('showNom', v); };
  const projYears = store.projYears; const setProjYears = function(v) { sf('projYears', v); };
  const customInflation = store.customInflation; const setCustomInflation = function(v) { sf('customInflation', v); };
  const showScenarios = store.showScenarios; const setShowScenarios = function(v) { sf('showScenarios', v); };
  const customReturn = store.customReturn; const setCustomReturn = function(v) { sf('customReturn', v); };
  const scenProfileIdx = store.scenProfileIdx; const setScenProfileIdx = function(v) { sf('scenProfileIdx', v); };
  const costNSProfileIdx = store.costNSProfileIdx; const setCostNSProfileIdx = function(v) { sf('costNSProfileIdx', v); };

  // Portfolio
  const portAlloc = store.portAlloc; const setPortAlloc = function(v) { sf('portAlloc', v); };
  const portContribAlloc = store.portContribAlloc; const setPortContribAlloc = function(v) { sf('portContribAlloc', v); };

  // Strategy & Simulation
  const savSliders = store.savSliders; const setSavSliders = function(v) { sf('savSliders', v); };
  const extraIncome = store.extraIncome; const setExtraIncome = function(v) { sf('extraIncome', v); };
  const eiTemporary = store.eiTemporary; const setEiTemporary = function(v) { sf('eiTemporary', v); };
  const eiYears = store.eiYears; const setEiYears = function(v) { sf('eiYears', v); };
  const costItemName = store.costItemName; const setCostItemName = function(v) { sf('costItemName', v); };
  const costItemPrice = store.costItemPrice; const setCostItemPrice = function(v) { sf('costItemPrice', v); };
  const costProfileIdx = store.costProfileIdx; const setCostProfileIdx = function(v) { sf('costProfileIdx', v); };
  const goals = store.goals; const setGoals = function(v) { sf('goals', v); };
  const nGId = useRef(store._nGId);
  const showRec = store.showRec; const setShowRec = function(v) { sf('showRec', v); };
  const simSav = store.simSav; const setSimSav = function(v) { sf('simSav', v); };
  const simMo = store.simMo; const setSimMo = function(v) { sf('simMo', v); };
  const simRet = store.simRet; const setSimRet = function(v) { sf('simRet', v); };
  const manualMonthlySav = store.manualMonthlySav; const setManualMonthlySav = function(v) { sf('manualMonthlySav', v); };
  const legacy = store.legacy; const setLegacy = function(v) { sf('legacy', v); };
  const assetTax = store.assetTax; const setAssetTax = function(v) { sf('assetTax', v); };

  const revDes = store.revDes; const setRevDes = function(v) { sf('revDes', v); };
  const revYrs = store.revYrs; const setRevYrs = function(v) { sf('revYrs', v); };
  const revSS = store.revSS; const setRevSS = function(v) { sf('revSS', v); };
  const revSav = store.revSav; const setRevSav = function(v) { sf('revSav', v); };
  const revMo = store.revMo; const setRevMo = function(v) { sf('revMo', v); };
  const revRet = store.revRet; const setRevRet = function(v) { sf('revRet', v); };
  const revRetProf = store.revRetProf; const setRevRetProf = function(v) { sf('revRetProf', v); };

  // Cost of Inaction
  const ciH = store.ciH; const setCiH = function(v) { sf('ciH', v); };
  const ciDelayProf = store.ciDelayProf; const setCiDelayProf = function(v) { sf('ciDelayProf', v); };
  const ciBase = store.ciBase; const setCiBase = function(v) { sf('ciBase', v); };
  const ciSav = store.ciSav; const setCiSav = function(v) { sf('ciSav', v); };
  const ciMo = store.ciMo; const setCiMo = function(v) { sf('ciMo', v); };

  // ── No more manual persistence — Zustand persist middleware handles it ──
  const loaded = true; // Always loaded with Zustand

  function clearAllData() {
    store.clearAll();
    nEId.current = 6; nDId.current = 2; nGId.current = 2;
  }

  const engine = useFinancialEngine(store, t, lang);
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

  var goTab=useCallback(function(t){setTab(t);track(EVENTS.TAB_VIEWED,{tab:t},{lang:lang,tier:tier});if(t==="retirement"&&!magicRevealed)setTimeout(function(){setMagicRevealed(true)},400);window.scrollTo({top:0,behavior:"smooth"})},[magicRevealed,lang,tier]);
  var hasData=nAge>0&&(hasIncomeData||(manualMonthlySav!==""&&nEx>0));
  var hasAssumptions=nAge>0&&nRetAge>0;
  var uE=useCallback(function(id,f,v){setExpenses(function(p){return p.map(function(e){return e.id===id?Object.assign({},e,{[f]:v}):e})})},[]);
  var aE=useCallback(function(){if(expenses.length>=15)return;setExpenses(function(p){return p.concat([{id:nEId.current++,name:"",amount:"",discretionary:true}])})},[expenses.length]);
  var rE=useCallback(function(id){setExpenses(function(p){return p.filter(function(e){return e.id!==id})})},[]);
  var uD=useCallback(function(id,f,v){setDebts(function(p){return p.map(function(d){return d.id===id?Object.assign({},d,{[f]:v}):d})})},[]);
  var aD=useCallback(function(){if(debts.length>=8)return;setDebts(function(p){return p.concat([{id:nDId.current++,name:"",balance:"",rate:"",minPayment:""}])})},[debts.length]);
  var rD=useCallback(function(id){setDebts(function(p){return p.filter(function(d){return d.id!==id})})},[]);

  function updatePortAlloc(idx,val){
    setPortAlloc(function(prev){
      var n=prev.slice();while(n.length<=idx)n.push(0);n[idx]=val;
      var total=n.reduce(function(s,v){return s+v},0);
      if(total>100){var diff=total-100;var others=n.map(function(v,i){return i!==idx?v:0});var otherTotal=others.reduce(function(s,v){return s+v},0);
        if(otherTotal>0)n=n.map(function(v,i){return i===idx?val:Math.max(0,Math.round(v-diff*v/otherTotal))});
        var nt=n.reduce(function(s,v){return s+v},0);if(nt>100)n[idx]-=(nt-100)}
      return n});
  }
  function updateContribAlloc(idx,val){
    setPortContribAlloc(function(prev){
      var n=prev.slice();while(n.length<=idx)n.push(0);n[idx]=val;
      var total=n.reduce(function(s,v){return s+v},0);
      if(total>100){var diff=total-100;var others=n.map(function(v,i){return i!==idx?v:0});var otherTotal=others.reduce(function(s,v){return s+v},0);
        if(otherTotal>0)n=n.map(function(v,i){return i===idx?val:Math.max(0,Math.round(v-diff*v/otherTotal))});
        var nt=n.reduce(function(s,v){return s+v},0);if(nt>100)n[idx]-=(nt-100)}
      return n});
  }

  function uG(id,f,v){setGoals(function(p){return p.map(function(g){return g.id===id?Object.assign({},g,{[f]:v}):g})})}
  function aG(){if(goals.length>=10)return;setGoals(function(p){return p.concat([{id:nGId.current++,name:"",amount:"",years:"",profileIdx:4}])})}
  function rG(id){setGoals(function(p){return p.filter(function(g){return g.id!==id})})}


  return(<>

    <div className="mn-root">
      {/* Demo mode banner */}
      {demoBannerVisible&&<div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"8px 16px",background:"linear-gradient(90deg,rgba(124,58,237,0.95),rgba(0,153,204,0.95))",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"Outfit,sans-serif",letterSpacing:1,textTransform:"uppercase",backdropFilter:"blur(8px)",boxShadow:"0 2px 20px rgba(0,0,0,0.2)"}}><span>{lang==="en"?"DEMO MODE — Full access":"MODO DEMO — Acceso completo"}</span><button onClick={function(){setDemoBannerVisible(false)}} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:11,fontWeight:600}}>×</button></div>}
      {/* Paid upgrade toast */}
      {paidToast&&<div style={{position:"fixed",top:12,left:"50%",transform:"translateX(-50%)",zIndex:9999,padding:"14px 28px",borderRadius:14,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"Outfit,sans-serif",boxShadow:"0 4px 24px rgba(34,197,94,0.3)",display:"flex",alignItems:"center",gap:10,animation:"fadeIn 0.3s ease-out"}}><Icon name="confetti" size={18} weight="regular" /> {lang==="en"?"You unlocked all 16 modules! Start from the Dashboard →":"¡Desbloqueaste los 16 módulos! Empezá desde el Dashboard →"}<button onClick={function(){setPaidToast(false)}} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:11,marginLeft:8}}>×</button></div>}
      <header className="mn-header">
        <div className="mn-logo" onClick={onBack} style={{cursor:onBack?"pointer":"default"}}>
          <span className="mn-logo-icon">MN</span>
          MaNu
          <span className="pro-badge">PRO</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {onBack&&<button onClick={onBack} style={{background:"rgba(15,23,42,0.04)",border:"1px solid rgba(15,23,42,0.10)",borderRadius:10,padding:"7px 14px",color:"#64748b",fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer",transition:"all 0.15s",letterSpacing:"-0.1px"}}>← {lang==="en"?"Home":"Inicio"}</button>}
          {hasData&&<button onClick={function(){if(window.confirm(lang==="en"?"Clear all your data? This cannot be undone.":"¿Borrar todos tus datos? No se puede deshacer."))clearAllData()}} style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:10,padding:"7px 14px",color:"#ef4444",fontSize:11,fontWeight:600,fontFamily:"Inter,sans-serif",cursor:"pointer",transition:"all 0.15s",display:"inline-flex",alignItems:"center",gap:4}}><Icon name="trash" size={13} weight="regular" /> {lang==="en"?"Reset":"Limpiar"}</button>}
          <button className="mn-lang-btn" onClick={function(){toggleLang();track(EVENTS.LANGUAGE_CHANGED,{from:lang,to:lang==="en"?"es":"en"},{lang:lang,tier:tier})}} style={{display:"inline-flex",alignItems:"center",gap:4}}><Icon name="globe" size={14} weight="regular" /> {lang==="en"?"EN":"ES"}</button>
        </div>
      </header>
      <nav className="mn-tabs">
        {TABS.filter(function(tb){return tier==="paid"||FREE_TABS.indexOf(tb.id)>=0}).map(function(tb){var a=tab===tb.id,d=tier==="paid"&&tb.id!=="assumptions"&&tb.id!=="achieve"&&tb.id!=="inaction"&&tb.id!=="learn"&&tb.id!=="dashboard"&&!hasData;return(
          <button key={tb.id} onClick={function(){if(!d)goTab(tb.id)}} className={"mn-tab"+(a?" active":"")+(d?" disabled":"")}>
            <span className="mn-tab-icon"><Icon name={tb.icon} size={16} weight={a?"regular":"light"} /></span>{t('tabs.'+tb.id)||tb.label}</button>)})}
      </nav>
      <div className="mn-tagline">{lang==="en"?"Magic Number \u00b7 Your Retirement Planner":"Magic Number \u00b7 Tu planificador de retiro"}</div>
      <main className="mn-content">

{/* === DASHBOARD === */}
{tab==="dashboard"&&<DashboardTab tab={tab} goTab={goTab} tier={tier} hasData={hasData} mSav={mSav} hScore={hScore} magic={magic} nSS={nSS} nEx={nEx} mD={mD} totalIncome={totalIncome} totalMonthlyObligations={totalMonthlyObligations} noDebts={noDebts} totalDebtAll={totalDebtAll} emergencyMonths={emergencyMonths} savOpps={savOpps} />}


{/* === LEARN === */}
{tab==="learn"&&<LearnTab tab={tab} goTab={goTab} tier={tier} />}

{/* === YOU === */}
{tab==="assumptions"&&<AssumptionsTab tab={tab} goTab={goTab} tier={tier} nAge={nAge} nRetAge={nRetAge} nYP={nYP} nEx={nEx} coupleMode={coupleMode} setCoupleMode={setCoupleMode} hasRental={hasRental} setHasRental={setHasRental} rentalEquity={rentalEquity} setRentalEquity={setRentalEquity} rentalNetIncome={rentalNetIncome} setRentalNetIncome={setRentalNetIncome} nRentalEq={nRentalEq} nRentalNet={nRentalNet} totalNetWorth={totalNetWorth} INFL={INFL} customInflation={customInflation} setCustomInflation={setCustomInflation} />}

{/* === INCOME === */}
{tab==="situation"&&<SituationTab tab={tab} goTab={goTab} tier={tier} lang={lang} coupleMode={coupleMode} hasRental={hasRental} monthlyIncome={monthlyIncome} setMonthlyIncome={setMonthlyIncome} partner2Income={partner2Income} setPartner2Income={setPartner2Income} vacationAnnual={vacationAnnual} setVacationAnnual={setVacationAnnual} nEx={nEx} nRentalEq={nRentalEq} totalNetWorth={totalNetWorth} ownsHome={ownsHome} setOwnsHome={setOwnsHome} mortgagePayment={mortgagePayment} setMortgagePayment={setMortgagePayment} nMortPay={nMortPay} expenses={expenses} aE={aE} uE={uE} rE={rE} nVac={nVac} mSav={mSav} totalIncome={totalIncome} totalMonthlyObligations={totalMonthlyObligations} totExp={totExp} nInc={nInc} nP2I={nP2I} nRentalNet={nRentalNet} nCarPay={nCarPay} debtEvents={debtEvents} />}

{/* === DEBTS === */}
{tab==="debts"&&<DebtsTab tab={tab} goTab={goTab} tier={tier} lang={lang} ownsHome={ownsHome} nMortPay={nMortPay} noMortgage={noMortgage} setNoMortgage={setNoMortgage} mortgageYearsLeft={mortgageYearsLeft} setMortgageYearsLeft={setMortgageYearsLeft} mortgageBalance={mortgageBalance} setMortgageBalance={setMortgageBalance} mortgageRate={mortgageRate} setMortgageRate={setMortgageRate} nMortYrs={nMortYrs} nAge={nAge} nEx={nEx} mortBal={mortBal} noDebts={noDebts} setNoDebts={setNoDebts} noCarLoan={noCarLoan} setNoCarLoan={setNoCarLoan} carBalance={carBalance} setCarBalance={setCarBalance} carYearsLeft={carYearsLeft} setCarYearsLeft={setCarYearsLeft} carRate={carRate} setCarRate={setCarRate} carPayment={carPayment} setCarPayment={setCarPayment} debts={debts} aD={aD} uD={uD} rD={rD} debtAn={debtAn} probDebts={probDebts} totalMonthlyObligations={totalMonthlyObligations} emergencyMonths={emergencyMonths} PROFILES={PROFILES} />}

{/* === RETIREMENT === */}
{tab==="retirement"&&<RetirementTab tab={tab} goTab={goTab} tier={tier} lang={lang} nAge={nAge} nRetAge={nRetAge} nYP={nYP} nEx={nEx} nDes={nDes} nSS={nSS} nLegacy={nLegacy} ytr={ytr} mSav={mSav} magic={magic} mD={mD} desiredAfterSS={desiredAfterSS} nMortPay={nMortPay} nMortYrs={nMortYrs} retProfLabel={retProfLabel} retProfReturn={retProfReturn} retProfileIdx={retProfileIdx} setRetProfileIdx={setRetProfileIdx} adjProfiles={adjProfiles} allProfiles={allProfiles} hasPortfolio={hasPortfolio} monthlyNeeded={monthlyNeeded} ybYData={ybYData} chartProfileIdx={chartProfileIdx} setChartProfileIdx={setChartProfileIdx} chartRetireIdx={chartRetireIdx} setChartRetireIdx={setChartRetireIdx} chartAccumReturn={chartAccumReturn} chartRetireReturn={chartRetireReturn} debtEvents={debtEvents} magicRevealed={magicRevealed} blendedPortReturn={blendedPortReturn} TAX={TAX} assetTax={assetTax} INFL={INFL} />}

{/* === INVESTMENT ALTERNATIVES === */}
{tab==="invest"&&<InvestTab tab={tab} goTab={goTab} tier={tier} lang={lang} mSav={mSav} nEx={nEx} projYears={projYears} setProjYears={setProjYears} projs={projs} maxProj={maxProj} showNom={showNom} setShowNom={setShowNom} customReturn={customReturn} setCustomReturn={setCustomReturn} customInflation={customInflation} INFL={INFL} showScenarios={showScenarios} setShowScenarios={setShowScenarios} scenProfileIdx={scenProfileIdx} setScenProfileIdx={setScenProfileIdx} scenarios={scenarios} allProfiles={allProfiles} adjProfiles={adjProfiles} hasPortfolio={hasPortfolio} blendedPortReturn={blendedPortReturn} costNS={costNS} costNSProfileIdx={costNSProfileIdx} setCostNSProfileIdx={setCostNSProfileIdx} costNSReturn={costNSReturn} magic={magic} debtEvents={debtEvents} />}

{/* === PORTFOLIO === */}
{tab==="portfolio"&&<PortfolioTab tab={tab} goTab={goTab} tier={tier} nEx={nEx} mSav={mSav} allProfiles={allProfiles} portAlloc={portAlloc} updatePortAlloc={updatePortAlloc} portContribAlloc={portContribAlloc} updateContribAlloc={updateContribAlloc} portReturn={portReturn} portContribReturn={portContribReturn} />}

{/* === YOUR MAGIC NUMBER === */}
{tab==="achieve"&&<AchieveTab tab={tab} goTab={goTab} tier={tier} engine={engine} isDemo={isDemo} />}
{tab==="inaction"&&<InactionTab tab={tab} goTab={goTab} tier={tier} engine={engine} />}
{tab==="save"&&<SaveTab tab={tab} goTab={goTab} tier={tier} savOpps={savOpps} setSavSliders={setSavSliders} totalSavOpp={totalSavOpp} mSav={mSav} />}

{/* === EARN MORE === */}
{tab==="earn"&&<EarnTab tab={tab} goTab={goTab} tier={tier} extraIncome={extraIncome} setExtraIncome={setExtraIncome} eiTemporary={eiTemporary} setEiTemporary={setEiTemporary} eiYears={eiYears} setEiYears={setEiYears} nEI={nEI} nEIYrs={nEIYrs} earnProj={earnProj} totalSavOpp={totalSavOpp} combinedImpact={combinedImpact} />}

{/* === COST IN RETIREMENT === */}
{tab==="cost"&&<CostTab tab={tab} goTab={goTab} tier={tier} lang={lang} costItemName={costItemName} setCostItemName={setCostItemName} costItemPrice={costItemPrice} setCostItemPrice={setCostItemPrice} costProfileIdx={costProfileIdx} setCostProfileIdx={setCostProfileIdx} adjProfiles={adjProfiles} allProfiles={allProfiles} costInRet={costInRet} ytr={ytr} hasPortfolio={hasPortfolio} blendedPortReturn={blendedPortReturn} />}

{/* === GOALS === */}
{tab==="goals"&&<GoalsTab tab={tab} goTab={goTab} tier={tier} goals={goals} uG={uG} rG={rG} aG={aG} goalCalcs={goalCalcs} allProfiles={allProfiles} mSav={mSav} goalRetImpact={goalRetImpact} totalGoalMo={totalGoalMo} goalImpactRate={goalImpactRate} />}

{/* === SCORE === */}
{tab==="score"&&<ScoreTab tab={tab} goTab={goTab} tier={tier} hScore={hScore} nAge={nAge} savRate={savRate} totalNetWorth={totalNetWorth} bSR={bSR} bNW={bNW} percentiles={percentiles} />}

{/* === REPORTS === */}
{tab==="reports"&&<ReportsTab tab={tab} goTab={goTab} tier={tier} hasData={hasData} mSav={mSav} savOpps={savOpps} totalSavOpp={totalSavOpp} nAge={nAge} totalIncome={totalIncome} totExp={totExp} nMortPay={nMortPay} nCarPay={nCarPay} savRate={savRate} nEx={nEx} nRentalEq={nRentalEq} nRentalNet={nRentalNet} totalNetWorth={totalNetWorth} totalDebtAll={totalDebtAll} noDebts={noDebts} hScore={hScore} magic={magic} mD={mD} nInc={nInc} nP2I={nP2I} coupleMode={coupleMode} nVac={nVac} nRetAge={nRetAge} nYP={nYP} customInflation={customInflation} INFL={INFL} />}



        <div style={{marginTop:36,padding:"14px 18px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)",fontSize:11,color:"#3b82f6",lineHeight:1.7,textAlign:"center"}}>
          <strong>{t('disclaimer.important')}</strong> {t('disclaimer.text')} {t('disclaimer.inflation')} {(INFL*100).toFixed(1)}%/{t('app.yr')}.
          <div style={{marginTop:8}}><a href="#" onClick={function(e){e.preventDefault()}} style={{color:"#60a5fa",fontWeight:600,textDecoration:"underline"}}>{t('disclaimer.advisor')}</a> {t('disclaimer.advisorSub')}</div>
        </div>
      </main>
    </div>
    <LeadCaptureModal
      show={showLeadModal}
      onClose={function(){setShowLeadModal(false)}}
      lang={lang}
      financials={{
        age: nAge || null,
        retirementAge: nRetAge || null,
        yearsInRetirement: nYP || null,
        monthlyIncome: totalIncome || null,
        monthlyExpenses: totExp || null,
        monthlySavings: mSav,
        savingsRate: savRate || null,
        currentSavings: nEx || null,
        totalDebt: noDebts ? 0 : (totalDebtAll || null),
        magicNumber: magic.real || null,
        mnProgressPct: mD.p || null,
        healthScore: hScore.s || null,
        desiredIncome: nDes || null,
        socialSecurity: nSS || null,
        legacyAmount: nLegacy || null,
        investmentProfile: retProfLabel || null,
        tier: tier,
        sourceTab: tab,
        lang: lang,
      }}
    />
  </>);
}
