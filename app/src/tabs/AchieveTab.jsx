import React, { useMemo, useRef } from 'react';
import Card from '../components/Card.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import NumberInput from '../components/NumberInput.jsx';
import Slider from '../components/Slider.jsx';
import TabButton from '../components/TabButton.jsx';
import MultiLineChart from '../components/MultiLineChart.jsx';
import AdvisorCTA from '../components/AdvisorCTA.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import { fmt, fmtC, pct } from '../utils/formatters.js';
import { fvVariable } from '../utils/financial.js';
import { track, EVENTS } from '../utils/analytics.js';
import useAppStore from '../store/useAppStore.js';
import { useTranslation } from '../i18n/index.jsx';

export default function AchieveTab({ tab, goTab, tier, engine, isDemo }) {
  const { t, lang } = useTranslation();
  const store = useAppStore();
  const sf = store.setField;
  
  const setAge = function(v) { sf('age', v); };
  const setRetirementAge = function(v) { sf('retirementAge', v); };
  const setYearsPostRet = function(v) { sf('yearsPostRet', v); };
  const setDesiredIncome = function(v) { sf('desiredIncome', v); };
  const setSocialSecurity = function(v) { sf('socialSecurity', v); };
  const setExistingSavings = function(v) { sf('existingSavings', v); };
  const setManualMonthlySav = function(v) { sf('manualMonthlySav', v); };
  const setLegacy = function(v) { sf('legacy', v); };
  const setAssetTax = function(v) { sf('assetTax', v); };
  
  const simCount = useRef(0);
  const setSimSav = function(v) { sf('simSav', v); simCount.current++; track(EVENTS.SIMULATOR_INTERACTION,{lever:'initial_savings',count:simCount.current},{lang:lang,tier:tier}); };
  const setSimMo = function(v) { sf('simMo', v); simCount.current++; track(EVENTS.SIMULATOR_INTERACTION,{lever:'monthly_savings',count:simCount.current},{lang:lang,tier:tier}); };
  const setSimRet = function(v) { sf('simRet', v); simCount.current++; track(EVENTS.SIMULATOR_INTERACTION,{lever:'return_rate',count:simCount.current},{lang:lang,tier:tier}); };
  const setUserEmail = function(v) { sf('userEmail', v); };
  const setEmailError = function(v) { sf('emailError', v); };
  const setTier = function(v) { sf('tier', v); };
  const setShowLeadModal = function(v) { sf('showLeadModal', v); };
  const setChartProfileIdx = function(v) { sf('chartProfileIdx', v); };
  const setChartRetireIdx = function(v) { sf('chartRetireIdx', v); };
  const setRevRetProf = function(v) { sf('revRetProf', v); };
  
  const setRevDes = function(v) { sf('revDes', v); };
  const setRevYrs = function(v) { sf('revYrs', v); };
  const setRevSS = function(v) { sf('revSS', v); };
  const setRevSav = function(v) { sf('revSav', v); };
  const setRevMo = function(v) { sf('revMo', v); };
  const setRevRet = function(v) { sf('revRet', v); };

  const {
    age, retirementAge, yearsPostRet, desiredIncome, socialSecurity, existingSavings,
    manualMonthlySav, legacy, assetTax, simSav, simMo, simRet, userEmail, emailError,
    chartProfileIdx, chartRetireIdx, revDes, revYrs, revSS, revSav, revMo, revRet, revRetProf
  } = store;

  const {
    nAge, nRetAge, nYP, nDes, nEx, nSSRaw, nSS, nLegacy, ytr, mSav, mSavComputed, hasIncomeData,
    magic, desiredAfterSS, simEffSav, simEffMo, simEffRet, simProjected, simGap, simPct,
    simNeededReturn, simNeededMonthly, adjProfiles, debtEvents, allProfiles, hasPortfolio,
    chartAccumReturn, chartRetireReturn, ybYData, revResult, TAX, INFL, retProfLabel
  } = engine;

  const q = "'";
  const Cd = Card;
  const ST = SectionTitle;
  const NI = NumberInput;
  const TabBtn = TabButton;

  return (
    <div className="fi">
      <Cd style={{textAlign:"center",padding:"24px 20px"}}>
        <div style={{fontSize:36,marginBottom:10}}><Icon name="crosshair" size={36} weight="regular" color="#60a5fa" /></div>
        <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:"#0f172a",marginBottom:8}}>{t('achieve.title')}</h2>
        <p style={{color:"#64748b",fontSize:13,lineHeight:1.7,maxWidth:440,margin:"0 auto"}}>
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
        <NI label={t('achieve.currentSavings')} value={existingSavings} onChange={setExistingSavings} tip={t('achieve.currentSavingsTip')}/>
        <NI label={t('achieve.estMonthlySav')} value={manualMonthlySav} onChange={setManualMonthlySav} tip={t('achieve.estMonthlySavTip')}/>
        {hasIncomeData&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#16a34a",marginBottom:12}}><Icon name="check-circle" size={12} weight="regular" /> {t('achieve.actualSavFromIncome')}: <strong>{fmt(mSavComputed)}{t('app.perMonth')}</strong> — {t('achieve.overridesEstimate')}.</div>}
        <NI label={t('achieve.legacy')} value={legacy} onChange={setLegacy} tip={t('achieve.legacyTip')}/>
        <div style={{marginTop:8,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{t('achieve.annualAssetTax')}</span>
            <span style={{fontSize:15,fontWeight:700,color:assetTax>0?"#f59e0b":"#64748b"}}>{Number(assetTax).toFixed(1)}%</span>
          </div>
          <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>{t('achieve.assetTaxTip')}</div>
          <Slider label="" value={assetTax} onChange={setAssetTax} min={0} max={3} step={0.1} format={function(v){return Number(v).toFixed(1)+"%"}} color="#f59e0b"/>
          {assetTax>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:11,color:"#92400e",marginTop:4}}>
            <Icon name="warning" size={12} weight="regular" /> {t('achieve.assetTaxExplain',{tax:Number(assetTax).toFixed(1)})}
          </div>}
        </div>

      </Cd>
      {magic.real>0&&ytr>0&&nEx>=0&&(mSav>0||nEx>0)?<>
        {/* FREE TIER: Range (asymmetric 0.75×–1.30× + $50K rounding) + Email CTA */}
        {tier==="free"&&!isDemo&&<>
        <Cd glow="blue" style={{textAlign:"center",padding:"40px 24px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#60a5fa",textTransform:"uppercase",letterSpacing:3,marginBottom:10}}>{t('achieve.yourMN')}</div>
            <div style={{fontFamily:"Outfit,sans-serif",fontSize:16,fontWeight:600,color:"#64748b",marginBottom:8}}>{lang==="en"?"Your Magic Number is between":"Tu Magic Number está entre"}</div>
            <div style={{fontFamily:"Outfit,sans-serif",fontSize:36,fontWeight:900,color:"#60a5fa",lineHeight:1.2,marginBottom:4}}>{fmt(Math.round(magic.real*0.85/25000)*25000)}</div>
            <div style={{fontSize:16,fontWeight:700,color:"#64748b",margin:"4px 0"}}>{lang==="en"?"and":"y"}</div>
            <div style={{fontFamily:"Outfit,sans-serif",fontSize:36,fontWeight:900,color:"#60a5fa",lineHeight:1.2,marginBottom:12}}>{fmt(Math.round(magic.real*1.15/25000)*25000)}</div>
            <div style={{padding:"10px 16px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.10)",fontSize:13,color:"#334155",lineHeight:1.6}}>
              {lang==="en"?"Accumulating this capital by age "+nRetAge+", you secure "+fmt(nDes)+"/mo for "+nYP+" years of retirement.":"Juntando este capital a tus "+nRetAge+" años, te asegurás "+fmt(nDes)+" extra por mes durante "+nYP+" años."}
            </div>
          </div>
        </Cd>
        {/* Year-by-Year Chart (Free tier - accumulation only, no drawdown) */}
        {ybYData.length>0&&<Cd>
          <ST>{lang==="en"?"Your Savings Growth":"Crecimiento de tus Ahorros"}</ST>
          <div style={{marginBottom:12}}>
            <MultiLineChart series={[{data:ybYData.filter(function(d){return d.year<=ytr}).map(function(d){
              var ageNow=nAge||30;var ageAtYear=ageNow+d.year;
              var step=ytr>30?10:ytr>15?5:ytr>8?2:1;
              var isFirst=d.year===0;var isRetire=d.year===ytr;
              var isTick=d.year%step===0&&d.year>0&&d.year<ytr;
              var tooCloseToRetire=Math.abs(d.year-ytr)<(step/2)&&!isRetire;
              var show=isFirst||isRetire||(isTick&&!tooCloseToRetire);
              return{l:show?(isFirst?t('app.age')+" "+ageAtYear:isRetire?t('app.at')+" "+ageAtYear:""+ageAtYear):"",v:d.balance}
            }),color:"#34d399",bold:true,fill:true}]} height={160} showYAxis={true}/>
          </div>
          {(function(){
            var retBal=ybYData[ytr]?ybYData[ytr].balance:0;
            return(<div style={{textAlign:"center",marginTop:6}}>
              <div style={{padding:"6px 14px",borderRadius:8,background:"rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",display:"inline-block"}}>{lang==="en"?"At retirement (age "+nRetAge+"): ":"Al jubilarte (edad "+nRetAge+"): "}<strong>{fmtC(retBal)}</strong></div>
            </div>)})()}
          <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",textAlign:"center",marginTop:10,lineHeight:1.5}}>
            <Icon name="lock" size={11} weight="regular" /> {lang==="en"?"Unlock to customize investment profiles and see retirement drawdown projections":"Desbloqueá para personalizar perfiles de inversión y ver proyecciones de retiro"}
          </div>
        </Cd>}
        <Cd glow="gold" style={{textAlign:"center",padding:"32px 24px"}}>
          <div style={{fontSize:28,marginBottom:10}}><Icon name="lock-open" size={28} weight="regular" color="#eab308" /></div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:20,fontWeight:800,color:"#0f172a",marginBottom:4}}>{lang==="en"?"Want your exact Magic Number?":"¿Querés conocer tu Magic Number exacto?"}</div>
          {/* Path A: email for free */}
          <div style={{marginTop:16,padding:"18px 20px",borderRadius:14,background:"rgba(96,165,250,0.05)",border:"1px solid rgba(96,165,250,0.15)"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#3b82f6",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{lang==="en"?"✨ Free — just your email":"✨ Gratis — solo tu email"}</div>
            <p style={{fontSize:13,color:"#475569",lineHeight:1.5,marginBottom:12,margin:"0 0 12px"}}>{lang==="en"?"Get your exact Magic Number + interactive scenario simulator to test different savings and return strategies.":"Conocé tu Magic Number exacto + simulador interactivo de escenarios para probar distintas estrategias de ahorro y retorno."}</p>
            <div style={{display:"flex",gap:8,maxWidth:400,margin:"0 auto"}}>
              <input type="email" value={userEmail} onChange={function(e){setUserEmail(e.target.value);setEmailError("")}} placeholder={lang==="en"?"your@email.com":"tu@email.com"} style={{flex:1,padding:"12px 14px",borderRadius:10,border:"1px solid "+(emailError?"#ef4444":"rgba(96,165,250,0.25)"),background:"#fff",fontSize:13,fontFamily:"Inter,sans-serif",outline:"none"}}/>
              <button onClick={function(){var re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;if(!re.test(userEmail)){setEmailError(lang==="en"?"Enter a valid email":"Ingresá un email válido");return;}setTier("email");setEmailError("");window.scrollTo({top:0,behavior:"smooth"});}} className="bp" style={{padding:"12px 20px",fontSize:13,fontWeight:700,whiteSpace:"nowrap"}}>{lang==="en"?"Reveal →":"Revelar →"}</button>
            </div>
            {emailError&&<div style={{color:"#ef4444",fontSize:12,marginTop:6}}>{emailError}</div>}
            <div style={{fontSize:10,color:"#94a3b8",marginTop:8}}><Icon name="lock" size={10} weight="regular" /> {lang==="en"?"No spam, ever.":"Sin spam, nunca."}</div>
          </div>
          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
            <div style={{flex:1,height:1,background:"rgba(0,0,0,0.08)"}}/>
            <span style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>{lang==="en"?"or":"o"}</span>
            <div style={{flex:1,height:1,background:"rgba(0,0,0,0.08)"}}/>
          </div>
          {/* Path B: pay directly */}
          <div style={{padding:"16px 20px",borderRadius:14,background:"rgba(234,179,8,0.05)",border:"1px solid rgba(234,179,8,0.2)"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#a16207",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{lang==="en"?"⚡ Full access — $14.99":"⚡ Acceso completo — $14.99"}</div>
            <p style={{fontSize:13,color:"#475569",lineHeight:1.5,marginBottom:12,margin:"0 0 12px"}}>{lang==="en"?"Unlock all 16 modules instantly. No email required.":"Desbloqueá los 16 módulos al instante. Sin email necesario."}</p>
            <button className="bp" style={{padding:"12px 24px",fontSize:13,fontWeight:700,background:"linear-gradient(135deg,#a16207,#ca8a04)"}} onClick={function(){alert(lang==="en"?"Stripe coming soon! Price: $14.99":"¡Stripe próximamente! Precio: $14.99");}}>{lang==="en"?"Unlock Full Profile →":"Desbloquear Perfil Full →"}</button>
          </div>
        </Cd>
        <AdvisorCTA onContact={function(){setShowLeadModal(true);track(EVENTS.ADVISOR_CTA_CLICKED,{source_tab:tab},{lang:lang,tier:tier})}}/>
        </>}
        {/* EMAIL/PAID TIER: Exact number + full analysis */}
        {tier!=="free"&&<>
        <Cd glow="blue" style={{textAlign:"center",padding:"40px 24px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/><div style={{position:"relative"}}><div style={{fontSize:12,fontWeight:600,color:"#60a5fa",textTransform:"uppercase",letterSpacing:3,marginBottom:10}}>{t('achieve.yourMN')}</div><div style={{fontFamily:"Outfit,sans-serif",fontSize:50,fontWeight:900,color:"#60a5fa",lineHeight:1.1,marginBottom:12,textShadow:"0 0 40px rgba(96,165,250,0.3),0 0 80px rgba(96,165,250,0.15)"}}>{fmt(Math.round(magic.real))}</div><div style={{padding:"10px 16px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.10)",fontSize:13,color:"#334155",lineHeight:1.6}}>{lang==="en"?"Accumulating this capital by age "+nRetAge+", you secure "+fmt(nDes)+"/mo for "+nYP+" years of retirement.":"Juntando este capital a tus "+nRetAge+" años, te asegurás "+fmt(nDes)+" extra por mes durante "+nYP+" años."}</div></div></Cd>
        {/* ── Two-Column Summary: Projected Savings + Years of Coverage ── */}
        <Cd style={{padding:"20px"}}>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {/* Column 1: Projected Savings */}
            <div style={{flex:"1 1 250px",textAlign:"center",padding:"20px 16px",borderRadius:14,background:simProjected>=magic.real?"rgba(34,197,94,0.04)":"rgba(239,68,68,0.04)",border:"1px solid "+(simProjected>=magic.real?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)")}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:simProjected>=magic.real?"#22c55e":"#ef4444",marginBottom:8,fontWeight:700}}>{t('achieve.projectedSavings')}</div>
              <div style={{fontFamily:"Outfit,sans-serif",fontSize:32,fontWeight:900,color:simProjected>=magic.real?"#22c55e":"#f87171",lineHeight:1.1}}>{fmtC(simProjected)}</div>
              <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{t('retirement.atRetAge', {age: nRetAge})}</div>
              <div style={{marginTop:14,padding:"0 8px"}}>
                <div style={{height:8,borderRadius:4,background:"rgba(0,0,0,0.04)",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:4,width:Math.min(simPct,100)+"%",background:simPct>=100?"linear-gradient(90deg,#22c55e,#4ade80)":simPct>=60?"linear-gradient(90deg,#eab308,#facc15)":"linear-gradient(90deg,#ef4444,#f87171)",transition:"width 0.5s ease"}}/>
                </div>
                <div style={{fontSize:11,fontWeight:700,marginTop:6,color:simPct>=100?"#22c55e":simPct>=60?"#eab308":"#ef4444"}}>{simPct.toFixed(0)}% {lang==="en"?"of":"de"} {fmtC(magic.real)}</div>
              </div>
            </div>
            {/* Column 2: Years of Coverage */}
            <div style={{flex:"1 1 250px",textAlign:"center",padding:"20px 16px",borderRadius:14,background:revResult&&revResult.sufficient?"rgba(34,197,94,0.04)":"rgba(239,68,68,0.04)",border:"1px solid "+(revResult&&revResult.sufficient?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)")}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:revResult&&revResult.sufficient?"#22c55e":"#ef4444",marginBottom:8,fontWeight:700}}>{t('achieve.yearsOfCoverage')}</div>
              {revResult?<>
                <div style={{fontFamily:"Outfit,sans-serif",fontSize:32,fontWeight:900,color:revResult.sufficient?"#22c55e":"#f87171",lineHeight:1.1}}>{Math.floor(revResult.yearsOfCoverage)>=60?"60+":Math.floor(revResult.yearsOfCoverage)} {t('app.years')}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{lang==="en"?"until age":"hasta los"} {revResult.untilAge>=160?"∞":revResult.untilAge}</div>
                <div style={{marginTop:12}}>{revResult.sufficient
                  ?<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:8,background:"rgba(34,197,94,0.08)",fontSize:11,color:"#22c55e",fontWeight:700}}><Icon name="check-circle" size={13} weight="regular" /> {t('common.covered')}</span>
                  :<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:8,background:"rgba(239,68,68,0.08)",fontSize:11,color:"#ef4444",fontWeight:700}}><Icon name="warning" size={13} weight="regular" /> {t('achieve.short')}</span>
                }</div>
              </>:<div style={{fontSize:13,color:"#94a3b8",marginTop:16}}>—</div>}
            </div>
          </div>
        </Cd>
        <Cd><ST sub={t('achieve.threeLeversSub')}>{t('achieve.threeLevers')}</ST>
          <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="currency-dollar" size={14} weight="regular" /> {t('achieve.startingSavings')}</span><span style={{fontSize:15,fontWeight:700,color:"#60a5fa"}}>{fmt(simEffSav)}</span></div><Slider label="" value={simSav!=null?simSav:nEx} onChange={function(v){setSimSav(v)}} min={0} max={Math.max(nEx*10,2000000)} step={10000} format={function(v){return fmtC(v)}} color="#60a5fa"/>{simSav!=null&&simSav!==nEx&&<div style={{fontSize:10,color:"#3b82f6",marginTop:-4}}>{t('achieve.actual')}: {fmt(nEx)} · {t('achieve.simulating')}: {fmt(simSav)}</div>}</div>
          <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="calendar" size={14} weight="regular" /> {t('achieve.monthlySavings')}</span><span style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>{fmt(simEffMo)}{t('app.perMonth')}</span></div><Slider label="" value={simMo!=null?simMo:Math.max(mSav,0)} onChange={function(v){setSimMo(v)}} min={0} max={Math.max(mSav*10,50000)} step={100} format={function(v){return fmt(v)}} color="#22c55e"/>{simMo!=null&&simMo!==Math.max(mSav,0)&&<div style={{fontSize:10,color:"#16a34a",marginTop:-4}}>{t('achieve.actual')}: {fmt(Math.max(mSav,0))}{t('app.perMonth')} · {t('achieve.simulating')}: {fmt(simMo)}{t('app.perMonth')}</div>}</div>
          <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="chart-line-up" size={14} weight="regular" /> {t('achieve.annualRealReturn')}</span><span style={{fontSize:15,fontWeight:700,color:"#f59e0b"}}>{(simEffRet*100).toFixed(1)}%</span></div><Slider label="" value={simRet!=null?simRet:(simEffRet*100)} onChange={function(v){setSimRet(v)}} min={-3} max={12} step={0.1} format={function(v){return Number(v).toFixed(1)+"%"}} color="#f59e0b"/><div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>{adjProfiles.filter(function(_,i){return i>=1}).map(function(p){return <TabBtn key={p.id} active={Math.abs(simEffRet-p.realReturn)<0.001} iconName={p.icon} label={p.name+" "+pct(p.realReturn)} onClick={function(){setSimRet(p.realReturn*100)}} color={p.color}/>})}</div>{(function(){var matched=adjProfiles.find(function(p){return Math.abs(simEffRet-p.realReturn)<0.001});return matched?<div style={{fontSize:10,color:matched.color||"#3b82f6",marginTop:4}}>{lang==="en"?"Using":"Usando"} {matched.name} {pct(matched.realReturn)} {lang==="en"?"real":"real"}</div>:<div style={{fontSize:10,color:"#f59e0b",marginTop:4}}><Icon name="gear" size={10} weight="regular" /> {lang==="en"?"Custom rate":"Retorno personalizado"}: {(simEffRet*100).toFixed(1)}% {lang==="en"?"real":"real"}</div>})()}</div>
          {simSav!=null||simMo!=null||simRet!=null?<div style={{textAlign:"center",marginBottom:12}}><button onClick={function(){setSimSav(null);setSimMo(null);setSimRet(null)}} style={{background:"rgba(15,23,42,0.06)",color:"#64748b",border:"1px solid rgba(255,255,255,0.08)",padding:"8px 20px",borderRadius:10,fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer"}}>↩ {t('achieve.resetToActual')}</button></div>:null}
        </Cd>
        <Cd glow={simProjected>=magic.real?"green":"red"} style={{textAlign:"center",padding:"28px 24px"}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:simProjected>=magic.real?"#22c55e":"#ef4444",marginBottom:6}}>{t('achieve.projectedAt', {age: nRetAge})}</div><div style={{fontFamily:"Outfit,sans-serif",fontSize:40,fontWeight:900,color:simProjected>=magic.real?"#22c55e":"#f87171"}}>{fmtC(simProjected)}</div><div style={{marginTop:16,padding:14,borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)"}}><div style={{height:10,borderRadius:5,background:"rgba(0,0,0,0.04)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:5,width:Math.min(simPct,100)+"%",background:simPct>=100?"linear-gradient(90deg,#22c55e,#4ade80)":simPct>=60?"linear-gradient(90deg,#eab308,#facc15)":"linear-gradient(90deg,#ef4444,#f87171)",transition:"width 0.5s"}}/></div><div style={{fontSize:13,fontWeight:700,marginTop:6,color:simPct>=100?"#22c55e":simPct>=60?"#eab308":"#ef4444"}}>{lang==="en"?"You're at "+simPct.toFixed(1)+"% of your goal. Adjust the levers above to reach "+fmtC(magic.real)+".":"Estás al "+simPct.toFixed(1)+"% de tu meta. Ajustá tus números arriba para llegar a "+fmtC(magic.real)+"."}</div></div></Cd>
        {simGap>0&&<Cd><ST sub={t('achieve.gapSub')}>{t('achieve.howToCloseGap')}</ST><div style={{display:"grid",gap:12}}>{simNeededReturn!=null?<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(245,158,11,0.04)",border:"1px solid rgba(245,158,11,0.1)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:600,color:"#92400e"}}>A. {t('achieve.higherReturn')}</span><span style={{fontSize:16,fontWeight:800,color:"#f59e0b"}}>{(simNeededReturn*100).toFixed(1)}%</span></div><div style={{fontSize:12,color:"#64748b"}}>{t('achieve.higherReturnExplain', {rate: (simNeededReturn*100).toFixed(1)})}{(function(){var m=adjProfiles.find(function(p){return Math.abs(p.realReturn-simNeededReturn)<0.008});return m?" ≈ "+m.icon+" "+m.name:""})()}</div></div>:<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.1)"}}><div style={{fontSize:13,fontWeight:600,color:"#ef4444"}}>A. {t('achieve.returnAloneWontWork')}</div></div>}{simNeededMonthly!=null&&<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.1)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:600,color:"#16a34a"}}>B. {t('achieve.saveMore')}</span><span style={{fontSize:16,fontWeight:800,color:"#22c55e"}}>{fmt(simNeededMonthly)}{t('app.perMonth')}</span></div><div style={{fontSize:12,color:"#64748b"}}>{t('achieve.atSimEffRet', {rate: (simEffRet*100).toFixed(1)})}{simNeededMonthly>simEffMo?" — "+t('achieve.morePerMonth', {amt: fmt(simNeededMonthly-simEffMo)}):""}</div></div>}{simNeededMonthly!=null&&<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)"}}><div style={{fontSize:13,fontWeight:600,color:"#3b82f6",marginBottom:6}}>C. {t('achieve.combineBoth')}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>{(function(){var maxPR=adjProfiles[adjProfiles.length-1].realReturn;var baseR=simNeededReturn!=null?simNeededReturn:maxPR;var midR=simEffRet+(baseR-simEffRet)*0.5;if(midR<=simEffRet)midR=simEffRet+(maxPR-simEffRet)*0.5;var lo=0,hi=50000;for(var i=0;i<30;i++){var mid=(lo+hi)/2;if(fvVariable(simEffSav,mid,midR,ytr,debtEvents)<magic.real)lo=mid;else hi=mid}return[{l:t('achieve.higherReturn'),v:(midR*100).toFixed(1)+"%",c:"#f59e0b"},{l:t('achieve.saveMore'),v:fmt((lo+hi)/2)+t('app.perMonth'),c:"#22c55e"}].map(function(s){return <div key={s.l} style={{padding:"10px 12px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",textAlign:"center"}}><div style={{fontSize:10,color:"#64748b"}}>{s.l}</div><div style={{fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div></div>})})()}</div></div>}</div></Cd>}
        {simGap<=0&&<Cd glow="green" style={{padding:"20px 24px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:"#22c55e",marginBottom:8}}><Icon name="confetti" size={16} weight="regular" /> {t('achieve.onTrack')}</div><div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>{t('achieve.surpassMN', {amt: fmtC(simProjected-magic.real)})}</div></Cd>}
        <AdvisorCTA msg={simGap>0?t('advisor.helpClosingGap'):t('advisor.protectPlan')} onContact={function(){setShowLeadModal(true);track(EVENTS.ADVISOR_CTA_CLICKED,{source_tab:tab},{lang:lang,tier:tier})}}/>
        {/* Year-by-Year Projection (full, with profile selectors) */}
        {ybYData.length>0&&<Cd>
          <ST tip={t('retirement.ybyTip')}>{t('retirement.ybyProjection')}</ST>
          {(simSav!=null||simMo!=null||simRet!=null)&&<div style={{padding:"8px 12px",borderRadius:8,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:11,color:"#92400e",marginBottom:14,display:"flex",alignItems:"flex-start",gap:6}}><Icon name="info" size={14} weight="regular" style={{marginTop:1}} /> {lang==="en"?"This chart uses your actual numbers and selected investment profiles below, NOT the lever simulation values above.":"Este gráfico usa tus números reales y los perfiles de inversión seleccionados abajo, NO los valores de tu simulación con las palancas."}</div>}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:"#64748b",marginBottom:6}}><Icon name="chart-line-up" size={13} weight="regular" /> {t('retirement.accumulation')}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
              {hasPortfolio&&<TabBtn active={chartProfileIdx===-1} label={t('profiles.myPortfolio.name')} onClick={function(){setChartProfileIdx(-1)}} color="#e879f9"/>}
              {allProfiles.map(function(p,i){return <TabBtn key={p.id} active={chartProfileIdx===i} iconName={p.icon} label={p.name} onClick={function(){setChartProfileIdx(i)}} color={p.color}/>})}
            </div>
            <div style={{fontSize:11,color:chartProfileIdx===-1?"#e879f9":"#3b82f6",marginBottom:12}}>
              {chartProfileIdx===-1&&hasPortfolio?t('retirement.usingPortfolio', {rate: pct(chartAccumReturn)}):t('retirement.usingProfile', {name: (chartProfileIdx>=0?(chartProfileIdx<adjProfiles.length?adjProfiles[chartProfileIdx]:allProfiles[chartProfileIdx]).name:"60/40"), rate: pct(chartAccumReturn)})}
            </div>
            <div style={{fontSize:12,fontWeight:600,color:"#64748b",marginBottom:6}}><Icon name="umbrella" size={13} weight="regular" /> {t('retirement.retirementPhase')}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
              {hasPortfolio&&<TabBtn active={chartRetireIdx===-1} label={t('profiles.myPortfolio.name')} onClick={function(){setChartRetireIdx(-1)}} color="#e879f9"/>}
              {adjProfiles.map(function(p,i){return <TabBtn key={p.id} active={chartRetireIdx===i} iconName={p.icon} label={p.name} onClick={function(){setChartRetireIdx(i)}} color={p.color}/>})}
            </div>
            <div style={{fontSize:11,color:chartRetireIdx===-1?"#e879f9":"#3b82f6"}}>
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
              var tooCloseToLast=Math.abs(d.year-totalYrs)<(step/2)&&!isLast; const show=(isFirst||isRetire||isLast||(isTick&&!tooCloseToRetire&&!tooCloseToLast));
              return{l:show?(isFirst?t('app.age')+" "+ageAtYear:isRetire?t('app.at')+" "+ageAtYear:isLast?t('app.age')+" "+ageAtYear:""+ageAtYear):"",v:d.balance}
            }),color:chartProfileIdx===-1?"#e879f9":(chartProfileIdx>=0&&chartProfileIdx<allProfiles.length?allProfiles[chartProfileIdx].color:"#22c55e"),bold:true,fill:true}]} height={160} showYAxis={true}/>
          </div>
          {(function(){
            var retBal=ybYData[ytr]?ybYData[ytr].balance:0;
            var peakV=0,peakY=0;ybYData.forEach(function(d){if(d.balance>peakV){peakV=d.balance;peakY=d.year}});
            var depleteY=null;for(var i=ytr+1;i<ybYData.length;i++){if(ybYData[i].balance<=0){depleteY=i;break}}
            var lastBal=(ybYData[ybYData.length-1]||{}).balance||0;
            return(<div style={{display:"grid",gap:6,marginTop:8}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
                <div style={{padding:"6px 12px",borderRadius:8,background:"rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6"}}>{t('retirement.atRetirement', {age: nAge+ytr})} <strong>{fmtC(retBal)}</strong></div>
                {peakY!==ytr&&<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(167,139,250,0.08)",fontSize:11,color:"#c4b5fd"}}>{t('retirement.peak')} <strong>{fmtC(peakV)}</strong> at age {nAge+peakY}</div>}
              </div>
              <div style={{textAlign:"center"}}>
                {depleteY?<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(239,68,68,0.08)",fontSize:11,color:"#ef4444",display:"inline-block"}}><Icon name="warning" size={12} weight="regular" /> {t('retirement.moneyRunsOut', {age: nAge+depleteY, n: depleteY-ytr})}</div>
                :<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(34,197,94,0.08)",fontSize:11,color:"#16a34a",display:"inline-block"}}><Icon name="check-circle" size={12} weight="regular" /> {t('retirement.moneyLasts', {amt: fmtC(lastBal), age: nAge+ytr+nYP})}</div>}
              </div>
            </div>)})()}
          {debtEvents.length>0&&<div style={{display:"grid",gap:6,marginTop:12}}>
            {debtEvents.filter(function(ev){return ev.endsAtYear<ytr}).map(function(ev,i){return(
              <div key={i} style={{padding:"8px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#16a34a",display:"flex",justifyContent:"space-between"}}>
                <span><Icon name="chart-line-up" size={12} weight="regular" /> {t('retirement.paidOffAt', {name: ev.name, age: nAge+ev.endsAtYear})}</span>
                <span style={{fontWeight:600}}>{t('retirement.savingsBoost', {amt: fmt(ev.monthlyAmount)})}</span>
              </div>)})}
          </div>}
        </Cd>}
        {tier==="email"&&<Cd glow="gold" style={{textAlign:"center",padding:"24px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#a16207",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{lang==="en"?"Enjoying the full picture?":"¿Te gusta lo que ves?"}</div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:16,fontWeight:800,color:"#0f172a",marginBottom:8}}>{lang==="en"?"Upgrade to Full Profile — $14.99":"Pasate al Perfil Full — $14.99"}</div>
          <p style={{fontSize:12,color:"#64748b",lineHeight:1.5,marginBottom:14}}>{lang==="en"?"All 16 modules, year-by-year projections, debt analysis, goals simulator and premium PDF report.":"16 módulos completos, proyecciones año por año, análisis de deudas, simulador de metas e informe PDF premium."}</p>
          <button className="bp" style={{padding:"12px 28px",fontSize:14,fontWeight:700}} onClick={function(){alert(lang==="en"?"Stripe coming soon! Price: $14.99":"¡Stripe próximamente! Precio: $14.99");}}>{lang==="en"?"Unlock Full Profile →":"Desbloquear Perfil Full →"}</button>
        </Cd>}
        </>}
      </>:<Cd style={{textAlign:"center",padding:"24px 20px"}}><div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>{t('achieve.fillFields')}</div></Cd>}

      {/* === REVERSE CALCULATOR (Redesigned per minuta cruda v2) === */}
      {nAge>0&&<>
      <Cd glow={revResult&&revResult.sufficient?"green":"red"} style={{marginTop:24,borderTop:"2px solid rgba(96,165,250,0.15)",paddingTop:28}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:28,marginBottom:8}}><Icon name="calendar" size={28} weight="regular" color="#60a5fa" /></div>
          <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:20,fontWeight:700,color:"#0f172a",marginBottom:6}}>{lang==="en"?<>How Many Years Will Your <strong>Projected Savings</strong> Last?</>:<>¿Para Cuántos Años Te Alcanza tu <strong>Ahorro Proyectado</strong>?</>}</h2>
        </div>
        {/* Two-column summary: Projected Savings (left) + Years of Coverage (right) */}
        <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:20}}>
          <div style={{flex:"1 1 200px",textAlign:"center",padding:"20px 16px",borderRadius:14,background:revResult&&revResult.sufficient?"rgba(34,197,94,0.04)":"rgba(239,68,68,0.04)",border:"1px solid "+(revResult&&revResult.sufficient?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)")}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:revResult&&revResult.sufficient?"#22c55e":"#ef4444",marginBottom:8,fontWeight:700}}>{t('achieve.projectedSavings')}</div>
            <div style={{fontFamily:"Outfit,sans-serif",fontSize:32,fontWeight:900,color:revResult&&revResult.sufficient?"#22c55e":"#f87171",lineHeight:1.1}}>{fmtC(revResult?revResult.projected:simProjected)}</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{t('achieve.atRetAge', {age: nRetAge})}</div>
          </div>
          <div style={{flex:"1 1 200px",textAlign:"center",padding:"20px 16px",borderRadius:14,background:revResult&&revResult.sufficient?"rgba(34,197,94,0.04)":"rgba(239,68,68,0.04)",border:"1px solid "+(revResult&&revResult.sufficient?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)")}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:revResult&&revResult.sufficient?"#22c55e":"#ef4444",marginBottom:8,fontWeight:700}}>{t('achieve.yearsOfCoverage')}</div>
            <div style={{fontFamily:"Outfit,sans-serif",fontSize:32,fontWeight:900,color:revResult&&revResult.sufficient?"#22c55e":"#f87171",lineHeight:1.1}}>{revResult?<>{Math.floor(revResult.yearsOfCoverage)>=60?"60+":Math.floor(revResult.yearsOfCoverage)} {t('app.years')}</>:"—"}</div>
            {revResult&&<div style={{fontSize:11,color:"#64748b",marginTop:4}}>{lang==="en"?"until age":"hasta los"} {revResult.untilAge>=160?"∞":revResult.untilAge}</div>}
            {revResult&&<div style={{marginTop:10}}>{revResult.sufficient
              ?<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:8,background:"rgba(34,197,94,0.08)",fontSize:11,color:"#22c55e",fontWeight:700}}><Icon name="check-circle" size={13} weight="regular" /> {t('achieve.goalReached')}</span>
              :<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:8,background:"rgba(239,68,68,0.08)",fontSize:11,color:"#ef4444",fontWeight:700}}><Icon name="warning" size={13} weight="regular" /> {t('achieve.cannotRetireBy100')}</span>
            }</div>}
          </div>
        </div>
        {/* Slider 1: Desired monthly income in retirement */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="currency-dollar" size={14} weight="regular" /> {t('achieve.desiredIncome')}</span>
            <span style={{fontSize:15,fontWeight:700,color:"#60a5fa"}}>{fmt(revDes!==""?Number(revDes):nDes)}{t('app.perMonth')}</span>
          </div>
          <Slider label="" value={revDes!==""?Number(revDes):nDes} onChange={function(v){setRevDes(String(v))}} min={0} max={Math.max((revDes!==""?Number(revDes):nDes)*3,30000)} step={100} format={function(v){return fmt(v)}} color="#60a5fa"/>
        </div>
        {/* Slider 2: Monthly savings */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="calendar" size={14} weight="regular" /> {t('achieve.monthlySavings')}</span>
            <span style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>{fmt(revMo!==""?Number(revMo):Math.max(mSav,0))}{t('app.perMonth')}</span>
          </div>
          <Slider label="" value={revMo!==""?Number(revMo):Math.max(mSav,0)} onChange={function(v){setRevMo(String(v))}} min={0} max={Math.max((revMo!==""?Number(revMo):Math.max(mSav,0))*5,20000)} step={100} format={function(v){return fmt(v)}} color="#22c55e"/>
        </div>
        {/* Slider 3: Return rate with profiles + custom label + ? tooltip */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="chart-line-up" size={14} weight="regular" /> {t('achieve.revAccumReturn')} <span onClick={function(){alert(t('achieve.negReturnTooltip'))}} style={{cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:"50%",background:"rgba(96,165,250,0.1)",color:"#3b82f6",fontSize:10,fontWeight:700,marginLeft:4}}>?</span></span>
            <span style={{fontSize:15,fontWeight:700,color:"#f59e0b"}}>{Number(revRet).toFixed(1)}%</span>
          </div>
          <Slider label="" value={revRet} onChange={setRevRet} min={-3} max={12} step={0.1} format={function(v){return Number(v).toFixed(1)+"%"}} color="#f59e0b"/>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
            {adjProfiles.filter(function(_,i){return i>=1}).map(function(p){return <TabBtn key={p.id} active={Math.abs(revRet-p.realReturn*100)<0.05} iconName={p.icon} label={p.name+" "+pct(p.realReturn)} onClick={function(){setRevRet(p.realReturn*100)}} color={p.color}/>})}
          </div>
          {(function(){var matched=adjProfiles.find(function(p){return Math.abs(revRet/100-p.realReturn)<0.001});return matched?<div style={{fontSize:10,color:matched.color||"#3b82f6",marginTop:4}}>{lang==="en"?"Using":"Usando"} {matched.name} {pct(matched.realReturn)} {lang==="en"?"real":"real"}</div>:<div style={{fontSize:10,color:"#f59e0b",marginTop:4}}><Icon name="gear" size={10} weight="regular" /> {t('achieve.customReturnProfile')}: {Number(revRet).toFixed(1)}% {lang==="en"?"real":"real"}</div>})()}
        </div>
        {/* Retirement return assumption notice (replaces old strategy section) */}
        <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <span onClick={function(){alert(t('achieve.retAssumptionTooltip'))}} style={{cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:"50%",background:"rgba(96,165,250,0.15)",color:"#3b82f6",fontSize:10,fontWeight:700,flexShrink:0}}>?</span>
          {t('achieve.retAssumptionTooltip')}
        </div>
        {(nLegacy>0||TAX>0)&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
          {nLegacy>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6"}}>{t('achieve.revLegacyFrom',{amt:fmt(nLegacy)})}</div>}
          {TAX>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.08)",fontSize:11,color:"#92400e"}}>{t('achieve.revTaxFrom',{rate:Number(assetTax).toFixed(1)})}</div>}
        </div>}
      </Cd>


      {revResult&&<AdvisorCTA msg={revResult.sufficient?t('achieve.advisorReality'):t('achieve.advisorHelp')} onContact={function(){setShowLeadModal(true);track(EVENTS.ADVISOR_CTA_CLICKED,{source_tab:tab},{lang:lang,tier:tier})}}/>}
      </>}
      <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
