"use client";
import {useEffect,useMemo,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {accountText} from "@/lib/account-experience-i18n";
type Order={id:string;amountRmb:number;alreadyRequestedRmb:number;paidAt:string|null};
export default function AiRefundRequestPanel(){
 const{lang}=useLingxiLang();const t=(k:string)=>accountText(lang,k);
 const[data,setData]=useState<{refundableRmb:number;orders:Order[]}|null>(null),[orderId,setOrderId]=useState(""),[amount,setAmount]=useState(""),[note,setNote]=useState(""),[busy,setBusy]=useState(false),[msg,setMsg]=useState(""),[loadError,setLoadError]=useState("");
 async function load(){
   setLoadError("");
   try{
     const r=await fetch("/api/ai/refund/eligible",{cache:"no-store"});
     const d=await r.json().catch(()=>({}));
     if(!r.ok)throw new Error(d.error||t("unavailable"));
     setData(d);setOrderId((x:string)=>x||d.orders?.[0]?.id||"");
   }catch(e){setLoadError(e instanceof Error?e.message:t("unavailable"))}
 }
 useEffect(()=>{void load()},[]);
 const chosen=useMemo(()=>data?.orders.find(o=>o.id===orderId),[data,orderId]);const orderMax=Math.max(0,(chosen?.amountRmb||0)-(chosen?.alreadyRequestedRmb||0));const max=Math.min(data?.refundableRmb||0,orderMax);
 async function submit(){const n=Number(amount);if(!orderId||!Number.isFinite(n)||n<=0||n>max+0.0001)return;setBusy(true);setMsg("");try{const r=await fetch("/api/ai/refund/request",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({orderId,amountRmb:n,note})});const d=await r.json();if(!r.ok)throw new Error(d.error||"REQUEST_FAILED");setMsg(t("requestSent"));setAmount("");setNote("");await load();}catch(e){setMsg(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 if(loadError&&!data)return <section className="lx11-wallet-section lx-refund-panel"><p role="alert" className="rounded-2xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-ink)]">{loadError}</p><button type="button" onClick={()=>void load()} className="mt-3 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-4 py-2 text-sm text-[var(--lx-ink)]">{t("unavailable")} · ↻</button></section>;
 if(!data)return <section className="lx11-wallet-section lx-refund-panel"><p className="text-sm text-[var(--lx-muted)]">…</p></section>;
 return <section className="lx11-wallet-section lx-refund-panel"><div className="lx11-wallet-heading"><div><span>{t("refundWithdraw")}</span><h2>{t("refundWithdraw")}</h2></div><p>{t("refundExplain")}</p></div><div className="lx-refund-balance"><span>{t("refundableNow")}</span><strong>¥{data.refundableRmb.toFixed(2)}</strong></div>{data.orders.length===0?<p className="lx11-wallet-fine">{t("noEligible")}</p>:<><label>{t("chooseOrder")}<select value={orderId} onChange={e=>setOrderId(e.target.value)}>{data.orders.map(o=><option key={o.id} value={o.id}>¥{o.amountRmb.toFixed(2)} · {o.paidAt?new Date(o.paidAt).toLocaleDateString(lang==="zh"?"zh-CN":lang):""}</option>)}</select></label><label>{t("amount")}<input type="number" min="0.01" step="0.01" max={max} value={amount} onChange={e=>setAmount(e.target.value)} placeholder={`≤ ¥${max.toFixed(2)}`}/></label><label>{t("reasonOptional")}<textarea maxLength={500} value={note} onChange={e=>setNote(e.target.value)}/></label><button onClick={submit} disabled={busy||!amount||Number(amount)<=0||Number(amount)>max}>{busy?t("saving"):t("submitRefund")}</button></>}{msg&&<p className="lx-refund-message">{msg}</p>}</section>
}
