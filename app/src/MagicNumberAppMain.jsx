import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { INFLATION_DEFAULT, RET_NOM, SCENARIO_SPREAD, PROFILES, DEFAULT_EXP, BENCH_SR, BENCH_NW, TABS } from './constants.js';
import { fmt, fmtC, pct } from './utils/formatters.js';
import { mR, fvC, fvL, pvA, gB, profByHorizon, clamp, yearByYear, fvVariable } from './utils/financial.js';
import Tip from './components/Tip.jsx';
import Cd from './components/Card.jsx';
import Toggle from './components/Toggle.jsx';
import TabBtn from './components/TabButton.jsx';
import { useTranslation } from './i18n/index.jsx';
import useAppStore from './store/useAppStore.js';
import Icon from './components/Icon.jsx';
import LeadCaptureModal from './components/LeadCaptureModal.jsx';
import AnimatedNumber from './components/AnimatedNumber.jsx';
import NumberInput from './components/NumberInput.jsx';
import SectionTitle from './components/SectionTitle.jsx';
import GaugeComponent from './components/Gauge.jsx';
import SliderComponent from './components/Slider.jsx';
import MiniChartComponent from './components/MiniChart.jsx';
import MultiLineChartComponent from './components/MultiLineChart.jsx';
import AdvisorCTAComponent from './components/AdvisorCTA.jsx';
import NavButtonsComponent from './components/NavButtons.jsx';
import { track, pageView, EVENTS } from './utils/analytics.js';
import AssumptionsTab from './tabs/AssumptionsTab.jsx';
import LearnTab from './tabs/LearnTab.jsx';
import DashboardTab from './tabs/DashboardTab.jsx';
import PortfolioTab from './tabs/PortfolioTab.jsx';
import ScoreTab from './tabs/ScoreTab.jsx';
import ReportsTab from './tabs/ReportsTab.jsx';
import GoalsTab from './tabs/GoalsTab.jsx';
import SaveTab from './tabs/SaveTab.jsx';
import EarnTab from './tabs/EarnTab.jsx';
import CostTab from './tabs/CostTab.jsx';
import SituationTab from './tabs/SituationTab.jsx';
import DebtsTab from './tabs/DebtsTab.jsx';
import RetirementTab from './tabs/RetirementTab.jsx';
import InvestTab from './tabs/InvestTab.jsx';
import AchieveTab from './tabs/AchieveTab.jsx';
import InactionTab from './tabs/InactionTab.jsx';

// Tip: imported from ./components/Tip.jsx

var ANum = AnimatedNumber;

var NI = NumberInput;

// Cd (Card): imported from ./components/Card.jsx

var ST = SectionTitle;

var Gauge = GaugeComponent;

var Slider = SliderComponent;

var MiniChart = MiniChartComponent;

var MultiLineChart = MultiLineChartComponent;

// Toggle: imported from ./components/Toggle.jsx
// TabBtn: imported from ./components/TabButton.jsx

