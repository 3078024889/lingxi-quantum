'use client';
import {useEffect,useState} from 'react';
import type {Language,Currency} from '../lib/v2';
type Provider={provider:'alipay'|'wechat'|'paypal';checkoutAvailable:boolean;mode:string;reason:string};
const TEXT:Record<Language,{title:string,info:string,ready:string,closed:string,free:string,claim:string,status:string}>={
 zh:{title:'平台收款与厂商推广',info:'支付宝与微信支付按人民币结算；PayPal 按美元结算。只在完成商户授权、企业身份审核、订单与退款验收后开放支付；付费推广不改变自然排名。',ready:'支付已开放',closed:'商户结算验收中 · 暂不扣款',free:'每家公司可免费认领 3 个产品，身份核验后生效。',claim:'免费认领产品',status:'可用支付渠道'},
 en:{title:'Publisher billing and promotion',info:'Alipay and WeChat Pay use CNY; PayPal uses USD. Checkout opens only after merchant approval, publisher verification and order/refund tests. Sponsored placement never changes organic rankings.',ready:'Checkout available',closed:'Merchant acceptance pending · no charge',free:'Each company can claim up to 3 products free after verification.',claim:'Claim products free',status:'Payment availability'},
 ja:{title:'運営者向け決済',info:'Alipay・WeChat Pay は CNY、PayPal は USD。本人確認と請求・返金検証後に決済を公開。スポンサー枠は自然順位に影響しません。',ready:'利用可能',closed:'審査中・請求なし',free:'企業ごとに3製品まで無料認証可能。',claim:'無料認証を申請',status:'決済対応状況'},
 ko:{title:'공급업체 결제',info:'Alipay·WeChat Pay는 CNY, PayPal은 USD. 판매자 인증, 청구 및 환불 검증 후 결제를 시작합니다. 유료 노출은 자연 순위에 영향을 주지 않습니다.',ready:'결제 가능',closed:'심사 중 · 청구 없음',free:'기업당 최대 3개 제품 무료 인증.',claim:'무료 인증 신청',status:'결제 상태'},
 fr:{title:'Paiements des éditeurs',info:'Alipay et WeChat Pay en CNY, PayPal en USD. Activation après validation du marchand et des commandes/remboursements. Le sponsorisé ne modifie pas le classement organique.',ready:'Paiement actif',closed:'Validation en cours · aucun débit',free:'Jusqu’à 3 produits réclamés gratuitement par société, après vérification.',claim:'Réclamer gratuitement',status:'Disponibilité'},
 de:{title:'Zahlungen für Anbieter',info:'Alipay und WeChat Pay in CNY; PayPal in USD. Freigabe nach Händler-, Bestell- und Erstattungsprüfung. Werbung ändert keine organischen Ranglisten.',ready:'Zahlung verfügbar',closed:'Prüfung läuft · keine Abbuchung',free:'Bis zu 3 kostenlose Produktansprüche je Unternehmen nach Prüfung.',claim:'Kostenlos beanspruchen',status:'Zahlungsstatus'},
 es:{title:'Pagos para proveedores',info:'Alipay y WeChat Pay en CNY; PayPal en USD. Pago sólo después de verificar al vendedor y probar pedidos y reembolsos. El patrocinio no altera el ranking orgánico.',ready:'Pago disponible',closed:'Verificación pendiente · sin cobro',free:'Hasta 3 productos gratis por empresa tras la verificación.',claim:'Reclamar productos gratis',status:'Estado de pago'},
 pt:{title:'Pagamentos para fornecedores',info:'Alipay e WeChat Pay em CNY; PayPal em USD. Ativação após validar o vendedor e os pedidos/reembolsos. Patrocínio não altera o ranking orgânico.',ready:'Pagamento disponível',closed:'Aguardando validação · sem cobrança',free:'Até 3 produtos gratuitos por empresa após verificação.',claim:'Reivindicar grátis',status:'Disponibilidade'},
 ar:{title:'مدفوعات مزودي الأدوات',info:'Alipay وWeChat Pay باليوان الصيني؛ PayPal بالدولار. يتطلب تفعيل الدفع توثيق التاجر واختبار الطلبات والاسترداد. لا تؤثر الإعلانات على الترتيب العضوي.',ready:'الدفع متاح',closed:'بانتظار التحقق · لا رسوم',free:'يمكن لكل شركة المطالبة بثلاثة منتجات مجاناً بعد التحقق.',claim:'المطالبة مجاناً',status:'حالة الدفع'}
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
