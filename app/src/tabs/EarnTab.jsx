import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import NI from '../components/NumberInput.jsx';
import Toggle from '../components/Toggle.jsx';
import MiniChart from '../components/MiniChart.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { fmt, fmtC } from '../utils/formatters.js';

export default function EarnTab({ tab, goTab, tier, extraIncome, setExtraIncome, eiTemporary, setEiTemporary, eiYears, setEiYears, nEI, nEIYrs, earnProj, totalSavOpp, combinedImpact }) {
  const { t } = useTranslation();

  return (
    <div className="fi">
      <Cd><ST tip={t('earn.tip')} sub={t('earn.sub')}>{t('earn.title')}</ST>
        <NI label={t('earn.extraIncome')} value={extraIncome} onChange={setExtraIncome} placeholder="" tip={t('earn.extraIncomeTip')}/>
        <Toggle value={eiTemporary} onChange={setEiTemporary} label={t('earn.temporary')} sub={eiTemporary?t('earn.incomeLastsYrs',{years:nEIYrs}):t('earn.permanentExtra')}/>
        {eiTemporary&&<NI label={t('earn.howManyYears')} value={eiYears} onChange={setEiYears} prefix="" placeholder="5" tip={t('earn.howLongExtra')}/>}
      </Cd>
      {earnProj&&<Cd glow="green">
        <div style={{fontSize:12,fontWeight:600,color:"#16a34a",textTransform:"uppercase",letterSpacing:2,marginBottom:12}}>{t('earn.extraInvested',{amt:fmt(nEI)})}</div>
        <MiniChart data={earnProj.data} height={120} color="#22c55e"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:16,textAlign:"center"}}>
          {[{l:t('earn.yrLabel',{n:10}),v:earnProj.imp10},{l:t('earn.yrLabel',{n:20}),v:earnProj.imp20},{l:t('earn.yrLabel',{n:30}),v:earnProj.imp30}].map(function(t){return(
            <div key={t.l} style={{padding:10,borderRadius:10,background:"rgba(0,0,0,0.2)"}}>
              <div style={{fontSize:10,color:"#64748b"}}>{t.l}</div>
              <div style={{fontSize:16,fontWeight:700,color:"#22c55e"}}>{fmtC(t.v)}</div>
              <div style={{fontSize:9,color:"#475569"}}>60/40</div>
            </div>)})}
        </div>
        {eiTemporary&&<div style={{marginTop:10,fontSize:11,color:"#92400e",textAlign:"center"}}><Icon name="hourglass" size={12} weight="regular" /> {t('earn.tempContrib',{years:nEIYrs})}</div>}
      </Cd>}

      {/* Combined: Save + Earn */}
      {(totalSavOpp.mo>0||nEI>0)&&<Cd glow="gold">
        <div style={{fontSize:12,fontWeight:600,color:"#a18207",marginBottom:12}}><Icon name="fire" size={14} weight="regular" /> {t('earn.combined')}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.15)",textAlign:"center"}}>
            <div style={{fontSize:10,color:"#64748b"}}>{t('earn.saveLess')}</div>
            <div style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>+{fmt(totalSavOpp.mo)}/mo</div>
          </div>
          <div style={{padding:12,borderRadius:10,background:"rgba(0,0,0,0.15)",textAlign:"center"}}>
            <div style={{fontSize:10,color:"#64748b"}}>{t('earn.earnMore')}</div>
            <div style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>+{fmt(nEI)}/mo</div>
          </div>
        </div>
        <div style={{textAlign:"center",padding:"16px 20px",borderRadius:14,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)"}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{t('earn.totalExtra')}</div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:28,fontWeight:800,color:"#22c55e"}}>{fmt(combinedImpact.mo)}</div>
          <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:10}}>
            {[{l:t('earn.yrLabel',{n:10}),v:combinedImpact.imp10},{l:t('earn.yrLabel',{n:20}),v:combinedImpact.imp20},{l:t('earn.yrLabel',{n:30}),v:combinedImpact.imp30}].map(function(t){return(
              <div key={t.l}><div style={{fontSize:10,color:"#64748b"}}>{t.l}</div><div style={{fontSize:14,fontWeight:700,color:"#22c55e"}}>{fmtC(t.v)}</div></div>)})}
          </div>
        </div>
      </Cd>}
      <Cd style={{padding:"12px 16px"}}>
        <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#92400e",lineHeight:1.6}}>
          <Icon name="warning" size={13} weight="regular" /> <strong>{t('earn.scenariosOnly')}</strong> — {t('earn.earnScenariosExplain')}
        </div>
      </Cd>
      <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
