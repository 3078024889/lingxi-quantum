"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import CurrencySelector from "@/components/CurrencySelector";

const CNY=[10,30,50,100,300,500] as const;
const USD=[10,20,50,100,300,500] as const;

export default function AiWalletPanel(){
 const{lang}=useLingxiLang();const zh=lang==="zh";const{currency}=usePreferredCurrency();
 const[data,setData]=useState<{balanceRmb:number;balanceUsd:number}|null>(null),[msg,setMsg]=useState("");
 const[cny,setCny]=useState<number>(50),[usd,setUsd]=useState<number>(50);
 useEffect(()=>{void fetch("/api/ai/wallet",{cache:"no-store"}).then(async r=>{const x=await r.json();if(r.ok)setData(x);else setMsg(x.error||(zh?"正在读取余额…":"Loading balance…"))})},[zh]);
 if(!data)return <div className="lx11-wallet-loading">{msg||(zh?"正在读取余额…":"Loading balance…")}</div>;

 return <div className="lx11-wallet-stack">
  <section className="grid gap-4 md:grid-cols-2">
   <div className="lx11-wallet-overview lx-wallet-currency-card"><LingxiMiniIcon name="wallet" size="title"/><div className="lx11-wallet-balance"><span>{zh?"人民币余额":"CNY balance"}</span><strong>¥{data.balanceRmb.toFixed(2)}</strong><p>{zh?"微信、支付宝充值的余额。":"Balance funded through WeChat Pay or Alipay."}</p></div></div>
   <div className="lx11-wallet-overview lx-wallet-currency-card"><LingxiMiniIcon name="wallet" size="title"/><div className="lx11-wallet-balance"><span>{zh?"美元余额":"USD balance"}</span><strong>${data.balanceUsd.toFixed(2)}</strong><p>{zh?"PayPal 美元充值的余额。":"Balance funded through PayPal in USD."}</p></div></div>
  </section>

  <section className="lx11-wallet-section lx-wallet-topup-panel">
   <div className="lx11-wallet-heading"><div><span>{zh?"补充余额":"Top up"}</span><h2>{zh?"按当前支付币种继续。":"Continue in your selected currency."}</h2></div><p>{zh?"语言与支付币种彼此独立。":"Language and payment currency are independent."}</p></div>
   <div className="mb-5 max-w-xs"><CurrencySelector/></div>

   {currency==="CNY"?<>
    <div className="lx11-topup-grid">{CNY.map(x=><button key={x} onClick={()=>setCny(x)} className={cny===x?"is-selected":""}><span>¥</span><b>{x}</b></button>)}</div>
    <div className="lx11-topup-action"><div><span>{zh?"本次充值":"This top-up"}</span><b>¥{cny}</b></div><Link href={`/checkout?productId=ai-balance-${cny}&redirect=/ai-wallet`}>{zh?"继续支付 →":"Continue →"}</Link></div>
   </>:<>
    <div className="lx11-topup-grid">{USD.map(x=><button key={x} onClick={()=>setUsd(x)} className={usd===x?"is-selected":""}><span>$</span><b>{x}</b></button>)}</div>
    <div className="lx11-topup-action"><div><span>{zh?"本次充值":"This top-up"}</span><b>${usd.toFixed(2)} USD</b></div><Link href={`/checkout-usd?productId=ai-usd-balance-${usd}`}>{zh?"使用 PayPal →":"Continue with PayPal →"}</Link></div>
   </>}

   <p className="lx11-wallet-fine">{zh?"不同币种采用独立定价，不按实时汇率换算。":"Prices are set independently for each currency and are not based on live exchange rates."}</p>
  </section>

  <section className="lx11-wallet-section lx11-wallet-two"><div><span>{zh?"退款与记录":"Refunds & records"}</span><h2>{zh?"每一笔充值都保留购买时的币种与金额。":"Each top-up keeps the currency and amount used at purchase."}</h2><div className="lx11-wallet-links"><Link href="/account/orders">{zh?"查看充值记录":"Orders"}</Link><Link href="/account/withdrawals">{zh?"余额退款":"Balance refund"}</Link><Link href="/refunds">{zh?"退款规则":"Refund policy"}</Link></div></div></section>
 </div>;
}
