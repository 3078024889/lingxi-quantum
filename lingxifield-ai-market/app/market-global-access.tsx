'use client';
import type {Language} from '../lib/v2';
import type {RegionCode} from '../lib/global-region-market';
import {REGIONS,regionName,regionCopy,globalRegionFact} from '../lib/global-region-market';
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
 'ChatGPT wallet balance (eligible US purchases)':{zh:'ChatGPT 钱包余额（符合条件的美国订单）',ja:'ChatGPT ウォレット（米国の対象購入）',ko:'ChatGPT 지갑 잔액(미국 일부 구매)',fr:'Solde ChatGPT (achats US éligibles)',de:'ChatGPT-Guthaben (bestimmte US-Käufe)',es:'Saldo ChatGPT (compras elegibles en EE. UU.)',pt:'Saldo ChatGPT (compras elegíveis nos EUA)',ar:'رصيد محفظة ChatGPT (مشتريات أمريكية مؤهلة)'}
};
export function localizedPaymentName(name:string,language:Language){return paymentNames[name]?.[language]||name;}
export function MarketRegionSelect({language,region,onChange}:{language:Language;region:RegionCode;onChange:(next:RegionCode)=>void}){
 const t=regionCopy(language);
 return <label className="marketRegionSelect">{t.region}
  <select aria-label={t.region} value={region} onChange={e=>onChange(e.target.value as RegionCode)}>
   {REGIONS.map(r=><option key={r} value={r}>{regionName(r,language)}</option>)}
  </select>
 </label>;
}
export default function MarketGlobalAccess({platform,language,region,onChange}:{platform:Platform;language:Language;region:RegionCode;onChange:(next:RegionCode)=>void}){
 const t=regionCopy(language),x=globalRegionFact(platform.id,region);
 const methods=x.payments.methods;
 return <section className="panel globalRegionPanel" aria-label={t.availability} dir={language==='ar'?'rtl':'ltr'}>
  <div className="globalRegionHeading"><div><h2>{t.availability} · {t.payment}</h2><p>{t.note}</p></div><MarketRegionSelect language={language} region={region} onChange={onChange}/></div>
  <div className="globalRegionFacts">
   <article><h3>{t.access}: {regionName(region,language)}</h3>
    <strong className={'regionStatus regionStatus-'+x.policy.status}>{region==='GLOBAL'?t.global:t.status[x.policy.status]}</strong>
    <small>{x.policy.reachability==='not_tested'?t.untested:''}</small>
    {x.policy.source&&<a href={x.policy.source} target="_blank" rel="noopener noreferrer">{t.source} · {x.policy.checkedAt||''} ↗</a>}</article>
   <article><h3>{t.payment}</h3>
    {methods.length?<ul>{methods.map(m=><li key={m}>{localizedPaymentName(m,language)}</li>)}</ul>:<strong>{region==='GLOBAL'?t.market:x.policy.status==='unsupported'?t.status.unsupported:t.status.unknown}</strong>}
    <small>{t.market}</small>
    {x.payments.source&&<a href={x.payments.source} target="_blank" rel="noopener noreferrer">{t.source} · {x.payments.checkedAt} ↗</a>}</article>
  </div>
 </section>;
}
