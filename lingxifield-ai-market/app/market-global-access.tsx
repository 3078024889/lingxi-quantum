'use client';
import type {Language} from '../lib/v2';
import type {RegionCode} from '../lib/global-region-market';
import {ALL_REGIONS,regionName,regionCopy,globalRegionFact,completeSupportedRegionList} from '../lib/global-region-market';
import type {Platform} from '../lib/data';

const paymentNames:Record<string,Partial<Record<Language,string>>>={
 'Credit / debit card':{zh:'信用卡 / 借记卡',ja:'クレジット / デビットカード',ko:'신용 / 체크카드',fr:'Carte de crédit / débit',de:'Kredit- / Debitkarte',es:'Tarjeta de crédito / débito',pt:'Cartão de crédito / débito',ar:'بطاقة ائتمان / خصم'},
 'Credit / debit card (web)':{zh:'信用卡 / 借记卡（网页版）',ja:'カード（ウェブ）',ko:'카드(웹)',fr:'Carte (web)',de:'Karte (Web)',es:'Tarjeta (web)',pt:'Cartão (web)',ar:'البطاقات (الموقع)'},
 'Apple App Store (mobile)':{zh:'Apple App Store（移动端）',ja:'Apple App Store（モバイル）',ko:'Apple App Store(모바일)',fr:'Apple App Store (mobile)',de:'Apple App Store (mobil)',es:'Apple App Store (móvil)',pt:'Apple App Store (celular)',ar:'متجر Apple (الهاتف)'},
 'Google Play (mobile)':{zh:'Google Play（移动端）',ja:'Google Play（モバイル）',ko:'Google Play(모바일)',fr:'Google Play (mobile)',de:'Google Play (mobil)',es:'Google Play (móvil)',pt:'Google Play (celular)',ar:'Google Play (الهاتف)'},
 'Apple App Store (iOS)':{zh:'Apple App Store（iOS）'},
 'Google Play (Android)':{zh:'Google Play（Android）'},
 'Korean local cards':{zh:'韩国本地银行卡',ja:'韓国現地カード',ko:'한국 국내 카드',fr:'Cartes bancaires coréennes',de:'Koreanische Bankkarten',es:'Tarjetas bancarias coreanas',pt:'Cartões bancários coreanos',ar:'بطاقات البنوك الكورية'},
 'Bank debit through Link (where available)':{zh:'Link 银行扣款（适用地区）',ja:'Link 銀行引落（対応地域）',ko:'Link 은행 자동이체(지원 지역)',fr:'Prélèvement via Link (selon pays)',de:'Bankeinzug über Link (wo verfügbar)',es:'Débito bancario con Link (si disponible)',pt:'Débito bancário via Link (onde disponível)',ar:'الخصم المصرفي عبر Link (حيث يتوفر)'},
 'Stripe Instant Bank Payments (US only)':{zh:'Stripe 银行即时支付（仅美国）',ja:'Stripe 即時銀行決済（米国のみ）',ko:'Stripe 즉시 은행결제(미국)',fr:'Virement instantané Stripe (États-Unis)',de:'Stripe Sofort-Bankzahlung (nur USA)',es:'Pago bancario instantáneo Stripe (solo EE. UU.)',pt:'Pagamento bancário instantâneo Stripe (só EUA)',ar:'الدفع المصرفي الفوري Stripe (الولايات المتحدة فقط)'},
 'UPI (Go / Plus only)':{zh:'UPI（仅 Go / Plus）'},
 'Pix (Go / Plus / Pro)':{zh:'Pix（Go / Plus / Pro）'},
 'GoPay (Go / Plus / Pro)':{zh:'GoPay（Go / Plus / Pro）'},
 'GCash (Go / Plus / Pro)':{zh:'GCash（Go / Plus / Pro）'},
 'MoMo (web checkout: Go / Plus / Pro)':{zh:'MoMo（越南网页购买 Go / Plus / Pro）'},
 'ChatGPT wallet balance (eligible US purchases)':{zh:'ChatGPT 钱包余额（符合条件的美国订单）',ja:'ChatGPT ウォレット（米国の対象購入）',ko:'ChatGPT 지갑 잔액(미국 일부 구매)',fr:'Solde ChatGPT (achats US éligibles)',de:'ChatGPT-Guthaben (bestimmte US-Käufe)',es:'Saldo ChatGPT (compras elegibles en EE. UU.)',pt:'Saldo ChatGPT (compras elegíveis nos EUA)',ar:'رصيد محفظة ChatGPT (مشتريات أمريكية مؤهلة)'}
};
export function localizedPaymentName(name:string,language:Language){return paymentNames[name]?.[language]||name;}
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
 const methods=x.payments.methods,allSupported=completeSupportedRegionList(platform.id);
 const mainland=globalRegionFact(platform.id,'CN');
 const mainlandCopy=({zh:'中国大陆官方支持状态',en:'Mainland China: official support',ja:'中国本土の公式サポート',ko:'중국 본토 공식 지원',fr:'Chine continentale : prise en charge officielle',de:'Festlandchina: offiziell unterstützt',es:'China continental: compatibilidad oficial',pt:'China continental: suporte oficial',ar:'الصين القارية: الدعم الرسمي'} as Record<Language,string>)[language];
 return <section className="panel globalRegionPanel" aria-label={t.availability} dir={language==='ar'?'rtl':'ltr'}>
  <div className="globalRegionHeading"><div><h2>{t.availability} · {t.payment}</h2><p>{t.note}</p></div><MarketRegionSelect language={language} region={region} onChange={onChange}/></div>
  {region==='GLOBAL'&&<div className="globalMainlandSpotlight"><strong>{mainlandCopy}：{t.status[mainland.policy.status]}</strong><span>{t.untested}</span>{mainland.policy.source&&<a href={mainland.policy.source} target="_blank" rel="noopener noreferrer">{t.source} · {mainland.policy.checkedAt||''} ↗</a>}</div>}
  <div className="globalRegionFacts">
   <article><h3>{t.access}: {regionName(region,language)}</h3>
    <strong className={'regionStatus regionStatus-'+x.policy.status}>{region==='GLOBAL'?t.global:t.status[x.policy.status]}</strong>
    <small>{x.policy.reachability==='not_tested'?t.untested:''}</small>
    {x.policy.source&&<a href={x.policy.source} target="_blank" rel="noopener noreferrer">{t.source} · {x.policy.checkedAt||''} ↗</a>}
    {allSupported.length>0&&<details className="globalSupportedCountries"><summary>{({zh:'完整支持国家与地区',en:'Full officially supported country list',ja:'対応する国と地域の一覧',ko:'전체 공식 지원 국가 목록',fr:'Liste intégrale des pays pris en charge',de:'Alle offiziell unterstützten Länder',es:'Lista completa de países admitidos',pt:'Lista completa de países aceitos',ar:'القائمة الكاملة للبلدان المدعومة'} as Record<Language,string>)[language]} ({allSupported.length})</summary><div>{allSupported.map(code=><span key={code}>{regionName(code as RegionCode,language)}</span>)}</div></details>}
    {platform.id==='claude'&&<p className="regionPhoneNote">{({zh:'注册要求：来自官方支持地区、能够接收短信的手机号；VoIP 等虚拟号码不被接受。',en:'Sign-up needs an SMS-capable phone number from a supported region; VoIP numbers are not accepted.',ja:'登録には対応国のSMS受信可能な電話番号が必要です。VoIP番号は不可。',ko:'가입 시 지원 국가의 문자 수신 가능 전화번호가 필요하며 VoIP 번호는 허용되지 않습니다.',fr:'Inscription : numéro mobile capable de recevoir des SMS d’un pays pris en charge ; VoIP non accepté.',de:'Registrierung: SMS-fähige Rufnummer aus einem unterstützten Land; VoIP unzulässig.',es:'Registro: número capaz de recibir SMS de un país admitido; no se acepta VoIP.',pt:'Cadastro: número com SMS de região suportada; VoIP não é aceito.',ar:'يتطلب التسجيل رقم هاتف يستقبل الرسائل من بلد مدعوم، ولا تقبل أرقام VoIP.'} as Record<Language,string>)[language]} <a href="https://support.claude.com/en/articles/8287232-verify-your-phone-number" target="_blank" rel="noopener noreferrer">{t.source} ↗</a></p>}</article>
   <article><h3>{t.payment}</h3>
    {methods.length?<ul>{methods.map(m=><li key={m}>{localizedPaymentName(m,language)}</li>)}</ul>:<strong>{region==='GLOBAL'?t.market:x.policy.status==='unsupported'?t.status.unsupported:t.status.unknown}</strong>}
    <small>{x.payments.scope?x.payments.scope:t.market}</small>
    {platform.id==='midjourney'&&<small>{({zh:'官方明确不支持 PayPal。',en:'PayPal is explicitly not supported.',ja:'PayPalは非対応です。',ko:'PayPal은 지원되지 않습니다.',fr:'PayPal n’est pas accepté.',de:'PayPal wird nicht unterstützt.',es:'No se acepta PayPal.',pt:'PayPal não é aceito.',ar:'لا يُقبل PayPal.'} as Record<Language,string>)[language]}</small>}
    {x.payments.source&&<a href={x.payments.source} target="_blank" rel="noopener noreferrer">{t.source} · {x.payments.checkedAt} ↗</a>}</article>
  </div>
 </section>;
}
