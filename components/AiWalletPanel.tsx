"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import CurrencySelector from "@/components/CurrencySelector";

const CNY=[10,30,50,100,300,500] as const;
const USD=[10,20,50,100,300,500] as const;

function inMini(){
 try{return new URLSearchParams(window.location.search).get("mini")==="1"&&/MicroMessenger/i.test(navigator.userAgent||"")}catch{return false}
}
async function openMiniBalance(){
 return new Promise<boolean>((resolve)=>{
  const go=()=>{const w=(window as any).wx;if(!w?.miniProgram?.navigateTo){resolve(false);return}w.miniProgram.navigateTo({url:"/pages/balance/index",success:()=>resolve(true),fail:()=>resolve(false)})};
  if((window as any).wx?.miniProgram){go();return}
  const old=document.getElementById("lingxifield-wechat-jssdk") as HTMLScriptElement|null;
  if(old){old.addEventListener("load",go,{once:true});setTimeout(()=>resolve(false),2500);return}
  const s=document.createElement("script");s.id="lingxifield-wechat-jssdk";s.src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js";s.async=true;s.onload=go;s.onerror=()=>resolve(false);document.head.appendChild(s);setTimeout(()=>resolve(false),3000);
 })
}

export default function AiWalletPanel(){
 const{lang}=useLingxiLang();const zh=lang==="zh";const{currency}=usePreferredCurrency();
 const[data,setData]=useState<{balanceRmb:number;balanceUsd:number}|null>(null),[msg,setMsg]=useState(""),[needLogin,setNeedLogin]=useState(false);
 const[cny,setCny]=useState<number>(50),[usd,setUsd]=useState<number>(50),[mini,setMini]=useState(false);
 useEffect(()=>{setMini(inMini());void fetch("/api/ai/wallet",{cache:"no-store"}).then(async r=>{const x=await r.json().catch(()=>({}));if(r.ok){setData(x);setNeedLogin(false)}else if(r.status===401){setNeedLogin(true);setMsg("")}else setMsg(zh?"余额暂时没有加载出来，请刷新页面。":"Balance could not be loaded. Refresh the page.")}).catch(()=>setMsg(zh?"余额暂时没有加载出来，请刷新页面。":"Balance could not be loaded. Refresh the page."))},[zh]);

 if(needLogin)return <div className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7 text-[var(--lx-ink)]"><h2 className="text-xl font-semibold">{zh?"登录后查看余额与充值":"Sign in to view and top up your balance"}</h2><p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{zh?"登录后可查看余额、充值记录与可退本金。":"Sign in to view your balance, top-ups and refundable principal."}</p><Link href="/login?next=%2Fai-wallet" className="mt-5 inline-flex rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)]">{zh?"登录或注册":"Sign in or create account"}</Link></div>;
 if(!data)return <div className="lx11-wallet-loading">{msg||(zh?"正在查询余额…":"Loading balance…")}</div>;

 return <div className="lx11-wallet-stack">
  <section className="grid gap-4 md:grid-cols-2">
   <div className="lx11-wallet-overview lx-wallet-currency-card"><LingxiMiniIcon name="wallet" size="title"/><div className="lx11-wallet-balance"><span>{zh?"人民币余额":"CNY balance"}</span><strong>¥{data.balanceRmb.toFixed(2)}</strong><p>{zh?"用于人民币结算的创作与服务。":"For services priced in CNY."}</p></div></div>
   <div className="lx11-wallet-overview lx-wallet-currency-card"><LingxiMiniIcon name="wallet" size="title"/><div className="lx11-wallet-balance"><span>{zh?"美元余额":"USD balance"}</span><strong>${data.balanceUsd.toFixed(2)}</strong><p>{zh?"用于美元结算的创作与服务。":"For services priced in USD."}</p></div></div>
  </section>

  <section className="lx11-wallet-section lx-wallet-topup-panel">
   <div className="lx11-wallet-heading"><div><span>{zh?"充值金额":"Top-up amount"}</span><h2>{zh?"选择金额，即可继续支付。":"Choose an amount to continue."}</h2></div></div>
   {!mini&&<div className="mb-5 max-w-xs"><CurrencySelector/></div>}

   {mini?<>
    <p className="text-sm leading-6 text-[var(--lx-muted)]">{zh?"小程序内人民币充值会打开微信原生支付，不再进入网页确认页。":"CNY top-ups in the Mini Program open native WeChat Pay."}</p>
    <button onClick={async()=>{setMsg("");if(!(await openMiniBalance()))setMsg(zh?"没有打开小程序支付页，请返回小程序后重试。":"Could not open native payment. Return to the Mini Program and try again.")}} className="mt-5 rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-sm font-medium text-[var(--lx-bg)]">{zh?"在小程序内充值人民币":"Top up CNY in Mini Program"}</button>
   </>:currency==="CNY"?<>
    <div className="lx11-topup-grid">{CNY.map(x=><button key={x} onClick={()=>setCny(x)} className={cny===x?"is-selected":""}><span>¥</span><b>{x}</b></button>)}</div>
    <div className="lx11-topup-action"><div><span>{zh?"本次充值":"Top up"}</span><b>¥{cny}</b></div><Link href={`/checkout?productId=ai-balance-${cny}&redirect=/ai-wallet`}>{zh?`充值 ¥${cny}`:`Top up ¥${cny}`}</Link></div>
   </>:<>
    <div className="lx11-topup-grid">{USD.map(x=><button key={x} onClick={()=>setUsd(x)} className={usd===x?"is-selected":""}><span>$</span><b>{x}</b></button>)}</div>
    <div className="lx11-topup-action"><div><span>{zh?"本次充值":"Top up"}</span><b>${usd.toFixed(2)}</b></div><Link href={`/checkout-usd?productId=ai-usd-balance-${usd}`}>{zh?`充值 $${usd}`:`Top up $${usd}`}</Link></div>
   </>}
   <p className="lx11-wallet-fine">{zh?(mini?"美元充值请在浏览器登录 lingxifield.com 后使用 PayPal。":"人民币与美元采用独立定价。"):"CNY and USD use separate price books."}</p>
   {msg&&<p className="mt-3 text-sm text-[var(--lx-muted)]">{msg}</p>}
  </section>

  <section className="lx11-wallet-section lx11-wallet-two"><div><span>{zh?"余额与记录":"Balance & history"}</span><h2>{zh?"查看充值记录，或将未使用的充值本金退回原支付方式。":"Review top-ups or return eligible unused principal to the original payment method."}</h2><div className="lx11-wallet-links"><Link href="/account/orders">{zh?"充值记录":"Top-up history"}</Link><Link href="/account/withdrawals">{zh?"余额提现":"Balance withdrawal"}</Link><Link href="/refunds">{zh?"退款说明":"Refund policy"}</Link></div></div></section>
 </div>;
}
