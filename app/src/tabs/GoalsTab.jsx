import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import NI from '../components/NumberInput.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import TabBtn from '../components/TabButton.jsx';
import { useTranslation } from '../i18n/index.jsx';
import AdvisorCTA from '../components/AdvisorCTA.jsx';
import { fmt, fmtC, pct } from '../utils/formatters.js';

export default function GoalsTab({ tab, goTab, tier, goals, uG, rG, aG, goalCalcs, allProfiles, mSav, goalRetImpact, totalGoalMo, goalImpactRate }) {
  const { t } = useTranslation();

  return (
    <div className="fi">
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
                  <span style={{fontSize:11,color:"#64748b"}}>{calc.prof.name} ({pct(calc.prof.realReturn)} real)</span>
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
              <div style={{fontSize:12,color:"#64748b"}}>{t('goals.inYears',{amt:fmt(g.nAmt),years:g.nYrs})} · {g.mo>0?fmt(g.mo)+"/mo":t('common.covered')}</div>
              <div style={{fontSize:10,color:g.prof.color}}>{g.prof.icon} {g.prof.name}</div>
            </div>)})}
        </div>
      </Cd>}

      {/* Retirement impact */}
      {goalRetImpact&&<Cd glow="gold">
        <div style={{fontSize:12,fontWeight:600,color:"#a18207",marginBottom:10}}><Icon name="warning" size={13} weight="regular" /> {t('goals.impactOnRetirement')}</div>
        <div style={{fontSize:13,color:"#64748b",lineHeight:1.6,marginBottom:12}}>
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
        <div style={{marginTop:8,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",textAlign:"center",lineHeight:1.5}}>
          <Icon name="ruler" size={12} weight="regular" /> {t('goals.oppCostExplain',{rate:pct(goalImpactRate)})}
        </div>
      </Cd>}
      <AdvisorCTA tab={tab}/>
      <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
