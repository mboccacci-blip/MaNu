import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import NI from '../components/NumberInput.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import Tip from '../components/Tip.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { fmt } from '../utils/formatters.js';

export default function SituationTab({ tab, goTab, tier, lang, coupleMode, hasRental, monthlyIncome, setMonthlyIncome, partner2Income, setPartner2Income, vacationAnnual, setVacationAnnual, nEx, nRentalEq, totalNetWorth, ownsHome, setOwnsHome, mortgagePayment, setMortgagePayment, nMortPay, expenses, aE, uE, rE, nVac, mSav, totalIncome, totalMonthlyObligations, totExp, nInc, nP2I, nRentalNet, nCarPay, debtEvents }) {
  const { t } = useTranslation();
  return (
    <div className="fi">
  <Cd><ST sub={t('income.subtitle')}>{t('income.title')}</ST>
    <NI label={coupleMode?t('income.netIncomeCouple'):t('income.netIncome')} value={monthlyIncome} onChange={setMonthlyIncome} placeholder="" tip={t('income.netIncomeTip')+(hasRental?t('income.noRentalTip'):"")}/>
    {coupleMode&&<NI label={t('income.partnerIncome')} value={partner2Income} onChange={setPartner2Income} placeholder="" tip={t('income.partnerTip')+(hasRental?t('income.noRentalTip'):"")}/>
    }
    <NI label={t('income.vacationLabel')} value={vacationAnnual} onChange={setVacationAnnual} placeholder="" tip={t('income.vacationTip')}/>
    {(nEx>0||nRentalEq>0)&&<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:12,color:"#3b82f6"}}>
      <Icon name="currency-dollar" size={13} weight="regular" /> {t('income.investSavings')}: <strong>{fmt(nEx)}</strong>{nRentalEq>0?" + rental equity: "+fmt(nRentalEq)+" = total assets: "+fmt(totalNetWorth):""} <span style={{color:"#475569"}}>{t('income.setInYouTab')}</span>
    </div>}
  </Cd>
  <Cd>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:17,fontWeight:600,color:"#0f172a",display:"flex",alignItems:"center"}}>{t('income.monthlyExpenses')}<Tip text={t('income.expensesTip')}/></h3>
      {expenses.length<15&&<button className="bs" onClick={aE}>{t('income.addBtn')}</button>}
    </div>
    {/* Own vs Rent toggle */}
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      <button onClick={function(){setOwnsHome(false)}} style={{flex:1,padding:"10px 14px",borderRadius:10,border:!ownsHome?"1px solid rgba(96,165,250,0.3)":"1px solid rgba(15,23,42,0.08)",background:!ownsHome?"rgba(96,165,250,0.08)":"rgba(0,0,0,0.1)",color:!ownsHome?"#3b82f6":"#64748b",fontSize:13,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer",textAlign:"center"}}>{t('income.iRent')}</button>
      <button onClick={function(){setOwnsHome(true)}} style={{flex:1,padding:"10px 14px",borderRadius:10,border:ownsHome?"1px solid rgba(34,197,94,0.3)":"1px solid rgba(15,23,42,0.08)",background:ownsHome?"rgba(34,197,94,0.08)":"rgba(0,0,0,0.1)",color:ownsHome?"#16a34a":"#64748b",fontSize:13,fontWeight:600,fontFamily:"Outfit,sans-serif",cursor:"pointer",textAlign:"center"}}>{t('income.iOwn')}</button>
    </div>
    {ownsHome&&<div style={{padding:"12px 14px",borderRadius:12,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.1)",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:13,fontWeight:600,color:"#3b82f6"}}>{t('income.mortgagePI')}</span>
        <Tip text={t('income.mortgageTip')}/>
      </div>
      <div style={{display:"flex",alignItems:"center",background:"rgba(248,250,253,0.98)",borderRadius:12,border:"1px solid rgba(96,165,250,0.15)",padding:"0 16px"}}>
        <span style={{color:"#64748b",fontSize:15,fontWeight:600,marginRight:4}}>$</span>
        <input type="text" inputMode="numeric" value={(mortgagePayment&&!isNaN(Number(mortgagePayment))&&Number(mortgagePayment)>=1000)?Number(mortgagePayment).toLocaleString("en-US"):mortgagePayment} onChange={function(e){setMortgagePayment(e.target.value.replace(/,/g,"").replace(/[^0-9]/g,""))}} placeholder="" style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#3b82f6",fontSize:17,fontWeight:600,padding:"13px 0",fontFamily:"Outfit,sans-serif",width:"100%"}}/>
        <span style={{color:"#475569",fontSize:11}}>/mo</span>
      </div>
      {nMortPay>0&&<div style={{fontSize:10,color:"#475569",marginTop:6}}>{t('income.completeMortgage')}</div>}
    </div>}
    {(function(){const EXP_KEY={"Housing / Rent":"housingRent","Food & Groceries":"foodGroceries","Transportation":"transportation","Utilities & Bills":"utilitiesBills","Dining Out":"diningOut","Property Tax, Insurance & HOA":"propTaxInsHoa"};function tName(n){const k=EXP_KEY[n];return k?t('expenses.'+k):n}return (expenses||[]).map(function(exp){const displayName=(exp.id===1&&exp.mortgageAlt)?(ownsHome?tName(exp.mortgageAlt):tName("Housing / Rent")):tName(exp.name);return(<div key={exp.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
      <input type="text" value={displayName} onChange={function(e){uE(exp.id,"name",e.target.value)}} placeholder={t('income.category')} style={{flex:1,minWidth:0,background:"rgba(248,250,253,0.98)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,color:"#0f172a",fontSize:13,padding:"11px 12px",fontFamily:"Outfit,sans-serif",outline:"none"}}/>
      <div style={{display:"flex",alignItems:"center",background:"rgba(248,250,253,0.98)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"0 12px",width:120,flexShrink:0}}><span style={{color:"#64748b",fontSize:13,fontWeight:600,marginRight:4}}>$</span>
        <input type="text" inputMode="numeric" value={(exp.amount&&!isNaN(Number(exp.amount))&&Number(exp.amount)>=1000)?Number(exp.amount).toLocaleString("en-US"):exp.amount} onChange={function(e){uE(exp.id,"amount",e.target.value.replace(/,/g,"").replace(/[^0-9]/g,""))}} placeholder="" style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#0f172a",fontSize:15,fontWeight:600,padding:"11px 0",fontFamily:"Outfit,sans-serif",width:"100%"}}/></div>
      <button onClick={function(){uE(exp.id,"discretionary",!exp.discretionary)}} style={{padding:"6px 8px",borderRadius:8,fontSize:10,fontWeight:600,border:"none",cursor:"pointer",flexShrink:0,background:exp.discretionary!==false?"rgba(245,158,11,0.1)":"rgba(96,165,250,0.1)",color:exp.discretionary!==false?"#f59e0b":"#60a5fa",display:"flex",alignItems:"center"}}>{exp.discretionary!==false?<Icon name="scissors" size={12} weight="regular" />:<Icon name="push-pin" size={12} weight="regular" />}</button>
      {expenses.length>1&&<button onClick={function(){rE(exp.id)}} style={{width:34,height:34,borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",color:"#ef4444",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>}
    </div>)})})()}
    <div style={{display:"flex",gap:12,marginTop:8,fontSize:11,color:"#475569"}}><span style={{display:"inline-flex",alignItems:"center",gap:3}}><Icon name="scissors" size={11} weight="regular" /> {t('income.discretionary')}</span><span style={{display:"inline-flex",alignItems:"center",gap:3}}><Icon name="push-pin" size={11} weight="regular" /> {t('income.essential')}</span></div>
    {(function(){var filled=expenses.filter(function(e){return e.amount!==""}).length;return filled<5?
      <div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#92400e",lineHeight:1.6}}>
        <Icon name="warning" size={13} weight="regular" /> {t('income.fillWarning',{count:filled})}
      </div>
      :<div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#16a34a"}}>
        <Icon name="check-circle" size={13} weight="regular" /> {t('income.fillComplete',{count:filled})}
      </div>})()}
  </Cd>
  {nVac>0&&<Cd style={{padding:16}}><div style={{fontSize:12,color:"#64748b"}}><Icon name="calendar" size={12} weight="regular" /> {t('common.vacation')}: <strong style={{color:"#0f172a"}}>{fmt(Number(vacationAnnual))}{t('app.perYear')}</strong> = <strong style={{color:"#f87171"}}>{fmt(nVac)}{t('app.perMonth')}</strong> {t('common.addedToExpenses')}</div></Cd>}
  <Cd glow={mSav>0?"green":mSav<0?"red":null}>
    <h3 style={{fontFamily:"Outfit,sans-serif",fontSize:17,fontWeight:600,color:"#0f172a",marginBottom:14}}>{t('income.monthlySummary')}</h3>
    {totalIncome>0&&<div style={{height:26,borderRadius:8,overflow:"hidden",background:"rgba(15,23,42,0.06)",display:"flex",marginBottom:14}}>
      {totalMonthlyObligations>0&&<div style={{width:Math.min((totalMonthlyObligations/totalIncome)*100,100)+"%",background:"linear-gradient(90deg,#ef4444,#f87171)"}}/>}
      {mSav>0&&<div style={{width:(mSav/totalIncome)*100+"%",background:"linear-gradient(90deg,#22c55e,#4ade80)"}}/>}
    </div>}
    <div style={{display:"grid",gap:8,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#64748b"}}>{t('income.totalIncome')}{coupleMode||nRentalNet>0?" (total)":""}</span><span style={{fontSize:15,fontWeight:700,color:"#0f172a"}}>{fmt(totalIncome)}</span></div>
      {(coupleMode||nRentalNet>0)&&<div style={{paddingLeft:12,display:"grid",gap:4}}>
        {coupleMode&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569"}}><span>{t('common.you')}: {fmt(nInc)}</span><span>{t('common.partner')}: {fmt(nP2I)}</span></div>}
        {nRentalNet>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569"}}><span><Icon name="house-line" size={11} weight="regular" /> {t('common.netRentalIncome')}</span><span>{fmt(nRentalNet)}</span></div>}
      </div>}
      <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#64748b"}}>{t('income.totalExpenses')}{nVac>0?" ("+t('common.incVacation')+")":""}</span><span style={{fontSize:15,fontWeight:600,color:"#f87171"}}>−{fmt(totExp)}</span></div>
      {nMortPay>0&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#64748b"}}>{t('income.mortgagePI')}</span><span style={{fontSize:15,fontWeight:600,color:"#f87171"}}>−{fmt(nMortPay)}</span></div>}
      {nCarPay>0&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#64748b"}}>{t('debts.carLoan')}</span><span style={{fontSize:15,fontWeight:600,color:"#f87171"}}>−{fmt(nCarPay)}</span></div>}
      <div style={{borderTop:"1px solid rgba(15,23,42,0.08)",paddingTop:8,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:14,fontWeight:600,color:"#0f172a"}}>{t('income.monthlySavingsLabel')}</span><span style={{fontSize:19,fontWeight:800,color:mSav>0?"#22c55e":mSav<0?"#ef4444":"#64748b"}}>{fmt(mSav)}</span></div>
    </div>
    {mSav<0&&nEx>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.1)",fontSize:12,color:"#ef4444",lineHeight:1.6,marginBottom:12}}>
      <Icon name="warning" size={13} weight="regular" /> {t('income.negSavingsWarning',{amount:fmt(Math.abs(mSav)),savings:fmt(nEx),yearly:fmt(Math.abs(mSav)*12)})}
    </div>}
    {debtEvents.length>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#16a34a",lineHeight:1.6}}>
      <Icon name="chart-line-up" size={12} weight="regular" /> {t('income.debtEndBoost')}{(debtEvents||[]).map(function(ev){return " "+ev.name+" "+(lang==="en"?"ends in ":"termina en ")+ev.endsAtYear+(lang==="en"?" years":" años")+" (+"+fmt(ev.monthlyAmount)+t('app.perMonth')+")"}).join(",")}
    </div>}
  </Cd>
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
