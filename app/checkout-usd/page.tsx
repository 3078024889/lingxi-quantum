"use client";

import {Suspense,useEffect,useMemo,useState} from "react";
import {useSearchParams} from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PaypalHelp from "@/components/PaypalHelp";
import {type LingxiLang,useLingxiLang} from "@/lib/lingxi-i18n";
import {getUsdBalanceProduct} from "@/lib/usd-products";
import {createClient} from "@/lib/supabase/client";

type CheckoutCopy={
  missing:string;title:string;lead:string;ai:string;sasi:string;credits:(a:string)=>string;
  fx:string;opening:string;pay:(a:string)=>string;unavailable:string;error:string;
};

const COPY:Record<LingxiLang,CheckoutCopy>={
  zh:{missing:"找不到这个美元充值套餐。",title:"充值美元余额",lead:"这笔支付会按美元原值进入你的美元余额。充值多少美元，就到账多少美元；不会换成人民币余额。",ai:"AI 美元余额",sasi:"SASI 创作美元余额",credits:a=>`到账 $${a} USD 余额`,fx:"如果你的 PayPal 账户主要使用 EUR、GBP 等币种，PayPal 会在付款页处理换汇；灵犀场只核验本订单的 USD 金额。",opening:"正在连接 PayPal…",pay:a=>`使用 PayPal 支付 $${a}`,unavailable:"PayPal 当前暂不可用，请稍后再试。",error:"暂时无法打开 PayPal，请稍后再试。"},
  en:{missing:"This USD top-up option was not found.",title:"Top up USD balance",lead:"Your payment is credited to the USD balance at face value. Dollars stay dollars and are not converted into CNY balance.",ai:"AI USD balance",sasi:"SASI creation USD balance",credits:a=>`Credits $${a} USD balance`,fx:"If your PayPal account uses EUR, GBP or another currency, PayPal handles conversion on its checkout page; LINGXIFIELD verifies only the USD amount of this order.",opening:"Opening PayPal…",pay:a=>`Pay $${a} with PayPal`,unavailable:"PayPal is temporarily unavailable. Please try again later.",error:"Unable to open PayPal right now. Please try again later."},
  ja:{missing:"このUSDチャージが見つかりません。",title:"USD残高をチャージ",lead:"お支払い金額と同額のUSDがUSD残高に反映されます。人民元残高には変換されません。",ai:"AI USD残高",sasi:"SASI制作 USD残高",credits:a=>`$${a} USDを反映`,fx:"PayPalアカウントがEURやGBPなどを利用している場合、換算はPayPalの支払い画面で行われます。LINGXIFIELDはこの注文のUSD金額のみ確認します。",opening:"PayPalを開いています…",pay:a=>`PayPalで$${a}を支払う`,unavailable:"PayPalは現在一時的に利用できません。後でもう一度お試しください。",error:"現在PayPalを開けません。後でもう一度お試しください。"},
  ko:{missing:"해당 USD 충전 옵션을 찾을 수 없습니다.",title:"USD 잔액 충전",lead:"결제한 USD 금액이 그대로 USD 잔액에 반영됩니다. CNY 잔액으로 전환되지 않습니다.",ai:"AI USD 잔액",sasi:"SASI 제작 USD 잔액",credits:a=>`$${a} USD 잔액 적립`,fx:"PayPal 계정이 EUR, GBP 등 다른 통화를 사용하면 환전은 PayPal 결제 화면에서 처리됩니다. LINGXIFIELD는 이 주문의 USD 금액만 확인합니다.",opening:"PayPal 연결 중…",pay:a=>`PayPal로 $${a} 결제`,unavailable:"PayPal을 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도하세요.",error:"지금은 PayPal을 열 수 없습니다. 잠시 후 다시 시도하세요."},
  fr:{missing:"Cette recharge USD est introuvable.",title:"Recharger le solde USD",lead:"Le montant payé en USD est crédité à l'identique sur votre solde USD. Il n'est pas converti en CNY.",ai:"Solde IA en USD",sasi:"Solde de création SASI en USD",credits:a=>`Crédite $${a} USD`,fx:"Si votre compte PayPal utilise EUR, GBP ou une autre devise, PayPal gère la conversion sur sa page de paiement ; LINGXIFIELD vérifie uniquement le montant USD de cette commande.",opening:"Ouverture de PayPal…",pay:a=>`Payer $${a} avec PayPal`,unavailable:"PayPal est temporairement indisponible. Réessayez plus tard.",error:"Impossible d'ouvrir PayPal pour le moment. Réessayez plus tard."},
  de:{missing:"Diese USD-Aufladung wurde nicht gefunden.",title:"USD-Guthaben aufladen",lead:"Der gezahlte USD-Betrag wird 1:1 Ihrem USD-Guthaben gutgeschrieben und nicht in CNY umgerechnet.",ai:"AI-USD-Guthaben",sasi:"SASI-Kreativguthaben in USD",credits:a=>`$${a} USD Guthaben`,fx:"Wenn Ihr PayPal-Konto EUR, GBP oder eine andere Währung nutzt, übernimmt PayPal die Umrechnung auf der Zahlungsseite; LINGXIFIELD prüft nur den USD-Betrag dieser Bestellung.",opening:"PayPal wird geöffnet…",pay:a=>`$${a} mit PayPal bezahlen`,unavailable:"PayPal ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.",error:"PayPal kann derzeit nicht geöffnet werden. Bitte versuchen Sie es später erneut."},
  es:{missing:"No encontramos esta recarga en USD.",title:"Recargar saldo USD",lead:"El importe pagado en USD se acredita por el mismo valor en tu saldo USD y no se convierte a CNY.",ai:"Saldo IA en USD",sasi:"Saldo SASI en USD",credits:a=>`Acredita $${a} USD`,fx:"Si tu cuenta PayPal usa EUR, GBP u otra moneda, PayPal gestiona la conversión en su página de pago; LINGXIFIELD solo verifica el importe USD de este pedido.",opening:"Abriendo PayPal…",pay:a=>`Pagar $${a} con PayPal`,unavailable:"PayPal no está disponible temporalmente. Inténtalo más tarde.",error:"No podemos abrir PayPal ahora mismo. Inténtalo más tarde."},
  pt:{missing:"Esta recarga em USD não foi encontrada.",title:"Recarregar saldo em USD",lead:"O valor pago em USD entra pelo mesmo valor no seu saldo em USD e não é convertido para CNY.",ai:"Saldo de IA em USD",sasi:"Saldo de criação SASI em USD",credits:a=>`Credita $${a} USD`,fx:"Se a sua conta PayPal usar EUR, GBP ou outra moeda, o PayPal trata da conversão na página de pagamento; a LINGXIFIELD verifica apenas o valor em USD desta encomenda.",opening:"A abrir o PayPal…",pay:a=>`Pagar $${a} com PayPal`,unavailable:"O PayPal está temporariamente indisponível. Tente novamente mais tarde.",error:"Não foi possível abrir o PayPal agora. Tente novamente mais tarde."},
  ar:{missing:"تعذر العثور على خيار شحن USD هذا.",title:"شحن رصيد USD",lead:"تُضاف قيمة الدفع بالدولار إلى رصيد USD بالقيمة نفسها ولا تُحوّل إلى رصيد CNY.",ai:"رصيد AI بالدولار",sasi:"رصيد إنشاء SASI بالدولار",credits:a=>`إضافة $${a} USD`,fx:"إذا كان حساب PayPal يستخدم EUR أو GBP أو عملة أخرى، يتولى PayPal التحويل في صفحة الدفع؛ وتتحقق LINGXIFIELD فقط من قيمة الطلب بالدولار.",opening:"جارٍ فتح PayPal…",pay:a=>`الدفع عبر PayPal بقيمة $${a}`,unavailable:"PayPal غير متاح مؤقتًا. حاول مرة أخرى لاحقًا.",error:"تعذر فتح PayPal الآن. حاول مرة أخرى لاحقًا."},
};

