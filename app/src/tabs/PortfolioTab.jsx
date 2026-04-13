import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import Slider from '../components/Slider.jsx';
import NavButtons from '../components/NavButtons.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { fmt, pct } from '../utils/formatters.js';

export default function PortfolioTab({ tab, goTab, tier, nEx, mSav, allProfiles, portAlloc, updatePortAlloc, portContribAlloc, updateContribAlloc, portReturn, portContribReturn }) {
  const { t } = useTranslation();

  return (
    <div className="fi">
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
    </div>
  );
}
