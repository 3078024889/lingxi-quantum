'use client';
import {useEffect,useState} from 'react';
import type {Language,Currency} from '../lib/v2';
type Provider={provider:'alipay'|'wechat'|'paypal';checkoutAvailable:boolean;mode:string;reason:string};
const TEXT:Record<Language,{title:string,info:string,ready:string,closed:string,free:string,claim:string,status:string}>={
 zh:{title:'平台收款与厂商推广',info:'推广套餐可选择人民币或美元，具体支付方式会在开放购买时显示。推广内容均有明确标识。',ready:'支付已开放',closed:'暂未开放购买',free:'每家公司可免费认领 3 个产品，身份核验后生效。',claim:'免费认领产品',status:'可用支付渠道'},
 en:{title:'Publisher billing and promotion',info:'Promotion plans can be viewed in CNY or USD. Payment options will appear when checkout opens. Sponsored content is clearly labeled.',ready:'Checkout available',closed:'Purchases not open yet',free:'Each company can claim up to 3 products free after verification.',claim:'Claim products free',status:'Payment availability'},
 ja:{title:'運営者向け決済',info:'プロモーションプランはCNYまたはUSDで表示。購入時に決済方法を案内し、広告には明確に表示します。',ready:'利用可能',closed:'購入準備中',free:'企業ごとに3製品まで無料認証可能。',claim:'無料認証を申請',status:'決済対応状況'},
 ko:{title:'공급업체 결제',info:'프로모션 요금은 CNY 또는 USD로 표시됩니다. 결제 수단은 구매가 열리면 표시되며 광고는 별도 표시합니다.',ready:'결제 가능',closed:'구매 준비 중',free:'기업당 최대 3개 제품 무료 인증.',claim:'무료 인증 신청',status:'결제 상태'},
 fr:{title:'Paiements des éditeurs',info:'Tarifs promotionnels en CNY ou USD. Les moyens de paiement seront affichés à l’ouverture des achats. Les annonces sont identifiées.',ready:'Paiement actif',closed:'Achats à venir',free:'Jusqu’à 3 produits réclamés gratuitement par société, après vérification.',claim:'Réclamer gratuitement',status:'Disponibilité'},
 de:{title:'Zahlungen für Anbieter',info:'Promotionstarife in CNY oder USD. Zahlungsarten erscheinen beim Kaufstart. Werbung wird klar gekennzeichnet.',ready:'Zahlung verfügbar',closed:'Noch nicht buchbar',free:'Bis zu 3 kostenlose Produktansprüche je Unternehmen nach Prüfung.',claim:'Kostenlos beanspruchen',status:'Zahlungsstatus'},
 es:{title:'Pagos para proveedores',info:'Planes promocionales en CNY o USD. Los métodos de pago aparecerán cuando se habiliten las compras. La publicidad está identificada.',ready:'Pago disponible',closed:'Compras próximamente',free:'Hasta 3 productos gratis por empresa tras la verificación.',claim:'Reclamar productos gratis',status:'Estado de pago'},
 pt:{title:'Pagamentos para fornecedores',info:'Planos promocionais em CNY ou USD. Os métodos de pagamento aparecerão quando as compras abrirem. Anúncios identificados.',ready:'Pagamento disponível',closed:'Compras em breve',free:'Até 3 produtos gratuitos por empresa após verificação.',claim:'Reivindicar grátis',status:'Disponibilidade'},
 ar:{title:'مدفوعات مزودي الأدوات',info:'أسعار الترويج باليوان أو الدولار. ستظهر وسائل الدفع عند فتح الشراء، مع تمييز الإعلانات بوضوح.',ready:'الدفع متاح',closed:'الشراء غير متاح حالياً',free:'يمكن لكل شركة المطالبة بثلاثة منتجات مجاناً بعد التحقق.',claim:'المطالبة مجاناً',status:'حالة الدفع'}
};
const names={alipay:'支付宝 Alipay',wechat:'微信支付 WeChat Pay',paypal:'PayPal'};
export default function MarketVendorPaymentChannels({language,currency}:{language:Language;currency:Currency}){
 const t=TEXT[language];const [items,setItems]=useState<Provider[]>([]);
 useEffect(()=>{const c=new AbortController();fetch('/api/v1/billing/providers',{signal:c.signal,cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(!c.signal.aborted&&Array.isArray(d?.providers))setItems(d.providers)}).catch(()=>{});return()=>c.abort()},[]);
 const active=items.filter(p=>(currency==='USD'?p.provider==='paypal':p.provider!=='paypal'));
 const fallback:Provider[]=currency==='USD'?[{provider:'paypal',checkoutAvailable:false,mode:'not_live',reason:'merchant_credentials_required'}]:[{provider:'alipay',checkoutAvailable:false,mode:'not_live',reason:'merchant_credentials_required'},{provider:'wechat',checkoutAvailable:false,mode:'not_live',reason:'merchant_credentials_required'}];
 return <section className="marketPaymentChannels" aria-label={t.status}><h3>{t.title}</h3><p>{t.info}</p>
  <div className="marketPaymentChannelList">{(active.length?active:fallback).map(p=><div key={p.provider} className="marketPaymentChannel"><strong>{names[p.provider]}</strong><span>{currency==='USD'?'USD':'CNY'} · {p.checkoutAvailable?t.ready:t.closed}</span></div>)}</div>
  <p><strong>{t.free}</strong> <a href="/vendor/claim">{t.claim} ↗</a></p>
 </section>;
}