var AdvisorCTA = AdvisorCTAComponent;
var NavButtons = NavButtonsComponent;

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

  const q="'";
  const INFL=customInflation/100;
  const nAge=Number(age)||0, nInc=Number(monthlyIncome)||0;
  const nP2I=coupleMode?(Number(partner2Income)||0):0;
  const nRentalEq=hasRental?(Number(rentalEquity)||0):0;
  const nRentalNet=hasRental?(Number(rentalNetIncome)||0):0;
  const totalIncome=nInc+nP2I+nRentalNet;
  const nVac=(Number(vacationAnnual)||0)/12;
  const totExp=expenses.reduce(function(s,e){return s+(Number(e.amount)||0)},0)+nVac;
  const nMortPay=(!ownsHome||noMortgage)?0:(Number(mortgagePayment)||0);
  const nCarPay=noCarLoan?0:(Number(carPayment)||0);
  const nMortYrs=(!ownsHome||noMortgage)?0:(Number(mortgageYearsLeft)||0);
  const nCarYrs=noCarLoan?0:(Number(carYearsLeft)||0);
  const totalMonthlyObligations=totExp+nMortPay+nCarPay;
  const incomeFilledExp=expenses.filter(function(e){return e.amount!==""}).length;
  const hasIncomeData=monthlyIncome!==""&&totalIncome>0&&incomeFilledExp>=5;
  const mSavComputed=totalIncome-totalMonthlyObligations;
  const mSav=hasIncomeData?mSavComputed:(Number(manualMonthlySav)||0);
  const savRate=totalIncome>0?(mSavComputed/totalIncome)*100:0;
  const nRetAge=Number(retirementAge)||65, nYP=Number(yearsPostRet)||25;
  const nDes=Number(desiredIncome)||0, nEx=Number(existingSavings)||0;
  const totalNetWorth=nEx+nRentalEq;
  const nSSRaw=Number(socialSecurity)||0;
  const nLegacy=Number(legacy)||0;
  const ytr=Math.max(nRetAge-nAge,0);
  const nSS=nSSRaw; // SS/retirement income now entered in today's dollars — no deflation needed
  const totDebt=debts.reduce(function(s,d){return s+(Number(d.balance)||0)},0);
  const mortBal=(!ownsHome||noMortgage)?0:(Number(mortgageBalance)||0);
  const carBal=noCarLoan?0:(Number(carBalance)||0);
  const totalDebtAll=totDebt+mortBal+carBal;
  const nEI=Number(extraIncome)||0;
  const nEIYrs=Number(eiYears)||5;
  const effectiveMSav=mSav+nEI;
  
  // Debt analysis — moved up to prevent ordering issues
  var allDebts=useMemo(function(){
    var list=[];
    if(!noMortgage&&mortBal>0&&(Number(mortgageRate)||0)>0)
      list.push({id:"mortgage",name:t('common.mortgage'),balance:String(mortBal),rate:mortgageRate,minPayment:mortgagePayment});
    if(!noCarLoan&&carBal>0&&(Number(carRate)||0)>0)
      list.push({id:"carloan",name:t('common.carLoan'),balance:String(carBal),rate:carRate,minPayment:carPayment});
    debts.forEach(function(d){if((Number(d.balance)||0)>0&&(Number(d.rate)||0)>0)list.push(d);});
    return list;
  },[noMortgage,mortBal,mortgageRate,mortgagePayment,noCarLoan,carBal,carRate,carPayment,debts,lang]);

  var debtEvents=useMemo(function(){
    var list=[];
    if(!noMortgage&&nMortPay>0&&nMortYrs>0)list.push({name:t('common.mortgage'),endsAtYear:nMortYrs,monthlyAmount:nMortPay});
    if(!noCarLoan&&nCarPay>0&&nCarYrs>0)list.push({name:t('common.carLoan'),endsAtYear:nCarYrs,monthlyAmount:nCarPay});
    return list;
  },[noMortgage,nMortPay,nMortYrs,noCarLoan,nCarPay,nCarYrs,lang]);

  // ADJUSTED PROFILES: recalculate real returns based on custom inflation + translate names
  var TAX=assetTax/100;
  var PROF_KEY_MAP={vault:"vault",cash:"cash",cds:"cds",treasuries:"treasuries","6040":"6040","8020":"8020",equities:"equities",custom:"custom"};
  var adjProfiles=useMemo(function(){return PROFILES.map(function(p){
    var k=PROF_KEY_MAP[p.id]||p.id;
    return Object.assign({},p,{
      realReturn:p.nomReturn-INFL-TAX,
      nomReturn:p.nomReturn-TAX,
      name:t('profiles.'+k+'.name')||p.name,
      desc:t('profiles.'+k+'.desc')||p.desc
    });
  })},[INFL,TAX,lang]);
  function adjProfByHorizon(y){if(y<1)return adjProfiles[0];if(y<2)return adjProfiles[1];if(y<3)return adjProfiles[3];if(y<5)return adjProfiles[4];if(y<10)return adjProfiles[5];return adjProfiles[6]}

  // allProfiles: adjProfiles + custom if defined
  var custR=Number(customReturn)||0;
  var allProfiles=useMemo(function(){
    var p=adjProfiles.slice();
    if(custR>0)p.push({id:"custom",name:t('profiles.custom.name')||"Custom",nomReturn:custR/100-TAX,realReturn:custR/100-INFL-TAX,desc:t('profiles.custom.desc')||"Your custom return rate.",icon:"gear",color:"#e879f9",risk:7,vol:0});
    return p;
  },[adjProfiles,custR,INFL,TAX,lang]);



  // Portfolio allocation — works with allProfiles (base 7 + optional custom)
  const portReturn=useMemo(function(){
    const totalAlloc=portAlloc.reduce(function(s,v){return s+v},0);
    if(totalAlloc===0)return{real:0,nom:0};
    let wReal=0,wNom=0;
    (allProfiles||[]).forEach(function(p,i){const a=portAlloc[i]||0;wReal+=a/100*p.realReturn;wNom+=a/100*p.nomReturn});
    return{real:wReal,nom:wNom};
  },[portAlloc,allProfiles]);

  const portContribReturn=useMemo(function(){
    const totalAlloc=portContribAlloc.reduce(function(s,v){return s+v},0);
    if(totalAlloc===0)return{real:0,nom:0};
    let wReal=0,wNom=0;
    (allProfiles||[]).forEach(function(p,i){const a=portContribAlloc[i]||0;wReal+=a/100*p.realReturn;wNom+=a/100*p.nomReturn});
    return{real:wReal,nom:wNom};
  },[portContribAlloc,allProfiles]);

  // Blended portfolio return: weighted average of existing savings return & contribution return
  const portAllocTotal=portAlloc.reduce(function(s,v){return s+v},0);
  const portContribAllocTotal=portContribAlloc.reduce(function(s,v){return s+v},0);
  const hasPortfolio=portAllocTotal===100&&portContribAllocTotal===100;
  const blendedPortReturn=useMemo(function(){
    if(!hasPortfolio)return null;
    const totalContrib=Math.max(mSav,0)*12*Math.max(ytr,10);
    const w1=nEx;const w2=totalContrib;const tot=w1+w2;
    if(tot===0)return portReturn.real;
    return(w1*portReturn.real+w2*portContribReturn.real)/tot;
  },[hasPortfolio,nEx,mSav,ytr,portReturn.real,portContribReturn.real]);

  // MAGIC NUMBER — explicit profile for retirement withdrawal phase (-1 = My Portfolio)
  var desiredAfterSS=Math.max(nDes-nSS,0);
  var retProfReturn=useMemo(function(){
    if(retProfileIdx===-1&&blendedPortReturn!=null)return blendedPortReturn;
    var p=allProfiles[Math.max(retProfileIdx,0)];
    return p?p.realReturn:adjProfiles[4].realReturn;
  },[allProfiles,adjProfiles,retProfileIdx,blendedPortReturn]);
  var retProfLabel=(function(){
    if(retProfileIdx===-1&&hasPortfolio)return t('profiles.myPortfolio.name');
    var p=allProfiles[Math.max(retProfileIdx,0)];
    return p?p.name:adjProfiles[4].name;
  })();
  // Year-by-Year chart — separate accumulation and retirement profiles
  var chartAccumReturn=useMemo(function(){
    if(chartProfileIdx===-1&&blendedPortReturn!=null)return blendedPortReturn;
    var idx=Math.max(chartProfileIdx,0);
    return(idx<adjProfiles.length?adjProfiles[idx]:allProfiles[idx]).realReturn;
  },[adjProfiles,allProfiles,chartProfileIdx,blendedPortReturn]);
  var chartRetireReturn=useMemo(function(){
    if(chartRetireIdx===-1&&blendedPortReturn!=null)return blendedPortReturn;
    return adjProfiles[Math.max(chartRetireIdx,0)].realReturn;
  },[adjProfiles,chartRetireIdx,blendedPortReturn]);
  var chartAccumLabel=chartProfileIdx===-1&&hasPortfolio?t('profiles.myPortfolio.name'):(chartProfileIdx>=0?(chartProfileIdx<adjProfiles.length?adjProfiles[chartProfileIdx]:allProfiles[chartProfileIdx]):adjProfiles[0]).name;
  var chartRetireLabel=chartRetireIdx===-1&&hasPortfolio?t('profiles.myPortfolio.name'):adjProfiles[Math.max(chartRetireIdx,0)].name;
  var magic=useMemo(function(){if(desiredAfterSS<=0||nYP<=0)return{real:0,withoutSS:0,conservative:0};
    var legacyPV=nLegacy>0?nLegacy/Math.pow(1+retProfReturn,nYP):0;
    var withSS=pvA(desiredAfterSS,retProfReturn,nYP)+legacyPV;
    var withoutSS=pvA(nDes,retProfReturn,nYP)+legacyPV;
    var conservativeRate=adjProfiles[1].realReturn;
    var legacyPVc=nLegacy>0?nLegacy/Math.pow(1+conservativeRate,nYP):0;
    var conservative=pvA(desiredAfterSS,conservativeRate,nYP)+legacyPVc;
    return{real:withSS,withoutSS:withoutSS,conservative:conservative,conservativeRate:conservativeRate,legacyPV:legacyPV}
  },[desiredAfterSS,nDes,nYP,retProfReturn,adjProfiles,nLegacy]);

  var mD=useMemo(function(){
    var p=magic.real>0?(nEx/magic.real)*100:0;
    return{p:p,gap:Math.max(magic.real-nEx,0),sur:Math.max(nEx-magic.real,0),gc:p>=100?"#22c55e":p>=60?"#eab308":"#ef4444",bc:p>=100?"linear-gradient(90deg,#22c55e,#4ade80)":p>=60?"linear-gradient(90deg,#eab308,#facc15)":"linear-gradient(90deg,#ef4444,#f87171)"};
  },[magic.real,nEx]);

  // Monthly needed per profile — variable projection accounts for debt payoffs
  const monthlyNeeded=useMemo(function(){if(magic.real<=0||ytr<=0)return [];
    const list=(adjProfiles||[]).map(function(pr){
      const projectedAtRetire=fvVariable(nEx,mSav,pr.realReturn,ytr,debtEvents);
      const gap=Math.max(magic.real-projectedAtRetire,0);
      if(gap<=0)return Object.assign({},pr,{monthly:0,surplus:projectedAtRetire-magic.real,projected:projectedAtRetire});
      const m=mR(pr.realReturn),n=ytr*12;
      const mo=pr.realReturn===0||m===0?gap/n:gap/((Math.pow(1+m,n)-1)/m);
      return Object.assign({},pr,{monthly:mo,surplus:0,projected:projectedAtRetire});
    });
    if(hasPortfolio&&blendedPortReturn!=null){
      const r=blendedPortReturn,proj=fvVariable(nEx,mSav,r,ytr,debtEvents);
      const gap=Math.max(magic.real-proj,0);let mo=0;
      if(gap>0){const m=mR(r),n=ytr*12;mo=r===0||m===0?gap/n:gap/((Math.pow(1+m,n)-1)/m)}
      list.unshift({id:"myportfolio",name:t('profiles.myPortfolio.name'),icon:"sliders-h",realReturn:r,nomReturn:r+INFL,color:"#e879f9",monthly:mo,surplus:gap<=0?proj-magic.real:0,projected:proj});
    }
    return list;
  },[magic.real,nEx,mSav,ytr,adjProfiles,debtEvents,hasPortfolio,blendedPortReturn,INFL]);

  // Year-by-year projection — variable cash flow with debt payoff events
  var ybYData=useMemo(function(){if(ytr<=0||nDes<=0)return[];
    return yearByYear(nEx,mSav,chartAccumReturn,ytr,nYP,desiredAfterSS,INFL,debtEvents,chartRetireReturn);
  },[nEx,mSav,chartAccumReturn,chartRetireReturn,ytr,nYP,desiredAfterSS,INFL,debtEvents]);

  // Investment projections (variable years)
  const projs=useMemo(function(){
    return (allProfiles||[]).map(function(pr){
      const rFV=fvVariable(nEx,mSav,pr.realReturn,projYears,debtEvents);
      const nFV=fvVariable(nEx,mSav,pr.nomReturn,projYears,debtEvents);
      let tc=nEx;for(let y=0;y<projYears;y++){let extra=0;(debtEvents||[]).forEach(function(ev){if(y>=ev.endsAtYear)extra+=ev.monthlyAmount});tc+=(mSav+extra)*12}
      return Object.assign({},pr,{nFV:nFV,rFV:rFV,tc:tc});
    });
  },[mSav,nEx,projYears,allProfiles,debtEvents]);

  var maxProj=useMemo(function(){return Math.max.apply(null,projs.map(function(p){return showNom?p.nFV:p.rFV}).concat([1]))},[projs,showNom]);

  // Scenarios (pessimistic / base / optimistic)
  const scenarios=useMemo(function(){if(!showScenarios)return null;
    const baseR=scenProfileIdx===-1&&blendedPortReturn!=null?blendedPortReturn:(allProfiles[Math.min(scenProfileIdx,allProfiles.length-1)]||allProfiles[5]).realReturn;
    const sc=[t('scenarios.pessimistic'),t('scenarios.base'),t('scenarios.optimistic')];const spreads=[-SCENARIO_SPREAD,0,SCENARIO_SPREAD];
    const colors=["#ef4444","#60a5fa","#22c55e"];
    return (sc||[]).map(function(name,si){
      const r=baseR+spreads[si];
      const step=projYears>30?10:projYears>15?5:projYears>8?2:1;
      const data=[];for(let y=0;y<=projYears;y++){
        const v=fvVariable(nEx,mSav,r,y,debtEvents);
        const showLabel=y===0||y===projYears||(y%step===0);
        data.push({l:showLabel?t('app.yr')+" "+y:"",v:v});
      }
      return{name:name,data:data,color:colors[si],bold:si===1,dash:si!==1?"6,4":"none",fill:si===1};
    });
  },[showScenarios,mSav,nEx,projYears,allProfiles,debtEvents,scenProfileIdx,blendedPortReturn]);

  // Cost of not investing — fixed 20yr horizon
  var costNSYears=20;
  var costNSReturn=costNSProfileIdx===-1&&blendedPortReturn!=null?blendedPortReturn:(allProfiles[costNSProfileIdx]||adjProfiles[4]).realReturn;
  var costNS=useMemo(function(){
    if(mSav<=0&&nEx<=0)return null;
    var data=[];
    for(var wait=0;wait<=10;wait++){
      var yrsLeft=costNSYears-wait;if(yrsLeft<=0)break;
      var total=fvVariable(nEx,mSav,costNSReturn,yrsLeft,debtEvents);
      data.push({wait:wait,total:total,lost:wait>0?fvVariable(nEx,mSav,costNSReturn,costNSYears,debtEvents)-total:0});
    }
    return data;
  },[mSav,nEx,debtEvents,costNSReturn]);


  var debtAn=useMemo(function(){return allDebts.map(function(d){
    var r=Number(d.rate);var pb=PROFILES.filter(function(p){return r/100>p.nomReturn});
    var sev=pb.length===PROFILES.length?"critical":pb.length>=5?"high":pb.length>=3?"moderate":"low";
    return Object.assign({},d,{rate:r,pb:pb,sev:sev,bal:Number(d.balance),minPay:Number(d.minPayment)||0});
  }).sort(function(a,b){return b.rate-a.rate})},[allDebts]);
  var probDebts=debtAn.filter(function(d){return d.sev!=="low"});

  // Emergency fund
  var emergencyMonths=useMemo(function(){return totalMonthlyObligations>0?nEx/totalMonthlyObligations:0},[nEx,totalMonthlyObligations]);

  // Save opportunities with sliders
  var savOpps=useMemo(function(){return expenses.filter(function(e){return(Number(e.amount)||0)>0&&e.name.trim()&&e.discretionary!==false}).map(function(e){
    var a=Number(e.amount),cut=savSliders[e.id]!==undefined?savSliders[e.id]:50;
    var saved=a*(cut/100);
    return Object.assign({},e,{cur:a,cutPct:cut,saved:saved,
      imp10:fvC(saved,0.04,10),imp20:fvC(saved,0.04,20),imp30:fvC(saved,0.04,30)});
  }).sort(function(a,b){return b.imp10-a.imp10})},[expenses,savSliders]);

  var totalSavOpp=useMemo(function(){
    var mo=savOpps.reduce(function(s,o){return s+o.saved},0);
    return{mo:mo,imp10:fvC(mo,0.04,10),imp20:fvC(mo,0.04,20),imp30:fvC(mo,0.04,30)};
  },[savOpps]);

  // Earn more projections
  var earnProj=useMemo(function(){if(nEI<=0)return null;
    var yrs=eiTemporary?nEIYrs:50;
    function earnFV(totalYears){
      if(!eiTemporary)return fvC(nEI,0.04,totalYears);
      // Contribute for yrs, then lump sum grows for remaining
      var atEnd=fvC(nEI,0.04,Math.min(totalYears,yrs));
      if(totalYears>yrs)atEnd=fvL(atEnd,0.04,totalYears-yrs);
      return atEnd;
    }
    return{imp10:earnFV(10),imp20:earnFV(20),imp30:earnFV(30),
      data:Array.from({length:31},function(_,y){return{l:t('app.yr')+" "+y,v:earnFV(y)}})};
  },[nEI,eiTemporary,nEIYrs]);

  // Combined save+earn impact
  var combinedImpact=useMemo(function(){
    var mo=totalSavOpp.mo+nEI;
    return{mo:mo,imp10:fvC(mo,0.04,10),imp20:fvC(mo,0.04,20),imp30:fvC(mo,0.04,30)};
  },[totalSavOpp.mo,nEI]);

  // Cost in retirement
  var costInRet=useMemo(function(){
    var price=Number(costItemPrice)||0;if(price<=0||ytr<=0)return null;
    var prof=adjProfiles[costProfileIdx];
    var fv=fvL(price,prof.realReturn,ytr);
    var multiplier=fv/price;
    return{fv:fv,multiplier:multiplier,prof:prof,itemsCouldBuy:Math.floor(multiplier)};
  },[costItemPrice,ytr,costProfileIdx,adjProfiles]);

  // Goals — simplified: each goal needs monthly savings, impacts retirement
  var goalCalcs=useMemo(function(){return goals.map(function(g){
    var amt=Number(g.amount)||0,yrs=Number(g.years)||0;
    if(amt<=0||yrs<=0)return Object.assign({},g,{mo:0,prof:adjProfiles[0],valid:false});
    var prof=g.profileIdx>=0?(allProfiles[g.profileIdx]||adjProfByHorizon(yrs)):adjProfByHorizon(yrs);
    var r=prof.realReturn,m=mR(r),n=yrs*12;
    var mo=r===0||m===0?amt/n:amt/((Math.pow(1+m,n)-1)/m);
    return Object.assign({},g,{mo:mo,prof:prof,valid:true,nAmt:amt,nYrs:yrs});
  })},[goals,adjProfiles,allProfiles]);

  var totalGoalMo=goalCalcs.reduce(function(s,g){return s+(g.valid?g.mo:0)},0);
  var goalImpactRate=adjProfiles[4].realReturn; // 60/40 for fair comparison
  const goalRetImpact=useMemo(function(){if(totalGoalMo<=0||magic.real<=0||ytr<=0)return null;
    const full=fvVariable(nEx,mSav,goalImpactRate,ytr,debtEvents);
    let bal=nEx;
    for(let y=0;y<ytr;y++){
      let goalDrain=0;
      (goalCalcs||[]).forEach(function(g){if(g.valid&&y<g.nYrs)goalDrain+=g.mo});
      let extraSav=0;
      (debtEvents||[]).forEach(function(ev){if(y>=ev.endsAtYear)extraSav+=ev.monthlyAmount});
      bal=bal*(1+goalImpactRate)+(mSav-goalDrain+extraSav)*12;
      if(bal<0)bal=0;
    }
    return{reduced:bal,full:full,diff:full-bal,pctOfMagic:magic.real>0?((full-bal)/magic.real*100):0};
  },[goalCalcs,totalGoalMo,mSav,goalImpactRate,ytr,nEx,magic.real,debtEvents]);

  // Achieving It — simulator
  var simEffSav=simSav!=null?simSav:nEx;
  var simEffMo=simMo!=null?simMo:Math.max(mSav,0);
  var simEffRet=simRet!=null?simRet/100:0.01;
  var simProjected=useMemo(function(){
    if(ytr<=0)return nEx;
    return fvVariable(simEffSav,simEffMo,simEffRet,ytr,debtEvents);
  },[simEffSav,simEffMo,simEffRet,ytr,debtEvents]);
  var simGap=magic.real>0?magic.real-simProjected:0;
  var simPct=magic.real>0?simProjected/magic.real*100:0;
  // Solve: what return is needed to hit magic with current savings+monthly
  var simNeededReturn=useMemo(function(){
    if(magic.real<=0||ytr<=0)return null;
    var lo=-0.03,hi=0.20;
    for(var i=0;i<40;i++){var mid=(lo+hi)/2;var v=fvVariable(simEffSav,simEffMo,mid,ytr,debtEvents);if(v<magic.real)lo=mid;else hi=mid}
    var r=(lo+hi)/2;return r>0.15?null:r; // cap at 15%, beyond = unrealistic
  },[magic.real,simEffSav,simEffMo,ytr,debtEvents]);
  // Solve: what monthly savings needed at current return
  var simNeededMonthly=useMemo(function(){
    if(magic.real<=0||ytr<=0)return null;
    var lo=0,hi=50000;
    for(var i=0;i<40;i++){var mid=(lo+hi)/2;var v=fvVariable(simEffSav,mid,simEffRet,ytr,debtEvents);if(v<magic.real)lo=mid;else hi=mid}
    return(lo+hi)/2;
  },[magic.real,simEffSav,simEffRet,ytr,debtEvents]);

  // Reverse calculator: "When can I retire?"
  var revResult=useMemo(function(){
    var rDes=revDes!==""?Number(revDes)||0:nDes;
    var rYrs=revYrs!==""?Number(revYrs)||0:nYP;
    var rSS=revSS!==""?Number(revSS)||0:nSSRaw;
    var rSav=revSav!==""?Number(revSav)||0:nEx;
    var rMo=revMo!==""?Number(revMo)||0:Math.max(mSav,0);
    if(rDes<=0||rYrs<=0||nAge<=0)return null;
    var accumR=revRet/100;
    var retR=adjProfiles[Math.min(revRetProf,adjProfiles.length-1)].realReturn;
    // Convert SS from future $ to today's $ (will vary by candidate age)
    for(var candidateAge=nAge+1;candidateAge<=100;candidateAge++){
      var yrsToRetire=candidateAge-nAge;
      var projected=fvVariable(rSav,rMo,accumR,yrsToRetire,[]);
      var ssToday=rSS; // SS now in today's dollars — use directly
      var afterSS=Math.max(rDes-ssToday,0);
      if(afterSS<=0)return{age:candidateAge,projected:projected,mn:0,surplus:projected,yrsToRetire:yrsToRetire,ssToday:ssToday,afterSS:0,retR:retR};
      var legPV=nLegacy>0?nLegacy/Math.pow(1+retR,rYrs):0;
      var mn=pvA(afterSS,retR,rYrs)+legPV;
      if(projected>=mn)return{age:candidateAge,projected:projected,mn:mn,surplus:projected-mn,yrsToRetire:yrsToRetire,ssToday:ssToday,afterSS:afterSS,retR:retR};
    }
    return{age:null,message:t('achieve.revError')};
  },[revDes,revYrs,revSS,revSav,revMo,revRet,revRetProf,nAge,adjProfiles,INFL,nDes,nYP,nSSRaw,nEx,mSav,nLegacy,lang]);

  // Health Score (enhanced)
  var hScore=useMemo(function(){
    var s=0,bd=[],recs=[];
    var sr=savRate>=25?30:savRate>=20?25:savRate>=15?20:savRate>=10?15:savRate>=5?10:savRate>0?5:0;
    s+=sr;bd.push({l:t('score.savingsRate'),s:sr,m:30,st:sr>=20?"good":sr>=10?"ok":"bad"});
    if(sr<20)recs.push({cat:t('score.savingsRate'),priority:sr<10?1:2,text:sr<10?t('score.aimToSave'):t('score.greatProgress')});
    var ds=25;
    if(!noDebts&&probDebts.length>0){var tval=probDebts.reduce(function(s,d){return s+d.bal},0);ds=tval>totalIncome*12?5:tval>totalIncome*6?10:tval>totalIncome*3?15:20;
      recs.push({cat:t('score.debtHealth'),priority:ds<15?1:2,text:ds<15?t('score.highInterestDebt'):t('score.goodProgressDebt')})}
    else if(!noDebts&&totalDebtAll>0)ds=22;
    s+=ds;bd.push({l:t('score.debtHealth'),s:ds,m:25,st:ds>=20?"good":ds>=15?"ok":"bad"});
    var rs=0;
    if(magic.real>0&&ytr>0){var proj=fvVariable(nEx,mSav,0.04,ytr,debtEvents);var otp=proj/magic.real;
      rs=otp>=1?25:otp>=0.8?22:otp>=0.6?18:otp>=0.4?14:otp>=0.2?10:5;
      if(otp<0.8)recs.push({cat:t('score.retirementProgress'),priority:otp<0.4?1:2,text:otp<0.4?t('score.significantlyBehind'):t('score.makingProgressInvest')})}
    else if(nEx>0)rs=10;
    s+=rs;
    var rOT=magic.real>0&&ytr>0?((fvVariable(nEx,mSav,0.04,ytr,debtEvents))/magic.real*100).toFixed(0):null;
    bd.push({l:t('score.retirementProgress'),s:rs,m:25,st:rs>=20?"good":rs>=14?"ok":"bad",det:rOT?t('score.onTrackDet', {rate: rOT, yrs: ytr}):null});
    var ps=nEx>0&&mSav>0?20:nEx>0||mSav>0?12:3;
    s+=ps;bd.push({l:t('score.savingsHabit'),s:ps,m:20,st:ps>=15?"good":ps>=8?"ok":"bad",det:ps>=15?t('score.savingMonthly'):t('score.savingTip')});
    if(ps<15)recs.push({cat:t('score.savingsHabit'),priority:3,text:t('score.buildConsistency')});
    if(emergencyMonths<6&&totalMonthlyObligations>0)recs.push({cat:t('dashboard.emergencyFund'),priority:emergencyMonths<3?1:2,text:emergencyMonths<3?t('score.emergencyCrit'):t('score.emergencyOk', {months: emergencyMonths.toFixed(0)})});
    recs.sort(function(a,b){return a.priority-b.priority});
    return{s:s,bd:bd,recs:recs};
  },[savRate,noDebts,probDebts,totalDebtAll,totalIncome,magic.real,nEx,mSav,ytr,emergencyMonths,totExp,debtEvents]);

  var bSR=useMemo(function(){return gB(BENCH_SR,nAge)},[nAge]);
  var bNW=useMemo(function(){return gB(BENCH_NW,nAge)},[nAge]);

  var ID_MAP = {"Under 25": "under25", "25-34": "25_34", "35-44": "35_44", "45-54": "45_54", "55-64": "55_64", "65+": "65Plus"};

  // Percentile estimation
  var percentiles=useMemo(function(){if(nAge<=0)return{sr:null,nw:null};
    var srP=savRate<=bSR.p25?Math.round(savRate/bSR.p25*25):savRate<=bSR.med?25+Math.round((savRate-bSR.p25)/(bSR.med-bSR.p25)*25):savRate<=bSR.p75?50+Math.round((savRate-bSR.med)/(bSR.p75-bSR.med)*25):75+Math.round(Math.min((savRate-bSR.p75)/bSR.p75*25,24));
    var nwP=nEx<=bNW.p25?Math.round(nEx/bNW.p25*25):nEx<=bNW.med?25+Math.round((nEx-bNW.p25)/(bNW.med-bNW.p25)*25):nEx<=bNW.p75?50+Math.round((nEx-bNW.med)/(bNW.p75-bNW.med)*25):75+Math.round(Math.min((nEx-bNW.p75)/bNW.p75*25,24));
    return{sr:clamp(srP,1,99),nw:clamp(nwP,1,99)};
  },[nAge,savRate,nEx,bSR,bNW]);

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
{tab==="achieve"&&<AchieveTab tab={tab} goTab={goTab} tier={tier} lang={lang} nAge={nAge} nRetAge={nRetAge} nYP={nYP} nEx={nEx} nDes={nDes} nSS={nSS} nLegacy={nLegacy} ytr={ytr} mSav={mSav} magic={magic} mD={mD} desiredAfterSS={desiredAfterSS} age={age} setAge={setAge} retireAge={retireAge} setRetireAge={setRetireAge} yearsInRetirement={yearsInRetirement} setYearsInRetirement={setYearsInRetirement} existingSavings={existingSavings} setExistingSavings={setExistingSavings} desiredRetIncome={desiredRetIncome} setDesiredRetIncome={setDesiredRetIncome} socialSecurity={socialSecurity} setSocialSecurity={setSocialSecurity} legacyAmount={legacyAmount} setLegacyAmount={setLegacyAmount} retProfileIdx={retProfileIdx} setRetProfileIdx={setRetProfileIdx} adjProfiles={adjProfiles} allProfiles={allProfiles} hasPortfolio={hasPortfolio} retProfLabel={retProfLabel} retProfReturn={retProfReturn} magicRevealed={magicRevealed} blendedPortReturn={blendedPortReturn} q={q} paidHint={paidHint} monthlyNeeded={monthlyNeeded} ybYData={ybYData} chartProfileIdx={chartProfileIdx} setChartProfileIdx={setChartProfileIdx} chartRetireIdx={chartRetireIdx} setChartRetireIdx={setChartRetireIdx} chartAccumReturn={chartAccumReturn} chartRetireReturn={chartRetireReturn} debtEvents={debtEvents} TAX={TAX} assetTax={assetTax} INFL={INFL} showNom={showNom} setShowNom={setShowNom} projYears={projYears} setProjYears={setProjYears} projs={projs} maxProj={maxProj} customReturn={customReturn} setCustomReturn={setCustomReturn} />}

{/* === COST OF INACTION === */}
{tab==="inaction"&&<InactionTab tab={tab} goTab={goTab} tier={tier} lang={lang} nAge={nAge} nRetAge={nRetAge} nYP={nYP} nEx={nEx} nDes={nDes} nSS={nSS} ytr={ytr} mSav={mSav} magic={magic} mD={mD} desiredAfterSS={desiredAfterSS} adjProfiles={adjProfiles} allProfiles={allProfiles} hasPortfolio={hasPortfolio} blendedPortReturn={blendedPortReturn} retProfLabel={retProfLabel} retProfReturn={retProfReturn} debtEvents={debtEvents} INFL={INFL} setShowLeadModal={setShowLeadModal} />}

{/* === SAVE MORE === */}
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



        <div style={{marginTop:36,padding:"14px 18px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)",fontSize:11,color:"#93c5fd",lineHeight:1.7,textAlign:"center"}}>
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
