import { useState, useEffect, useRef, useCallback } from "react";
import { PROFILES, TABS } from './constants.js';
import { useTranslation } from './i18n/index.jsx';
import useAppStore from './store/useAppStore.js';
import Icon from './components/Icon.jsx';
import LeadCaptureModal from './components/LeadCaptureModal.jsx';
import { track, EVENTS } from './utils/analytics.js';
import useFinancialEngine from './hooks/useFinancialEngine.js';
import { EngineProvider } from './hooks/EngineContext.jsx';
import AssumptionsTab from './tabs/AssumptionsTab.jsx';
import LearnTab from './tabs/LearnTab.jsx';
import DashboardTab from './tabs/DashboardTab.jsx';
import PortfolioTab from './tabs/PortfolioTab.jsx';
import ScoreTab from './tabs/ScoreTab.jsx';
import ReportsTab from './tabs/ReportsTab.jsx';
import AchieveTab from './tabs/AchieveTab.jsx';
import InactionTab from './tabs/InactionTab.jsx';
import GoalsTab from './tabs/GoalsTab.jsx';
import SaveTab from './tabs/SaveTab.jsx';
import EarnTab from './tabs/EarnTab.jsx';
import CostTab from './tabs/CostTab.jsx';
import SituationTab from './tabs/SituationTab.jsx';
import DebtsTab from './tabs/DebtsTab.jsx';
import RetirementTab from './tabs/RetirementTab.jsx';
import InvestTab from './tabs/InvestTab.jsx';

export default function MagicNumberApp({onBack}){
  var {t, lang, toggleLang} = useTranslation();
  var isDemo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';

  // ── Zustand Store ──────────────────────────────────────────────────
  var store = useAppStore();
  var sf = store.setField;

  // ── Derived state ──────────────────────────────────────────────────
  var tab = store.tab;
  var tier = isDemo ? "paid" : store.tier;
  var FREE_TABS = ["achieve", "inaction", "learn"];
  var [paidToast, setPaidToast] = useState(false);
  var prevTierRef = useRef(tier);

  // ── Engine (computed ONCE, provided via context) ───────────────────
  var engine = useFinancialEngine(store, t, lang);
  var { nAge, nRetAge, nEx, mSav, hasIncomeData, magicRevealed } = engine;
  var hasData = nAge > 0 && (hasIncomeData || (store.manualMonthlySav !== "" && nEx > 0));

  // ── Navigation ─────────────────────────────────────────────────────
  var goTab = useCallback(function(t){
    sf('tab', t);
    track(EVENTS.TAB_VIEWED, {tab:t}, {lang:lang, tier:tier});
    if(t === "retirement" && !store.magicRevealed) setTimeout(function(){ sf('magicRevealed', true); }, 400);
    window.scrollTo({top:0, behavior:"smooth"});
  }, [store.magicRevealed, lang, tier]);

  // ── Effects ────────────────────────────────────────────────────────
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
    if(meta) meta.setAttribute('content', t('dashboard.welcomeSub') || "");
  }, [lang]);

  // ── Portfolio allocation helpers (stay in Main — used by PortfolioTab) ──
  function updatePortAlloc(idx,val){
    sf('portAlloc', function(prev){
      var n = prev.slice(); while(n.length <= idx) n.push(0); n[idx] = val;
      var total = n.reduce(function(s,v){return s+v},0);
      if(total>100){var diff=total-100;var others=n.map(function(v,i){return i!==idx?v:0});var otherTotal=others.reduce(function(s,v){return s+v},0);
        if(otherTotal>0)n=n.map(function(v,i){return i===idx?val:Math.max(0,Math.round(v-diff*v/otherTotal))});
        var nt=n.reduce(function(s,v){return s+v},0);if(nt>100)n[idx]-=(nt-100)}
      return n;
    });
  }
  function updateContribAlloc(idx,val){
    sf('portContribAlloc', function(prev){
      var n = prev.slice(); while(n.length <= idx) n.push(0); n[idx] = val;
      var total = n.reduce(function(s,v){return s+v},0);
      if(total>100){var diff=total-100;var others=n.map(function(v,i){return i!==idx?v:0});var otherTotal=others.reduce(function(s,v){return s+v},0);
        if(otherTotal>0)n=n.map(function(v,i){return i===idx?val:Math.max(0,Math.round(v-diff*v/otherTotal))});
        var nt=n.reduce(function(s,v){return s+v},0);if(nt>100)n[idx]-=(nt-100)}
      return n;
    });
  }

  function clearAllData(){ store.clearAll(); }

  // ── Context value (engine + navigation + shared derived state) ─────
  var ctx = {
    engine: engine,
    goTab: goTab,
    tier: tier,
    isDemo: isDemo,
    hasData: hasData,
    lang: lang,
    t: t
  };

  // ── Render ─────────────────────────────────────────────────────────
  return(<EngineProvider value={ctx}>
    <div className="mn-root">
      {/* Demo mode banner */}
      {(isDemo ? true : store.demoBannerVisible)&&<div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"8px 16px",background:"linear-gradient(90deg,rgba(124,58,237,0.95),rgba(0,153,204,0.95))",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"Outfit,sans-serif",letterSpacing:1,textTransform:"uppercase",backdropFilter:"blur(8px)",boxShadow:"0 2px 20px rgba(0,0,0,0.2)"}}><span>{lang==="en"?"DEMO MODE — Full access":"MODO DEMO — Acceso completo"}</span><button onClick={function(){sf('demoBannerVisible',false)}} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:11,fontWeight:600}}>×</button></div>}
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

