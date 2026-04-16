import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import Slider from '../components/Slider.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import { useTranslation } from '../i18n/index.jsx';
import AdvisorCTA from '../components/AdvisorCTA.jsx';
import { fmt, fmtC } from '../utils/formatters.js';

export default function SaveTab({ tab, goTab, tier, savOpps, setSavSliders, totalSavOpp, mSav }) {
  const { t } = useTranslation();

  return (
    <div className="fi">
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
        <div style={{marginTop:16,padding:"14px 16px",borderRadius:12,background:"rgba(0,0,0,0.15)"}}>
          <div style={{fontSize:12,color:"#64748b",marginBottom:10}}>{t('save.beforeAfter')}</div>
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
      <AdvisorCTA tab={tab}/>
      <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
