import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import NI from '../components/NumberInput.jsx';
import Toggle from '../components/Toggle.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import Tip from '../components/Tip.jsx';
import TabBtn from '../components/TabButton.jsx';
import MultiLineChart from '../components/MultiLineChart.jsx';
import { useTranslation } from '../i18n/index.jsx';
import AdvisorCTA from '../components/AdvisorCTA.jsx';
import { fmt, fmtC, pct } from '../utils/formatters.js';

export default function InvestTab({ tab, goTab, tier, lang, mSav, nEx, projYears, setProjYears, projs, maxProj, showNom, setShowNom, customReturn, setCustomReturn, customInflation, INFL, showScenarios, setShowScenarios, scenProfileIdx, setScenProfileIdx, scenarios, allProfiles, adjProfiles, hasPortfolio, blendedPortReturn, costNS, costNSProfileIdx, setCostNSProfileIdx, costNSReturn, magic, debtEvents }) {
  const { t } = useTranslation();
  return (
    <div className="fi">
  <Cd>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:18}}>
      <div><ST tip={t('achieve.investTip',{mo:fmt(Math.abs(mSav)),sav:fmt(nEx),yrs:projYears})+(debtEvents.length>0?t('achieve.investTipDebt'):"")}>{t('achieve.investTitle')}</ST>
        <p style={{fontSize:13,color:"#64748b",marginTop:-16}}>{mSav>=0?fmt(mSav)+t('app.perMonth')+" + "+fmt(nEx)+" "+t('invest.savings'):fmt(nEx)+" "+t('invest.savings')+" "+fmt(mSav)+t('app.perMonth')} → {t('invest.portfolioIn')} {projYears} {t('app.years')} <span style={{fontSize:11,color:"#475569"}}>{showNom?"("+t('achieve.nominalFuture')+")":"("+t('achieve.todaysDInfl')+")"}</span></p></div>
      <div style={{display:"flex",background:"rgba(15,23,42,0.06)",borderRadius:10,padding:3,border:"1px solid rgba(15,23,42,0.08)"}}>
        <button onClick={function(){setShowNom(false)}} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",border:"none",cursor:"pointer",background:!showNom?"rgba(34,197,94,0.15)":"transparent",color:!showNom?"#22c55e":"#64748b"}}>{t('achieve.todaysD')}</button>
        <button onClick={function(){setShowNom(true)}} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:"Outfit,sans-serif",border:"none",cursor:"pointer",background:showNom?"rgba(96,165,250,0.15)":"transparent",color:showNom?"#60a5fa":"#64748b"}}>{t('achieve.nominalD')}</button>
      </div>
    </div>
    <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",marginBottom:16}}>
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
    <div style={{marginTop:10,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",textAlign:"center",lineHeight:1.5}}>{t('invest.allValuesDisclaimer',{todayDollar:t('common.todayDollar')})}</div>
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
      <div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.1)",fontSize:12,color:"#3b82f6",lineHeight:1.6,textAlign:"center"}}>
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
    <div style={{marginTop:12,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",textAlign:"center",lineHeight:1.5}}>
      {t('inaction.allTodayDollars',{profile:costNSProfileIdx===-1&&hasPortfolio?t('profiles.myPortfolio.name'):(allProfiles[costNSProfileIdx]||adjProfiles[4]).name,rate:pct(costNSReturn)})+" "+t('inaction.waiting5yr',{amt:fmtC(costNS.length>5?costNS[5].lost:0)})}
    </div>
  </Cd>}

  {magic.real>0&&<Cd glow="blue" style={{textAlign:"center",padding:"28px 24px"}}>
    <div style={{fontSize:10,color:"#3b82f6",textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>{t('retirement.yourMN')}</div>
    <div style={{fontFamily:"Outfit,sans-serif",fontSize:26,fontWeight:800,color:"#60a5fa",marginBottom:12}}>{fmt(magic.real)}</div>
    <p style={{fontSize:13,color:"#64748b",lineHeight:1.6,maxWidth:440,margin:"0 auto 16px"}}>{t('common.inYrWith6040',{years:projYears})+" "}<strong style={{color:"#22c55e"}}>{fmtC(projs[4].rFV)}</strong>{'. '}{projs[4].rFV<magic.real?((projs[4].rFV/magic.real)*100).toFixed(0)+"% "+t('common.ofTarget'):t('common.youdSurpass')}</p>
  </Cd>}
  <AdvisorCTA tab={tab}/>
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
