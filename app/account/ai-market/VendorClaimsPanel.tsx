"use client";
import {useEffect,useState} from "react";
type Claim={id:string;product_id:string;company_name:string;official_site:string;status:string;created_at:string;reviewed_at?:string|null};
export default function VendorClaimsPanel({initialProduct=""}:{initialProduct?:string}){
 const [claims,setClaims]=useState<Claim[]>([]);
 const [productId,setProductId]=useState(initialProduct),[companyName,setCompanyName]=useState("");
 const [officialSite,setOfficialSite]=useState(""),[workEmail,setWorkEmail]=useState("");
 const [evidenceUrl,setEvidenceUrl]=useState(""),[busy,setBusy]=useState(false);
 const [notice,setNotice]=useState(""),[ready,setReady]=useState(false);
 useEffect(()=>{const controller=new AbortController();fetch("/api/ai-market/vendor-claims",{cache:"no-store",signal:controller.signal})
 .then(async r=>{const x=await r.json();if(!r.ok)throw Error(x.error||"CLAIMS_UNAVAILABLE");setClaims(x.claims||[])})
 .catch(e=>{if(!controller.signal.aborted)setNotice(e instanceof Error?e.message:"CLAIMS_UNAVAILABLE")})
 .finally(()=>{if(!controller.signal.aborted)setReady(true)});return()=>controller.abort()},[]);
 async function send(event:React.FormEvent){
  event.preventDefault();if(busy)return;setBusy(true);setNotice("");
  try{
   const res=await fetch("/api/ai-market/vendor-claims",{method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({productId,companyName,officialSite,workEmail,evidenceUrl})});
   const body=await res.json();
   if(!res.ok)throw Error(body.error||"提交未成功");
   setClaims(old=>[body.claim,...old]);setNotice("已提交，正在核验企业身份。未获得管理权限或推广排名。");
   setCompanyName("");setOfficialSite("");setWorkEmail("");setEvidenceUrl("");
  }catch(e){setNotice(e instanceof Error?e.message:"提交失败")}
  finally{setBusy(false)}
 }
 return <div className="mt-8 space-y-7">
  <section className="rounded-xl border p-5">
   <h2 className="text-xl font-bold">我的认领申请（{claims.length}/3）</h2>
   {!ready?<p className="mt-3">读取中…</p>:claims.length===0?<p className="mt-3">暂无认领记录。</p>:
    <ul className="mt-3 space-y-3">{claims.map(c=><li key={c.id} className="rounded-lg border p-3">
     <strong>{c.company_name} · {c.product_id}</strong><p>状态：{c.status==="pending_review"?"等待企业身份审核":c.status==="approved"?"已核准":c.status==="rejected"?"未通过审核":c.status==="revoked"?"已撤销":c.status==="identity_verified"?"身份已核验":c.status}</p>
     <p className="text-xs opacity-70">提交时间：{new Date(c.created_at).toLocaleDateString()}</p>
    </li>)}</ul>}
  </section>
  <form onSubmit={send} className="grid gap-4 rounded-xl border p-5">
   <h2 className="text-xl font-bold">免费认领现有平台</h2>
   <label>平台 ID（现有 32 家之一）<input className="w-full rounded border p-3" required value={productId} onChange={e=>setProductId(e.target.value)} maxLength={64} placeholder="例如 chatgpt"/></label>
   <label>公司名称<input className="w-full rounded border p-3" required minLength={2} maxLength={120} value={companyName} onChange={e=>setCompanyName(e.target.value)}/></label>
   <label>官方网站<input type="url" className="w-full rounded border p-3" required value={officialSite} onChange={e=>setOfficialSite(e.target.value)} placeholder="https://"/></label>
   <label>官方工作邮箱<input type="email" className="w-full rounded border p-3" required value={workEmail} onChange={e=>setWorkEmail(e.target.value)}/></label>
   <label>身份依据的官方链接<input type="url" className="w-full rounded border p-3" required value={evidenceUrl} onChange={e=>setEvidenceUrl(e.target.value)} placeholder="https://"/></label>
   <p className="text-xs leading-6 opacity-80">登录账号不会自动证明企业所有权。即使邮箱域名相同，也需人工审核身份与公开资料；免费认领并非购买排名。</p>
   <button className="rounded-lg border px-5 py-3 font-bold disabled:opacity-60" disabled={busy||claims.length>=3||!ready}>{busy?"正在提交…":"提交免费认领申请"}</button>
   {claims.length>=3&&<p>每个账户最多提交 3 个免费认领申请。</p>}
   {notice&&<p role="status" className="break-words">{notice}</p>}
  </form>
  <section className="rounded-xl border p-5"><h2 className="text-xl font-bold">付费推广</h2>
   <p className="mt-2">精选推荐位、分类赞助及品牌专题会与自然排名明确分开；只有认领审核通过的账户才有资格提交推广订单。真实支付及权益发放尚未启用。</p>
  </section>
 </div>
}
