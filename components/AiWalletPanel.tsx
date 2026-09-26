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
 useEffect(()=>{void fetch("/api/ai/wallet",{cache:"no-store"}).then(async r=>{const x=await r.json();if(r.ok)setData(x);else setMsg(zh?"余额暂时没有加载出来，请刷新页面。":"Balance could not be loaded. Refresh the page.")}).catch(()=>setMsg(zh?"余额暂时没有加载出来，请刷新页面。":"Balance could not be loaded. Refresh the page."))},[zh]);
 if(!data)return <div className="lx11-wallet-loading">{msg||(zh?"正在查询余额…":"Loading balance…")}</div>;

 return <div className="lx11-wallet-stack">
  <section className="grid gap-4 md:grid-cols-2">
   <div className="lx11-wallet-overview lx-wallet-currency-card"><LingxiMiniIcon name="wallet" size="title"/><div className="lx11-wallet-balance"><span>{zh?"人民币余额":"CNY balance"}</span><strong>¥{data.balanceRmb.toFixed(2)}</strong><p>{zh?"用于人民币结算的创作与服务。":"For services priced in CNY."}</p></div></div>
   <div className="lx11-wallet-overview lx-wallet-currency-card"><LingxiMiniIcon name="wallet" size="title"/><div className="lx11-wallet-balance"><span>{zh?"美元余额":"USD balance"}</span><strong>${data.balanceUsd.toFixed(2)}</strong><p>{zh?"用于美元结算的创作与服务。":"For services priced in USD."}</p></div></div>
  </section>

  <section className="lx11-wallet-section lx-wallet-topup-panel">
   <div className="lx11-wallet-heading"><div><span>{zh?"充值金额":"Top-up amount"}</span><h2>{zh?"选择金额，即可继续支付。":"Choose an amount to continue."}</h2></div></div>
   <div className="mb-5 max-w-xs"><CurrencySelector/></div>

   {currency==="CNY"?<>
    <div className="lx11-topup-grid">{CNY.map(x=><button key={x} onClick={()=>setCny(x)} className={cny===x?"is-selected":""}><span>¥</span><b>{x}</b></button>)}</div>
    <div className="lx11-topup-action"><div><span>{zh?"本次充值":"Top up"}</span><b>¥{cny}</b></div><Link href={`/checkout?productId=ai-balance-${cny}&redirect=/ai-wallet`}>{zh?`充值 ¥${cny}`:`Top up ¥${cny}`}</Link></div>
   </>:<>
    <div className="lx11-topup-grid">{USD.map(x=><button key={x} onClick={()=>setUsd(x)} className={usd===x?"is-selected":""}><span>$</span><b>{x}</b></button>)}</div>
    <div className="lx11-topup-action"><div><span>{zh?"本次充值":"Top up"}</span><b>${usd.toFixed(2)}</b></div><Link href={`/checkout-usd?productId=ai-usd-balance-${usd}`}>{zh?`充值 $${usd}`:`Top up $${usd}`}</Link></div>
   </>}
   <p className="lx11-wallet-fine">{zh?"人民币与美元采用独立定价。":"CNY and USD use separate price books."}</p>
  </section>

  <section className="lx11-wallet-section lx11-wallet-two"><div><span>{zh?"余额与记录":"Balance & history"}</span><h2>{zh?"查看充值记录，或申请余额提现。":"Review top-ups or withdraw eligible balance."}</h2><div className="lx11-wallet-links"><Link href="/account/orders">{zh?"充值记录":"Top-up history"}</Link><Link href="/account/withdrawals">{zh?"余额提现":"Balance withdrawal"}</Link><Link href="/refunds">{zh?"提现说明":"Withdrawal policy"}</Link></div></div></section>
 </div>;
}
