import { useMemo } from "react";
import { PROFILES, SCENARIO_SPREAD, BENCH_SR, BENCH_NW } from '../constants.js';
import { mR, fvC, fvL, pvA, gB, clamp, yearByYear, fvVariable } from '../utils/financial.js';

function profById(id, list) { return list.find(function(p){ return p.id === id; }) || list[list.length-1]; }

export default function useFinancialEngine(store, t, lang) {
  const {
    customInflation, age, monthlyIncome, coupleMode, partner2Income, hasRental, rentalEquity, rentalNetIncome,
    vacationAnnual, expenses, ownsHome, noMortgage, mortgagePayment, noCarLoan, carPayment, mortgageYearsLeft, carYearsLeft,
    manualMonthlySav, retirementAge, yearsPostRet, desiredIncome, existingSavings, socialSecurity, legacy,
    debts, noDebts, mortgageBalance, carBalance, mortgageRate, carRate,
    assetTax, portAlloc, portContribAlloc, retProfileIdx, chartProfileIdx, chartRetireIdx,
    showNom, projYears, showScenarios, scenProfileIdx, costNSProfileIdx, customReturn,
    savSliders, extraIncome, eiTemporary, eiYears, costItemPrice, costProfileIdx, goals,
    simSav, simMo, simRet, revDes, revYrs, revSS, revSav, revMo, revRet, revRetProf, ciBase, ciH, ciDelayProf
  } = store;

  const INFL=customInflation/100;
  const nAge=Number(age)||0, nInc=Number(monthlyIncome)||0;
  const nP2I=coupleMode?(Number(partner2Income)||0):0;
  const nRentalEq=hasRental?(Number(rentalEquity)||0):0;
  const nRentalNet=hasRental?(Number(rentalNetIncome)||0):0;
  const totalIncome=nInc+nP2I+nRentalNet;
  const nVac=(Number(vacationAnnual)||0)/12;
  const totExp=expenses.reduce(function(s,e){return s+(Number(e.amount)||0)},0)+nVac;
  const nMortPay=(!ownsHome||noMortgage)?0:(Number(mortgagePayment)||0);
  const nCarPay=noCarLoan?0:(Number(carPayment)||0);
  const nMortYrs=(!ownsHome||noMortgage)?0:(Number(mortgageYearsLeft)||0);
  const nCarYrs=noCarLoan?0:(Number(carYearsLeft)||0);
  const totalMonthlyObligations=totExp+nMortPay+nCarPay;
  const incomeFilledExp=expenses.filter(function(e){return e.amount!==""}).length;
  const hasIncomeData=monthlyIncome!==""&&totalIncome>0&&incomeFilledExp>=5;
  const mSavComputed=totalIncome-totalMonthlyObligations;
  const mSav=hasIncomeData?mSavComputed:(Number(manualMonthlySav)||0);
  const savRate=totalIncome>0?(mSavComputed/totalIncome)*100:0;
  const nRetAge=Number(retirementAge)||65, nYP=Number(yearsPostRet)||25;
  const nDes=Number(desiredIncome)||0, nEx=Number(existingSavings)||0;
  const totalNetWorth=nEx+nRentalEq;
  const nSSRaw=Number(socialSecurity)||0;
  const nLegacy=Number(legacy)||0;
  const ytr=Math.max(nRetAge-nAge,0);
  const nSS=nSSRaw; // SS/retirement income now entered in today's dollars — no deflation needed
  const totDebt=(debts||[]).filter(Boolean).reduce(function(s,d){return s+(Number(d.balance)||0)},0);
  const mortBal=(!ownsHome||noMortgage)?0:(Number(mortgageBalance)||0);
  const carBal=noCarLoan?0:(Number(carBalance)||0);
  const totalDebtAll=totDebt+mortBal+carBal;
  const nEI=Number(extraIncome)||0;
  const nEIYrs=Number(eiYears)||5;
  const effectiveMSav=mSav+nEI;
  
  // Debt analysis
  var allDebts=useMemo(function(){
    var list=[];
    if(!noMortgage&&mortBal>0&&(Number(mortgageRate)||0)>0)
      list.push({id:"mortgage",name:t('common.mortgage'),balance:String(mortBal),rate:mortgageRate,minPayment:mortgagePayment});
    if(!noCarLoan&&carBal>0&&(Number(carRate)||0)>0)
      list.push({id:"carloan",name:t('common.carLoan'),balance:String(carBal),rate:carRate,minPayment:carPayment});
    debts.forEach(function(d){if((Number(d.balance)||0)>0&&(Number(d.rate)||0)>0)list.push(d);});
    return list;
  },[noMortgage,mortBal,mortgageRate,mortgagePayment,noCarLoan,carBal,carRate,carPayment,debts,lang,t]);

  var debtEvents=useMemo(function(){
    var list=[];
    if(!noMortgage&&nMortPay>0&&nMortYrs>0)list.push({name:t('common.mortgage'),endsAtYear:nMortYrs,monthlyAmount:nMortPay});
    if(!noCarLoan&&nCarPay>0&&nCarYrs>0)list.push({name:t('common.carLoan'),endsAtYear:nCarYrs,monthlyAmount:nCarPay});
    return list;
  },[noMortgage,nMortPay,nMortYrs,noCarLoan,nCarPay,nCarYrs,lang,t]);

  // ADJUSTED PROFILES
  var TAX=assetTax/100;
  var PROF_KEY_MAP={vault:"vault",cds:"cds",treasuries:"treasuries","6040":"6040","8020":"8020",equities:"equities",custom:"custom"};
  var adjProfiles=useMemo(function(){return PROFILES.map(function(p){
    var k=PROF_KEY_MAP[p.id]||p.id;
    return Object.assign({},p,{
      realReturn:p.nomReturn-INFL-TAX,
      nomReturn:p.nomReturn-TAX,
      name:t('profiles.'+k+'.name')||p.name,
      desc:t('profiles.'+k+'.desc')||p.desc
    });
  })},[INFL,TAX,lang,t]);
  function adjProfByHorizon(y){if(y<1)return profById('vault',adjProfiles);if(y<2)return profById('cds',adjProfiles);if(y<5)return profById('treasuries',adjProfiles);if(y<10)return profById('6040',adjProfiles);return profById('8020',adjProfiles)}

  var custR=Number(customReturn)||0;
  var allProfiles=useMemo(function(){
    var p=adjProfiles.slice();
    if(custR>0)p.push({id:"custom",name:t('profiles.custom.name')||"Custom",nomReturn:custR/100-TAX,realReturn:custR/100-INFL-TAX,desc:t('profiles.custom.desc')||"Your custom return rate.",icon:"gear",color:"#e879f9",risk:7,vol:0});
    return p;
  },[adjProfiles,custR,INFL,TAX,lang,t]);

  const portReturn=useMemo(function(){
    const totalAlloc=portAlloc.reduce(function(s,v){return s+v},0);
    if(totalAlloc===0)return{real:0,nom:0};
    let wReal=0,wNom=0;
    (allProfiles||[]).forEach(function(p,i){const a=portAlloc[i]||0;wReal+=a/100*p.realReturn;wNom+=a/100*p.nomReturn});
    return{real:wReal,nom:wNom};
  },[portAlloc,allProfiles]);

  const portContribReturn=useMemo(function(){
    const totalAlloc=portContribAlloc.reduce(function(s,v){return s+v},0);
    if(totalAlloc===0)return{real:0,nom:0};
    let wReal=0,wNom=0;
    (allProfiles||[]).forEach(function(p,i){const a=portContribAlloc[i]||0;wReal+=a/100*p.realReturn;wNom+=a/100*p.nomReturn});
    return{real:wReal,nom:wNom};
  },[portContribAlloc,allProfiles]);

  const portAllocTotal=portAlloc.reduce(function(s,v){return s+v},0);
  const portContribAllocTotal=portContribAlloc.reduce(function(s,v){return s+v},0);
  const hasPortfolio=portAllocTotal===100&&portContribAllocTotal===100;
  const blendedPortReturn=useMemo(function(){
    if(!hasPortfolio)return null;
    const totalContrib=Math.max(mSav,0)*12*Math.max(ytr,10);
    const w1=nEx;const w2=totalContrib;const tot=w1+w2;
    if(tot===0)return portReturn.real;
    return(w1*portReturn.real+w2*portContribReturn.real)/tot;
  },[hasPortfolio,nEx,mSav,ytr,portReturn.real,portContribReturn.real]);

  var desiredAfterSS=Math.max(nDes-nSS,0);
  var retProfReturn=useMemo(function(){
    if(retProfileIdx===-1&&blendedPortReturn!=null)return blendedPortReturn;
    var p=allProfiles[Math.max(retProfileIdx,0)];
    return p?p.realReturn:profById('6040',adjProfiles).realReturn;
  },[allProfiles,adjProfiles,retProfileIdx,blendedPortReturn]);
  var retProfLabel=(function(){
    if(retProfileIdx===-1&&hasPortfolio)return t('profiles.myPortfolio.name');
    var p=allProfiles[Math.max(retProfileIdx,0)];
    return p?p.name:profById('6040',adjProfiles).name;
  })();
  var chartAccumReturn=useMemo(function(){
    if(chartProfileIdx===-1&&blendedPortReturn!=null)return blendedPortReturn;
    var idx=Math.max(chartProfileIdx,0);
    return(idx<adjProfiles.length?adjProfiles[idx]:allProfiles[idx]).realReturn;
  },[adjProfiles,allProfiles,chartProfileIdx,blendedPortReturn]);
  var chartRetireReturn=useMemo(function(){
    if(chartRetireIdx===-1&&blendedPortReturn!=null)return blendedPortReturn;
    return adjProfiles[Math.max(chartRetireIdx,0)].realReturn;
  },[adjProfiles,chartRetireIdx,blendedPortReturn]);
  var chartAccumLabel=chartProfileIdx===-1&&hasPortfolio?t('profiles.myPortfolio.name'):(chartProfileIdx>=0?(chartProfileIdx<adjProfiles.length?adjProfiles[chartProfileIdx]:allProfiles[chartProfileIdx]):adjProfiles[0]).name;
  var chartRetireLabel=chartRetireIdx===-1&&hasPortfolio?t('profiles.myPortfolio.name'):adjProfiles[Math.max(chartRetireIdx,0)].name;
  
  var magic=useMemo(function(){if(desiredAfterSS<=0||nYP<=0)return{real:0,withoutSS:0,conservative:0};
    var legacyPV=nLegacy>0?nLegacy/Math.pow(1+retProfReturn,nYP):0;
    var withSS=pvA(desiredAfterSS,retProfReturn,nYP)+legacyPV;
    var withoutSS=pvA(nDes,retProfReturn,nYP)+legacyPV;
    var conservativeRate=profById('cds',adjProfiles).realReturn;
    var legacyPVc=nLegacy>0?nLegacy/Math.pow(1+conservativeRate,nYP):0;
    var conservative=pvA(desiredAfterSS,conservativeRate,nYP)+legacyPVc;
    return{real:withSS,withoutSS:withoutSS,conservative:conservative,conservativeRate:conservativeRate,legacyPV:legacyPV}
  },[desiredAfterSS,nDes,nYP,retProfReturn,adjProfiles,nLegacy]);

  var mD=useMemo(function(){
    var p=magic.real>0?(nEx/magic.real)*100:0;
    return{p:p,gap:Math.max(magic.real-nEx,0),sur:Math.max(nEx-magic.real,0),gc:p>=100?"#22c55e":p>=60?"#eab308":"#ef4444",bc:p>=100?"linear-gradient(90deg,#22c55e,#4ade80)":p>=60?"linear-gradient(90deg,#eab308,#facc15)":"linear-gradient(90deg,#ef4444,#f87171)"};
  },[magic.real,nEx]);

  const monthlyNeeded=useMemo(function(){if(magic.real<=0||ytr<=0)return [];
    const list=(adjProfiles||[]).map(function(pr){
      const projectedAtRetire=fvVariable(nEx,mSav,pr.realReturn,ytr,debtEvents);
      const gap=Math.max(magic.real-projectedAtRetire,0);
      if(gap<=0)return Object.assign({},pr,{monthly:0,surplus:projectedAtRetire-magic.real,projected:projectedAtRetire});
      const m=mR(pr.realReturn),n=ytr*12;
      const mo=pr.realReturn===0||m===0?gap/n:gap/((Math.pow(1+m,n)-1)/m);
      return Object.assign({},pr,{monthly:mo,surplus:0,projected:projectedAtRetire});
    });
    if(hasPortfolio&&blendedPortReturn!=null){
      const r=blendedPortReturn,proj=fvVariable(nEx,mSav,r,ytr,debtEvents);
      const gap=Math.max(magic.real-proj,0);let mo=0;
      if(gap>0){const m=mR(r),n=ytr*12;mo=r===0||m===0?gap/n:gap/((Math.pow(1+m,n)-1)/m)}
      list.unshift({id:"myportfolio",name:t('profiles.myPortfolio.name'),icon:"sliders-h",realReturn:r,nomReturn:r+INFL,color:"#e879f9",monthly:mo,surplus:gap<=0?proj-magic.real:0,projected:proj});
    }
    return list;
  },[magic.real,nEx,mSav,ytr,adjProfiles,debtEvents,hasPortfolio,blendedPortReturn,INFL,t]);

  var ybYData=useMemo(function(){if(ytr<=0||nDes<=0)return[];
    return yearByYear(nEx,mSav,chartAccumReturn,ytr,nYP,desiredAfterSS,INFL,debtEvents,chartRetireReturn);
  },[nEx,mSav,chartAccumReturn,chartRetireReturn,ytr,nYP,desiredAfterSS,INFL,debtEvents]);

  const projs=useMemo(function(){
    return (allProfiles||[]).map(function(pr){
      const rFV=fvVariable(nEx,mSav,pr.realReturn,projYears,debtEvents);
      const nFV=fvVariable(nEx,mSav,pr.nomReturn,projYears,debtEvents);
      let tc=nEx;for(let y=0;y<projYears;y++){let extra=0;(debtEvents||[]).forEach(function(ev){if(y>=ev.endsAtYear)extra+=ev.monthlyAmount});tc+=(mSav+extra)*12}
      return Object.assign({},pr,{nFV:nFV,rFV:rFV,tc:tc});
    });
  },[mSav,nEx,projYears,allProfiles,debtEvents]);

  var maxProj=useMemo(function(){return Math.max.apply(null,projs.map(function(p){return showNom?p.nFV:p.rFV}).concat([1]))},[projs,showNom]);

  const scenarios=useMemo(function(){if(!showScenarios)return null;
    const baseR=scenProfileIdx===-1&&blendedPortReturn!=null?blendedPortReturn:(allProfiles[Math.min(scenProfileIdx,allProfiles.length-1)]||allProfiles[5]).realReturn;
    const sc=[t('scenarios.pessimistic'),t('scenarios.base'),t('scenarios.optimistic')];const spreads=[-SCENARIO_SPREAD,0,SCENARIO_SPREAD];
    const colors=["#ef4444","#60a5fa","#22c55e"];
    return (sc||[]).map(function(name,si){
      const r=baseR+spreads[si];
      const step=projYears>30?10:projYears>15?5:projYears>8?2:1;
      const data=[];for(let y=0;y<=projYears;y++){
        const v=fvVariable(nEx,mSav,r,y,debtEvents);
        const showLabel=y===0||y===projYears||(y%step===0);
        data.push({l:showLabel?t('app.yr')+" "+y:"",v:v});
      }
      return{name:name,data:data,color:colors[si],bold:si===1,dash:si!==1?"6,4":"none",fill:si===1};
    });
  },[showScenarios,mSav,nEx,projYears,allProfiles,debtEvents,scenProfileIdx,blendedPortReturn,t]);

  var costNSYears=20;
  var costNSReturn=costNSProfileIdx===-1&&blendedPortReturn!=null?blendedPortReturn:(allProfiles[costNSProfileIdx]||profById('6040',adjProfiles)).realReturn;
  var costNS=useMemo(function(){
    if(mSav<=0&&nEx<=0)return null;
    var data=[];
    for(var wait=0;wait<=10;wait++){
      var yrsLeft=costNSYears-wait;if(yrsLeft<=0)break;
      var total=fvVariable(nEx,mSav,costNSReturn,yrsLeft,debtEvents);
      data.push({wait:wait,total:total,lost:wait>0?fvVariable(nEx,mSav,costNSReturn,costNSYears,debtEvents)-total:0});
    }
    return data;
  },[mSav,nEx,debtEvents,costNSReturn]);

  var debtAn=useMemo(function(){return allDebts.map(function(d){
    var r=Number(d.rate);var pb=PROFILES.filter(function(p){return r/100>p.nomReturn});
    var sev=pb.length===PROFILES.length?"critical":pb.length>=5?"high":pb.length>=3?"moderate":"low";
    return Object.assign({},d,{rate:r,pb:pb,sev:sev,bal:Number(d.balance),minPay:Number(d.minPayment)||0});
  }).sort(function(a,b){return b.rate-a.rate})},[allDebts]);
  var probDebts=debtAn.filter(function(d){return d.sev!=="low"});

  var emergencyMonths=useMemo(function(){return totalMonthlyObligations>0?nEx/totalMonthlyObligations:0},[nEx,totalMonthlyObligations]);

  var savOpps=useMemo(function(){return expenses.filter(function(e){return(Number(e.amount)||0)>0&&e.name.trim()&&e.discretionary!==false}).map(function(e){
    var a=Number(e.amount),cut=savSliders[e.id]!==undefined?savSliders[e.id]:50;
    var saved=a*(cut/100);
    return Object.assign({},e,{cur:a,cutPct:cut,saved:saved,
      imp10:fvC(saved,0.04,10),imp20:fvC(saved,0.04,20),imp30:fvC(saved,0.04,30)});
  }).sort(function(a,b){return b.imp10-a.imp10})},[expenses,savSliders]);

  var totalSavOpp=useMemo(function(){
    var mo=savOpps.reduce(function(s,o){return s+o.saved},0);
    return{mo:mo,imp10:fvC(mo,0.04,10),imp20:fvC(mo,0.04,20),imp30:fvC(mo,0.04,30)};
  },[savOpps]);

  var earnProj=useMemo(function(){if(nEI<=0)return null;
    var yrs=eiTemporary?nEIYrs:50;
    function earnFV(totalYears){
      if(!eiTemporary)return fvC(nEI,0.04,totalYears);
      var atEnd=fvC(nEI,0.04,Math.min(totalYears,yrs));
      if(totalYears>yrs)atEnd=fvL(atEnd,0.04,totalYears-yrs);
      return atEnd;
    }
    return{imp10:earnFV(10),imp20:earnFV(20),imp30:earnFV(30),
      data:Array.from({length:31},function(_,y){return{l:t('app.yr')+" "+y,v:earnFV(y)}})};
  },[nEI,eiTemporary,nEIYrs,t]);

  var combinedImpact=useMemo(function(){
    var mo=totalSavOpp.mo+nEI;
    return{mo:mo,imp10:fvC(mo,0.04,10),imp20:fvC(mo,0.04,20),imp30:fvC(mo,0.04,30)};
  },[totalSavOpp.mo,nEI]);

  var costInRet=useMemo(function(){
    var price=Number(costItemPrice)||0;if(price<=0||ytr<=0)return null;
    var prof=adjProfiles[costProfileIdx];
    var fv=fvL(price,prof.realReturn,ytr);
    var multiplier=fv/price;
    return{fv:fv,multiplier:multiplier,prof:prof,itemsCouldBuy:Math.floor(multiplier)};
  },[costItemPrice,ytr,costProfileIdx,adjProfiles]);

  var goalCalcs=useMemo(function(){return goals.map(function(g){
    var amt=Number(g.amount)||0,yrs=Number(g.years)||0;
    if(amt<=0||yrs<=0)return Object.assign({},g,{mo:0,prof:profById('vault',adjProfiles),valid:false});
    var prof=g.profileIdx>=0?(allProfiles[g.profileIdx]||adjProfByHorizon(yrs)):adjProfByHorizon(yrs);
    var r=prof.realReturn,m=mR(r),n=yrs*12;
    var mo=r===0||m===0?amt/n:amt/((Math.pow(1+m,n)-1)/m);
    return Object.assign({},g,{mo:mo,prof:prof,valid:true,nAmt:amt,nYrs:yrs});
  })},[goals,adjProfiles,allProfiles]);

  var totalGoalMo=goalCalcs.reduce(function(s,g){return s+(g.valid?g.mo:0)},0);
  var goalImpactRate=profById('6040',adjProfiles).realReturn;
  const goalRetImpact=useMemo(function(){if(totalGoalMo<=0||magic.real<=0||ytr<=0)return null;
    const full=fvVariable(nEx,mSav,goalImpactRate,ytr,debtEvents);
    let bal=nEx;
    for(let y=0;y<ytr;y++){
      let goalDrain=0;
      (goalCalcs||[]).forEach(function(g){if(g.valid&&y<g.nYrs)goalDrain+=g.mo});
      let extraSav=0;
      (debtEvents||[]).forEach(function(ev){if(y>=ev.endsAtYear)extraSav+=ev.monthlyAmount});
      bal=bal*(1+goalImpactRate)+(mSav-goalDrain+extraSav)*12;
      if(bal<0)bal=0;
    }
    return{reduced:bal,full:full,diff:full-bal,pctOfMagic:magic.real>0?((full-bal)/magic.real*100):0};
  },[goalCalcs,totalGoalMo,mSav,goalImpactRate,ytr,nEx,magic.real,debtEvents]);

  var simEffSav=simSav!=null?simSav:nEx;
  var simEffMo=simMo!=null?simMo:Math.max(mSav,0);
  var simEffRet=simRet!=null?simRet/100:0.01;
  var simProjected=useMemo(function(){
    if(ytr<=0)return nEx;
    return fvVariable(simEffSav,simEffMo,simEffRet,ytr,debtEvents);
  },[simEffSav,simEffMo,simEffRet,ytr,debtEvents]);
  var simGap=magic.real>0?magic.real-simProjected:0;
  var simPct=magic.real>0?simProjected/magic.real*100:0;
  var simNeededReturn=useMemo(function(){
    if(magic.real<=0||ytr<=0)return null;
    var lo=-0.03,hi=0.20;
    for(var i=0;i<40;i++){var mid=(lo+hi)/2;var v=fvVariable(simEffSav,simEffMo,mid,ytr,debtEvents);if(v<magic.real)lo=mid;else hi=mid}
    var r=(lo+hi)/2;return r>0.15?null:r;
  },[magic.real,simEffSav,simEffMo,ytr,debtEvents]);
  var simNeededMonthly=useMemo(function(){
    if(magic.real<=0||ytr<=0)return null;
    var lo=0,hi=50000;
    for(var i=0;i<40;i++){var mid=(lo+hi)/2;var v=fvVariable(simEffSav,mid,simEffRet,ytr,debtEvents);if(v<magic.real)lo=mid;else hi=mid}
    return(lo+hi)/2;
  },[magic.real,simEffSav,simEffRet,ytr,debtEvents]);

  var revResult=useMemo(function(){
    var rDes=revDes!==""?Number(revDes)||0:nDes;
    var rYrs=revYrs!==""?Number(revYrs)||0:nYP;
    var rSS=revSS!==""?Number(revSS)||0:nSSRaw;
    var rSav=revSav!==""?Number(revSav)||0:nEx;
    var rMo=revMo!==""?Number(revMo)||0:Math.max(mSav,0);
    if(rDes<=0||rYrs<=0||nAge<=0||nRetAge<=nAge)return null;
    var accumR=revRet/100;
    var retR=adjProfiles[Math.min(revRetProf,adjProfiles.length-1)].realReturn;
    var yrsToRetire=nRetAge-nAge;
    var projected=fvVariable(rSav,rMo,accumR,yrsToRetire,[]);
    var ssToday=rSS;
    var afterSS=Math.max(rDes-ssToday,0);
    if(afterSS<=0)return{yearsOfCoverage:rYrs,untilAge:nRetAge+rYrs,projected:projected,surplus:projected,yrsToRetire:yrsToRetire,ssToday:ssToday,afterSS:0,retR:retR,targetYrs:rYrs,sufficient:true};
    // Simulate drawdown: how many years does projected last?
    var bal=projected;var yearsOfCoverage=0;var annualWithdraw=afterSS*12;
    while(bal>0&&yearsOfCoverage<60){
      bal=bal*(1+retR)-annualWithdraw;
      if(bal>0)yearsOfCoverage++;else{yearsOfCoverage++;break;}
    }
    if(bal>0)yearsOfCoverage=60;
    var sufficient=yearsOfCoverage>=rYrs;
    var legPV=nLegacy>0?nLegacy/Math.pow(1+retR,rYrs):0;
    var mn=pvA(afterSS,retR,rYrs)+legPV;
    var surplus=sufficient?projected-mn:0;
    var deficit=sufficient?0:mn-projected;
    return{yearsOfCoverage:yearsOfCoverage,untilAge:nRetAge+yearsOfCoverage,projected:projected,mn:mn,surplus:surplus,deficit:deficit,yrsToRetire:yrsToRetire,ssToday:ssToday,afterSS:afterSS,retR:retR,targetYrs:rYrs,sufficient:sufficient};
  },[revDes,revYrs,revSS,revSav,revMo,revRet,revRetProf,nAge,nRetAge,adjProfiles,INFL,nDes,nYP,nSSRaw,nEx,mSav,nLegacy,lang,t]);

  var hScore=useMemo(function(){
    var s=0,bd=[],recs=[];
    var sr=savRate>=25?30:savRate>=20?25:savRate>=15?20:savRate>=10?15:savRate>=5?10:savRate>0?5:0;
    s+=sr;bd.push({l:t('score.savingsRate'),s:sr,m:30,st:sr>=20?"good":sr>=10?"ok":"bad"});
    if(sr<20)recs.push({cat:t('score.savingsRate'),priority:sr<10?1:2,text:sr<10?t('score.aimToSave'):t('score.greatProgress')});
    var ds=25;
    if(!noDebts&&probDebts.length>0){var tval=probDebts.reduce(function(s,d){return s+d.bal},0);ds=tval>totalIncome*12?5:tval>totalIncome*6?10:tval>totalIncome*3?15:20;
      recs.push({cat:t('score.debtHealth'),priority:ds<15?1:2,text:ds<15?t('score.highInterestDebt'):t('score.goodProgressDebt')})}
    else if(!noDebts&&totalDebtAll>0)ds=22;
    s+=ds;bd.push({l:t('score.debtHealth'),s:ds,m:25,st:ds>=20?"good":ds>=15?"ok":"bad"});
    var rs=0;
    if(magic.real>0&&ytr>0){var proj=fvVariable(nEx,mSav,0.04,ytr,debtEvents);var otp=proj/magic.real;
      rs=otp>=1?25:otp>=0.8?22:otp>=0.6?18:otp>=0.4?14:otp>=0.2?10:5;
      if(otp<0.8)recs.push({cat:t('score.retirementProgress'),priority:otp<0.4?1:2,text:otp<0.4?t('score.significantlyBehind'):t('score.makingProgressInvest')})}
    else if(nEx>0)rs=10;
    s+=rs;
    var rOT=magic.real>0&&ytr>0?((fvVariable(nEx,mSav,0.04,ytr,debtEvents))/magic.real*100).toFixed(0):null;
    bd.push({l:t('score.retirementProgress'),s:rs,m:25,st:rs>=20?"good":rs>=14?"ok":"bad",det:rOT?t('score.onTrackDet', {rate: rOT, yrs: ytr}):null});
    var ps=nEx>0&&mSav>0?20:nEx>0||mSav>0?12:3;
    s+=ps;bd.push({l:t('score.savingsHabit'),s:ps,m:20,st:ps>=15?"good":ps>=8?"ok":"bad",det:ps>=15?t('score.savingMonthly'):t('score.savingTip')});
    if(ps<15)recs.push({cat:t('score.savingsHabit'),priority:3,text:t('score.buildConsistency')});
    if(emergencyMonths<6&&totalMonthlyObligations>0)recs.push({cat:t('dashboard.emergencyFund'),priority:emergencyMonths<3?1:2,text:emergencyMonths<3?t('score.emergencyCrit'):t('score.emergencyOk', {months: emergencyMonths.toFixed(0)})});
    recs.sort(function(a,b){return a.priority-b.priority});
    return{s:s,bd:bd,recs:recs};
  },[savRate,noDebts,probDebts,totalDebtAll,totalIncome,magic.real,nEx,mSav,ytr,emergencyMonths,totExp,debtEvents,t]);

  var bSR=useMemo(function(){return gB(BENCH_SR,nAge)},[nAge]);
  var bNW=useMemo(function(){return gB(BENCH_NW,nAge)},[nAge]);
  var percentiles=useMemo(function(){if(nAge<=0)return{sr:null,nw:null};
    var srP=savRate<=bSR.p25?Math.round(savRate/bSR.p25*25):savRate<=bSR.med?25+Math.round((savRate-bSR.p25)/(bSR.med-bSR.p25)*25):savRate<=bSR.p75?50+Math.round((savRate-bSR.med)/(bSR.p75-bSR.med)*25):75+Math.round(Math.min((savRate-bSR.p75)/bSR.p75*25,24));
    var nwP=nEx<=bNW.p25?Math.round(nEx/bNW.p25*25):nEx<=bNW.med?25+Math.round((nEx-bNW.p25)/(bNW.med-bNW.p25)*25):nEx<=bNW.p75?50+Math.round((nEx-bNW.med)/(bNW.p75-bNW.med)*25):75+Math.round(Math.min((nEx-bNW.p75)/bNW.p75*25,24));
    return{sr:clamp(srP,1,99),nw:clamp(nwP,1,99)};
  },[nAge,savRate,nEx,bSR,bNW]);

  return {
    INFL, nAge, nInc, nP2I, nRentalEq, nRentalNet, totalIncome, nVac, totExp, nMortPay, nCarPay, nMortYrs, nCarYrs,
    totalMonthlyObligations, incomeFilledExp, hasIncomeData, mSavComputed, mSav, savRate, nRetAge, nYP, nDes, nEx,
    totalNetWorth, nSSRaw, nLegacy, ytr, nSS, totDebt, mortBal, carBal, totalDebtAll, nEI, nEIYrs, effectiveMSav,
    allDebts, debtEvents, TAX, adjProfiles, allProfiles, portReturn, portContribReturn, hasPortfolio, blendedPortReturn,
    desiredAfterSS, retProfReturn, retProfLabel, chartAccumReturn, chartRetireReturn, chartAccumLabel, chartRetireLabel,
    magic, mD, monthlyNeeded, ybYData, projs, maxProj, scenarios, costNSYears, costNSReturn, costNS,
    debtAn, probDebts, emergencyMonths, savOpps, totalSavOpp, earnProj, combinedImpact, costInRet, goalCalcs, totalGoalMo, goalImpactRate, goalRetImpact,
    simEffSav, simEffMo, simEffRet, simProjected, simGap, simPct, simNeededReturn, simNeededMonthly,
    revResult, hScore, bSR, bNW, percentiles
  };
}
