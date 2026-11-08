"use client";
import {useCallback,useEffect,useState} from "react";
type Seller={user_id:string;display_name:string;status:string;kyc_status:string;created_at:string};
type Listing={id:string;seller_id:string;title:string;description:string;category:string;price_cny_minor:number;price_usd_minor:number;scan_status:string;status:string;approvedArtifactReady:boolean;created_at:string};
type Media={id:string;listingId:string;kind:string;previewUrl:string|null;createdAt?:string};
type ReviewEvent={id:string;subject_type:string;action:string;reason:string;created_at:string};
type Queue={sellers:Seller[];listings:Listing[];media:Media[];events:ReviewEvent[]};
const noResult:Queue={sellers:[],listings:[],media:[],events:[]};
const stateLabel:Record<string,string>={
 unscanned:"待安全扫描",clean:"安全扫描通过",infected:"检测到风险",scan_failed:"扫描失败",
 approved:"已批准",awaiting_review:"待审核",published:"已上架",submitted:"待发布"
};
export default function SasiMarketplaceReviewConsole(){
 const [queue,setQueue]=useState<Queue>(noResult);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState("");
 const [error,setError]=useState("");
 const [ok,setOk]=useState("");
 const [reasons,setReasons]=useState<Record<string,string>>({});
 const reload=useCallback(async()=>{
  setLoading(true);
  try{
   const response=await fetch("/api/sasi/marketplace/admin/review",{cache:"no-store",credentials:"same-origin"});
   const body=await response.json();
   if(!response.ok)throw Error(body.error||"审核列表暂不可用");
   setQueue(body);
   setError("");
  }catch(e){setError(e instanceof Error?e.message:"审核列表暂不可用")}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{void reload()},[reload]);
 async function review(action:string,targetId:string){
  if(busy)return;
  const reason=(reasons[targetId]||"").trim();
  if(action.endsWith(".reject")||action==="seller.suspend"){
   if(reason.length<8){setError("请填写至少 8 个字的审核原因。");return;}
  }
  if((action==="listing.publish"||action==="seller.approve")&&
   !window.confirm(action==="listing.publish"?"确认商品已完成安全扫描、授权与展示资料审核，并正式发布？":"确认卖家身份及申请资料已审核，允许上传软件？"))return;
  setBusy(targetId);setError("");setOk("");
  try{
   const response=await fetch("/api/sasi/marketplace/admin/review",{
    method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({action,targetId,reason})
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data.ok)throw Error(data.error||"审核未完成");
   setOk("审核记录已保存。");
   await reload();
  }catch(e){setError(e instanceof Error?e.message:"审核未完成")}
  finally{setBusy("")}
 }
 const reasonField=(id:string)=><input aria-label="审核原因"
  value={reasons[id]||""} onChange={e=>setReasons(x=>({...x,[id]:e.target.value}))}
  placeholder="需要拒绝时填写具体原因（至少8字）" maxLength={500}
  className="w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-3 py-2 text-sm text-[var(--lx-ink)]"/>;
 const actionButton=(id:string,action:string,label:string,off=false)=>
  <button type="button" disabled={Boolean(busy)||off} onClick={()=>void review(action,id)}
   className="rounded-xl border border-[var(--lx-line)] px-4 py-2.5 text-sm font-semibold text-[var(--lx-ink)] disabled:cursor-not-allowed disabled:opacity-40 hover:border-violet-500">{busy===id?"处理中…":label}</button>;
 return <main className="lx11-page mx-auto max-w-6xl px-4 py-10 text-[var(--lx-ink)] md:px-8">
  <header className="flex flex-wrap items-center justify-between gap-4">
   <div><p className="text-xs font-bold tracking-[.2em] text-violet-600">SASI · REVIEW</p><h1 className="mt-3 text-3xl font-bold">软件商品审核台</h1>
   <p className="mt-2 text-sm text-[var(--lx-muted)]">卖家申请、软件安全、商品图片与发布审核集中处理。付款及发货由订单系统独立管理。</p></div>
   <button type="button" onClick={()=>void reload()} disabled={loading} className="rounded-xl border border-[var(--lx-line)] px-4 py-2.5 text-sm">刷新审核列表</button>
  </header>
  {error&&<p role="alert" className="mt-6 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
  {ok&&<p role="status" className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">{ok}</p>}
  {loading&&<p className="mt-6 text-sm text-[var(--lx-muted)]">正在读取审核列表…</p>}
  <section className="mt-9"><h2 className="mb-4 text-xl font-bold">卖家入驻申请 <span className="text-sm text-[var(--lx-muted)]">({queue.sellers.length})</span></h2>
   <div className="grid gap-3">{queue.sellers.map(s=><article key={s.user_id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
    <h3 className="font-semibold">{s.display_name}</h3><p className="mt-1 text-xs text-[var(--lx-muted)]">{s.user_id} · {new Date(s.created_at).toLocaleString()}</p>
    <p className="mt-2 text-sm text-[var(--lx-muted)]">卖家身份审核：{s.kyc_status==="verified"?"已核验":"尚未核验，提现仍需单独验证"}</p>
    <div className="mt-4 flex flex-wrap gap-2">{actionButton(s.user_id,"seller.approve","批准入驻")}</div>
   </article>)}
    {!queue.sellers.length&&!loading&&<p className="text-sm text-[var(--lx-muted)]">暂无新的卖家申请。</p>}
   </div>
  </section>
  <section className="mt-10"><h2 className="mb-4 text-xl font-bold">商品图片审核 <span className="text-sm text-[var(--lx-muted)]">({queue.media.length})</span></h2>
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{queue.media.map(image=><article key={image.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4">
    {image.previewUrl?<img src={image.previewUrl} alt={image.kind==="cover"?"商品主图审核":"商品详情图审核"} loading="lazy" className="h-44 w-full rounded-xl bg-[var(--lx-soft)] object-contain"/>:
     <div className="grid h-44 place-items-center rounded-xl bg-[var(--lx-soft)] text-sm text-[var(--lx-muted)]">图片预览不可用</div>}
    <p className="mt-3 text-sm font-medium">{image.kind==="cover"?"主图":"详情图"} · 待审核</p>
    <p className="mt-1 break-all text-xs text-[var(--lx-muted)]">{image.listingId}</p>
    <div className="mt-3">{reasonField(image.id)}</div>
    <div className="mt-3 flex gap-2">{actionButton(image.id,"media.approve","通过",!image.previewUrl)}{actionButton(image.id,"media.reject","拒绝")}</div>
   </article>)}</div>
   {!queue.media.length&&!loading&&<p className="text-sm text-[var(--lx-muted)]">暂无待审核图片。</p>}
  </section>
  <section className="mt-10"><h2 className="mb-4 text-xl font-bold">软件上架审核 <span className="text-sm text-[var(--lx-muted)]">({queue.listings.length})</span></h2>
   <div className="grid gap-4">{queue.listings.map(l=><article key={l.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{l.title}</h3>
     <p className="mt-1 text-xs text-[var(--lx-muted)]">{l.category} · {l.id}</p></div>
     <span className="rounded-full border border-[var(--lx-line)] px-3 py-1.5 text-xs">{stateLabel[l.scan_status]||l.scan_status}</span>
    </div>
    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--lx-muted)]">{l.description}</p>
    <p className="mt-3 text-sm font-semibold">¥{(l.price_cny_minor/100).toLocaleString("zh-CN")} · USD {(l.price_usd_minor/100).toLocaleString("en-US")}</p>
    <p className="mt-3 text-xs text-[var(--lx-muted)]">交付文件：{l.approvedArtifactReady?"已准备":"未完成安全扫描"}</p>
    <div className="mt-4">{reasonField(l.id)}</div>
    <div className="mt-4 flex flex-wrap gap-2">
     {actionButton(l.id,"listing.publish","审核通过并发布",l.scan_status!=="clean"||!l.approvedArtifactReady)}
     {actionButton(l.id,"listing.reject","退回修改")}
    </div>
   </article>)}
   {!queue.listings.length&&!loading&&<p className="text-sm text-[var(--lx-muted)]">暂无待发布软件。</p>}
   </div>
  </section>
  <section className="mt-10"><h2 className="mb-4 text-lg font-semibold">最近审核记录</h2><div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   {queue.events.map(e=><p key={e.id} className="border-b border-[var(--lx-line)] py-2 text-xs leading-6 text-[var(--lx-muted)]">
    {new Date(e.created_at).toLocaleString()} · {e.subject_type} · {e.action}{e.reason?" · "+e.reason:""}
   </p>)}
   {!queue.events.length&&<p className="text-sm text-[var(--lx-muted)]">暂无审核历史。</p>}
  </div></section>
 </main>;
}
