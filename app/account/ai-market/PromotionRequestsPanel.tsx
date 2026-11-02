"use client";
import {useEffect,useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {AI_MARKET_PROMOTION_COPY} from "@/lib/ai-market-promotion-locale";
import {AI_MARKET_CLAIMABLE_LABELS} from "@/lib/ai-market-vendor-claims";
type Claim={id:string;product_id:string;status:string};
type Promotion={id:string;claim_id:string;product_id:string;plan_id:string;currency:"CNY"|"USD";provider:string;amount_minor:number;status:string;merchant_order_id:string|null;created_at:string};
const PLANS=[["sponsored",49],["category",149],["brand",299]] as const;
export default function PromotionRequestsPanel(){
 const {lang}=useLingxiLang(),t=AI_MARKET_PROMOTION_COPY[lang];
 const [approved,setApproved]=useState<Claim[]>([]),[requests,setRequests]=useState<Promotion[]>([]);
 const [claimId,setClaimId]=useState(""),[plan,setPlan]=useState("sponsored"),[currency,setCurrency]=useState<"CNY"|"USD">("CNY");
 const [provider,setProvider]=useState<"alipay"|"wechat"|"paypal">("alipay");
 const [busy,setBusy]=useState(false),[ready,setReady]=useState(false),[notice,setNotice]=useState("");
 // A retried network request reuses the SAME UUID for the same quote, preventing accidental duplicates.
 const retryKey=useRef<{signature:string;key:string}|null>(null);
 async function reload(){
  const [a,b]=await Promise.all([
   fetch("/api/ai-market/vendor-claims",{cache:"no-store"}),
   fetch("/api/ai-market/vendor-promotions",{cache:"no-store"})]);
  const claims=await a.json(),requests=await b.json();
  if(!a.ok||!b.ok)throw Error("SERVICE_NOT_READY");
  const verified=(claims.claims||[]).filter((x:Claim)=>x.status==="approved");
  setApproved(verified);setRequests(requests.requests||[]);
  setClaimId(old=>verified.some((c:Claim)=>c.id===old)?old:verified[0]?.id||"");
 }
 useEffect(()=>{let active=true;reload().catch(()=>{if(active)setNotice("SERVICE_NOT_READY")}).finally(()=>{if(active)setReady(true)});return()=>{active=false}},[]);
 function changeCurrency(next:"CNY"|"USD"){setCurrency(next);setProvider(next==="USD"?"paypal":"alipay")}
 async function submit(event:React.FormEvent){
  event.preventDefault();if(busy||!ready||!claimId)return;
  const product=approved.find(x=>x.id===claimId);if(!product)return;
  setBusy(true);setNotice("");
  try{
   const signature=[claimId,product.product_id,plan,currency,provider].join("|");
   if(!retryKey.current||retryKey.current.signature!==signature)
    retryKey.current={signature,key:crypto.randomUUID()};
   const key=retryKey.current.key;
   const res=await fetch("/api/ai-market/vendor-promotions",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({requestKey:key,claimId,productId:product.product_id,planId:plan,currency,provider})});
   const x=await res.json();if(!res.ok)throw Error(x.error||"SUBMIT_FAILED");
   retryKey.current=null;await reload();setNotice("SAVED");
  }catch(e){setNotice(e instanceof Error?e.message:"SUBMIT_FAILED")}
  finally{setBusy(false)}
 }
 return <section className="mt-7 rounded-xl border p-5" dir={lang==="ar"?"rtl":"ltr"}>
  <h2 className="text-xl font-bold">{t.title}</h2><p className="mt-2 text-sm leading-6">{t.description}</p>
  {!ready?<p className="mt-3">…</p>:approved.length===0?<p className="mt-4">{t.noApproved}</p>:
   <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
    <label>{t.product}<select required className="block w-full rounded border p-3" value={claimId} onChange={e=>setClaimId(e.target.value)}>
     {approved.map(c=><option key={c.id} value={c.id}>{AI_MARKET_CLAIMABLE_LABELS[c.product_id]||c.product_id}</option>)}
    </select></label>
    <label>{t.plan}<select className="block w-full rounded border p-3" value={plan} onChange={e=>setPlan(e.target.value)}>
     {PLANS.map(([id,amount])=><option key={id} value={id}>{id} · {currency==="CNY"?"¥":"$"}{amount}</option>)}
    </select></label>
    <label>{t.currency}<select className="block w-full rounded border p-3" value={currency} onChange={e=>changeCurrency(e.target.value as "CNY"|"USD")}>
     <option value="CNY">CNY</option><option value="USD">USD</option></select></label>
    <label>{t.provider}<select className="block w-full rounded border p-3" value={provider} onChange={e=>setProvider(e.target.value as "alipay"|"wechat"|"paypal")}>
     {currency==="USD"?<option value="paypal">PayPal</option>:<>
      <option value="alipay">支付宝 Alipay</option><option value="wechat">微信 WeChat Pay</option></>}
    </select></label>
    <p className="sm:col-span-2 text-xs opacity-70">{t.notActive}</p>
    <button disabled={busy} className="sm:col-span-2 rounded-lg border p-3 font-bold disabled:opacity-50">{busy?t.requesting:t.submit}</button>
   </form>}
  <h3 className="mt-6 font-bold">{t.history}</h3>
  {requests.length===0?<p className="mt-2 text-sm">{t.none}</p>:<ul className="mt-3 space-y-2">{requests.map(r=>
   <li key={r.id} className="rounded-lg border p-3 text-sm">
    {AI_MARKET_CLAIMABLE_LABELS[r.product_id]||r.product_id} · {r.plan_id} · {r.currency==="CNY"?"¥":"$"}{r.amount_minor/100}
    <p>{r.status} · {r.provider} · {new Date(r.created_at).toLocaleDateString(lang==="zh"?"zh-CN":lang)}</p>
    <p>{t.link}: {r.merchant_order_id||t.notActive}</p>
   </li>)}</ul>}
  {notice&&<p role="status" className="mt-3 text-sm">{notice==="SAVED"?t.submitted:t.notActive}</p>}
 </section>;
}
