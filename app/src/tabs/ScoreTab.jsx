import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import Gauge from '../components/Gauge.jsx';
import NavButtons from '../components/NavButtons.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { fmt, fmtC } from '../utils/formatters.js';

const ID_MAP = {"Under 35":"under35","35–44":"35to44","45–54":"45to54","55–64":"55to64","65–74":"65to74","75+":"75plus"};

export default function ScoreTab({ tab, goTab, tier, hScore, nAge, savRate, totalNetWorth, bSR, bNW, percentiles }) {
  const { t } = useTranslation();

  return (
    <div className="fi">
      <Cd><ST tip="0-100 based on savings rate, debts, retirement progress, active saving.">{t('score.title')}</ST>
        <Gauge value={hScore.s}/>
        <div style={{marginTop:20,display:"grid",gap:6}}>
          {hScore.bd.map(function(b){return(<div key={b.l} style={{padding:"9px 12px",borderRadius:8,background:"rgba(0,0,0,0.15)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{width:7,height:7,borderRadius:"50%",background:b.st==="good"?"#22c55e":b.st==="ok"?"#eab308":"#ef4444"}}/><span style={{fontSize:12,color:"#64748b"}}>{b.l}</span></div>
              <span style={{fontSize:13,fontWeight:700,color:b.st==="good"?"#22c55e":b.st==="ok"?"#eab308":"#ef4444"}}>{b.s}/{b.m}</span></div>
            {b.det&&<div style={{fontSize:10,color:"#475569",marginTop:3,marginLeft:14}}>{b.det}</div>}
          </div>)})}
        </div>
        <div style={{marginTop:14,padding:"10px 14px",borderRadius:10,fontSize:12,lineHeight:1.5,background:hScore.s>=70?"rgba(34,197,94,0.06)":hScore.s>=40?"rgba(234,179,8,0.06)":"rgba(239,68,68,0.06)",color:hScore.s>=70?"#16a34a":hScore.s>=40?"#92400e":"#ef4444"}}>
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
                <div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{r.text}</div></div>
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
                <div><span style={{fontSize:10,color:"#64748b"}}>{t('benchmarking.median')}: </span><span style={{fontSize:20,fontWeight:700,color:"#64748b"}}>{b.m}</span></div>
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
                <div style={{fontSize:12,color:b.a?"#16a34a":"#92400e"}}>{b.a?t('score.aboveMedian'):t('score.belowMedian')}</div>
              </div>
            </div>)})}
        </div>:<p style={{color:"#64748b",fontSize:13}}>{t('score.enterAge')} <span style={{color:"#22c55e",cursor:"pointer",textDecoration:"underline"}} onClick={function(){goTab("situation")}}>{t('score.enterAgeLink')}</span>.</p>}
      </Cd>
      <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
