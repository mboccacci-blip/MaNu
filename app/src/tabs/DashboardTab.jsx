import Cd from '../components/Card.jsx';
import Icon from '../components/Icon.jsx';
import NavButtons from '../components/NavButtons.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { fmt } from '../utils/formatters.js';

export default function DashboardTab({ tab, goTab, tier, hasData, mSav, hScore, magic, nSS, nEx, mD, totalIncome, totalMonthlyObligations, noDebts, totalDebtAll, emergencyMonths, savOpps }) {
  const { t } = useTranslation();

  return (
    <div className="fi">{!hasData?
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
    </>}</div>
  );
}
