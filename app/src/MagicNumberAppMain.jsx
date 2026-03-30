import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { INFLATION_DEFAULT, RET_NOM, SCENARIO_SPREAD, PROFILES, DEFAULT_EXP, BENCH_SR, BENCH_NW, TABS } from './constants.js';
import { fmt, fmtC, pct } from './utils/formatters.js';
import { mR, fvC, fvL, pvA, gB, profByHorizon, clamp, yearByYear, fvVariable } from './utils/financial.js';
import Tip from './components/Tip.jsx';
import Cd from './components/Card.jsx';
import Toggle from './components/Toggle.jsx';
import TabBtn from './components/TabButton.jsx';
import { useTranslation } from './i18n/index.jsx';
import { saveState, loadState, clearState } from './hooks/usePersistedState.js';
import Icon from './components/Icon.jsx';

// Tip: imported from ./components/Tip.jsx

function ANum({value,dur}){dur=dur||1800;var _s=useState(0),d=_s[0],setD=_s[1];var f=useRef(null);var p=useRef(0);useEffect(function(){var s=p.current;var st=performance.now();var a=function(now){var pr=Math.min((now-st)/dur,1);var e=1-Math.pow(1-pr,3);setD(Math.floor(s+(value-s)*e));if(pr<1)f.current=requestAnimationFrame(a);else p.current=value};f.current=requestAnimationFrame(a);return function(){cancelAnimationFrame(f.current)}},[value,dur]);return "$"+d.toLocaleString("en-US")}

