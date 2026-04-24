import Cd from '../components/Card.jsx';
import ST from '../components/SectionTitle.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Icon from '../components/Icon.jsx';
import { useTranslation } from '../i18n/index.jsx';
import AdvisorCTA from '../components/AdvisorCTA.jsx';
import { PROFILES } from '../constants.js';

export default function LearnTab({ tab, goTab, tier }) {
  const { t } = useTranslation();

  return (
    <div className="fi">
      <Cd style={{textAlign:"center",padding:"28px 24px"}}>
        <div style={{fontSize:40,marginBottom:12}}><Icon name="book-open-text" size={40} weight="regular" color="#60a5fa" /></div>
        <h2 style={{fontFamily:"Outfit,sans-serif",fontSize:22,fontWeight:700,color:"#0f172a",marginBottom:8}}>{t('learn.title')}</h2>
        <p style={{color:"#64748b",fontSize:14,lineHeight:1.6,maxWidth:420,margin:"0 auto"}}>
          {t('learn.subtitle')}
        </p>
      </Cd>

      <Cd><ST><Icon name="crosshair" size={16} weight="regular" /> {t('learn.magicNumber')}</ST>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.7}}>
          {t('learn.magicNumberDesc')}
        </p>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.7,marginTop:10}}>
          {t('learn.magicNumberDepends')}
        </p>
      </Cd>

      <Cd><ST><Icon name="money" size={16} weight="regular" /> {t('learn.futureDollars')}</ST>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.7}}>
          {t('learn.futureDollarsDesc')}
        </p>
      </Cd>

      <Cd><ST><Icon name="chart-line-up" size={16} weight="regular" /> {t('learn.nomVsReal')}</ST>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.7}}>
          {t('learn.nomVsRealDesc')}
        </p>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.7,marginTop:10}}>
          {t('learn.nomVsRealExample')}
        </p>
      </Cd>

      <Cd><ST><Icon name="bank" size={16} weight="regular" /> {t('learn.investProfiles')}</ST>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.7,marginBottom:12}}>
          {t('learn.investProfilesDesc')}
        </p>
        <div style={{display:"grid",gap:8}}>
          {PROFILES.map(function(p){return(
            <div key={p.id} style={{padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.15)",border:"1px solid rgba(15,23,42,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:600,color:"#0f172a"}}><Icon name={p.icon} size={14} weight="light"/> {t('profiles.'+p.id+'.name')||p.name}</span>
                <span style={{fontSize:12,color:p.color}}>{(p.nomReturn*100).toFixed(1)}% {t('common.nom')} / {(p.realReturn*100).toFixed(1)}% {t('common.real')}</span>
              </div>
              <div style={{fontSize:12,color:"#64748b",marginTop:4,lineHeight:1.5}}>{t('profiles.'+p.id+'.desc')||p.desc}</div>
            </div>)})}
        </div>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.7,marginTop:12}}>
          {t('learn.portfolioExplain')}
        </p>
      </Cd>

      <Cd><ST><Icon name="currency-dollar" size={16} weight="regular" /> {t('learn.currentVsMonthly')}</ST>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.7}}>
          {t('learn.currentDesc')}
        </p>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.7,marginTop:10}}>
          {t('learn.monthlyDesc')}
        </p>
      </Cd>

      <Cd><ST><Icon name="ruler" size={16} weight="regular" /> {t('learn.inflation')}</ST>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.7}}>
          {t('learn.inflationDesc')}
        </p>
      </Cd>

      <Cd glow="green" style={{textAlign:"center",padding:"24px 20px"}}>
        <div style={{fontSize:14,fontWeight:600,color:"#22c55e",marginBottom:8}}>{t('learn.readyToStart')}</div>
        <p style={{color:"#64748b",fontSize:13,lineHeight:1.6,marginBottom:16}}>
          {t('learn.readyToStartDesc')}
        </p>
        <button className="bp" onClick={function(){goTab("achieve")}}>{t('learn.letsGo')}</button>
      </Cd>
      <AdvisorCTA tab={tab}/>
      <NavButtons tab={tab} goTab={goTab} tier={tier}/>
    </div>
  );
}
