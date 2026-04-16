import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import TabBtn from '../components/TabButton.jsx';
import MultiLineChart from '../components/MultiLineChart.jsx';
import ANum from '../components/AnimatedNumber.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { fmt, fmtC, pct } from '../utils/formatters.js';

export default function RetirementTab({ tab, goTab, tier, lang, nAge, nRetAge, nYP, nEx, nDes, nSS, nLegacy, ytr, mSav, magic, mD, desiredAfterSS, nMortPay, nMortYrs, retProfLabel, retProfReturn, retProfileIdx, setRetProfileIdx, adjProfiles, allProfiles, hasPortfolio, monthlyNeeded, ybYData, chartProfileIdx, setChartProfileIdx, chartRetireIdx, setChartRetireIdx, chartAccumReturn, chartRetireReturn, debtEvents, magicRevealed, blendedPortReturn, TAX, assetTax, INFL }) {
  const { t } = useTranslation();
  return (
    <div className="fi">
  <Cd><ST sub={t('retirement.sub')}>{t('retirement.title')}</ST>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
      {[{l:t('achieve.yourAge'),v:nAge},{l:t('achieve.retAge'),v:nRetAge},{l:t('achieve.yearsInRet'),v:nYP},{l:t('achieve.yearsToGo',{n:ytr}),v:""},{l:t('achieve.desiredIncome'),v:fmt(nDes)+"/mo"},{l:t('achieve.currentSavings'),v:fmt(nEx)}].filter(function(b){return b.v!==""}).map(function(b){return(
        <div key={b.l} style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6"}}>{b.l}: <strong>{b.v}</strong></div>)})}
      {nSS>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#16a34a"}}>{t('retirement.retIncome')} {fmt(nSS)}/mo</div>}
      <div style={{padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(15,23,42,0.08)",fontSize:11,color:"#60a5fa",cursor:"pointer"}} onClick={function(){goTab("achieve")}}>{t('retirement.editInMN')}</div>
    </div>
    {nMortPay>0&&nMortYrs>ytr&&ytr>0&&<div style={{padding:"12px 14px",borderRadius:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",fontSize:12,color:"#92400e",lineHeight:1.6,marginBottom:16}}>
      <Icon name="warning" size={14} weight="regular" /> <strong>{t('retirement.mortgageExtends', {n: nMortYrs-ytr})}</strong> {t('common.makeSureDes')} <strong>{fmt(nMortPay)}/mo</strong>.
    </div>}
    {nMortPay>0&&nMortYrs>0&&nMortYrs<=ytr&&ytr>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#16a34a",lineHeight:1.5,marginBottom:16}}>
      <Icon name="check-circle" size={13} weight="regular" /> {t('retirement.mortgagePaidOff', {n: ytr-nMortYrs})}
    </div>}
    {nSS>0&&nDes>0&&desiredAfterSS>0&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.1)",fontSize:12,color:"#16a34a",lineHeight:1.5,marginBottom:16}}>
      <Icon name="check-circle" size={13} weight="regular" /> {t('retirement.retIncomeCover', {amt: fmt(nSS)})} <strong>{pct(nSS/nDes)}</strong> {t('retirement.ofMonthlyNeeds')} {t('retirement.onlyNeedFund')} <strong>{fmt(desiredAfterSS)}/mo</strong> {t('retirement.fromSavings')}.
    </div>}
  </Cd>

  {nDes>0&&nYP>0&&ytr>0&&desiredAfterSS===0&&<Cd glow="green" style={{textAlign:"center",padding:"32px 24px"}}>
    <div style={{fontSize:48,marginBottom:12}}><Icon name="confetti" size={48} weight="regular" color="#22c55e" /></div>
    <div style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:"#22c55e",marginBottom:8}}>{t('retirement.retiCovered')}</div>
    <p style={{fontSize:13,color:"#64748b",lineHeight:1.6,maxWidth:440,margin:"0 auto"}}>
      {t('retirement.retIncomeCover', {amt: fmt(nSS)})} {t('retirement.meetsExceeds')} {fmt(nDes)}/mo.
      {t('retirement.savingsOf')} <strong style={{color:"#0f172a"}}>{fmt(nEx)}</strong> {t('retirement.addWealth')}.
    </p>
  </Cd>}

  {nDes>0&&nYP>0&&ytr>0&&magic.real>0&&<>
    <Cd glow="blue" style={{textAlign:"center",padding:"40px 24px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"relative"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#60a5fa",textTransform:"uppercase",letterSpacing:3,marginBottom:10}}>{t('retirement.yourMN')}</div>
        <div style={{fontFamily:"Outfit,sans-serif",fontSize:50,fontWeight:900,color:"#60a5fa",lineHeight:1.1,marginBottom:6,textShadow:"0 0 40px rgba(96,165,250,0.3),0 0 80px rgba(96,165,250,0.15)"}}>{magicRevealed?<ANum value={Math.round(magic.real)} dur={2200}/>:"$0"}</div>
        <div style={{fontSize:13,color:"#3b82f6"}}>{t('retirement.adjustedForInflation')}</div>
        <div style={{marginTop:12,padding:"10px 16px",borderRadius:10,background:"rgba(0,0,0,0.2)",fontSize:12,color:"#64748b",lineHeight:1.6}}>
          {t('retirement.neededByAge', {age: nRetAge})} {t('retirement.investedAtRate')}{TAX>0?" ("+t('retirement.netOfTax', {tax: assetTax.toFixed(1)})+")":""}, {t('retirement.itFundsAmt', {amt: fmt(desiredAfterSS)})} {t('retirement.forYrs', {yrs: nYP})}{nSS>0?" ("+t('retirement.afterSSIncome', {amt: fmt(nSS)})+")":""}{nLegacy>0?" "+t('retirement.leavingAmtLegacy', {amt: fmt(nLegacy)}):""}, {t('retirement.reachingAmtAtAge', {amt: nLegacy>0?fmt(nLegacy):"$0", age: nRetAge+nYP})}.
        </div>
        {/* Withdrawal rate selector */}
        <div style={{marginTop:14,marginBottom:14}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>{t('retirement.stratDuring')}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
            {hasPortfolio&&<TabBtn active={retProfileIdx===-1} label={t('profiles.myPortfolio.name')} onClick={function(){setRetProfileIdx(-1)}} color="#e879f9"/>}
            {adjProfiles.map(function(p,i){return <TabBtn key={p.id} active={retProfileIdx===i} iconName={p.icon} label={p.name} onClick={function(){setRetProfileIdx(i)}} color={p.color}/>})}
          </div>
        </div>
        <div style={{marginTop:24,padding:18,borderRadius:14,background:"rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.05)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,textAlign:"center",marginBottom:14}}>
            <div><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{t('retirement.youHave')}</div><div style={{fontSize:19,fontWeight:700,color:"#0f172a"}}>{fmt(nEx)}</div></div>
            <div><div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{mD.p>=100?t('retirement.surplus'):t('retirement.youStillNeed')}</div>
              <div style={{fontSize:19,fontWeight:700,color:mD.gc}}>{mD.p>=100?"+"+fmt(mD.sur):fmt(mD.gap)}</div></div>
          </div>
          <div style={{height:10,borderRadius:5,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:5,width:Math.min(mD.p,100)+"%",background:mD.bc,transition:"width 1s"}}/></div>
          <div style={{fontSize:11,marginTop:6,color:mD.gc,fontWeight:600}}>{mD.p>=100?mD.p.toFixed(0)+"% — "+t('retirement.aheadTarget'):mD.p>=60?mD.p.toFixed(1)+"% — "+t('retirement.gettingClose'):mD.p.toFixed(1)+"% — "+t('retirement.letsExplore')}</div>
        </div>
      </div>
    </Cd>

    {/* Conservative Magic Number */}
    {magic.conservative>0&&<Cd style={{padding:"20px 24px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,textAlign:"center"}}>
        <div>
          <div style={{fontSize:10,color:"#60a5fa",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t('retirement.investedRetirement')}</div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:24,fontWeight:800,color:"#60a5fa"}}>{fmtC(magic.real)}</div>
          <div style={{fontSize:10,color:"#475569",marginTop:2}}>{retProfLabel} ({pct(retProfReturn)} real)</div>
        </div>
        <div>
          <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t('retirement.conservative')}</div>
          <div style={{fontFamily:"Outfit,sans-serif",fontSize:24,fontWeight:800,color:"#64748b"}}>{fmtC(magic.conservative)}</div>
          <div style={{fontSize:10,color:"#475569",marginTop:2}}><Icon name="money" size={11} weight="regular" /> Cash Investor ({pct(magic.conservativeRate)} real)</div>
        </div>
      </div>
      <div style={{marginTop:14,padding:"10px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",lineHeight:1.6,textAlign:"center"}}>
        {t('retirement.investedExplainFull',{profile:retProfLabel})}
        {" "}{t('retirement.conservExplainFull',{diff:fmtC(magic.conservative-magic.real)})}
      </div>
    </Cd>}

    {/* Monthly needed per profile */}
    <Cd><ST tip={t('retirement.extraMonthlyTip')}>{t('retirement.extraMonthly')}</ST>
      {monthlyNeeded.map(function(p){var covered=p.monthly===0;return(
        <div key={p.id} style={{padding:"10px 14px",borderRadius:10,marginBottom:6,background:covered?"rgba(34,197,94,0.04)":"rgba(0,0,0,0.1)",border:covered?"1px solid rgba(34,197,94,0.1)":"1px solid rgba(255,255,255,0.03)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}><Icon name={p.icon} size={14} weight="light"/></span><span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{p.name}</span><span style={{fontSize:10,color:"#475569"}}>{pct(p.realReturn)} real</span></div>
            <div style={{textAlign:"right"}}>
              {covered?<span style={{fontSize:14,fontWeight:700,color:"#22c55e"}}><Icon name="check-circle" size={14} weight="regular" /> {t('retirement.covered')}</span>
              :<span style={{fontSize:14,fontWeight:700,color:"#f87171"}}>{fmt(p.monthly)}{t('app.perMonth')}</span>}
            </div>
          </div>
          {!covered&&<div style={{fontSize:10,color:"#f87171",marginTop:3}}><Icon name="warning" size={11} weight="regular" /> {t('retirement.needExtraBeyond',{extra:fmt(p.monthly),current:fmt(mSav)})}</div>}
          {covered&&<div style={{fontSize:10,color:"#22c55e",marginTop:3}}>{t('retirement.surplusMsg',{amt:fmt(p.surplus)})}</div>}
        </div>)})}
    </Cd>

    {/* Year-by-Year Projection */}
    {ybYData.length>0&&<Cd>
      <ST tip={t('retirement.ybyTip')}>{t('retirement.ybyProjection')}</ST>
      {/* Two-phase profile selectors */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:"#64748b",marginBottom:6}}><Icon name="chart-line-up" size={13} weight="regular" /> {t('retirement.accumulation')}</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
          {hasPortfolio&&<TabBtn active={chartProfileIdx===-1} label={t('profiles.myPortfolio.name')} onClick={function(){setChartProfileIdx(-1)}} color="#e879f9"/>}
          {allProfiles.map(function(p,i){return <TabBtn key={p.id} active={chartProfileIdx===i} iconName={p.icon} label={p.name} onClick={function(){setChartProfileIdx(i)}} color={p.color}/>})}
        </div>
        <div style={{fontSize:11,color:chartProfileIdx===-1?"#e879f9":"#3b82f6",marginBottom:12}}>
          {chartProfileIdx===-1&&hasPortfolio?t('retirement.usingPortfolio', {rate: pct(chartAccumReturn)}):t('retirement.usingProfile', {name: (chartProfileIdx>=0?(chartProfileIdx<adjProfiles.length?adjProfiles[chartProfileIdx]:allProfiles[chartProfileIdx]).name:"60/40"), rate: pct(chartAccumReturn)})}
        </div>
        <div style={{fontSize:12,fontWeight:600,color:"#64748b",marginBottom:6}}><Icon name="umbrella" size={13} weight="regular" /> {t('retirement.retirementPhase')}</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
          {hasPortfolio&&<TabBtn active={chartRetireIdx===-1} label={t('profiles.myPortfolio.name')} onClick={function(){setChartRetireIdx(-1)}} color="#e879f9"/>}
          {adjProfiles.map(function(p,i){return <TabBtn key={p.id} active={chartRetireIdx===i} iconName={p.icon} label={p.name} onClick={function(){setChartRetireIdx(i)}} color={p.color}/>})}
        </div>
        <div style={{fontSize:11,color:chartRetireIdx===-1?"#e879f9":"#3b82f6"}}>
          {chartRetireIdx===-1&&hasPortfolio?t('retirement.usingPortfolio', {rate: pct(chartRetireReturn)}):t('retirement.usingProfile', {name: adjProfiles[Math.max(chartRetireIdx,0)].name, rate: pct(chartRetireReturn)})}
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <MultiLineChart series={[{data:ybYData.map(function(d){
          var ageNow=nAge||30;var ageAtYear=ageNow+d.year;var totalYrs=ytr+nYP;
          var step=totalYrs>40?10:5;
          var isFirst=d.year===0;var isRetire=d.year===ytr;var isLast=d.year===totalYrs;
          var isTick=d.year%step===0&&d.year>0&&d.year<totalYrs;
          var tooCloseToRetire=Math.abs(d.year-ytr)<(step/2)&&!isRetire;
          const show=(isFirst||isRetire||isLast||(isTick&&!tooCloseToRetire));
          return{l:show?(isFirst?t('app.age')+" "+ageAtYear:isRetire?t('app.at')+" "+ageAtYear:isLast?t('app.age')+" "+ageAtYear:""+ageAtYear):"",v:d.balance}
        }),color:chartProfileIdx===-1?"#e879f9":(chartProfileIdx>=0&&chartProfileIdx<allProfiles.length?allProfiles[chartProfileIdx].color:"#22c55e"),bold:true,fill:true}]} height={160} showYAxis={true}/>
      </div>
      {(function(){
        var retBal=ybYData[ytr]?ybYData[ytr].balance:0;
        var peakV=0,peakY=0;ybYData.forEach(function(d){if(d.balance>peakV){peakV=d.balance;peakY=d.year}});
        var depleteY=null;for(var i=ytr+1;i<ybYData.length;i++){if(ybYData[i].balance<=0){depleteY=i;break}}
        var lastBal=(ybYData[ybYData.length-1]||{}).balance||0;
        return(<div style={{display:"grid",gap:6,marginTop:8}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            <div style={{padding:"6px 12px",borderRadius:8,background:"rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6"}}>{t('retirement.atRetirement', {age: nAge+ytr})} <strong>{fmtC(retBal)}</strong></div>
            {peakY!==ytr&&<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(167,139,250,0.08)",fontSize:11,color:"#c4b5fd"}}>{t('retirement.peak')} <strong>{fmtC(peakV)}</strong> at age {nAge+peakY}</div>}
          </div>
          <div style={{textAlign:"center"}}>
            {depleteY?<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(239,68,68,0.08)",fontSize:11,color:"#ef4444",display:"inline-block"}}><Icon name="warning" size={12} weight="regular" /> {t('retirement.moneyRunsOut', {age: nAge+depleteY, n: depleteY-ytr})}</div>
            :<div style={{padding:"6px 12px",borderRadius:8,background:"rgba(34,197,94,0.08)",fontSize:11,color:"#16a34a",display:"inline-block"}}><Icon name="check-circle" size={12} weight="regular" /> {t('retirement.moneyLasts', {amt: fmtC(lastBal), age: nAge+ytr+nYP})}</div>}
          </div>
        </div>)})()}
      {/* Debt payoff milestones */}
      {debtEvents.length>0&&<div style={{display:"grid",gap:6,marginTop:12}}>
        {debtEvents.filter(function(ev){return ev.endsAtYear<ytr}).map(function(ev,i){return(
          <div key={i} style={{padding:"8px 14px",borderRadius:10,background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.08)",fontSize:11,color:"#16a34a",display:"flex",justifyContent:"space-between"}}>
            <span><Icon name="chart-line-up" size={12} weight="regular" /> {t('retirement.paidOffAt', {name: ev.name, age: nAge+ev.endsAtYear})}</span>
            <span style={{fontWeight:600}}>{t('retirement.savingsBoost', {amt: fmt(ev.monthlyAmount)})}</span>
          </div>)})}
      </div>}
    </Cd>}
  </>}
  <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
