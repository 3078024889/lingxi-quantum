"use client";
import {useEffect,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {AI_MARKET_VENDOR_COPY} from "@/lib/ai-market-vendor-locale";
import {AI_MARKET_CLAIMABLE_IDS,AI_MARKET_CLAIMABLE_LABELS} from "@/lib/ai-market-vendor-claims";
type Claim={id:string;product_id:string;company_name:string;official_site:string;status:string;created_at:string;reviewed_at?:string|null};
export default function VendorClaimsPanel({initialProduct=""}:{initialProduct?:string}){
 const {lang}=useLingxiLang(),t=AI_MARKET_VENDOR_COPY[lang];
 const [claims,setClaims]=useState<Claim[]>([]);
 const [productId,setProductId]=useState(initialProduct),[companyName,setCompanyName]=useState("");
 const [officialSite,setOfficialSite]=useState(""),[workEmail,setWorkEmail]=useState("");
 const [evidenceUrl,setEvidenceUrl]=useState(""),[busy,setBusy]=useState(false);
 const [notice,setNotice]=useState(""),[ready,setReady]=useState(false),[available,setAvailable]=useState(false);
 useEffect(()=>{const controller=new AbortController();fetch("/api/ai-market/vendor-claims",{cache:"no-store",signal:controller.signal})
  .then(async r=>{const x=await r.json();if(!r.ok)throw Error(x.error||"CLAIMS_UNAVAILABLE");setClaims(x.claims||[]);setAvailable(true)})
  .catch(()=>{if(!controller.signal.aborted)setNotice("CLAIMS_UNAVAILABLE")})
  .finally(()=>{if(!controller.signal.aborted)setReady(true)});return()=>controller.abort()},[]);
 async function send(event:React.FormEvent){
  event.preventDefault();if(busy||!available)return;setBusy(true);setNotice("");
  try{
   const res=await fetch("/api/ai-market/vendor-claims",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({productId,companyName,officialSite,workEmail,evidenceUrl})});
   const body=await res.json();
   if(!res.ok)throw Error(body.error||"CLAIMS_UNAVAILABLE");
   setClaims(old=>[body.claim,...old]);setNotice("SUBMITTED");
   setCompanyName("");setOfficialSite("");setWorkEmail("");setEvidenceUrl("");
  }catch(e){setNotice(e instanceof Error?e.message:"CLAIMS_UNAVAILABLE")}
  finally{setBusy(false)}
 }
 const status=(v:string)=>(t as Record<string,string>)[v==="pending_review"?"pending":v==="identity_verified"?"verified":v]||t.pending;
 const renderedNotice=notice==="SUBMITTED"?t.submitted:t.unavailable;
 return <div className="mt-8 space-y-7" dir={lang==="ar"?"rtl":"ltr"}>
  <section className="rounded-xl border p-5">
   <h2 className="text-xl font-bold">{t.claims} ({claims.length}/3)</h2>
   {!ready?<p className="mt-3">{t.loading}</p>:claims.length===0?<p className="mt-3">{t.empty}</p>:
    <ul className="mt-3 space-y-3">{claims.map(c=><li key={c.id} className="rounded-lg border p-3">
     <strong>{c.company_name} · {c.product_id}</strong><p>{t.status}: {status(c.status)}</p>
     <p className="text-xs opacity-70">{t.created}: {new Date(c.created_at).toLocaleDateString(lang==="zh"?"zh-CN":lang)}</p>
    </li>)}</ul>}
  </section>
  <form onSubmit={send} className="grid gap-4 rounded-xl border p-5">
   <h2 className="text-xl font-bold">{t.form}</h2>
   <label>{t.product}<select className="w-full rounded border p-3" required value={productId} onChange={e=>setProductId(e.target.value)}><option value="">—</option>{AI_MARKET_CLAIMABLE_IDS.map(id=><option key={id} value={id}>{AI_MARKET_CLAIMABLE_LABELS[id]}</option>)}</select></label>
   <label>{t.company}<input className="w-full rounded border p-3" required minLength={2} maxLength={120} value={companyName} onChange={e=>setCompanyName(e.target.value)}/></label>
   <label>{t.site}<input type="url" className="w-full rounded border p-3" required value={officialSite} onChange={e=>setOfficialSite(e.target.value)} placeholder="https://"/></label>
   <label>{t.email}<input type="email" className="w-full rounded border p-3" required value={workEmail} onChange={e=>setWorkEmail(e.target.value)}/></label>
   <label>{t.evidence}<input type="url" className="w-full rounded border p-3" required value={evidenceUrl} onChange={e=>setEvidenceUrl(e.target.value)} placeholder="https://"/></label>
   <p className="text-sm leading-6 opacity-80">{t.notice}</p>
   <button className="rounded-lg border px-5 py-3 font-bold disabled:opacity-60" disabled={busy||claims.length>=3||!ready||!available}>{busy?t.submitting:t.submit}</button>
   {claims.length>=3&&<p>{t.limit}</p>}
   {notice&&<p role="status" className="break-words">{renderedNotice}</p>}
  </form>
  <section className="rounded-xl border p-5"><h2 className="text-xl font-bold">{t.paidTitle}</h2><p className="mt-2">{t.paid}</p></section>
 </div>;
}
