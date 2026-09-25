"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";

const CNY=[10,30,50,100,300,500] as const;
const USD=[10,20,50,100,300,500] as const;

export default function AiWalletPanel(){
  const{lang}=useLingxiLang();
  const zh=lang==="zh";
  const[data,setData]=useState<{balanceRmb:number;balanceUsd:number}|null>(null);
  const[msg,setMsg]=useState("");
  const[cny,setCny]=useState<number>(50);
  const[usd,setUsd]=useState<number>(50);
  const[method,setMethod]=useState<"cny"|"usd">("cny");

  useEffect(()=>{
    void fetch("/api/ai/wallet",{cache:"no-store"}).then(async r=>{
      const d=await r.json();
      if(r.ok)setData(d);else setMsg(d.error||"Login required");
    });
  },[]);

  if(!data)return <div className="lx11-wallet-loading">{msg||(zh?"正在读取余额…":"Loading balance…")}</div>;

  return <div className="lx11-wallet-stack">
    <section className="grid gap-4 md:grid-cols-2">
      <div className="lx11-wallet-overview"><div className="lx11-wallet-balance"><span>{zh?"人民币余额":"CNY balance"}</span><strong>¥{data.balanceRmb.toFixed(2)}</strong><p>{zh?"微信、支付宝充值的余额。":"Balance funded through WeChat Pay or Alipay."}</p></div></div>
      <div className="lx11-wallet-overview"><div className="lx11-wallet-balance"><span>{zh?"美元余额":"USD balance"}</span><strong>${data.balanceUsd.toFixed(2)}</strong><p>{zh?"PayPal 美元充值的余额。":"Balance funded through PayPal in USD."}</p></div></div>
    </section>

    <section className="lx11-wallet-section">
      <div className="lx11-wallet-heading">
        <div><span>{zh?"补充余额":"Top up"}</span><h2>{zh?"需要多少，就充值多少。":"Choose the amount you need."}</h2></div>
        <p>{zh?"两种币种分别保留，不互相改写。实际使用时会从能够覆盖本次费用的余额中结算。":"CNY and USD remain separate. Usage is settled from the balance that can cover the task."}</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button type="button" onClick={()=>setMethod("cny")} className={`rounded-full border px-4 py-2 text-sm ${method==="cny"?"border-black bg-black text-white":""}`}>{zh?"微信 / 支付宝 · CNY":"WeChat / Alipay · CNY"}</button>
        <button type="button" onClick={()=>setMethod("usd")} className={`rounded-full border px-4 py-2 text-sm ${method==="usd"?"border-black bg-black text-white":""}`}>PayPal · USD</button>
      </div>

      {method==="cny"?<>
        <div className="lx11-topup-grid">{CNY.map(x=><button key={x} onClick={()=>setCny(x)} className={cny===x?"is-selected":""}><span>¥</span><b>{x}</b></button>)}</div>
        <div className="lx11-topup-action"><div><span>{zh?"本次充值":"This top-up"}</span><b>¥{cny}</b></div><Link href={`/checkout?productId=ai-balance-${cny}&redirect=/ai-wallet`}>{zh?"继续支付 →":"Continue →"}</Link></div>
      </>:<>
        <div className="lx11-topup-grid">{USD.map(x=><button key={x} onClick={()=>setUsd(x)} className={usd===x?"is-selected":""}><span>$</span><b>{x}</b></button>)}</div>
        <div className="lx11-topup-action"><div><span>{zh?"本次充值":"This top-up"}</span><b>${usd.toFixed(2)} USD</b></div><Link href={`/checkout-usd?productId=ai-usd-balance-${usd}`}>{zh?"继续使用 PayPal →":"Continue with PayPal →"}</Link></div>
      </>}

      <p className="lx11-wallet-fine">{zh?"未使用的真实充值本金可按原支付渠道申请退回。":"Unused paid principal can be refunded to the original payment method."}</p>
    </section>

    <section className="lx11-wallet-section lx11-wallet-two">
      <div><span>{zh?"退款与记录":"Refunds & records"}</span><h2>{zh?"每一笔充值都留有自己的订单记录。":"Every top-up keeps its own order record."}</h2>
        <div className="lx11-wallet-links">
          <Link href="/account/orders">{zh?"查看充值记录":"Orders"}</Link>
          <Link href="/account/withdrawals">{zh?"余额提现":"Withdraw balance"}</Link>
          <Link href="/refunds">{zh?"查看退款规则":"Refund policy"}</Link>
        </div>
      </div>
    </section>
  </div>;
}
