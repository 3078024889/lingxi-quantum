"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
const RMB_TOPUPS=[10,30,50,100,300,500],USD_TOPUPS=[10,20,50,100,300,500,1000,2000,10000];
export default function AiWalletPanel(){
 const{lang,t}=useLingxiLang();const[data,setData]=useState<any>(null),[msg,setMsg]=useState(""),[selectedRmb,setSelectedRmb]=useState(50),[selectedUsd,setSelectedUsd]=useState(50),[currency,setCurrency]=useState<"CNY"|"USD">(lang==="zh"?"CNY":"USD");
 useEffect(()=>{fetch("/api/ai/wallet",{cache:"no-store"}).then(async r=>{const d=await r.json();if(r.ok)setData(d);else setMsg(d.error||"Login required")})},[]);
 if(!data)return <div className="lx11-wallet-loading">{msg||(lang==="zh"?"正在读取余额…":"Loading balance…")}</div>;
 return <div className="lx11-wallet-stack">
  <section className="lx11-wallet-overview"><div className="lx11-wallet-balance"><span>CNY BALANCE</span><strong>¥{data.balanceRmb.toFixed(2)}</strong><p>{lang==="zh"?"人民币余额独立保留。":"CNY balance is kept separately."}</p></div><div className="lx11-wallet-balance"><span>USD BALANCE</span><strong>${Number(data.balanceUsd||0).toFixed(2)}</strong><p>{lang==="zh"?"美元充值只进入 USD 余额。":"USD top-ups stay in the USD wallet."}</p></div></section>
  <section className="lx11-wallet-section"><div className="lx11-wallet-heading"><div><span>{t("topupKicker")}</span><h2>{t("topupTitle")}</h2></div><p>{lang==="zh"?"CNY 与 USD 余额分别记账，不自动换汇。":"CNY and USD balances are separate. No automatic FX conversion."}</p></div>
   <div className="mb-5 flex gap-2"><button onClick={()=>setCurrency("CNY")} className={`rounded-full border px-4 py-2 ${currency==="CNY"?"bg-black text-white":""}`}>CNY</button><button onClick={()=>setCurrency("USD")} className={`rounded-full border px-4 py-2 ${currency==="USD"?"bg-black text-white":""}`}>USD</button></div>
   {currency==="CNY"?<><div className="lx11-topup-grid">{RMB_TOPUPS.map(n=><button key={n} onClick={()=>setSelectedRmb(n)} className={selectedRmb===n?"is-selected":""}><span>¥</span><b>{n}</b></button>)}</div><div className="lx11-topup-action"><div><span>{t("thisTopup")}</span><b>¥{selectedRmb}</b></div><Link href={`/checkout?productId=ai-balance-${selectedRmb}&redirect=/ai-wallet`}>{t("continueTopup")}</Link></div></>
   :<><div className="lx11-topup-grid">{USD_TOPUPS.map(n=><button key={n} onClick={()=>setSelectedUsd(n)} className={selectedUsd===n?"is-selected":""}><span>$</span><b>{n}</b></button>)}</div><div className="lx11-topup-action"><div><span>{t("thisTopup")}</span><b>${selectedUsd}</b></div><Link href={`/checkout-usd?productId=ai-usd-balance-${selectedUsd}`}>{t("continueTopup")}</Link></div></>}
   <p className="lx11-wallet-fine">{lang==="zh"?"退款按原支付币种处理；两种余额不互相换汇。":"Refunds stay in the original payment currency; balances are not exchanged."}</p>
  </section>
  <section className="lx11-wallet-section lx11-wallet-two"><div><span>{t("records")}</span><h2>{t("recordsTitle")}</h2><div className="lx11-wallet-links"><Link href="/account/orders">{t("orders")}</Link><Link href="/refunds">{t("refundRules")}</Link></div></div></section>
 </div>
}
