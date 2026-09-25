"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";

const PACKS=[
  {rmb:10,usd:1.5},
  {rmb:30,usd:4.5},
  {rmb:50,usd:7.5},
  {rmb:100,usd:15},
  {rmb:300,usd:45},
  {rmb:500,usd:75},
] as const;

export default function AiWalletPanel(){
  const{lang}=useLingxiLang();
  const zh=lang==="zh";
  const[data,setData]=useState<{balanceRmb:number}|null>(null);
  const[msg,setMsg]=useState("");
  const[selected,setSelected]=useState(50);
  const[method,setMethod]=useState<"cny"|"paypal">("cny");

  useEffect(()=>{
    void fetch("/api/ai/wallet",{cache:"no-store"}).then(async r=>{
      const d=await r.json();
      if(r.ok)setData(d);else setMsg(d.error||"Login required");
    });
  },[]);

  const pack=useMemo(()=>PACKS.find(x=>x.rmb===selected)??PACKS[2],[selected]);

  if(!data)return <div className="lx11-wallet-loading">{msg||(zh?"正在读取余额…":"Loading balance…")}</div>;

  return <div className="lx11-wallet-stack">
    <section className="lx11-wallet-overview">
      <div className="lx11-wallet-balance">
        <span>{zh?"AI 余额":"AI BALANCE"}</span>
        <strong>¥{data.balanceRmb.toFixed(2)}</strong>
        <p>{zh?"微信、支付宝或 PayPal 充值后，都进入这一份可实际消费的余额。":"WeChat, Alipay and PayPal all fund this spendable balance."}</p>
      </div>
    </section>

    <section className="lx11-wallet-section">
      <div className="lx11-wallet-heading">
        <div><span>{zh?"补充余额":"Top up"}</span><h2>{zh?"需要多少，就充值多少。":"Choose the amount you need."}</h2></div>
        <p>{zh?"余额长期保留；只有真实 AI 任务才会扣费。":"Balance stays available and is charged only for real AI work."}</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button type="button" onClick={()=>setMethod("cny")} className={`rounded-full border px-4 py-2 text-sm ${method==="cny"?"border-black bg-black text-white":""}`}>{zh?"微信 / 支付宝":"WeChat / Alipay"}</button>
        <button type="button" onClick={()=>setMethod("paypal")} className={`rounded-full border px-4 py-2 text-sm ${method==="paypal"?"border-black bg-black text-white":""}`}>PayPal · USD</button>
      </div>

      <div className="lx11-topup-grid">
        {PACKS.map(x=><button key={x.rmb} onClick={()=>setSelected(x.rmb)} className={selected===x.rmb?"is-selected":""}>
          <span>{method==="cny"?"¥":"$"}</span><b>{method==="cny"?x.rmb:x.usd.toFixed(2)}</b>
          <small className="mt-1 block text-[10px] opacity-55">{method==="paypal"?(zh?`到账 ¥${x.rmb}`:`credits ¥${x.rmb}`):""}</small>
        </button>)}
      </div>

      <div className="lx11-topup-action">
        <div><span>{zh?"本次充值":"This top-up"}</span><b>{method==="cny"?`¥${pack.rmb}`:`$${pack.usd.toFixed(2)} USD`}</b></div>
        <Link href={method==="cny"
          ?`/checkout?productId=ai-balance-${pack.rmb}&redirect=/ai-wallet`
          :`/checkout-usd?productId=ai-balance-${pack.rmb}`}>
          {zh?"继续支付 →":"Continue →"}
        </Link>
      </div>

      <p className="lx11-wallet-fine">
        {method==="paypal"
          ?(zh?"PayPal 只负责用 USD 结算这笔充值；成功后仍记入同一个 CNY AI 余额。未使用的真实充值本金可按原 PayPal 订单退回。":"PayPal settles this top-up in USD and credits the same CNY AI balance.")
          :(zh?"未使用的真实充值本金可在账户中申请原路退回。":"Unused paid principal can be refunded to the original payment method.")}
      </p>
    </section>

    <section className="lx11-wallet-section lx11-wallet-two">
      <div><span>{zh?"退款与记录":"Refunds & records"}</span><h2>{zh?"所有流水都按原订单核对。":"Every balance change stays tied to its order."}</h2>
        <div className="lx11-wallet-links">
          <Link href="/account/orders">{zh?"查看充值记录":"Orders"}</Link>
          <Link href="/account/withdrawals">{zh?"余额提现":"Withdraw balance"}</Link>
          <Link href="/refunds">{zh?"查看退款规则":"Refund policy"}</Link>
        </div>
      </div>
    </section>
  </div>;
}
