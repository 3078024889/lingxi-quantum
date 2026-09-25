"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
const RMB_TOPUPS=[10,30,50,100,300,500];
export default function AiWalletPanel(){
 const{lang,t}=useLingxiLang();const[data,setData]=useState<any>(null),[msg,setMsg]=useState(""),[selectedRmb,setSelectedRmb]=useState(50);
 useEffect(()=>{fetch("/api/ai/wallet",{cache:"no-store"}).then(async r=>{const d=await r.json();if(r.ok)setData(d);else setMsg(d.error||"Login required")})},[]);
 if(!data)return <div className="lx11-wallet-loading">{msg||(lang==="zh"?"正在读取余额…":"Loading balance…")}</div>;
 return <div className="lx11-wallet-stack">
  <section className="lx11-wallet-overview"><div className="lx11-wallet-balance"><span>CNY BALANCE</span><strong>¥{data.balanceRmb.toFixed(2)}</strong><p>{lang==="zh"?"人民币余额独立保留。":"CNY balance is kept separately."}</p></div></section>
  <section className="lx11-wallet-section"><div className="lx11-wallet-heading"><div><span>{t("topupKicker")}</span><h2>{t("topupTitle")}</h2></div><p>{lang==="zh"?"当前充值与 AI 实际结算统一使用 CNY 余额。":"Current AI top-ups and live settlement use the CNY wallet."}</p></div>
   <div className="lx11-topup-grid">{RMB_TOPUPS.map(n=><button key={n} onClick={()=>setSelectedRmb(n)} className={selectedRmb===n?"is-selected":""}><span>¥</span><b>{n}</b></button>)}</div>
   <div className="lx11-topup-action"><div><span>{t("thisTopup")}</span><b>¥{selectedRmb}</b></div><Link href={`/checkout?productId=ai-balance-${selectedRmb}&redirect=/ai-wallet`}>{t("continueTopup")}</Link></div>
   <p className="lx11-wallet-fine">{lang==="zh"?"未使用的真实充值本金可在账户中申请原路退回。USD 钱包充值将在美元实际消费结算闭环完成后重新开放。":"Unused paid principal can be refunded to the original payment method. USD wallet top-ups reopen after live USD consumption settlement is complete."}</p>
  </section>
  <section className="lx11-wallet-section lx11-wallet-two"><div><span>{t("records")}</span><h2>{t("recordsTitle")}</h2><div className="lx11-wallet-links"><Link href="/account/orders">{t("orders")}</Link><Link href="/account/withdrawals">{lang==="zh"?"余额提现":"Withdraw balance"}</Link><Link href="/refunds">{t("refundRules")}</Link></div></div></section>
 </div>
}
