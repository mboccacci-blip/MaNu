import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import NI from '../components/NumberInput.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import TabBtn from '../components/TabButton.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { fmt, fmtC, pct } from '../utils/formatters.js';
import { fvL } from '../utils/financial.js';

export default function CostTab({ tab, goTab, tier, lang, costItemName, setCostItemName, costItemPrice, setCostItemPrice, costProfileIdx, setCostProfileIdx, adjProfiles, allProfiles, costInRet, ytr, hasPortfolio, blendedPortReturn }) {
  const { t } = useTranslation();

  return (
    <div className="fi">
      <Cd><ST tip={t('cost.tip')} sub={t('cost.sub')}>{t('cost.title')}</ST>
        <input type="text" value={costItemName} onChange={function(e){setCostItemName(e.target.value)}} placeholder={lang==="en"?"e.g., New car, Luxury vacation...":"ej., Auto nuevo, Vacaciones de lujo..."} style={{width:"100%",background:"rgba(248,250,253,0.98)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,color:"#0f172a",fontSize:15,padding:"13px 16px",fontFamily:"Outfit,sans-serif",outline:"none",marginBottom:16}}/>
        <NI label={t('cost.price')} value={costItemPrice} onChange={setCostItemPrice} placeholder="" tip={t('cost.priceTip')}/>
        <div style={{fontSize:13,fontWeight:500,color:"#94a3b8",marginBottom:8}}>{t('cost.investProfile')}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {adjProfiles.map(function(p,i){return <TabBtn key={p.id} active={costProfileIdx===i} iconName={p.icon} label={p.name} onClick={function(){setCostProfileIdx(i)}} color={p.color}/>})}
        </div>
      </Cd>
      {costInRet&&ytr>0&&<>
        <Cd glow="orange" style={{textAlign:"center",padding:"32px 24px"}}>
          <div style={{fontSize:48,marginBottom:12}}><Icon name="lightning" size={48} weight="regular" color="#d97706" /></div>
          <div style={{fontSize:14,color:"#d97706",marginBottom:8}}>{costItemName||t('cost.thatPurchase')} {t('cost.purchaseForConnector')} <strong style={{color:"#f59e0b"}}>{fmt(Number(costItemPrice))}</strong></div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:"#0f172a",lineHeight:1.4,marginBottom:12}}>
            {t('cost.ifInvestedFull',{rate:pct(costInRet.prof.realReturn),years:ytr})}
          </div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:42,fontWeight:900,color:"#f59e0b",marginBottom:8}}>{fmt(costInRet.fv)}</div>
          <div style={{fontSize:15,color:"#d97706",fontWeight:600}}>{t('cost.thatsMoney',{mult:costInRet.multiplier.toFixed(1)})}</div>
          {costInRet.itemsCouldBuy>1&&<div style={{marginTop:16,padding:"14px 20px",borderRadius:12,background:"rgba(0,0,0,0.2)",fontSize:14,color:"#92400e",lineHeight:1.6}}>
            {t('cost.couldBuy',{n:costInRet.itemsCouldBuy,name:costItemName||t('cost.thatPurchase')})}
          </div>}
          <div style={{marginTop:12,padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",textAlign:"center"}}>{t('cost.allInTodayDollars',{profile:costInRet.prof.icon+" "+costInRet.prof.name,rate:pct(costInRet.prof.realReturn),years:ytr})}</div>
        </Cd>
        <Cd><ST>{t('cost.compare')}</ST>
          {hasPortfolio&&blendedPortReturn!=null&&(function(){var fv=fvL(Number(costItemPrice)||0,blendedPortReturn,ytr);var mult=fv/(Number(costItemPrice)||1);return(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:8,marginBottom:4,background:"rgba(232,121,249,0.06)"}}>
              <span style={{fontSize:12,color:"#e879f9",fontWeight:600}}><Icon name="sliders-h" size={12} weight="regular" /> {t('profiles.myPortfolio.name')}</span>
              <div><span style={{fontSize:13,fontWeight:700,color:"#e879f9"}}>{fmtC(fv)}</span><span style={{fontSize:10,color:"#64748b",marginLeft:6}}>({mult.toFixed(1)}×)</span></div>
            </div>)})()}
          {allProfiles.map(function(p){var fv=fvL(Number(costItemPrice)||0,p.realReturn,ytr);var mult=fv/(Number(costItemPrice)||1);return(
            <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:8,marginBottom:4,background:p.id===(allProfiles[costProfileIdx]||adjProfiles[4]).id?"rgba(245,158,11,0.06)":"transparent"}}>
              <span style={{fontSize:12,color:"#94a3b8"}}><Icon name={p.icon} size={14} weight="light"/> {p.name}</span>
              <div><span style={{fontSize:13,fontWeight:700,color:p.color}}>{fmtC(fv)}</span><span style={{fontSize:10,color:"#64748b",marginLeft:6}}>({mult.toFixed(1)}×)</span></div>
            </div>)})}
        </Cd>
      </>}
      <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
