"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import LxText from "@/components/LxText";
import WalletLedgerPanel from "@/components/WalletLedgerPanel";
import {BALANCE_TOPUP_AMOUNTS,customTopupAmount,MIN_CUSTOM_TOPUP,MAX_CUSTOM_TOPUP} from "@/lib/balance-topups";

type Currency="CNY"|"USD";
type Balance={availableMinor:number;refundableMinor:number;refundHoldMinor:number};
type Withdrawal={id:string;currency:string;amount_minor:number;created_at:string;normalized_status:string};
type Summary={balances:Record<Currency,Balance>;withdrawals:Withdrawal[]};
type State={status:"loading"|"login"|"error"|"ready";summary?:Summary};
const money=(currency:Currency,amount:number)=>{
 if(!Number.isSafeInteger(amount))return "—";
 return new Intl.NumberFormat(currency==="CNY"?"zh-CN":"en-US",{style:"currency",currency}).format(amount/100);
};
function validBalance(value:unknown):value is Balance{
 if(!value||typeof value!=="object")return false;
 const b=value as Partial<Balance>;
 return [b.availableMinor,b.refundableMinor,b.refundHoldMinor].every(n=>typeof n==="number"&&Number.isSafeInteger(n));
}
function validSummary(value:unknown):value is Summary{
 if(!value||typeof value!=="object")return false;
 const v=value as Partial<Summary>;
 return !!v.balances&&validBalance(v.balances.CNY)&&validBalance(v.balances.USD)&&Array.isArray(v.withdrawals);
}
export default function WalletLivePanel(){
 const [data,setData]=useState<State>({status:"loading"});
 const [tab,setTab]=useState<"ledger"|"withdrawals">("ledger");
 const [providers,setProviders]=useState<{wechat:boolean;alipay:boolean;paypal:boolean}|null>(null);
 const [topupCurrency,setTopupCurrency]=useState<Currency>("CNY");
 const [customAmount,setCustomAmount]=useState("");
 useEffect(()=>{
  const controller=new AbortController();
  const load=async()=>{
   try{
    const response=await fetch("/api/money/summary",{
     method:"GET",cache:"no-store",credentials:"same-origin",signal:controller.signal,
     headers:{"Accept":"application/json"}
    });
    if(response.status===401){setData({status:"login"});return;}
    if(!response.ok)throw Error("MONEY_SUMMARY_UNAVAILABLE");
    const result:unknown=await response.json();
    if(!validSummary(result))throw Error("INVALID_BALANCE_SNAPSHOT");
    setData({status:"ready",summary:result});
   }catch{
    if(!controller.signal.aborted)setData({status:"error"});
   }
  };
  const loadProviders=async()=>{
   try{
    const response=await fetch("/api/pay/providers",{cache:"no-store",credentials:"same-origin",signal:controller.signal});
    if(!response.ok)return;
    const p=await response.json();
    if(!controller.signal.aborted)setProviders({wechat:p.wechat===true,alipay:p.alipay===true,paypal:p.paypal===true});
   }catch{}
  };
  void load();void loadProviders();
  return()=>controller.abort();
 },[]);
 if(data.status==="loading")return <div role="status" aria-live="polite" className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-8">
  <LxText zh="正在安全读取账户余额…" en="Loading your secure account balance…"/>
 </div>;
 if(data.status==="login")return <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-8">
  <p><LxText zh="登录后查看真实余额与账本记录。" en="Sign in to view your real balance and ledger."/></p>
  <Link href="/account?next=%2Fai-wallet" className="mt-5 inline-flex rounded-lg bg-[var(--lx-ink)] px-5 py-3 text-sm text-[var(--lx-bg)]">
   <LxText zh="登录账户" en="Sign in"/>
  </Link>
 </div>;
 if(data.status!=="ready"||!data.summary)return <section role="alert" className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-8">
  <p><LxText zh="余额账本暂时无法读取。为防止显示错误金额，当前不展示任何余额。" en="The balance service is unavailable. No unverified amount will be shown."/></p>
  <button type="button" onClick={()=>window.location.reload()} className="mt-4 rounded-xl border px-4 py-2">
   <LxText zh="重新读取" en="Retry"/>
  </button>
  <Link href="/account/orders" className="ml-4 underline"><LxText zh="订单记录" en="Orders"/></Link>
 </section>;
 const {balances,withdrawals}=data.summary;
 const topupPayReady=topupCurrency==="CNY"?(providers?.wechat===true||providers?.alipay===true):providers?.paypal===true;
 const customValue=customTopupAmount(customAmount.trim());
 const customValueText=customValue===null?"":customValue.toFixed(2);
 const topupSymbol=topupCurrency==="CNY"?"¥":"$";
 const customHref=topupCurrency==="CNY"?"/checkout?productId=sasi-balance-custom-"+customValueText+"&redirect=%2Fai-wallet":"/checkout-usd?productId=sasi-usd-balance-custom-"+customValueText+"&returnPath=%2Fai-wallet";
 return <div className="lx26-wallet">
  <section className="lx26-wallet-overview">
   <h2 className="lx26-section-title"><span className="lx26-wallet-symbol">◇</span><LxText zh="资产总览" en="Balance overview" ja="資産概要" ko="잔액 개요" fr="Vue d'ensemble" de="Guthabenübersicht" es="Resumen de saldo" pt="Resumo do saldo" ar="نظرة عامة"/></h2>
   <div className="lx26-balance-grid">
    {(["CNY","USD"] as const).map(currency=>{
      const b=balances[currency];
      return <section key={currency} className={"lx26-balance-card "+(currency==="CNY"?"is-cny":"is-usd")} aria-label={currency}>
       <div className="lx26-balance-primary">
        <span className="lx26-currency-symbol" aria-hidden="true">{currency==="CNY"?"¥":"$"}</span>
        <span><small>{currency==="CNY"?<LxText zh="人民币余额" en="CNY balance"/>:<LxText zh="美元余额" en="USD balance"/>}</small><strong>{money(currency,b.availableMinor)}</strong></span>
       </div>
       <div className="lx26-balance-metrics">
        <span><small><LxText zh="可退金额" en="Refundable"/></small><b>{money(currency,b.refundableMinor)}</b></span>
        <span><small><LxText zh="退款占用" en="Refund hold"/></small><b>{money(currency,b.refundHoldMinor)}</b></span>
       </div>
      </section>;
    })}
   </div>
  </section>
  <section className="lx26-wallet-topup">
   <div className="lx26-topup-selector">
    <h2 className="lx26-section-title"><span aria-hidden="true">▣</span><LxText zh="余额充值" en="Top up balance" ja="残高チャージ" ko="잔액 충전" fr="Recharger le solde" de="Guthaben aufladen" es="Recargar saldo" pt="Recarregar saldo" ar="شحن الرصيد"/></h2>
    <p><LxText zh="选择币种和充值金额" en="Choose a currency and amount" ja="通貨と金額を選択" ko="통화와 금액 선택" fr="Choisissez une devise et un montant" de="Währung und Betrag wählen" es="Elige moneda e importe" pt="Escolha a moeda e o valor" ar="اختر العملة والمبلغ"/></p>
    <div className="lx26-topup-currency" role="tablist" aria-label="Top-up currency">
     <button type="button" role="tab" aria-selected={topupCurrency==="CNY"} className={topupCurrency==="CNY"?"is-active":""} onClick={()=>{setTopupCurrency("CNY");setCustomAmount("");}}><LxText zh="人民币 CNY" en="Chinese yuan · CNY" ja="人民元 · CNY" ko="중국 위안 · CNY" fr="Yuan chinois · CNY" de="Chinesischer Yuan · CNY" es="Yuan chino · CNY" pt="Yuan chinês · CNY" ar="اليوان الصيني · CNY"/></button>
     <button type="button" role="tab" aria-selected={topupCurrency==="USD"} className={topupCurrency==="USD"?"is-active":""} onClick={()=>{setTopupCurrency("USD");setCustomAmount("");}}><LxText zh="美元 USD" en="US dollar · USD" ja="米ドル · USD" ko="미국 달러 · USD" fr="Dollar américain · USD" de="US-Dollar · USD" es="Dólar estadounidense · USD" pt="Dólar americano · USD" ar="الدولار الأمريكي · USD"/></button>
    </div>
    <div className="lx26-topup-amounts">
     {BALANCE_TOPUP_AMOUNTS.map(amount=>topupPayReady?
      <Link key={amount} href={topupCurrency==="CNY"?"/checkout?productId=sasi-balance-"+amount+"&redirect=%2Fai-wallet":"/checkout-usd?productId=sasi-usd-balance-"+amount+"&returnPath=%2Fai-wallet"} className="lx26-topup-choice">{topupSymbol}{amount}</Link>:
      <span key={amount} className="lx26-topup-choice is-unavailable" aria-disabled="true">{topupSymbol}{amount}</span>)}
    </div>
    <div className="lx26-topup-custom">
     <label htmlFor="wallet-custom-amount"><LxText zh="自定义金额" en="Custom amount" ja="任意金額" ko="직접 입력" fr="Montant personnalisé" de="Eigener Betrag" es="Importe personalizado" pt="Valor personalizado" ar="مبلغ مخصص"/></label>
     <div className="lx26-topup-custom-row">
      <span aria-hidden="true">{topupSymbol}</span>
      <input id="wallet-custom-amount" data-testid="wallet-custom-amount-input" type="text" inputMode="decimal" autoComplete="off" maxLength={8} value={customAmount} onChange={e=>setCustomAmount(e.target.value)} placeholder="0.00" aria-describedby="wallet-custom-hint"/>
      {customValue!==null&&topupPayReady?<Link data-testid="wallet-custom-topup" href={customHref} className="lx26-topup-custom-action"><LxText zh="继续充值" en="Continue" ja="チャージへ進む" ko="충전 계속" fr="Continuer" de="Weiter" es="Continuar" pt="Continuar" ar="متابعة"/></Link>:<button type="button" disabled className="lx26-topup-custom-action is-disabled"><LxText zh="继续充值" en="Continue" ja="チャージへ進む" ko="충전 계속" fr="Continuer" de="Weiter" es="Continuar" pt="Continuar" ar="متابعة"/></button>}
     </div>
     <p id="wallet-custom-hint"><LxText zh={"金额范围："+MIN_CUSTOM_TOPUP.toFixed(2)+"–"+MAX_CUSTOM_TOPUP.toLocaleString("en-US")+"，最多两位小数。"} en="Amount range: 0.01–10,000, up to 2 decimal places." ja="0.01～10,000、少数第2位まで入力できます。" ko="0.01~10,000, 소수점 둘째 자리까지 입력할 수 있습니다." fr="De 0,01 à 10 000, avec deux décimales maximum." de="0,01 bis 10.000, maximal zwei Nachkommastellen." es="De 0,01 a 10.000, con hasta dos decimales." pt="De 0,01 a 10.000, com até duas casas decimais." ar="من 0.01 إلى 10,000 وبحد أقصى منزلتين عشريتين."/></p>
    </div>
    <p className="lx26-topup-provider"><LxText zh={topupCurrency==="CNY"?"支付方式：微信支付或支付宝":"支付方式：PayPal"} en={topupCurrency==="CNY"?"Payment methods: WeChat Pay or Alipay":"Payment method: PayPal"} ja={topupCurrency==="CNY"?"支払い方法：WeChat Pay / Alipay":"支払い方法：PayPal"} ko={topupCurrency==="CNY"?"결제 수단: WeChat Pay 또는 Alipay":"결제 수단: PayPal"} fr={topupCurrency==="CNY"?"Paiement : WeChat Pay ou Alipay":"Paiement : PayPal"} de={topupCurrency==="CNY"?"Zahlung: WeChat Pay oder Alipay":"Zahlung: PayPal"} es={topupCurrency==="CNY"?"Pago: WeChat Pay o Alipay":"Pago: PayPal"} pt={topupCurrency==="CNY"?"Pagamento: WeChat Pay ou Alipay":"Pagamento: PayPal"} ar={topupCurrency==="CNY"?"طريقة الدفع: WeChat Pay أو Alipay":"طريقة الدفع: PayPal"}/></p>
    {!topupPayReady&&<p role="status" className="lx26-topup-unavailable"><LxText zh={topupCurrency==="CNY"?"人民币支付暂不可用，请稍后再试。":"美元 PayPal 充值暂不可用，请稍后再试。"} en={topupCurrency==="CNY"?"CNY payment is temporarily unavailable.":"USD PayPal top-ups are temporarily unavailable."} ja={topupCurrency==="CNY"?"人民元決済は一時的に利用できません。":"USDのPayPalチャージは一時的に利用できません。"} ko={topupCurrency==="CNY"?"CNY 결제를 일시적으로 사용할 수 없습니다.":"USD PayPal 충전을 일시적으로 사용할 수 없습니다."} fr={topupCurrency==="CNY"?"Le paiement CNY est temporairement indisponible.":"Les recharges USD via PayPal sont temporairement indisponibles."} de={topupCurrency==="CNY"?"CNY-Zahlung ist vorübergehend nicht verfügbar.":"USD-Aufladungen über PayPal sind vorübergehend nicht verfügbar."} es={topupCurrency==="CNY"?"El pago en CNY no está disponible temporalmente.":"Las recargas USD con PayPal no están disponibles temporalmente."} pt={topupCurrency==="CNY"?"O pagamento em CNY está temporariamente indisponível.":"As recargas USD via PayPal estão temporariamente indisponíveis."} ar={topupCurrency==="CNY"?"الدفع بعملة CNY غير متاح مؤقتًا.":"شحن USD عبر PayPal غير متاح مؤقتًا."}/></p>}
   </div>
   <div className="lx26-wallet-quicklinks">
    <h2 className="lx26-section-title"><span aria-hidden="true">✧</span><LxText zh="账户服务" en="Account services"/></h2>
    <Link href="/account/orders"><LxText zh="订单与使用记录" en="Orders & history"/><span aria-hidden="true">›</span></Link>
    <Link href="/account/withdrawals"><LxText zh="退款与提现" en="Refunds & withdrawals"/><span aria-hidden="true">›</span></Link>
    <Link href="/account/support"><LxText zh="处理进度" en="Support progress"/><span aria-hidden="true">›</span></Link>
   </div>
  </section>
  <section className="lx26-wallet-history" data-testid="wallet-history-panel">
   <div className="lx26-wallet-history-tabs" role="tablist" aria-label="Wallet history">
    <button type="button" role="tab" aria-selected={tab==="ledger"} className={tab==="ledger"?"is-active":""} onClick={()=>setTab("ledger")}><LxText zh="资金记录" en="Funds activity"/></button>
    <button type="button" role="tab" aria-selected={tab==="withdrawals"} className={tab==="withdrawals"?"is-active":""} onClick={()=>setTab("withdrawals")}><LxText zh="退款与提现" en="Refunds & withdrawals"/></button>
   </div>
   {tab==="ledger"?<div role="tabpanel" className="lx26-wallet-ledgers lx26-wallet-ledgers-single"><WalletLedgerPanel showCurrencyTabs/></div>:
    <div role="tabpanel" className="lx26-wallet-withdrawals">
      {withdrawals.length?withdrawals.map(r=><div className="lx26-withdrawal-row" key={r.id}><span><strong>{money(r.currency==="USD"?"USD":"CNY",Number(r.amount_minor))}</strong><small>{new Date(r.created_at).toLocaleDateString()}</small></span><span>{String(r.normalized_status||"—")}</span></div>):
       <div className="lx26-wallet-empty"><span aria-hidden="true">▤</span><h3><LxText zh="暂无记录" en="No records yet"/></h3><p><LxText zh="当前暂无退款或提现记录。" en="No refunds or withdrawals recorded."/></p></div>}
    </div>}
  </section>
 </div>;
}
