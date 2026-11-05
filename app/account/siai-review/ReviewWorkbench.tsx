"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";

type Candidate={id:string;name:string;company:string;category:string;website:string;batch:string;publisherGroupId:string;sourcePreview:boolean;newIntake:boolean;tasks:string[];evidenceUrl:string;evidence:{field:string;text:string;source:string}[]};
type Submission={id:string;project_id:string;request_type:string;product_name:string;official_site:string;
 work_email:string;submitter_name:string;description:string|null;evidence_url:string;
 status:string;verified_domain:boolean;created_at:string;reviewed_at:string|null};
type ReviewAction="review"|"reject"|"approve";
const statusLabel:Record<string,string>={pending_identity_check:"待核实厂商身份",pending_review:"资料审核中",approved:"人工核准，待编辑发布",rejected:"未通过"};
function format(value:string){const date=new Date(value);return Number.isFinite(date.valueOf())?date.toLocaleString("zh-CN",{hour12:false}):"";}
export default function ReviewWorkbench({candidates}:{candidates:Candidate[]}){
 const [tab,setTab]=useState<"submissions"|"candidates">("submissions");
 const [search,setSearch]=useState("");
 const [candidateCategory,setCandidateCategory]=useState("*");
 const [candidatePool,setCandidatePool]=useState<"all"|"new"|"older"|"preview">("all");
 const [sourcedOnly,setSourcedOnly]=useState(false);
 const [rows,setRows]=useState<Submission[]>([]),[total,setTotal]=useState(0);
 const [loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [processing,setProcessing]=useState<string|null>(null),[attested,setAttested]=useState<string|null>(null);
 async function load(){
  setLoading(true);setError("");
  try{const response=await fetch("/api/account/siai-review",{credentials:"same-origin",cache:"no-store"});
   if(!response.ok)throw new Error(response.status===403?"仅管理账户可访问审核资料。":"审核数据读取失败。");
   const result=await response.json();setRows(result.rows||[]);setTotal(result.total||0);
  }catch(e){setError(e instanceof Error?e.message:"审核数据读取失败。");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void load()},[]);
 const candidateCategoryCounts=useMemo(()=>Object.entries(candidates.reduce<Record<string,number>>((totals,p)=>{totals[p.category]=(totals[p.category]||0)+1;return totals;},{})).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])),[candidates]);
 const evidenceCount=useMemo(()=>candidates.reduce((total,p)=>total+p.evidence.length,0),[candidates]);
 const newTotal=useMemo(()=>candidates.filter(p=>p.newIntake).length,[candidates]);
 const previewTotal=useMemo(()=>candidates.filter(p=>p.sourcePreview).length,[candidates]);
 const reviewedSources=useMemo(()=>candidates.filter(p=>p.evidence.length>0).length,[candidates]);
 const candidatesShown=useMemo(()=>candidates.filter(p=>(candidateCategory==="*"||p.category===candidateCategory)&&(candidatePool==="all"||(candidatePool==="new"&&p.newIntake)||(candidatePool==="older"&&!p.sourcePreview&&!p.newIntake)||(candidatePool==="preview"&&p.sourcePreview))&&(!sourcedOnly||p.evidence.length>0)&&(p.name+" "+p.company+" "+p.category+" "+p.tasks.join(" ")).toLowerCase().includes(search.toLowerCase().trim())),[candidates,search,candidateCategory,candidatePool,sourcedOnly]);
 const submissionsShown=useMemo(()=>rows.filter(p=>(p.product_name+" "+p.status+" "+p.official_site).toLowerCase().includes(search.toLowerCase().trim())),[rows,search]);
 async function operate(id:string,action:ReviewAction){
  if(action==="approve"&&attested!==id){setNotice("请先确认已在站外人工核对厂商授权及身份。");return;}
  if(!window.confirm(action==="approve"?"确认已独立核验厂商授权？此操作只批准审核身份，不会自动发布、授予编辑权或收取费用。":action==="reject"?"确定拒绝此申请？":"将申请转入资料审核阶段？"))return;
  setProcessing(id);setNotice("");
  try{
   const response=await fetch("/api/account/siai-review",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id,action,identityVerifiedByHuman:action==="approve"&&attested===id})});
   if(!response.ok)throw new Error("审核提交失败，请核对管理员权限及状态。");
   setNotice("审核结果已记录；资料不会自动进入公开排行榜。");setAttested(null);await load();
  }catch(e){setNotice(e instanceof Error?e.message:"审核失败。");}
  finally{setProcessing(null);}
 }
 return <section className="mx-auto w-full space-y-5 text-[var(--lx-ink)]">
  <header className="flex flex-wrap items-end justify-between gap-3">
   <div><p className="text-sm font-bold text-blue-700">LINGXIFIELD · GLOBAL SIAI</p>
    <h1 className="mt-2 text-2xl font-bold">全球 SIAI 厂商审核工作台</h1>
    <p className="mt-2 text-sm">你授权的管理账户人工核对资料；AI 只能协助查证，不自动批准厂商，也不自动发布未核实信息。</p>
   </div>
   <div className="flex flex-wrap gap-2"><Link className="rounded-md border p-2 text-sm" href="/account/money-admin">返回管理后台</Link><Link className="rounded-md border p-2 text-sm" href="/siai">查看公开排行榜</Link></div>
  </header>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
   <div className="rounded-lg border p-3"><p className="text-sm text-[var(--lx-muted)]">已收厂商申请</p><strong className="text-xl">{total}</strong></div>
   <div className="rounded-lg border p-3"><p className="text-sm text-[var(--lx-muted)]">待人工核验</p><strong className="text-xl">{rows.filter(p=>p.status.startsWith("pending")).length}</strong></div>
   <div className="col-span-2 rounded-lg border p-3 sm:col-span-1"><p className="text-sm text-[var(--lx-muted)]">待核验产品档案（含公开预览）</p><strong className="text-xl">{candidates.length}</strong></div>
  </div>
  <div className="flex flex-wrap items-center gap-2">
   <button type="button" aria-pressed={tab==="submissions"} className="rounded-lg border px-3 py-2 text-sm font-semibold aria-pressed:bg-blue-100" onClick={()=>setTab("submissions")}>厂商认领 / 提交</button>
   <button type="button" aria-pressed={tab==="candidates"} className="rounded-lg border px-3 py-2 text-sm font-semibold aria-pressed:bg-blue-100" onClick={()=>setTab("candidates")}>全部待审核产品 · {candidates.length}</button>
   <input aria-label="搜索厂商与功能" className="ml-auto min-w-[180px] rounded-lg border px-3 py-2 text-sm" value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜厂商、平台、领域或功能"/>
   <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={()=>void load()} disabled={loading}>刷新申请</button>
  </div>
  {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
  {notice&&<p role="status" className="rounded-lg border p-3 text-sm">{notice}</p>}
  {tab==="submissions"?<div className="space-y-3">
   {loading&&<p role="status">正在读取审核申请…</p>}
   {!loading&&!submissionsShown.length&&<p className="rounded-xl border p-6 text-sm">暂无待展示的厂商申请。新提交会保存在 Supabase 审核队列，不会自动公开。</p>}
   {submissionsShown.map(p=><article key={p.id} className="rounded-xl border bg-[var(--lx-panel)] p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
     <div><h2 className="text-lg font-bold">{p.product_name}</h2><p className="mt-1 text-sm">申请人：{p.submitter_name} · {p.work_email}</p><p className="mt-1 text-sm">{statusLabel[p.status]||p.status} · {format(p.created_at)}</p></div>
     <div className="flex flex-wrap gap-3 text-sm text-blue-700"><a href={p.official_site} rel="nofollow noopener noreferrer" target="_blank">官方地址 ↗</a><a href={p.evidence_url} rel="nofollow noopener noreferrer" target="_blank">提交证据 ↗</a></div>
    </div>
    {p.description&&<p className="mt-3 whitespace-pre-wrap text-sm">{p.description}</p>}
    {p.status.startsWith("pending")&&<div className="mt-4 space-y-3">
     <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={attested===p.id} onChange={e=>setAttested(e.target.checked?p.id:null)}/>我已在站外核查厂商身份、联系人授权及来源证据，不仅凭邮箱后缀判断。</label>
     <div className="flex flex-wrap gap-2">
      <button className="rounded-md border px-3 py-2 text-sm" type="button" disabled={processing!==null} onClick={()=>void operate(p.id,"review")}>转入资料审核</button>
      <button className="rounded-md border px-3 py-2 text-sm" type="button" disabled={processing!==null} onClick={()=>void operate(p.id,"reject")}>拒绝申请</button>
      <button className="rounded-md border border-blue-700 bg-blue-700 px-3 py-2 text-sm text-white disabled:opacity-50" type="button" disabled={processing!==null||attested!==p.id} onClick={()=>void operate(p.id,"approve")}>人工批准身份（不自动发布）</button>
     </div>
    </div>}
   </article>)}
  </div>:<div className="space-y-2">
   <p className="text-sm">{candidates.length} 项独立产品档案，包含新增 {newTotal} 家、历史候选 {candidates.length-newTotal-previewTotal} 家及公开但未获厂商认证的来源预览 {previewTotal} 家。已记录 {evidenceCount} 条带来源观察；任何未经核实的字段保持未知。</p>
   <nav className="flex flex-wrap gap-2" aria-label="按审核阶段筛选">
    {([
      ["all","所有产品",candidates.length],["new","新采集",newTotal],
      ["older","先前候选",candidates.length-newTotal-previewTotal],["preview","公开资料预览（未认证）",previewTotal]
    ] as const).map(([key,title,count])=><button type="button" key={key} aria-pressed={candidatePool===key}
    className="rounded-md border px-2 py-1.5 text-sm aria-pressed:bg-blue-100"
    onClick={()=>setCandidatePool(key)}>{title} {count}</button>)}
   </nav>
   <nav className="flex flex-wrap gap-2" aria-label="新增平台按领域筛选">
    <button type="button" aria-pressed={candidateCategory==="*"} className="rounded-md border px-2 py-1.5 text-sm aria-pressed:bg-blue-100" onClick={()=>setCandidateCategory("*")}>全部 {candidates.length}</button>
    {candidateCategoryCounts.map(([category,count])=><button type="button" key={category} aria-pressed={candidateCategory===category} className="rounded-md border px-2 py-1.5 text-sm aria-pressed:bg-blue-100" onClick={()=>setCandidateCategory(category)}>{category} {count}</button>)}
   </nav>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sourcedOnly} onChange={e=>setSourcedOnly(e.target.checked)}/>只看已记录官网证据的平台（{reviewedSources} 家）</label>
   <p className="text-sm text-[var(--lx-muted)]">短视频生成的费用另核对模型、分辨率、秒数、积分和套餐，不能用图片创作或视频剪辑的标签代替。未知的结算方式不统计为支持。</p>
   <div className="max-h-[680px] space-y-2 overflow-y-auto rounded-xl border p-3">
    {candidatesShown.map(p=><article key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-[var(--lx-panel)] p-3">
     <div><strong className="text-sm">{p.name}</strong><p className="text-sm text-[var(--lx-muted)]">
      {p.company} · {p.category} · {p.tasks.join(" / ")}
     </p><p className="mt-1 text-xs text-[var(--lx-muted)]">
      {p.batch} · 厂商组 {p.publisherGroupId} · {p.sourcePreview?"仅官网来源预览，未经厂商认证":p.newIntake?"新候选，未公开":"旧候选，未公开"}
     </p></div>
     <a target="_blank" rel="noopener noreferrer nofollow" className="shrink-0 text-sm font-medium text-blue-700 underline" href={p.evidenceUrl}>核对官网 ↗</a>
     {p.evidence.length>0&&<details className="w-full min-w-0 border-t pt-2 text-sm">
      <summary className="cursor-pointer font-semibold">官方资料观察 {p.evidence.length} 项 · 点开查看来源</summary>
      <div className="mt-2 space-y-2">{p.evidence.map(e=><div key={e.field} className="rounded-md bg-[var(--lx-bg)] p-2">
       <strong>{({price:"价格",free:"免费额度",models:"能力",regions:"地区",commercial:"商用授权",payment:"付款方式",company:"发布品牌"} as Record<string,string>)[e.field]||e.field}：</strong>
       <span>{e.text}</span>
       <a className="ml-2 text-blue-700 underline" href={e.source} target="_blank" rel="nofollow noopener noreferrer">核对官方证据 ↗</a>
      </div>)}</div>
     </details>}
    </article>)}
   </div>
   <p className="text-sm">显示 {candidatesShown.length}/{candidates.length} 项。候选列表仅管理账户可见，发布须再次审核。</p>
  </div>}
 </section>;
}
