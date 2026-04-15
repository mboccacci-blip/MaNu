import React, { useMemo } from 'react';
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
  
  const setSimSav = function(v) { sf('simSav', v); };
  const setSimMo = function(v) { sf('simMo', v); };
  const setSimRet = function(v) { sf('simRet', v); };
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
        <NI label={t('achieve.otherRetIncome')} value={socialSecurity} onChange={setSocialSecurity} tip={t('achieve.otherRetIncomeTip')}/>
        {nSSRaw>0&&ytr>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",marginBottom:12}}>{fmt(nSSRaw)}/mo {t('retirement.atRetirement')} = <strong>{fmt(nSS)}/mo {t('retirement.todayDollar')}</strong> <span style={{color:"#475569"}}>({t('retirement.inflAdjusted', {y: ytr})})</span></div>}
        <NI label={t('achieve.currentSavings')} value={existingSavings} onChange={setExistingSavings} tip={t('achieve.currentSavingsTip')}/>
        <NI label={t('achieve.estMonthlySav')} value={manualMonthlySav} onChange={setManualMonthlySav} tip={t('achieve.estMonthlySavTip')}/>
        {hasIncomeData&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#16a34a",marginBottom:12}}><Icon name="check-circle" size={12} weight="regular" /> {t('achieve.actualSavFromIncome')}: <strong>{fmt(mSavComputed)}/mo</strong> — {t('achieve.overridesEstimate')}.</div>}
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
        {nAge>0&&nRetAge>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}><div style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6"}}>{ytr>0?t('achieve.yearsToGo',{n:ytr}):t('achieve.atRetirement')}</div>{nYP>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6"}}>{t('achieve.planToAge',{age:nRetAge+nYP})}</div>}{mSav>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#16a34a"}}>{hasIncomeData?t('achieve.savingActual',{amt:fmt(mSav)}):t('achieve.savingEstimate',{amt:fmt(mSav)})}</div>}</div>}
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
              {lang==="en"?"Accumulating this capital by age "+nRetAge+", you secure "+fmt(desiredAfterSS)+"/mo for "+nYP+" years of retirement."+(nLegacy>0?" Plus "+fmt(nLegacy)+" in legacy.":""):"Juntando este capital a tus "+nRetAge+" años, te asegurás "+fmt(desiredAfterSS)+" extra por mes durante "+nYP+" años."+(nLegacy>0?" Y aún te sobran "+fmt(nLegacy)+" de herencia.":"")}
            </div>
          </div>
        </Cd>
        {/* Year-by-Year Chart (Free tier - fixed profiles, no selectors) */}
        {ybYData.length>0&&<Cd>
          <ST>{t('retirement.ybyProjection')}</ST>
          <div style={{marginBottom:12}}>
            <MultiLineChart series={[{data:ybYData.map(function(d){
              var ageNow=nAge||30;var ageAtYear=ageNow+d.year;var totalYrs=ytr+nYP;
              var step=totalYrs>40?10:5;
              var isFirst=d.year===0;var isRetire=d.year===ytr;var isLast=d.year===totalYrs;
              var isTick=d.year%step===0&&d.year>0&&d.year<totalYrs;
              var tooCloseToRetire=Math.abs(d.year-ytr)<(step/2)&&!isRetire;
              var tooCloseToLast=Math.abs(d.year-totalYrs)<(step/2)&&!isLast; const show=(isFirst||isRetire||isLast||(isTick&&!tooCloseToRetire&&!tooCloseToLast));
              return{l:show?(isFirst?t('app.age')+" "+ageAtYear:isRetire?t('app.at')+" "+ageAtYear:isLast?t('app.age')+" "+ageAtYear:""+ageAtYear):"",v:d.balance}
            }),color:"#34d399",bold:true,fill:true}]} height={160} showYAxis={true}/>
          </div>
          {(function(){
            var depleteY=null;for(var i=ytr+1;i<ybYData.length;i++){if(ybYData[i].balance<=0){depleteY=i;break}}
            var lastBal=(ybYData[ybYData.length-1]||{}).balance||0;
            return(<div style={{textAlign:"center",marginTop:6}}>
              {depleteY?<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(239,68,68,0.08)",fontSize:11,color:"#ef4444",display:"inline-block"}}><Icon name="warning" size={12} weight="regular" /> {t('retirement.moneyRunsOut', {age: nAge+depleteY, n: depleteY-ytr})}</div>
              :<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(34,197,94,0.08)",fontSize:11,color:"#16a34a",display:"inline-block"}}><Icon name="check-circle" size={12} weight="regular" /> {t('retirement.moneyLasts', {amt: fmtC(lastBal), age: nAge+ytr+nYP})}</div>}
            </div>)})()}
          <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",textAlign:"center",marginTop:10,lineHeight:1.5}}>
            <Icon name="lock" size={11} weight="regular" /> {lang==="en"?"Unlock to customize investment profiles and see how different strategies change your outcome":"Desbloqueá para personalizar perfiles de inversión y ver cómo diferentes estrategias cambian tu resultado"}
          </div>
        </Cd>}
        <Cd glow="gold" style={{textAlign:"center",padding:"32px 24px"}}>
          <div style={{fontSize:28,marginBottom:10}}><Icon name="lock-open" size={28} weight="regular" color="#eab308" /></div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:20,fontWeight:800,color:"#0f172a",marginBottom:4}}>{lang==="en"?"Want your exact Magic Number?":"¿Querés conocer tu Magic Number exacto?"}</div>
          {/* Path A: email for free */}
          <div style={{marginTop:16,padding:"18px 20px",borderRadius:14,background:"rgba(96,165,250,0.05)",border:"1px solid rgba(96,165,250,0.15)"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#3b82f6",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{lang==="en"?"✨ Free — just your email":"✨ Gratis — solo tu email"}</div>
            <p style={{fontSize:13,color:"#475569",lineHeight:1.5,marginBottom:12,margin:"0 0 12px"}}>{lang==="en"?"We'll reveal your exact number and send you a personalized PDF report.":"Te revelamos tu número exacto y te enviamos un informe PDF personalizado."}</p>
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
        <Cd glow="blue" style={{textAlign:"center",padding:"40px 24px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/><div style={{position:"relative"}}><div style={{fontSize:12,fontWeight:600,color:"#60a5fa",textTransform:"uppercase",letterSpacing:3,marginBottom:10}}>{t('achieve.yourMN')}</div><div style={{fontFamily:"Outfit,sans-serif",fontSize:50,fontWeight:900,color:"#60a5fa",lineHeight:1.1,marginBottom:12,textShadow:"0 0 40px rgba(96,165,250,0.3),0 0 80px rgba(96,165,250,0.15)"}}>{fmt(Math.round(magic.real))}</div><div style={{padding:"10px 16px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.10)",fontSize:13,color:"#334155",lineHeight:1.6}}>{lang==="en"?"Accumulating "+fmt(Math.round(magic.real))+" by age "+nRetAge+", you secure "+fmt(desiredAfterSS)+"/mo for "+nYP+" years."+(nSS>0?" (after "+fmt(nSS)+"/mo retirement income)":"")+(nLegacy>0?" Plus "+fmt(nLegacy)+" legacy.":"")+" Lasting until age "+(nRetAge+nYP)+".":"Juntando "+fmt(Math.round(magic.real))+" a tus "+nRetAge+" años, te asegurás "+fmt(desiredAfterSS)+" extra por mes durante "+nYP+" años."+(nSS>0?" (además de "+fmt(nSS)+"/mes de jubilación)":"")+(nLegacy>0?" Y aún te sobran "+fmt(nLegacy)+" de herencia.":"")+" Hasta los "+(nRetAge+nYP)+" años."}</div></div></Cd>
        <Cd><ST sub={t('achieve.threeLeversSub')}>{t('achieve.threeLevers')}</ST>
          <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="currency-dollar" size={14} weight="regular" /> {t('achieve.startingSavings')}</span><span style={{fontSize:15,fontWeight:700,color:"#60a5fa"}}>{fmt(simEffSav)}</span></div><Slider label="" value={simSav!=null?simSav:nEx} onChange={function(v){setSimSav(v)}} min={0} max={Math.max(nEx*3,500000)} step={10000} format={function(v){return fmtC(v)}} color="#60a5fa"/>{simSav!=null&&simSav!==nEx&&<div style={{fontSize:10,color:"#3b82f6",marginTop:-4}}>{t('achieve.actual')}: {fmt(nEx)} · {t('achieve.simulating')}: {fmt(simSav)}</div>}</div>
          <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="calendar" size={14} weight="regular" /> {t('achieve.monthlySavings')}</span><span style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>{fmt(simEffMo)}/mo</span></div><Slider label="" value={simMo!=null?simMo:Math.max(mSav,0)} onChange={function(v){setSimMo(v)}} min={0} max={Math.max(mSav*3,10000)} step={100} format={function(v){return fmt(v)}} color="#22c55e"/>{simMo!=null&&simMo!==Math.max(mSav,0)&&<div style={{fontSize:10,color:"#16a34a",marginTop:-4}}>{t('achieve.actual')}: {fmt(Math.max(mSav,0))}/mo · {t('achieve.simulating')}: {fmt(simMo)}/mo</div>}</div>
          <div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="chart-line-up" size={14} weight="regular" /> {t('achieve.annualRealReturn')}</span><span style={{fontSize:15,fontWeight:700,color:"#f59e0b"}}>{(simEffRet*100).toFixed(1)}%</span></div><Slider label="" value={simRet!=null?simRet:(simEffRet*100)} onChange={function(v){setSimRet(v)}} min={0} max={12} step={0.1} format={function(v){return Number(v).toFixed(1)+"%"}} color="#f59e0b"/><div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>{adjProfiles.filter(function(_,i){return i>=1}).map(function(p){return <TabBtn key={p.id} active={Math.abs(simEffRet-p.realReturn)<0.001} iconName={p.icon} label={p.name+" "+pct(p.realReturn)} onClick={function(){setSimRet(p.realReturn*100)}} color={p.color}/>})}</div></div>
          {simSav!=null||simMo!=null||simRet!=null?<div style={{textAlign:"center",marginBottom:12}}><button onClick={function(){setSimSav(null);setSimMo(null);setSimRet(null)}} style={{background:"rgba(15,23,42,0.06)",color:"#64748b",border:"1px solid rgba(255,255,255,0.08)",padding:"8px 20px",borderRadius:10,fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer"}}>↩ {t('achieve.resetToActual')}</button></div>:null}
        </Cd>
        <Cd glow={simProjected>=magic.real?"green":"red"} style={{textAlign:"center",padding:"28px 24px"}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:simProjected>=magic.real?"#22c55e":"#ef4444",marginBottom:6}}>{t('achieve.projectedAt', {age: nRetAge})}</div><div style={{fontFamily:"Outfit,sans-serif",fontSize:40,fontWeight:900,color:simProjected>=magic.real?"#22c55e":"#f87171"}}>{fmtC(simProjected)}</div><div style={{marginTop:16,padding:14,borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)"}}><div style={{height:10,borderRadius:5,background:"rgba(0,0,0,0.04)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:5,width:Math.min(simPct,100)+"%",background:simPct>=100?"linear-gradient(90deg,#22c55e,#4ade80)":simPct>=60?"linear-gradient(90deg,#eab308,#facc15)":"linear-gradient(90deg,#ef4444,#f87171)",transition:"width 0.5s"}}/></div><div style={{fontSize:13,fontWeight:700,marginTop:6,color:simPct>=100?"#22c55e":simPct>=60?"#eab308":"#ef4444"}}>{lang==="en"?"You're at "+simPct.toFixed(1)+"% of your goal. Adjust the levers above to reach "+fmtC(magic.real)+".":"Estás al "+simPct.toFixed(1)+"% de tu meta. Ajustá tus números arriba para llegar a "+fmtC(magic.real)+"."}</div></div></Cd>
        {simGap>0&&<Cd><ST sub={t('achieve.gapSub')}>{t('achieve.howToCloseGap')}</ST><div style={{display:"grid",gap:12}}>{simNeededReturn!=null?<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(245,158,11,0.04)",border:"1px solid rgba(245,158,11,0.1)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:600,color:"#92400e"}}>A. {t('achieve.higherReturn')}</span><span style={{fontSize:16,fontWeight:800,color:"#f59e0b"}}>{(simNeededReturn*100).toFixed(1)}%</span></div><div style={{fontSize:12,color:"#64748b"}}>{t('achieve.higherReturnExplain', {rate: (simNeededReturn*100).toFixed(1)})}{(function(){var m=adjProfiles.find(function(p){return Math.abs(p.realReturn-simNeededReturn)<0.008});return m?" ≈ "+m.icon+" "+m.name:""})()}</div></div>:<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.1)"}}><div style={{fontSize:13,fontWeight:600,color:"#ef4444"}}>A. {t('achieve.returnAloneWontWork')}</div></div>}{simNeededMonthly!=null&&<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.1)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:600,color:"#16a34a"}}>B. {t('achieve.saveMore')}</span><span style={{fontSize:16,fontWeight:800,color:"#22c55e"}}>{fmt(simNeededMonthly)}/mo</span></div><div style={{fontSize:12,color:"#64748b"}}>{t('achieve.atSimEffRet', {rate: (simEffRet*100).toFixed(1)})}{simNeededMonthly>simEffMo?" — "+t('achieve.morePerMonth', {amt: fmt(simNeededMonthly-simEffMo)}):""}</div></div>}{simNeededMonthly!=null&&<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)"}}><div style={{fontSize:13,fontWeight:600,color:"#3b82f6",marginBottom:6}}>C. {t('achieve.combineBoth')}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>{(function(){var maxPR=adjProfiles[adjProfiles.length-1].realReturn;var baseR=simNeededReturn!=null?simNeededReturn:maxPR;var midR=simEffRet+(baseR-simEffRet)*0.5;if(midR<=simEffRet)midR=simEffRet+(maxPR-simEffRet)*0.5;var lo=0,hi=50000;for(var i=0;i<30;i++){var mid=(lo+hi)/2;if(fvVariable(simEffSav,mid,midR,ytr,debtEvents)<magic.real)lo=mid;else hi=mid}return[{l:t('achieve.higherReturn'),v:(midR*100).toFixed(1)+"%",c:"#f59e0b"},{l:t('achieve.saveMore'),v:fmt((lo+hi)/2)+"/mo",c:"#22c55e"}].map(function(s){return <div key={s.l} style={{padding:"10px 12px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",textAlign:"center"}}><div style={{fontSize:10,color:"#64748b"}}>{s.l}</div><div style={{fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div></div>})})()}</div></div>}</div></Cd>}
        {simGap<=0&&<Cd glow="green" style={{padding:"20px 24px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:"#22c55e",marginBottom:8}}><Icon name="confetti" size={16} weight="regular" /> {t('achieve.onTrack')}</div><div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>{t('achieve.surpassMN', {amt: fmtC(simProjected-magic.real)})}</div></Cd>}
        <AdvisorCTA msg={simGap>0?t('advisor.helpClosingGap'):t('advisor.protectPlan')} onContact={function(){setShowLeadModal(true);track(EVENTS.ADVISOR_CTA_CLICKED,{source_tab:tab},{lang:lang,tier:tier})}}/>
        {/* Year-by-Year Projection (full, with profile selectors) */}
        {ybYData.length>0&&<Cd>
          <ST tip={t('retirement.ybyTip')}>{t('retirement.ybyProjection')}</ST>
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
              {adjProfiles.filter(function(_,i){return i<=4}).map(function(p,i){return <TabBtn key={p.id} active={chartRetireIdx===i} iconName={p.icon} label={p.name} onClick={function(){setChartRetireIdx(i)}} color={p.color}/>})}
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

      {/* === REVERSE CALCULATOR === */}
      {nAge>0&&<>
      <Cd style={{marginTop:24,borderTop:"2px solid rgba(96,165,250,0.15)",paddingTop:28}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:28,marginBottom:8}}><Icon name="calendar" size={28} weight="regular" color="#60a5fa" /></div>
          <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:20,fontWeight:700,color:"#0f172a",marginBottom:6}}>{t('achieve.whenCanIRetire')}</h2>
          <p style={{color:"#64748b",fontSize:13,lineHeight:1.6,maxWidth:400,margin:"0 auto"}}>
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
        {(revDes===""||revYrs===""||revSav===""||revMo==="")&&(nDes>0||nEx>0)&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",marginBottom:12}}>
          <Icon name="ruler" size={12} weight="regular" /> {t('achieve.revEmptyFieldsNote')}
        </div>}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{t('achieve.revAccumReturn')}</span>
            <span style={{fontSize:15,fontWeight:700,color:"#f59e0b"}}>{Number(revRet).toFixed(1)}%</span>
          </div>
          <Slider label="" value={revRet} onChange={setRevRet} min={0} max={12} step={0.1} format={function(v){return Number(v).toFixed(1)+"%"}} color="#f59e0b"/>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
            {adjProfiles.filter(function(_,i){return i>=1}).map(function(p){return <TabBtn key={p.id} active={Math.abs(revRet-p.realReturn*100)<0.05} label={p.icon+" "+p.name+" "+pct(p.realReturn)} onClick={function(){setRevRet(p.realReturn*100)}} color={p.color}/>})}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>{t('achieve.revInvestStrategy')}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {adjProfiles.filter(function(_,i){return i<=4}).map(function(p,i){return <TabBtn key={p.id} active={revRetProf===i} iconName={p.icon} label={p.name} onClick={function(){setRevRetProf(i)}} color={p.color}/>})}
          </div>
          <div style={{fontSize:10,color:"#3b82f6",marginTop:4}}>{t('achieve.revAtRealDuring',{name:adjProfiles[revRetProf].name,rate:pct(adjProfiles[revRetProf].realReturn)})}</div>
        </div>
        {(nLegacy>0||TAX>0)&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
          {nLegacy>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6"}}>{t('achieve.revLegacyFrom',{amt:fmt(nLegacy)})}</div>}
          {TAX>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.08)",fontSize:11,color:"#92400e"}}>{t('achieve.revTaxFrom',{rate:Number(assetTax).toFixed(1)})}</div>}
        </div>}
      </Cd>

      {revResult&&<Cd glow={revResult.age?"green":"red"} style={{textAlign:"center",padding:"28px 24px"}}>
        {revResult.age?<>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"#22c55e",marginBottom:6}}>{t('achieve.youCanRetireAt')}</div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:56,fontWeight:900,color:"#22c55e",lineHeight:1,marginBottom:4}}>{t('app.age')} {revResult.age}</div>
          <div style={{fontSize:13,color:"#64748b",marginTop:8,lineHeight:1.6}}>
            {t('achieve.revInYears',{years:revResult.yrsToRetire,projected:fmtC(revResult.projected),mn:fmtC(revResult.mn)})}{nLegacy>0?" "+t('achieve.revIncludesLegacy',{amt:fmt(nLegacy)}):""}{revResult.surplus>0?" "+t('achieve.revSurplus',{amt:fmtC(revResult.surplus)}):""}.{"\n"}
          </div>
          {revResult.ssToday>0&&<div style={{fontSize:11,color:"#3b82f6",marginTop:8}}>
            {t('achieve.revSSIncome',{future:fmt(Number(revSS)),today:fmt(revResult.ssToday),age:revResult.age})}
          </div>}
          {TAX>0&&<div style={{fontSize:11,color:"#92400e",marginTop:4}}>{t('achieve.revTaxNet',{rate:Number(assetTax).toFixed(1)})}</div>}
          <div style={{marginTop:16,padding:14,borderRadius:12,background:"rgba(0,0,0,0.2)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div><div style={{fontSize:10,color:"#64748b"}}>{t('achieve.retireAt')}</div><div style={{fontSize:18,fontWeight:700,color:"#22c55e"}}>{revResult.age}</div></div>
              <div><div style={{fontSize:10,color:"#64748b"}}>{t('achieve.savingsThen')}</div><div style={{fontSize:18,fontWeight:700,color:"#60a5fa"}}>{fmtC(revResult.projected)}</div></div>
              <div><div style={{fontSize:10,color:"#64748b"}}>{t('achieve.yourMN')}</div><div style={{fontSize:18,fontWeight:700,color:"#0f172a"}}>{fmtC(revResult.mn)}</div></div>
            </div>
          </div>
        </>:<>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"#ef4444",marginBottom:6}}>{t('achieve.cannotRetireBy100')}</div>
          <div style={{fontSize:13,color:"#ef4444",lineHeight:1.6}}>{t('achieve.revCannotRetire')}</div>
        </>}
      </Cd>}
      {revResult&&<AdvisorCTA msg={revResult.age?t('achieve.advisorReality'):t('achieve.advisorHelp')} onContact={function(){setShowLeadModal(true);track(EVENTS.ADVISOR_CTA_CLICKED,{source_tab:tab},{lang:lang,tier:tier})}}/>}
      </>}
      <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
