import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import NI from '../components/NumberInput.jsx';
import Slider from '../components/Slider.jsx';
import Toggle from '../components/Toggle.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { fmt } from '../utils/formatters.js';

export default function AssumptionsTab({ tab, goTab, tier, nAge, nRetAge, nYP, nEx, coupleMode, setCoupleMode, hasRental, setHasRental, rentalEquity, setRentalEquity, rentalNetIncome, setRentalNetIncome, nRentalEq, nRentalNet, totalNetWorth, INFL, customInflation, setCustomInflation }) {
  const { t } = useTranslation();

  return (
    <div className="fi">
      <Cd><ST sub={t('you.subtitle')}>{t('you.title')}</ST>
        {nAge>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {[{l:t('you.age'),v:nAge},{l:t('you.retireAt'),v:nRetAge},{l:t('you.yearsInRetirement'),v:nYP},{l:t('you.savings'),v:fmt(nEx)}].map(function(b){return(
            <div key={b.l} style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6"}}>{b.l}: <strong>{b.v}</strong></div>)})}
          <div style={{padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(15,23,42,0.08)",fontSize:11,color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("achieve")}}>{t('you.editInMN')}</div>
        </div>}
        <Toggle value={coupleMode} onChange={setCoupleMode} label={t('you.coupleMode')} sub={t('you.coupleSub')}/>
        <Toggle value={hasRental} onChange={setHasRental} label={t('you.rentalToggle')} sub={t('you.rentalSub')}/>
        {hasRental&&<>
          <NI label={t('you.rentalEquity')} value={rentalEquity} onChange={setRentalEquity} tip={t('you.rentalEquityTip')}/>
          <NI label={t('you.rentalIncome')} value={rentalNetIncome} onChange={setRentalNetIncome} tip={t('you.rentalIncomeTip')}/>
          {nRentalEq>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",lineHeight:1.5,marginBottom:12}}>
            <Icon name="ruler" size={13} weight="regular" /> {t('you.rentalEquityExplain',{equity:fmt(nRentalEq),totalAssets:fmt(totalNetWorth),rentalIncome:fmt(nRentalNet)})}
            {nAge>0&&nRetAge>0&&nYP>0&&<span> {t('you.rentalEquityFuture',{age:nRetAge+nYP,amt:fmt(Math.round(nRentalEq*Math.pow(1+INFL,nRetAge+nYP-nAge)))})}</span>}
          </div>}
        </>}
      </Cd>
      <Cd><ST sub={t('you.inflationSub')}>{t('you.inflationTitle')}</ST>
        <Slider label={t('you.inflationRate')} value={customInflation} onChange={setCustomInflation} min={0} max={8} step={0.1} format={function(v){return v.toFixed(1)+"%"}} color="#f59e0b"/>
        {customInflation!==2.5&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#92400e",marginTop:8}}>
          {t('you.customInflation',{rate:customInflation.toFixed(1)})}
        </div>}
      </Cd>
      <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