function Inner(){
  const sp=useSearchParams()??new URLSearchParams();
  const{lang}=useLingxiLang();
  const c=COPY[lang];
  const product=useMemo(()=>getUsdBalanceProduct(sp.get("productId")||""),[sp]);
  const[buyer,setBuyer]=useState("");
  const[busy,setBusy]=useState(false);
  const[ready,setReady]=useState<boolean|null>(null);
  const[error,setError]=useState("");

  useEffect(()=>{
    const s=createClient();
    void s.auth.getUser().then(({data})=>setBuyer(data.user?.email||""));
    void fetch("/api/pay/providers",{cache:"no-store"}).then(r=>r.json()).then(d=>setReady(Boolean(d?.paypal))).catch(()=>setReady(false));
  },[]);

  async function pay(){
    if(!product||ready!==true)return;
    setBusy(true);setError("");
    try{
      const returnPath=product.wallet==="ai"?"/ai-wallet":"/sasi/pricing";
      const r=await fetch("/api/pay/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId:product.id,returnPath})});
      const d=await r.json().catch(()=>({}));
      if(r.status===401){location.href=`/account?next=${encodeURIComponent(location.pathname+location.search)}`;return}
      if(!r.ok||!d.url)throw new Error(d.error||"PAYPAL_CREATE_FAILED");
      location.assign(d.url);
    }catch{
      setError(c.error);
    }finally{setBusy(false)}
  }

  if(!product)return <><Nav/><main className="mx-auto max-w-xl px-6 py-24 text-center text-sm">{c.missing}</main><Footer/></>;

  const amount=product.amountUsd.toFixed(2);
  return <><Nav/><main className="mx-auto max-w-xl px-6 py-16 pt-28" dir={lang==="ar"?"rtl":"ltr"}>
    <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7">
      <p className="text-sm text-[var(--lx-faint)]">PayPal · USD</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]">{c.title}</h1>
      <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">{c.lead}</p>
      <div className="mt-7 rounded-2xl border border-[var(--lx-line)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div><b className="text-base text-[var(--lx-ink)]">{product.wallet==="ai"?c.ai:c.sasi}</b><p className="mt-2 text-sm text-[var(--lx-muted)]">{c.credits(amount)}</p>{buyer&&<p className="mt-2 text-xs text-[var(--lx-faint)]">{buyer}</p>}</div>
          <strong className="text-3xl text-[var(--lx-ink)]">${amount}</strong>
        </div>
      </div>
      <p className="mt-4 text-xs leading-6 text-[var(--lx-faint)]">{c.fx}</p>
      <button disabled={busy||ready!==true} onClick={pay} className="mt-6 w-full rounded-xl bg-[#0070ba] px-5 py-4 text-sm font-semibold text-white disabled:opacity-40">{busy?c.opening:c.pay(amount)}</button>
      {ready===false&&<p className="mt-3 text-sm text-amber-700">{c.unavailable}</p>}
      {error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}
    </section>
    <div className="mt-6"><PaypalHelp compact/></div>
  </main><Footer/></>;
}

export default function Page(){return <Suspense fallback={<div className="p-20 text-center">…</div>}><Inner/></Suspense>}