function NI({label,value,onChange,prefix,placeholder,tip,min,max,style:os,suffix}){
  if(prefix===undefined)prefix="$";if(!placeholder)placeholder="";if(min===undefined)min=0;
  var raw=String(value).replace(/,/g,"");
  var display=(raw&&!isNaN(Number(raw))&&Number(raw)>=1000)?Number(raw).toLocaleString("en-US"):raw;
  function handleChange(e){var v=e.target.value.replace(/,/g,"").replace(/[^0-9.\-]/g,"");onChange(v)}
  return(<div style={Object.assign({marginBottom:18},os)}>{label&&<label style={{display:"flex",alignItems:"center",marginBottom:7,fontSize:11,fontWeight:600,color:"#64748b",fontFamily:"Inter,sans-serif",letterSpacing:"0.6px",textTransform:"uppercase"}}>{label}{tip&&<Tip text={tip}/>}</label>}<div style={{display:"flex",alignItems:"center",background:"rgba(248,250,253,0.98)",borderRadius:12,border:"1px solid rgba(15,23,42,0.12)",padding:"0 16px",transition:"border-color 0.2s",boxShadow:"0 1px 4px rgba(15,23,42,0.07)"}}>{prefix&&<span style={{color:"#94a3b8",fontSize:15,fontWeight:700,marginRight:4,fontFamily:"Inter,sans-serif"}}>{prefix}</span>}<input type="text" inputMode="numeric" value={display} onChange={handleChange} placeholder={placeholder} style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#0f172a",fontSize:17,fontWeight:600,padding:"14px 0",fontFamily:"Inter,sans-serif",width:"100%",letterSpacing:"-0.5px"}}/>{suffix&&<span style={{color:"#94a3b8",fontSize:13,fontWeight:500,marginLeft:4,fontFamily:"Inter,sans-serif"}}>{suffix}</span>}</div></div>)
}

// Cd (Card): imported from ./components/Card.jsx

function ST({children,sub,tip}){return(<div style={{marginBottom:sub?28:20}}><h2 style={{fontFamily:"Outfit,sans-serif",fontSize:20,fontWeight:700,color:"#0f172a",display:"flex",alignItems:"center",letterSpacing:"-0.5px",lineHeight:1.2}}>{children}{tip&&<Tip text={tip}/>}</h2>{sub&&<p style={{fontSize:12,color:"#64748b",marginTop:6,lineHeight:1.6,fontFamily:"Inter,sans-serif"}}>{sub}</p>}</div>)}

function Gauge({value}){var {t}=useTranslation();var p=Math.min(value,100);var c=p>=70?"#0099cc":p>=40?"#d97706":"#dc2626";return(<div style={{textAlign:"center"}}><div style={{position:"relative",width:200,height:114,margin:"0 auto"}}><svg viewBox="0 0 160 90" style={{width:"100%",height:"100%"}}><path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth="14" strokeLinecap="round"/><path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke={c} strokeWidth="14" strokeLinecap="round" strokeDasharray={p*2.04+" 999"} style={{transition:"all 1.4s cubic-bezier(0.4,0,0.2,1)",filter:"drop-shadow(0 0 8px "+c+")"}}/></svg><div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)"}}><div style={{fontFamily:"Outfit,sans-serif",fontSize:44,fontWeight:900,color:c,lineHeight:1,letterSpacing:"-2px",textShadow:"0 0 20px "+c+"80"}}>{Math.round(value)}</div></div></div><div style={{fontSize:10,color:"#94a3b8",marginTop:12,letterSpacing:"1px",textTransform:"uppercase",fontFamily:"Inter,sans-serif"}}>{t('app.outOf100')}</div></div>)}

function Slider({label,value,onChange,min,max,step,format,color,tip}){
  min=min||0;max=max||100;step=step||1;color=color||"#0099cc";
  var pctV=((value-min)/(max-min))*100;
  return(<div style={{marginBottom:18}}>
    {label&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <label style={{fontSize:11,fontWeight:600,color:"#64748b",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",letterSpacing:"0.3px",textTransform:"uppercase"}}>{label}{tip&&<Tip text={tip}/>}</label>
      <span style={{fontSize:15,fontWeight:700,color:color,fontFamily:"Inter,sans-serif",letterSpacing:"-0.5px"}}>{format?format(value):value}</span>
    </div>}
    <div style={{position:"relative",height:32,display:"flex",alignItems:"center"}}>
      <div style={{position:"absolute",width:"100%",height:6,borderRadius:3,background:"rgba(15,23,42,0.08)"}}/>
      <div style={{position:"absolute",width:pctV+"%",height:6,borderRadius:3,background:"linear-gradient(90deg,"+color+"99,"+color+")",transition:"width 0.1s",boxShadow:"0 0 8px "+color+"40"}}/>
      <input type="range" min={min} max={max} step={step} value={value} onChange={function(e){onChange(Number(e.target.value))}}
        style={{position:"absolute",width:"100%",height:6,opacity:0,cursor:"pointer",margin:0,zIndex:2}}/>
      <div style={{position:"absolute",left:"calc("+pctV+"% - 10px)",width:20,height:20,borderRadius:"50%",background:"#ffffff",border:"2px solid "+color,boxShadow:"0 0 8px "+color+"60, 0 2px 6px rgba(15,23,42,0.15)",pointerEvents:"none",transition:"left 0.1s"}}/>
    </div>
  </div>)
}

function MiniChart({data,width,height,color,fillColor,labels,yPrefix,showDots}){
  var {t}=useTranslation();
  width=width||"100%";height=height||120;color=color||"#22c55e";yPrefix=yPrefix||"$";
  if(!data||data.length<2)return null;
  var maxV=Math.max.apply(null,data.map(function(d){return d.v}));
  var minV=Math.min.apply(null,data.map(function(d){return d.v}));
  var range=maxV-minV||1;
  var pad=12;var svgW=600;var svgH=height;var plotW=svgW-pad*2;var plotH=svgH-pad*2-20;
  var pts=data.map(function(d,i){return{x:pad+i/(data.length-1)*plotW,y:pad+10+(1-(d.v-minV)/range)*plotH,v:d.v,l:d.l}});
  var line=pts.map(function(p,i){return(i===0?"M":"L")+p.x+","+p.y}).join(" ");
  var area=line+" L"+pts[pts.length-1].x+","+(svgH-pad)+" L"+pts[0].x+","+(svgH-pad)+" Z";
  return(<svg viewBox={"0 0 "+svgW+" "+svgH} style={{width:width,height:height}}>
    <defs><linearGradient id={"g_"+color.replace("#","")} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
    {fillColor!==false&&<path d={area} fill={"url(#g_"+color.replace("#","")+")"} />}
    <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    {showDots!==false&&pts.filter(function(_,i){return i===0||i===pts.length-1||data.length<=12}).map(function(p,i){return <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="#ffffff" strokeWidth="2"/>})}
    {labels!==false&&pts.filter(function(_,i){return i===0||i===pts.length-1||(data.length<=12&&data.length>2&&i%Math.ceil(data.length/6)===0)}).map(function(p,i){return <text key={"t"+i} x={p.x} y={svgH-2} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="Outfit,sans-serif">{(p.l||"").replace('Yr', t('app.yr')).replace('Año', t('app.yr'))}</text>})}
  </svg>)
}

function MultiLineChart({series,width,height,labels,showYAxis}){
  var {t}=useTranslation();
  height=height||140;
  if(!series||series.length===0||!series[0].data||series[0].data.length<2)return null;
  const allV=[];(series||[]).forEach(function(s){(s.data||[]).forEach(function(d){allV.push(d.v)})});
  const maxV=Math.max.apply(null,allV);let minV=Math.min.apply(null,allV.filter(function(v){return v>=0}));
  minV=Math.min(minV,0);const range=maxV-minV||1;
  var lPad=showYAxis?52:12;var pad=12;var svgW=600;var svgH=height;var plotW=svgW-lPad-pad;var plotH=svgH-pad-10-20;
  var len=series[0].data.length;
  // Y-axis ticks
  var yTicks=[];
  if(showYAxis){
    var nTicks=4;for(var ti=0;ti<=nTicks;ti++){var tv=minV+range*(ti/nTicks);yTicks.push({v:tv,y:pad+10+(1-ti/nTicks)*plotH})}
  }
  return(<svg viewBox={"0 0 "+svgW+" "+svgH} style={{width:"100%",height:height}}>
    {showYAxis&&yTicks.map(function(t,i){return(<g key={"yt"+i}>
      <line x1={lPad} y1={t.y} x2={svgW-pad} y2={t.y} stroke="rgba(15,23,42,0.07)" strokeWidth="1"/>
      <text x={lPad-6} y={t.y+4} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="Outfit,sans-serif">{fmtC(t.v)}</text>
    </g>)})}
    {series.map(function(s,si){
      var pts=s.data.map(function(d,i){return{x:lPad+i/(len-1)*plotW,y:pad+10+(1-(d.v-minV)/range)*plotH}});
      var line=pts.map(function(p,i){return(i===0?"M":"L")+p.x+","+p.y}).join(" ");
      if(s.fill){var area=line+" L"+pts[pts.length-1].x+","+(svgH-pad)+" L"+pts[0].x+","+(svgH-pad)+" Z";
        return <g key={si}><path d={area} fill={s.color} fillOpacity="0.08"/><path d={line} fill="none" stroke={s.color} strokeWidth={s.bold?"3":"1.5"} strokeLinecap="round" strokeDasharray={s.dash||"none"}/></g>}
      return <path key={si} d={line} fill="none" stroke={s.color} strokeWidth={s.bold?"3":"1.5"} strokeLinecap="round" strokeDasharray={s.dash||"none"}/>
    })}
    {labels!==false&&series[0].data.map(function(d,i){
      if(!d.l)return null;
      var x=lPad+i/(len-1)*plotW;
      return <text key={"l"+i} x={x} y={svgH-2} textAnchor={i===0?"start":i===len-1?"end":"middle"} fill="#64748b" fontSize="10" fontFamily="Outfit,sans-serif">{(d.l||"").replace('Yr', t('app.yr')).replace('Año', t('app.yr'))}</text>}).filter(Boolean)}
  </svg>)
}

// Toggle: imported from ./components/Toggle.jsx
// TabBtn: imported from ./components/TabButton.jsx

function AdvisorCTA({msg}){
  var {t:tr} = useTranslation();
  return(<div style={{marginTop:16,padding:"20px 24px",borderRadius:14,background:"linear-gradient(135deg,rgba(34,197,94,0.06),rgba(96,165,250,0.06))",border:"1px solid rgba(34,197,94,0.15)",textAlign:"center"}}>
    <div style={{fontSize:15,fontWeight:700,color:"#0f172a",marginBottom:6}}>{msg||tr('advisor.readyToAct')}</div>
    <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6,marginBottom:14,maxWidth:380,margin:"0 auto 14px"}}>{tr('advisor.ctaBody')}</div>
    <a href="#" onClick={function(e){e.preventDefault()}} style={{display:"inline-block",padding:"12px 28px",borderRadius:12,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",fontSize:14,fontWeight:700,textDecoration:"none",fontFamily:"Outfit,sans-serif",boxShadow:"0 4px 15px rgba(34,197,94,0.3)"}}>{tr('advisor.ctaButton')}</a>
    <div style={{fontSize:10,color:"#475569",marginTop:8}}>{tr('advisor.freeConsult')}</div>
  </div>);
}
function NavButtons({tab,goTab,tier}){
  var {t:tr} = useTranslation();
  var fullOrder=["learn","achieve","inaction","assumptions","situation","debts","invest","portfolio","retirement","save","earn","cost","goals","score","reports"];
  var FREE_NAV=["learn","achieve","inaction"];
  var order=tier==="paid"?fullOrder:FREE_NAV;
  var idx=order.indexOf(tab);if(idx<0)return null;
  var prev=idx>0?order[idx-1]:null;var next=idx<order.length-1?order[idx+1]:null;
  var lb=function(id){return tr('tabs.'+id)||id;};
  return(<div style={{display:"flex",justifyContent:prev&&next?"space-between":next?"flex-end":"flex-start",marginTop:24,gap:12}}>
    {prev&&<button onClick={function(){goTab(prev)}} style={{background:"rgba(255,255,255,0.03)",color:"#4a5568",border:"1px solid rgba(255,255,255,0.07)",padding:"12px 28px",borderRadius:12,fontSize:13,fontWeight:600,fontFamily:"Inter,sans-serif",cursor:"pointer",letterSpacing:"-0.2px",transition:"all 0.2s"}}>← {lb(prev)}</button>}
    {next&&<button className="bp" onClick={function(){goTab(next)}} style={{fontFamily:"Inter,sans-serif",letterSpacing:"-0.2px"}}>{lb(next)} →</button>}
  </div>)
}

export default function MagicNumberApp({onBack}){
  const {t, lang, toggleLang} = useTranslation();
  const [tab, setTab] = useState("achieve");
  const [setupDone, setSetupDone] = useState(false);
  const [tier, setTier] = useState("free"); // free | email | paid
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const FREE_TABS = ["achieve", "inaction", "learn"];

  useEffect(function(){
    document.title = "MaNu PRO";
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('dashboard.welcomeSub') || "");
  }, [lang]);

  // Income & Basic settings
  const [age, setAge] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [expenses, setExpenses] = useState(DEFAULT_EXP);
  const nEId = useRef(6);
  const [ownsHome, setOwnsHome] = useState(false);
  const [vacationAnnual, setVacationAnnual] = useState("");
  const [coupleMode, setCoupleMode] = useState(false);
  const [partner2Income, setPartner2Income] = useState("");
  const [hasRental, setHasRental] = useState(false);
  const [rentalEquity, setRentalEquity] = useState("");
  const [rentalNetIncome, setRentalNetIncome] = useState("");

  // Debts
  const [debts, setDebts] = useState([{id:1,name:"",balance:"",rate:"",minPayment:""}]);
  const [noDebts, setNoDebts] = useState(false);
  const [noMortgage, setNoMortgage] = useState(false);
  const [mortgageBalance, setMortgageBalance] = useState("");
  const [mortgageRate, setMortgageRate] = useState("");
  const [mortgagePayment, setMortgagePayment] = useState("");
  const [mortgageYearsLeft, setMortgageYearsLeft] = useState("");
  const [noCarLoan, setNoCarLoan] = useState(false);
  const [carBalance, setCarBalance] = useState("");
  const [carRate, setCarRate] = useState("");
  const [carPayment, setCarPayment] = useState("");
  const [carYearsLeft, setCarYearsLeft] = useState("");
  const nDId = useRef(2);

  // Retirement Settings
  const [retirementAge, setRetirementAge] = useState("");
  const [yearsPostRet, setYearsPostRet] = useState("");
  const [desiredIncome, setDesiredIncome] = useState("");
  const [existingSavings, setExistingSavings] = useState("");
  const [socialSecurity, setSocialSecurity] = useState("");
  const [magicRevealed, setMagicRevealed] = useState(false);
  const [retProfileIdx, setRetProfileIdx] = useState(4);
  const [chartProfileIdx, setChartProfileIdx] = useState(-1);
  const [chartRetireIdx, setChartRetireIdx] = useState(3);

  // Investment Settings
  const [showNom, setShowNom] = useState(false);
  const [projYears, setProjYears] = useState(10);
  const [customInflation, setCustomInflation] = useState(2.5);
  const [showScenarios, setShowScenarios] = useState(true);
  const [customReturn, setCustomReturn] = useState("");
  const [scenProfileIdx, setScenProfileIdx] = useState(5);
  const [costNSProfileIdx, setCostNSProfileIdx] = useState(4);

  // Portfolio
  const [portAlloc, setPortAlloc] = useState([0,0,0,0,30,40,30]);
  const [portContribAlloc, setPortContribAlloc] = useState([0,0,0,0,20,30,50]);

  // Strategy & Simulation
  const [savSliders, setSavSliders] = useState({});
  const [extraIncome, setExtraIncome] = useState("");
  const [eiTemporary, setEiTemporary] = useState(false);
  const [eiYears, setEiYears] = useState("5");
  const [costItemName, setCostItemName] = useState("");
  const [costItemPrice, setCostItemPrice] = useState("");
  const [costProfileIdx, setCostProfileIdx] = useState(4);
  const [goals, setGoals] = useState([{id:1,name:"",amount:"",years:"",profileIdx:4}]);
  const nGId = useRef(2);
  const [showRec, setShowRec] = useState(true);
  const [simSav, setSimSav] = useState(null);
  const [simMo, setSimMo] = useState(null);
  const [simRet, setSimRet] = useState(null);
  const [manualMonthlySav, setManualMonthlySav] = useState("");
  const [legacy, setLegacy] = useState("");
  const [assetTax, setAssetTax] = useState(0);

  const [revDes, setRevDes] = useState("");
  const [revYrs, setRevYrs] = useState("");

  const [revSS, setRevSS] = useState("");
  const [revSav, setRevSav] = useState("");
  const [revMo, setRevMo] = useState("");
  const [revRet, setRevRet] = useState(4.0);
  const [revRetProf, setRevRetProf] = useState(4); // retirement profile idx, default 60/40

  // Cost of Inaction tab
  const [ciH, setCiH] = useState(20);
  const [ciDelayProf, setCiDelayProf] = useState(5);
  const [ciBase, setCiBase] = useState(0); // 0=Vault, 1=Cash, 2=CDs
  const [ciSav, setCiSav] = useState(null);
  const [ciMo, setCiMo] = useState(null);

  // ── LocalStorage Persistence ──────────────────────────────────────
  // Load saved state on mount
  const [loaded, setLoaded] = useState(false);
  useEffect(function() {
    var s = loadState();
    if (!s) { setLoaded(true); return; }
    // Restore all persisted fields
    if (s.age != null) setAge(s.age);
    if (s.monthlyIncome != null) setMonthlyIncome(s.monthlyIncome);
    if (s.expenses != null && s.expenses.length > 0) { setExpenses(s.expenses); nEId.current = Math.max.apply(null, s.expenses.map(function(e){return e.id})) + 1; }
    if (s.ownsHome != null) setOwnsHome(s.ownsHome);
    if (s.vacationAnnual != null) setVacationAnnual(s.vacationAnnual);
    if (s.coupleMode != null) setCoupleMode(s.coupleMode);
    if (s.partner2Income != null) setPartner2Income(s.partner2Income);
    if (s.hasRental != null) setHasRental(s.hasRental);
    if (s.rentalEquity != null) setRentalEquity(s.rentalEquity);
    if (s.rentalNetIncome != null) setRentalNetIncome(s.rentalNetIncome);
    // Debts
    if (s.debts != null && s.debts.length > 0) { setDebts(s.debts); nDId.current = Math.max.apply(null, s.debts.map(function(d){return d.id})) + 1; }
    if (s.noDebts != null) setNoDebts(s.noDebts);
    if (s.noMortgage != null) setNoMortgage(s.noMortgage);
    if (s.mortgageBalance != null) setMortgageBalance(s.mortgageBalance);
    if (s.mortgageRate != null) setMortgageRate(s.mortgageRate);
    if (s.mortgagePayment != null) setMortgagePayment(s.mortgagePayment);
    if (s.mortgageYearsLeft != null) setMortgageYearsLeft(s.mortgageYearsLeft);
    if (s.noCarLoan != null) setNoCarLoan(s.noCarLoan);
    if (s.carBalance != null) setCarBalance(s.carBalance);
    if (s.carRate != null) setCarRate(s.carRate);
    if (s.carPayment != null) setCarPayment(s.carPayment);
    if (s.carYearsLeft != null) setCarYearsLeft(s.carYearsLeft);
    // Retirement
    if (s.retirementAge != null) setRetirementAge(s.retirementAge);
    if (s.yearsPostRet != null) setYearsPostRet(s.yearsPostRet);
    if (s.desiredIncome != null) setDesiredIncome(s.desiredIncome);
    if (s.existingSavings != null) setExistingSavings(s.existingSavings);
    if (s.socialSecurity != null) setSocialSecurity(s.socialSecurity);
    if (s.legacy != null) setLegacy(s.legacy);
    if (s.assetTax != null) setAssetTax(s.assetTax);
    if (s.manualMonthlySav != null) setManualMonthlySav(s.manualMonthlySav);
    // Investment
    if (s.customInflation != null) setCustomInflation(s.customInflation);
    if (s.customReturn != null) setCustomReturn(s.customReturn);
    if (s.portAlloc != null) setPortAlloc(s.portAlloc);
    if (s.portContribAlloc != null) setPortContribAlloc(s.portContribAlloc);
    // Extra income
    if (s.extraIncome != null) setExtraIncome(s.extraIncome);
    if (s.eiTemporary != null) setEiTemporary(s.eiTemporary);
    if (s.eiYears != null) setEiYears(s.eiYears);
    // Goals
    if (s.goals != null && s.goals.length > 0) { setGoals(s.goals); nGId.current = Math.max.apply(null, s.goals.map(function(g){return g.id})) + 1; }
    // Tier & email
    if (s.tier != null) setTier(s.tier);
    if (s.userEmail != null) setUserEmail(s.userEmail);
    setLoaded(true);
  }, []);

  // Auto-save on state changes (debounced 800ms)
  useEffect(function() {
    if (!loaded) return; // don't save during initial load
    var timer = setTimeout(function() {
      saveState({
        age, monthlyIncome, expenses, ownsHome, vacationAnnual,
        coupleMode, partner2Income, hasRental, rentalEquity, rentalNetIncome,
        debts, noDebts, noMortgage, mortgageBalance, mortgageRate, mortgagePayment, mortgageYearsLeft,
        noCarLoan, carBalance, carRate, carPayment, carYearsLeft,
        retirementAge, yearsPostRet, desiredIncome, existingSavings, socialSecurity,
        legacy, assetTax, manualMonthlySav,
        customInflation, customReturn, portAlloc, portContribAlloc,
        extraIncome, eiTemporary, eiYears, goals,
        tier, userEmail
      });
    }, 800);
    return function() { clearTimeout(timer); };
  }, [loaded, age, monthlyIncome, expenses, ownsHome, vacationAnnual,
      coupleMode, partner2Income, hasRental, rentalEquity, rentalNetIncome,
      debts, noDebts, noMortgage, mortgageBalance, mortgageRate, mortgagePayment, mortgageYearsLeft,
      noCarLoan, carBalance, carRate, carPayment, carYearsLeft,
      retirementAge, yearsPostRet, desiredIncome, existingSavings, socialSecurity,
      legacy, assetTax, manualMonthlySav,
      customInflation, customReturn, portAlloc, portContribAlloc,
      extraIncome, eiTemporary, eiYears, goals,
      tier, userEmail]);

  // Clear all data function (for UI reset button)
  function clearAllData() {
    clearState();
    setAge(""); setMonthlyIncome(""); setExpenses(DEFAULT_EXP);
    setOwnsHome(false); setVacationAnnual(""); setCoupleMode(false); setPartner2Income("");
    setHasRental(false); setRentalEquity(""); setRentalNetIncome("");
    setDebts([{id:1,name:"",balance:"",rate:"",minPayment:""}]); setNoDebts(false);
    setNoMortgage(false); setMortgageBalance(""); setMortgageRate(""); setMortgagePayment(""); setMortgageYearsLeft("");
    setNoCarLoan(false); setCarBalance(""); setCarRate(""); setCarPayment(""); setCarYearsLeft("");
    setRetirementAge(""); setYearsPostRet(""); setDesiredIncome(""); setExistingSavings(""); setSocialSecurity("");
    setLegacy(""); setAssetTax(0); setManualMonthlySav("");
    setCustomInflation(2.5); setCustomReturn(""); setPortAlloc([0,0,0,0,30,40,30]); setPortContribAlloc([0,0,0,0,20,30,50]);
    setExtraIncome(""); setEiTemporary(false); setEiYears("5");
    setGoals([{id:1,name:"",amount:"",years:"",profileIdx:4}]);
    setTier("free"); setUserEmail("");
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

  var goTab=useCallback(function(t){setTab(t);if(t==="retirement"&&!magicRevealed)setTimeout(function(){setMagicRevealed(true)},400);window.scrollTo({top:0,behavior:"smooth"})},[magicRevealed]);
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
      <header className="mn-header">
        <div className="mn-logo" onClick={onBack} style={{cursor:onBack?"pointer":"default"}}>
          <span className="mn-logo-icon">MN</span>
          MaNu
          <span className="pro-badge">PRO</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {onBack&&<button onClick={onBack} style={{background:"rgba(15,23,42,0.04)",border:"1px solid rgba(15,23,42,0.10)",borderRadius:10,padding:"7px 14px",color:"#64748b",fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer",transition:"all 0.15s",letterSpacing:"-0.1px"}}>← {lang==="en"?"Home":"Inicio"}</button>}
          {hasData&&<button onClick={function(){if(window.confirm(lang==="en"?"Clear all your data? This cannot be undone.":"¿Borrar todos tus datos? No se puede deshacer."))clearAllData()}} style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:10,padding:"7px 14px",color:"#ef4444",fontSize:11,fontWeight:600,fontFamily:"Inter,sans-serif",cursor:"pointer",transition:"all 0.15s",display:"inline-flex",alignItems:"center",gap:4}}><Icon name="trash" size={13} weight="regular" /> {lang==="en"?"Reset":"Limpiar"}</button>}
          <button className="mn-lang-btn" onClick={toggleLang} style={{display:"inline-flex",alignItems:"center",gap:4}}><Icon name="globe" size={14} weight="regular" /> {lang==="en"?"EN":"ES"}</button>
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
{tab==="dashboard"&&<div className="fi">{!hasData?
  <Cd><div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:48,marginBottom:16}}><Icon name="crosshair" size={48} weight="regular" color="#60a5fa" /></div><h2 style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,marginBottom:12}}>{t('dashboard.welcome')}</h2><p style={{color:"#94a3b8",fontSize:15,lineHeight:1.6,maxWidth:400,margin:"0 auto 24px"}}>{t('dashboard.welcomeSub')}</p><button className="bp" onClick={function(){goTab("learn")}}>{t('dashboard.start')}</button></div></Cd>
:<>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
    {[{l:t('dashboard.monthlySavings'),v:fmt(mSav),c:mSav>0?"#22c55e":"#ef4444",tab:"situation"},{l:t('dashboard.healthScore'),v:hScore.s+"/100",c:hScore.s>=70?"#22c55e":hScore.s>=40?"#eab308":"#ef4444",tab:"score"}].map(function(s){return(
      <Cd key={s.l} style={{padding:18,marginBottom:0,textAlign:"center",cursor:"pointer"}} onClick={function(){goTab(s.tab)}}><div style={{fontSize:10,color:"#64748b",fontWeight:500,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{s.l}</div><div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div></Cd>)})}
  </div>
  {magic.real>0&&<Cd glow="blue" style={{textAlign:"center"}} onClick={function(){goTab("retirement")}}>
    <div style={{fontSize:10,color:"#3b82f6",textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>{t('dashboard.yourMN')} {nSS>0&&<span style={{color:"#22c55e",fontSize:9}}>{t('dashboard.afterRetIncome')}</span>}</div>
    <div style={{fontFamily:"Outfit,sans-serif",fontSize:34,fontWeight:800,color:"#60a5fa"}}>{fmt(magic.real)}</div>
    <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{t('app.tapToExplore')}</div>
    {nEx>0&&<div style={{marginTop:10}}><div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,width:Math.min(mD.p,100)+"%",background:mD.bc,transition:"width 1s"}}/></div><div style={{fontSize:10,color:mD.gc,marginTop:3,fontWeight:600}}>{mD.p>=100?mD.p.toFixed(0)+"% — "+t('app.ahead'):mD.p.toFixed(1)+"% "+t('app.saved')}</div></div>}
  </Cd>}
  <Cd onClick={function(){goTab("situation")}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t('dashboard.monthSummary')}</div>
        <span style={{fontSize:15,fontWeight:600,color:"#0f172a"}}>{fmt(totalIncome)}</span><span style={{color:"#64748b",margin:"0 6px"}}>→</span>
        <span style={{fontSize:15,fontWeight:600,color:"#f87171"}}>{fmt(totalMonthlyObligations)}</span><span style={{color:"#64748b",margin:"0 6px"}}>=</span>
        <span style={{fontSize:15,fontWeight:700,color:mSav>=0?"#22c55e":"#ef4444"}}>{fmt(mSav)}</span></div>
      <span style={{color:"#334155",fontSize:18}}>›</span></div>
  </Cd>
  {!noDebts&&totalDebtAll>0&&<Cd onClick={function(){goTab("debts")}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t('dashboard.totalDebt')}</div><span style={{fontSize:17,fontWeight:700,color:"#f87171"}}>{fmt(totalDebtAll)}</span></div><span style={{color:"#334155",fontSize:18}}>›</span></div></Cd>}
  {emergencyMonths<6&&totalMonthlyObligations>0&&<Cd glow="red" onClick={function(){goTab("debts")}}><div style={{fontSize:10,color:"#ef4444",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{t('dashboard.emergencyFund')}</div><p style={{fontSize:13,color:"#fca5a5",lineHeight:1.5}}>{t('dashboard.emergencyMsg',{months:emergencyMonths.toFixed(1)})}</p></Cd>}
  {savOpps.length>0&&<Cd glow="green" onClick={function(){goTab("save")}}><div style={{fontSize:10,color:"#16a34a",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{t('dashboard.savingOpp')}</div><p style={{fontSize:13,color:"#94a3b8",lineHeight:1.5}}>{t('dashboard.savingOppMsg',{name:savOpps[0].name,saved:fmt(savOpps[0].saved),impact:fmt(savOpps[0].imp10)})}</p></Cd>}
  {hScore.recs.length>0&&<Cd glow="gold" onClick={function(){goTab("score")}}><div style={{fontSize:10,color:"#a18207",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{t('dashboard.topAction')}</div><p style={{fontSize:13,color:"#92400e",lineHeight:1.5}}>{hScore.recs[0].text}</p></Cd>}
</>}</div>}


{/* === LEARN === */}
{tab==="learn"&&<div className="fi">
  <Cd style={{textAlign:"center",padding:"28px 24px"}}>
    <div style={{fontSize:40,marginBottom:12}}><Icon name="book-open-text" size={40} weight="regular" color="#60a5fa" /></div>
    <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:"#0f172a",marginBottom:8}}>{t('learn.title')}</h2>
    <p style={{color:"#94a3b8",fontSize:14,lineHeight:1.6,maxWidth:420,margin:"0 auto"}}>
      {t('learn.subtitle')}
    </p>
  </Cd>

  <Cd><ST><Icon name="crosshair" size={16} weight="regular" /> {t('learn.magicNumber')}</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      {t('learn.magicNumberDesc')}
    </p>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,marginTop:10}}>
      {t('learn.magicNumberDepends')}
    </p>
  </Cd>

  <Cd><ST><Icon name="money" size={16} weight="regular" /> {t('learn.futureDollars')}</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      {t('learn.futureDollarsDesc')}
    </p>
  </Cd>

  <Cd><ST><Icon name="chart-line-up" size={16} weight="regular" /> {t('learn.nomVsReal')}</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      {t('learn.nomVsRealDesc')}
    </p>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,marginTop:10}}>
      {t('learn.nomVsRealExample')}
    </p>
  </Cd>

  <Cd><ST><Icon name="bank" size={16} weight="regular" /> {t('learn.investProfiles')}</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,marginBottom:12}}>
      {t('learn.investProfilesDesc')}
    </p>
    <div style={{display:"grid",gap:8}}>
      {PROFILES.map(function(p){return(
        <div key={p.id} style={{padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.15)",border:"1px solid rgba(15,23,42,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name={p.icon} size={14} weight="light"/> {t('profiles.'+p.id+'.name')||p.name}</span>
            <span style={{fontSize:12,color:p.color}}>{(p.nomReturn*100).toFixed(1)}% {t('common.nom')} / {(p.realReturn*100).toFixed(1)}% {t('common.real')}</span>
          </div>
          <div style={{fontSize:12,color:"#64748b",marginTop:4,lineHeight:1.5}}>{t('profiles.'+p.id+'.desc')||p.desc}</div>
        </div>)})}
    </div>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,marginTop:12}}>
      {t('learn.portfolioExplain')}
    </p>
  </Cd>

  <Cd><ST><Icon name="chart-bar" size={16} weight="regular" /> {t('learn.volatility')}</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      {t('learn.volatilityDesc')}
    </p>
  </Cd>

  <Cd><ST><Icon name="currency-dollar" size={16} weight="regular" /> {t('learn.currentVsMonthly')}</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      {t('learn.currentDesc')}
    </p>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,marginTop:10}}>
      {t('learn.monthlyDesc')}
    </p>
  </Cd>

  <Cd><ST><Icon name="ruler" size={16} weight="regular" /> {t('learn.inflation')}</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      {t('learn.inflationDesc')}
    </p>
  </Cd>

  <Cd><ST><Icon name="house" size={16} weight="regular" /> {t('learn.realEstate')}</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      {t('learn.realEstateDesc')}
    </p>
  </Cd>

  <Cd glow="green" style={{textAlign:"center",padding:"24px 20px"}}>
    <div style={{fontSize:14,fontWeight:600,color:"#22c55e",marginBottom:8}}>{t('learn.readyToStart')}</div>
    <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.6,marginBottom:16}}>
      {t('learn.readyToStartDesc')}
    </p>
    <button className="bp" onClick={function(){goTab("achieve")}}>{t('learn.letsGo')}</button>
  </Cd>
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === YOU === */}
{tab==="assumptions"&&<div className="fi">
  <Cd><ST sub={t('you.subtitle')}>{t('you.title')}</ST>
    {nAge>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
      {[{l:t('you.age'),v:nAge},{l:t('you.retireAt'),v:nRetAge},{l:t('you.yearsInRetirement'),v:nYP},{l:t('you.savings'),v:fmt(nEx)}].map(function(b){return(
        <div key={b.l} style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>{b.l}: <strong>{b.v}</strong></div>)})}
      <div style={{padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(15,23,42,0.08)",fontSize:11,color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("achieve")}}>{t('you.editInMN')}</div>
    </div>}
    <Toggle value={coupleMode} onChange={setCoupleMode} label={t('you.coupleMode')} sub={t('you.coupleSub')}/>
    <Toggle value={hasRental} onChange={setHasRental} label={t('you.rentalToggle')} sub={t('you.rentalSub')}/>
    {hasRental&&<>
      <NI label={t('you.rentalEquity')} value={rentalEquity} onChange={setRentalEquity} tip={t('you.rentalEquityTip')}/>
      <NI label={t('you.rentalIncome')} value={rentalNetIncome} onChange={setRentalNetIncome} tip={t('you.rentalIncomeTip')}/>
      {nRentalEq>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",lineHeight:1.5,marginBottom:12}}>
        <Icon name="ruler" size={13} weight="regular" /> {t('you.rentalEquityExplain',{equity:fmt(nRentalEq),totalAssets:fmt(totalNetWorth),rentalIncome:fmt(nRentalNet)})}
        {nAge>0&&nRetAge>0&&nYP>0&&<span> {t('you.rentalEquityFuture',{age:nRetAge+nYP,amt:fmt(Math.round(nRentalEq*Math.pow(1+INFL,nRetAge+nYP-nAge)))})}</span>}
      </div>}
    </>}
  </Cd>
  <Cd><ST sub={t('you.inflationSub')}>{t('you.inflationTitle')}</ST>
    <Slider label={t('you.inflationRate')} value={customInflation} onChange={setCustomInflation} min={0} max={8} step={0.1} format={function(v){return v.toFixed(1)+"%"}} color="#f59e0b"/>
    {customInflation!==2.5&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#92400e",marginTop:8}}>
      {t('you.customInflation',{rate:customInflation.toFixed(1)})}
    </div>}
  </Cd>
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === INCOME === */}
{tab==="situation"&&<div className="fi">
  <Cd><ST sub={t('income.subtitle')}>{t('income.title')}</ST>
    <NI label={coupleMode?t('income.netIncomeCouple'):t('income.netIncome')} value={monthlyIncome} onChange={setMonthlyIncome} placeholder="" tip={t('income.netIncomeTip')+(hasRental?t('income.noRentalTip'):"")}/>
    {coupleMode&&<NI label={t('income.partnerIncome')} value={partner2Income} onChange={setPartner2Income} placeholder="" tip={t('income.partnerTip')+(hasRental?t('income.noRentalTip'):"")}/>
    }
    <NI label={t('income.vacationLabel')} value={vacationAnnual} onChange={setVacationAnnual} placeholder="" tip={t('income.vacationTip')}/>
    {(nEx>0||nRentalEq>0)&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:12,color:"#93c5fd"}}>
      <Icon name="currency-dollar" size={13} weight="regular" /> {t('income.investSavings')}: <strong>{fmt(nEx)}</strong>{nRentalEq>0?" + rental equity: "+fmt(nRentalEq)+" = total assets: "+fmt(totalNetWorth):""} <span style={{color:"#475569"}}>{t('income.setInYouTab')}</span>
    </div>}
  </Cd>
  <Cd>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:17,fontWeight:600,color:"#0f172a",display:"flex",alignItems:"center"}}>{t('income.monthlyExpenses')}<Tip text={t('income.expensesTip')}/></h3>
      {expenses.length<15&&<button className="bs" onClick={aE}>{t('income.addBtn')}</button>}
    </div>
    {/* Own vs Rent toggle */}
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      <button onClick={function(){setOwnsHome(false)}} style={{flex:1,padding:"10px 14px",borderRadius:10,border:!ownsHome?"1px solid rgba(96,165,250,0.3)":"1px solid rgba(15,23,42,0.08)",background:!ownsHome?"rgba(96,165,250,0.08)":"rgba(0,0,0,0.1)",color:!ownsHome?"#93c5fd":"#64748b",fontSize:13,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer",textAlign:"center"}}>{t('income.iRent')}</button>
      <button onClick={function(){setOwnsHome(true)}} style={{flex:1,padding:"10px 14px",borderRadius:10,border:ownsHome?"1px solid rgba(34,197,94,0.3)":"1px solid rgba(15,23,42,0.08)",background:ownsHome?"rgba(34,197,94,0.08)":"rgba(0,0,0,0.1)",color:ownsHome?"#86efac":"#64748b",fontSize:13,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer",textAlign:"center"}}>{t('income.iOwn')}</button>
    </div>
    {ownsHome&&<div style={{padding:"12px 14px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:13,fontWeight:600,color:"#93c5fd"}}>{t('income.mortgagePI')}</span>
        <Tip text={t('income.mortgageTip')}/>
      </div>
      <div style={{display:"flex",alignItems:"center",background:"rgba(248,250,253,0.98)",borderRadius:12,border:"1px solid rgba(96,165,250,0.15)",padding:"0 16px"}}>
        <span style={{color:"#64748b",fontSize:15,fontWeight:600,marginRight:4}}>$</span>
        <input type="text" inputMode="numeric" value={(mortgagePayment&&!isNaN(Number(mortgagePayment))&&Number(mortgagePayment)>=1000)?Number(mortgagePayment).toLocaleString("en-US"):mortgagePayment} onChange={function(e){setMortgagePayment(e.target.value.replace(/,/g,"").replace(/[^0-9]/g,""))}} placeholder="" style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#93c5fd",fontSize:17,fontWeight:600,padding:"13px 0",fontFamily:"Outfit,sans-serif",width:"100%"}}/>
        <span style={{color:"#475569",fontSize:11}}>/mo</span>
      </div>
      {nMortPay>0&&<div style={{fontSize:10,color:"#475569",marginTop:6}}>{t('income.completeMortgage')}</div>}
    </div>}
    {(function(){const EXP_KEY={"Housing / Rent":"housingRent","Food & Groceries":"foodGroceries","Transportation":"transportation","Utilities & Bills":"utilitiesBills","Dining Out":"diningOut","Property Tax, Insurance & HOA":"propTaxInsHoa"};function tName(n){const k=EXP_KEY[n];return k?t('expenses.'+k):n}return (expenses||[]).map(function(exp){const displayName=(exp.id===1&&exp.mortgageAlt)?(ownsHome?tName(exp.mortgageAlt):tName("Housing / Rent")):tName(exp.name);return(<div key={exp.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
      <input type="text" value={displayName} onChange={function(e){uE(exp.id,"name",e.target.value)}} placeholder={t('income.category')} style={{flex:1,minWidth:0,background:"rgba(248,250,253,0.98)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,color:"#0f172a",fontSize:13,padding:"11px 12px",fontFamily:"Outfit,sans-serif",outline:"none"}}/>
      <div style={{display:"flex",alignItems:"center",background:"rgba(248,250,253,0.98)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"0 12px",width:120,flexShrink:0}}><span style={{color:"#64748b",fontSize:13,fontWeight:600,marginRight:4}}>$</span>
        <input type="text" inputMode="numeric" value={(exp.amount&&!isNaN(Number(exp.amount))&&Number(exp.amount)>=1000)?Number(exp.amount).toLocaleString("en-US"):exp.amount} onChange={function(e){uE(exp.id,"amount",e.target.value.replace(/,/g,"").replace(/[^0-9]/g,""))}} placeholder="" style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#0f172a",fontSize:15,fontWeight:600,padding:"11px 0",fontFamily:"Outfit,sans-serif",width:"100%"}}/></div>
      <button onClick={function(){uE(exp.id,"discretionary",!exp.discretionary)}} style={{padding:"6px 8px",borderRadius:8,fontSize:10,fontWeight:600,border:"none",cursor:"pointer",flexShrink:0,background:exp.discretionary!==false?"rgba(245,158,11,0.1)":"rgba(96,165,250,0.1)",color:exp.discretionary!==false?"#f59e0b":"#60a5fa",display:"flex",alignItems:"center"}}>{exp.discretionary!==false?<Icon name="scissors" size={12} weight="regular" />:<Icon name="push-pin" size={12} weight="regular" />}</button>
      {expenses.length>1&&<button onClick={function(){rE(exp.id)}} style={{width:34,height:34,borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",color:"#ef4444",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>}
    </div>)})})()}
    <div style={{display:"flex",gap:12,marginTop:8,fontSize:11,color:"#475569"}}><span style={{display:"inline-flex",alignItems:"center",gap:3}}><Icon name="scissors" size={11} weight="regular" /> {t('income.discretionary')}</span><span style={{display:"inline-flex",alignItems:"center",gap:3}}><Icon name="push-pin" size={11} weight="regular" /> {t('income.essential')}</span></div>
    {(function(){var filled=expenses.filter(function(e){return e.amount!==""}).length;return filled<5?
      <div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#92400e",lineHeight:1.6}}>
        <Icon name="warning" size={13} weight="regular" /> {t('income.fillWarning',{count:filled})}
      </div>
      :<div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#86efac"}}>
        <Icon name="check-circle" size={13} weight="regular" /> {t('income.fillComplete',{count:filled})}
      </div>})()}
  </Cd>
  {nVac>0&&<Cd style={{padding:16}}><div style={{fontSize:12,color:"#64748b"}}><Icon name="calendar" size={12} weight="regular" /> {t('common.vacation')}: <strong style={{color:"#0f172a"}}>{fmt(Number(vacationAnnual))}{t('app.perYear')}</strong> = <strong style={{color:"#f87171"}}>{fmt(nVac)}{t('app.perMonth')}</strong> {t('common.addedToExpenses')}</div></Cd>}
  <Cd glow={mSav>0?"green":mSav<0?"red":null}>
    <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:17,fontWeight:600,color:"#0f172a",marginBottom:14}}>{t('income.monthlySummary')}</h3>
    {totalIncome>0&&<div style={{height:26,borderRadius:8,overflow:"hidden",background:"rgba(15,23,42,0.06)",display:"flex",marginBottom:14}}>
      {totalMonthlyObligations>0&&<div style={{width:Math.min((totalMonthlyObligations/totalIncome)*100,100)+"%",background:"linear-gradient(90deg,#ef4444,#f87171)"}}/>}
      {mSav>0&&<div style={{width:(mSav/totalIncome)*100+"%",background:"linear-gradient(90deg,#22c55e,#4ade80)"}}/>}
    </div>}
    <div style={{display:"grid",gap:8,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#94a3b8"}}>{t('income.totalIncome')}{coupleMode||nRentalNet>0?" (total)":""}</span><span style={{fontSize:15,fontWeight:700,color:"#0f172a"}}>{fmt(totalIncome)}</span></div>
      {(coupleMode||nRentalNet>0)&&<div style={{paddingLeft:12,display:"grid",gap:4}}>
        {coupleMode&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569"}}><span>{t('common.you')}: {fmt(nInc)}</span><span>{t('common.partner')}: {fmt(nP2I)}</span></div>}
        {nRentalNet>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569"}}><span><Icon name="house-line" size={11} weight="regular" /> {t('common.netRentalIncome')}</span><span>{fmt(nRentalNet)}</span></div>}
      </div>}
      <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#94a3b8"}}>{t('income.totalExpenses')}{nVac>0?" ("+t('common.incVacation')+")":""}</span><span style={{fontSize:15,fontWeight:600,color:"#f87171"}}>−{fmt(totExp)}</span></div>
      {nMortPay>0&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#94a3b8"}}>{t('income.mortgagePI')}</span><span style={{fontSize:15,fontWeight:600,color:"#f87171"}}>−{fmt(nMortPay)}</span></div>}
      {nCarPay>0&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#94a3b8"}}>{t('debts.carLoan')}</span><span style={{fontSize:15,fontWeight:600,color:"#f87171"}}>−{fmt(nCarPay)}</span></div>}
      <div style={{borderTop:"1px solid rgba(15,23,42,0.08)",paddingTop:8,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:14,fontWeight:600,color:"#0f172a"}}>{t('income.monthlySavingsLabel')}</span><span style={{fontSize:19,fontWeight:800,color:mSav>0?"#22c55e":mSav<0?"#ef4444":"#94a3b8"}}>{fmt(mSav)}</span></div>
    </div>
    {mSav<0&&nEx>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.1)",fontSize:12,color:"#fca5a5",lineHeight:1.6,marginBottom:12}}>
      <Icon name="warning" size={13} weight="regular" /> {t('income.negSavingsWarning',{amount:fmt(Math.abs(mSav)),savings:fmt(nEx),yearly:fmt(Math.abs(mSav)*12)})}
    </div>}
    {debtEvents.length>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#86efac",lineHeight:1.6}}>
      <Icon name="chart-line-up" size={12} weight="regular" /> {t('income.debtEndBoost')}{(debtEvents||[]).map(function(ev){return " "+ev.name+" "+(lang==="en"?"ends in ":"termina en ")+ev.endsAtYear+(lang==="en"?" years":" años")+" (+"+fmt(ev.monthlyAmount)+t('app.perMonth')+")"}).join(",")}
    </div>}
  </Cd>
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === DEBTS === */}
{tab==="debts"&&<div className="fi">
  {/* Mortgage — always shows if ownsHome, independent of noDebts */}
  {ownsHome&&<Cd>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:17,fontWeight:600,color:"#0f172a"}}>{t('debts.mortgageDetails')}</h3>
    </div>
    {nMortPay>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.1)",fontSize:12,color:"#93c5fd",marginBottom:12}}>
      {t('debts.monthlyPI')}: <strong>{fmt(nMortPay)}</strong> <span style={{color:"#475569"}}>{t('debts.fromIncomeTab')}</span>
    </div>}
    {nMortPay===0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.1)",fontSize:12,color:"#92400e",marginBottom:12}}>
      {t('debts.enterMortgage')}
    </div>}
    <Toggle value={noMortgage} onChange={setNoMortgage} label={noMortgage?t('debts.paidOff'):t('debts.stillHave')}/>
    {!noMortgage&&<>
      <NI label={t('debts.yearsLeft')} value={mortgageYearsLeft} onChange={setMortgageYearsLeft} prefix="" placeholder="" style={{marginBottom:8}} tip={t('debts.yearsLeftTip')}/>
      <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",lineHeight:1.5,marginBottom:12}}>
        <Icon name="ruler" size={12} weight="regular" /> {t('debts.projectionsExplain',{payment:fmt(nMortPay),yearsInfo:nMortYrs>0?" ("+nMortYrs+")":"",ageInfo:nMortYrs>0?" "+(lang==="en"?"at age ":"a los ")+(nAge+nMortYrs):""})}
      </div>
      <div style={{fontSize:13,fontWeight:500,color:"#64748b",marginBottom:8}}>{t('debts.optionalDetails')}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <NI label={t('debts.remainingBalance')} value={mortgageBalance} onChange={setMortgageBalance} style={{marginBottom:0}}/>
        <NI label={t('debts.fixedRate')} value={mortgageRate} onChange={setMortgageRate} prefix="" placeholder="" style={{marginBottom:0}}/>
      </div>
      {(Number(mortgageRate)||0)>0&&(Number(mortgageRate)||0)<4&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#86efac",lineHeight:1.6,marginTop:8}}>
        <Icon name="check-circle" size={13} weight="regular" /> {t('debts.goodRate',{rate:mortgageRate})}
      </div>}
      {(Number(mortgageRate)||0)>=4&&(Number(mortgageRate)||0)<6&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.1)",fontSize:12,color:"#92400e",lineHeight:1.6,marginTop:8}}>
        <Icon name="chart-bar" size={13} weight="regular" /> {t('debts.moderateRate',{rate:mortgageRate})}
      </div>}
      {(Number(mortgageRate)||0)>=6&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.1)",fontSize:12,color:"#fca5a5",lineHeight:1.6,marginTop:8}}>
        <Icon name="fire" size={13} weight="regular" /> <strong>{t('debts.highRate',{rate:mortgageRate})}</strong>
        {nEx>0&&mortBal>0?" "+t('debts.highRateAdvice',{savings:fmt(nEx),rate:mortgageRate}):""}
        {(Number(mortgageRate)||0)>=8?" "+t('debts.veryHighRate',{rate:mortgageRate}):""}
      </div>}
    </>}
  </Cd>}

  {/* Other debts */}
  <Cd><ST tip={t('debts.debtPlaceholder')} sub={ownsHome?t('debts.otherDebtsSub'):t('debts.yourDebts')}>{t('debts.otherDebts')}</ST>
    <Toggle value={noDebts} onChange={setNoDebts} label={noDebts?t('debts.noOtherDebts'):t('debts.haveOtherDebts')} sub={noDebts?null:"Toggle if no car loan, credit cards, etc."}/>
  </Cd>

  {!noDebts&&<>

    {/* Car Loan */}
    <Cd>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:17,fontWeight:600,color:"#0f172a"}}>{t('debts.carLoan')}</h3>
      </div>
      <Toggle value={noCarLoan} onChange={setNoCarLoan} label={noCarLoan?t('debts.noCarLoan'):t('debts.haveCarLoan')}/>
      {!noCarLoan&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <NI label={t('debts.remainingBalance')} value={carBalance} onChange={setCarBalance} style={{marginBottom:0}}/>
          <NI label={t('debts.yearsLeft')} value={carYearsLeft} onChange={setCarYearsLeft} prefix="" placeholder="" style={{marginBottom:0}} tip={t('debts.yearsLeftTip')}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <NI label={t('debts.rate')} value={carRate} onChange={setCarRate} prefix="" placeholder="" style={{marginBottom:0}}/>
          <NI label={t('debts.monthlyPayment')} value={carPayment} onChange={setCarPayment} style={{marginBottom:0}}/>
        </div>
        <div style={{fontSize:10,color:"#475569",marginTop:8}}>{t('debts.carLoanEndsNote')}</div>
      </>}
    </Cd>

    {/* Other Debts */}
    <Cd>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:17,fontWeight:600,color:"#0f172a"}}>{t('debts.otherDebts')}</h3>
        {debts.length<8&&<button className="bs" onClick={aD}>{t('debts.addDebt')}</button>}
      </div>
      {(debts||[]).map(function(d){return(<div key={d.id} style={{padding:14,background:"rgba(0,0,0,0.15)",borderRadius:14,marginBottom:10,border:"1px solid rgba(15,23,42,0.06)"}}>
        <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
          <input type="text" value={d.name} onChange={function(e){uD(d.id,"name",e.target.value)}} placeholder={t('debts.debtPlaceholder')} style={{flex:1,background:"rgba(248,250,253,0.98)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,color:"#0f172a",fontSize:13,padding:"10px 12px",fontFamily:"Outfit,sans-serif",outline:"none"}}/>
          {debts.length>1&&<button onClick={function(){rD(d.id)}} style={{width:32,height:32,borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",color:"#ef4444",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <NI label={t('debts.balance')} value={d.balance} onChange={function(v){uD(d.id,"balance",v)}} style={{marginBottom:0}}/>
          <NI label={t('debts.rate')} value={d.rate} onChange={function(v){uD(d.id,"rate",v)}} prefix="" placeholder="" style={{marginBottom:0}}/>
          <NI label={t('debts.minPayment')} value={d.minPayment} onChange={function(v){uD(d.id,"minPayment",v)}} style={{marginBottom:0}}/>
        </div></div>)})}
    </Cd>
  </>}

  {/* Debt Analysis */}
  {!noDebts&&debtAn.length>0&&<Cd glow={probDebts.length>0?"red":"green"}>
    <div style={{fontSize:14,fontWeight:600,color:"#0f172a",marginBottom:14}}>{t('debts.debtVsInvest')}</div>
    {(debtAn||[]).map(function(d,i){return(<div key={d.id} style={{padding:14,borderRadius:12,marginBottom:10,background:d.sev==="critical"?"rgba(239,68,68,0.06)":d.sev==="high"?"rgba(245,158,11,0.06)":"rgba(255,255,255,0.02)",border:d.sev==="critical"?"1px solid rgba(239,68,68,0.1)":d.sev==="high"?"1px solid rgba(245,158,11,0.1)":"1px solid rgba(15,23,42,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:14,fontWeight:600,color:"#0f172a"}}>{d.name||"Unnamed"}</span>
        <div><span style={{fontWeight:700,fontSize:14,color:d.sev==="low"?"#94a3b8":"#f87171"}}>{fmt(d.bal)}</span><span style={{fontSize:12,marginLeft:6,color:d.sev==="low"?"#64748b":"#ef4444"}}>@ {d.rate}%</span></div></div>
      <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>
        {d.sev==="critical"?<span><Icon name="siren" size={13} weight="regular" /> {t('debts.debtCritical',{rate:d.rate})}</span>
        :d.sev==="high"?<span><Icon name="warning" size={13} weight="regular" /> {t('debts.debtHigh',{rate:d.rate,strategies:PROFILES.filter(function(p){return p.nomReturn>=d.rate/100}).map(function(p){return p.name}).join(", ")})}</span>
        :d.sev==="moderate"?<span><Icon name="chart-bar" size={13} weight="regular" /> {t('debts.debtModerate',{rate:d.rate})}</span>
        :<span><Icon name="check-circle" size={13} weight="regular" /> {t('debts.debtLow',{rate:d.rate})}</span>}
      </div></div>)})}
    {probDebts.length===0&&debtAn.length>0&&<div style={{fontSize:13,color:"#86efac",marginTop:4}}>{t('debts.allDebtsBelowReturns')}</div>}
  </Cd>}

  {/* Emergency Fund */}
  {totalMonthlyObligations>0&&<Cd>
    <div style={{fontSize:14,fontWeight:600,color:"#60a5fa",marginBottom:10}}>{t('debts.emergencyFundTitle')}</div>
    {nEx>0?<>
      <div style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:emergencyMonths>=12?"#22c55e":emergencyMonths>=6?"#eab308":"#ef4444",marginBottom:6}}>
        {t('debts.savingsCover',{months:emergencyMonths>=12?Math.round(emergencyMonths):emergencyMonths.toFixed(1)})}
      </div>
      <div style={{height:8,borderRadius:4,background:"rgba(255,255,255,0.05)",overflow:"hidden",marginBottom:8}}>
        <div style={{height:"100%",borderRadius:4,width:Math.min(emergencyMonths/24*100,100)+"%",background:emergencyMonths>=12?"#22c55e":emergencyMonths>=6?"#eab308":"#ef4444",transition:"width 0.5s"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#475569",marginBottom:8}}><span>0</span><span>6 {t('common.monthAbbr')}</span><span>12 {t('common.monthAbbr')}</span><span>24 {t('common.monthAbbr')}</span></div>
      <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>
        {emergencyMonths>=24?t('debts.efExcellent')
        :emergencyMonths>=12?t('debts.efSolid')
        :emergencyMonths>=6?t('debts.efDecent')
        :emergencyMonths>=3?t('debts.efMinimum',{target:fmt(totalMonthlyObligations*12)})
        :t('debts.efCritical',{target:fmt(totalMonthlyObligations*6)})}
      </div>
      <div style={{fontSize:10,color:"#475569",marginTop:6}}>{t('debts.efBasedOn',{amt:fmt(totalMonthlyObligations)})}</div>
    </>:<div style={{fontSize:12,color:"#92400e"}}><Icon name="warning" size={13} weight="regular" /> {t('debts.enterSavingsEF')}</div>}
  </Cd>}
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === RETIREMENT === */}
{tab==="retirement"&&<div className="fi">
  <Cd><ST sub={t('retirement.sub')}>{t('retirement.title')}</ST>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
      {[{l:t('achieve.yourAge'),v:nAge},{l:t('achieve.retAge'),v:nRetAge},{l:t('achieve.yearsInRet'),v:nYP},{l:t('achieve.yearsToGo',{n:ytr}),v:""},{l:t('achieve.desiredIncome'),v:fmt(nDes)+"/mo"},{l:t('achieve.currentSavings'),v:fmt(nEx)}].filter(function(b){return b.v!==""}).map(function(b){return(
        <div key={b.l} style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>{b.l}: <strong>{b.v}</strong></div>)})}
      {nSS>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#86efac"}}>{t('retirement.retIncome')} {fmt(nSS)}/mo</div>}
      <div style={{padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(15,23,42,0.08)",fontSize:11,color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("achieve")}}>{t('retirement.editInMN')}</div>
    </div>
    {nMortPay>0&&nMortYrs>ytr&&ytr>0&&<div style={{padding:"12px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#92400e",lineHeight:1.6,marginBottom:16}}>
      <Icon name="warning" size={14} weight="regular" /> <strong>{t('retirement.mortgageExtends', {n: nMortYrs-ytr})}</strong> {t('common.makeSureDes')} <strong>{fmt(nMortPay)}/mo</strong>.
    </div>}
    {nMortPay>0&&nMortYrs>0&&nMortYrs<=ytr&&ytr>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#86efac",lineHeight:1.5,marginBottom:16}}>
      <Icon name="check-circle" size={13} weight="regular" /> {t('retirement.mortgagePaidOff', {n: ytr-nMortYrs})}
    </div>}
    {nSS>0&&nDes>0&&desiredAfterSS>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#86efac",lineHeight:1.5,marginBottom:16}}>
      <Icon name="check-circle" size={13} weight="regular" /> {t('retirement.retIncomeCover', {amt: fmt(nSS)})} <strong>{pct(nSS/nDes)}</strong> {t('retirement.ofMonthlyNeeds')} {t('retirement.onlyNeedFund')} <strong>{fmt(desiredAfterSS)}/mo</strong> {t('retirement.fromSavings')}.
    </div>}
  </Cd>

  {nDes>0&&nYP>0&&ytr>0&&desiredAfterSS===0&&<Cd glow="green" style={{textAlign:"center",padding:"32px 24px"}}>
    <div style={{fontSize:48,marginBottom:12}}><Icon name="confetti" size={48} weight="regular" color="#22c55e" /></div>
    <div style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:"#22c55e",marginBottom:8}}>{t('retirement.retiCovered')}</div>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.6,maxWidth:440,margin:"0 auto"}}>
      {t('retirement.retIncomeCover', {amt: fmt(nSS)})} {t('retirement.meetsExceeds')} {fmt(nDes)}/mo.
      {t('retirement.savingsOf')} <strong style={{color:"#0f172a"}}>{fmt(nEx)}</strong> {t('retirement.addWealth')}.
    </p>
  </Cd>}

  {nDes>0&&nYP>0&&ytr>0&&magic.real>0&&<>
    <Cd glow="blue" style={{textAlign:"center",padding:"40px 24px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"relative"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#60a5fa",textTransform:"uppercase",letterSpacing:3,marginBottom:10}}>{t('retirement.yourMN')}</div>
        <div style={{fontFamily:"Outfit,sans-serif",fontSize:50,fontWeight:900,color:"#60a5fa",lineHeight:1.1,marginBottom:6,textShadow:"0 0 40px rgba(96,165,250,0.3),0 0 80px rgba(96,165,250,0.15)"}}>{magicRevealed?<ANum value={Math.round(magic.real)} dur={2200}/>:"$0"}</div>
        <div style={{fontSize:13,color:"#3b82f6"}}>{t('retirement.adjustedForInflation')}</div>
        <div style={{marginTop:12,padding:"10px 16px",borderRadius:10,background:"rgba(0,0,0,0.2)",fontSize:12,color:"#94a3b8",lineHeight:1.6}}>
          {t('retirement.neededByAge', {age: nRetAge})} {t('retirement.investedAtRate')}{TAX>0?" ("+t('retirement.netOfTax', {tax: assetTax.toFixed(1)})+")":""}, {t('retirement.itFundsAmt', {amt: fmt(desiredAfterSS)})} {t('retirement.forYrs', {yrs: nYP})}{nSS>0?" ("+t('retirement.afterSSIncome', {amt: fmt(nSS)})+")":""}{nLegacy>0?" "+t('retirement.leavingAmtLegacy', {amt: fmt(nLegacy)}):""}, {t('retirement.reachingAmtAtAge', {amt: nLegacy>0?fmt(nLegacy):"$0", age: nRetAge+nYP})}.
        </div>
        {/* Withdrawal rate selector */}
        <div style={{marginTop:14,marginBottom:14}}>
          <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>{t('retirement.stratDuring')}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
            {hasPortfolio&&<TabBtn active={retProfileIdx===-1} label={t('profiles.myPortfolio.name')} onClick={function(){setRetProfileIdx(-1)}} color="#e879f9"/>}
            {adjProfiles.filter(function(_,i){return i<=4}).map(function(p,i){return <TabBtn key={p.id} active={retProfileIdx===i} iconName={p.icon} label={p.name} onClick={function(){setRetProfileIdx(i)}} color={p.color}/>})}
          </div>
        </div>
        <div style={{marginTop:24,padding:18,borderRadius:14,background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.05)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,textAlign:"center",marginBottom:14}}>
            <div><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{t('retirement.youHave')}</div><div style={{fontSize:19,fontWeight:700,color:"#0f172a"}}>{fmt(nEx)}</div></div>
            <div><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{mD.p>=100?t('retirement.surplus'):t('retirement.youStillNeed')}</div>
              <div style={{fontSize:19,fontWeight:700,color:mD.gc}}>{mD.p>=100?"+"+fmt(mD.sur):fmt(mD.gap)}</div></div>
          </div>
          <div style={{height:10,borderRadius:5,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:5,width:Math.min(mD.p,100)+"%",background:mD.bc,transition:"width 1s"}}/></div>
          <div style={{fontSize:11,marginTop:6,color:mD.gc,fontWeight:600}}>{mD.p>=100?mD.p.toFixed(0)+"% — "+t('retirement.aheadTarget'):mD.p>=60?mD.p.toFixed(1)+"% — "+t('retirement.gettingClose'):mD.p.toFixed(1)+"% — "+t('retirement.letsExplore')}</div>
        </div>
      </div>
    </Cd>

    {/* Conservative Magic Number */}
    {magic.conservative>0&&<Cd style={{padding:"20px 24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,textAlign:"center"}}>
        <div>
          <div style={{fontSize:10,color:"#60a5fa",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t('retirement.investedRetirement')}</div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:24,fontWeight:800,color:"#60a5fa"}}>{fmtC(magic.real)}</div>
          <div style={{fontSize:10,color:"#475569",marginTop:2}}>{retProfLabel} ({pct(retProfReturn)} real)</div>
        </div>
        <div>
          <div style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t('retirement.conservative')}</div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:24,fontWeight:800,color:"#94a3b8"}}>{fmtC(magic.conservative)}</div>
          <div style={{fontSize:10,color:"#475569",marginTop:2}}><Icon name="money" size={11} weight="regular" /> Cash Investor ({pct(magic.conservativeRate)} real)</div>
        </div>
      </div>
      <div style={{marginTop:14,padding:"10px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",lineHeight:1.6,textAlign:"center"}}>
        {t('retirement.investedExplainFull',{profile:retProfLabel})}
        {" "}{t('retirement.conservExplainFull',{diff:fmtC(magic.conservative-magic.real)})}
      </div>
    </Cd>}

    {/* Monthly needed per profile */}
    <Cd><ST tip={t('retirement.extraMonthlyTip')}>{t('retirement.extraMonthly')}</ST>
      {monthlyNeeded.map(function(p){var covered=p.monthly===0;return(
        <div key={p.id} style={{padding:"10px 14px",borderRadius:10,marginBottom:6,background:covered?"rgba(34,197,94,0.04)":"rgba(0,0,0,0.1)",border:covered?"1px solid rgba(34,197,94,0.1)":"1px solid rgba(255,255,255,0.03)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}><Icon name={p.icon} size={14} weight="light"/></span><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{p.name}</span><span style={{fontSize:10,color:"#475569"}}>{pct(p.realReturn)} real</span></div>
            <div style={{textAlign:"right"}}>
              {covered?<span style={{fontSize:14,fontWeight:700,color:"#22c55e"}}><Icon name="check-circle" size={14} weight="regular" /> {t('retirement.covered')}</span>
              :<span style={{fontSize:14,fontWeight:700,color:"#f87171"}}>{fmt(p.monthly)}{t('app.perMonth')}</span>}
            </div>
          </div>
          {!covered&&<div style={{fontSize:10,color:"#f87171",marginTop:3}}><Icon name="warning" size={11} weight="regular" /> {t('retirement.needExtraBeyond',{extra:fmt(p.monthly),current:fmt(mSav)})}</div>}
          {covered&&<div style={{fontSize:10,color:"#22c55e",marginTop:3}}>{t('retirement.surplusMsg',{amt:fmt(p.surplus)})}</div>}
        </div>)})}
    </Cd>

    {/* Year-by-Year Projection */}
    {ybYData.length>0&&<Cd>
      <ST tip={t('retirement.ybyTip')}>{t('retirement.ybyProjection')}</ST>
      {/* Two-phase profile selectors */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:6}}><Icon name="chart-line-up" size={13} weight="regular" /> {t('retirement.accumulation')}</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
          {hasPortfolio&&<TabBtn active={chartProfileIdx===-1} label={t('profiles.myPortfolio.name')} onClick={function(){setChartProfileIdx(-1)}} color="#e879f9"/>}
          {allProfiles.map(function(p,i){return <TabBtn key={p.id} active={chartProfileIdx===i} iconName={p.icon} label={p.name} onClick={function(){setChartProfileIdx(i)}} color={p.color}/>})}
        </div>
        <div style={{fontSize:11,color:chartProfileIdx===-1?"#e879f9":"#93c5fd",marginBottom:12}}>
          {chartProfileIdx===-1&&hasPortfolio?t('retirement.usingPortfolio', {rate: pct(chartAccumReturn)}):t('retirement.usingProfile', {name: (chartProfileIdx>=0?(chartProfileIdx<adjProfiles.length?adjProfiles[chartProfileIdx]:allProfiles[chartProfileIdx]).name:"60/40"), rate: pct(chartAccumReturn)})}
        </div>
        <div style={{fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:6}}><Icon name="umbrella" size={13} weight="regular" /> {t('retirement.retirementPhase')}</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
          {hasPortfolio&&<TabBtn active={chartRetireIdx===-1} label={t('profiles.myPortfolio.name')} onClick={function(){setChartRetireIdx(-1)}} color="#e879f9"/>}
          {adjProfiles.filter(function(_,i){return i<=4}).map(function(p,i){return <TabBtn key={p.id} active={chartRetireIdx===i} iconName={p.icon} label={p.name} onClick={function(){setChartRetireIdx(i)}} color={p.color}/>})}
        </div>
        <div style={{fontSize:11,color:chartRetireIdx===-1?"#e879f9":"#93c5fd"}}>
          {chartRetireIdx===-1&&hasPortfolio?t('retirement.usingPortfolio', {rate: pct(chartRetireReturn)}):t('retirement.usingProfile', {name: adjProfiles[Math.max(chartRetireIdx,0)].name, rate: pct(chartRetireReturn)})}
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <MultiLineChart series={[{data:ybYData.map(function(d){
          var ageNow=nAge||30;var ageAtYear=ageNow+d.year;var totalYrs=ytr+nYP;
          var step=totalYrs>40?10:5;
          var isFirst=d.year===0;var isRetire=d.year===ytr;var isLast=d.year===totalYrs;
          var isTick=d.year%step===0&&d.year>0&&d.year<totalYrs;
          var tooCloseToRetire=Math.abs(d.year-ytr)<(step/2)&&!isRetire;
          const show=(isFirst||isRetire||isLast||(isTick&&!tooCloseToRetire));
          return{l:show?(isFirst?t('app.age')+" "+ageAtYear:isRetire?t('app.at')+" "+ageAtYear:isLast?t('app.age')+" "+ageAtYear:""+ageAtYear):"",v:d.balance}
        }),color:chartProfileIdx===-1?"#e879f9":(chartProfileIdx>=0&&chartProfileIdx<allProfiles.length?allProfiles[chartProfileIdx].color:"#22c55e"),bold:true,fill:true}]} height={160} showYAxis={true}/>
      </div>
      {(function(){
        var retBal=ybYData[ytr]?ybYData[ytr].balance:0;
        var peakV=0,peakY=0;ybYData.forEach(function(d){if(d.balance>peakV){peakV=d.balance;peakY=d.year}});
        var depleteY=null;for(var i=ytr+1;i<ybYData.length;i++){if(ybYData[i].balance<=0){depleteY=i;break}}
        var lastBal=ybYData[ybYData.length-1].balance;
        return(<div style={{display:"grid",gap:6,marginTop:8}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            <div style={{padding:"6px 12px",borderRadius:8,background:"rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>{t('retirement.atRetirement', {age: nAge+ytr})} <strong>{fmtC(retBal)}</strong></div>
            {peakY!==ytr&&<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(167,139,250,0.08)",fontSize:11,color:"#c4b5fd"}}>{t('retirement.peak')} <strong>{fmtC(peakV)}</strong> at age {nAge+peakY}</div>}
          </div>
          <div style={{textAlign:"center"}}>
            {depleteY?<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(239,68,68,0.08)",fontSize:11,color:"#fca5a5",display:"inline-block"}}><Icon name="warning" size={12} weight="regular" /> {t('retirement.moneyRunsOut', {age: nAge+depleteY, n: depleteY-ytr})}</div>
            :<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(34,197,94,0.08)",fontSize:11,color:"#86efac",display:"inline-block"}}><Icon name="check-circle" size={12} weight="regular" /> {t('retirement.moneyLasts', {amt: fmtC(lastBal), age: nAge+ytr+nYP})}</div>}
          </div>
        </div>)})()}
      {/* Debt payoff milestones */}
      {debtEvents.length>0&&<div style={{display:"grid",gap:6,marginTop:12}}>
        {debtEvents.filter(function(ev){return ev.endsAtYear<ytr}).map(function(ev,i){return(
          <div key={i} style={{padding:"8px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#86efac",display:"flex",justifyContent:"space-between"}}>
            <span><Icon name="chart-line-up" size={12} weight="regular" /> {t('retirement.paidOffAt', {name: ev.name, age: nAge+ev.endsAtYear})}</span>
            <span style={{fontWeight:600}}>{t('retirement.savingsBoost', {amt: fmt(ev.monthlyAmount)})}</span>
          </div>)})}
      </div>}
    </Cd>}
  </>}
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === INVESTMENT ALTERNATIVES === */}
{tab==="invest"&&<div className="fi">
  <Cd>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:18}}>
      <div><ST tip={t('achieve.investTip',{mo:fmt(Math.abs(mSav)),sav:fmt(nEx),yrs:projYears})+(debtEvents.length>0?t('achieve.investTipDebt'):"")}>{t('achieve.investTitle')}</ST>
        <p style={{fontSize:13,color:"#64748b",marginTop:-16}}>{mSav>=0?fmt(mSav)+"/mo + "+fmt(nEx)+" "+t('invest.savings'):fmt(nEx)+" "+t('invest.savings')+" "+fmt(mSav)+"/mo"} → {t('invest.portfolioIn')} {projYears} {t('app.years')} <span style={{fontSize:11,color:"#475569"}}>{showNom?"("+t('achieve.nominalFuture')+")":"("+t('achieve.todaysDInfl')+")"}</span></p></div>
      <div style={{display:"flex",background:"rgba(15,23,42,0.06)",borderRadius:10,padding:3,border:"1px solid rgba(15,23,42,0.08)"}}>
        <button onClick={function(){setShowNom(false)}} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",border:"none",cursor:"pointer",background:!showNom?"rgba(34,197,94,0.15)":"transparent",color:!showNom?"#22c55e":"#64748b"}}>{t('achieve.todaysD')}</button>
        <button onClick={function(){setShowNom(true)}} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",border:"none",cursor:"pointer",background:showNom?"rgba(96,165,250,0.15)":"transparent",color:showNom?"#60a5fa":"#64748b"}}>{t('achieve.nominalD')}</button>
      </div>
    </div>
    <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",marginBottom:16}}>
      <Icon name="ruler" size={12} weight="regular" /> {t('achieve.illustrativeProj')} (<span style={{cursor:"pointer",textDecoration:"underline"}} onClick={function(){goTab("portfolio")}}>{t('achieve.yourPortfolio')}</span>).
    </div>
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      {[5,10,20,30,40,50].map(function(y){return <TabBtn key={y} active={projYears===y} label={y+(lang==="en"?" yr":" a")} onClick={function(){setProjYears(y)}}/>})}
    </div>
    {projs.map(function(p,i){var v=showNom?p.nFV:p.rFV,bp=maxProj>0?(v/maxProj)*100:0,g=v-p.tc;return(
      <div key={p.id} style={{padding:"10px 12px",borderRadius:10,marginBottom:4}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:17}}><Icon name={p.icon} size={14} weight="light"/></span><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{p.name}</span><Tip text={p.desc}/></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:700,color:p.color}}>{fmtC(v)}</div><div style={{fontSize:10,color:g>0?"#4ade80":g<0?"#f87171":"#64748b"}}>{g>0?"↑ "+fmtC(g)+" "+t('invest.gain'):g<0?"↓ "+fmtC(Math.abs(g))+" "+t('invest.lostToInflation'):t('invest.noGain')}</div></div></div>
        <div style={{height:18,borderRadius:6,overflow:"hidden",background:"rgba(255,255,255,0.03)"}}><div className="ba" style={{height:"100%",borderRadius:6,width:Math.max(bp,2)+"%",background:"linear-gradient(90deg,"+p.color+"88,"+p.color+")",animationDelay:i*0.07+"s"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:10}}><span><span style={{color:p.color}}>{pct(p.nomReturn)} {t('common.nom')}</span> · <span style={{color:"#22c55e"}}>{pct(p.realReturn)} {t('common.real')}</span>{p.vol>0?<span style={{color:"#f59e0b"}}> · ~{Math.round(p.vol*100)}% {t('common.vol')}</span>:""}</span><span style={{color:"#64748b"}}>{t('invest.netInvested')} {fmtC(p.tc)}</span></div>
      </div>)})}
    <div style={{marginTop:10,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",textAlign:"center",lineHeight:1.5}}>{t('invest.allValuesDisclaimer',{todayDollar:t('common.todayDollar')})}</div>
  </Cd>

  {/* Custom return */}
  <Cd style={{padding:20}}>
    <NI label={t('invest.customReturn')} value={customReturn} onChange={setCustomReturn} prefix="" placeholder="" suffix="%" tip={t('invest.customReturnTip')} style={{marginBottom:0}}/>
  </Cd>

  {/* Inflation reference */}
  <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
    <div style={{padding:"6px 14px",borderRadius:8,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#92400e"}}>
      {t('invest.inflation')} <strong>{(INFL*100).toFixed(1)}%</strong>{customInflation!==2.5?" "+t('invest.custom'):""} · <span style={{color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("assumptions")}}>{t('invest.changeInAssumptions')}</span>
    </div>
  </div>

  {/* Scenarios */}
  <Cd>
    <Toggle value={showScenarios} onChange={setShowScenarios} label={showScenarios?t('invest.scenarios'):t('invest.showScenarios')} sub={t('invest.scenariosSub')}/>
    {showScenarios&&<>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:8,marginBottom:12}}>
        {hasPortfolio&&<TabBtn active={scenProfileIdx===-1} label={t('invest.myPortfolio')} onClick={function(){setScenProfileIdx(-1)}} color="#e879f9"/>}
        {allProfiles.map(function(p,i){return <TabBtn key={p.id} active={scenProfileIdx===i} iconName={p.icon} label={p.name} onClick={function(){setScenProfileIdx(i)}} color={p.color}/>})}
      </div>
    </>}
    {scenarios&&<div style={{marginTop:4}}>
      <MultiLineChart series={scenarios} height={150} showYAxis={true}/>
      <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:12}}>
        {scenarios.map(function(s){var last=s.data[s.data.length-1];return(
          <div key={s.name} style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:s.color,fontWeight:600}}>{s.name}</div>
            <div style={{fontSize:14,fontWeight:700,color:s.color}}>{fmtC(last.v)}</div>
          </div>)})}
      </div>
      <div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.1)",fontSize:12,color:"#93c5fd",lineHeight:1.6,textAlign:"center"}}>
        <Icon name="ruler" size={12} weight="regular" /> {t('invest.scenariosDisclaimer',{todayDollar:t('common.todayDollar'),profile:scenProfileIdx===-1&&hasPortfolio?t('invest.myPortfolio'):((allProfiles[Math.min(scenProfileIdx,allProfiles.length-1)]||allProfiles[5]).name),rate:pct(scenProfileIdx===-1&&blendedPortReturn!=null?blendedPortReturn:(allProfiles[Math.min(scenProfileIdx,allProfiles.length-1)]||allProfiles[5]).realReturn),debtBoost:debtEvents.length>0?t('invest.includesDebtBoost'):""})}
      </div>
    </div>}
  </Cd>

  {/* Cost of Not Investing Today (year by year) */}
  {costNS&&<Cd glow="orange" style={{padding:"28px 24px"}}>
    <div style={{fontSize:11,fontWeight:600,color:"#b45309",textTransform:"uppercase",letterSpacing:3,marginBottom:4,textAlign:"center"}}>{t('inaction.costOfNotInvesting')}</div>
    <div style={{fontSize:12,color:"#d97706",textAlign:"center",marginBottom:10}}>{t('inaction.whatHappens20yr')}</div>
    <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center",marginBottom:14}}>
      {hasPortfolio&&<TabBtn active={costNSProfileIdx===-1} label={t('invest.myPortfolio')} onClick={function(){setCostNSProfileIdx(-1)}} color="#e879f9"/>}
      {allProfiles.filter(function(_,i){return i>=1}).map(function(p,i){var idx=i+1;return <TabBtn key={p.id} active={costNSProfileIdx===idx} iconName={p.icon} label={p.name} onClick={function(){setCostNSProfileIdx(idx)}} color={p.color}/>})}
    </div>
    <div style={{overflowX:"auto"}}>
      <div style={{display:"flex",gap:6,minWidth:"max-content",paddingBottom:8}}>
        {costNS.map(function(d){var maxV=costNS[0].total;var bp=maxV>0?d.total/maxV*100:0;return(
          <div key={d.wait} style={{width:54,textAlign:"center"}}>
            <div style={{fontSize:10,color:"#f59e0b",fontWeight:600,marginBottom:4}}>{fmtC(d.total)}</div>
            <div style={{height:80,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
              <div style={{width:28,borderRadius:"4px 4px 0 0",background:d.wait===0?"linear-gradient(180deg,#22c55e,#16a34a)":"linear-gradient(180deg,#f59e0b88,#f59e0b)",height:Math.max(bp,5)+"%",transition:"height 0.5s"}}/>
            </div>
            <div style={{fontSize:9,color:"#64748b",marginTop:4}}>{d.wait===0?t('inaction.now'):t('inaction.waitYr',{n:d.wait})}</div>
            {d.lost>0&&<div style={{fontSize:9,color:"#ef4444"}}>-{fmtC(d.lost)}</div>}
          </div>)})}
      </div>
    </div>
    <div style={{marginTop:12,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",textAlign:"center",lineHeight:1.5}}>
      {t('inaction.allTodayDollars',{profile:costNSProfileIdx===-1&&hasPortfolio?t('profiles.myPortfolio.name'):(allProfiles[costNSProfileIdx]||adjProfiles[4]).name,rate:pct(costNSReturn)})+" "+t('inaction.waiting5yr',{amt:fmtC(costNS.length>5?costNS[5].lost:0)})}
    </div>
  </Cd>}

  {magic.real>0&&<Cd glow="blue" style={{textAlign:"center",padding:"28px 24px"}}>
    <div style={{fontSize:10,color:"#3b82f6",textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>{t('retirement.yourMN')}</div>
    <div style={{fontFamily:"Outfit,sans-serif",fontSize:26,fontWeight:800,color:"#60a5fa",marginBottom:12}}>{fmt(magic.real)}</div>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.6,maxWidth:440,margin:"0 auto 16px"}}>{t('common.inYrWith6040',{years:projYears})+" "}<strong style={{color:"#22c55e"}}>{fmtC(projs[4].rFV)}</strong>{'. '}{projs[4].rFV<magic.real?((projs[4].rFV/magic.real)*100).toFixed(0)+"% "+t('common.ofTarget'):t('common.youdSurpass')}</p>
  </Cd>}
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === PORTFOLIO === */}
{tab==="portfolio"&&<div className="fi">
  <Cd><ST tip={t('portfolio.tip')} sub={t('portfolio.sub')}>{t('portfolio.title')}</ST>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:14,fontWeight:600,color:"#0f172a",marginBottom:12}}>{t('portfolio.sectionA')} ({fmt(nEx)})</div>
      {allProfiles.map(function(p,i){return(<div key={p.id}>
        <Slider iconName={p.icon} label={p.name} value={portAlloc[i]||0} onChange={function(v){updatePortAlloc(i,v)}} min={0} max={100} step={5}
          format={function(v){return v+"%"}} color={p.color}/>
        <div style={{fontSize:9,marginTop:-8,marginBottom:8,paddingLeft:4}}><span style={{color:p.color}}>{pct(p.nomReturn)} {t('common.nom')}</span> <span style={{color:"#22c55e"}}>{pct(p.realReturn)} {t('common.real')}</span>{p.vol>0?<span style={{color:"#f59e0b"}}> ~{Math.round(p.vol*100)}% {t('common.vol')}</span>:""}</div>
      </div>)})}
      <div style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.2)",marginTop:8}}>
        <span style={{fontSize:12,color:"#94a3b8"}}>{t('portfolio.totalAllocated')}</span>
        <span style={{fontSize:14,fontWeight:700,color:portAlloc.reduce(function(s,v){return s+v},0)===100?"#22c55e":"#ef4444"}}>{portAlloc.reduce(function(s,v){return s+v},0)}%</span>
      </div>
      {portAlloc.reduce(function(s,v){return s+v},0)===100&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",marginTop:8,fontSize:12,color:"#86efac"}}>
        {t('app.weightedReturn')} <strong>{pct(portReturn.nom)}</strong> {t('app.nominal')} / <strong>{pct(portReturn.real)}</strong> {t('common.real')}
      </div>}
    </div>

    <div style={{marginBottom:24}}>
      <div style={{fontSize:14,fontWeight:600,color:"#0f172a",marginBottom:4}}>{t('portfolio.sectionB')} ({fmt(mSav)})</div>
      <div style={{fontSize:11,color:"#64748b",marginBottom:12}}>{mSav<0?t('portfolio.drainingNote'):t('portfolio.canDiffer')}</div>
      {allProfiles.map(function(p,i){return(<div key={p.id}>
        <Slider iconName={p.icon} label={p.name} value={portContribAlloc[i]||0} onChange={function(v){updateContribAlloc(i,v)}} min={0} max={100} step={5}
          format={function(v){return v+"%"}} color={p.color}/>
        <div style={{fontSize:9,marginTop:-8,marginBottom:8,paddingLeft:4}}><span style={{color:p.color}}>{pct(p.nomReturn)} {t('common.nom')}</span> <span style={{color:"#22c55e"}}>{pct(p.realReturn)} {t('common.real')}</span>{p.vol>0?<span style={{color:"#f59e0b"}}> ~{Math.round(p.vol*100)}% {t('common.vol')}</span>:""}</div>
      </div>)})}
      <div style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.2)",marginTop:8}}>
        <span style={{fontSize:12,color:"#94a3b8"}}>{t('portfolio.totalAllocated')}</span>
        <span style={{fontSize:14,fontWeight:700,color:portContribAlloc.reduce(function(s,v){return s+v},0)===100?"#22c55e":"#ef4444"}}>{portContribAlloc.reduce(function(s,v){return s+v},0)}%</span>
      </div>
      {portContribAlloc.reduce(function(s,v){return s+v},0)===100&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",marginTop:8,fontSize:12,color:"#86efac"}}>
        {t('app.weightedReturn')} <strong>{pct(portContribReturn.nom)}</strong> {t('common.nom')} / <strong>{pct(portContribReturn.real)}</strong> {t('common.real')}
      </div>}
    </div>
  </Cd>
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === YOUR MAGIC NUMBER === */}
{tab==="achieve"&&<div className="fi">
  <Cd style={{textAlign:"center",padding:"24px 20px"}}>
    <div style={{fontSize:36,marginBottom:10}}><Icon name="crosshair" size={36} weight="regular" color="#60a5fa" /></div>
    <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:"#0f172a",marginBottom:8}}>{t('achieve.title')}</h2>
    <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.7,maxWidth:440,margin:"0 auto"}}>
      {t('achieve.intro', {q: q})}
    </p>
  </Cd>
  <Cd><ST sub={t('achieve.essentialsSub')}>{t('achieve.essentials')}</ST>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <NI label={t('achieve.yourAge')} value={age} onChange={setAge} prefix="" min={16} max={99} tip={t('achieve.yourAgeTip')}/>
      <NI label={t('achieve.retAge')} value={retirementAge} onChange={setRetirementAge} prefix="" tip={t('achieve.retAgeTip')}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <NI label={t('achieve.yearsInRet')} value={yearsPostRet} onChange={setYearsPostRet} prefix="" tip={t('achieve.yearsInRetTip')}/>
      <NI label={t('achieve.desiredIncome')} value={desiredIncome} onChange={setDesiredIncome} tip={t('achieve.desiredIncomeTip')}/>
    </div>
    <NI label={t('achieve.otherRetIncome')} value={socialSecurity} onChange={setSocialSecurity} tip={t('achieve.otherRetIncomeTip')}/>
    {nSSRaw>0&&ytr>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",marginBottom:12}}>{fmt(nSSRaw)}/mo {t('retirement.atRetirement')} = <strong>{fmt(nSS)}/mo {t('retirement.todayDollar')}</strong> <span style={{color:"#475569"}}>({t('retirement.inflAdjusted', {y: ytr})})</span></div>}
    <NI label={t('achieve.currentSavings')} value={existingSavings} onChange={setExistingSavings} tip={t('achieve.currentSavingsTip')}/>
    <NI label={t('achieve.estMonthlySav')} value={manualMonthlySav} onChange={setManualMonthlySav} tip={t('achieve.estMonthlySavTip')}/>
    {hasIncomeData&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#86efac",marginBottom:12}}><Icon name="check-circle" size={12} weight="regular" /> {t('achieve.actualSavFromIncome')}: <strong>{fmt(mSavComputed)}/mo</strong> — {t('achieve.overridesEstimate')}.</div>}
    <NI label={t('achieve.legacy')} value={legacy} onChange={setLegacy} tip={t('achieve.legacyTip')}/>
    <div style={{marginTop:8,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{t('achieve.annualAssetTax')}</span>
        <span style={{fontSize:15,fontWeight:700,color:assetTax>0?"#f59e0b":"#64748b"}}>{assetTax.toFixed(1)}%</span>
      </div>
      <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>{t('achieve.assetTaxTip')}</div>
      <Slider label="" value={assetTax} onChange={setAssetTax} min={0} max={3} step={0.1} format={function(v){return v.toFixed(1)+"%"}} color="#f59e0b"/>
      {assetTax>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:11,color:"#92400e",marginTop:4}}>
        <Icon name="warning" size={12} weight="regular" /> {t('achieve.assetTaxExplain',{tax:assetTax.toFixed(1)})}
      </div>}
    </div>
    {nAge>0&&nRetAge>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}><div style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>{ytr>0?t('achieve.yearsToGo',{n:ytr}):t('achieve.atRetirement')}</div>{nYP>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>{t('achieve.planToAge',{age:nRetAge+nYP})}</div>}{mSav>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#86efac"}}>{hasIncomeData?t('achieve.savingActual',{amt:fmt(mSav)}):t('achieve.savingEstimate',{amt:fmt(mSav)})}</div>}</div>}
  </Cd>
  {magic.real>0&&ytr>0&&nEx>=0&&(mSav>0||nEx>0)?<>
    {/* FREE TIER: Range ±20% + Email CTA */}
    {tier==="free"&&<>
    <Cd glow="blue" style={{textAlign:"center",padding:"40px 24px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"relative"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#60a5fa",textTransform:"uppercase",letterSpacing:3,marginBottom:10}}>{t('achieve.yourMN')}</div>
        <div style={{fontFamily:"Outfit,sans-serif",fontSize:16,fontWeight:600,color:"#94a3b8",marginBottom:8}}>{lang==="en"?"Your Magic Number is between":"Tu Magic Number está entre"}</div>
        <div style={{fontFamily:"Outfit,sans-serif",fontSize:36,fontWeight:900,color:"#60a5fa",lineHeight:1.2,marginBottom:4}}>{fmt(Math.round(magic.real*0.8))}</div>
        <div style={{fontSize:16,fontWeight:700,color:"#94a3b8",margin:"4px 0"}}>{lang==="en"?"and":"y"}</div>
        <div style={{fontFamily:"Outfit,sans-serif",fontSize:36,fontWeight:900,color:"#60a5fa",lineHeight:1.2,marginBottom:12}}>{fmt(Math.round(magic.real*1.2))}</div>
        <div style={{padding:"10px 16px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.10)",fontSize:13,color:"#334155",lineHeight:1.6}}>
          {lang==="en"?"Accumulating this capital by age "+nRetAge+", you secure "+fmt(desiredAfterSS)+"/mo for "+nYP+" years of retirement."+(nLegacy>0?" Plus "+fmt(nLegacy)+" in legacy.":""):"Juntando este capital a tus "+nRetAge+" años, te asegurás "+fmt(desiredAfterSS)+" extra por mes durante "+nYP+" años."+(nLegacy>0?" Y aún te sobran "+fmt(nLegacy)+" de herencia.":"")}
        </div>
      </div>
    </Cd>
    <Cd glow="gold" style={{textAlign:"center",padding:"32px 24px"}}>
      <div style={{fontSize:28,marginBottom:10}}><Icon name="lock-open" size={28} weight="regular" color="#eab308" /></div>
      <div style={{fontFamily:"Outfit,sans-serif",fontSize:20,fontWeight:800,color:"#0f172a",marginBottom:8}}>{lang==="en"?"Want your exact Magic Number?":"¿Querés conocer tu Magic Number exacto?"}</div>
      <p style={{fontSize:14,color:"#64748b",lineHeight:1.6,maxWidth:380,margin:"0 auto 20px"}}>{lang==="en"?"Enter your email and we'll reveal your precise number — plus send you a personalized PDF report.":"Dejá tu email y te revelamos tu número preciso — además te enviamos un informe PDF personalizado."}</p>
      <div style={{display:"flex",gap:8,maxWidth:400,margin:"0 auto"}}>
        <input type="email" value={userEmail} onChange={function(e){setUserEmail(e.target.value);setEmailError("")}} placeholder={lang==="en"?"your@email.com":"tu@email.com"} style={{flex:1,padding:"14px 16px",borderRadius:12,border:"1px solid "+(emailError?"#ef4444":"rgba(96,165,250,0.2)"),background:"#fff",fontSize:14,fontFamily:"Inter,sans-serif",outline:"none",transition:"border 0.2s"}}/>
        <button onClick={function(){var re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;if(!re.test(userEmail)){setEmailError(lang==="en"?"Enter a valid email":"Ingresá un email válido");return}setTier("email");setEmailError("")}} className="bp" style={{padding:"14px 24px",fontSize:14,fontWeight:700,whiteSpace:"nowrap"}}>{lang==="en"?"Reveal":"Revelar"} →</button>
      </div>
      {emailError&&<div style={{color:"#ef4444",fontSize:12,marginTop:6}}>{emailError}</div>}
      <div style={{fontSize:11,color:"#94a3b8",marginTop:10}}><Icon name="lock" size={11} weight="regular" /> {lang==="en"?"We won't share your email. No spam, ever.":"No compartimos tu email. Sin spam, nunca."}</div>
    </Cd>
    <AdvisorCTA/>
    </>}
    {/* EMAIL/PAID TIER: Exact number + full analysis */}
    {tier!=="free"&&<>
    <Cd glow="blue" style={{textAlign:"center",padding:"40px 24px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/><div style={{position:"relative"}}><div style={{fontSize:12,fontWeight:600,color:"#60a5fa",textTransform:"uppercase",letterSpacing:3,marginBottom:10}}>{t('achieve.yourMN')}</div><div style={{fontFamily:"Outfit,sans-serif",fontSize:50,fontWeight:900,color:"#60a5fa",lineHeight:1.1,marginBottom:12,textShadow:"0 0 40px rgba(96,165,250,0.3),0 0 80px rgba(96,165,250,0.15)"}}>{fmt(Math.round(magic.real))}</div><div style={{padding:"10px 16px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.10)",fontSize:13,color:"#334155",lineHeight:1.6}}>{lang==="en"?"Accumulating "+fmt(Math.round(magic.real))+" by age "+nRetAge+", you secure "+fmt(desiredAfterSS)+"/mo for "+nYP+" years."+(nSS>0?" (after "+fmt(nSS)+"/mo retirement income)":"")+(nLegacy>0?" Plus "+fmt(nLegacy)+" legacy.":"")+" Lasting until age "+(nRetAge+nYP)+".":"Juntando "+fmt(Math.round(magic.real))+" a tus "+nRetAge+" años, te asegurás "+fmt(desiredAfterSS)+" extra por mes durante "+nYP+" años."+(nSS>0?" (además de "+fmt(nSS)+"/mes de jubilación)":"")+(nLegacy>0?" Y aún te sobran "+fmt(nLegacy)+" de herencia.":"")+" Hasta los "+(nRetAge+nYP)+" años."}</div></div></Cd>
    <Cd><ST sub={t('achieve.threeLeversSub')}>{t('achieve.threeLevers')}</ST>
      <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="currency-dollar" size={14} weight="regular" /> {t('achieve.startingSavings')}</span><span style={{fontSize:15,fontWeight:700,color:"#60a5fa"}}>{fmt(simEffSav)}</span></div><Slider label="" value={simSav!=null?simSav:nEx} onChange={function(v){setSimSav(v)}} min={0} max={Math.max(nEx*3,500000)} step={10000} format={function(v){return fmtC(v)}} color="#60a5fa"/>{simSav!=null&&simSav!==nEx&&<div style={{fontSize:10,color:"#93c5fd",marginTop:-4}}>{t('achieve.actual')}: {fmt(nEx)} · {t('achieve.simulating')}: {fmt(simSav)}</div>}</div>
      <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="calendar" size={14} weight="regular" /> {t('achieve.monthlySavings')}</span><span style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>{fmt(simEffMo)}/mo</span></div><Slider label="" value={simMo!=null?simMo:Math.max(mSav,0)} onChange={function(v){setSimMo(v)}} min={0} max={Math.max(mSav*3,10000)} step={100} format={function(v){return fmt(v)}} color="#22c55e"/>{simMo!=null&&simMo!==Math.max(mSav,0)&&<div style={{fontSize:10,color:"#86efac",marginTop:-4}}>{t('achieve.actual')}: {fmt(Math.max(mSav,0))}/mo · {t('achieve.simulating')}: {fmt(simMo)}/mo</div>}</div>
      <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="chart-line-up" size={14} weight="regular" /> {t('achieve.annualRealReturn')}</span><span style={{fontSize:15,fontWeight:700,color:"#f59e0b"}}>{(simEffRet*100).toFixed(1)}%</span></div><Slider label="" value={simRet!=null?simRet:(simEffRet*100)} onChange={function(v){setSimRet(v)}} min={0} max={12} step={0.1} format={function(v){return v.toFixed(1)+"%"}} color="#f59e0b"/><div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>{adjProfiles.filter(function(_,i){return i>=1}).map(function(p){return <TabBtn key={p.id} active={Math.abs(simEffRet-p.realReturn)<0.001} iconName={p.icon} label={p.name+" "+pct(p.realReturn)} onClick={function(){setSimRet(p.realReturn*100)}} color={p.color}/>})}</div></div>
      {simSav!=null||simMo!=null||simRet!=null?<div style={{textAlign:"center",marginBottom:12}}><button onClick={function(){setSimSav(null);setSimMo(null);setSimRet(null)}} style={{background:"rgba(15,23,42,0.06)",color:"#64748b",border:"1px solid rgba(255,255,255,0.08)",padding:"8px 20px",borderRadius:10,fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer"}}>↩ {t('achieve.resetToActual')}</button></div>:null}
    </Cd>
    <Cd glow={simProjected>=magic.real?"green":"red"} style={{textAlign:"center",padding:"28px 24px"}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:simProjected>=magic.real?"#22c55e":"#ef4444",marginBottom:6}}>{t('achieve.projectedAt', {age: nRetAge})}</div><div style={{fontFamily:"Outfit,sans-serif",fontSize:40,fontWeight:900,color:simProjected>=magic.real?"#22c55e":"#f87171"}}>{fmtC(simProjected)}</div><div style={{marginTop:16,padding:14,borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)"}}><div style={{height:10,borderRadius:5,background:"rgba(0,0,0,0.04)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:5,width:Math.min(simPct,100)+"%",background:simPct>=100?"linear-gradient(90deg,#22c55e,#4ade80)":simPct>=60?"linear-gradient(90deg,#eab308,#facc15)":"linear-gradient(90deg,#ef4444,#f87171)",transition:"width 0.5s"}}/></div><div style={{fontSize:13,fontWeight:700,marginTop:6,color:simPct>=100?"#22c55e":simPct>=60?"#eab308":"#ef4444"}}>{lang==="en"?"You're at "+simPct.toFixed(1)+"% of your goal. Adjust the levers above to reach "+fmtC(magic.real)+".":"Estás al "+simPct.toFixed(1)+"% de tu meta. Ajustá tus números arriba para llegar a "+fmtC(magic.real)+"."}</div></div></Cd>
    {simGap>0&&<Cd><ST sub={t('achieve.gapSub')}>{t('achieve.howToCloseGap')}</ST><div style={{display:"grid",gap:12}}>{simNeededReturn!=null?<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(245,158,11,0.04)",border:"1px solid rgba(245,158,11,0.1)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:600,color:"#92400e"}}>A. {t('achieve.higherReturn')}</span><span style={{fontSize:16,fontWeight:800,color:"#f59e0b"}}>{(simNeededReturn*100).toFixed(1)}%</span></div><div style={{fontSize:12,color:"#94a3b8"}}>{t('achieve.higherReturnExplain', {rate: (simNeededReturn*100).toFixed(1)})}{(function(){var m=adjProfiles.find(function(p){return Math.abs(p.realReturn-simNeededReturn)<0.008});return m?" ≈ "+m.icon+" "+m.name:""})()}</div></div>:<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.1)"}}><div style={{fontSize:13,fontWeight:600,color:"#fca5a5"}}>A. {t('achieve.returnAloneWontWork')}</div></div>}{simNeededMonthly!=null&&<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.1)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:600,color:"#86efac"}}>B. {t('achieve.saveMore')}</span><span style={{fontSize:16,fontWeight:800,color:"#22c55e"}}>{fmt(simNeededMonthly)}/mo</span></div><div style={{fontSize:12,color:"#94a3b8"}}>{t('achieve.atSimEffRet', {rate: (simEffRet*100).toFixed(1)})}{simNeededMonthly>simEffMo?" — "+t('achieve.morePerMonth', {amt: fmt(simNeededMonthly-simEffMo)}):""}</div></div>}{simNeededMonthly!=null&&<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)"}}><div style={{fontSize:13,fontWeight:600,color:"#93c5fd",marginBottom:6}}>C. {t('achieve.combineBoth')}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>{(function(){var maxPR=adjProfiles[adjProfiles.length-1].realReturn;var baseR=simNeededReturn!=null?simNeededReturn:maxPR;var midR=simEffRet+(baseR-simEffRet)*0.5;if(midR<=simEffRet)midR=simEffRet+(maxPR-simEffRet)*0.5;var lo=0,hi=50000;for(var i=0;i<30;i++){var mid=(lo+hi)/2;if(fvVariable(simEffSav,mid,midR,ytr,debtEvents)<magic.real)lo=mid;else hi=mid}return[{l:t('achieve.higherReturn'),v:(midR*100).toFixed(1)+"%",c:"#f59e0b"},{l:t('achieve.saveMore'),v:fmt((lo+hi)/2)+"/mo",c:"#22c55e"}].map(function(s){return <div key={s.l} style={{padding:"10px 12px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",textAlign:"center"}}><div style={{fontSize:10,color:"#64748b"}}>{s.l}</div><div style={{fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div></div>})})()}</div></div>}</div></Cd>}
    {simGap<=0&&<Cd glow="green" style={{padding:"20px 24px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:"#22c55e",marginBottom:8}}><Icon name="confetti" size={16} weight="regular" /> {t('achieve.onTrack')}</div><div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>{t('achieve.surpassMN', {amt: fmtC(simProjected-magic.real)})}</div></Cd>}
    <AdvisorCTA msg={simGap>0?t('advisor.helpClosingGap'):t('advisor.protectPlan')}/>
    {tier==="email"&&<Cd glow="gold" style={{textAlign:"center",padding:"28px 24px"}}>
      <div style={{fontSize:28,marginBottom:10}}><Icon name="star" size={28} weight="fill" color="#eab308" /></div>
      <div style={{fontFamily:"Outfit,sans-serif",fontSize:18,fontWeight:800,color:"#0f172a",marginBottom:8}}>{lang==="en"?"Unlock your Full Profile":"Desbloqueá tu Perfil Full"}</div>
      <p style={{fontSize:13,color:"#64748b",lineHeight:1.6,marginBottom:16}}>{lang==="en"?"Get your complete financial analysis: detailed gap analysis, exact retirement age, year-by-year projections, and a premium PDF report.":"Obtené tu análisis financiero completo: brecha detallada, edad exacta de jubilación, proyecciones año por año, e informe PDF premium."}</p>
      <button className="bp" style={{padding:"14px 32px",fontSize:16,fontWeight:700}} onClick={function(){alert(lang==="en"?"Stripe integration coming soon! Price: $14.99":"¡Integración con Stripe próximamente! Precio: $14.99")}}>{lang==="en"?"Unlock Full Profile — $14.99":"Desbloquear Perfil Full — $14.99"}</button>
    </Cd>}
    </>}
  </>:<Cd style={{textAlign:"center",padding:"24px 20px"}}><div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6}}>{t('achieve.fillFields')}</div></Cd>}


  {/* === REVERSE CALCULATOR === */}
  {nAge>0&&<>
  <Cd style={{marginTop:24,borderTop:"2px solid rgba(96,165,250,0.15)",paddingTop:28}}>
    <div style={{textAlign:"center",marginBottom:20}}>
      <div style={{fontSize:28,marginBottom:8}}><Icon name="calendar" size={28} weight="regular" color="#60a5fa" /></div>
      <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:20,fontWeight:700,color:"#0f172a",marginBottom:6}}>{t('achieve.whenCanIRetire')}</h2>
      <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.6,maxWidth:400,margin:"0 auto"}}>
        {t('achieve.reverseIntro')}
      </p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <NI label={t('achieve.desiredIncome')} value={revDes} onChange={setRevDes} placeholder={nDes>0?nDes.toLocaleString("en-US"):""} tip={t('achieve.desiredIncomeTip')}/>
      <NI label={t('achieve.yearsInRetirement')} value={revYrs} onChange={setRevYrs} prefix="" placeholder={nYP>0?String(nYP):""} tip={t('achieve.yearsInRetTip')}/>
    </div>
    <NI label={t('achieve.otherRetIncome')} value={revSS} onChange={setRevSS} placeholder={nSSRaw>0?nSSRaw.toLocaleString("en-US"):""} tip={t('achieve.otherRetIncomeTip')}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <NI label={t('achieve.revCurrentSavings')} value={revSav} onChange={setRevSav} placeholder={nEx>0?nEx.toLocaleString("en-US"):""} tip={t('achieve.revCurrentSavingsTip')}/>
      <NI label={t('achieve.revMonthlySavings')} value={revMo} onChange={setRevMo} placeholder={mSav>0?Math.round(mSav).toLocaleString("en-US"):""} tip={t('achieve.revMonthlySavingsTip')}/>
    </div>
    {(revDes===""||revYrs===""||revSav===""||revMo==="")&&(nDes>0||nEx>0)&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",marginBottom:12}}>
      <Icon name="ruler" size={12} weight="regular" /> {t('achieve.revEmptyFieldsNote')}
    </div>}
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{t('achieve.revAccumReturn')}</span>
        <span style={{fontSize:15,fontWeight:700,color:"#f59e0b"}}>{revRet.toFixed(1)}%</span>
      </div>
      <Slider label="" value={revRet} onChange={setRevRet} min={0} max={12} step={0.1} format={function(v){return v.toFixed(1)+"%"}} color="#f59e0b"/>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
        {adjProfiles.filter(function(_,i){return i>=1}).map(function(p){return <TabBtn key={p.id} active={Math.abs(revRet-p.realReturn*100)<0.05} label={p.icon+" "+p.name+" "+pct(p.realReturn)} onClick={function(){setRevRet(p.realReturn*100)}} color={p.color}/>})}
      </div>
    </div>
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>{t('achieve.revInvestStrategy')}</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {adjProfiles.filter(function(_,i){return i<=4}).map(function(p,i){return <TabBtn key={p.id} active={revRetProf===i} iconName={p.icon} label={p.name} onClick={function(){setRevRetProf(i)}} color={p.color}/>})}
      </div>
      <div style={{fontSize:10,color:"#93c5fd",marginTop:4}}>{t('achieve.revAtRealDuring',{name:adjProfiles[revRetProf].name,rate:pct(adjProfiles[revRetProf].realReturn)})}</div>
    </div>
    {(nLegacy>0||TAX>0)&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
      {nLegacy>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>{t('achieve.revLegacyFrom',{amt:fmt(nLegacy)})}</div>}
      {TAX>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.08)",fontSize:11,color:"#92400e"}}>{t('achieve.revTaxFrom',{rate:assetTax.toFixed(1)})}</div>}
    </div>}
  </Cd>

  {revResult&&<Cd glow={revResult.age?"green":"red"} style={{textAlign:"center",padding:"28px 24px"}}>
    {revResult.age?<>
      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"#22c55e",marginBottom:6}}>{t('achieve.youCanRetireAt')}</div>
      <div style={{fontFamily:"Outfit,sans-serif",fontSize:56,fontWeight:900,color:"#22c55e",lineHeight:1,marginBottom:4}}>{t('app.age')} {revResult.age}</div>
      <div style={{fontSize:13,color:"#94a3b8",marginTop:8,lineHeight:1.6}}>
        {t('achieve.revInYears',{years:revResult.yrsToRetire,projected:fmtC(revResult.projected),mn:fmtC(revResult.mn)})}{nLegacy>0?" "+t('achieve.revIncludesLegacy',{amt:fmt(nLegacy)}):""}{revResult.surplus>0?" "+t('achieve.revSurplus',{amt:fmtC(revResult.surplus)}):""}.{"\n"}
      </div>
      {revResult.ssToday>0&&<div style={{fontSize:11,color:"#93c5fd",marginTop:8}}>
        {t('achieve.revSSIncome',{future:fmt(Number(revSS)),today:fmt(revResult.ssToday),age:revResult.age})}
      </div>}
      {TAX>0&&<div style={{fontSize:11,color:"#92400e",marginTop:4}}>{t('achieve.revTaxNet',{rate:assetTax.toFixed(1)})}</div>}
      <div style={{marginTop:16,padding:14,borderRadius:12,background:"rgba(0,0,0,0.2)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div><div style={{fontSize:10,color:"#64748b"}}>{t('achieve.retireAt')}</div><div style={{fontSize:18,fontWeight:700,color:"#22c55e"}}>{revResult.age}</div></div>
          <div><div style={{fontSize:10,color:"#64748b"}}>{t('achieve.savingsThen')}</div><div style={{fontSize:18,fontWeight:700,color:"#60a5fa"}}>{fmtC(revResult.projected)}</div></div>
          <div><div style={{fontSize:10,color:"#64748b"}}>{t('achieve.yourMN')}</div><div style={{fontSize:18,fontWeight:700,color:"#0f172a"}}>{fmtC(revResult.mn)}</div></div>
        </div>
      </div>
    </>:<>
      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"#ef4444",marginBottom:6}}>{t('achieve.cannotRetireBy100')}</div>
      <div style={{fontSize:13,color:"#fca5a5",lineHeight:1.6}}>{t('achieve.revCannotRetire')}</div>
    </>}
  </Cd>}
  {revResult&&<AdvisorCTA msg={revResult.age?t('achieve.advisorReality'):t('achieve.advisorHelp')}/>}
  </>}

  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === COST OF INACTION === */}
{tab==="inaction"&&<div className="fi">
  <Cd style={{textAlign:"center",padding:"24px 20px"}}>
    <div style={{fontSize:36,marginBottom:10}}><Icon name="hourglass" size={36} weight="regular" color="#f59e0b" /></div>
    <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:"#0f172a",marginBottom:8}}>{t('inaction.title')}</h2>
    <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.7,maxWidth:440,margin:"0 auto"}}>
      {t('inaction.intro')}
    </p>
  </Cd>

  {(function(){
    var iSav=nEx>0?nEx:100000;
    var iMo=mSav>0?mSav:1000;

    // Section 1: Base vs Investing (selectable base)
    var baseProf=adjProfiles[ciBase]||adjProfiles[0];
    var compareProfs=adjProfiles.filter(function(_,i){return i>ciBase});
    var baseVal=fvVariable(iSav,iMo,baseProf.realReturn,ciH,[]);
    var profVals=compareProfs.map(function(p){
      var v=fvVariable(iSav,iMo,p.realReturn,ciH,[]);
      return{name:p.name,icon:p.icon,color:p.color,val:v,lost:v-baseVal,real:p.realReturn};
    });
    var maxVal=Math.max.apply(null,profVals.map(function(p){return p.val}).concat([baseVal,1]));

    // Section 2: Cost of Delaying (up to 10 years)
    var delayProf=adjProfiles[ciDelayProf]||adjProfiles[5];
    var delays=[0,1,2,3,4,5,6,7,8,9,10];
    var delayVals=delays.map(function(d){
      var yrs=Math.max(ciH-d,0);
      var v=fvVariable(iSav,iMo,delayProf.realReturn,yrs,[]);
      return{delay:d,yrs:yrs,val:v};
    });
    var todayVal=delayVals[0].val;
    var lastDelay=delayVals[delayVals.length-1];

    return(<>
    {/* Interactive inputs */}
    <Cd><ST sub={t('inaction.yourNumbersSub')}>{t('inaction.yourNumbers')}</ST>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:8}}>
        <div style={{flex:1,minWidth:120,padding:"12px 16px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)"}}>
          <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t('inaction.currentSavings')}</div>
          <div style={{fontSize:18,fontWeight:700,color:"#60a5fa"}}>{fmt(iSav)}</div>
        </div>
        <div style={{flex:1,minWidth:120,padding:"12px 16px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.08)"}}>
          <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t('inaction.monthlySavings')}</div>
          <div style={{fontSize:18,fontWeight:700,color:"#22c55e"}}>{fmt(iMo)}/mo</div>
        </div>
      </div>
      {nEx<=0&&mSav<=0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:11,color:"#92400e",marginBottom:8}}><Icon name="warning" size={12} weight="regular" /> {t('inaction.usingDefaults')}</div>}
      <div style={{textAlign:"center"}}><span style={{fontSize:11,color:"#60a5fa",cursor:"pointer",fontWeight:600}} onClick={function(){goTab("achieve")}}>{t('inaction.editInMN')} →</span></div>
    </Cd>

    {/* Section 1: BASE VS INVESTING */}
    <Cd><ST sub={t('inaction.whatYouLose',{savings:fmt(iSav),monthly:fmt(iMo),name:baseProf.name})}>{baseProf.icon} {t('inaction.vsInvesting',{name:baseProf.name})}</ST>
      <div style={{fontSize:11,color:"#94a3b8",marginBottom:12}}>{t('inaction.compareAgainst')}</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:16}}>
        {adjProfiles.filter(function(_,i){return i<=2}).map(function(p,i){return <TabBtn key={p.id} active={ciBase===i} iconName={p.icon} label={p.name} onClick={function(){setCiBase(i)}} color={p.color}/>})}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20,justifyContent:"center"}}>
        {[10,20,30,40].map(function(y){return <TabBtn key={y} active={ciH===y} label={y+t('invest.yrTab')} onClick={function(){setCiH(y)}}/>})}
      </div>

      {/* Base bar */}
      <div style={{marginBottom:12,padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:12,fontWeight:600,color:"#64748b"}}>{baseProf.icon} {baseProf.name} ({pct(baseProf.realReturn)} real)</span>
          <span style={{fontSize:15,fontWeight:700,color:"#64748b"}}>{fmtC(baseVal)}</span>
        </div>
        <div style={{height:24,borderRadius:6,overflow:"hidden",background:"rgba(255,255,255,0.03)"}}>
          <div style={{height:"100%",borderRadius:6,width:Math.max((baseVal/maxVal)*100,2)+"%",background:"linear-gradient(90deg,#475569,#64748b)"}}/>
        </div>
      </div>

      {profVals.length===0?<div style={{textAlign:"center",padding:"20px",color:"#64748b",fontSize:13}}>{t('inaction.noHigherProfiles')}</div>
      :profVals.map(function(p){return(
        <div key={p.name} style={{marginBottom:12,padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.1)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:600,color:"#0f172a"}}><Icon name={p.icon} size={14} weight="light"/> {p.name} <span style={{color:"#475569",fontWeight:400}}>({pct(p.real)} real)</span></span>
            <span style={{fontSize:15,fontWeight:700,color:p.color}}>{fmtC(p.val)}</span>
          </div>
          <div style={{height:24,borderRadius:6,overflow:"hidden",background:"rgba(255,255,255,0.03)",position:"relative"}}>
            <div style={{height:"100%",borderRadius:6,width:Math.max((baseVal/maxVal)*100,2)+"%",background:"linear-gradient(90deg,#475569,#64748b)",position:"absolute"}}/>
            <div className="ba" style={{height:"100%",borderRadius:6,width:Math.max((p.val/maxVal)*100,2)+"%",background:"linear-gradient(90deg,"+p.color+"88,"+p.color+")",position:"relative"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:10,color:"#475569"}}>{t('inaction.gray',{name:baseProf.name})}</span>
            <span style={{fontSize:11,fontWeight:700,color:"#f87171"}}>{t('inaction.lost',{amt:fmtC(p.lost)})}</span>
          </div>
        </div>
      )})}

      {profVals.length>0&&<div style={{padding:"16px 20px",borderRadius:12,background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.1)",textAlign:"center",marginTop:8}}>
        <div style={{fontSize:12,color:"#fca5a5",marginBottom:4}}>{t('inaction.stayingIn',{name:baseProf.icon+" "+baseProf.name,years:ciH})}</div>
        <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.6}}>
          {t('inaction.vsAggressive',{name:profVals[profVals.length-1].icon+" "+profVals[profVals.length-1].name,amt:fmtC(profVals[profVals.length-1].lost)})}
        </div>
      </div>}
    </Cd>

    <AdvisorCTA msg={t('inaction.advisorSavings')}/>

    {/* Section 2: COST OF DELAYING */}
    <Cd><ST sub={t('inaction.priceOfWaitingSub')}>{t('inaction.priceOfWaiting')}</ST>
      <div style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>{t('inaction.whatIfInvestIn',{name:delayProf.icon+" "+delayProf.name})}</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:16}}>
        {adjProfiles.filter(function(_,i){return i>=1}).map(function(p,i){var idx=i+1;return <TabBtn key={p.id} active={ciDelayProf===idx} iconName={p.icon} label={p.name} onClick={function(){setCiDelayProf(idx)}} color={p.color}/>})}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20,justifyContent:"center"}}>
        {[10,20,30,40].map(function(y){return <TabBtn key={y} active={ciH===y} label={y+t('app.yrSuffix')} onClick={function(){setCiH(y)}}/>})}
      </div>

      <div style={{marginBottom:20}}>
        {delayVals.map(function(d){
          var pctOfMax=todayVal>0?(d.val/todayVal)*100:0;
          var lost=todayVal-d.val;
          var isToday=d.delay===0;
          return(
            <div key={d.delay} style={{marginBottom:8,padding:"8px 14px",borderRadius:10,background:isToday?"rgba(34,197,94,0.04)":"rgba(0,0,0,0.1)",border:isToday?"1px solid rgba(34,197,94,0.1)":"1px solid rgba(255,255,255,0.03)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div>
                  <span style={{fontSize:12,fontWeight:600,color:isToday?"#22c55e":"#0f172a"}}>{isToday?t('inaction.startToday'):t('inaction.waitYr',{n:d.delay})}</span>
                  <span style={{fontSize:10,color:"#475569",marginLeft:6}}>({t('inaction.yrInvesting',{n:d.yrs})})</span>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:isToday?"#22c55e":lost>0?"#f87171":"#0f172a"}}>{fmtC(d.val)}</span>
              </div>
              <div style={{height:16,borderRadius:4,overflow:"hidden",background:"rgba(255,255,255,0.03)"}}>
                <div className="ba" style={{height:"100%",borderRadius:4,width:Math.max(pctOfMax,2)+"%",background:isToday?"linear-gradient(90deg,#22c55e88,#22c55e)":"linear-gradient(90deg,"+delayProf.color+"44,"+delayProf.color+"88)"}}/>
              </div>
              {!isToday&&lost>0&&<div style={{textAlign:"right",marginTop:2}}>
                <span style={{fontSize:11,fontWeight:700,color:"#f87171"}}>−{fmtC(lost)}</span>
                <span style={{fontSize:10,color:"#475569",marginLeft:4}}>({(lost/todayVal*100).toFixed(1)}%)</span>
              </div>}
            </div>
          );
        })}
      </div>

      <div style={{padding:"16px 20px",borderRadius:12,background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.1)",textAlign:"center"}}>
        <div style={{fontSize:14,fontWeight:700,color:"#f87171",marginBottom:6}}>{t('inaction.yearsOfWaiting',{n:10})}−{fmtC(todayVal-lastDelay.val)}</div>
        <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.6}}>
          {t('inaction.potentialWealth',{pct:todayVal>0?((todayVal-lastDelay.val)/todayVal*100).toFixed(1):"0"})}
        </div>
      </div>
    </Cd>

    <AdvisorCTA msg={t('inaction.dontLetInaction')}/>
    </>)})()}
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === SAVE MORE === */}
{tab==="save"&&<div className="fi">
  <Cd><ST tip={t('save.tip')} sub={t('save.sub')}>{t('save.title')}</ST>
    {savOpps.length===0?<div style={{textAlign:"center",padding:"30px 20px",color:"#64748b"}}><div style={{fontSize:36,marginBottom:12}}><Icon name="lightbulb" size={36} weight="regular" color="#64748b" /></div><p>{t('save.addFirst')} <span style={{color:"#22c55e",cursor:"pointer",textDecoration:"underline"}} onClick={function(){goTab("situation")}}>{t('save.addFirstLink')}</span> {t('save.addFirstSuffix')}</p></div>
    :savOpps.map(function(o,i){return(<div key={o.id} style={{padding:16,borderRadius:14,marginBottom:12,background:i===0?"rgba(34,197,94,0.04)":"rgba(0,0,0,0.12)",border:i===0?"1px solid rgba(34,197,94,0.1)":"1px solid rgba(15,23,42,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{o.name}</span><span style={{fontSize:13,fontWeight:600,color:"#f87171"}}>{fmt(o.cur)}/mo</span></div>
      <Slider label={t('save.cutBy',{pct:o.cutPct})} value={o.cutPct} onChange={function(v){setSavSliders(function(p){var n=Object.assign({},p);n[o.id]=v;return n})}} min={0} max={100} step={5} format={function(v){return fmt(o.cur*(v/100))+t('save.moSaved')}} color="#22c55e"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
        {[{y:10,v:o.imp10},{y:20,v:o.imp20},{y:30,v:o.imp30}].map(function(t){return(
          <div key={t.y} style={{textAlign:"center",padding:"8px 6px",borderRadius:8,background:"rgba(0,0,0,0.15)"}}>
            <div style={{fontSize:9,color:"#64748b"}}>{t.y}yr</div>
            <div style={{fontSize:13,fontWeight:700,color:"#22c55e"}}>{fmtC(t.v)}</div>
          </div>)})}
      </div>
      {i===0&&<div style={{fontSize:10,color:"#16a34a",marginTop:6,fontWeight:600}}>{t('save.biggest')}</div>}
    </div>)})}
  </Cd>
  {savOpps.length>0&&<Cd glow="green">
    <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:17,fontWeight:600,color:"#22c55e",marginBottom:8}}><Icon name="lightbulb" size={16} weight="regular" /> {t('save.combinedImpact')}</h3>
    <div style={{fontSize:15,fontWeight:700,color:"#0f172a",marginBottom:12}}>Extra {fmt(totalSavOpp.mo)}/mo</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center"}}>
      {[{l:t('save.yrLabel',{n:10}),v:totalSavOpp.imp10},{l:t('save.yrLabel',{n:20}),v:totalSavOpp.imp20},{l:t('save.yrLabel',{n:30}),v:totalSavOpp.imp30}].map(function(t){return(
        <div key={t.l} style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.2)"}}>
          <div style={{fontSize:10,color:"#64748b"}}>{t.l}</div>
          <div style={{fontSize:18,fontWeight:800,color:"#22c55e"}}>{fmtC(t.v)}</div>
          <div style={{fontSize:9,color:"#475569"}}>60/40</div>
        </div>)})}
    </div>
    {/* Before vs After bar */}
    <div style={{marginTop:16,padding:"14px 16px",borderRadius:12,background:"rgba(0,0,0,0.15)"}}>
      <div style={{fontSize:12,color:"#94a3b8",marginBottom:10}}>{t('save.beforeAfter')}</div>
      <div style={{display:"flex",gap:12,alignItems:"flex-end",height:50}}>
        <div style={{flex:1,textAlign:"center"}}><div style={{height:Math.min(mSav/(mSav+totalSavOpp.mo)*50,50),background:"linear-gradient(180deg,#64748b,#475569)",borderRadius:"4px 4px 0 0"}}/><div style={{fontSize:10,color:"#64748b",marginTop:4}}>{fmt(mSav)}<br/>{t('save.before')}</div></div>
        <div style={{flex:1,textAlign:"center"}}><div style={{height:50,background:"linear-gradient(180deg,#22c55e,#16a34a)",borderRadius:"4px 4px 0 0"}}/><div style={{fontSize:10,color:"#22c55e",marginTop:4}}>{fmt(mSav+totalSavOpp.mo)}<br/>{t('save.after')}</div></div>
      </div>
    </div>
  </Cd>}
  <Cd style={{padding:"12px 16px"}}>
    <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#92400e",lineHeight:1.6}}>
      <Icon name="warning" size={13} weight="regular" /> <strong>{t('save.scenariosOnly')}</strong> — {t('save.saveScenariosExplain')}
    </div>
  </Cd>
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === EARN MORE === */}
{tab==="earn"&&<div className="fi">
  <Cd><ST tip={t('earn.tip')} sub={t('earn.sub')}>{t('earn.title')}</ST>
    <NI label={t('earn.extraIncome')} value={extraIncome} onChange={setExtraIncome} placeholder="" tip={t('earn.extraIncomeTip')}/>
    <Toggle value={eiTemporary} onChange={setEiTemporary} label={t('earn.temporary')} sub={eiTemporary?t('earn.incomeLastsYrs',{years:nEIYrs}):t('earn.permanentExtra')}/>
    {eiTemporary&&<NI label={t('earn.howManyYears')} value={eiYears} onChange={setEiYears} prefix="" placeholder="5" tip={t('earn.howLongExtra')}/>}
  </Cd>
  {earnProj&&<Cd glow="green">
    <div style={{fontSize:12,fontWeight:600,color:"#16a34a",textTransform:"uppercase",letterSpacing:2,marginBottom:12}}>{t('earn.extraInvested',{amt:fmt(nEI)})}</div>
    <MiniChart data={earnProj.data} height={120} color="#22c55e"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:16,textAlign:"center"}}>
      {[{l:t('earn.yrLabel',{n:10}),v:earnProj.imp10},{l:t('earn.yrLabel',{n:20}),v:earnProj.imp20},{l:t('earn.yrLabel',{n:30}),v:earnProj.imp30}].map(function(t){return(
        <div key={t.l} style={{padding:10,borderRadius:10,background:"rgba(0,0,0,0.2)"}}>
          <div style={{fontSize:10,color:"#64748b"}}>{t.l}</div>
          <div style={{fontSize:16,fontWeight:700,color:"#22c55e"}}>{fmtC(t.v)}</div>
          <div style={{fontSize:9,color:"#475569"}}>60/40</div>
        </div>)})}
    </div>
    {eiTemporary&&<div style={{marginTop:10,fontSize:11,color:"#92400e",textAlign:"center"}}><Icon name="hourglass" size={12} weight="regular" /> {t('earn.tempContrib',{years:nEIYrs})}</div>}
  </Cd>}

  {/* Combined: Save + Earn */}
  {(totalSavOpp.mo>0||nEI>0)&&<Cd glow="gold">
    <div style={{fontSize:12,fontWeight:600,color:"#a18207",marginBottom:12}}><Icon name="fire" size={14} weight="regular" /> {t('earn.combined')}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
      <div style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.15)",textAlign:"center"}}>
        <div style={{fontSize:10,color:"#64748b"}}>{t('earn.saveLess')}</div>
        <div style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>+{fmt(totalSavOpp.mo)}/mo</div>
      </div>
      <div style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.15)",textAlign:"center"}}>
        <div style={{fontSize:10,color:"#64748b"}}>{t('earn.earnMore')}</div>
        <div style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>+{fmt(nEI)}/mo</div>
      </div>
    </div>
    <div style={{textAlign:"center",padding:"16px 20px",borderRadius:14,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)"}}>
      <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{t('earn.totalExtra')}</div>
      <div style={{fontFamily:"Outfit,sans-serif",fontSize:28,fontWeight:800,color:"#22c55e"}}>{fmt(combinedImpact.mo)}</div>
      <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:10}}>
        {[{l:t('earn.yrLabel',{n:10}),v:combinedImpact.imp10},{l:t('earn.yrLabel',{n:20}),v:combinedImpact.imp20},{l:t('earn.yrLabel',{n:30}),v:combinedImpact.imp30}].map(function(t){return(
          <div key={t.l}><div style={{fontSize:10,color:"#64748b"}}>{t.l}</div><div style={{fontSize:14,fontWeight:700,color:"#22c55e"}}>{fmtC(t.v)}</div></div>)})}
      </div>
    </div>
  </Cd>}
  <Cd style={{padding:"12px 16px"}}>
    <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#92400e",lineHeight:1.6}}>
      <Icon name="warning" size={13} weight="regular" /> <strong>{t('earn.scenariosOnly')}</strong> — {t('earn.earnScenariosExplain')}
    </div>
  </Cd>
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === COST IN RETIREMENT === */}
{tab==="cost"&&<div className="fi">
  <Cd><ST tip={t('cost.tip')} sub={t('cost.sub')}>{t('cost.title')}</ST>
    <input type="text" value={costItemName} onChange={function(e){setCostItemName(e.target.value)}} placeholder={lang==="en"?"e.g., New car, Luxury vacation...":"ej., Auto nuevo, Vacaciones de lujo..."} style={{width:"100%",background:"rgba(248,250,253,0.98)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,color:"#0f172a",fontSize:15,padding:"13px 16px",fontFamily:"Outfit,sans-serif",outline:"none",marginBottom:16}}/>
    <NI label={t('cost.price')} value={costItemPrice} onChange={setCostItemPrice} placeholder="" tip={t('cost.priceTip')}/>
    <div style={{fontSize:13,fontWeight:500,color:"#94a3b8",marginBottom:8}}>{t('cost.investProfile')}</div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {adjProfiles.map(function(p,i){return <TabBtn key={p.id} active={costProfileIdx===i} iconName={p.icon} label={p.name} onClick={function(){setCostProfileIdx(i)}} color={p.color}/>})}
    </div>
  </Cd>
  {costInRet&&ytr>0&&<>
    <Cd glow="orange" style={{textAlign:"center",padding:"32px 24px"}}>
      <div style={{fontSize:48,marginBottom:12}}><Icon name="lightning" size={48} weight="regular" color="#d97706" /></div>
      <div style={{fontSize:14,color:"#d97706",marginBottom:8}}>{costItemName||t('cost.thatPurchase')} {t('cost.purchaseForConnector')} <strong style={{color:"#f59e0b"}}>{fmt(Number(costItemPrice))}</strong></div>
      <div style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:"#0f172a",lineHeight:1.4,marginBottom:12}}>
        {t('cost.ifInvestedFull',{rate:pct(costInRet.prof.realReturn),years:ytr})}
      </div>
      <div style={{fontFamily:"Outfit,sans-serif",fontSize:42,fontWeight:900,color:"#f59e0b",marginBottom:8}}>{fmt(costInRet.fv)}</div>
      <div style={{fontSize:15,color:"#d97706",fontWeight:600}}>{t('cost.thatsMoney',{mult:costInRet.multiplier.toFixed(1)})}</div>
      {costInRet.itemsCouldBuy>1&&<div style={{marginTop:16,padding:"14px 20px",borderRadius:12,background:"rgba(0,0,0,0.2)",fontSize:14,color:"#92400e",lineHeight:1.6}}>
        {t('cost.couldBuy',{n:costInRet.itemsCouldBuy,name:costItemName||t('cost.thatPurchase')})}
      </div>}
      <div style={{marginTop:12,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",textAlign:"center"}}>{t('cost.allInTodayDollars',{profile:costInRet.prof.icon+" "+costInRet.prof.name,rate:pct(costInRet.prof.realReturn),years:ytr})}</div>
    </Cd>
    <Cd><ST>{t('cost.compare')}</ST>
      {hasPortfolio&&blendedPortReturn!=null&&(function(){var fv=fvL(Number(costItemPrice)||0,blendedPortReturn,ytr);var mult=fv/(Number(costItemPrice)||1);return(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:8,marginBottom:4,background:"rgba(232,121,249,0.06)"}}>
          <span style={{fontSize:12,color:"#e879f9",fontWeight:600}}><Icon name="sliders-h" size={12} weight="regular" /> {t('profiles.myPortfolio.name')}</span>
          <div><span style={{fontSize:13,fontWeight:700,color:"#e879f9"}}>{fmtC(fv)}</span><span style={{fontSize:10,color:"#64748b",marginLeft:6}}>({mult.toFixed(1)}×)</span></div>
        </div>)})()}
      {allProfiles.map(function(p){var fv=fvL(Number(costItemPrice)||0,p.realReturn,ytr);var mult=fv/(Number(costItemPrice)||1);return(
        <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:8,marginBottom:4,background:p.id===(allProfiles[costProfileIdx]||adjProfiles[4]).id?"rgba(245,158,11,0.06)":"transparent"}}>
          <span style={{fontSize:12,color:"#94a3b8"}}><Icon name={p.icon} size={14} weight="light"/> {p.name}</span>
          <div><span style={{fontSize:13,fontWeight:700,color:p.color}}>{fmtC(fv)}</span><span style={{fontSize:10,color:"#64748b",marginLeft:6}}>({mult.toFixed(1)}×)</span></div>
        </div>)})}
    </Cd>
  </>}
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === GOALS === */}
{tab==="goals"&&<div className="fi">
  <Cd><ST tip={t('goals.tip')} sub={t('goals.sub')}>{t('goals.title')}</ST>
    {(goals||[]).map(function(g,gi){const calc=goalCalcs[gi];return(
      <div key={g.id} style={{padding:16,background:"rgba(0,0,0,0.15)",borderRadius:14,marginBottom:12,border:"1px solid rgba(15,23,42,0.06)"}}>
        <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
          <span style={{fontSize:12,color:"#475569",fontWeight:700}}>#{gi+1}</span>
          <input type="text" value={g.name} onChange={function(e){uG(g.id,"name",e.target.value)}} placeholder={t('goals.goalName')} style={{flex:1,background:"rgba(248,250,253,0.98)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,color:"#0f172a",fontSize:14,padding:"10px 14px",fontFamily:"Outfit,sans-serif",outline:"none"}}/>
          {goals.length>1&&<button onClick={function(){rG(g.id)}} style={{width:32,height:32,borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",color:"#ef4444",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <NI label={t('goals.target')} value={g.amount} onChange={function(v){uG(g.id,"amount",v)}} style={{marginBottom:0}}/>
          <NI label={t('goals.yearsLabel')} value={g.years} onChange={function(v){uG(g.id,"years",v)}} prefix="" placeholder="" style={{marginBottom:0}}/>
        </div>
        {/* Profile selector */}
        <div style={{marginTop:10}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>{t('goals.investProfile')}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {allProfiles.map(function(p,i){return <TabBtn key={p.id} active={g.profileIdx===i} iconName={p.icon} label={p.name} onClick={function(){uG(g.id,"profileIdx",i)}} color={p.color}/>})}
          </div>
        </div>
        {/* Result */}
        {calc&&calc.valid&&<div style={{marginTop:12,padding:"12px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>{calc.prof.icon}</span>
              <span style={{fontSize:11,color:"#94a3b8"}}>{calc.prof.name} ({pct(calc.prof.realReturn)} real)</span>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:16,fontWeight:700,color:calc.mo<=mSav?"#22c55e":"#f87171"}}>{fmt(calc.mo)}/mo</div>
              <div style={{fontSize:10,color:calc.mo<=mSav?"#4ade80":"#f87171"}}>{calc.mo<=mSav?t('goals.fitsBudget'):t('goals.overBudget',{amt:fmt(calc.mo-mSav)})}</div>
            </div>
          </div>
        </div>}
      </div>)})}
    {goals.length<10&&<button className="bs" onClick={aG}>{t('goals.addGoal', {n: goals.length, max: 10})}</button>}
  </Cd>

  {/* Goal Roadmap */}
  {goalCalcs.filter(function(g){return g.valid}).length>0&&<Cd>
    <ST tip={t('goals.roadmapTip')}>{t('goals.roadmap')}</ST>
    <div style={{position:"relative",paddingLeft:24}}>
      <div style={{position:"absolute",left:8,top:0,bottom:0,width:2,background:"rgba(15,23,42,0.08)"}}/>
      {goalCalcs.filter(function(g){return g.valid}).sort(function(a,b){return a.nYrs-b.nYrs}).map(function(g,i){return(
        <div key={g.id} style={{position:"relative",marginBottom:20,paddingLeft:16}}>
          <div style={{position:"absolute",left:-20,top:4,width:12,height:12,borderRadius:"50%",background:g.prof.color,border:"3px solid #0f1628"}}/>
          <div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{g.name||t('goals.goalNum', {n: i+1})}</div>
          <div style={{fontSize:12,color:"#94a3b8"}}>{t('goals.inYears',{amt:fmt(g.nAmt),years:g.nYrs})} · {g.mo>0?fmt(g.mo)+"/mo":t('common.covered')}</div>
          <div style={{fontSize:10,color:g.prof.color}}>{g.prof.icon} {g.prof.name}</div>
        </div>)})}
    </div>
  </Cd>}

  {/* Retirement impact */}
  {goalRetImpact&&<Cd glow="gold">
    <div style={{fontSize:12,fontWeight:600,color:"#a18207",marginBottom:10}}><Icon name="warning" size={13} weight="regular" /> {t('goals.impactOnRetirement')}</div>
    <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6,marginBottom:12}}>
      {t('goals.directing',{amt:fmt(totalGoalMo)})}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,textAlign:"center"}}>
      <div style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.15)"}}>
        <div style={{fontSize:10,color:"#64748b"}}>{t('goals.withoutGoals')}</div>
        <div style={{fontSize:16,fontWeight:700,color:"#22c55e"}}>{fmtC(goalRetImpact.full)}</div>
      </div>
      <div style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.15)"}}>
        <div style={{fontSize:10,color:"#64748b"}}>{t('goals.withGoals')}</div>
        <div style={{fontSize:16,fontWeight:700,color:"#eab308"}}>{fmtC(goalRetImpact.reduced)}</div>
      </div>
    </div>
    <div style={{textAlign:"center",marginTop:8,fontSize:12,color:"#f87171"}}>{t('goals.retReduction')} <strong>{fmt(goalRetImpact.diff)}</strong> ({t('goals.mnPercent',{pct:goalRetImpact.pctOfMagic.toFixed(1)})})</div>
    <div style={{marginTop:8,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",textAlign:"center",lineHeight:1.5}}>
      <Icon name="ruler" size={12} weight="regular" /> {t('goals.oppCostExplain',{rate:pct(goalImpactRate)})}
    </div>
  </Cd>}
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === SCORE === */}
{tab==="score"&&<div className="fi">
  <Cd><ST tip="0-100 based on savings rate, debts, retirement progress, active saving.">{t('score.title')}</ST>
    <Gauge value={hScore.s}/>
    <div style={{marginTop:20,display:"grid",gap:6}}>
      {hScore.bd.map(function(b){return(<div key={b.l} style={{padding:"9px 12px",borderRadius:8,background:"rgba(0,0,0,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{width:7,height:7,borderRadius:"50%",background:b.st==="good"?"#22c55e":b.st==="ok"?"#eab308":"#ef4444"}}/><span style={{fontSize:12,color:"#94a3b8"}}>{b.l}</span></div>
          <span style={{fontSize:13,fontWeight:700,color:b.st==="good"?"#22c55e":b.st==="ok"?"#eab308":"#ef4444"}}>{b.s}/{b.m}</span></div>
        {b.det&&<div style={{fontSize:10,color:"#475569",marginTop:3,marginLeft:14}}>{b.det}</div>}
      </div>)})}
    </div>
    <div style={{marginTop:14,padding:"10px 14px",borderRadius:10,fontSize:12,lineHeight:1.5,background:hScore.s>=70?"rgba(34,197,94,0.06)":hScore.s>=40?"rgba(234,179,8,0.06)":"rgba(239,68,68,0.06)",color:hScore.s>=70?"#86efac":hScore.s>=40?"#92400e":"#fca5a5"}}>
      {hScore.s>=70?t('score.greatShape'):hScore.s>=40?t('score.makingProgressScore'):t('score.roomToImprove')}
    </div>
  </Cd>

  {/* Action Plan */}
  {hScore.recs.length>0&&<Cd glow="green">
    <ST>{t('score.recommendations')}</ST>
    <div style={{display:"grid",gap:10}}>
      {hScore.recs.map(function(r,i){return(
        <div key={i} style={{display:"flex",gap:12,padding:"12px 14px",borderRadius:12,background:"rgba(0,0,0,0.15)",border:"1px solid rgba(15,23,42,0.06)"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:r.priority===1?"rgba(239,68,68,0.15)":r.priority===2?"rgba(234,179,8,0.15)":"rgba(34,197,94,0.15)",color:r.priority===1?"#ef4444":r.priority===2?"#eab308":"#22c55e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</div>
          <div><div style={{fontSize:11,color:r.priority===1?"#ef4444":r.priority===2?"#eab308":"#22c55e",fontWeight:600,marginBottom:2}}>{r.cat}</div>
            <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{r.text}</div></div>
        </div>)})}
    </div>
  </Cd>}

  {/* Benchmarking */}
  <Cd><ST tip="Based on US Federal Reserve Survey of Consumer Finances.">{t('benchmarking.howCompare')}</ST>
    {nAge>0?<div style={{display:"grid",gap:16}}>
      {[{l:t('score.savingsRate'),g:bSR.l,y:savRate.toFixed(0)+"%",m:bSR.med+"%",a:savRate>bSR.med,p:percentiles.sr,p25:bSR.p25,med:bSR.med,p75:bSR.p75,uv:savRate,unit:"%"},
        {l:t('benchmarking.totalAssets'),g:bNW.l,y:fmtC(totalNetWorth),m:fmtC(bNW.med),a:totalNetWorth>bNW.med,p:percentiles.nw,p25:bNW.p25,med:bNW.med,p75:bNW.p75,uv:totalNetWorth,unit:"$"}].map(function(b){return(
        <div key={b.l} style={{padding:16,borderRadius:14,background:"rgba(0,0,0,0.15)",border:"1px solid rgba(15,23,42,0.06)"}}>
          <div style={{fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{b.l} · {t('benchmarking.age', {age: t('bench.' + ID_MAP[b.g]) || b.g})}</div>
          <div style={{display:"flex",gap:16,marginBottom:10}}>
            <div><span style={{fontSize:10,color:"#64748b"}}>{t('benchmarking.you')}: </span><span style={{fontSize:20,fontWeight:700,color:b.a?"#22c55e":"#eab308"}}>{b.y}</span></div>
            <div><span style={{fontSize:10,color:"#64748b"}}>{t('benchmarking.median')}: </span><span style={{fontSize:20,fontWeight:700,color:"#94a3b8"}}>{b.m}</span></div>
          </div>
          {/* Percentile bar */}
          <div style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#475569",marginBottom:4}}>
              <span>{t('score.pctile25')}</span><span>{t('score.pctile50')}</span><span>{t('score.pctile75')}</span>
            </div>
            <div style={{position:"relative",height:8,borderRadius:4,background:"rgba(15,23,42,0.06)"}}>
              <div style={{position:"absolute",left:"25%",top:0,bottom:0,width:1,background:"rgba(255,255,255,0.08)"}}/>
              <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"rgba(255,255,255,0.08)"}}/>
              <div style={{position:"absolute",left:"75%",top:0,bottom:0,width:1,background:"rgba(255,255,255,0.08)"}}/>
              <div style={{position:"absolute",left:Math.min(b.p||0,98)+"%",top:-4,width:16,height:16,borderRadius:"50%",background:b.a?"#22c55e":"#eab308",border:"3px solid #0f1628",transform:"translateX(-50%)",transition:"left 0.5s"}}/>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:14,fontWeight:700,color:b.a?"#22c55e":"#eab308"}}>{b.p?("P"+b.p):"—"}</div>
            <div style={{fontSize:12,color:b.a?"#86efac":"#92400e"}}>{b.a?t('score.aboveMedian'):t('score.belowMedian')}</div>
          </div>
        </div>)})}
    </div>:<p style={{color:"#64748b",fontSize:13}}>{t('score.enterAge')} <span style={{color:"#22c55e",cursor:"pointer",textDecoration:"underline"}} onClick={function(){goTab("situation")}}>{t('score.enterAgeLink')}</span>.</p>}
  </Cd>
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

{/* === REPORTS === */}
{tab==="reports"&&<div className="fi">
  {/* Convenceme */}
  <Cd glow="purple"><ST tip={t('reports.convinceTip')} sub={t('reports.convinceSub')}>{t('reports.convince')}</ST>
    {mSav>0&&savOpps.length>0?<>
      <div style={{padding:20,borderRadius:16,background:"linear-gradient(145deg,#0f1628,rgba(248,250,253,0.98))",border:"1px solid rgba(167,139,250,0.15)",marginBottom:16}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:18,fontWeight:700,color:"#0f172a",marginBottom:4}}>{t('reports.whatIfSaved')}</div>
          <div style={{fontSize:12,color:"#64748b"}}>{t('reports.miniScenario')}</div>
        </div>
        {savOpps.slice(0,3).map(function(o){return(
          <div key={o.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,marginBottom:4,background:"rgba(0,0,0,0.15)"}}>
            <span style={{fontSize:12,color:"#94a3b8"}}>{t('reports.cutBy',{name:o.name,pct:o.cutPct})}</span>
            <span style={{fontSize:12,fontWeight:600,color:"#22c55e"}}>+{fmt(o.saved)}/mo</span>
          </div>)})}
        <div style={{textAlign:"center",marginTop:16,padding:14,borderRadius:12,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)"}}>
          <div style={{fontSize:11,color:"#64748b"}}>{t('reports.smallChanges')}</div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:32,fontWeight:800,color:"#22c55e"}}>{fmtC(totalSavOpp.imp20)}</div>
          <div style={{fontSize:11,color:"#475569",marginTop:4}}>{t('reports.extraByAge',{age:nAge+20})}</div>
        </div>
      </div>
      <button onClick={function(){
        var text=t('reports.whatIfSaved')+"\n\n";
        savOpps.slice(0,3).forEach(function(o){text+="• "+t('reports.cutBy',{name:o.name,pct:o.cutPct})+": +"+fmt(o.saved)+"/mo\n"});
        text+="\n"+t('reports.smallChanges')+": "+fmtC(totalSavOpp.imp20)+" ("+t('reports.todayDollars6040')+")\n\n"+t('reports.generatedBy');
        navigator.clipboard.writeText(text).then(function(){alert(t('reports.copiedAlert'))})
      }} style={{width:"100%",background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"#fff",border:"none",padding:"14px 24px",borderRadius:14,fontSize:14,fontWeight:700,fontFamily:"Outfit,sans-serif",cursor:"pointer",boxShadow:"0 4px 20px rgba(167,139,250,0.25)"}}>
        {t('reports.copyToShare')}
      </button>
    </>:<div style={{textAlign:"center",padding:20,color:"#64748b"}}><div style={{fontSize:36,marginBottom:12}}><Icon name="chart-bar" size={36} weight="regular" color="#64748b" /></div><p>{t('reports.addDataFirst')}</p></div>}
  </Cd>

  {/* Financial Snapshot / Print */}
  <Cd glow="blue"><ST tip={t('reports.snapshotTip')} sub={t('reports.snapshotSub')}>{t('reports.snapshot')}</ST>
    {hasData?<>
      <div style={{display:"grid",gap:10,marginBottom:16}}>
        {(nRentalNet>0?[
          {l:t('reports.workIncome'),v:fmt(nInc+(coupleMode?nP2I:0)),c:"#0f172a"},
          {l:t('reports.rentalFull'),v:fmt(nRentalNet),c:"#0f172a"},
          {l:t('reports.totalMonthlyIncome'),v:fmt(totalIncome),c:"#22c55e"}
        ]:[{l:t('reports.monthlyIncomeLabel'),v:fmt(totalIncome),c:"#0f172a"}])
        .concat([{l:nVac>0?t('reports.expensesInclVacation'):t('reports.monthlyExpenses'),v:fmt(totExp),c:"#f87171"}])
        .concat(nMortPay>0?[{l:t('reports.mortgagePI'),v:fmt(nMortPay),c:"#f87171"}]:[])
        .concat(nCarPay>0?[{l:t('reports.carLoan'),v:fmt(nCarPay),c:"#f87171"}]:[])
        .concat([
          {l:t('reports.monthlySavings'),v:fmt(mSav),c:mSav>0?"#22c55e":"#ef4444"},
          {l:t('reports.savingsRate'),v:savRate.toFixed(1)+"%",c:savRate>=20?"#22c55e":"#eab308"},
          {l:t('reports.investSavings'),v:fmt(nEx),c:"#60a5fa"}
        ])
        .concat(nRentalEq>0?[{l:t('reports.rentalEquityFull'),v:fmt(nRentalEq),c:"#93c5fd"},{l:t('reports.totalAssets'),v:fmt(totalNetWorth),c:"#60a5fa"}]:[])
        .concat([
          {l:t('reports.totalDebt'),v:noDebts?"$0":fmt(totalDebtAll),c:noDebts?"#22c55e":"#f87171"},
          {l:t('reports.healthScore'),v:hScore.s+"/100",c:hScore.s>=70?"#22c55e":hScore.s>=40?"#eab308":"#ef4444"}
        ]).concat(magic.real>0?[{l:t('reports.magicNumber'),v:fmt(magic.real),c:"#60a5fa"},{l:t('reports.progress'),v:mD.p.toFixed(1)+"%",c:mD.gc}]:[]).map(function(r){return(
          <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"rgba(0,0,0,0.1)"}}>
            <span style={{fontSize:12,color:"#94a3b8"}}>{r.l}</span>
            <span style={{fontSize:13,fontWeight:700,color:r.c}}>{r.v}</span>
          </div>)})}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[{l:t('reports.savingsRate'),v:((mSav+totalSavOpp.mo)/totalIncome*100).toFixed(0)+"%",c:"#86efac"},
          {l:t('reports.healthScore'),v:hScore.s+"/100",c:hScore.s>=70?"#22c55e":hScore.s>=40?"#eab308":"#ef4444"}
        ].concat(magic.real>0?[{l:t('reports.magicNumber'),v:fmt(magic.real),c:"#60a5fa"},{l:t('reports.progress'),v:mD.p.toFixed(1)+"%",c:mD.gc}]:[]).map(function(r){return(
          <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"rgba(0,0,0,0.15)"}}>
            <span style={{fontSize:12,color:"#94a3b8"}}>{r.l}</span>
            <span style={{fontSize:13,fontWeight:700,color:r.c}}>{r.v}</span>
          </div>)})}
      </div>
      {nRentalEq>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:12,color:"#93c5fd",lineHeight:1.6,marginBottom:16}}>
        <Icon name="ruler" size={12} weight="regular" /> <strong>{t('reports.rentalEquityNote',{amt:fmt(nRentalEq)})}</strong>
        {nAge>0&&nRetAge>0&&nYP>0?" "+t('reports.rentalEquityFuture',{age:nRetAge+nYP,rate:customInflation.toFixed(1),amt:fmt(Math.round(nRentalEq*Math.pow(1+INFL,nRetAge+nYP-nAge)))}):""}
      </div>}
      <button onClick={function(){window.print()}} style={{width:"100%",background:"linear-gradient(135deg,#3b82f6,#2563eb)",color:"#fff",border:"none",padding:"14px 24px",borderRadius:14,fontSize:14,fontWeight:700,fontFamily:"Outfit,sans-serif",cursor:"pointer",boxShadow:"0 4px 20px rgba(59,130,246,0.25)"}}>
        {t('reports.print')}
      </button>
    </>:<div style={{textAlign:"center",padding:20,color:"#64748b"}}><p>{t('reports.completeProfile')}</p></div>}
  </Cd>
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
</div>}

        <div style={{marginTop:36,padding:"14px 18px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)",fontSize:11,color:"#93c5fd",lineHeight:1.7,textAlign:"center"}}>
          <strong>{t('disclaimer.important')}</strong> {t('disclaimer.text')} {t('disclaimer.inflation')} {(INFL*100).toFixed(1)}%/{t('app.yr')}.
          <div style={{marginTop:8}}><a href="#" onClick={function(e){e.preventDefault()}} style={{color:"#60a5fa",fontWeight:600,textDecoration:"underline"}}>{t('disclaimer.advisor')}</a> {t('disclaimer.advisorSub')}</div>
        </div>
      </main>
    </div>
  </>);
}
