"use client";
import {useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import {TOOL_PASS_COPY} from "@/lib/tools/commerce/tool-pass-i18n";
import offers from "@/config/tool-pass-offers.v2.json";

export default function ToolPassOffers(){
 const {lang}=useLingxiLang(),t=TOOL_PASS_COPY[lang]||TOOL_PASS_COPY.en;
 const {currency}=usePreferredCurrency();
 const payCurrency: "CNY"|"USD"=currency==="USD"?"USD":"CNY";
 const [pending,setPending]=useState<string|null>(null);
 const [notice,setNotice]=useState<string|null>(null);
 const days=[t.sevenDays,t.monthly,t.quarterly,t.annual];
 const symbol=payCurrency==="USD"?"$":"¥";
 async function purchase(sku:string){
  if(pending)return;
  // Purchases never auto-run; deliberate click initiates a wallet transaction.
  setPending(sku);setNotice(null);
  try{
   const response=await fetch("/api/tools/pass/purchase",{
    method:"POST",headers:{"content-type":"application/json"},
    credentials:"same-origin",cache:"no-store",
    body:JSON.stringify({sku,currency:payCurrency,requestId:crypto.randomUUID()})
   });
   const data=await response.json().catch(()=>({}));
   if(response.ok&&data.ok===true){
    setNotice(lang==="zh"?"已购买，工具包使用期限已更新。":"Purchase confirmed. Your pass dates are updated.");
   }else if(response.status===401){
    setNotice(t.login);
   }else{
    setNotice(lang==="zh"?"未完成购买，也未确认权益。请核对账户余额或联系客服。":"Purchase not confirmed. Check your wallet or contact support.");
   }
  }catch{
   setNotice(lang==="zh"?"网络暂不可用，请到订单页面核对状态后再重试。":"Network unavailable. Check order history before retrying.");
  }finally{setPending(null)}
 }
 return <main className="mx-auto max-w-6xl px-4 py-10" aria-label={t.title}>
  <h1 className="text-3xl font-bold">{t.title}</h1>
  <p className="mt-3 text-base leading-8">{t.scope}</p>
  <p className="mt-2 text-sm leading-7">{t.firstFree}。{t.useStarts}。{t.noAutoRenew}。</p>
  <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
   {offers.plans.map((p,i)=><section key={p.sku} className="rounded-2xl border border-current/15 bg-white/5 p-5">
    <h2 className="text-xl font-semibold">{days[i]}</h2>
    <p className="mt-4 text-3xl font-bold tabular-nums">{symbol}{p.price[payCurrency]}</p>
    <p className="mt-1 text-sm">{payCurrency} · {p.days} {lang==="zh"?"天":"days"}</p>
    <button type="button" disabled={Boolean(pending)} onClick={()=>void purchase(p.sku)} className="mt-5 w-full rounded-xl border border-current/30 p-3 text-sm font-semibold disabled:opacity-50">{pending===p.sku?"…":lang==="zh"?"余额购买":"Pay using wallet"}</button>
   </section>)}
  </div>
  <p className="mt-7 text-sm leading-7">{t.separateCost}。{t.receipt}。</p>
  {notice&&<p aria-live="polite" role="status" className="mt-4 rounded-lg border p-3 text-sm">{notice}</p>}
 </main>;
}
