"use client";
import MiniPaymentBoundary from "@/components/MiniPaymentBoundary";
import {Suspense,useEffect,useMemo,useState} from "react";
import {useSearchParams} from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PaypalHelp from "@/components/PaypalHelp";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
import {type LingxiLang,useLingxiLang} from "@/lib/lingxi-i18n";
import {getUsdBalanceProduct} from "@/lib/usd-products";
import {getProduct} from "@/lib/plans";
import type {Product} from "@/lib/plans";
import {isMarketProductId} from "@/lib/sasi-marketplace/fees";
import {createClient} from "@/lib/supabase/client";

type CheckoutCopy={
 missing:string;title:string;lead:string;sasi:string;credits:(a:string)=>string;
 fx:string;opening:string;pay:(a:string)=>string;unavailable:string;error:string;
 softwareTitle:string;softwareLead:string;marketTitle:string;marketLead:string;toolTitle:string;toolLead:string;
};
const COPY:Record<LingxiLang,CheckoutCopy>={
 zh:{
  missing:"找不到这个美元商品或充值套餐。",title:"充值美元余额",
  lead:"这笔支付会按美元原值进入美元余额。充值多少美元，就到账多少美元；不会换成人民币余额。",
  sasi:"SASI 美元余额",credits:a=>`到账 $${a} USD 余额`,
  fx:"PayPal 账户如使用 EUR、GBP 等币种，换汇由 PayPal 在付款页处理；灵犀场只核验本订单的 USD 金额。",
  opening:"正在连接 PayPal…",pay:a=>`使用 PayPal 支付 $${a}`,
  unavailable:"PayPal 或该商品的交付条件尚未开放。",error:"暂时无法打开 PayPal，请稍后再试。",
  softwareTitle:"购买软件授权",softwareLead:"以美元完成软件授权付款。只有在安装包、订单和交付权限均通过核验后，才会开放购买。",
  marketTitle:"购买软件作品",marketLead:"以美元购买已审核发布的软件作品。付款核验后按私有文件授权交付。",
  toolTitle:"购买全场工具通用包",toolLead:"使用 PayPal 支付美元价格，支付核验后自动开通对应期限。"
 },
 en:{
  missing:"This USD product or top-up option was not found.",title:"Top up USD balance",
  lead:"Your payment is credited to the USD balance at face value. Dollars stay dollars and are not converted into CNY balance.",
  sasi:"SASI USD balance",credits:a=>`Credits $${a} USD balance`,
  fx:"If your PayPal account uses EUR, GBP or another currency, PayPal handles conversion on its checkout page; LINGXIFIELD verifies only this order's USD amount.",
  opening:"Opening PayPal…",pay:a=>`Pay $${a} with PayPal`,
  unavailable:"PayPal or this product's delivery requirements are not available yet.",error:"Unable to open PayPal right now. Please try again later.",
  softwareTitle:"Purchase software license",softwareLead:"Pay in USD for a software license. Checkout opens only after the package, order and delivery entitlement are verified.",
  marketTitle:"Purchase software listing",marketLead:"Purchase an approved software listing in USD. The verified order unlocks private-file delivery.",
  toolTitle:"Purchase the all-tools pass",toolLead:"Pay the USD price with PayPal. The selected access period activates after payment verification."
 },
 ja:{
  missing:"このUSD商品またはチャージは見つかりません。",title:"USD残高をチャージ",
  lead:"支払ったUSDと同額がUSD残高に反映され、CNYには変換されません。",
  sasi:"SASI USD残高",credits:a=>`$${a} USDを反映`,
  fx:"EURやGBPなどを使うPayPalアカウントの換算はPayPal側で処理されます。LINGXIFIELDは注文のUSD金額のみ確認します。",
  opening:"PayPalを開いています…",pay:a=>`PayPalで $${a} を支払う`,
  unavailable:"PayPalまたは商品の提供条件がまだ利用できません。",error:"PayPalを開けません。後でもう一度お試しください。",
  softwareTitle:"ソフトウェアライセンスを購入",softwareLead:"USDでライセンスを購入します。パッケージと配送権限の確認後に購入できます。",
  marketTitle:"ソフトウェア作品を購入",marketLead:"審査済みソフトウェア作品をUSDで購入します。決済確認後に非公開ファイルを提供します。",
  toolTitle:"全ツールパスを購入",toolLead:"PayPalでUSD決済し、確認後に選択期間が有効になります。"
 },
 ko:{
  missing:"USD 상품 또는 충전 옵션을 찾을 수 없습니다.",title:"USD 잔액 충전",
  lead:"결제한 USD 금액이 그대로 USD 잔액에 반영되며 CNY로 전환되지 않습니다.",
  sasi:"SASI USD 잔액",credits:a=>`$${a} USD 잔액 적립`,
  fx:"EUR, GBP 등 다른 통화를 사용하는 PayPal 계정의 환전은 PayPal에서 처리합니다. LINGXIFIELD는 주문의 USD 금액만 확인합니다.",
  opening:"PayPal 연결 중…",pay:a=>`PayPal로 $${a} 결제`,
  unavailable:"PayPal 또는 상품 배송 조건이 아직 준비되지 않았습니다.",error:"PayPal을 열 수 없습니다. 잠시 후 다시 시도하세요.",
  softwareTitle:"소프트웨어 라이선스 구매",softwareLead:"USD로 라이선스를 결제합니다. 패키지와 배송 권한 검증 후 구매할 수 있습니다.",
  marketTitle:"소프트웨어 작품 구매",marketLead:"승인된 소프트웨어 작품을 USD로 구매합니다. 결제 확인 후 비공개 파일을 제공합니다.",
  toolTitle:"전체 도구 패스 구매",toolLead:"PayPal로 USD 결제 후 선택한 기간이 활성화됩니다."
 },
 fr:{
  missing:"Ce produit ou cette recharge USD est introuvable.",title:"Recharger le solde USD",
  lead:"Le montant payé en USD est crédité à l'identique sur votre solde USD, sans conversion en CNY.",
  sasi:"Solde SASI en USD",credits:a=>`Crédite $${a} USD`,
  fx:"PayPal gère la conversion des comptes en EUR, GBP ou autre devise. LINGXIFIELD vérifie uniquement le montant USD de la commande.",
  opening:"Ouverture de PayPal…",pay:a=>`Payer $${a} avec PayPal`,
  unavailable:"PayPal ou les conditions de livraison ne sont pas encore disponibles.",error:"Impossible d'ouvrir PayPal. Réessayez plus tard.",
  softwareTitle:"Acheter une licence logicielle",softwareLead:"Payez la licence en USD. L'achat s'ouvre après validation du paquet et des droits de livraison.",
  marketTitle:"Acheter un logiciel publié",marketLead:"Achetez en USD un logiciel approuvé. La livraison privée suit la confirmation du paiement.",
  toolTitle:"Acheter le pass outils",toolLead:"Payez en USD avec PayPal ; la période choisie est activée après vérification."
 },
 de:{
  missing:"Dieses USD-Produkt oder diese Aufladung wurde nicht gefunden.",title:"USD-Guthaben aufladen",
  lead:"Der gezahlte USD-Betrag wird 1:1 Ihrem USD-Guthaben gutgeschrieben und nicht in CNY umgerechnet.",
  sasi:"SASI-Guthaben in USD",credits:a=>`Gutschrift von $${a} USD`,
  fx:"PayPal übernimmt die Umrechnung für Konten in EUR, GBP oder anderen Währungen. LINGXIFIELD prüft nur den USD-Betrag.",
  opening:"PayPal wird geöffnet…",pay:a=>`$${a} mit PayPal bezahlen`,
  unavailable:"PayPal oder die Lieferbedingungen sind noch nicht verfügbar.",error:"PayPal kann derzeit nicht geöffnet werden. Bitte später erneut versuchen.",
  softwareTitle:"Softwarelizenz kaufen",softwareLead:"Bezahlen Sie die Lizenz in USD. Der Kauf wird erst nach Paket- und Lieferprüfung freigegeben.",
  marketTitle:"Softwareangebot kaufen",marketLead:"Kaufen Sie ein geprüftes Softwareangebot in USD. Die private Lieferung folgt nach Zahlungsprüfung.",
  toolTitle:"Werkzeug-Pass kaufen",toolLead:"Bezahlen Sie in USD mit PayPal. Der gewählte Zeitraum wird nach Zahlungsprüfung aktiviert."
 },
 es:{
  missing:"No encontramos este producto o recarga en USD.",title:"Recargar saldo USD",
  lead:"El importe pagado en USD se acredita por el mismo valor en tu saldo USD y no se convierte a CNY.",
  sasi:"Saldo SASI en USD",credits:a=>`Acredita $${a} USD`,
  fx:"PayPal gestiona la conversión de cuentas en EUR, GBP u otras monedas. LINGXIFIELD solo verifica el importe USD del pedido.",
  opening:"Abriendo PayPal…",pay:a=>`Pagar $${a} con PayPal`,
  unavailable:"PayPal o las condiciones de entrega aún no están disponibles.",error:"No podemos abrir PayPal ahora. Inténtalo más tarde.",
  softwareTitle:"Comprar licencia de software",softwareLead:"Paga la licencia en USD. La compra se habilita tras verificar el paquete y la entrega.",
  marketTitle:"Comprar software publicado",marketLead:"Compra en USD un software aprobado. La entrega privada se habilita tras verificar el pago.",
  toolTitle:"Comprar el pase de herramientas",toolLead:"Paga en USD con PayPal. El periodo elegido se activa tras verificar el pago."
 },
 pt:{
  missing:"Este produto ou recarga em USD não foi encontrado.",title:"Recarregar saldo em USD",
  lead:"O valor pago em USD entra pelo mesmo valor no saldo em USD e não é convertido para CNY.",
  sasi:"Saldo SASI em USD",credits:a=>`Credita $${a} USD`,
  fx:"O PayPal trata da conversão para contas em EUR, GBP ou outras moedas. A LINGXIFIELD verifica apenas o valor em USD.",
  opening:"A abrir PayPal…",pay:a=>`Pagar $${a} com PayPal`,
  unavailable:"O PayPal ou os requisitos de entrega ainda não estão disponíveis.",error:"Não foi possível abrir o PayPal. Tente novamente mais tarde.",
  softwareTitle:"Comprar licença de software",softwareLead:"Pague a licença em USD. A compra abre após a validação do pacote e da entrega.",
  marketTitle:"Comprar software publicado",marketLead:"Compre em USD um software aprovado. A entrega privada ocorre após a confirmação do pagamento.",
  toolTitle:"Comprar passe de ferramentas",toolLead:"Pague em USD com PayPal. O período escolhido é ativado após a verificação."
 },
 ar:{
  missing:"تعذر العثور على المنتج أو خيار الشحن بالدولار.",title:"شحن رصيد USD",
  lead:"تُضاف قيمة الدفع بالدولار إلى رصيد USD بالقيمة نفسها ولا تُحوّل إلى CNY.",
  sasi:"رصيد SASI بالدولار",credits:a=>`إضافة $${a} USD`,
  fx:"يتولى PayPal تحويل حسابات EUR أو GBP أو العملات الأخرى. تتحقق LINGXIFIELD فقط من قيمة الطلب بالدولار.",
  opening:"جارٍ فتح PayPal…",pay:a=>`الدفع عبر PayPal بقيمة $${a}`,
  unavailable:"PayPal أو شروط تسليم المنتج غير متاحة بعد.",error:"تعذر فتح PayPal الآن. حاول مرة أخرى لاحقًا.",
  softwareTitle:"شراء ترخيص برنامج",softwareLead:"ادفع الترخيص بالدولار. لا يتاح الشراء إلا بعد التحقق من الحزمة والتسليم.",
  marketTitle:"شراء برنامج منشور",marketLead:"اشترِ برنامجًا معتمدًا بالدولار. يتم فتح التسليم الخاص بعد التحقق من الدفع.",
  toolTitle:"شراء باقة الأدوات",toolLead:"ادفع بالدولار عبر PayPal، وتُفعّل المدة المختارة بعد التحقق."
 }
};

