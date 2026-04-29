      {/* === REVERSE CALCULATOR (Redesigned per minuta cruda v2) === */}
      {nAge>0&&<>
      <Cd glow={revResult&&revResult.sufficient?"green":"red"} style={{marginTop:24,borderTop:"2px solid rgba(96,165,250,0.15)",paddingTop:28}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:28,marginBottom:8}}><Icon name="calendar" size={28} weight="regular" color="#60a5fa" /></div>
          <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:20,fontWeight:700,color:"#0f172a",marginBottom:6}}>{lang==="en"?<>How Many Years Will Your <strong>Projected Savings</strong> Last?</>:<>¿Para Cuántos Años Te Alcanza tu <strong>Ahorro Proyectado</strong>?</>}</h2>
        </div>
        {/* Two-column summary: Projected Savings (left) + Years of Coverage (right) */}
        <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:20}}>
          <div style={{flex:"1 1 200px",textAlign:"center",padding:"20px 16px",borderRadius:14,background:revResult&&revResult.sufficient?"rgba(34,197,94,0.04)":"rgba(239,68,68,0.04)",border:"1px solid "+(revResult&&revResult.sufficient?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)")}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:revResult&&revResult.sufficient?"#22c55e":"#ef4444",marginBottom:8,fontWeight:700}}>{t('achieve.projectedSavings')}</div>
            <div style={{fontFamily:"Outfit,sans-serif",fontSize:32,fontWeight:900,color:revResult&&revResult.sufficient?"#22c55e":"#f87171",lineHeight:1.1}}>{fmtC(revResult?revResult.projected:simProjected)}</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{t('achieve.atRetAge', {age: nRetAge})}</div>
          </div>
          <div style={{flex:"1 1 200px",textAlign:"center",padding:"20px 16px",borderRadius:14,background:revResult&&revResult.sufficient?"rgba(34,197,94,0.04)":"rgba(239,68,68,0.04)",border:"1px solid "+(revResult&&revResult.sufficient?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)")}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:revResult&&revResult.sufficient?"#22c55e":"#ef4444",marginBottom:8,fontWeight:700}}>{t('achieve.yearsOfCoverage')}</div>
            <div style={{fontFamily:"Outfit,sans-serif",fontSize:32,fontWeight:900,color:revResult&&revResult.sufficient?"#22c55e":"#f87171",lineHeight:1.1}}>{revResult?<>{Math.floor(revResult.yearsOfCoverage)>=60?"60+":Math.floor(revResult.yearsOfCoverage)} {t('app.years')}</>:"—"}</div>
            {revResult&&<div style={{fontSize:11,color:"#64748b",marginTop:4}}>{lang==="en"?"until age":"hasta los"} {revResult.untilAge>=160?"∞":revResult.untilAge}</div>}
            {revResult&&<div style={{marginTop:10}}>{revResult.sufficient
              ?<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:8,background:"rgba(34,197,94,0.08)",fontSize:11,color:"#22c55e",fontWeight:700}}><Icon name="check-circle" size={13} weight="regular" /> {t('achieve.goalReached')}</span>
              :<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:8,background:"rgba(239,68,68,0.08)",fontSize:11,color:"#ef4444",fontWeight:700}}><Icon name="warning" size={13} weight="regular" /> {t('achieve.cannotRetireBy100')}</span>
            }</div>}
          </div>
        </div>
        {/* Slider 1: Desired monthly income in retirement */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="currency-dollar" size={14} weight="regular" /> {t('achieve.desiredIncome')}</span>
            <span style={{fontSize:15,fontWeight:700,color:"#60a5fa"}}>{fmt(revDes!==""?Number(revDes):nDes)}{t('app.perMonth')}</span>
          </div>
          <Slider label="" value={revDes!==""?Number(revDes):nDes} onChange={function(v){setRevDes(String(v))}} min={0} max={Math.max((revDes!==""?Number(revDes):nDes)*3,30000)} step={100} format={function(v){return fmt(v)}} color="#60a5fa"/>
        </div>
        {/* Slider 2: Monthly savings */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="calendar" size={14} weight="regular" /> {t('achieve.monthlySavings')}</span>
            <span style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>{fmt(revMo!==""?Number(revMo):Math.max(mSav,0))}{t('app.perMonth')}</span>
          </div>
          <Slider label="" value={revMo!==""?Number(revMo):Math.max(mSav,0)} onChange={function(v){setRevMo(String(v))}} min={0} max={Math.max((revMo!==""?Number(revMo):Math.max(mSav,0))*5,20000)} step={100} format={function(v){return fmt(v)}} color="#22c55e"/>
        </div>
        {/* Slider 3: Return rate with profiles + custom label + ? tooltip */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name="chart-line-up" size={14} weight="regular" /> {t('achieve.revAccumReturn')} <span onClick={function(){alert(t('achieve.negReturnTooltip'))}} style={{cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:"50%",background:"rgba(96,165,250,0.1)",color:"#3b82f6",fontSize:10,fontWeight:700,marginLeft:4}}>?</span></span>
            <span style={{fontSize:15,fontWeight:700,color:"#f59e0b"}}>{Number(revRet).toFixed(1)}%</span>
          </div>
          <Slider label="" value={revRet} onChange={setRevRet} min={-3} max={12} step={0.1} format={function(v){return Number(v).toFixed(1)+"%"}} color="#f59e0b"/>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
            {adjProfiles.filter(function(_,i){return i>=1}).map(function(p){return <TabBtn key={p.id} active={Math.abs(revRet-p.realReturn*100)<0.05} iconName={p.icon} label={p.name+" "+pct(p.realReturn)} onClick={function(){setRevRet(p.realReturn*100)}} color={p.color}/>})}
          </div>
          {(function(){var matched=adjProfiles.find(function(p){return Math.abs(revRet/100-p.realReturn)<0.001});return matched?<div style={{fontSize:10,color:matched.color||"#3b82f6",marginTop:4}}>{lang==="en"?"Using":"Usando"} {matched.name} {pct(matched.realReturn)} {lang==="en"?"real":"real"}</div>:<div style={{fontSize:10,color:"#f59e0b",marginTop:4}}><Icon name="gear" size={10} weight="regular" /> {t('achieve.customReturnProfile')}: {Number(revRet).toFixed(1)}% {lang==="en"?"real":"real"}</div>})()}
        </div>
        {/* Retirement return assumption notice (replaces old strategy section) */}
        <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <span onClick={function(){alert(t('achieve.retAssumptionTooltip'))}} style={{cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,borderRadius:"50%",background:"rgba(96,165,250,0.15)",color:"#3b82f6",fontSize:10,fontWeight:700,flexShrink:0}}>?</span>
          {t('achieve.retAssumptionTooltip')}
        </div>
        {(nLegacy>0||TAX>0)&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
          {nLegacy>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.08)",fontSize:11,color:"#3b82f6"}}>{t('achieve.revLegacyFrom',{amt:fmt(nLegacy)})}</div>}
          {TAX>0&&<div style={{padding:"5px 12px",borderRadius:8,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.08)",fontSize:11,color:"#92400e"}}>{t('achieve.revTaxFrom',{rate:Number(assetTax).toFixed(1)})}</div>}
        </div>}
      </Cd>


      {revResult&&<AdvisorCTA msg={revResult.sufficient?t('achieve.advisorReality'):t('achieve.advisorHelp')} onContact={function(){setShowLeadModal(true);track(EVENTS.ADVISOR_CTA_CLICKED,{source_tab:tab},{lang:lang,tier:tier})}}/>}
      </>}
