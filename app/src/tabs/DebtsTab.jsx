import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import NI from '../components/NumberInput.jsx';
import Toggle from '../components/Toggle.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { fmt, pct } from '../utils/formatters.js';

export default function DebtsTab({ tab, goTab, tier, lang, ownsHome, nMortPay, noMortgage, setNoMortgage, mortgageYearsLeft, setMortgageYearsLeft, mortgageBalance, setMortgageBalance, mortgageRate, setMortgageRate, nMortYrs, nAge, nEx, mortBal, noDebts, setNoDebts, noCarLoan, setNoCarLoan, carBalance, setCarBalance, carYearsLeft, setCarYearsLeft, carRate, setCarRate, carPayment, setCarPayment, debts, aD, uD, rD, debtAn, probDebts, totalMonthlyObligations, emergencyMonths, PROFILES }) {
  const { t } = useTranslation();
  return (
    <div className="fi">
  {/* Mortgage — always shows if ownsHome, independent of noDebts */}
  {ownsHome&&<Cd>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:17,fontWeight:600,color:"#0f172a"}}>{t('debts.mortgageDetails')}</h3>
    </div>
    {nMortPay>0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.1)",fontSize:12,color:"#93c5fd",marginBottom:12}}>
      {t('debts.monthlyPI')}: <strong>{fmt(nMortPay)}</strong> <span style={{color:"#475569"}}>{t('debts.fromIncomeTab')}</span>
    </div>}
    {nMortPay===0&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.1)",fontSize:12,color:"#92400e",marginBottom:12}}>
      {t('debts.enterMortgage')}
    </div>}
    <Toggle value={noMortgage} onChange={setNoMortgage} label={noMortgage?t('debts.paidOff'):t('debts.stillHave')}/>
    {!noMortgage&&<>
      <NI label={t('debts.yearsLeft')} value={mortgageYearsLeft} onChange={setMortgageYearsLeft} prefix="" placeholder="" style={{marginBottom:8}} tip={t('debts.yearsLeftTip')}/>
      <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#93c5fd",lineHeight:1.5,marginBottom:12}}>
        <Icon name="ruler" size={12} weight="regular" /> {t('debts.projectionsExplain',{payment:fmt(nMortPay),yearsInfo:nMortYrs>0?" ("+nMortYrs+")":"",ageInfo:nMortYrs>0?" "+(lang==="en"?"at age ":"a los ")+(nAge+nMortYrs):""})}
      </div>
      <div style={{fontSize:13,fontWeight:500,color:"#64748b",marginBottom:8}}>{t('debts.optionalDetails')}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <NI label={t('debts.remainingBalance')} value={mortgageBalance} onChange={setMortgageBalance} style={{marginBottom:0}}/>
        <NI label={t('debts.fixedRate')} value={mortgageRate} onChange={setMortgageRate} prefix="" placeholder="" style={{marginBottom:0}}/>
      </div>
      {(Number(mortgageRate)||0)>0&&(Number(mortgageRate)||0)<4&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#86efac",lineHeight:1.6,marginTop:8}}>
        <Icon name="check-circle" size={13} weight="regular" /> {t('debts.goodRate',{rate:mortgageRate})}
      </div>}
      {(Number(mortgageRate)||0)>=4&&(Number(mortgageRate)||0)<6&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.1)",fontSize:12,color:"#92400e",lineHeight:1.6,marginTop:8}}>
        <Icon name="chart-bar" size={13} weight="regular" /> {t('debts.moderateRate',{rate:mortgageRate})}
      </div>}
      {(Number(mortgageRate)||0)>=6&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.1)",fontSize:12,color:"#fca5a5",lineHeight:1.6,marginTop:8}}>
        <Icon name="fire" size={13} weight="regular" /> <strong>{t('debts.highRate',{rate:mortgageRate})}</strong>
        {nEx>0&&mortBal>0?" "+t('debts.highRateAdvice',{savings:fmt(nEx),rate:mortgageRate}):""}
        {(Number(mortgageRate)||0)>=8?" "+t('debts.veryHighRate',{rate:mortgageRate}):""}
      </div>}
    </>}
  </Cd>}

  {/* Other debts */}
  <Cd><ST tip={t('debts.debtPlaceholder')} sub={ownsHome?t('debts.otherDebtsSub'):t('debts.yourDebts')}>{t('debts.otherDebts')}</ST>
    <Toggle value={noDebts} onChange={setNoDebts} label={noDebts?t('debts.noOtherDebts'):t('debts.haveOtherDebts')} sub={noDebts?null:"Toggle if no car loan, credit cards, etc."}/>
  </Cd>

  {!noDebts&&<>

    {/* Car Loan */}
    <Cd>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:17,fontWeight:600,color:"#0f172a"}}>{t('debts.carLoan')}</h3>
      </div>
      <Toggle value={noCarLoan} onChange={setNoCarLoan} label={noCarLoan?t('debts.noCarLoan'):t('debts.haveCarLoan')}/>
      {!noCarLoan&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <NI label={t('debts.remainingBalance')} value={carBalance} onChange={setCarBalance} style={{marginBottom:0}}/>
          <NI label={t('debts.yearsLeft')} value={carYearsLeft} onChange={setCarYearsLeft} prefix="" placeholder="" style={{marginBottom:0}} tip={t('debts.yearsLeftTip')}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <NI label={t('debts.rate')} value={carRate} onChange={setCarRate} prefix="" placeholder="" style={{marginBottom:0}}/>
          <NI label={t('debts.monthlyPayment')} value={carPayment} onChange={setCarPayment} style={{marginBottom:0}}/>
        </div>
        <div style={{fontSize:10,color:"#475569",marginTop:8}}>{t('debts.carLoanEndsNote')}</div>
      </>}
    </Cd>

    {/* Other Debts */}
    <Cd>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:17,fontWeight:600,color:"#0f172a"}}>{t('debts.otherDebts')}</h3>
        {debts.length<8&&<button className="bs" onClick={aD}>{t('debts.addDebt')}</button>}
      </div>
      {(debts||[]).map(function(d){return(<div key={d.id} style={{padding:14,background:"rgba(0,0,0,0.15)",borderRadius:14,marginBottom:10,border:"1px solid rgba(15,23,42,0.06)"}}>
        <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
          <input type="text" value={d.name} onChange={function(e){uD(d.id,"name",e.target.value)}} placeholder={t('debts.debtPlaceholder')} style={{flex:1,background:"rgba(248,250,253,0.98)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,color:"#0f172a",fontSize:13,padding:"10px 12px",fontFamily:"Outfit,sans-serif",outline:"none"}}/>
          {debts.length>1&&<button onClick={function(){rD(d.id)}} style={{width:32,height:32,borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",color:"#ef4444",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <NI label={t('debts.balance')} value={d.balance} onChange={function(v){uD(d.id,"balance",v)}} style={{marginBottom:0}}/>
          <NI label={t('debts.rate')} value={d.rate} onChange={function(v){uD(d.id,"rate",v)}} prefix="" placeholder="" style={{marginBottom:0}}/>
          <NI label={t('debts.minPayment')} value={d.minPayment} onChange={function(v){uD(d.id,"minPayment",v)}} style={{marginBottom:0}}/>
        </div></div>)})}
    </Cd>
  </>}

  {/* Debt Analysis */}
  {!noDebts&&debtAn.length>0&&<Cd glow={probDebts.length>0?"red":"green"}>
    <div style={{fontSize:14,fontWeight:600,color:"#0f172a",marginBottom:14}}>{t('debts.debtVsInvest')}</div>
    {(debtAn||[]).map(function(d,i){return(<div key={d.id} style={{padding:14,borderRadius:12,marginBottom:10,background:d.sev==="critical"?"rgba(239,68,68,0.06)":d.sev==="high"?"rgba(245,158,11,0.06)":"rgba(255,255,255,0.02)",border:d.sev==="critical"?"1px solid rgba(239,68,68,0.1)":d.sev==="high"?"1px solid rgba(245,158,11,0.1)":"1px solid rgba(15,23,42,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:14,fontWeight:600,color:"#0f172a"}}>{d.name||"Unnamed"}</span>
        <div><span style={{fontWeight:700,fontSize:14,color:d.sev==="low"?"#94a3b8":"#f87171"}}>{fmt(d.bal)}</span><span style={{fontSize:12,marginLeft:6,color:d.sev==="low"?"#64748b":"#ef4444"}}>@ {d.rate}%</span></div></div>
      <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>
        {d.sev==="critical"?<span><Icon name="siren" size={13} weight="regular" /> {t('debts.debtCritical',{rate:d.rate})}</span>
        :d.sev==="high"?<span><Icon name="warning" size={13} weight="regular" /> {t('debts.debtHigh',{rate:d.rate,strategies:PROFILES.filter(function(p){return p.nomReturn>=d.rate/100}).map(function(p){return p.name}).join(", ")})}</span>
        :d.sev==="moderate"?<span><Icon name="chart-bar" size={13} weight="regular" /> {t('debts.debtModerate',{rate:d.rate})}</span>
        :<span><Icon name="check-circle" size={13} weight="regular" /> {t('debts.debtLow',{rate:d.rate})}</span>}
      </div></div>)})}
    {probDebts.length===0&&debtAn.length>0&&<div style={{fontSize:13,color:"#86efac",marginTop:4}}>{t('debts.allDebtsBelowReturns')}</div>}
  </Cd>}

  {/* Emergency Fund */}
  {totalMonthlyObligations>0&&<Cd>
    <div style={{fontSize:14,fontWeight:600,color:"#60a5fa",marginBottom:10}}>{t('debts.emergencyFundTitle')}</div>
    {nEx>0?<>
      <div style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:emergencyMonths>=12?"#22c55e":emergencyMonths>=6?"#eab308":"#ef4444",marginBottom:6}}>
        {t('debts.savingsCover',{months:emergencyMonths>=12?Math.round(emergencyMonths):emergencyMonths.toFixed(1)})}
      </div>
      <div style={{height:8,borderRadius:4,background:"rgba(255,255,255,0.05)",overflow:"hidden",marginBottom:8}}>
        <div style={{height:"100%",borderRadius:4,width:Math.min(emergencyMonths/24*100,100)+"%",background:emergencyMonths>=12?"#22c55e":emergencyMonths>=6?"#eab308":"#ef4444",transition:"width 0.5s"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#475569",marginBottom:8}}><span>0</span><span>6 {t('common.monthAbbr')}</span><span>12 {t('common.monthAbbr')}</span><span>24 {t('common.monthAbbr')}</span></div>
      <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>
        {emergencyMonths>=24?t('debts.efExcellent')
        :emergencyMonths>=12?t('debts.efSolid')
        :emergencyMonths>=6?t('debts.efDecent')
        :emergencyMonths>=3?t('debts.efMinimum',{target:fmt(totalMonthlyObligations*12)})
        :t('debts.efCritical',{target:fmt(totalMonthlyObligations*6)})}
      </div>
      <div style={{fontSize:10,color:"#475569",marginTop:6}}>{t('debts.efBasedOn',{amt:fmt(totalMonthlyObligations)})}</div>
    </>:<div style={{fontSize:12,color:"#92400e"}}><Icon name="warning" size={13} weight="regular" /> {t('debts.enterSavingsEF')}</div>}
  </Cd>}
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