type Payable={id:string;name:string;nameEn:string;amountUsd:number;group:"wallet"|"toolpass"|"software"|"market";note?:string;};
function Inner(){
 const sp=useSearchParams()??new URLSearchParams();
 const{lang}=useLingxiLang(),c=COPY[lang];
 const productId=sp.get("productId")||"";
 const balance=getUsdBalanceProduct(productId);
 const catalog=getProduct(productId);
 const [marketProduct,setMarketProduct]=useState<Product|null>(null);
 const [marketReady,setMarketReady]=useState(false);
 const [marketLoading,setMarketLoading]=useState(isMarketProductId(productId));
 const [buyer,setBuyer]=useState("");
 const [busy,setBusy]=useState(false);
 const [paypalReady,setPaypalReady]=useState(false);
 const [productReady,setProductReady]=useState<boolean|null>(null);
 const [error,setError]=useState("");

 const product:Payable|null=useMemo(()=>{
  if(balance)return{id:balance.id,name:balance.nameZh,nameEn:balance.nameEn,amountUsd:balance.amountUsd,group:"wallet"};
  if(catalog&&["toolpass","software"].includes(catalog.group))
   return{id:catalog.id,name:catalog.name,nameEn:catalog.nameEn,amountUsd:catalog.priceUsd,group:catalog.group as "toolpass"|"software",note:catalog.note};
  if(marketProduct)return{id:marketProduct.id,name:marketProduct.name,nameEn:marketProduct.nameEn,amountUsd:marketProduct.priceUsd,group:"market",note:marketProduct.note};
  return null;
 },[balance,catalog,marketProduct]);

 useEffect(()=>{
  const s=createClient();
  void s.auth.getUser().then(({data})=>setBuyer(data.user?.email||""));
  void fetch("/api/pay/providers",{cache:"no-store"}).then(r=>r.json()).then(d=>setPaypalReady(d?.paypal===true)).catch(()=>setPaypalReady(false));
 },[]);
 useEffect(()=>{
  if(!isMarketProductId(productId)){setMarketLoading(false);setMarketProduct(null);setMarketReady(false);return;}
  let active=true;setMarketLoading(true);
  fetch("/api/sasi/marketplace/product?id="+encodeURIComponent(productId),{cache:"no-store"})
   .then(r=>r.ok?r.json():null)
   .then(x=>{if(!active)return;setMarketProduct(x?.product||null);setMarketReady(x?.availableUsd===true);})
   .catch(()=>{if(active){setMarketProduct(null);setMarketReady(false)}})
   .finally(()=>{if(active)setMarketLoading(false)});
  return()=>{active=false};
 },[productId]);
 useEffect(()=>{
  if(!product){setProductReady(null);return;}
  if(product.group==="wallet"){setProductReady(true);return;}
  if(product.group==="market"){setProductReady(marketReady);return;}
  let active=true;
  const url=product.group==="software"?"/api/sasi/software/catalog":"/api/tools/pass?currency=USD";
  fetch(url,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(v=>{
   if(!active)return;
   const ready=product.group==="software"
    ?v?.products?.[product.id]?.availableUsd===true
    :v?.available===true;
   setProductReady(ready);
  }).catch(()=>{if(active)setProductReady(false)});
  return()=>{active=false};
 },[product?.id,product?.group,marketReady]);
 const amount=product?.amountUsd.toFixed(2)||"0.00";
 const title=product?.group==="software"?c.softwareTitle:product?.group==="market"?c.marketTitle:product?.group==="toolpass"?c.toolTitle:c.title;
 const lead=product?.group==="software"?c.softwareLead:product?.group==="market"?c.marketLead:product?.group==="toolpass"?c.toolLead:c.lead;
 const itemName=product?.group==="wallet"?c.sasi:product?.name||"";
 const defaultReturn=product?.group==="software"?"/account/software":product?.group==="market"?"/sasi/marketplace":product?.group==="toolpass"?"/tools/pass":"/ai-wallet";
 const requestedReturn=sp.get("redirect")||defaultReturn;
 const returnPath=requestedReturn.startsWith("/")&&!requestedReturn.startsWith("//")&&!requestedReturn.includes("\\")?requestedReturn:defaultReturn;

 async function pay(){
  if(!product||paypalReady!==true||productReady!==true)return;
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/pay/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId:product.id,returnPath})});
   const d=await r.json().catch(()=>({}));
   if(r.status===401){location.href=`/account?next=${encodeURIComponent(location.pathname+location.search)}`;return;}
   if(!r.ok||!d.url)throw new Error(d.error||"PAYPAL_CREATE_FAILED");
   location.assign(d.url);
  }catch{setError(c.error)}finally{setBusy(false)}
 }
 if(!product){
  return <><Nav/><main className="mx-auto max-w-xl px-6 py-24 text-center text-sm">{marketLoading?"Loading…":c.missing}</main><Footer/></>;
 }
 return <><Nav/><main className="mx-auto max-w-xl px-6 py-16 pt-28" dir={lang==="ar"?"rtl":"ltr"}>
  <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7 lx-checkout-usd-card">
   <div className="lx-page-title-line"><LingxiMiniIcon name="wallet" size="title"/><p className="text-sm text-[var(--lx-faint)]">PayPal · USD</p></div>
   <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]">{title}</h1>
   <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">{lead}</p>
   <div className="mt-7 rounded-2xl border border-[var(--lx-line)] p-5">
    <div className="flex items-start justify-between gap-4">
     <div><b className="text-base text-[var(--lx-ink)]">{itemName}</b>
      {product.group!=="wallet"&&<p className="mt-2 text-sm text-[var(--lx-muted)]">{product.note||product.nameEn}</p>}
      <p className="mt-2 text-sm text-[var(--lx-muted)]">{product.group==="wallet"?c.credits(amount):product.nameEn}</p>
      {buyer&&<p className="mt-2 text-xs text-[var(--lx-faint)]">{buyer}</p>}
     </div>
     <strong className="text-3xl text-[var(--lx-ink)]">${amount}</strong>
    </div>
   </div>
   <p className="mt-4 text-xs leading-6 text-[var(--lx-faint)]">{c.fx}</p>
   <button disabled={busy||!paypalReady||productReady!==true} onClick={pay} className="mt-6 w-full rounded-xl bg-[#0070ba] px-5 py-4 text-sm font-semibold text-white disabled:opacity-40">{busy?c.opening:c.pay(amount)}</button>
   {paypalReady===false&&<p className="mt-3 text-sm text-amber-700">{c.unavailable}</p>}
   {paypalReady&&productReady===false&&<p className="mt-3 text-sm text-amber-700">{c.unavailable}</p>}
   {error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}
  </section>
  <div className="mt-6"><PaypalHelp compact/></div>
 </main><Footer/></>;
}
export default function Page(){return <MiniPaymentBoundary><Suspense fallback={<div className="p-20 text-center">…</div>}><Inner/></Suspense></MiniPaymentBoundary>}
