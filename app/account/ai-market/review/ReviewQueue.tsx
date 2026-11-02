"use client";
import {useEffect,useState} from "react";
type Claim={id:string;user_id:string;product_id:string;company_name:string;official_site:string;evidence_url:string;work_email:string;status:string;created_at:string;reviewed_at?:string|null;review_note?:string|null};
const statuses=["pending_review","identity_verified","approved","rejected","revoked"] as const;
export default function ReviewQueue(){
 const [filter,setFilter]=useState<string>("pending_review");
 const [rows,setRows]=useState<Claim[]>([]);
 const [selected,setSelected]=useState<string>("");
 const [reason,setReason]=useState("");
 const [confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false);
 const [notice,setNotice]=useState(""),[ready,setReady]=useState(false);
 useEffect(()=>{
  const abort=new AbortController();setReady(false);
  fetch("/api/ai-market/vendor-review?status="+encodeURIComponent(filter),{cache:"no-store",signal:abort.signal})
   .then(async r=>{const x=await r.json();if(!r.ok)throw Error(x.error||"REVIEW_UNAVAILABLE");setRows(x.claims||[])})
   .catch(e=>{if(!abort.signal.aborted)setNotice(e instanceof Error?e.message:"REVIEW_UNAVAILABLE")})
   .finally(()=>{if(!abort.signal.aborted)setReady(true)});
  return()=>abort.abort();
 },[filter]);
 async function decide(claim:Claim,next:string){
  if(busy||!reason.trim())return;
  if(!confirm("确认将 "+claim.product_id+" 从 "+claim.status+" 改为 "+next+"？此操作会写入审核历史。"))return;
  setBusy(true);setNotice("");
  try{
   const res=await fetch("/api/ai-market/vendor-review",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id:claim.id,expectedStatus:claim.status,status:next,reason,proofConfirmed:confirmed})});
   const data=await res.json();if(!res.ok)throw Error(data.error||"REVIEW_FAILED");
   setRows(old=>old.filter(x=>x.id!==claim.id));setSelected("");setReason("");setConfirmed(false);
   setNotice("审核决定已保存，记录了审核账号与理由。此操作不会触发付款或推广。");
  }catch(e){setNotice(e instanceof Error?e.message:"REVIEW_FAILED")}
  finally{setBusy(false)}
 }
 return <section className="mt-5 space-y-4">
  <label className="block">显示状态 <select className="ml-3 rounded border p-2" value={filter} onChange={e=>{setFilter(e.target.value);setSelected("");setNotice("");}}>
   {statuses.map(x=><option key={x}>{x}</option>)}</select></label>
  {!ready?<p>读取中…</p>:rows.length===0?<p>此状态暂无申请。</p>:
   rows.map(c=><article key={c.id} className="rounded-xl border p-5">
    <h2 className="font-bold">{c.company_name} · {c.product_id}</h2>
    <p className="text-sm">企业工作邮箱：{c.work_email} · 状态：{c.status}</p>
    <div className="my-3 flex flex-wrap gap-4 text-sm">
     <a target="_blank" rel="noopener noreferrer" className="underline" href={c.official_site}>官方网站 ↗</a>
     <a target="_blank" rel="noopener noreferrer" className="underline" href={c.evidence_url}>企业证据 ↗</a>
    </div>
    <button className="underline" onClick={()=>{setSelected(selected===c.id?"":c.id);setReason("");setConfirmed(false)}}>展开人工审核</button>
    {selected===c.id&&<div className="mt-4 grid gap-3">
     <label>审核依据（12–1000 字）<textarea className="block w-full rounded border p-3" minLength={12} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} rows={3}/></label>
     <label className="flex items-center gap-2"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>我已独立核实企业代表身份及证据，非仅凭邮箱或域名。</label>
     <div className="flex flex-wrap gap-3">
      {(c.status==="pending_review"||c.status==="identity_verified")&&<>
       <button disabled={busy||reason.trim().length<12||!confirmed} className="rounded border px-4 py-2 disabled:opacity-40" onClick={()=>decide(c,"approved")}>通过认领</button>
       <button disabled={busy||reason.trim().length<12} className="rounded border px-4 py-2 disabled:opacity-40" onClick={()=>decide(c,"rejected")}>驳回申请</button>
      </>}
      {c.status==="approved"&&<button disabled={busy||reason.trim().length<12} className="rounded border px-4 py-2 disabled:opacity-40" onClick={()=>decide(c,"revoked")}>撤销认领</button>}
     </div>
    </div>}
   </article>)}
  {notice&&<p role="status" className="mt-3 break-words">{notice}</p>}
 </section>;
}
