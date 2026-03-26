import { useState, useMemo, useEffect, useRef, useCallback } from "react";

const INFLATION_DEFAULT = 0.025;
const RET_NOM = 0.04;
const PROFILES = [
  { id:"vault",name:"Vault",nomReturn:0,realReturn:-0.025,desc:"Cash under the mattress. Loses to inflation.",icon:"🔒",color:"#64748b",risk:0,vol:0},
  { id:"cash",name:"Cash Investor",nomReturn:0.03,realReturn:0.005,desc:"Short-duration treasuries (BIL/SHV).",icon:"💵",color:"#94a3b8",risk:1,vol:0.01},
  { id:"cds",name:"CDs",nomReturn:0.035,realReturn:0.01,desc:"Certificates of Deposit. FDIC insured.",icon:"💿",color:"#a78bfa",risk:2,vol:0},
  { id:"treasuries",name:"Treasuries",nomReturn:0.04,realReturn:0.015,desc:"Long-term US Treasury bonds (TLT).",icon:"🏛️",color:"#60a5fa",risk:3,vol:0.12},
  { id:"6040",name:"60 / 40",nomReturn:0.065,realReturn:0.04,desc:"60% stocks, 40% bonds. Balanced.",icon:"⚖️",color:"#34d399",risk:4,vol:0.10},
  { id:"8020",name:"80 / 20",nomReturn:0.075,realReturn:0.05,desc:"80% stocks, 20% bonds. Growth-tilted.",icon:"📈",color:"#22c55e",risk:5,vol:0.13},
  { id:"equities",name:"100% Equities",nomReturn:0.09,realReturn:0.065,desc:"All stocks (S&P 500). Highest return and volatility.",icon:"🚀",color:"#f59e0b",risk:6,vol:0.15},
];
const DEFAULT_EXP = [
  {id:1,name:"Housing / Rent",amount:"",discretionary:false,mortgageAlt:"Property Tax, Insurance & HOA"},
  {id:2,name:"Food & Groceries",amount:"",discretionary:false},
  {id:3,name:"Transportation",amount:"",discretionary:true},
  {id:4,name:"Utilities & Bills",amount:"",discretionary:false},
  {id:5,name:"Dining Out",amount:"",discretionary:true},
];
const BENCH_SR = [{minAge:16,maxAge:24,med:5,p25:2,p75:10,l:"Under 25"},{minAge:25,maxAge:34,med:8,p25:4,p75:15,l:"25-34"},{minAge:35,maxAge:44,med:9,p25:5,p75:18,l:"35-44"},{minAge:45,maxAge:54,med:10,p25:5,p75:20,l:"45-54"},{minAge:55,maxAge:64,med:12,p25:6,p75:22,l:"55-64"},{minAge:65,maxAge:99,med:15,p25:8,p75:25,l:"65+"}];
const BENCH_NW = [{minAge:16,maxAge:24,med:10800,p25:1000,p75:35000,l:"Under 25"},{minAge:25,maxAge:34,med:39000,p25:7500,p75:127000,l:"25-34"},{minAge:35,maxAge:44,med:135600,p25:27500,p75:400000,l:"35-44"},{minAge:45,maxAge:54,med:247200,p25:52000,p75:750000,l:"45-54"},{minAge:55,maxAge:64,med:364500,p25:71000,p75:1100000,l:"55-64"},{minAge:65,maxAge:99,med:409900,p25:82000,p75:1200000,l:"65+"}];
const TABS = [
  {id:"dashboard",label:"Dashboard",icon:"📊"},
  {id:"learn",label:"Learn",icon:"📖"},
  {id:"achieve",label:"Your MN",icon:"🎯"},
  {id:"inaction",label:"Cost of Inaction",icon:"💤"},
  {id:"assumptions",label:"You",icon:"🧑"},
  {id:"situation",label:"Income & Exp",icon:"💰"},
  {id:"debts",label:"Debts",icon:"💳"},
  {id:"invest",label:"Invest Options",icon:"📈"},
  {id:"portfolio",label:"Your Portfolio",icon:"🎛️"},
  {id:"retirement",label:"Retirement",icon:"🎯"},
  {id:"save",label:"Save More?",icon:"✂️"},
  {id:"earn",label:"Earn",icon:"💡"},
  {id:"cost",label:"Opp. Cost",icon:"🏷️"},
  {id:"goals",label:"Int. Needs",icon:"🏠"},
  {id:"score",label:"Score",icon:"🏆"},
  {id:"reports",label:"Reports",icon:"📄"},
];
var SCENARIO_SPREAD = 0.02;

function fmt(n){if(n==null||isNaN(n))return "$0";return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n)}
function fmtC(n){if(Math.abs(n)>=1e6)return "$"+(n/1e6).toFixed(1)+"M";if(Math.abs(n)>=1e3)return "$"+(n/1e3).toFixed(0)+"K";return fmt(n)}
function pct(n){return(n*100).toFixed(1)+"%"}
function mR(r){return r===0?0:Math.pow(1+r,1/12)-1}
function fvC(pmt,r,y){if(y<=0||pmt===0)return 0;if(r===0)return pmt*y*12;var m=mR(r),n=y*12;return pmt*((Math.pow(1+m,n)-1)/m)}
function fvL(pv,r,y){if(pv===0)return 0;if(y<=0)return pv;return pv*Math.pow(1+r,y)}
function pvA(pmt,r,y){if(y<=0||pmt===0)return 0;if(r===0)return pmt*y*12;var m=mR(r),n=y*12;return pmt*((1-Math.pow(1+m,-n))/m)}
function gB(d,a){return d.find(function(b){return a>=b.minAge&&a<=b.maxAge})||d[0]}
function profByHorizon(y){if(y<1)return PROFILES[0];if(y<2)return PROFILES[1];if(y<3)return PROFILES[3];if(y<5)return PROFILES[4];if(y<10)return PROFILES[5];return PROFILES[6]}
function clamp(v,mn,mx){return Math.max(mn,Math.min(mx,v))}

function yearByYear(existingSavings, baseMonthlySav, accumReturn, yearsAccum, yearsRetire, monthlySpend, inflation, debtEvents, retireReturn){
  // retireReturn: optional separate rate for retirement phase (defaults to accumReturn)
  var rRet=retireReturn!=null?retireReturn:accumReturn;
  var data=[];var bal=existingSavings;
  for(var y=0;y<=yearsAccum+yearsRetire;y++){
    data.push({year:y,balance:Math.max(bal,0),phase:y<=yearsAccum?"accumulation":"withdrawal"});
    if(y<yearsAccum){
      var extraSav=0;
      if(debtEvents){debtEvents.forEach(function(ev){if(y>=ev.endsAtYear)extraSav+=ev.monthlyAmount})}
      bal=bal*(1+accumReturn)+(baseMonthlySav+extraSav)*12;
    } else {
      bal=bal*(1+rRet)-monthlySpend*12;
    }
    if(bal<0)bal=0;
  }
  return data;
}

// Future value with variable contributions (debt payoff events)
function fvVariable(existingSavings, baseMonthlySav, realReturn, years, debtEvents){
  var bal=existingSavings;
  for(var y=0;y<years;y++){
    var extraSav=0;
    if(debtEvents){debtEvents.forEach(function(ev){if(y>=ev.endsAtYear)extraSav+=ev.monthlyAmount})}
    bal=bal*(1+realReturn)+(baseMonthlySav+extraSav)*12;
    if(bal<0)bal=0;
  }
  return bal;
}

function Tip({text}){var _s=useState(false),o=_s[0],setO=_s[1];var ref=useRef(null);useEffect(function(){if(!o)return;var c=function(e){if(ref.current&&!ref.current.contains(e.target))setO(false)};document.addEventListener("mousedown",c);return function(){document.removeEventListener("mousedown",c)}},[o]);return(<span ref={ref} style={{position:"relative",display:"inline-flex",alignItems:"center",marginLeft:6}}><span onClick={function(){setO(!o)}} style={{width:18,height:18,borderRadius:"50%",background:o?"rgba(96,165,250,0.25)":"rgba(96,165,250,0.12)",color:"#60a5fa",fontSize:11,fontFamily:"Outfit,sans-serif",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontWeight:700,border:"1px solid rgba(96,165,250,0.2)"}}>?</span>{o&&<span style={{position:"absolute",bottom:"calc(100% + 10px)",left:"50%",transform:"translateX(-50%)",background:"#1e293b",color:"#cbd5e1",padding:"12px 16px",borderRadius:12,fontSize:13,width:280,zIndex:1000,lineHeight:1.5,boxShadow:"0 8px 24px rgba(0,0,0,0.4)",fontFamily:"Outfit,sans-serif",border:"1px solid rgba(255,255,255,0.08)"}}>{text}<span style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderTop:"8px solid #1e293b"}}/></span>}</span>)}

function ANum({value,dur}){dur=dur||1800;var _s=useState(0),d=_s[0],setD=_s[1];var f=useRef(null);var p=useRef(0);useEffect(function(){var s=p.current;var st=performance.now();var a=function(now){var pr=Math.min((now-st)/dur,1);var e=1-Math.pow(1-pr,3);setD(Math.floor(s+(value-s)*e));if(pr<1)f.current=requestAnimationFrame(a);else p.current=value};f.current=requestAnimationFrame(a);return function(){cancelAnimationFrame(f.current)}},[value,dur]);return "$"+d.toLocaleString("en-US")}

function NI({label,value,onChange,prefix,placeholder,tip,min,max,style:os,suffix}){
  if(prefix===undefined)prefix="$";if(!placeholder)placeholder="";if(min===undefined)min=0;
  var raw=String(value).replace(/,/g,"");
  var display=(raw&&!isNaN(Number(raw))&&Number(raw)>=1000)?Number(raw).toLocaleString("en-US"):raw;
  function handleChange(e){var v=e.target.value.replace(/,/g,"").replace(/[^0-9.\-]/g,"");onChange(v)}
  return(<div style={Object.assign({marginBottom:16},os)}>{label&&<label style={{display:"flex",alignItems:"center",marginBottom:8,fontSize:13,fontWeight:500,color:"#94a3b8",fontFamily:"Outfit,sans-serif"}}>{label}{tip&&<Tip text={tip}/>}</label>}<div style={{display:"flex",alignItems:"center",background:"#131c2e",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)",padding:"0 16px"}}>{prefix&&<span style={{color:"#64748b",fontSize:15,fontWeight:600,marginRight:4,fontFamily:"Outfit,sans-serif"}}>{prefix}</span>}<input type="text" inputMode="numeric" value={display} onChange={handleChange} placeholder={placeholder} style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#f1f5f9",fontSize:17,fontWeight:600,padding:"13px 0",fontFamily:"Outfit,sans-serif",width:"100%"}}/>{suffix&&<span style={{color:"#64748b",fontSize:13,fontWeight:500,marginLeft:4}}>{suffix}</span>}</div></div>)
}

function Cd({children,style,glow,onClick}){var g={green:{bg:"linear-gradient(145deg,#0a1a12,#0c1f18)",b:"1px solid rgba(34,197,94,0.12)"},gold:{bg:"linear-gradient(145deg,#1a1708,#191710)",b:"1px solid rgba(234,179,8,0.12)"},orange:{bg:"linear-gradient(145deg,#1a0f08,#1f1208)",b:"1px solid rgba(245,158,11,0.12)"},red:{bg:"linear-gradient(145deg,#1a0a0a,#1f0c0c)",b:"1px solid rgba(239,68,68,0.12)"},blue:{bg:"linear-gradient(145deg,#0a0f1a,#0c121f)",b:"1px solid rgba(96,165,250,0.12)"},purple:{bg:"linear-gradient(145deg,#140a1a,#180c1f)",b:"1px solid rgba(167,139,250,0.12)"}};var c=glow?g[glow]:null;return(<div onClick={onClick} style={Object.assign({background:c?c.bg:"linear-gradient(145deg,#0f1628,#111b2e)",border:c?c.b:"1px solid rgba(255,255,255,0.05)",borderRadius:20,padding:28,marginBottom:20,cursor:onClick?"pointer":"default"},style)}>{children}</div>)}

function ST({children,sub,tip}){return(<div style={{marginBottom:sub?24:20}}><h2 style={{fontFamily:"Fraunces,serif",fontSize:21,fontWeight:700,color:"#f1f5f9",display:"flex",alignItems:"center"}}>{children}{tip&&<Tip text={tip}/>}</h2>{sub&&<p style={{fontSize:13,color:"#64748b",marginTop:4}}>{sub}</p>}</div>)}

function Gauge({value}){var p=Math.min(value,100);var c=p>=70?"#22c55e":p>=40?"#eab308":"#ef4444";return(<div style={{textAlign:"center"}}><div style={{position:"relative",width:160,height:90,margin:"0 auto"}}><svg viewBox="0 0 160 90" style={{width:"100%",height:"100%"}}><path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round"/><path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke={c} strokeWidth="12" strokeLinecap="round" strokeDasharray={p*2.04+" 999"} style={{transition:"all 1s"}}/></svg><div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)"}}><div style={{fontFamily:"Fraunces,serif",fontSize:36,fontWeight:800,color:c,lineHeight:1}}>{Math.round(value)}</div></div></div><div style={{fontSize:12,color:"#64748b",marginTop:8}}>out of 100</div></div>)}

function Slider({label,value,onChange,min,max,step,format,color,tip}){
  min=min||0;max=max||100;step=step||1;color=color||"#22c55e";
  var pctV=((value-min)/(max-min))*100;
  return(<div style={{marginBottom:18}}>
    {label&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <label style={{fontSize:13,fontWeight:500,color:"#94a3b8",fontFamily:"Outfit,sans-serif",display:"flex",alignItems:"center"}}>{label}{tip&&<Tip text={tip}/>}</label>
      <span style={{fontSize:15,fontWeight:700,color:color,fontFamily:"Outfit,sans-serif"}}>{format?format(value):value}</span>
    </div>}
    <div style={{position:"relative",height:32,display:"flex",alignItems:"center"}}>
      <div style={{position:"absolute",width:"100%",height:6,borderRadius:3,background:"rgba(255,255,255,0.06)"}}/>
      <div style={{position:"absolute",width:pctV+"%",height:6,borderRadius:3,background:color,transition:"width 0.1s"}}/>
      <input type="range" min={min} max={max} step={step} value={value} onChange={function(e){onChange(Number(e.target.value))}}
        style={{position:"absolute",width:"100%",height:6,opacity:0,cursor:"pointer",margin:0,zIndex:2}}/>
      <div style={{position:"absolute",left:"calc("+pctV+"% - 10px)",width:20,height:20,borderRadius:"50%",background:color,border:"3px solid #0f1628",boxShadow:"0 2px 8px rgba(0,0,0,0.4)",pointerEvents:"none",transition:"left 0.1s"}}/>
    </div>
  </div>)
}

function MiniChart({data,width,height,color,fillColor,labels,yPrefix,showDots}){
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
    {showDots!==false&&pts.filter(function(_,i){return i===0||i===pts.length-1||data.length<=12}).map(function(p,i){return <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="#0f1628" strokeWidth="2"/>})}
    {labels!==false&&pts.filter(function(_,i){return i===0||i===pts.length-1||(data.length<=12&&data.length>2&&i%Math.ceil(data.length/6)===0)}).map(function(p,i){return <text key={"t"+i} x={p.x} y={svgH-2} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="Outfit,sans-serif">{p.l}</text>})}
  </svg>)
}

function MultiLineChart({series,width,height,labels,showYAxis}){
  height=height||140;
  if(!series||series.length===0||!series[0].data||series[0].data.length<2)return null;
  var allV=[];series.forEach(function(s){s.data.forEach(function(d){allV.push(d.v)})});
  var maxV=Math.max.apply(null,allV);var minV=Math.min.apply(null,allV.filter(function(v){return v>=0}));
  minV=Math.min(minV,0);var range=maxV-minV||1;
  var lPad=showYAxis?52:12;var pad=12;var svgW=600;var svgH=height;var plotW=svgW-lPad-pad;var plotH=svgH-pad-10-20;
  var len=series[0].data.length;
  // Y-axis ticks
  var yTicks=[];
  if(showYAxis){
    var nTicks=4;for(var ti=0;ti<=nTicks;ti++){var tv=minV+range*(ti/nTicks);yTicks.push({v:tv,y:pad+10+(1-ti/nTicks)*plotH})}
  }
  return(<svg viewBox={"0 0 "+svgW+" "+svgH} style={{width:"100%",height:height}}>
    {showYAxis&&yTicks.map(function(t,i){return(<g key={"yt"+i}>
      <line x1={lPad} y1={t.y} x2={svgW-pad} y2={t.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
      <text x={lPad-6} y={t.y+4} textAnchor="end" fill="#475569" fontSize="9" fontFamily="Outfit,sans-serif">{fmtC(t.v)}</text>
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
      return <text key={"l"+i} x={x} y={svgH-2} textAnchor={i===0?"start":i===len-1?"end":"middle"} fill="#64748b" fontSize="10" fontFamily="Outfit,sans-serif">{d.l}</text>}).filter(Boolean)}
  </svg>)
}

function Toggle({value,onChange,label,sub}){
  return(<div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:12,background:value?"rgba(34,197,94,0.06)":"rgba(0,0,0,0.1)",border:value?"1px solid rgba(34,197,94,0.12)":"1px solid rgba(255,255,255,0.04)",marginBottom:12}}>
    <button onClick={function(){onChange(!value)}} style={{width:40,height:22,borderRadius:11,border:"none",cursor:"pointer",position:"relative",background:value?"rgba(34,197,94,0.4)":"rgba(255,255,255,0.1)",flexShrink:0}}><div style={{width:16,height:16,borderRadius:"50%",background:value?"#22c55e":"#64748b",position:"absolute",top:3,left:value?21:3,transition:"all .2s"}}/></button>
    <div><div style={{fontSize:13,fontWeight:500,color:value?"#22c55e":"#f1f5f9"}}>{label}</div>{sub&&<div style={{fontSize:11,color:"#64748b"}}>{sub}</div>}</div>
  </div>)
}

function TabBtn({active,label,onClick,color}){color=color||"#22c55e";return(<button onClick={onClick} style={{padding:"8px 16px",borderRadius:10,border:"none",background:active?"rgba(34,197,94,0.12)":"rgba(255,255,255,0.04)",color:active?color:"#64748b",fontSize:12,fontWeight:active?700:500,fontFamily:"Outfit,sans-serif",cursor:"pointer",transition:"all .2s"}}>{label}</button>)}