{tab==="dashboard"&&<DashboardTab goTab={goTab} tier={tier} hasData={hasData} engine={engine} />}
{tab==="learn"&&<LearnTab goTab={goTab} tier={tier} />}
{tab==="assumptions"&&<AssumptionsTab goTab={goTab} tier={tier} engine={engine} />}
{tab==="situation"&&<SituationTab goTab={goTab} tier={tier} engine={engine} />}
{tab==="debts"&&<DebtsTab goTab={goTab} tier={tier} engine={engine} />}
{tab==="retirement"&&<RetirementTab goTab={goTab} tier={tier} engine={engine} />}
{tab==="invest"&&<InvestTab goTab={goTab} tier={tier} engine={engine} />}
{tab==="portfolio"&&<PortfolioTab goTab={goTab} tier={tier} engine={engine} updatePortAlloc={updatePortAlloc} updateContribAlloc={updateContribAlloc} />}
{tab==="achieve"&&<AchieveTab goTab={goTab} tier={tier} engine={engine} isDemo={isDemo} />}
{tab==="inaction"&&<InactionTab goTab={goTab} tier={tier} engine={engine} />}
{tab==="save"&&<SaveTab goTab={goTab} tier={tier} engine={engine} />}
{tab==="earn"&&<EarnTab goTab={goTab} tier={tier} engine={engine} />}
{tab==="cost"&&<CostTab goTab={goTab} tier={tier} engine={engine} />}
{tab==="goals"&&<GoalsTab goTab={goTab} tier={tier} engine={engine} />}
{tab==="score"&&<ScoreTab goTab={goTab} tier={tier} engine={engine} />}
{tab==="reports"&&<ReportsTab goTab={goTab} tier={tier} hasData={hasData} engine={engine} />}

        <div style={{marginTop:36,padding:"14px 18px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)",fontSize:11,color:"#3b82f6",lineHeight:1.7,textAlign:"center"}}>
          <strong>{t('disclaimer.important')}</strong> {t('disclaimer.text')} {t('disclaimer.inflation')} {(engine.INFL*100).toFixed(1)}%/{t('app.yr')}.
          <div style={{marginTop:8}}><a href="#" onClick={function(e){e.preventDefault()}} style={{color:"#60a5fa",fontWeight:600,textDecoration:"underline"}}>{t('disclaimer.advisor')}</a> {t('disclaimer.advisorSub')}</div>
        </div>
      </main>
    </div>
    <LeadCaptureModal
      show={store.showLeadModal}
      onClose={function(){sf('showLeadModal',false)}}
      lang={lang}
      financials={{
        age: engine.nAge || null,
        retirementAge: engine.nRetAge || null,
        yearsInRetirement: engine.nYP || null,
        monthlyIncome: engine.totalIncome || null,
        monthlyExpenses: engine.totExp || null,
        monthlySavings: engine.mSav,
        savingsRate: engine.savRate || null,
        currentSavings: engine.nEx || null,
        totalDebt: store.noDebts ? 0 : (engine.totalDebtAll || null),
        magicNumber: engine.magic.real || null,
        mnProgressPct: engine.mD.p || null,
        healthScore: engine.hScore.s || null,
        desiredIncome: engine.nDes || null,
        socialSecurity: engine.nSS || null,
        legacyAmount: engine.nLegacy || null,
        investmentProfile: engine.retProfLabel || null,
        tier: tier,
        sourceTab: tab,
        lang: lang,
      }}
    />
  </EngineProvider>);
}
