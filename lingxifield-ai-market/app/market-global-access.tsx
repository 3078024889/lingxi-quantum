'use client';
import type {Language} from '../lib/v2';
import type {RegionCode} from '../lib/global-region-market';
import {ALL_REGIONS,regionName,regionCopy,globalRegionFact} from '../lib/global-region-market';
import type {Platform} from '../lib/data';
import {regionPresentation,globalRegionSummary} from '../lib/region-presentation';

import {localizedPaymentName} from '../lib/market-localized-payment';
export {localizedPaymentName} from '../lib/market-localized-payment';
export function MarketRegionSelect({language,region,onChange}:{language:Language;region:RegionCode;onChange:(next:RegionCode)=>void}){
 const t=regionCopy(language);
 return <label className="marketRegionSelect">{t.region}
  <select aria-label={t.region} value={region} onChange={e=>onChange(e.target.value as RegionCode)}>
   {ALL_REGIONS.map(r=><option key={r} value={r}>{regionName(r,language)}</option>)}
  </select>
 </label>;
}
export default function MarketGlobalAccess({platform,language,region,onChange}:{platform:Platform;language:Language;region:RegionCode;onChange:(next:RegionCode)=>void}){
 const t=regionCopy(language),x=globalRegionFact(platform.id,region);
 const methods=x.payments.methods,countryList=regionPresentation(platform.id,language);

 return <section className="panel globalRegionPanel" aria-label={t.availability} dir={language==='ar'?'rtl':'ltr'}>
  <div className="globalRegionHeading"><div><h2>{t.availability} · {t.payment}</h2></div><MarketRegionSelect language={language} region={region} onChange={onChange}/></div>
  
  <div className="globalRegionFacts">
   <article><h3>{t.access}: {regionName(region,language)}</h3>
    <strong className={'regionStatus regionStatus-'+x.policy.status}>{region==='GLOBAL'?globalRegionSummary(platform.id,language):t.status[x.policy.status]}</strong>
    
    {x.policy.source&&<a href={x.policy.source} target="_blank" rel="noopener noreferrer">{t.source} · {x.policy.checkedAt||''} ↗</a>}
    {countryList.total>0?<div className="marketRegionCatalog">
      <strong>{countryList.complete?countryList.words.complete:countryList.words.partial}</strong>
      <div className="marketRegionTopFive">{countryList.top.map(code=><span key={code}>{regionName(code as RegionCode,language)}</span>)}</div>
      {countryList.other.length>0&&<div className="globalSupportedCountries"><strong>{countryList.words.more} ({countryList.other.length})</strong><div>{countryList.other.map(code=><span key={code}>{regionName(code as RegionCode,language)}</span>)}</div></div>}
      
      {countryList.source&&<a href={countryList.source} target="_blank" rel="noopener noreferrer">{countryList.words.visit} · {countryList.checkedAt} ↗</a>}<a className="marketRegionFeedback" href="#visitor-feedback">{countryList.words.feedback} ↗</a>
     </div>:<div className="marketRegionCatalog"><span>{countryList.words.empty}</span><a className="marketRegionFeedback" href="#visitor-feedback">{countryList.words.feedback} ↗</a></div>}
    {platform.id==='claude'&&<p className="regionPhoneNote">{({zh:'注册要求：来自官方支持地区、能够接收短信的手机号；VoIP 等虚拟号码不被接受。',en:'Sign-up needs an SMS-capable phone number from a supported region; VoIP numbers are not accepted.',ja:'登録には対応国のSMS受信可能な電話番号が必要です。VoIP番号は不可。',ko:'가입 시 지원 국가의 문자 수신 가능 전화번호가 필요하며 VoIP 번호는 허용되지 않습니다.',fr:'Inscription : numéro mobile capable de recevoir des SMS d’un pays pris en charge ; VoIP non accepté.',de:'Registrierung: SMS-fähige Rufnummer aus einem unterstützten Land; VoIP unzulässig.',es:'Registro: número capaz de recibir SMS de un país admitido; no se acepta VoIP.',pt:'Cadastro: número com SMS de região suportada; VoIP não é aceito.',ar:'يتطلب التسجيل رقم هاتف يستقبل الرسائل من بلد مدعوم، ولا تقبل أرقام VoIP.'} as Record<Language,string>)[language]} <a href="https://support.claude.com/en/articles/8287232-verify-your-phone-number" target="_blank" rel="noopener noreferrer">{t.source} ↗</a></p>}</article>
   <article><h3>{t.payment}</h3>
    {methods.length?<ul>{methods.map(m=><li key={m}>{localizedPaymentName(m,language)}</li>)}</ul>:<strong>{region==='GLOBAL'?t.market:x.policy.status==='unsupported'?t.status.unsupported:({zh:'官网未列出该地区的付款方式',en:'Payment options for this region not published',ja:'地域別の決済方法は未掲載',ko:'지역별 결제 수단 미공개',fr:'Modes de paiement locaux non publiés',de:'Regionale Zahlungsarten nicht angegeben',es:'Pagos para esta región no publicados',pt:'Pagamentos locais não divulgados',ar:'لم تُنشر طرق الدفع لهذه المنطقة'} as Record<Language,string>)[language]}</strong>}
    
    {platform.id==='midjourney'&&<small>{({zh:'官方明确不支持 PayPal。',en:'PayPal is explicitly not supported.',ja:'PayPalは非対応です。',ko:'PayPal은 지원되지 않습니다.',fr:'PayPal n’est pas accepté.',de:'PayPal wird nicht unterstützt.',es:'No se acepta PayPal.',pt:'PayPal não é aceito.',ar:'لا يُقبل PayPal.'} as Record<Language,string>)[language]}</small>}
    {x.payments.source&&<a href={x.payments.source} target="_blank" rel="noopener noreferrer">{t.source} · {x.payments.checkedAt} ↗</a>}</article>
  </div>
 </section>;
}