function AdvisorCTA({msg}){
  return(<div style={{marginTop:16,padding:"20px 24px",borderRadius:14,background:"linear-gradient(135deg,rgba(34,197,94,0.06),rgba(96,165,250,0.06))",border:"1px solid rgba(34,197,94,0.15)",textAlign:"center"}}>
    <div style={{fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>{msg||"Ready to take action?"}</div>
    <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6,marginBottom:14,maxWidth:380,margin:"0 auto 14px"}}>A financial advisor can help you build a personalized plan, choose the right investments, and stay on track for your goals.</div>
    <a href="#" onClick={function(e){e.preventDefault()}} style={{display:"inline-block",padding:"12px 28px",borderRadius:12,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",fontSize:14,fontWeight:700,textDecoration:"none",fontFamily:"Outfit,sans-serif",boxShadow:"0 4px 15px rgba(34,197,94,0.3)"}}>Talk to a Financial Advisor →</a>
    <div style={{fontSize:10,color:"#475569",marginTop:8}}>Free consultation · No commitment</div>
  </div>);
}
function NavButtons({tab,goTab}){
  var order=["learn","achieve","inaction","assumptions","situation","debts","invest","portfolio","retirement","save","earn","cost","goals","score","reports"];
  var idx=order.indexOf(tab);if(idx<0)return null;
  var prev=idx>0?order[idx-1]:null;var next=idx<order.length-1?order[idx+1]:null;
  var labels={learn:"Learn",achieve:"Your MN",inaction:"Cost of Inaction",assumptions:"You",situation:"Income & Exp",debts:"Debts",invest:"Invest Options",portfolio:"Your Portfolio",retirement:"Retirement",save:"Save More?",earn:"Earn",cost:"Opp. Cost",goals:"Int. Needs",score:"Score",reports:"Reports"};
  return(<div style={{display:"flex",justifyContent:prev&&next?"space-between":next?"flex-end":"flex-start",marginTop:20,gap:12}}>
    {prev&&<button onClick={function(){goTab(prev)}} style={{background:"rgba(255,255,255,0.04)",color:"#64748b",border:"1px solid rgba(255,255,255,0.08)",padding:"12px 24px",borderRadius:12,fontSize:14,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer"}}>← {labels[prev]}</button>}
    {next&&<button className="bp" onClick={function(){goTab(next)}}>{labels[next]} →</button>}
  </div>)
}

export default function App(){
  var _tab=useState("assumptions"),tab=_tab[0],setTab=_tab[1];
  var _sd=useState(false),setupDone=_sd[0],setSetupDone=_sd[1];
  // Income
  var _age=useState(""),age=_age[0],setAge=_age[1];
  var _mi=useState(""),monthlyIncome=_mi[0],setMonthlyIncome=_mi[1];
  var _exp=useState(DEFAULT_EXP),expenses=_exp[0],setExpenses=_exp[1];
  var nEId=useRef(6);
  var _oh=useState(false),ownsHome=_oh[0],setOwnsHome=_oh[1];
  var _vac=useState(""),vacationAnnual=_vac[0],setVacationAnnual=_vac[1];
  var _cm=useState(false),coupleMode=_cm[0],setCoupleMode=_cm[1];
  var _p2i=useState(""),partner2Income=_p2i[0],setPartner2Income=_p2i[1];
  var _hasRental=useState(false),hasRental=_hasRental[0],setHasRental=_hasRental[1];
  var _rentalEq=useState(""),rentalEquity=_rentalEq[0],setRentalEquity=_rentalEq[1];
  var _rentalNet=useState(""),rentalNetIncome=_rentalNet[0],setRentalNetIncome=_rentalNet[1];
  // Debts
  var _db=useState([{id:1,name:"",balance:"",rate:"",minPayment:""}]),debts=_db[0],setDebts=_db[1];
  var _nd=useState(false),noDebts=_nd[0],setNoDebts=_nd[1];
  var _nmort=useState(false),noMortgage=_nmort[0],setNoMortgage=_nmort[1];
  var _mbal=useState(""),mortgageBalance=_mbal[0],setMortgageBalance=_mbal[1];
  var _mrate=useState(""),mortgageRate=_mrate[0],setMortgageRate=_mrate[1];
  var _mpay=useState(""),mortgagePayment=_mpay[0],setMortgagePayment=_mpay[1];
  var _myrs=useState(""),mortgageYearsLeft=_myrs[0],setMortgageYearsLeft=_myrs[1];
  var _ncar=useState(false),noCarLoan=_ncar[0],setNoCarLoan=_ncar[1];
  var _cbal=useState(""),carBalance=_cbal[0],setCarBalance=_cbal[1];
  var _crate=useState(""),carRate=_crate[0],setCarRate=_crate[1];
  var _cpay=useState(""),carPayment=_cpay[0],setCarPayment=_cpay[1];
  var _cyrs=useState(""),carYearsLeft=_cyrs[0],setCarYearsLeft=_cyrs[1];
  var nDId=useRef(2);
  // Retirement
  var _ra=useState(""),retirementAge=_ra[0],setRetirementAge=_ra[1];
  var _yp=useState(""),yearsPostRet=_yp[0],setYearsPostRet=_yp[1];
  var _di=useState(""),desiredIncome=_di[0],setDesiredIncome=_di[1];
  var _es=useState(""),existingSavings=_es[0],setExistingSavings=_es[1];
  var _ss=useState(""),socialSecurity=_ss[0],setSocialSecurity=_ss[1];
  var _mr=useState(false),magicRevealed=_mr[0],setMagicRevealed=_mr[1];
  var _retProf=useState(4),retProfileIdx=_retProf[0],setRetProfileIdx=_retProf[1];
  var _chartProf=useState(-1),chartProfileIdx=_chartProf[0],setChartProfileIdx=_chartProf[1];
  var _chartRetProf=useState(3),chartRetireIdx=_chartRetProf[0],setChartRetireIdx=_chartRetProf[1];
  // Invest
  var _sn=useState(false),showNom=_sn[0],setShowNom=_sn[1];
  var _projYrs=useState(10),projYears=_projYrs[0],setProjYears=_projYrs[1];
  var _custInfl=useState(2.5),customInflation=_custInfl[0],setCustomInflation=_custInfl[1];
  var _showScen=useState(true),showScenarios=_showScen[0],setShowScenarios=_showScen[1];
  var _custRet=useState(""),customReturn=_custRet[0],setCustomReturn=_custRet[1];
  var _scenProf=useState(5),scenProfileIdx=_scenProf[0],setScenProfileIdx=_scenProf[1];
  var _costNSProf=useState(4),costNSProfileIdx=_costNSProf[0],setCostNSProfileIdx=_costNSProf[1];
  // Portfolio
  var _pAlloc=useState([0,0,0,0,30,40,30]),portAlloc=_pAlloc[0],setPortAlloc=_pAlloc[1];
  var _pcAlloc=useState([0,0,0,0,20,30,50]),portContribAlloc=_pcAlloc[0],setPortContribAlloc=_pcAlloc[1];
  // Save
  var _savSliders=useState({}),savSliders=_savSliders[0],setSavSliders=_savSliders[1];
  // Earn
  var _extraIncome=useState(""),extraIncome=_extraIncome[0],setExtraIncome=_extraIncome[1];
  var _eiTemp=useState(false),eiTemporary=_eiTemp[0],setEiTemporary=_eiTemp[1];
  var _eiYears=useState("5"),eiYears=_eiYears[0],setEiYears=_eiYears[1];
  // Cost in Retirement
  var _costName=useState(""),costItemName=_costName[0],setCostItemName=_costName[1];
  var _costPrice=useState(""),costItemPrice=_costPrice[0],setCostItemPrice=_costPrice[1];
  var _costProfile=useState(4),costProfileIdx=_costProfile[0],setCostProfileIdx=_costProfile[1];
  // Goals
  var _goals=useState([{id:1,name:"",amount:"",years:"",profileIdx:4}]),goals=_goals[0],setGoals=_goals[1];
  var nGId=useRef(2);
  // Score
  var _showRec=useState(true),showRec=_showRec[0],setShowRec=_showRec[1];
  // Achieving It simulator
  var _simSav=useState(null),simSav=_simSav[0],setSimSav=_simSav[1];
  var _simMo=useState(null),simMo=_simMo[0],setSimMo=_simMo[1];
  var _simRet=useState(null),simRet=_simRet[0],setSimRet=_simRet[1];
  var _manualMoSav=useState(""),manualMonthlySav=_manualMoSav[0],setManualMonthlySav=_manualMoSav[1];
  var _legacy=useState(""),legacy=_legacy[0],setLegacy=_legacy[1];
  var _assetTax=useState(0),assetTax=_assetTax[0],setAssetTax=_assetTax[1];
  // Reverse calculator: "When can I retire?"
  var _revDes=useState(""),revDes=_revDes[0],setRevDes=_revDes[1];
  var _revYrs=useState(""),revYrs=_revYrs[0],setRevYrs=_revYrs[1];
  var _revSS=useState(""),revSS=_revSS[0],setRevSS=_revSS[1];
  var _revSav=useState(""),revSav=_revSav[0],setRevSav=_revSav[1];
  var _revMo=useState(""),revMo=_revMo[0],setRevMo=_revMo[1];
  var _revRet=useState(4.0),revRet=_revRet[0],setRevRet=_revRet[1];
  var _revRetProf=useState(4),revRetProf=_revRetProf[0],setRevRetProf=_revRetProf[1]; // retirement profile idx, default 60/40
  // Cost of Inaction tab
  var _ciH=useState(20),ciH=_ciH[0],setCiH=_ciH[1];
  var _ciD=useState(5),ciDelayProf=_ciD[0],setCiDelayProf=_ciD[1];
  var _ciBase=useState(0),ciBase=_ciBase[0],setCiBase=_ciBase[1]; // 0=Vault, 1=Cash, 2=CDs
  var _ciSav=useState(null),ciSav=_ciSav[0],setCiSav=_ciSav[1];
  var _ciMo=useState(null),ciMo=_ciMo[0],setCiMo=_ciMo[1];

  var q="'";
  var INFL=customInflation/100;
  var nAge=Number(age)||0, nInc=Number(monthlyIncome)||0;
  var nP2I=coupleMode?(Number(partner2Income)||0):0;
  var nRentalEq=hasRental?(Number(rentalEquity)||0):0;
  var nRentalNet=hasRental?(Number(rentalNetIncome)||0):0;
  var totalIncome=nInc+nP2I+nRentalNet;
  var nVac=(Number(vacationAnnual)||0)/12;
  var totExp=expenses.reduce(function(s,e){return s+(Number(e.amount)||0)},0)+nVac;
  var nMortPay=(!ownsHome||noMortgage)?0:(Number(mortgagePayment)||0);
  var nCarPay=noCarLoan?0:(Number(carPayment)||0);
  var nMortYrs=(!ownsHome||noMortgage)?0:(Number(mortgageYearsLeft)||0);
  var nCarYrs=noCarLoan?0:(Number(carYearsLeft)||0);
  var totalMonthlyObligations=totExp+nMortPay+nCarPay;
  var incomeFilledExp=expenses.filter(function(e){return e.amount!==""}).length;
  var hasIncomeData=monthlyIncome!==""&&totalIncome>0&&incomeFilledExp>=5;
  var mSavComputed=totalIncome-totalMonthlyObligations;
  var mSav=hasIncomeData?mSavComputed:(Number(manualMonthlySav)||0);
  var savRate=totalIncome>0?(mSavComputed/totalIncome)*100:0;
  var nRetAge=Number(retirementAge)||65, nYP=Number(yearsPostRet)||25;
  var nDes=Number(desiredIncome)||0, nEx=Number(existingSavings)||0;
  var totalNetWorth=nEx+nRentalEq;
  var nSSRaw=Number(socialSecurity)||0;
  var nLegacy=Number(legacy)||0;
  var ytr=Math.max(nRetAge-nAge,0);
  var nSS=ytr>0&&nSSRaw>0?nSSRaw/Math.pow(1+INFL,ytr):nSSRaw;
  var totDebt=debts.reduce(function(s,d){return s+(Number(d.balance)||0)},0);
  var mortBal=(!ownsHome||noMortgage)?0:(Number(mortgageBalance)||0);
  var carBal=noCarLoan?0:(Number(carBalance)||0);
  var totalDebtAll=totDebt+mortBal+carBal;
  var nEI=Number(extraIncome)||0;
  var nEIYrs=Number(eiYears)||5;
  var effectiveMSav=mSav+nEI;

  // ADJUSTED PROFILES: recalculate real returns based on custom inflation
  var TAX=assetTax/100;
  var adjProfiles=useMemo(function(){return PROFILES.map(function(p){
    return Object.assign({},p,{realReturn:p.nomReturn-INFL-TAX,nomReturn:p.nomReturn-TAX});
  })},[INFL,TAX]);
  function adjProfByHorizon(y){if(y<1)return adjProfiles[0];if(y<2)return adjProfiles[1];if(y<3)return adjProfiles[3];if(y<5)return adjProfiles[4];if(y<10)return adjProfiles[5];return adjProfiles[6]}

  // allProfiles: adjProfiles + custom if defined
  var custR=Number(customReturn)||0;
  var allProfiles=useMemo(function(){
    var p=adjProfiles.slice();
    if(custR>0)p.push({id:"custom",name:"Custom",nomReturn:custR/100-TAX,realReturn:custR/100-INFL-TAX,desc:"Your custom return rate.",icon:"⚙️",color:"#e879f9",risk:7,vol:0});
    return p;
  },[adjProfiles,custR,INFL,TAX]);

  // Debt payoff events — when these end, monthly savings increase
  var debtEvents=useMemo(function(){
    var ev=[];
    if(nMortPay>0&&nMortYrs>0)ev.push({endsAtYear:nMortYrs,monthlyAmount:nMortPay,name:"Mortgage"});
    if(nCarPay>0&&nCarYrs>0)ev.push({endsAtYear:nCarYrs,monthlyAmount:nCarPay,name:"Car Loan"});
    return ev;
  },[nMortPay,nMortYrs,nCarPay,nCarYrs]);

  // Portfolio allocation — works with allProfiles (base 7 + optional custom)
  var portReturn=useMemo(function(){
    var totalAlloc=portAlloc.reduce(function(s,v){return s+v},0);
    if(totalAlloc===0)return{real:0,nom:0};
    var wReal=0,wNom=0;
    allProfiles.forEach(function(p,i){var a=portAlloc[i]||0;wReal+=a/100*p.realReturn;wNom+=a/100*p.nomReturn});
    return{real:wReal,nom:wNom};
  },[portAlloc,allProfiles]);

  var portContribReturn=useMemo(function(){
    var totalAlloc=portContribAlloc.reduce(function(s,v){return s+v},0);
    if(totalAlloc===0)return{real:0,nom:0};
    var wReal=0,wNom=0;
    allProfiles.forEach(function(p,i){var a=portContribAlloc[i]||0;wReal+=a/100*p.realReturn;wNom+=a/100*p.nomReturn});
    return{real:wReal,nom:wNom};
  },[portContribAlloc,allProfiles]);

  // Blended portfolio return: weighted average of existing savings return & contribution return
  var portAllocTotal=portAlloc.reduce(function(s,v){return s+v},0);
  var portContribAllocTotal=portContribAlloc.reduce(function(s,v){return s+v},0);
  var hasPortfolio=portAllocTotal===100&&portContribAllocTotal===100;
  var blendedPortReturn=useMemo(function(){
    if(!hasPortfolio)return null;
    var totalContrib=Math.max(mSav,0)*12*Math.max(ytr,10);
    var w1=nEx;var w2=totalContrib;var tot=w1+w2;
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
    if(retProfileIdx===-1&&hasPortfolio)return"🎛️ My Portfolio";
    var p=allProfiles[Math.max(retProfileIdx,0)];
    return p?p.icon+" "+p.name:adjProfiles[4].icon+" "+adjProfiles[4].name;
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
  var chartAccumLabel=chartProfileIdx===-1&&hasPortfolio?"🎛️ My Portfolio":(chartProfileIdx>=0?(chartProfileIdx<adjProfiles.length?adjProfiles[chartProfileIdx]:allProfiles[chartProfileIdx]):adjProfiles[0]).icon+" "+(chartProfileIdx>=0?(chartProfileIdx<adjProfiles.length?adjProfiles[chartProfileIdx]:allProfiles[chartProfileIdx]):adjProfiles[0]).name;
  var chartRetireLabel=chartRetireIdx===-1&&hasPortfolio?"🎛️ My Portfolio":adjProfiles[Math.max(chartRetireIdx,0)].icon+" "+adjProfiles[Math.max(chartRetireIdx,0)].name;
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
  var monthlyNeeded=useMemo(function(){if(magic.real<=0||ytr<=0)return[];
    var list=adjProfiles.map(function(pr){
      var projectedAtRetire=fvVariable(nEx,mSav,pr.realReturn,ytr,debtEvents);
      var gap=Math.max(magic.real-projectedAtRetire,0);
      if(gap<=0)return Object.assign({},pr,{monthly:0,surplus:projectedAtRetire-magic.real,projected:projectedAtRetire});
      var m=mR(pr.realReturn),n=ytr*12;
      var mo=pr.realReturn===0||m===0?gap/n:gap/((Math.pow(1+m,n)-1)/m);
      return Object.assign({},pr,{monthly:mo,surplus:0,projected:projectedAtRetire});
    });
    if(hasPortfolio&&blendedPortReturn!=null){
      var r=blendedPortReturn,proj=fvVariable(nEx,mSav,r,ytr,debtEvents);
      var gap=Math.max(magic.real-proj,0);var mo=0;
      if(gap>0){var m=mR(r),n=ytr*12;mo=r===0||m===0?gap/n:gap/((Math.pow(1+m,n)-1)/m)}
      list.unshift({id:"myportfolio",name:"My Portfolio",icon:"🎛️",realReturn:r,nomReturn:r+INFL,color:"#e879f9",monthly:mo,surplus:gap<=0?proj-magic.real:0,projected:proj});
    }
    return list;
  },[magic.real,nEx,mSav,ytr,adjProfiles,debtEvents,hasPortfolio,blendedPortReturn,INFL]);

  // Year-by-year projection — variable cash flow with debt payoff events
  var ybYData=useMemo(function(){if(ytr<=0||nDes<=0)return[];
    return yearByYear(nEx,mSav,chartAccumReturn,ytr,nYP,desiredAfterSS,INFL,debtEvents,chartRetireReturn);
  },[nEx,mSav,chartAccumReturn,chartRetireReturn,ytr,nYP,desiredAfterSS,INFL,debtEvents]);

  // Investment projections (variable years)
  var projs=useMemo(function(){
    return allProfiles.map(function(pr){
      var rFV=fvVariable(nEx,mSav,pr.realReturn,projYears,debtEvents);
      var nFV=fvVariable(nEx,mSav,pr.nomReturn,projYears,debtEvents);
      var tc=nEx;for(var y=0;y<projYears;y++){var extra=0;debtEvents.forEach(function(ev){if(y>=ev.endsAtYear)extra+=ev.monthlyAmount});tc+=(mSav+extra)*12}
      return Object.assign({},pr,{nFV:nFV,rFV:rFV,tc:tc});
    });
  },[mSav,nEx,projYears,allProfiles,debtEvents]);

  var maxProj=useMemo(function(){return Math.max.apply(null,projs.map(function(p){return showNom?p.nFV:p.rFV}).concat([1]))},[projs,showNom]);

  // Scenarios (pessimistic / base / optimistic)
  var scenarios=useMemo(function(){if(!showScenarios)return null;
    var baseR=scenProfileIdx===-1&&blendedPortReturn!=null?blendedPortReturn:(allProfiles[Math.min(scenProfileIdx,allProfiles.length-1)]||allProfiles[5]).realReturn;
    var sc=["Pessimistic","Base","Optimistic"];var spreads=[-SCENARIO_SPREAD,0,SCENARIO_SPREAD];
    var colors=["#ef4444","#60a5fa","#22c55e"];
    return sc.map(function(name,si){
      var r=baseR+spreads[si];
      var step=projYears>30?10:projYears>15?5:projYears>8?2:1;
      var data=[];for(var y=0;y<=projYears;y++){
        var v=fvVariable(nEx,mSav,r,y,debtEvents);
        var showLabel=y===0||y===projYears||(y%step===0);
        data.push({l:showLabel?"Yr "+y:"",v:v});
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

  // Debt analysis — combines mortgage, car loan, and other debts
  var allDebts=useMemo(function(){
    var list=[];
    if(!noMortgage&&mortBal>0&&(Number(mortgageRate)||0)>0)
      list.push({id:"mortgage",name:"Mortgage",balance:String(mortBal),rate:mortgageRate,minPayment:mortgagePayment});
    if(!noCarLoan&&carBal>0&&(Number(carRate)||0)>0)
      list.push({id:"carloan",name:"Car Loan",balance:String(carBal),rate:carRate,minPayment:carPayment});
    debts.forEach(function(d){if((Number(d.balance)||0)>0&&(Number(d.rate)||0)>0)list.push(d)});
    return list;
  },[noMortgage,mortBal,mortgageRate,mortgagePayment,noCarLoan,carBal,carRate,carPayment,debts]);

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
      data:Array.from({length:31},function(_,y){return{l:"Yr "+y,v:earnFV(y)}})};
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
  var goalRetImpact=useMemo(function(){if(totalGoalMo<=0||magic.real<=0||ytr<=0)return null;
    var full=fvVariable(nEx,mSav,goalImpactRate,ytr,debtEvents);
    var bal=nEx;
    for(var y=0;y<ytr;y++){
      var goalDrain=0;
      goalCalcs.forEach(function(g){if(g.valid&&y<g.nYrs)goalDrain+=g.mo});
      var extraSav=0;
      if(debtEvents){debtEvents.forEach(function(ev){if(y>=ev.endsAtYear)extraSav+=ev.monthlyAmount})}
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
      var ssToday=rSS>0?rSS/Math.pow(1+INFL,yrsToRetire):0;
      var afterSS=Math.max(rDes-ssToday,0);
      if(afterSS<=0)return{age:candidateAge,projected:projected,mn:0,surplus:projected,yrsToRetire:yrsToRetire,ssToday:ssToday,afterSS:0,retR:retR};
      var legPV=nLegacy>0?nLegacy/Math.pow(1+retR,rYrs):0;
      var mn=pvA(afterSS,retR,rYrs)+legPV;
      if(projected>=mn)return{age:candidateAge,projected:projected,mn:mn,surplus:projected-mn,yrsToRetire:yrsToRetire,ssToday:ssToday,afterSS:afterSS,retR:retR};
    }
    return{age:null,message:"Even at age 100, your savings won't reach the required Magic Number. Consider increasing savings, return, or reducing desired income."};
  },[revDes,revYrs,revSS,revSav,revMo,revRet,revRetProf,nAge,adjProfiles,INFL,nDes,nYP,nSSRaw,nEx,mSav,nLegacy]);

  // Health Score (enhanced)
  var hScore=useMemo(function(){
    var s=0,bd=[],recs=[];
    var sr=savRate>=25?30:savRate>=20?25:savRate>=15?20:savRate>=10?15:savRate>=5?10:savRate>0?5:0;
    s+=sr;bd.push({l:"Savings Rate",s:sr,m:30,st:sr>=20?"good":sr>=10?"ok":"bad"});
    if(sr<20)recs.push({cat:"Savings Rate",priority:sr<10?1:2,text:sr<10?"Aim to save at least 10% of income. Start with small cuts to discretionary spending.":"Great progress! Push toward 20% by optimizing your biggest expenses."});
    var ds=25;
    if(!noDebts&&probDebts.length>0){var t=probDebts.reduce(function(s,d){return s+d.bal},0);ds=t>totalIncome*12?5:t>totalIncome*6?10:t>totalIncome*3?15:20;
      recs.push({cat:"Debt",priority:ds<15?1:2,text:ds<15?"High-interest debt is your #1 priority. Pay off debts above 6% APR before investing.":"Good progress on debt. Focus on clearing remaining high-interest balances."})}
    else if(!noDebts&&totalDebtAll>0)ds=22;
    s+=ds;bd.push({l:"Debt Health",s:ds,m:25,st:ds>=20?"good":ds>=15?"ok":"bad"});
    var rs=0;
    if(magic.real>0&&ytr>0){var proj=fvVariable(nEx,mSav,0.04,ytr,debtEvents);var otp=proj/magic.real;
      rs=otp>=1?25:otp>=0.8?22:otp>=0.6?18:otp>=0.4?14:otp>=0.2?10:5;
      if(otp<0.8)recs.push({cat:"Retirement",priority:otp<0.4?1:2,text:otp<0.4?"You're significantly behind on retirement. Consider increasing savings rate or exploring higher-return investments.":"You're making progress but may need to save more or invest more aggressively to reach your Magic Number."})}
    else if(nEx>0)rs=10;
    s+=rs;
    var rOT=magic.real>0&&ytr>0?((fvVariable(nEx,mSav,0.04,ytr,debtEvents))/magic.real*100).toFixed(0):null;
    bd.push({l:"Retirement Progress",s:rs,m:25,st:rs>=20?"good":rs>=14?"ok":"bad",det:rOT?rOT+"% on track (60/40, "+ytr+"yr)":null});
    var ps=nEx>0&&mSav>0?20:nEx>0||mSav>0?12:3;
    s+=ps;bd.push({l:"Savings Habit",s:ps,m:20,st:ps>=15?"good":ps>=8?"ok":"bad",det:ps>=15?"Saving monthly + existing savings":"Tip: combine monthly saving with invested assets"});
    if(ps<15)recs.push({cat:"Savings Habit",priority:3,text:"Build consistency: automate a monthly transfer to savings, even if it's small."});
    if(emergencyMonths<6&&totalMonthlyObligations>0)recs.push({cat:"Emergency Fund",priority:emergencyMonths<3?1:2,text:emergencyMonths<3?"Critical: less than 3 months of expenses saved. Build an emergency fund before investing aggressively.":"You have "+emergencyMonths.toFixed(0)+" months covered. Build toward 12+ months for solid protection."});
    recs.sort(function(a,b){return a.priority-b.priority});
    return{s:s,bd:bd,recs:recs};
  },[savRate,noDebts,probDebts,totalDebtAll,totalIncome,magic.real,nEx,mSav,ytr,emergencyMonths,totExp,debtEvents]);

  var bSR=useMemo(function(){return gB(BENCH_SR,nAge)},[nAge]);
  var bNW=useMemo(function(){return gB(BENCH_NW,nAge)},[nAge]);

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
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700;9..144,800;9..144,900&family=Outfit:wght@300;400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}body,#root{background:#070b14;color:#f1f5f9;font-family:Outfit,sans-serif;min-height:100vh}input[type="number"]::-webkit-inner-spin-button,input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type="number"]{-moz-appearance:textfield}.bp{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;padding:14px 32px;border-radius:14px;font-size:15px;font-weight:700;font-family:Outfit,sans-serif;cursor:pointer;box-shadow:0 4px 20px rgba(34,197,94,0.25)}.bp:disabled{opacity:.3;cursor:not-allowed}.bs{background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:Outfit,sans-serif}.fi{animation:fi .4s ease-out forwards}@keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.ba{animation:ba .8s ease-out forwards}@keyframes ba{from{width:0%}}.ts::-webkit-scrollbar{display:none}.ts{-ms-overflow-style:none;scrollbar-width:none}input[type="range"]{-webkit-appearance:none;appearance:none;background:transparent}input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:1px;height:1px;opacity:0}`}</style>
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#070b14 0%,#0a1020 50%,#070b14 100%)"}}>
      <div style={{padding:"20px 20px 0",textAlign:"center"}}><h1 style={{fontFamily:"Fraunces,serif",fontSize:24,fontWeight:800,color:"#f1f5f9"}}><span style={{color:"#60a5fa"}}>🎯</span> Magic Number <span style={{fontSize:12,fontWeight:600,color:"#60a5fa",background:"rgba(96,165,250,0.1)",padding:"3px 10px",borderRadius:6,marginLeft:6}}>PRO</span></h1></div>
      <div className="ts" style={{display:"flex",gap:4,padding:"16px 16px 0",overflowX:"auto",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        {TABS.map(function(t){var a=tab===t.id,d=t.id!=="assumptions"&&t.id!=="achieve"&&t.id!=="inaction"&&t.id!=="learn"&&t.id!=="dashboard"&&!hasData;return(
          <button key={t.id} onClick={function(){if(!d)goTab(t.id)}} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",borderRadius:"10px 10px 0 0",border:"none",background:a?"rgba(34,197,94,0.1)":"transparent",color:a?"#22c55e":d?"#334155":"#64748b",fontSize:13,fontWeight:a?700:500,fontFamily:"Outfit,sans-serif",cursor:d?"not-allowed":"pointer",whiteSpace:"nowrap",borderBottom:a?"2px solid #22c55e":"2px solid transparent",opacity:d?0.4:1,flexShrink:0}}>
            <span style={{fontSize:15}}>{t.icon}</span>{t.label}</button>)})}
      </div>
      <div style={{maxWidth:720,margin:"0 auto",padding:"24px 16px 60px"}}>

{/* === DASHBOARD === */}
{tab==="dashboard"&&<div className="fi">{!hasData?
  <Cd><div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:48,marginBottom:16}}>🎯</div><h2 style={{fontFamily:"Fraunces,serif",fontSize:22,fontWeight:700,marginBottom:12}}>Welcome to Magic Number!</h2><p style={{color:"#94a3b8",fontSize:15,lineHeight:1.6,maxWidth:400,margin:"0 auto 24px"}}>Discover exactly how much you need to retire — and how to get there.</p><button className="bp" onClick={function(){goTab("learn")}}>Get Started →</button></div></Cd>
:<>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
    {[{l:"Monthly Savings",v:fmt(mSav),c:mSav>0?"#22c55e":"#ef4444",t:"situation"},{l:"Health Score",v:hScore.s+"/100",c:hScore.s>=70?"#22c55e":hScore.s>=40?"#eab308":"#ef4444",t:"score"}].map(function(s){return(
      <Cd key={s.l} style={{padding:18,marginBottom:0,textAlign:"center",cursor:"pointer"}} onClick={function(){goTab(s.t)}}><div style={{fontSize:10,color:"#64748b",fontWeight:500,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{s.l}</div><div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div></Cd>)})}
  </div>
  {magic.real>0&&<Cd glow="blue" style={{textAlign:"center"}} onClick={function(){goTab("retirement")}}>
    <div style={{fontSize:10,color:"#3b82f6",textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>Your Magic Number {nSS>0&&<span style={{color:"#22c55e",fontSize:9}}>(after retirement income)</span>}</div>
    <div style={{fontFamily:"Fraunces,serif",fontSize:34,fontWeight:800,color:"#60a5fa"}}>{fmt(magic.real)}</div>
    <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{"in today"+q+"s dollars · tap to explore"}</div>
    {nEx>0&&<div style={{marginTop:10}}><div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,width:Math.min(mD.p,100)+"%",background:mD.bc,transition:"width 1s"}}/></div><div style={{fontSize:10,color:mD.gc,marginTop:3,fontWeight:600}}>{mD.p>=100?"🎉 "+mD.p.toFixed(0)+"% — Ahead!":mD.p.toFixed(1)+"% saved"}</div></div>}
  </Cd>}
  <Cd onClick={function(){goTab("situation")}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Monthly Snapshot</div>
        <span style={{fontSize:15,fontWeight:600,color:"#f1f5f9"}}>{fmt(totalIncome)}</span><span style={{color:"#64748b",margin:"0 6px"}}>→</span>
        <span style={{fontSize:15,fontWeight:600,color:"#f87171"}}>{fmt(totalMonthlyObligations)}</span><span style={{color:"#64748b",margin:"0 6px"}}>=</span>
        <span style={{fontSize:15,fontWeight:700,color:mSav>=0?"#22c55e":"#ef4444"}}>{fmt(mSav)}</span></div>
      <span style={{color:"#334155",fontSize:18}}>›</span></div>
  </Cd>
  {!noDebts&&totalDebtAll>0&&<Cd onClick={function(){goTab("debts")}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Total Debt</div><span style={{fontSize:17,fontWeight:700,color:"#f87171"}}>{fmt(totalDebtAll)}</span></div><span style={{color:"#334155",fontSize:18}}>›</span></div></Cd>}
  {emergencyMonths<6&&totalMonthlyObligations>0&&<Cd glow="red" onClick={function(){goTab("debts")}}><div style={{fontSize:10,color:"#ef4444",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>⚠️ Emergency Fund</div><p style={{fontSize:13,color:"#fca5a5",lineHeight:1.5}}>Your savings cover <strong>{emergencyMonths.toFixed(1)} months</strong> of expenses. Build toward 12+ months.</p></Cd>}
  {savOpps.length>0&&<Cd glow="green" onClick={function(){goTab("save")}}><div style={{fontSize:10,color:"#16a34a",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>💡 Top Savings Opportunity</div><p style={{fontSize:13,color:"#94a3b8",lineHeight:1.5}}>Cut <strong style={{color:"#f1f5f9"}}>{savOpps[0].name}</strong> in half → <strong style={{color:"#22c55e"}}>{fmt(savOpps[0].saved)}/mo</strong>. 10yr: <strong style={{color:"#22c55e"}}>{fmt(savOpps[0].imp10)}</strong> <span style={{color:"#475569"}}>{"(today"+q+"s $, 60/40)"}</span>.</p></Cd>}
  {hScore.recs.length>0&&<Cd glow="gold" onClick={function(){goTab("score")}}><div style={{fontSize:10,color:"#a18207",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>🎯 Top Action Item</div><p style={{fontSize:13,color:"#fde68a",lineHeight:1.5}}>{hScore.recs[0].text}</p></Cd>}
</>}</div>}


{/* === LEARN === */}
{tab==="learn"&&<div className="fi">
  <Cd style={{textAlign:"center",padding:"28px 24px"}}>
    <div style={{fontSize:40,marginBottom:12}}>📖</div>
    <h2 style={{fontFamily:"Fraunces,serif",fontSize:22,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>Key Concepts</h2>
    <p style={{color:"#94a3b8",fontSize:14,lineHeight:1.6,maxWidth:420,margin:"0 auto"}}>
      Before you start, here are the key terms and concepts this app uses. Understanding these will help you make better financial decisions.
    </p>
  </Cd>

  <Cd><ST>🎯 The Magic Number</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      Your <strong style={{color:"#60a5fa"}}>Magic Number</strong> is the total amount of money you need to have saved by the day you retire. If you invest that amount at a conservative rate, it will generate enough income to fund your desired lifestyle for your entire retirement — and reach $0 on your last planned year.
    </p>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,marginTop:10}}>
      It depends on: how much you want to spend per month, how long your retirement will last, what other income you{"'ll"} have (Social Security, pension), and how you invest during retirement.
    </p>
  </Cd>

  <Cd><ST>💵 {"Today's Dollars vs Future Dollars"}</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      <strong style={{color:"#f1f5f9"}}>{"Today"+q+"s dollars"}</strong> means the purchasing power of money right now. Due to inflation, $100 today buys more than $100 in 20 years. This app shows everything in {"today"+q+"s dollars"} so you can compare numbers intuitively — $5,000/mo means $5,000 of {"today"+q+"s"} purchasing power, regardless of when it occurs.
    </p>
  </Cd>

  <Cd><ST>📈 Nominal vs Real Return</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      <strong style={{color:"#f1f5f9"}}>Nominal return</strong> is what your investment earns before accounting for inflation. <strong style={{color:"#f1f5f9"}}>Real return</strong> is what you actually gain in purchasing power — nominal return minus inflation.
    </p>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,marginTop:10}}>
      Example: if your investment earns 7.5% and inflation is 2.5%, your <strong style={{color:"#22c55e"}}>real return is 5.0%</strong> — {"that"+q+"s"} your actual wealth growth.
    </p>
  </Cd>

  <Cd><ST>🏦 Investment Profiles</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,marginBottom:12}}>
      Each profile represents a different mix of risk and return:
    </p>
    <div style={{display:"grid",gap:8}}>
      {PROFILES.map(function(p){return(
        <div key={p.id} style={{padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.15)",border:"1px solid rgba(255,255,255,0.04)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>{p.icon} {p.name}</span>
            <span style={{fontSize:12,color:p.color}}>{(p.nomReturn*100).toFixed(1)}% nom / {(p.realReturn*100).toFixed(1)}% real</span>
          </div>
          <div style={{fontSize:12,color:"#64748b",marginTop:4,lineHeight:1.5}}>{p.desc}</div>
        </div>)})}
    </div>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,marginTop:12}}>
      <strong style={{color:"#f1f5f9"}}>60/40</strong> means 60% stocks + 40% bonds — a classic balanced portfolio.
      <strong style={{color:"#f1f5f9"}}> 80/20</strong> is more aggressive (80% stocks, 20% bonds).
      <strong style={{color:"#f1f5f9"}}> 100% Equities</strong> is all stocks — highest potential return but most volatile.
    </p>
  </Cd>

  <Cd><ST>📊 Volatility</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      <strong style={{color:"#f1f5f9"}}>Volatility</strong> measures how much an investment{"'s"} value fluctuates year to year. A profile with 15% volatility means in any given year, your return could swing roughly ±15% from the average. Higher return profiles tend to have higher volatility — {"that"+q+"s"} the risk-reward tradeoff.
    </p>
  </Cd>

  <Cd><ST>💰 Current Savings vs Monthly Savings</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      <strong style={{color:"#f1f5f9"}}>Current savings</strong> is what you have today — bank accounts, 401k, IRA, brokerage accounts. This is your starting point.
    </p>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,marginTop:10}}>
      <strong style={{color:"#f1f5f9"}}>Monthly savings</strong> is income minus all expenses and debt payments — the money you add to your investments each month. Both grow through compounding over time.
    </p>
  </Cd>

  <Cd><ST>📐 Inflation</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      Inflation is the gradual increase in prices over time. At 2.5% annual inflation, something that costs $100 today will cost about $164 in 20 years. This app defaults to <strong style={{color:"#f1f5f9"}}>2.5%</strong> (historical US average) but you can adjust it.
    </p>
  </Cd>

  <Cd><ST>🏠 Real Estate Equity</ST>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>
      If you own rental properties, the <strong style={{color:"#f1f5f9"}}>equity</strong> (market value minus what you owe) counts toward your total assets but is <strong style={{color:"#fde68a"}}>not</strong> included in investment projections — real estate is illiquid (hard to sell quickly) and appreciates differently than stocks or bonds. Net rental income, however, is added to your monthly income.
    </p>
  </Cd>

  <Cd glow="green" style={{textAlign:"center",padding:"24px 20px"}}>
    <div style={{fontSize:14,fontWeight:600,color:"#22c55e",marginBottom:8}}>Ready to start?</div>
    <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.6,marginBottom:16}}>
      {"You"+q+"ll"} enter your basic info, explore investment options, and discover your Magic Number — the amount you need to retire comfortably.
    </p>
    <button className="bp" onClick={function(){goTab("achieve")}}>{"Let"+q+"s Go →"}</button>
  </Cd>
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === YOU === */}
{tab==="assumptions"&&<div className="fi">
  <Cd><ST sub="Additional settings that apply across all tabs.">About You</ST>
    {nAge>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
      {[{l:"Age",v:nAge},{l:"Retire at",v:nRetAge},{l:"Years in retirement",v:nYP},{l:"Savings",v:fmt(nEx)}].map(function(b){return(
        <div key={b.l} style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>{b.l}: <strong>{b.v}</strong></div>)})}
      <div style={{padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",fontSize:11,color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("achieve")}}>✏️ Edit in Your MN</div>
    </div>}
    <Toggle value={coupleMode} onChange={setCoupleMode} label="Couple / Family Mode" sub="Combine both partners across all tabs"/>
    <Toggle value={hasRental} onChange={setHasRental} label="I have rental or investment properties" sub="Real estate that generates income"/>
    {hasRental&&<>
      <NI label="Total rental property equity" value={rentalEquity} onChange={setRentalEquity} tip="Market value minus what you owe. Counted in total assets but NOT in investment projections (illiquid)."/>
      <NI label="Net monthly rental income" value={rentalNetIncome} onChange={setRentalNetIncome} tip="Rent collected MINUS all expenses. Only net profit."/>
      {nRentalEq>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",lineHeight:1.5,marginBottom:12}}>
        📐 Rental equity ({fmt(nRentalEq)}) is in total assets ({fmt(totalNetWorth)}) but not investment projections. Net rental income ({fmt(nRentalNet)}/mo) is added to monthly income.
        {nAge>0&&nRetAge>0&&nYP>0&&<span> At age {nRetAge+nYP}, property equity could be ~<strong>{fmt(Math.round(nRentalEq*Math.pow(1+INFL,nRetAge+nYP-nAge)))}</strong> (inflation-adjusted).</span>}
      </div>}
    </>}
  </Cd>
  <Cd><ST sub="Inflation erodes purchasing power. 2.5% is the historical US average.">Inflation</ST>
    <Slider label="Inflation Rate" value={customInflation} onChange={setCustomInflation} min={0} max={8} step={0.1} format={function(v){return v.toFixed(1)+"%"}} color="#f59e0b"/>
    {customInflation!==2.5&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#fde68a",marginTop:8}}>
      Custom inflation: {customInflation.toFixed(1)}%. All real returns adjusted accordingly.
    </div>}
  </Cd>
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === INCOME === */}
{tab==="situation"&&<div className="fi">
  <Cd><ST sub="Enter your monthly income and expenses.">Your Numbers</ST>
    <NI label={coupleMode?"Your monthly net income (after taxes)":"Monthly net income (after taxes)"} value={monthlyIncome} onChange={setMonthlyIncome} placeholder="" tip={"Take-home pay after all taxes."+(hasRental?" Do NOT include rental property income here — it's already counted from the You tab.":"")}/>
    {coupleMode&&<NI label="Partner's monthly net income" value={partner2Income} onChange={setPartner2Income} placeholder="" tip={"Partner's take-home pay after taxes."+(hasRental?" Do NOT include rental income.":"")}/>}
    <NI label="Annual vacation expenses" value={vacationAnnual} onChange={setVacationAnnual} placeholder="" tip="Total yearly vacation spending. We divide by 12 for monthly budget."/>
    {(nEx>0||nRentalEq>0)&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:12,color:"#93c5fd"}}>
      💰 Investable savings: <strong>{fmt(nEx)}</strong>{nRentalEq>0?" + 🏘️ rental equity: "+fmt(nRentalEq)+" = total assets: "+fmt(totalNetWorth):""} <span style={{color:"#475569"}}>(set in <span style={{color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("assumptions")}}>You tab</span>)</span>
    </div>}
  </Cd>
  <Cd>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <h3 style={{fontFamily:"Fraunces,serif",fontSize:17,fontWeight:600,color:"#f1f5f9",display:"flex",alignItems:"center"}}>Monthly Expenses<Tip text="Up to 15 categories. Mark ✂️ for discretionary."/></h3>
      {expenses.length<15&&<button className="bs" onClick={aE}>+ Add</button>}
    </div>
    {/* Own vs Rent toggle */}
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      <button onClick={function(){setOwnsHome(false)}} style={{flex:1,padding:"10px 14px",borderRadius:10,border:!ownsHome?"1px solid rgba(96,165,250,0.3)":"1px solid rgba(255,255,255,0.06)",background:!ownsHome?"rgba(96,165,250,0.08)":"rgba(0,0,0,0.1)",color:!ownsHome?"#93c5fd":"#64748b",fontSize:13,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer",textAlign:"center"}}>🏢 I Rent</button>
      <button onClick={function(){setOwnsHome(true)}} style={{flex:1,padding:"10px 14px",borderRadius:10,border:ownsHome?"1px solid rgba(34,197,94,0.3)":"1px solid rgba(255,255,255,0.06)",background:ownsHome?"rgba(34,197,94,0.08)":"rgba(0,0,0,0.1)",color:ownsHome?"#86efac":"#64748b",fontSize:13,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer",textAlign:"center"}}>🏠 I Own</button>
    </div>
    {ownsHome&&<div style={{padding:"12px 14px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:13,fontWeight:600,color:"#93c5fd"}}>🏠 Mortgage P+I</span>
        <Tip text="Principal + Interest only. Don't include property tax, insurance, or HOA — those go below. This syncs with the Debts tab."/>
      </div>
      <div style={{display:"flex",alignItems:"center",background:"#131c2e",borderRadius:12,border:"1px solid rgba(96,165,250,0.15)",padding:"0 16px"}}>
        <span style={{color:"#64748b",fontSize:15,fontWeight:600,marginRight:4}}>$</span>
        <input type="text" inputMode="numeric" value={(mortgagePayment&&!isNaN(Number(mortgagePayment))&&Number(mortgagePayment)>=1000)?Number(mortgagePayment).toLocaleString("en-US"):mortgagePayment} onChange={function(e){setMortgagePayment(e.target.value.replace(/,/g,"").replace(/[^0-9]/g,""))}} placeholder="" style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#93c5fd",fontSize:17,fontWeight:600,padding:"13px 0",fontFamily:"Outfit,sans-serif",width:"100%"}}/>
        <span style={{color:"#475569",fontSize:11}}>/mo</span>
      </div>
      {nMortPay>0&&<div style={{fontSize:10,color:"#475569",marginTop:6}}>Complete mortgage details (rate, balance, years) in <span style={{color:"#60a5fa",cursor:"pointer",textDecoration:"underline"}} onClick={function(){goTab("debts")}}>Debts tab</span>.</div>}
    </div>}
    {expenses.map(function(exp){var displayName=(exp.id===1&&exp.mortgageAlt)?(ownsHome?exp.mortgageAlt:"Housing / Rent"):exp.name;return(<div key={exp.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
      <input type="text" value={displayName} onChange={function(e){uE(exp.id,"name",e.target.value)}} placeholder="Category" style={{flex:1,minWidth:0,background:"#131c2e",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,color:"#f1f5f9",fontSize:13,padding:"11px 12px",fontFamily:"Outfit,sans-serif",outline:"none"}}/>
      <div style={{display:"flex",alignItems:"center",background:"#131c2e",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"0 12px",width:120,flexShrink:0}}><span style={{color:"#64748b",fontSize:13,fontWeight:600,marginRight:4}}>$</span>
        <input type="text" inputMode="numeric" value={(exp.amount&&!isNaN(Number(exp.amount))&&Number(exp.amount)>=1000)?Number(exp.amount).toLocaleString("en-US"):exp.amount} onChange={function(e){uE(exp.id,"amount",e.target.value.replace(/,/g,"").replace(/[^0-9]/g,""))}} placeholder="" style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#f1f5f9",fontSize:15,fontWeight:600,padding:"11px 0",fontFamily:"Outfit,sans-serif",width:"100%"}}/></div>
      <button onClick={function(){uE(exp.id,"discretionary",!exp.discretionary)}} style={{padding:"6px 8px",borderRadius:8,fontSize:10,fontWeight:600,border:"none",cursor:"pointer",flexShrink:0,background:exp.discretionary!==false?"rgba(245,158,11,0.1)":"rgba(96,165,250,0.1)",color:exp.discretionary!==false?"#f59e0b":"#60a5fa"}}>{exp.discretionary!==false?"✂️":"📌"}</button>
      {expenses.length>1&&<button onClick={function(){rE(exp.id)}} style={{width:34,height:34,borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",color:"#ef4444",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>}
    </div>)})}
    <div style={{display:"flex",gap:12,marginTop:8,fontSize:11,color:"#475569"}}><span>✂️ discretionary</span><span>📌 essential</span></div>
    {(function(){var filled=expenses.filter(function(e){return e.amount!==""}).length;return filled<5?
      <div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#fde68a",lineHeight:1.6}}>
        ⚠️ Fill in at least <strong>5 expense categories</strong> to unlock <span style={{color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("achieve")}}>Your MN</span>. You{"'ve"} completed <strong>{filled}/5</strong> so far.
      </div>
      :<div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#86efac"}}>
        ✅ {filled} expense categories filled — <span style={{cursor:"pointer",textDecoration:"underline"}} onClick={function(){goTab("achieve")}}>Your MN</span> is ready!
      </div>})()}
  </Cd>
  {nVac>0&&<Cd style={{padding:16}}><div style={{fontSize:12,color:"#64748b"}}>📅 Vacation: <strong style={{color:"#f1f5f9"}}>{fmt(Number(vacationAnnual))}/yr</strong> = <strong style={{color:"#f87171"}}>{fmt(nVac)}/mo</strong> added to expenses</div></Cd>}
  <Cd glow={mSav>0?"green":mSav<0?"red":null}>
    <h3 style={{fontFamily:"Fraunces,serif",fontSize:17,fontWeight:600,color:"#f1f5f9",marginBottom:14}}>Monthly Snapshot</h3>
    {totalIncome>0&&<div style={{height:26,borderRadius:8,overflow:"hidden",background:"rgba(255,255,255,0.04)",display:"flex",marginBottom:14}}>
      {totalMonthlyObligations>0&&<div style={{width:Math.min((totalMonthlyObligations/totalIncome)*100,100)+"%",background:"linear-gradient(90deg,#ef4444,#f87171)"}}/>}
      {mSav>0&&<div style={{width:(mSav/totalIncome)*100+"%",background:"linear-gradient(90deg,#22c55e,#4ade80)"}}/>}
    </div>}
    <div style={{display:"grid",gap:8,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#94a3b8"}}>Income{coupleMode||nRentalNet>0?" (total)":""}</span><span style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{fmt(totalIncome)}</span></div>
      {(coupleMode||nRentalNet>0)&&<div style={{paddingLeft:12,display:"grid",gap:4}}>
        {coupleMode&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569"}}><span>You: {fmt(nInc)}</span><span>Partner: {fmt(nP2I)}</span></div>}
        {nRentalNet>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569"}}><span>🏘️ Net rental income</span><span>{fmt(nRentalNet)}</span></div>}
      </div>}
      <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#94a3b8"}}>Expenses{nVac>0?" (incl. vacation)":""}</span><span style={{fontSize:15,fontWeight:600,color:"#f87171"}}>−{fmt(totExp)}</span></div>
      {nMortPay>0&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#94a3b8"}}>🏠 Mortgage P+I</span><span style={{fontSize:15,fontWeight:600,color:"#f87171"}}>−{fmt(nMortPay)}</span></div>}
      {nCarPay>0&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#94a3b8"}}>🚗 Car Loan</span><span style={{fontSize:15,fontWeight:600,color:"#f87171"}}>−{fmt(nCarPay)}</span></div>}
      <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:8,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:14,fontWeight:600,color:"#f1f5f9"}}>Monthly Savings</span><span style={{fontSize:19,fontWeight:800,color:mSav>0?"#22c55e":mSav<0?"#ef4444":"#94a3b8"}}>{fmt(mSav)}</span></div>
    </div>
    {mSav<0&&nEx>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.1)",fontSize:12,color:"#fca5a5",lineHeight:1.6,marginBottom:12}}>
      ⚠️ You spend <strong>{fmt(Math.abs(mSav))}/mo</strong> more than you earn. Your savings ({fmt(nEx)}) will be drained by {fmt(Math.abs(mSav)*12)}/yr, partially offset by investment returns. Projections account for this.
    </div>}
    {debtEvents.length>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#86efac",lineHeight:1.6}}>
      📈 Savings will increase when debts end:{debtEvents.map(function(ev){return " "+ev.name+" ends in "+ev.endsAtYear+"yr (+"+fmt(ev.monthlyAmount)+"/mo)"}).join(",")}
    </div>}
  </Cd>
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === DEBTS === */}
{tab==="debts"&&<div className="fi">
  {/* Mortgage — always shows if ownsHome, independent of noDebts */}
  {ownsHome&&<Cd>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontFamily:"Fraunces,serif",fontSize:17,fontWeight:600,color:"#f1f5f9"}}>🏠 Mortgage Details</h3>
    </div>
    {nMortPay>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.1)",fontSize:12,color:"#93c5fd",marginBottom:12}}>
      Monthly P+I: <strong>{fmt(nMortPay)}</strong> <span style={{color:"#475569"}}>(from Income & Exp tab)</span>
    </div>}
    {nMortPay===0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.1)",fontSize:12,color:"#fde68a",marginBottom:12}}>
      Enter your mortgage P+I in the <span style={{color:"#60a5fa",cursor:"pointer",textDecoration:"underline"}} onClick={function(){goTab("situation")}}>Income & Exp tab</span>.
    </div>}
    <Toggle value={noMortgage} onChange={setNoMortgage} label={noMortgage?"Mortgage is paid off":"I still have a mortgage"}/>
    {!noMortgage&&<>
      <NI label="Years remaining" value={mortgageYearsLeft} onChange={setMortgageYearsLeft} prefix="" placeholder="" style={{marginBottom:8}} tip="How many years left on your mortgage. This is what drives projections — when it ends, your savings increase automatically by your P+I amount."/>
      <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",lineHeight:1.5,marginBottom:12}}>
        📐 Projections use <strong>P+I ({fmt(nMortPay)}/mo)</strong> and <strong>years remaining{nMortYrs>0?" ("+nMortYrs+")":""}</strong>. When mortgage ends{nMortYrs>0?" at age "+(nAge+nMortYrs):""}, your monthly savings increase by {fmt(nMortPay)}.
      </div>
      <div style={{fontSize:13,fontWeight:500,color:"#64748b",marginBottom:8}}>Optional — for total assets and rate analysis:</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <NI label="Remaining balance" value={mortgageBalance} onChange={setMortgageBalance} style={{marginBottom:0}}/>
        <NI label="Fixed rate %" value={mortgageRate} onChange={setMortgageRate} prefix="" placeholder="" style={{marginBottom:0}}/>
      </div>
      {(Number(mortgageRate)||0)>0&&(Number(mortgageRate)||0)<4&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#86efac",lineHeight:1.6,marginTop:8}}>
        ✅ {mortgageRate}% is a great rate. Every major investment strategy beats it. Keep your mortgage and invest the difference.
      </div>}
      {(Number(mortgageRate)||0)>=4&&(Number(mortgageRate)||0)<6&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.1)",fontSize:12,color:"#fde68a",lineHeight:1.6,marginTop:8}}>
        📊 At {mortgageRate}%, your mortgage rate is moderate. Only 60/40 and above consistently beat it. Paying extra toward principal is a guaranteed {mortgageRate}% return.
      </div>}
      {(Number(mortgageRate)||0)>=6&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.1)",fontSize:12,color:"#fca5a5",lineHeight:1.6,marginTop:8}}>
        🔥 <strong>{mortgageRate}% is a high mortgage rate.</strong>
        {nEx>0&&mortBal>0?" Only 100% Equities (9% nom) consistently beats this rate. Consider using part of your "+fmt(nEx)+" savings to pay down the balance — it's a guaranteed "+mortgageRate+"% return.":""}
        {(Number(mortgageRate)||0)>=8?" At "+mortgageRate+"%, refinancing or accelerating payments should be a priority.":""}
      </div>}
    </>}
  </Cd>}

  {/* Other debts */}
  <Cd><ST tip="Car loan, credit cards, student loans, etc." sub={ownsHome?"Other debts besides mortgage.":"Your debts."}>Other Debts</ST>
    <Toggle value={noDebts} onChange={setNoDebts} label={noDebts?"✅ No other debts":"I have other debts"} sub={noDebts?null:"Toggle if no car loan, credit cards, etc."}/>
  </Cd>

  {!noDebts&&<>

    {/* Car Loan */}
    <Cd>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontFamily:"Fraunces,serif",fontSize:17,fontWeight:600,color:"#f1f5f9"}}>🚗 Car Loan</h3>
      </div>
      <Toggle value={noCarLoan} onChange={setNoCarLoan} label={noCarLoan?"No car loan":"I have a car loan"}/>
      {!noCarLoan&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <NI label="Remaining balance" value={carBalance} onChange={setCarBalance} style={{marginBottom:0}}/>
          <NI label="Years remaining" value={carYearsLeft} onChange={setCarYearsLeft} prefix="" placeholder="" style={{marginBottom:0}} tip="How many years left on your car loan."/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <NI label="Rate %" value={carRate} onChange={setCarRate} prefix="" placeholder="" style={{marginBottom:0}}/>
          <NI label="Monthly payment" value={carPayment} onChange={setCarPayment} style={{marginBottom:0}}/>
        </div>
        <div style={{fontSize:10,color:"#475569",marginTop:8}}>When car loan ends, your savings capacity increases automatically in projections.</div>
      </>}
    </Cd>

    {/* Other Debts */}
    <Cd>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontFamily:"Fraunces,serif",fontSize:17,fontWeight:600,color:"#f1f5f9"}}>Other Debts</h3>
        {debts.length<8&&<button className="bs" onClick={aD}>+ Add</button>}
      </div>
      {debts.map(function(d){return(<div key={d.id} style={{padding:14,background:"rgba(0,0,0,0.15)",borderRadius:14,marginBottom:10,border:"1px solid rgba(255,255,255,0.04)"}}>
        <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
          <input type="text" value={d.name} onChange={function(e){uD(d.id,"name",e.target.value)}} placeholder="e.g., Credit Card, Student Loan..." style={{flex:1,background:"#131c2e",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,color:"#f1f5f9",fontSize:13,padding:"10px 12px",fontFamily:"Outfit,sans-serif",outline:"none"}}/>
          {debts.length>1&&<button onClick={function(){rD(d.id)}} style={{width:32,height:32,borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",color:"#ef4444",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <NI label="Balance" value={d.balance} onChange={function(v){uD(d.id,"balance",v)}} style={{marginBottom:0}}/>
          <NI label="Rate %" value={d.rate} onChange={function(v){uD(d.id,"rate",v)}} prefix="" placeholder="" style={{marginBottom:0}}/>
          <NI label="Min. pmt" value={d.minPayment} onChange={function(v){uD(d.id,"minPayment",v)}} style={{marginBottom:0}}/>
        </div></div>)})}
    </Cd>
  </>}

  {/* Debt Analysis */}
  {!noDebts&&debtAn.length>0&&<Cd glow={probDebts.length>0?"red":"green"}>
    <div style={{fontSize:14,fontWeight:600,color:"#f1f5f9",marginBottom:14}}>Debt vs Investment Analysis</div>
    {debtAn.map(function(d,i){return(<div key={d.id} style={{padding:14,borderRadius:12,marginBottom:10,background:d.sev==="critical"?"rgba(239,68,68,0.06)":d.sev==="high"?"rgba(245,158,11,0.06)":"rgba(255,255,255,0.02)",border:d.sev==="critical"?"1px solid rgba(239,68,68,0.1)":d.sev==="high"?"1px solid rgba(245,158,11,0.1)":"1px solid rgba(255,255,255,0.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:14,fontWeight:600,color:"#f1f5f9"}}>{d.name||"Unnamed"}</span>
        <div><span style={{fontWeight:700,fontSize:14,color:d.sev==="low"?"#94a3b8":"#f87171"}}>{fmt(d.bal)}</span><span style={{fontSize:12,marginLeft:6,color:d.sev==="low"?"#64748b":"#ef4444"}}>@ {d.rate}%</span></div></div>
      <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>
        {d.sev==="critical"?<span>🚨 At {d.rate}%, this <strong style={{color:"#ef4444"}}>costs more than every investment strategy</strong>. Pay first.</span>
        :d.sev==="high"?<span>⚠️ At {d.rate}%, only <strong style={{color:"#f1f5f9"}}>{PROFILES.filter(function(p){return p.nomReturn>=d.rate/100}).map(function(p){return p.name}).join(", ")}</strong> earn more.</span>
        :d.sev==="moderate"?<span>📊 At {d.rate}%, beats low-return strategies.</span>
        :<span>✅ At {d.rate}%, below most returns. Keep making payments.</span>}
      </div></div>)})}
    {probDebts.length===0&&debtAn.length>0&&<div style={{fontSize:13,color:"#86efac",marginTop:4}}>All debts below typical investment returns.</div>}
  </Cd>}

  {/* Emergency Fund */}
  {totalMonthlyObligations>0&&<Cd>
    <div style={{fontSize:14,fontWeight:600,color:"#60a5fa",marginBottom:10}}>🛡️ Emergency Fund</div>
    {nEx>0?<>
      <div style={{fontFamily:"Fraunces,serif",fontSize:22,fontWeight:700,color:emergencyMonths>=12?"#22c55e":emergencyMonths>=6?"#eab308":"#ef4444",marginBottom:6}}>
        Your savings cover {emergencyMonths>=12?Math.round(emergencyMonths):emergencyMonths.toFixed(1)} months of expenses
      </div>
      <div style={{height:8,borderRadius:4,background:"rgba(255,255,255,0.05)",overflow:"hidden",marginBottom:8}}>
        <div style={{height:"100%",borderRadius:4,width:Math.min(emergencyMonths/24*100,100)+"%",background:emergencyMonths>=12?"#22c55e":emergencyMonths>=6?"#eab308":"#ef4444",transition:"width 0.5s"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#475569",marginBottom:8}}><span>0</span><span>6 mo</span><span>12 mo</span><span>24 mo</span></div>
      <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>
        {emergencyMonths>=24?"🏆 Excellent! 2+ years of expenses covered. Very well protected."
        :emergencyMonths>=12?"✅ Solid. 12+ months covered. Well protected against job loss or major expenses."
        :emergencyMonths>=6?"⚡ Decent. 6+ months covered, but consider building to 12-24 months for full security."
        :emergencyMonths>=3?"⚠️ Minimum. Build toward 12+ months ("+fmt(totalMonthlyObligations*12)+")."
        :"🚨 Critical. Less than 3 months. Priority #1: build to at least 6 months ("+fmt(totalMonthlyObligations*6)+")."}
      </div>
      <div style={{fontSize:10,color:"#475569",marginTop:6}}>Based on {fmt(totalMonthlyObligations)}/mo total obligations (expenses + debt payments)</div>
    </>:<div style={{fontSize:12,color:"#fde68a"}}>⚠️ Enter your savings in the <span style={{color:"#60a5fa",cursor:"pointer",textDecoration:"underline"}} onClick={function(){goTab("assumptions")}}>You tab</span> to see your emergency fund coverage.</div>}
  </Cd>}
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === RETIREMENT === */}
{tab==="retirement"&&<div className="fi">
  <Cd><ST sub="Your Magic Number details, investment strategy during retirement, and monthly savings analysis.">Retirement Details</ST>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
      {[{l:"Age",v:nAge},{l:"Retire at",v:nRetAge},{l:"Years in retirement",v:nYP},{l:"Years to go",v:ytr},{l:"Desired",v:fmt(nDes)+"/mo"},{l:"Savings",v:fmt(nEx)}].map(function(b){return(
        <div key={b.l} style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>{b.l}: <strong>{b.v}</strong></div>)})}
      {nSS>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#86efac"}}>Ret. income: {fmt(nSS)}/mo {"today"+q+"s $"}</div>}
      <div style={{padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",fontSize:11,color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("achieve")}}>✏️ Edit in Your MN</div>
    </div>
    {nMortPay>0&&nMortYrs>ytr&&ytr>0&&<div style={{padding:"12px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#fde68a",lineHeight:1.6,marginBottom:16}}>
      ⚠️ <strong>Mortgage extends {nMortYrs-ytr} years past retirement.</strong> Make sure your desired income includes P+I of <strong>{fmt(nMortPay)}/mo</strong>.
    </div>}
    {nMortPay>0&&nMortYrs>0&&nMortYrs<=ytr&&ytr>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#86efac",lineHeight:1.5,marginBottom:16}}>
      ✅ Mortgage paid off {ytr-nMortYrs} years before retirement.
    </div>}
    {nSS>0&&nDes>0&&desiredAfterSS>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#86efac",lineHeight:1.5,marginBottom:16}}>
      ✅ Retirement income covers {fmt(nSS)}/mo. You only need to fund <strong>{fmt(desiredAfterSS)}/mo</strong> from savings.
    </div>}
  </Cd>

  {nDes>0&&nYP>0&&ytr>0&&desiredAfterSS===0&&<Cd glow="green" style={{textAlign:"center",padding:"32px 24px"}}>
    <div style={{fontSize:48,marginBottom:12}}>🎉</div>
    <div style={{fontFamily:"Fraunces,serif",fontSize:22,fontWeight:700,color:"#22c55e",marginBottom:8}}>Retirement Income Has You Covered!</div>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.6,maxWidth:440,margin:"0 auto"}}>
      Your retirement income ({fmt(nSS)}/mo {"today"+q+"s $"}) meets or exceeds your desired retirement income ({fmt(nDes)}/mo).
      Your savings of <strong style={{color:"#f1f5f9"}}>{fmt(nEx)}</strong> are additional wealth for emergencies, travel, or legacy.
    </p>
  </Cd>}

  {nDes>0&&nYP>0&&ytr>0&&magic.real>0&&<>
    <Cd glow="blue" style={{textAlign:"center",padding:"40px 24px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"relative"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#60a5fa",textTransform:"uppercase",letterSpacing:3,marginBottom:10}}>Your Magic Number</div>
        <div style={{fontFamily:"Fraunces,serif",fontSize:50,fontWeight:900,color:"#60a5fa",lineHeight:1.1,marginBottom:6,textShadow:"0 0 40px rgba(96,165,250,0.3),0 0 80px rgba(96,165,250,0.15)"}}>{magicRevealed?<ANum value={Math.round(magic.real)} dur={2200}/>:"$0"}</div>
        <div style={{fontSize:13,color:"#3b82f6"}}>{"in today"+q+"s dollars"}</div>
        <div style={{marginTop:12,padding:"10px 16px",borderRadius:10,background:"rgba(0,0,0,0.2)",fontSize:12,color:"#94a3b8",lineHeight:1.6}}>
          This is the amount you need to reach by <strong style={{color:"#f1f5f9"}}>age {nRetAge}</strong> {"(today"+q+"s $)"}. Invested at the rate below{TAX>0?" (net of "+assetTax.toFixed(1)+"% tax)":""}, it will fund <strong style={{color:"#f1f5f9"}}>{fmt(desiredAfterSS)}/mo</strong> for <strong style={{color:"#f1f5f9"}}>{nYP} years</strong> of retirement{nSS>0?" (after "+fmt(nSS)+"/mo retirement income)":""}{nLegacy>0?" and leave "+fmt(nLegacy)+" as legacy":""}, reaching {nLegacy>0?fmt(nLegacy):"$0"} at age {nRetAge+nYP}.
        </div>
        {/* Withdrawal rate selector */}
        <div style={{marginTop:14,marginBottom:14}}>
          <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>Investment strategy <strong>during retirement</strong>:</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
            {hasPortfolio&&<TabBtn active={retProfileIdx===-1} label="🎛️ My Portfolio" onClick={function(){setRetProfileIdx(-1)}} color="#e879f9"/>}
            {adjProfiles.filter(function(_,i){return i<=4}).map(function(p,i){return <TabBtn key={p.id} active={retProfileIdx===i} label={p.icon+" "+p.name} onClick={function(){setRetProfileIdx(i)}} color={p.color}/>})}
          </div>
        </div>
        <div style={{marginTop:24,padding:18,borderRadius:14,background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.05)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,textAlign:"center",marginBottom:14}}>
            <div><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>You Have</div><div style={{fontSize:19,fontWeight:700,color:"#f1f5f9"}}>{fmt(nEx)}</div></div>
            <div><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{mD.p>=100?"Surplus":"You Still Need"}</div>
              <div style={{fontSize:19,fontWeight:700,color:mD.gc}}>{mD.p>=100?"+"+fmt(mD.sur):fmt(mD.gap)}</div></div>
          </div>
          <div style={{height:10,borderRadius:5,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:5,width:Math.min(mD.p,100)+"%",background:mD.bc,transition:"width 1s"}}/></div>
          <div style={{fontSize:11,marginTop:6,color:mD.gc,fontWeight:600}}>{mD.p>=100?"🎉 "+mD.p.toFixed(0)+"% — Ahead of target!":mD.p>=60?"⚡ "+mD.p.toFixed(1)+"% — Getting close!":"📈 "+mD.p.toFixed(1)+"% — Let"+q+"s explore how to get there"}</div>
        </div>
      </div>
    </Cd>

    {/* Conservative Magic Number */}
    {magic.conservative>0&&<Cd style={{padding:"20px 24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,textAlign:"center"}}>
        <div>
          <div style={{fontSize:10,color:"#60a5fa",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Invested Retirement</div>
          <div style={{fontFamily:"Fraunces,serif",fontSize:24,fontWeight:800,color:"#60a5fa"}}>{fmtC(magic.real)}</div>
          <div style={{fontSize:10,color:"#475569",marginTop:2}}>{retProfLabel} ({pct(retProfReturn)} real)</div>
        </div>
        <div>
          <div style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Conservative</div>
          <div style={{fontFamily:"Fraunces,serif",fontSize:24,fontWeight:800,color:"#94a3b8"}}>{fmtC(magic.conservative)}</div>
          <div style={{fontSize:10,color:"#475569",marginTop:2}}>💵 Cash Investor ({pct(magic.conservativeRate)} real)</div>
        </div>
      </div>
      <div style={{marginTop:14,padding:"10px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",lineHeight:1.6,textAlign:"center"}}>
        <strong>Invested:</strong> keep savings in {retProfLabel} during retirement — needs less upfront but has market risk.
        <strong> Conservative:</strong> move to cash at retirement — needs <strong>{fmtC(magic.conservative-magic.real)}</strong> more but virtually no risk.
      </div>
    </Cd>}

    {/* Monthly needed per profile */}
    <Cd><ST tip="Extra monthly savings needed ON TOP of your current savings to reach your Magic Number by retirement, per investment strategy.">Extra Monthly Savings Needed</ST>
      {monthlyNeeded.map(function(p){var covered=p.monthly===0;return(
        <div key={p.id} style={{padding:"10px 14px",borderRadius:10,marginBottom:6,background:covered?"rgba(34,197,94,0.04)":"rgba(0,0,0,0.1)",border:covered?"1px solid rgba(34,197,94,0.1)":"1px solid rgba(255,255,255,0.03)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{p.icon}</span><span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>{p.name}</span><span style={{fontSize:10,color:"#475569"}}>{pct(p.realReturn)} real</span></div>
            <div style={{textAlign:"right"}}>
              {covered?<span style={{fontSize:14,fontWeight:700,color:"#22c55e"}}>✅ Covered</span>
              :<span style={{fontSize:14,fontWeight:700,color:"#f87171"}}>{fmt(p.monthly)}/mo</span>}
            </div>
          </div>
          {!covered&&<div style={{fontSize:10,color:"#f87171",marginTop:3}}>⚠️ Need {fmt(p.monthly)}/mo extra beyond your current {fmt(mSav)}/mo</div>}
          {covered&&<div style={{fontSize:10,color:"#22c55e",marginTop:3}}>Surplus at retirement: +{fmt(p.surplus)} {"(today"+q+"s $, above Magic Number)"}</div>}
        </div>)})}
    </Cd>

    {/* Year-by-Year Projection */}
    {ybYData.length>0&&<Cd>
      <ST tip={"Shows portfolio growth during accumulation, then drawdown in retirement. You can pick different strategies for each phase."}>Year-by-Year Projection</ST>
      {/* Two-phase profile selectors */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:6}}>📈 Accumulation (now → retirement):</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
          {hasPortfolio&&<TabBtn active={chartProfileIdx===-1} label="🎛️ My Portfolio" onClick={function(){setChartProfileIdx(-1)}} color="#e879f9"/>}
          {allProfiles.map(function(p,i){return <TabBtn key={p.id} active={chartProfileIdx===i} label={p.icon+" "+p.name} onClick={function(){setChartProfileIdx(i)}} color={p.color}/>})}
        </div>
        <div style={{fontSize:11,color:chartProfileIdx===-1?"#e879f9":"#93c5fd",marginBottom:12}}>
          {chartProfileIdx===-1&&hasPortfolio?"Using your portfolio blend at "+pct(chartAccumReturn)+" real":"Using "+(chartProfileIdx>=0?(chartProfileIdx<adjProfiles.length?adjProfiles[chartProfileIdx]:allProfiles[chartProfileIdx]).name:"60/40")+" at "+pct(chartAccumReturn)+" real"}
        </div>
        <div style={{fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:6}}>🏖️ Retirement (after you stop working):</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
          {hasPortfolio&&<TabBtn active={chartRetireIdx===-1} label="🎛️ My Portfolio" onClick={function(){setChartRetireIdx(-1)}} color="#e879f9"/>}
          {adjProfiles.filter(function(_,i){return i<=4}).map(function(p,i){return <TabBtn key={p.id} active={chartRetireIdx===i} label={p.icon+" "+p.name} onClick={function(){setChartRetireIdx(i)}} color={p.color}/>})}
        </div>
        <div style={{fontSize:11,color:chartRetireIdx===-1?"#e879f9":"#93c5fd"}}>
          {chartRetireIdx===-1&&hasPortfolio?"Using your portfolio blend at "+pct(chartRetireReturn)+" real":"Using "+adjProfiles[Math.max(chartRetireIdx,0)].name+" at "+pct(chartRetireReturn)+" real"}
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <MultiLineChart series={[{data:ybYData.map(function(d){
          var ageNow=nAge||30;var ageAtYear=ageNow+d.year;var totalYrs=ytr+nYP;
          var step=totalYrs>40?10:5;
          var isFirst=d.year===0;var isRetire=d.year===ytr;var isLast=d.year===totalYrs;
          var isTick=d.year%step===0&&d.year>0&&d.year<totalYrs;
          var tooCloseToRetire=Math.abs(d.year-ytr)<(step/2)&&!isRetire;
          var show=(isFirst||isRetire||isLast||(isTick&&!tooCloseToRetire));
          return{l:show?(isFirst?"Age "+ageAtYear:isRetire?"Retire "+ageAtYear:isLast?"Age "+ageAtYear:""+ageAtYear):"",v:d.balance}
        }),color:chartProfileIdx===-1?"#e879f9":(chartProfileIdx>=0&&chartProfileIdx<allProfiles.length?allProfiles[chartProfileIdx].color:"#22c55e"),bold:true,fill:true}]} height={160} showYAxis={true}/>
      </div>
      {(function(){
        var retBal=ybYData[ytr]?ybYData[ytr].balance:0;
        var peakV=0,peakY=0;ybYData.forEach(function(d){if(d.balance>peakV){peakV=d.balance;peakY=d.year}});
        var depleteY=null;for(var i=ytr+1;i<ybYData.length;i++){if(ybYData[i].balance<=0){depleteY=i;break}}
        var lastBal=ybYData[ybYData.length-1].balance;
        return(<div style={{display:"grid",gap:6,marginTop:8}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            <div style={{padding:"6px 12px",borderRadius:8,background:"rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>At retirement (age {nAge+ytr}): <strong>{fmtC(retBal)}</strong></div>
            {peakY!==ytr&&<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(167,139,250,0.08)",fontSize:11,color:"#c4b5fd"}}>Peak: <strong>{fmtC(peakV)}</strong> at age {nAge+peakY}</div>}
          </div>
          <div style={{textAlign:"center"}}>
            {depleteY?<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(239,68,68,0.08)",fontSize:11,color:"#fca5a5",display:"inline-block"}}>⚠️ Money runs out at age {nAge+depleteY} ({depleteY-ytr} years into retirement)</div>
            :<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(34,197,94,0.08)",fontSize:11,color:"#86efac",display:"inline-block"}}>✅ Money lasts! {fmtC(lastBal)} left at age {nAge+ytr+nYP}</div>}
          </div>
        </div>)})()}
      {/* Debt payoff milestones */}
      {debtEvents.length>0&&<div style={{display:"grid",gap:6,marginTop:12}}>
        {debtEvents.filter(function(ev){return ev.endsAtYear<ytr}).map(function(ev,i){return(
          <div key={i} style={{padding:"8px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#86efac",display:"flex",justifyContent:"space-between"}}>
            <span>📈 {ev.name} paid off at age {nAge+ev.endsAtYear}</span>
            <span style={{fontWeight:600}}>+{fmt(ev.monthlyAmount)}/mo savings</span>
          </div>)})}
      </div>}
    </Cd>}
  </>}
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === INVESTMENT ALTERNATIVES === */}
{tab==="invest"&&<div className="fi">
  <Cd>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:18}}>
      <div><ST tip={(mSav>=0?"Investing "+fmt(mSav)+"/mo + "+fmt(nEx)+" existing savings":"Draining "+fmt(Math.abs(mSav))+"/mo from "+fmt(nEx)+" existing savings")+" for "+projYears+" years. Values show total portfolio value."+(debtEvents.length>0?" Includes savings boost when debts end.":"")}>Investment Options</ST>
        <p style={{fontSize:13,color:"#64748b",marginTop:-16}}>{mSav>=0?fmt(mSav)+"/mo + "+fmt(nEx)+" savings":fmt(nEx)+" savings "+fmt(mSav)+"/mo"} → portfolio in {projYears}yr <span style={{fontSize:11,color:"#475569"}}>{showNom?"(nominal — future $)":"(today"+q+"s $ — inflation adjusted)"}</span></p></div>
      <div style={{display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3,border:"1px solid rgba(255,255,255,0.06)"}}>
        <button onClick={function(){setShowNom(false)}} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",border:"none",cursor:"pointer",background:!showNom?"rgba(34,197,94,0.15)":"transparent",color:!showNom?"#22c55e":"#64748b"}}>{"Today"+q+"s $"}</button>
        <button onClick={function(){setShowNom(true)}} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",border:"none",cursor:"pointer",background:showNom?"rgba(96,165,250,0.15)":"transparent",color:showNom?"#60a5fa":"#64748b"}}>Nominal $</button>
      </div>
    </div>
    <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",marginBottom:16}}>
      📐 These are illustrative projections for each asset class. You{"'ll"} choose your actual portfolio mix in the next step (<span style={{cursor:"pointer",textDecoration:"underline"}} onClick={function(){goTab("portfolio")}}>Your Portfolio</span>).
    </div>
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      {[5,10,20,30,40,50].map(function(y){return <TabBtn key={y} active={projYears===y} label={y+"yr"} onClick={function(){setProjYears(y)}}/>})}
    </div>
    {projs.map(function(p,i){var v=showNom?p.nFV:p.rFV,bp=maxProj>0?(v/maxProj)*100:0,g=v-p.tc;return(
      <div key={p.id} style={{padding:"10px 12px",borderRadius:10,marginBottom:4}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:17}}>{p.icon}</span><span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>{p.name}</span><Tip text={p.desc}/></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:700,color:p.color}}>{fmtC(v)}</div><div style={{fontSize:10,color:g>0?"#4ade80":g<0?"#f87171":"#64748b"}}>{g>0?"↑ "+fmtC(g)+" gain":g<0?"↓ "+fmtC(Math.abs(g))+" lost to inflation":"no gain"}</div></div></div>
        <div style={{height:18,borderRadius:6,overflow:"hidden",background:"rgba(255,255,255,0.03)"}}><div className="ba" style={{height:"100%",borderRadius:6,width:Math.max(bp,2)+"%",background:"linear-gradient(90deg,"+p.color+"88,"+p.color+")",animationDelay:i*0.07+"s"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:10}}><span><span style={{color:p.color}}>{pct(p.nomReturn)} nom</span> · <span style={{color:"#22c55e"}}>{pct(p.realReturn)} real</span>{p.vol>0?<span style={{color:"#f59e0b"}}> · ~{Math.round(p.vol*100)}% vol</span>:""}</span><span style={{color:"#64748b"}}>Net invested: {fmtC(p.tc)}</span></div>
      </div>)})}
    <div style={{marginTop:10,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",textAlign:"center",lineHeight:1.5}}>All values in <strong>{"today"+q+"s $"}</strong>. Bars relative to highest-return profile. Vol = historical annual volatility.</div>
  </Cd>

  {/* Custom return */}
  <Cd style={{padding:20}}>
    <NI label="Custom return % (nominal)" value={customReturn} onChange={setCustomReturn} prefix="" placeholder="" suffix="%" tip="Add your own return rate to compare." style={{marginBottom:0}}/>
  </Cd>

  {/* Inflation reference */}
  <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
    <div style={{padding:"6px 14px",borderRadius:8,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#fde68a"}}>
      Inflation: <strong>{(INFL*100).toFixed(1)}%</strong>{customInflation!==2.5?" (custom)":""} · <span style={{color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("assumptions")}}>Change in Assumptions</span>
    </div>
  </div>

  {/* Scenarios */}
  <Cd>
    <Toggle value={showScenarios} onChange={setShowScenarios} label={showScenarios?"Scenarios":"Show Scenarios"} sub="Pessimistic / Base / Optimistic (±2%)"/>
    {showScenarios&&<>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:8,marginBottom:12}}>
        {hasPortfolio&&<TabBtn active={scenProfileIdx===-1} label="🎛️ My Portfolio" onClick={function(){setScenProfileIdx(-1)}} color="#e879f9"/>}
        {allProfiles.map(function(p,i){return <TabBtn key={p.id} active={scenProfileIdx===i} label={p.icon+" "+p.name} onClick={function(){setScenProfileIdx(i)}} color={p.color}/>})}
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
        📐 All values in <strong>{"today"+q+"s dollars"}</strong> (inflation-adjusted). Savings growth only — does not include retirement withdrawals. Based on {scenProfileIdx===-1&&hasPortfolio?"My Portfolio":((allProfiles[Math.min(scenProfileIdx,allProfiles.length-1)]||allProfiles[5]).name)} ({pct(scenProfileIdx===-1&&blendedPortReturn!=null?blendedPortReturn:(allProfiles[Math.min(scenProfileIdx,allProfiles.length-1)]||allProfiles[5]).realReturn)} real) ± 2%.{debtEvents.length>0?" Includes savings boost when debts end.":""}
      </div>
    </div>}
  </Cd>

  {/* Cost of Not Investing Today (year by year) */}
  {costNS&&<Cd glow="orange" style={{padding:"28px 24px"}}>
    <div style={{fontSize:11,fontWeight:600,color:"#b45309",textTransform:"uppercase",letterSpacing:3,marginBottom:4,textAlign:"center"}}>⏳ The Cost of Not Investing Today</div>
    <div style={{fontSize:12,color:"#d97706",textAlign:"center",marginBottom:10}}>What happens to your money over <strong>20 years</strong> if you delay investing?</div>
    <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center",marginBottom:14}}>
      {hasPortfolio&&<TabBtn active={costNSProfileIdx===-1} label="🎛️ My Portfolio" onClick={function(){setCostNSProfileIdx(-1)}} color="#e879f9"/>}
      {allProfiles.filter(function(_,i){return i>=1}).map(function(p,i){var idx=i+1;return <TabBtn key={p.id} active={costNSProfileIdx===idx} label={p.icon+" "+p.name} onClick={function(){setCostNSProfileIdx(idx)}} color={p.color}/>})}
    </div>
    <div style={{overflowX:"auto"}}>
      <div style={{display:"flex",gap:6,minWidth:"max-content",paddingBottom:8}}>
        {costNS.map(function(d){var maxV=costNS[0].total;var bp=maxV>0?d.total/maxV*100:0;return(
          <div key={d.wait} style={{width:54,textAlign:"center"}}>
            <div style={{fontSize:10,color:"#f59e0b",fontWeight:600,marginBottom:4}}>{fmtC(d.total)}</div>
            <div style={{height:80,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
              <div style={{width:28,borderRadius:"4px 4px 0 0",background:d.wait===0?"linear-gradient(180deg,#22c55e,#16a34a)":"linear-gradient(180deg,#f59e0b88,#f59e0b)",height:Math.max(bp,5)+"%",transition:"height 0.5s"}}/>
            </div>
            <div style={{fontSize:9,color:"#64748b",marginTop:4}}>{d.wait===0?"Now":"Wait "+d.wait+"yr"}</div>
            {d.lost>0&&<div style={{fontSize:9,color:"#ef4444"}}>-{fmtC(d.lost)}</div>}
          </div>)})}
      </div>
    </div>
    <div style={{marginTop:12,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",textAlign:"center",lineHeight:1.5}}>
      {"Today"+q+"s dollars · "+(costNSProfileIdx===-1&&hasPortfolio?"🎛️ My Portfolio":(allProfiles[costNSProfileIdx]||adjProfiles[4]).icon+" "+(allProfiles[costNSProfileIdx]||adjProfiles[4]).name)+" ("+pct(costNSReturn)+" real) · 20-year horizon. Waiting 5 years costs you "+fmtC(costNS.length>5?costNS[5].lost:0)+"."}
    </div>
  </Cd>}

  {magic.real>0&&<Cd glow="blue" style={{textAlign:"center",padding:"28px 24px"}}>
    <div style={{fontSize:10,color:"#3b82f6",textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Your Magic Number</div>
    <div style={{fontFamily:"Fraunces,serif",fontSize:26,fontWeight:800,color:"#60a5fa",marginBottom:12}}>{fmt(magic.real)}</div>
    <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.6,maxWidth:440,margin:"0 auto 16px"}}>{"In "+projYears+"yr with 60/40: "}<strong style={{color:"#22c55e"}}>{fmtC(projs[4].rFV)}</strong>{" (today"+q+"s $). "}{projs[4].rFV<magic.real?((projs[4].rFV/magic.real)*100).toFixed(0)+"% of target.":"You"+q+"d surpass it!"}</p>
  </Cd>}
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === PORTFOLIO === */}
{tab==="portfolio"&&<div className="fi">
  <Cd><ST tip="Split your money across strategies. Sliders auto-adjust to sum to 100%." sub="Customize how your money is allocated.">Custom Portfolio</ST>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:14,fontWeight:600,color:"#f1f5f9",marginBottom:12}}>Section A — Existing Savings ({fmt(nEx)})</div>
      {allProfiles.map(function(p,i){return(<div key={p.id}>
        <Slider label={p.icon+" "+p.name} value={portAlloc[i]||0} onChange={function(v){updatePortAlloc(i,v)}} min={0} max={100} step={5}
          format={function(v){return v+"%"}} color={p.color}/>
        <div style={{fontSize:9,marginTop:-8,marginBottom:8,paddingLeft:4}}><span style={{color:p.color}}>{pct(p.nomReturn)} nom</span> <span style={{color:"#22c55e"}}>{pct(p.realReturn)} real</span>{p.vol>0?<span style={{color:"#f59e0b"}}> ~{Math.round(p.vol*100)}% vol</span>:""}</div>
      </div>)})}
      <div style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.2)",marginTop:8}}>
        <span style={{fontSize:12,color:"#94a3b8"}}>Total allocated</span>
        <span style={{fontSize:14,fontWeight:700,color:portAlloc.reduce(function(s,v){return s+v},0)===100?"#22c55e":"#ef4444"}}>{portAlloc.reduce(function(s,v){return s+v},0)}%</span>
      </div>
      {portAlloc.reduce(function(s,v){return s+v},0)===100&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",marginTop:8,fontSize:12,color:"#86efac"}}>
        Weighted return: <strong>{pct(portReturn.nom)}</strong> nominal / <strong>{pct(portReturn.real)}</strong> real
      </div>}
    </div>

    <div style={{marginBottom:24}}>
      <div style={{fontSize:14,fontWeight:600,color:"#f1f5f9",marginBottom:4}}>Section B — Monthly Contributions ({fmt(mSav)})</div>
      <div style={{fontSize:11,color:"#64748b",marginBottom:12}}>{mSav<0?"Currently draining savings. This allocation applies when debts end and savings turn positive.":"Can differ from existing allocation."}</div>
      {allProfiles.map(function(p,i){return(<div key={p.id}>
        <Slider label={p.icon+" "+p.name} value={portContribAlloc[i]||0} onChange={function(v){updateContribAlloc(i,v)}} min={0} max={100} step={5}
          format={function(v){return v+"%"}} color={p.color}/>
        <div style={{fontSize:9,marginTop:-8,marginBottom:8,paddingLeft:4}}><span style={{color:p.color}}>{pct(p.nomReturn)} nom</span> <span style={{color:"#22c55e"}}>{pct(p.realReturn)} real</span>{p.vol>0?<span style={{color:"#f59e0b"}}> ~{Math.round(p.vol*100)}% vol</span>:""}</div>
      </div>)})}
      <div style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.2)",marginTop:8}}>
        <span style={{fontSize:12,color:"#94a3b8"}}>Total allocated</span>
        <span style={{fontSize:14,fontWeight:700,color:portContribAlloc.reduce(function(s,v){return s+v},0)===100?"#22c55e":"#ef4444"}}>{portContribAlloc.reduce(function(s,v){return s+v},0)}%</span>
      </div>
      {portContribAlloc.reduce(function(s,v){return s+v},0)===100&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",marginTop:8,fontSize:12,color:"#86efac"}}>
        Weighted return: <strong>{pct(portContribReturn.nom)}</strong> nominal / <strong>{pct(portContribReturn.real)}</strong> real
      </div>}
    </div>
  </Cd>
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === YOUR MAGIC NUMBER === */}
{tab==="achieve"&&<div className="fi">
  <Cd style={{textAlign:"center",padding:"24px 20px"}}>
    <div style={{fontSize:36,marginBottom:10}}>🎯</div>
    <h2 style={{fontFamily:"Fraunces,serif",fontSize:22,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>Your Magic Number</h2>
    <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.7,maxWidth:440,margin:"0 auto"}}>
      Your <strong style={{color:"#60a5fa"}}>Magic Number</strong> is the exact amount of money {"(in today"+q+"s dollars)"} you need to have saved by the day you retire. Invested conservatively, it will fund your desired monthly income for your entire retirement — and reach $0 on your last planned year. Enter 7 numbers below to discover yours.
    </p>
  </Cd>
  <Cd><ST sub="Enter your key numbers to calculate your Magic Number.">Your Essentials</ST>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <NI label="Your age" value={age} onChange={setAge} prefix="" min={16} max={99} tip="Your current age."/>
      <NI label="Retirement age" value={retirementAge} onChange={setRetirementAge} prefix="" tip="When you plan to stop working."/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <NI label="Years in retirement" value={yearsPostRet} onChange={setYearsPostRet} prefix="" tip="How long your money needs to last. 25-35 is common."/>
      <NI label={"Desired income (today"+q+"s $/mo)"} value={desiredIncome} onChange={setDesiredIncome} tip={"Monthly spending in retirement, today"+q+"s dollars."}/>
    </div>
    <NI label="Other retirement income ($/mo at retirement)" value={socialSecurity} onChange={setSocialSecurity} tip={"Social Security, pension, annuity. Enter future dollars."}/>
    {nSSRaw>0&&ytr>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",marginBottom:12}}>{fmt(nSSRaw)}/mo at retirement = <strong>{fmt(nSS)}/mo today's $</strong> <span style={{color:"#475569"}}>(inflation-adjusted over {ytr}yr)</span></div>}
    <NI label="Current savings & investments" value={existingSavings} onChange={setExistingSavings} tip="Cash, 401k, IRA, brokerage — liquid investable assets."/>
    <NI label="Estimated monthly savings" value={manualMonthlySav} onChange={setManualMonthlySav} tip={"Income minus expenses. Starting estimate — replaced when you complete Income & Exp."}/>
    {hasIncomeData&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#86efac",marginBottom:12}}>✅ Actual monthly savings from Income & Exp: <strong>{fmt(mSavComputed)}/mo</strong> — overrides the estimate above.</div>}
    <NI label={"Legacy / inheritance (today"+q+"s $)"} value={legacy} onChange={setLegacy} tip={"Amount you want to leave behind at the end of retirement. Enter $0 or leave empty if none. This increases your Magic Number."}/>
    <div style={{marginTop:8,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>🏛️ Annual Asset Tax</span>
        <span style={{fontSize:15,fontWeight:700,color:assetTax>0?"#f59e0b":"#64748b"}}>{assetTax.toFixed(1)}%</span>
      </div>
      <Slider label="" value={assetTax} onChange={setAssetTax} min={0} max={3} step={0.1} format={function(v){return v.toFixed(1)+"%"}} color="#f59e0b"/>
      {assetTax>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:11,color:"#fde68a",marginTop:4}}>
        ⚠️ {assetTax.toFixed(1)}% annual tax on assets reduces all investment returns by {assetTax.toFixed(1)}%. Effective returns are lower across all profiles.
      </div>}
    </div>
    {nAge>0&&nRetAge>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}><div style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>{ytr>0?ytr+" years to go":"At retirement"}</div>{nYP>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>Plan to age {nRetAge+nYP}</div>}{mSav>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#86efac"}}>Saving {fmt(mSav)}/mo{hasIncomeData?" (actual)":""}</div>}</div>}
  </Cd>
  {magic.real>0&&ytr>0&&nEx>=0&&(mSav>0||nEx>0)?<>
    <Cd glow="blue" style={{textAlign:"center",padding:"40px 24px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/><div style={{position:"relative"}}><div style={{fontSize:12,fontWeight:600,color:"#60a5fa",textTransform:"uppercase",letterSpacing:3,marginBottom:10}}>Your Magic Number</div><div style={{fontFamily:"Fraunces,serif",fontSize:50,fontWeight:900,color:"#60a5fa",lineHeight:1.1,marginBottom:8,textShadow:"0 0 40px rgba(96,165,250,0.3),0 0 80px rgba(96,165,250,0.15)"}}>{fmt(Math.round(magic.real))}</div><div style={{fontSize:13,color:"#3b82f6",marginBottom:8}}>{"in today"+q+"s dollars"}</div><div style={{padding:"10px 16px",borderRadius:10,background:"rgba(0,0,0,0.2)",fontSize:12,color:"#94a3b8",lineHeight:1.6}}>Reach <strong style={{color:"#f1f5f9"}}>{fmt(Math.round(magic.real))}</strong> by <strong style={{color:"#f1f5f9"}}>age {nRetAge}</strong>. Invested at {retProfLabel} ({pct(retProfReturn)} real{TAX>0?", net of "+assetTax.toFixed(1)+"% tax":""}), it funds <strong style={{color:"#f1f5f9"}}>{fmt(desiredAfterSS)}/mo</strong> for <strong style={{color:"#f1f5f9"}}>{nYP} years</strong>{nSS>0?" (after "+fmt(nSS)+"/mo retirement income)":""}{nLegacy>0?" and leaves "+fmt(nLegacy)+" as legacy":""} — lasting until age {nRetAge+nYP}.</div></div></Cd>
    <Cd><ST sub="Adjust these three levers to explore how to reach your Magic Number.">Simulation: Your Three Levers</ST>
      <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>💰 Starting Savings</span><span style={{fontSize:15,fontWeight:700,color:"#60a5fa"}}>{fmt(simEffSav)}</span></div><Slider label="" value={simSav!=null?simSav:nEx} onChange={function(v){setSimSav(v)}} min={0} max={Math.max(nEx*3,500000)} step={10000} format={function(v){return fmtC(v)}} color="#60a5fa"/>{simSav!=null&&simSav!==nEx&&<div style={{fontSize:10,color:"#93c5fd",marginTop:-4}}>Actual: {fmt(nEx)} · Simulating: {fmt(simSav)}</div>}</div>
      <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>📅 Monthly Savings</span><span style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>{fmt(simEffMo)}/mo</span></div><Slider label="" value={simMo!=null?simMo:Math.max(mSav,0)} onChange={function(v){setSimMo(v)}} min={0} max={Math.max(mSav*3,10000)} step={100} format={function(v){return fmt(v)}} color="#22c55e"/>{simMo!=null&&simMo!==Math.max(mSav,0)&&<div style={{fontSize:10,color:"#86efac",marginTop:-4}}>Actual: {fmt(Math.max(mSav,0))}/mo · Simulating: {fmt(simMo)}/mo</div>}</div>
      <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>📈 Annual Real Return</span><span style={{fontSize:15,fontWeight:700,color:"#f59e0b"}}>{(simEffRet*100).toFixed(1)}%</span></div><Slider label="" value={simRet!=null?simRet:(simEffRet*100)} onChange={function(v){setSimRet(v)}} min={0} max={12} step={0.1} format={function(v){return v.toFixed(1)+"%"}} color="#f59e0b"/><div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>{adjProfiles.filter(function(_,i){return i>=1}).map(function(p){return <TabBtn key={p.id} active={Math.abs(simEffRet-p.realReturn)<0.001} label={p.icon+" "+p.name+" "+pct(p.realReturn)} onClick={function(){setSimRet(p.realReturn*100)}} color={p.color}/>})}</div></div>
      {simSav!=null||simMo!=null||simRet!=null?<div style={{textAlign:"center",marginBottom:12}}><button onClick={function(){setSimSav(null);setSimMo(null);setSimRet(null)}} style={{background:"rgba(255,255,255,0.04)",color:"#64748b",border:"1px solid rgba(255,255,255,0.08)",padding:"8px 20px",borderRadius:10,fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer"}}>↩ Reset to Actual Values</button></div>:null}
    </Cd>
    <Cd glow={simProjected>=magic.real?"green":"red"} style={{textAlign:"center",padding:"28px 24px"}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:simProjected>=magic.real?"#22c55e":"#ef4444",marginBottom:6}}>At Retirement (Age {nRetAge})</div><div style={{fontFamily:"Fraunces,serif",fontSize:40,fontWeight:900,color:simProjected>=magic.real?"#22c55e":"#f87171"}}>{fmtC(simProjected)}</div><div style={{fontSize:13,color:"#94a3b8",marginTop:4}}>{"today"+q+"s dollars"}</div><div style={{marginTop:16,padding:14,borderRadius:12,background:"rgba(0,0,0,0.2)"}}><div style={{height:10,borderRadius:5,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:5,width:Math.min(simPct,100)+"%",background:simPct>=100?"linear-gradient(90deg,#22c55e,#4ade80)":simPct>=60?"linear-gradient(90deg,#eab308,#facc15)":"linear-gradient(90deg,#ef4444,#f87171)",transition:"width 0.5s"}}/></div><div style={{fontSize:13,fontWeight:700,marginTop:6,color:simPct>=100?"#22c55e":simPct>=60?"#eab308":"#ef4444"}}>{simPct>=100?"🎉 "+simPct.toFixed(0)+"% — You"+q+"ll surpass your Magic Number by "+fmtC(simProjected-magic.real)+"!":simPct>=60?"⚡ "+simPct.toFixed(1)+"% — "+fmtC(simGap)+" short. Almost there!":"📈 "+simPct.toFixed(1)+"% — "+fmtC(simGap)+" to go. Use the levers above!"}</div></div></Cd>
    {simGap>0&&<Cd><ST sub="Three ways to reach your Magic Number.">How to Close the Gap</ST><div style={{display:"grid",gap:12}}>{simNeededReturn!=null?<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(245,158,11,0.04)",border:"1px solid rgba(245,158,11,0.1)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:600,color:"#fde68a"}}>A. Higher return</span><span style={{fontSize:16,fontWeight:800,color:"#f59e0b"}}>{(simNeededReturn*100).toFixed(1)}%</span></div><div style={{fontSize:12,color:"#94a3b8"}}>You need <strong style={{color:"#f59e0b"}}>{(simNeededReturn*100).toFixed(1)}% real</strong>{(function(){var m=adjProfiles.find(function(p){return Math.abs(p.realReturn-simNeededReturn)<0.008});return m?" ≈ "+m.icon+" "+m.name:""})()}</div></div>:<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.1)"}}><div style={{fontSize:13,fontWeight:600,color:"#fca5a5"}}>A. Return alone won{"'t"} work — save more.</div></div>}{simNeededMonthly!=null&&<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.1)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:600,color:"#86efac"}}>B. Save more</span><span style={{fontSize:16,fontWeight:800,color:"#22c55e"}}>{fmt(simNeededMonthly)}/mo</span></div><div style={{fontSize:12,color:"#94a3b8"}}>At {(simEffRet*100).toFixed(1)}% real{simNeededMonthly>simEffMo?" — "+fmt(simNeededMonthly-simEffMo)+"/mo more":""}</div></div>}{simNeededReturn!=null&&simNeededMonthly!=null&&<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)"}}><div style={{fontSize:13,fontWeight:600,color:"#93c5fd",marginBottom:6}}>C. Combine both</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>{(function(){var midR=simEffRet+(simNeededReturn-simEffRet)*0.5;var lo=0,hi=50000;for(var i=0;i<30;i++){var mid=(lo+hi)/2;if(fvVariable(simEffSav,mid,midR,ytr,debtEvents)<magic.real)lo=mid;else hi=mid}return[{l:"Return",v:(midR*100).toFixed(1)+"%",c:"#f59e0b"},{l:"Save",v:fmt((lo+hi)/2)+"/mo",c:"#22c55e"}].map(function(s){return <div key={s.l} style={{padding:"10px 12px",borderRadius:10,background:"rgba(0,0,0,0.15)",textAlign:"center"}}><div style={{fontSize:10,color:"#64748b"}}>{s.l}</div><div style={{fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div></div>})})()}</div></div>}</div></Cd>}
    {simGap<=0&&<Cd glow="green" style={{padding:"20px 24px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:"#22c55e",marginBottom:8}}>🎉 You{"'re"} on track!</div><div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>You{"'ll"} surpass your Magic Number by <strong style={{color:"#22c55e"}}>{fmtC(simProjected-magic.real)}</strong>.</div></Cd>}
    <AdvisorCTA msg={simGap>0?"Need help closing the gap?":"Protect and optimize your plan"}/>
    <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",textAlign:"center",lineHeight:1.5,marginTop:12}}>📐 All in <strong>{"today"+q+"s dollars"}</strong>. Levers are simulations. Refine with <span style={{cursor:"pointer",color:"#60a5fa"}} onClick={function(){goTab("situation")}}>Income & Exp</span>, <span style={{cursor:"pointer",color:"#60a5fa"}} onClick={function(){goTab("portfolio")}}>Portfolio</span>, and <span style={{cursor:"pointer",color:"#60a5fa"}} onClick={function(){goTab("retirement")}}>Retirement</span>.</div>
  </>:<Cd style={{textAlign:"center",padding:"24px 20px"}}><div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6}}>Fill in the fields above to discover your Magic Number.</div></Cd>}

  {/* === REVERSE CALCULATOR === */}
  {nAge>0&&<>
  <Cd style={{marginTop:24,borderTop:"2px solid rgba(96,165,250,0.15)",paddingTop:28}}>
    <div style={{textAlign:"center",marginBottom:20}}>
      <div style={{fontSize:28,marginBottom:8}}>🗓️</div>
      <h2 style={{fontFamily:"Fraunces,serif",fontSize:20,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>When Can I Retire?</h2>
      <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.6,maxWidth:400,margin:"0 auto"}}>
        {"Can"+q+"t"} reach your Magic Number? Flip it around — enter your situation below and {"we"+q+"ll"} tell you at what age you can retire.
      </p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <NI label={"Desired income (today"+q+"s $/mo)"} value={revDes} onChange={setRevDes} placeholder={nDes>0?nDes.toLocaleString("en-US"):""} tip="Monthly spending in retirement, today's dollars."/>
      <NI label="Years in retirement" value={revYrs} onChange={setRevYrs} prefix="" placeholder={nYP>0?String(nYP):""} tip="How long your money needs to last."/>
    </div>
    <NI label="Other retirement income ($/mo future $)" value={revSS} onChange={setRevSS} placeholder={nSSRaw>0?nSSRaw.toLocaleString("en-US"):""} tip="Social Security, pension. Future dollars — we adjust for inflation based on when you retire."/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <NI label="Current savings" value={revSav} onChange={setRevSav} placeholder={nEx>0?nEx.toLocaleString("en-US"):""} tip="What you have today in investable assets."/>
      <NI label="Monthly savings" value={revMo} onChange={setRevMo} placeholder={mSav>0?Math.round(mSav).toLocaleString("en-US"):""} tip="How much you save per month going forward."/>
    </div>
    {(revDes===""||revYrs===""||revSav===""||revMo==="")&&(nDes>0||nEx>0)&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",marginBottom:12}}>
      📐 Empty fields use values from Your Essentials above. Override any field to customize.
    </div>}
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>📈 Accumulation Return (real)</span>
        <span style={{fontSize:15,fontWeight:700,color:"#f59e0b"}}>{revRet.toFixed(1)}%</span>
      </div>
      <Slider label="" value={revRet} onChange={setRevRet} min={0} max={12} step={0.1} format={function(v){return v.toFixed(1)+"%"}} color="#f59e0b"/>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
        {adjProfiles.filter(function(_,i){return i>=1}).map(function(p){return <TabBtn key={p.id} active={Math.abs(revRet-p.realReturn*100)<0.05} label={p.icon+" "+p.name+" "+pct(p.realReturn)} onClick={function(){setRevRet(p.realReturn*100)}} color={p.color}/>})}
      </div>
    </div>
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>Investment strategy <strong>during retirement</strong>:</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {adjProfiles.filter(function(_,i){return i<=4}).map(function(p,i){return <TabBtn key={p.id} active={revRetProf===i} label={p.icon+" "+p.name} onClick={function(){setRevRetProf(i)}} color={p.color}/>})}
      </div>
      <div style={{fontSize:10,color:"#93c5fd",marginTop:4}}>{adjProfiles[revRetProf].icon} {adjProfiles[revRetProf].name} at {pct(adjProfiles[revRetProf].realReturn)} real during retirement</div>
    </div>
    {(nLegacy>0||TAX>0)&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
      {nLegacy>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd"}}>🎁 Legacy: {fmt(nLegacy)} <span style={{color:"#475569"}}>(from above)</span></div>}
      {TAX>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.08)",fontSize:11,color:"#fde68a"}}>🏛️ Tax: {assetTax.toFixed(1)}% <span style={{color:"#475569"}}>(from above)</span></div>}
    </div>}
  </Cd>

  {revResult&&<Cd glow={revResult.age?"green":"red"} style={{textAlign:"center",padding:"28px 24px"}}>
    {revResult.age?<>
      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"#22c55e",marginBottom:6}}>You Can Retire At</div>
      <div style={{fontFamily:"Fraunces,serif",fontSize:56,fontWeight:900,color:"#22c55e",lineHeight:1,marginBottom:4}}>Age {revResult.age}</div>
      <div style={{fontSize:13,color:"#94a3b8",marginTop:8,lineHeight:1.6}}>
        In <strong style={{color:"#f1f5f9"}}>{revResult.yrsToRetire} years</strong>, your savings will reach <strong style={{color:"#60a5fa"}}>{fmtC(revResult.projected)}</strong> — enough to cover your Magic Number of <strong style={{color:"#60a5fa"}}>{fmtC(revResult.mn)}</strong>{nLegacy>0?" (includes "+fmt(nLegacy)+" legacy)":""}{revResult.surplus>0?" with a surplus of "+fmtC(revResult.surplus):""}.
      </div>
      {revResult.ssToday>0&&<div style={{fontSize:11,color:"#93c5fd",marginTop:8}}>
        Retirement income: {fmt(Number(revSS))}/mo future $ = {fmt(revResult.ssToday)}/mo today{"'s"} $ (at age {revResult.age})
      </div>}
      {TAX>0&&<div style={{fontSize:11,color:"#fde68a",marginTop:4}}>🏛️ Returns net of {assetTax.toFixed(1)}% annual asset tax</div>}
      <div style={{marginTop:16,padding:14,borderRadius:12,background:"rgba(0,0,0,0.2)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div><div style={{fontSize:10,color:"#64748b"}}>Retire at</div><div style={{fontSize:18,fontWeight:700,color:"#22c55e"}}>{revResult.age}</div></div>
          <div><div style={{fontSize:10,color:"#64748b"}}>Savings then</div><div style={{fontSize:18,fontWeight:700,color:"#60a5fa"}}>{fmtC(revResult.projected)}</div></div>
          <div><div style={{fontSize:10,color:"#64748b"}}>Magic Number</div><div style={{fontSize:18,fontWeight:700,color:"#f1f5f9"}}>{fmtC(revResult.mn)}</div></div>
        </div>
      </div>
    </>:<>
      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"#ef4444",marginBottom:6}}>Cannot Retire By 100</div>
      <div style={{fontSize:13,color:"#fca5a5",lineHeight:1.6}}>{revResult.message}</div>
    </>}
  </Cd>}
  {revResult&&<AdvisorCTA msg={revResult.age?"Make your retirement plan a reality":"Let an expert help you find a path"}/>}
  </>}

  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === COST OF INACTION === */}
{tab==="inaction"&&<div className="fi">
  <Cd style={{textAlign:"center",padding:"24px 20px"}}>
    <div style={{fontSize:36,marginBottom:10}}>💤</div>
    <h2 style={{fontFamily:"Fraunces,serif",fontSize:22,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>The Cost of Inaction</h2>
    <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.7,maxWidth:440,margin:"0 auto"}}>
      What are you leaving on the table by keeping money in a vault — or by waiting to start investing? The numbers below might surprise you.
    </p>
  </Cd>

  {(function(){
    var defSav=nEx>0?nEx:100000;
    var defMo=mSav>0?mSav:1000;
    var iSav=ciSav!=null?ciSav:defSav;
    var iMo=ciMo!=null?ciMo:defMo;

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
    <Cd><ST sub="Set your starting point for the comparisons below.">Your Numbers</ST>
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>💰 Current Savings</span>
          <span style={{fontSize:15,fontWeight:700,color:"#60a5fa"}}>{fmt(iSav)}</span>
        </div>
        <Slider label="" value={iSav} onChange={function(v){setCiSav(v)}} min={0} max={Math.max(defSav*3,500000)} step={10000} format={function(v){return fmtC(v)}} color="#60a5fa"/>
      </div>
      <div style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>📅 Monthly Savings</span>
          <span style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>{fmt(iMo)}/mo</span>
        </div>
        <Slider label="" value={iMo} onChange={function(v){setCiMo(v)}} min={0} max={Math.max(defMo*3,10000)} step={100} format={function(v){return fmt(v)}} color="#22c55e"/>
      </div>
      {(ciSav!=null||ciMo!=null)&&<div style={{textAlign:"center",marginTop:8}}>
        <button onClick={function(){setCiSav(null);setCiMo(null)}} style={{background:"rgba(255,255,255,0.04)",color:"#64748b",border:"1px solid rgba(255,255,255,0.08)",padding:"6px 16px",borderRadius:8,fontSize:11,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer"}}>↩ Reset to {nEx>0?"your data":"defaults"}</button>
      </div>}
    </Cd>

    {/* Section 1: BASE VS INVESTING */}
    <Cd><ST sub={"What you lose by keeping "+fmt(iSav)+" + "+fmt(iMo)+"/mo in "+baseProf.name+" instead of investing."}>{baseProf.icon} {baseProf.name} vs Investing</ST>
      <div style={{fontSize:11,color:"#94a3b8",marginBottom:12}}>Compare against:</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:16}}>
        {adjProfiles.filter(function(_,i){return i<=2}).map(function(p,i){return <TabBtn key={p.id} active={ciBase===i} label={p.icon+" "+p.name} onClick={function(){setCiBase(i)}} color={p.color}/>})}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20,justifyContent:"center"}}>
        {[10,20,30,40].map(function(y){return <TabBtn key={y} active={ciH===y} label={y+"yr"} onClick={function(){setCiH(y)}}/>})}
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

      {profVals.length===0?<div style={{textAlign:"center",padding:"20px",color:"#64748b",fontSize:13}}>No higher-return profiles to compare. Select a lower base.</div>
      :profVals.map(function(p){return(
        <div key={p.name} style={{marginBottom:12,padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.1)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:600,color:"#f1f5f9"}}>{p.icon} {p.name} <span style={{color:"#475569",fontWeight:400}}>({pct(p.real)} real)</span></span>
            <span style={{fontSize:15,fontWeight:700,color:p.color}}>{fmtC(p.val)}</span>
          </div>
          <div style={{height:24,borderRadius:6,overflow:"hidden",background:"rgba(255,255,255,0.03)",position:"relative"}}>
            <div style={{height:"100%",borderRadius:6,width:Math.max((baseVal/maxVal)*100,2)+"%",background:"linear-gradient(90deg,#475569,#64748b)",position:"absolute"}}/>
            <div className="ba" style={{height:"100%",borderRadius:6,width:Math.max((p.val/maxVal)*100,2)+"%",background:"linear-gradient(90deg,"+p.color+"88,"+p.color+")",position:"relative"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:10,color:"#475569"}}>Gray = {baseProf.name}</span>
            <span style={{fontSize:11,fontWeight:700,color:"#f87171"}}>Lost: {fmtC(p.lost)}</span>
          </div>
        </div>
      )})}

      {profVals.length>0&&<div style={{padding:"16px 20px",borderRadius:12,background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.1)",textAlign:"center",marginTop:8}}>
        <div style={{fontSize:12,color:"#fca5a5",marginBottom:4}}>Staying in {baseProf.icon} {baseProf.name} for {ciH} years</div>
        <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.6}}>
          vs the most aggressive option (<strong style={{color:profVals[profVals.length-1].color}}>{profVals[profVals.length-1].icon} {profVals[profVals.length-1].name}</strong>), you{"'d"} leave <strong style={{color:"#f87171"}}>{fmtC(profVals[profVals.length-1].lost)}</strong> on the table.
        </div>
      </div>}
    </Cd>

    <AdvisorCTA msg="Want to earn more on your savings?"/>

    {/* Section 2: COST OF DELAYING */}
    <Cd><ST sub="Every year you wait costs compound growth that can never be recovered.">The Price of Waiting</ST>
      <div style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>What if you invest in <strong style={{color:delayProf.color}}>{delayProf.icon} {delayProf.name}</strong> but start late?</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:16}}>
        {adjProfiles.filter(function(_,i){return i>=1}).map(function(p,i){var idx=i+1;return <TabBtn key={p.id} active={ciDelayProf===idx} label={p.icon+" "+p.name} onClick={function(){setCiDelayProf(idx)}} color={p.color}/>})}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20,justifyContent:"center"}}>
        {[10,20,30,40].map(function(y){return <TabBtn key={y} active={ciH===y} label={y+"yr"} onClick={function(){setCiH(y)}}/>})}
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
                  <span style={{fontSize:12,fontWeight:600,color:isToday?"#22c55e":"#f1f5f9"}}>{isToday?"🟢 Start today":"⏳ Wait "+d.delay+"yr"}</span>
                  <span style={{fontSize:10,color:"#475569",marginLeft:6}}>({d.yrs}yr investing)</span>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:isToday?"#22c55e":lost>0?"#f87171":"#f1f5f9"}}>{fmtC(d.val)}</span>
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
        <div style={{fontSize:14,fontWeight:700,color:"#f87171",marginBottom:6}}>10 years of waiting = −{fmtC(todayVal-lastDelay.val)}</div>
        <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.6}}>
          {"That"+q+"s"} <strong style={{color:"#f87171"}}>{todayVal>0?((todayVal-lastDelay.val)/todayVal*100).toFixed(1):"0"}%</strong> of your potential wealth — gone forever. The best time to invest was yesterday. The second best time is today.
        </div>
      </div>
    </Cd>

    <AdvisorCTA msg="Don't let inaction cost you more"/>
    <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",textAlign:"center",lineHeight:1.5,marginTop:12}}>
      📐 All in <strong>{"today"+q+"s dollars"}</strong>. Based on historical average returns. Past performance is no guarantee of future results.
    </div>
    </>)})()}
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === SAVE MORE === */}
{tab==="save"&&<div className="fi">
  <Cd><ST tip="Only discretionary (✂️) expenses shown. Use sliders to adjust." sub="Find hidden money in discretionary spending.">Savings Opportunities</ST>
    {savOpps.length===0?<div style={{textAlign:"center",padding:"30px 20px",color:"#64748b"}}><div style={{fontSize:36,marginBottom:12}}>🔍</div><p>Add discretionary (✂️) expenses in <span style={{color:"#22c55e",cursor:"pointer",textDecoration:"underline"}} onClick={function(){goTab("situation")}}>Income</span> first.</p></div>
    :savOpps.map(function(o,i){return(<div key={o.id} style={{padding:16,borderRadius:14,marginBottom:12,background:i===0?"rgba(34,197,94,0.04)":"rgba(0,0,0,0.12)",border:i===0?"1px solid rgba(34,197,94,0.1)":"1px solid rgba(255,255,255,0.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>{o.name}</span><span style={{fontSize:13,fontWeight:600,color:"#f87171"}}>{fmt(o.cur)}/mo</span></div>
      <Slider label={"Cut by "+o.cutPct+"%"} value={o.cutPct} onChange={function(v){setSavSliders(function(p){var n=Object.assign({},p);n[o.id]=v;return n})}} min={0} max={100} step={5} format={function(v){return fmt(o.cur*(v/100))+"/mo saved"}} color="#22c55e"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
        {[{y:10,v:o.imp10},{y:20,v:o.imp20},{y:30,v:o.imp30}].map(function(t){return(
          <div key={t.y} style={{textAlign:"center",padding:"8px 6px",borderRadius:8,background:"rgba(0,0,0,0.15)"}}>
            <div style={{fontSize:9,color:"#64748b"}}>{t.y}yr</div>
            <div style={{fontSize:13,fontWeight:700,color:"#22c55e"}}>{fmtC(t.v)}</div>
          </div>)})}
      </div>
      {i===0&&<div style={{fontSize:10,color:"#16a34a",marginTop:6,fontWeight:600}}>⭐ BIGGEST OPPORTUNITY</div>}
    </div>)})}
  </Cd>
  {savOpps.length>0&&<Cd glow="green">
    <h3 style={{fontFamily:"Fraunces,serif",fontSize:17,fontWeight:600,color:"#22c55e",marginBottom:8}}>💡 Combined Savings Impact</h3>
    <div style={{fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:12}}>Extra {fmt(totalSavOpp.mo)}/mo</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center"}}>
      {[{l:"10yr",v:totalSavOpp.imp10},{l:"20yr",v:totalSavOpp.imp20},{l:"30yr",v:totalSavOpp.imp30}].map(function(t){return(
        <div key={t.l} style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.2)"}}>
          <div style={{fontSize:10,color:"#64748b"}}>{t.l}</div>
          <div style={{fontSize:18,fontWeight:800,color:"#22c55e"}}>{fmtC(t.v)}</div>
          <div style={{fontSize:9,color:"#475569"}}>{"today"+q+"s $, 60/40"}</div>
        </div>)})}
    </div>
    {/* Before vs After bar */}
    <div style={{marginTop:16,padding:"14px 16px",borderRadius:12,background:"rgba(0,0,0,0.15)"}}>
      <div style={{fontSize:12,color:"#94a3b8",marginBottom:10}}>Monthly Savings: Before vs After</div>
      <div style={{display:"flex",gap:12,alignItems:"flex-end",height:50}}>
        <div style={{flex:1,textAlign:"center"}}><div style={{height:Math.min(mSav/(mSav+totalSavOpp.mo)*50,50),background:"linear-gradient(180deg,#64748b,#475569)",borderRadius:"4px 4px 0 0"}}/><div style={{fontSize:10,color:"#64748b",marginTop:4}}>{fmt(mSav)}<br/>Before</div></div>
        <div style={{flex:1,textAlign:"center"}}><div style={{height:50,background:"linear-gradient(180deg,#22c55e,#16a34a)",borderRadius:"4px 4px 0 0"}}/><div style={{fontSize:10,color:"#22c55e",marginTop:4}}>{fmt(mSav+totalSavOpp.mo)}<br/>After</div></div>
      </div>
    </div>
  </Cd>}
  <Cd style={{padding:"12px 16px"}}>
    <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#fde68a",lineHeight:1.6}}>
      ⚠️ <strong>These are scenarios only</strong> — savings shown here are NOT automatically applied to your retirement projections. To incorporate savings into your plan, go to <span style={{color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("situation")}}>Income & Exp</span> and reduce or remove the discretionary expenses you{"'re"} willing to cut.
    </div>
  </Cd>
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === EARN MORE === */}
{tab==="earn"&&<div className="fi">
  <Cd><ST tip="Side income, freelancing, raises — see the long-term impact." sub="What if you earned more?">Generate Income</ST>
    <NI label="Extra monthly income" value={extraIncome} onChange={setExtraIncome} placeholder="" tip="Side hustle, freelancing, part-time work."/>
    <Toggle value={eiTemporary} onChange={setEiTemporary} label="Temporary income" sub={eiTemporary?"Income lasts "+nEIYrs+" years":"Permanent extra income"}/>
    {eiTemporary&&<NI label="How many years?" value={eiYears} onChange={setEiYears} prefix="" placeholder="5" tip="How long will this extra income last?"/>}
  </Cd>
  {earnProj&&<Cd glow="green">
    <div style={{fontSize:12,fontWeight:600,color:"#16a34a",textTransform:"uppercase",letterSpacing:2,marginBottom:12}}>Extra {fmt(nEI)}/mo Invested</div>
    <MiniChart data={earnProj.data} height={120} color="#22c55e"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:16,textAlign:"center"}}>
      {[{l:"10yr",v:earnProj.imp10},{l:"20yr",v:earnProj.imp20},{l:"30yr",v:earnProj.imp30}].map(function(t){return(
        <div key={t.l} style={{padding:10,borderRadius:10,background:"rgba(0,0,0,0.2)"}}>
          <div style={{fontSize:10,color:"#64748b"}}>{t.l}</div>
          <div style={{fontSize:16,fontWeight:700,color:"#22c55e"}}>{fmtC(t.v)}</div>
          <div style={{fontSize:9,color:"#475569"}}>{"today"+q+"s $, 60/40"}</div>
        </div>)})}
    </div>
    {eiTemporary&&<div style={{marginTop:10,fontSize:11,color:"#fde68a",textAlign:"center"}}>⏱️ Temporary: {nEIYrs} years of contributions, then growth continues.</div>}
  </Cd>}

  {/* Combined: Save + Earn */}
  {(totalSavOpp.mo>0||nEI>0)&&<Cd glow="gold">
    <div style={{fontSize:12,fontWeight:600,color:"#a18207",marginBottom:12}}>🔥 Combined Impact: Save Less + Earn More</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
      <div style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.15)",textAlign:"center"}}>
        <div style={{fontSize:10,color:"#64748b"}}>Save Less</div>
        <div style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>+{fmt(totalSavOpp.mo)}/mo</div>
      </div>
      <div style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.15)",textAlign:"center"}}>
        <div style={{fontSize:10,color:"#64748b"}}>Earn More</div>
        <div style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>+{fmt(nEI)}/mo</div>
      </div>
    </div>
    <div style={{textAlign:"center",padding:"16px 20px",borderRadius:14,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)"}}>
      <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Total extra/mo</div>
      <div style={{fontFamily:"Fraunces,serif",fontSize:28,fontWeight:800,color:"#22c55e"}}>{fmt(combinedImpact.mo)}</div>
      <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:10}}>
        {[{l:"10yr",v:combinedImpact.imp10},{l:"20yr",v:combinedImpact.imp20},{l:"30yr",v:combinedImpact.imp30}].map(function(t){return(
          <div key={t.l}><div style={{fontSize:10,color:"#64748b"}}>{t.l}</div><div style={{fontSize:14,fontWeight:700,color:"#22c55e"}}>{fmtC(t.v)}</div></div>)})}
      </div>
    </div>
  </Cd>}
  <Cd style={{padding:"12px 16px"}}>
    <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#fde68a",lineHeight:1.6}}>
      ⚠️ <strong>These are scenarios only</strong> — they are NOT included in your retirement projections or Magic Number. If you want this extra income to count toward retirement, add it to your <span style={{color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("situation")}}>monthly net income</span>. If the extra income is temporary (not until retirement), consider adding a reduced amount to account for the shorter period.
    </div>
  </Cd>
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === COST IN RETIREMENT === */}
{tab==="cost"&&<div className="fi">
  <Cd><ST tip="See what a purchase really costs in terms of lost retirement wealth." sub="Every dollar you spend today could have grown. See the real cost.">Opportunity Cost</ST>
    <input type="text" value={costItemName} onChange={function(e){setCostItemName(e.target.value)}} placeholder="e.g., New car, Luxury vacation..." style={{width:"100%",background:"#131c2e",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,color:"#f1f5f9",fontSize:15,padding:"13px 16px",fontFamily:"Outfit,sans-serif",outline:"none",marginBottom:16}}/>
    <NI label="Price" value={costItemPrice} onChange={setCostItemPrice} placeholder="" tip={"In today"+q+"s dollars."}/>
    <div style={{fontSize:13,fontWeight:500,color:"#94a3b8",marginBottom:8}}>Investment profile</div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {PROFILES.map(function(p,i){return <TabBtn key={p.id} active={costProfileIdx===i} label={p.icon+" "+p.name} onClick={function(){setCostProfileIdx(i)}} color={p.color}/>})}
    </div>
  </Cd>
  {costInRet&&ytr>0&&<>
    <Cd glow="orange" style={{textAlign:"center",padding:"32px 24px"}}>
      <div style={{fontSize:48,marginBottom:12}}>😱</div>
      <div style={{fontSize:14,color:"#d97706",marginBottom:8}}>{costItemName||"That purchase"} for <strong style={{color:"#f59e0b"}}>{fmt(Number(costItemPrice))}</strong></div>
      <div style={{fontFamily:"Fraunces,serif",fontSize:22,fontWeight:700,color:"#f1f5f9",lineHeight:1.4,marginBottom:12}}>
        If invested at {pct(costInRet.prof.realReturn)} real for {ytr} years, you{"'d"} have:
      </div>
      <div style={{fontFamily:"Fraunces,serif",fontSize:42,fontWeight:900,color:"#f59e0b",marginBottom:8}}>{fmt(costInRet.fv)}</div>
      <div style={{fontSize:15,color:"#d97706",fontWeight:600}}>That{"'s"} {costInRet.multiplier.toFixed(1)}× your money</div>
      {costInRet.itemsCouldBuy>1&&<div style={{marginTop:16,padding:"14px 20px",borderRadius:12,background:"rgba(0,0,0,0.2)",fontSize:14,color:"#fde68a",lineHeight:1.6}}>
        You could buy <strong style={{fontSize:18}}>{costInRet.itemsCouldBuy}</strong> {costItemName||"of those"} instead of 1.
      </div>}
      <div style={{marginTop:12,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",textAlign:"center"}}>{"All in today"+q+"s dollars · "+costInRet.prof.icon+" "+costInRet.prof.name+" ("+pct(costInRet.prof.realReturn)+" real) · "+ytr+" years to retirement"}</div>
    </Cd>
    <Cd><ST>Compare Across Profiles</ST>
      {hasPortfolio&&blendedPortReturn!=null&&(function(){var fv=fvL(Number(costItemPrice)||0,blendedPortReturn,ytr);var mult=fv/(Number(costItemPrice)||1);return(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:8,marginBottom:4,background:"rgba(232,121,249,0.06)"}}>
          <span style={{fontSize:12,color:"#e879f9",fontWeight:600}}>🎛️ My Portfolio</span>
          <div><span style={{fontSize:13,fontWeight:700,color:"#e879f9"}}>{fmtC(fv)}</span><span style={{fontSize:10,color:"#64748b",marginLeft:6}}>({mult.toFixed(1)}×)</span></div>
        </div>)})()}
      {allProfiles.map(function(p){var fv=fvL(Number(costItemPrice)||0,p.realReturn,ytr);var mult=fv/(Number(costItemPrice)||1);return(
        <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:8,marginBottom:4,background:p.id===(allProfiles[costProfileIdx]||adjProfiles[4]).id?"rgba(245,158,11,0.06)":"transparent"}}>
          <span style={{fontSize:12,color:"#94a3b8"}}>{p.icon} {p.name}</span>
          <div><span style={{fontSize:13,fontWeight:700,color:p.color}}>{fmtC(fv)}</span><span style={{fontSize:10,color:"#64748b",marginLeft:6}}>({mult.toFixed(1)}×)</span></div>
        </div>)})}
    </Cd>
  </>}
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === GOALS === */}
{tab==="goals"&&<div className="fi">
  <Cd><ST tip="Up to 10 goals. Choose investment profile per goal or let us auto-select." sub="Medium-term financial goals and major purchases.">Intermediate Needs</ST>
    {goals.map(function(g,gi){var calc=goalCalcs[gi];return(
      <div key={g.id} style={{padding:16,background:"rgba(0,0,0,0.15)",borderRadius:14,marginBottom:12,border:"1px solid rgba(255,255,255,0.04)"}}>
        <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
          <span style={{fontSize:12,color:"#475569",fontWeight:700}}>#{gi+1}</span>
          <input type="text" value={g.name} onChange={function(e){uG(g.id,"name",e.target.value)}} placeholder="Goal name..." style={{flex:1,background:"#131c2e",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,color:"#f1f5f9",fontSize:14,padding:"10px 14px",fontFamily:"Outfit,sans-serif",outline:"none"}}/>
          {goals.length>1&&<button onClick={function(){rG(g.id)}} style={{width:32,height:32,borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",color:"#ef4444",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <NI label={"Target (today"+q+"s $)"} value={g.amount} onChange={function(v){uG(g.id,"amount",v)}} style={{marginBottom:0}}/>
          <NI label="Years" value={g.years} onChange={function(v){uG(g.id,"years",v)}} prefix="" placeholder="" style={{marginBottom:0}}/>
        </div>
        {/* Profile selector */}
        <div style={{marginTop:10}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>Investment profile</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {allProfiles.map(function(p,i){return <TabBtn key={p.id} active={g.profileIdx===i} label={p.icon+" "+p.name} onClick={function(){uG(g.id,"profileIdx",i)}} color={p.color}/>})}
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
              <div style={{fontSize:10,color:calc.mo<=mSav?"#4ade80":"#f87171"}}>{calc.mo<=mSav?"✅ Fits budget":"⚠️ Over budget by "+fmt(calc.mo-mSav)}</div>
            </div>
          </div>
        </div>}
      </div>)})}
    {goals.length<10&&<button className="bs" onClick={aG}>+ Add Goal ({goals.length}/10)</button>}
  </Cd>

  {/* Goal Roadmap */}
  {goalCalcs.filter(function(g){return g.valid}).length>0&&<Cd>
    <ST tip="Visual timeline of your goals.">Goal Roadmap</ST>
    <div style={{position:"relative",paddingLeft:24}}>
      <div style={{position:"absolute",left:8,top:0,bottom:0,width:2,background:"rgba(255,255,255,0.06)"}}/>
      {goalCalcs.filter(function(g){return g.valid}).sort(function(a,b){return a.nYrs-b.nYrs}).map(function(g,i){return(
        <div key={g.id} style={{position:"relative",marginBottom:20,paddingLeft:16}}>
          <div style={{position:"absolute",left:-20,top:4,width:12,height:12,borderRadius:"50%",background:g.prof.color,border:"3px solid #0f1628"}}/>
          <div style={{fontSize:13,fontWeight:600,color:"#f1f5f9"}}>{g.name||"Goal #"+(i+1)}</div>
          <div style={{fontSize:12,color:"#94a3b8"}}>{fmt(g.nAmt)} in {g.nYrs}yr · {g.mo>0?fmt(g.mo)+"/mo":"Covered"}</div>
          <div style={{fontSize:10,color:g.prof.color}}>{g.prof.icon} {g.prof.name}</div>
        </div>)})}
    </div>
  </Cd>}

  {/* Retirement impact */}
  {goalRetImpact&&<Cd glow="gold">
    <div style={{fontSize:12,fontWeight:600,color:"#a18207",marginBottom:10}}>⚠️ Impact on Retirement</div>
    <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6,marginBottom:12}}>
      Directing <strong style={{color:"#f1f5f9"}}>{fmt(totalGoalMo)}/mo</strong> to goals reduces your retirement projection.
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,textAlign:"center"}}>
      <div style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.15)"}}>
        <div style={{fontSize:10,color:"#64748b"}}>Without goals</div>
        <div style={{fontSize:16,fontWeight:700,color:"#22c55e"}}>{fmtC(goalRetImpact.full)}</div>
      </div>
      <div style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.15)"}}>
        <div style={{fontSize:10,color:"#64748b"}}>With goals</div>
        <div style={{fontSize:16,fontWeight:700,color:"#eab308"}}>{fmtC(goalRetImpact.reduced)}</div>
      </div>
    </div>
    <div style={{textAlign:"center",marginTop:8,fontSize:12,color:"#f87171"}}>Retirement reduction: <strong>{fmt(goalRetImpact.diff)}</strong> ({goalRetImpact.pctOfMagic.toFixed(1)}% of Magic Number)</div>
    <div style={{marginTop:8,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",textAlign:"center",lineHeight:1.5}}>
      📐 The retirement reduction measures the <strong>opportunity cost</strong> — what those monthly contributions would have grown to at 60/40 ({pct(goalImpactRate)} real), which is a balanced benchmark for long-term accumulation.
    </div>
  </Cd>}
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === SCORE === */}
{tab==="score"&&<div className="fi">
  <Cd><ST tip="0-100 based on savings rate, debts, retirement progress, active saving.">Financial Health Score</ST>
    <Gauge value={hScore.s}/>
    <div style={{marginTop:20,display:"grid",gap:6}}>
      {hScore.bd.map(function(b){return(<div key={b.l} style={{padding:"9px 12px",borderRadius:8,background:"rgba(0,0,0,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{width:7,height:7,borderRadius:"50%",background:b.st==="good"?"#22c55e":b.st==="ok"?"#eab308":"#ef4444"}}/><span style={{fontSize:12,color:"#94a3b8"}}>{b.l}</span></div>
          <span style={{fontSize:13,fontWeight:700,color:b.st==="good"?"#22c55e":b.st==="ok"?"#eab308":"#ef4444"}}>{b.s}/{b.m}</span></div>
        {b.det&&<div style={{fontSize:10,color:"#475569",marginTop:3,marginLeft:14}}>{b.det}</div>}
      </div>)})}
    </div>
    <div style={{marginTop:14,padding:"10px 14px",borderRadius:10,fontSize:12,lineHeight:1.5,background:hScore.s>=70?"rgba(34,197,94,0.06)":hScore.s>=40?"rgba(234,179,8,0.06)":"rgba(239,68,68,0.06)",color:hScore.s>=70?"#86efac":hScore.s>=40?"#fde68a":"#fca5a5"}}>
      {hScore.s>=70?"🎯 Great shape! Focus on optimizing your investment strategy.":hScore.s>=40?"⚡ Making progress. See action plan below.":"🚀 Room to improve. Follow the action plan."}
    </div>
  </Cd>

  {/* Action Plan */}
  {hScore.recs.length>0&&<Cd glow="green">
    <ST>Personalized Action Plan</ST>
    <div style={{display:"grid",gap:10}}>
      {hScore.recs.map(function(r,i){return(
        <div key={i} style={{display:"flex",gap:12,padding:"12px 14px",borderRadius:12,background:"rgba(0,0,0,0.15)",border:"1px solid rgba(255,255,255,0.04)"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:r.priority===1?"rgba(239,68,68,0.15)":r.priority===2?"rgba(234,179,8,0.15)":"rgba(34,197,94,0.15)",color:r.priority===1?"#ef4444":r.priority===2?"#eab308":"#22c55e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</div>
          <div><div style={{fontSize:11,color:r.priority===1?"#ef4444":r.priority===2?"#eab308":"#22c55e",fontWeight:600,marginBottom:2}}>{r.cat}</div>
            <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{r.text}</div></div>
        </div>)})}
    </div>
  </Cd>}

  {/* Benchmarking */}
  <Cd><ST tip="Based on US Federal Reserve Survey of Consumer Finances.">How Do You Compare?</ST>
    {nAge>0?<div style={{display:"grid",gap:16}}>
      {[{l:"Savings Rate",g:bSR.l,y:savRate.toFixed(0)+"%",m:bSR.med+"%",a:savRate>bSR.med,p:percentiles.sr,p25:bSR.p25,med:bSR.med,p75:bSR.p75,uv:savRate,unit:"%"},
        {l:"Total Assets",g:bNW.l,y:fmtC(totalNetWorth),m:fmtC(bNW.med),a:totalNetWorth>bNW.med,p:percentiles.nw,p25:bNW.p25,med:bNW.med,p75:bNW.p75,uv:totalNetWorth,unit:"$"}].map(function(b){return(
        <div key={b.l} style={{padding:16,borderRadius:14,background:"rgba(0,0,0,0.15)",border:"1px solid rgba(255,255,255,0.04)"}}>
          <div style={{fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{b.l} · Age {b.g}</div>
          <div style={{display:"flex",gap:16,marginBottom:10}}>
            <div><span style={{fontSize:10,color:"#64748b"}}>You: </span><span style={{fontSize:20,fontWeight:700,color:b.a?"#22c55e":"#eab308"}}>{b.y}</span></div>
            <div><span style={{fontSize:10,color:"#64748b"}}>Median: </span><span style={{fontSize:20,fontWeight:700,color:"#94a3b8"}}>{b.m}</span></div>
          </div>
          {/* Percentile bar */}
          <div style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#475569",marginBottom:4}}>
              <span>25th</span><span>50th</span><span>75th</span>
            </div>
            <div style={{position:"relative",height:8,borderRadius:4,background:"rgba(255,255,255,0.04)"}}>
              <div style={{position:"absolute",left:"25%",top:0,bottom:0,width:1,background:"rgba(255,255,255,0.08)"}}/>
              <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"rgba(255,255,255,0.08)"}}/>
              <div style={{position:"absolute",left:"75%",top:0,bottom:0,width:1,background:"rgba(255,255,255,0.08)"}}/>
              <div style={{position:"absolute",left:Math.min(b.p||0,98)+"%",top:-4,width:16,height:16,borderRadius:"50%",background:b.a?"#22c55e":"#eab308",border:"3px solid #0f1628",transform:"translateX(-50%)",transition:"left 0.5s"}}/>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:14,fontWeight:700,color:b.a?"#22c55e":"#eab308"}}>{b.p?("P"+b.p):"—"}</div>
            <div style={{fontSize:12,color:b.a?"#86efac":"#fde68a"}}>{b.a?"✅ Above median":"📊 Below median"}</div>
          </div>
        </div>)})}
    </div>:<p style={{color:"#64748b",fontSize:13}}>Enter age in <span style={{color:"#22c55e",cursor:"pointer",textDecoration:"underline"}} onClick={function(){goTab("situation")}}>Income</span>.</p>}
  </Cd>
  <NavButtons tab={tab} goTab={goTab}/>
</div>}

{/* === REPORTS === */}
{tab==="reports"&&<div className="fi">
  {/* Convenceme */}
  <Cd glow="purple"><ST tip="Generate a mini-report to share with your partner or family." sub="Show them why it matters.">Convince Mode 💬</ST>
    {mSav>0&&savOpps.length>0?<>
      <div style={{padding:20,borderRadius:16,background:"linear-gradient(145deg,#0f1628,#131c2e)",border:"1px solid rgba(167,139,250,0.15)",marginBottom:16}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontFamily:"Fraunces,serif",fontSize:18,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>What if we saved a little more?</div>
          <div style={{fontSize:12,color:"#64748b"}}>A mini financial scenario</div>
        </div>
        {savOpps.slice(0,3).map(function(o){return(
          <div key={o.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,marginBottom:4,background:"rgba(0,0,0,0.15)"}}>
            <span style={{fontSize:12,color:"#94a3b8"}}>Cut {o.name} by {o.cutPct}%</span>
            <span style={{fontSize:12,fontWeight:600,color:"#22c55e"}}>+{fmt(o.saved)}/mo</span>
          </div>)})}
        <div style={{textAlign:"center",marginTop:16,padding:14,borderRadius:12,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)"}}>
          <div style={{fontSize:11,color:"#64748b"}}>In 20 years, those small changes become</div>
          <div style={{fontFamily:"Fraunces,serif",fontSize:32,fontWeight:800,color:"#22c55e"}}>{fmtC(totalSavOpp.imp20)}</div>
          <div style={{fontSize:10,color:"#475569"}}>{"today"+q+"s dollars · 60/40 portfolio"}</div>
        </div>
      </div>
      <button onClick={function(){
        var text="💰 What if we saved a little more?\n\n";
        savOpps.slice(0,3).forEach(function(o){text+="• Cut "+o.name+" by "+o.cutPct+"%: +"+fmt(o.saved)+"/mo\n"});
        text+="\nIn 20 years: "+fmtC(totalSavOpp.imp20)+" (today's $, 60/40)\n\n— Generated by Magic Number";
        navigator.clipboard.writeText(text).then(function(){alert("Copied! Share via WhatsApp, email, or text.")})
      }} style={{width:"100%",background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"#fff",border:"none",padding:"14px 24px",borderRadius:14,fontSize:14,fontWeight:700,fontFamily:"Outfit,sans-serif",cursor:"pointer",boxShadow:"0 4px 20px rgba(167,139,250,0.25)"}}>
        📋 Copy to Share
      </button>
    </>:<div style={{textAlign:"center",padding:20,color:"#64748b"}}><div style={{fontSize:36,marginBottom:12}}>📊</div><p>Add income, expenses, and savings data first.</p></div>}
  </Cd>

  {/* Financial Snapshot / Print */}
  <Cd glow="blue"><ST tip="Print or save as PDF with your browser's print function." sub="Your complete financial snapshot.">Financial Snapshot 📄</ST>
    {hasData?<>
      <div style={{display:"grid",gap:10,marginBottom:16}}>
        {(nRentalNet>0?[
          {l:"Work Income",v:fmt(nInc+(coupleMode?nP2I:0)),c:"#f1f5f9"},
          {l:"🏘️ Net Rental Income",v:fmt(nRentalNet),c:"#f1f5f9"},
          {l:"Total Monthly Income",v:fmt(totalIncome),c:"#22c55e"}
        ]:[{l:"Monthly Income",v:fmt(totalIncome),c:"#f1f5f9"}])
        .concat([{l:"Monthly Expenses"+(nVac>0?" (incl. vacation)":""),v:fmt(totExp),c:"#f87171"}])
        .concat(nMortPay>0?[{l:"Mortgage P+I",v:fmt(nMortPay),c:"#f87171"}]:[])
        .concat(nCarPay>0?[{l:"Car Loan",v:fmt(nCarPay),c:"#f87171"}]:[])
        .concat([
          {l:"Monthly Savings",v:fmt(mSav),c:mSav>0?"#22c55e":"#ef4444"},
          {l:"Savings Rate",v:savRate.toFixed(1)+"%",c:savRate>=20?"#22c55e":"#eab308"},
          {l:"Investable Savings",v:fmt(nEx),c:"#60a5fa"}
        ])
        .concat(nRentalEq>0?[{l:"🏘️ Rental Property Equity",v:fmt(nRentalEq),c:"#93c5fd"},{l:"Total Assets",v:fmt(totalNetWorth),c:"#60a5fa"}]:[])
        .concat([
          {l:"Total Debt",v:noDebts?"$0":fmt(totalDebtAll),c:noDebts?"#22c55e":"#f87171"},
          {l:"Health Score",v:hScore.s+"/100",c:hScore.s>=70?"#22c55e":hScore.s>=40?"#eab308":"#ef4444"}
        ]).concat(magic.real>0?[{l:"Magic Number",v:fmt(magic.real),c:"#60a5fa"},{l:"Progress",v:mD.p.toFixed(1)+"%",c:mD.gc}]:[]).map(function(r){return(
          <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"rgba(0,0,0,0.1)"}}>
            <span style={{fontSize:12,color:"#94a3b8"}}>{r.l}</span>
            <span style={{fontSize:13,fontWeight:700,color:r.c}}>{r.v}</span>
          </div>)})}
      </div>
      {nRentalEq>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:12,color:"#93c5fd",lineHeight:1.6,marginBottom:16}}>
        📐 <strong>Rental property equity ({fmt(nRentalEq)})</strong> is not included in Magic Number calculations — it{"'s"} illiquid real estate.
        {nAge>0&&nRetAge>0&&nYP>0?" Since you plan to live until age "+(nRetAge+nYP)+", the estimated future value of your property equity (growing with inflation at "+customInflation.toFixed(1)+"%) would be ~"+fmt(Math.round(nRentalEq*Math.pow(1+INFL,nRetAge+nYP-nAge)))+". This could serve as inheritance or be sold if needed.":""}
      </div>}
      <button onClick={function(){window.print()}} style={{width:"100%",background:"linear-gradient(135deg,#3b82f6,#2563eb)",color:"#fff",border:"none",padding:"14px 24px",borderRadius:14,fontSize:14,fontWeight:700,fontFamily:"Outfit,sans-serif",cursor:"pointer",boxShadow:"0 4px 20px rgba(59,130,246,0.25)"}}>
        🖨️ Print / Save as PDF
      </button>
    </>:<div style={{textAlign:"center",padding:20,color:"#64748b"}}><p>Complete your profile first.</p></div>}
  </Cd>

  <NavButtons tab={tab} goTab={goTab}/>
</div>}

        <div style={{marginTop:36,padding:"14px 18px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)",fontSize:11,color:"#93c5fd",lineHeight:1.7,textAlign:"center"}}>
          <strong>Important:</strong> This tool is for educational purposes only and does not constitute financial advice. Past performance and historical averages are no guarantee of future returns. All projections are estimates based on assumptions that may not reflect actual market conditions. Inflation assumption: {(INFL*100).toFixed(1)}%/yr.
          <div style={{marginTop:8}}><a href="#" onClick={function(e){e.preventDefault()}} style={{color:"#60a5fa",fontWeight:600,textDecoration:"underline"}}>Talk to a Financial Advisor →</a> for personalized guidance tailored to your situation.</div>
        </div>
      </div>
    </div>
  </>);
}
