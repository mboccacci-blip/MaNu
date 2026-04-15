import React from 'react';
import Card from '../components/Card.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import TabButton from '../components/TabButton.jsx';
import AdvisorCTA from '../components/AdvisorCTA.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import { fmt, fmtC, pct } from '../utils/formatters.js';
import { fvVariable } from '../utils/financial.js';
import { track, EVENTS } from '../utils/analytics.js';
import useAppStore from '../store/useAppStore.js';
import { useTranslation } from '../i18n/index.jsx';

export default function InactionTab({ tab, goTab, tier, engine }) {
  const { t, lang } = useTranslation();
  const store = useAppStore();
  const sf = store.setField;
  
  const setCiBase = function(v) { sf('ciBase', v); };
  const setCiH = function(v) { sf('ciH', v); };
  const setCiDelayProf = function(v) { sf('ciDelayProf', v); };
  const setShowLeadModal = function(v) { sf('showLeadModal', v); };
  const setUserEmail = function(v) { sf('userEmail', v); };
  const setEmailError = function(v) { sf('emailError', v); };
  const setTier = function(v) { sf('tier', v); };

  const { ciBase, ciH, ciDelayProf, userEmail, emailError } = store;
  const { nEx, mSav, adjProfiles } = engine;

  const Cd = Card;
  const ST = SectionTitle;
  const TabBtn = TabButton;

  return (
    <div className="fi">
      <Cd style={{textAlign:"center",padding:"24px 20px"}}>
        <div style={{fontSize:36,marginBottom:10}}><Icon name="hourglass" size={36} weight="regular" color="#f59e0b" /></div>
        <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:"#0f172a",marginBottom:8}}>{t('inaction.title')}</h2>
        <p style={{color:"#64748b",fontSize:13,lineHeight:1.7,maxWidth:440,margin:"0 auto"}}>
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
        <Cd><ST sub={t('inaction.whatYouLose',{savings:fmt(iSav),monthly:fmt(iMo),name:baseProf.name})}><Icon name={baseProf.icon} size={16} weight="regular" /> {t('inaction.vsInvesting',{name:baseProf.name})}</ST>
          <div style={{fontSize:11,color:"#64748b",marginBottom:12}}>{t('inaction.compareAgainst')}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:16}}>
            {adjProfiles.filter(function(_,i){return i<=2}).map(function(p,i){return <TabBtn key={p.id} active={ciBase===i} iconName={p.icon} label={p.name} onClick={function(){setCiBase(i)}} color={p.color}/>})}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:20,justifyContent:"center"}}>
            {[10,20,30,40].map(function(y){return <TabBtn key={y} active={ciH===y} label={y+t('invest.yrTab')} onClick={function(){setCiH(y)}}/>})}
          </div>

          {/* Base bar */}
          <div style={{marginBottom:12,padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.15)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:12,fontWeight:600,color:"#64748b"}}><Icon name={baseProf.icon} size={13} weight="regular" /> {baseProf.name} ({pct(baseProf.realReturn)} real)</span>
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
            <div style={{fontSize:12,color:"#ef4444",marginBottom:4}}>{t('inaction.stayingIn',{name:baseProf.name,years:ciH})}</div>
            <div style={{fontSize:11,color:"#64748b",lineHeight:1.6}}>
              {t('inaction.vsAggressive',{name:profVals[profVals.length-1].name,amt:fmtC(profVals[profVals.length-1].lost)})}
            </div>
          </div>}
        </Cd>

        <AdvisorCTA msg={t('inaction.advisorSavings')} onContact={function(){setShowLeadModal(true);track(EVENTS.ADVISOR_CTA_CLICKED,{source_tab:tab},{lang:lang,tier:tier})}}/>

        {/* Section 2: COST OF DELAYING */}
        <Cd><ST sub={t('inaction.priceOfWaitingSub')}>{t('inaction.priceOfWaiting')}</ST>
          <div style={{fontSize:12,color:"#64748b",marginBottom:16}}>{t('inaction.whatIfInvestIn',{name:delayProf.name})}</div>
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
            <div style={{fontSize:11,color:"#64748b",lineHeight:1.6}}>
              {t('inaction.potentialWealth',{pct:todayVal>0?((todayVal-lastDelay.val)/todayVal*100).toFixed(1):"0"})}
            </div>
          </div>
        </Cd>

        <AdvisorCTA msg={t('inaction.dontLetInaction')} onContact={function(){setShowLeadModal(true);track(EVENTS.ADVISOR_CTA_CLICKED,{source_tab:tab},{lang:lang,tier:tier})}}/>

        {/* ── Tier upsell ── */}
        {tier==="free" && <Cd glow="gold" style={{textAlign:"center",padding:"32px 24px"}}>
          <div style={{fontSize:28,marginBottom:10}}><Icon name="lock-open" size={28} weight="regular" color="#eab308" /></div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:20,fontWeight:800,color:"#0f172a",marginBottom:8}}>{lang==="en"?"Want to see your full analysis?":"¿Querés ver tu análisis completo?"}</div>
          <p style={{fontSize:14,color:"#64748b",lineHeight:1.6,maxWidth:380,margin:"0 auto 20px"}}>{lang==="en"?"Enter your email to unlock your exact Magic Number and an interactive scenario simulator.":"Dejá tu email para desbloquear tu Magic Number exacto y un simulador interactivo de escenarios."}</p>
          <div style={{display:"flex",gap:8,maxWidth:400,margin:"0 auto"}}>
            <input type="email" value={userEmail} onChange={function(e){setUserEmail(e.target.value);setEmailError("")}} placeholder={lang==="en"?"your@email.com":"tu@email.com"} style={{flex:1,padding:"14px 16px",borderRadius:12,border:"1px solid "+(emailError?"#ef4444":"rgba(96,165,250,0.2)"),background:"#fff",fontSize:14,fontFamily:"Inter,sans-serif",outline:"none"}}/>
            <button onClick={function(){var re=/^[\S@]+@[\S@]+\.[\S@]+$/;if(!re.test(userEmail)){setEmailError(lang==="en"?"Enter a valid email":"Ingresá un email válido");return;}setTier("email");setEmailError("");window.scrollTo({top:0,behavior:"smooth"});}} className="bp" style={{padding:"14px 24px",fontSize:14,fontWeight:700,whiteSpace:"nowrap"}}>{lang==="en"?"Unlock":"Desbloquear"} →</button>
          </div>
          {emailError&&<div style={{color:"#ef4444",fontSize:12,marginTop:6}}>{emailError}</div>}
          <div style={{fontSize:11,color:"#64748b",marginTop:10}}><Icon name="lock" size={11} weight="regular" /> {lang==="en"?"We won't share your email. No spam, ever.":"No compartimos tu email. Sin spam, nunca."}</div>
        </Cd>}

        {tier==="email" && <Cd glow="gold" style={{textAlign:"center",padding:"28px 24px"}}>
          <div style={{fontSize:28,marginBottom:10}}><Icon name="star" size={28} weight="fill" color="#eab308" /></div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:18,fontWeight:800,color:"#0f172a",marginBottom:8}}>{lang==="en"?"Unlock your Full Profile":"Desbloqueá tu Perfil Full"}</div>
          <p style={{fontSize:13,color:"#64748b",lineHeight:1.6,marginBottom:16}}>{lang==="en"?"Get your complete financial analysis across all 16 modules, detailed projections, and a premium PDF report.":"Obtené tu análisis financiero completo en los 16 módulos, proyecciones detalladas e informe PDF premium."}</p>
          <button className="bp" style={{padding:"14px 32px",fontSize:16,fontWeight:700}} onClick={function(){alert(lang==="en"?"Stripe integration coming soon! Price: $14.99":"¡Integración con Stripe próximamente! Precio: $14.99")}}>{lang==="en"?"Unlock Full Profile — $14.99":"Desbloquear Perfil Full — $14.99"}</button>
        </Cd>}

        </> )})()}
      <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
