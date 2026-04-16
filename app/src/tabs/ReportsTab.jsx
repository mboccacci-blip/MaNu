import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import { useTranslation } from '../i18n/index.jsx';
import AdvisorCTA from '../components/AdvisorCTA.jsx';
import { fmt, fmtC } from '../utils/formatters.js';

export default function ReportsTab({ tab, goTab, tier, hasData, mSav, savOpps, totalSavOpp, nAge, totalIncome, totExp, nMortPay, nCarPay, savRate, nEx, nRentalEq, nRentalNet, totalNetWorth, totalDebtAll, noDebts, hScore, magic, mD, nInc, nP2I, coupleMode, nVac, nRetAge, nYP, customInflation, INFL }) {
  const { t } = useTranslation();

  return (
    <div className="fi">
      {/* Convenceme */}
      <Cd glow="purple"><ST tip={t('reports.convinceTip')} sub={t('reports.convinceSub')}>{t('reports.convince')}</ST>
        {mSav>0&&savOpps.length>0?<>
          <div style={{padding:20,borderRadius:16,background:"linear-gradient(145deg,#0f1628,rgba(248,250,253,0.98))",border:"1px solid rgba(167,139,250,0.15)",marginBottom:16}}>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontFamily:"Outfit,sans-serif",fontSize:18,fontWeight:700,color:"#0f172a",marginBottom:4}}>{t('reports.whatIfSaved')}</div>
              <div style={{fontSize:12,color:"#64748b"}}>{t('reports.miniScenario')}</div>
            </div>
            {savOpps.slice(0,3).map(function(o){return(
              <div key={o.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,marginBottom:4,background:"rgba(0,0,0,0.15)"}}>
                <span style={{fontSize:12,color:"#64748b"}}>{t('reports.cutBy',{name:o.name,pct:o.cutPct})}</span>
                <span style={{fontSize:12,fontWeight:600,color:"#22c55e"}}>+{fmt(o.saved)}/mo</span>
              </div>)})}
            <div style={{textAlign:"center",marginTop:16,padding:14,borderRadius:12,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)"}}>
              <div style={{fontSize:11,color:"#64748b"}}>{t('reports.smallChanges')}</div>
              <div style={{fontFamily:"Outfit,sans-serif",fontSize:32,fontWeight:800,color:"#22c55e"}}>{fmtC(totalSavOpp.imp20)}</div>
              <div style={{fontSize:11,color:"#475569",marginTop:4}}>{t('reports.extraByAge',{age:nAge+20})}</div>
            </div>
          </div>
          <button onClick={function(){
            var text=t('reports.whatIfSaved')+"\n\n";
            savOpps.slice(0,3).forEach(function(o){text+="• "+t('reports.cutBy',{name:o.name,pct:o.cutPct})+": +"+fmt(o.saved)+"/mo\n"});
            text+="\n"+t('reports.smallChanges')+": "+fmtC(totalSavOpp.imp20)+" ("+t('reports.todayDollars6040')+")\n\n"+t('reports.generatedBy');
            navigator.clipboard.writeText(text).then(function(){alert(t('reports.copiedAlert'))})
          }} style={{width:"100%",background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"#fff",border:"none",padding:"14px 24px",borderRadius:14,fontSize:14,fontWeight:700,fontFamily:"Outfit,sans-serif",cursor:"pointer",boxShadow:"0 4px 20px rgba(167,139,250,0.25)"}}>
            {t('reports.copyToShare')}
          </button>
        </>:<div style={{textAlign:"center",padding:20,color:"#64748b"}}><div style={{fontSize:36,marginBottom:12}}><Icon name="chart-bar" size={36} weight="regular" color="#64748b" /></div><p>{t('reports.addDataFirst')}</p></div>}
      </Cd>

      {/* Financial Snapshot */}
      <Cd glow="blue"><ST tip={t('reports.snapshotTip')} sub={t('reports.snapshotSub')}>{t('reports.snapshot')}</ST>
        {hasData?<>
          <div style={{display:"grid",gap:10,marginBottom:16}}>
            {(nRentalNet>0?[
              {l:t('reports.workIncome'),v:fmt(nInc+(coupleMode?nP2I:0)),c:"#0f172a"},
              {l:t('reports.rentalFull'),v:fmt(nRentalNet),c:"#0f172a"},
              {l:t('reports.totalMonthlyIncome'),v:fmt(totalIncome),c:"#22c55e"}
            ]:[{l:t('reports.monthlyIncomeLabel'),v:fmt(totalIncome),c:"#0f172a"}])
            .concat([{l:nVac>0?t('reports.expensesInclVacation'):t('reports.monthlyExpenses'),v:fmt(totExp),c:"#f87171"}])
            .concat(nMortPay>0?[{l:t('reports.mortgagePI'),v:fmt(nMortPay),c:"#f87171"}]:[])
            .concat(nCarPay>0?[{l:t('reports.carLoan'),v:fmt(nCarPay),c:"#f87171"}]:[])
            .concat([
              {l:t('reports.monthlySavings'),v:fmt(mSav),c:mSav>0?"#22c55e":"#ef4444"},
              {l:t('reports.savingsRate'),v:savRate.toFixed(1)+"%",c:savRate>=20?"#22c55e":"#eab308"},
              {l:t('reports.investSavings'),v:fmt(nEx),c:"#60a5fa"}
            ])
            .concat(nRentalEq>0?[{l:t('reports.rentalEquityFull'),v:fmt(nRentalEq),c:"#3b82f6"},{l:t('reports.totalAssets'),v:fmt(totalNetWorth),c:"#60a5fa"}]:[])
            .concat([
              {l:t('reports.totalDebt'),v:noDebts?"$0":fmt(totalDebtAll),c:noDebts?"#22c55e":"#f87171"},
              {l:t('reports.healthScore'),v:hScore.s+"/100",c:hScore.s>=70?"#22c55e":hScore.s>=40?"#eab308":"#ef4444"}
            ]).concat(magic.real>0?[{l:t('reports.magicNumber'),v:fmt(magic.real),c:"#60a5fa"},{l:t('reports.progress'),v:mD.p.toFixed(1)+"%",c:mD.gc}]:[]).map(function(r){return(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"rgba(0,0,0,0.1)"}}>
                <span style={{fontSize:12,color:"#64748b"}}>{r.l}</span>
                <span style={{fontSize:13,fontWeight:700,color:r.c}}>{r.v}</span>
              </div>)})}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[{l:t('reports.savingsRate'),v:((mSav+totalSavOpp.mo)/totalIncome*100).toFixed(0)+"%",c:"#16a34a"},
              {l:t('reports.healthScore'),v:hScore.s+"/100",c:hScore.s>=70?"#22c55e":hScore.s>=40?"#eab308":"#ef4444"}
            ].concat(magic.real>0?[{l:t('reports.magicNumber'),v:fmt(magic.real),c:"#60a5fa"},{l:t('reports.progress'),v:mD.p.toFixed(1)+"%",c:mD.gc}]:[]).map(function(r){return(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"rgba(0,0,0,0.15)"}}>
                <span style={{fontSize:12,color:"#64748b"}}>{r.l}</span>
                <span style={{fontSize:13,fontWeight:700,color:r.c}}>{r.v}</span>
              </div>)})}
          </div>
          {nRentalEq>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:12,color:"#3b82f6",lineHeight:1.6,marginBottom:16}}>
            <Icon name="ruler" size={12} weight="regular" /> <strong>{t('reports.rentalEquityNote',{amt:fmt(nRentalEq)})}</strong>
            {nAge>0&&nRetAge>0&&nYP>0?" "+t('reports.rentalEquityFuture',{age:nRetAge+nYP,rate:customInflation.toFixed(1),amt:fmt(Math.round(nRentalEq*Math.pow(1+INFL,nRetAge+nYP-nAge)))}):""}
          </div>}
          <button onClick={function(){window.print()}} style={{width:"100%",background:"linear-gradient(135deg,#3b82f6,#2563eb)",color:"#fff",border:"none",padding:"14px 24px",borderRadius:14,fontSize:14,fontWeight:700,fontFamily:"Outfit,sans-serif",cursor:"pointer",boxShadow:"0 4px 20px rgba(59,130,246,0.25)"}}>
            {t('reports.print')}
          </button>
        </>:<div style={{textAlign:"center",padding:20,color:"#64748b"}}><p>{t('reports.completeProfile')}</p></div>}
      </Cd>
      <AdvisorCTA tab={tab}/>
      <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
