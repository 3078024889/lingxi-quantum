"use client";

import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {BUILD_CONNECTORS,SASI_INTEGRATIONS,type SasiIntegration} from "@/lib/sasi/integration-catalog";
import type {LingxiLang} from "@/lib/lingxi-i18n";
import {sasiConnectionText} from "@/lib/sasi/connection-i18n";
import {connectionPageCopy,connectionServiceCopy,CONNECTION_GROUPS} from "@/lib/sasi/connection-page-copy";
import {defaultBaseUrl} from "@/lib/sasi/intelligence/provider-defaults";
import type {ByokProvider} from "@/lib/sasi/credential-vault";

type Props={lang:LingxiLang;dark:boolean;accountEmail:string|null};
type Connection={service:string;keyHint:string;healthStatus:"stored"|"checking"|"healthy"|"unhealthy";lastCheckedAt:string|null;lastErrorCode:string|null;baseUrl?:string;model?:string};

const PRIMARY_IDS=["volcengine","openrouter","compatible","openai","xai","anthropic","gemini","deepseek","luma","aliyun"] as const;
const TITLE:Record<LingxiLang,string>={
 zh:"连接我的智能服务",en:"Connect my intelligence service",ja:"インテリジェンスサービスを接続",ko:"지능형 서비스 연결",
 fr:"Connecter mon service d’IA",de:"Meinen KI-Dienst verbinden",es:"Conectar mi servicio de IA",pt:"Conectar meu serviço de IA",ar:"ربط خدمة الذكاء الخاصة بي",
};

const TOOL_TITLE:Record<LingxiLang,string>={
 zh:"连接工具",en:"Connect tools",ja:"ツールを接続",ko:"도구 연결",fr:"Connecter des outils",de:"Tools verbinden",es:"Conectar herramientas",pt:"Conectar ferramentas",ar:"ربط الأدوات",
};

export default function ConnectionCenter({lang,accountEmail}:Props){
 const t=(zh:string,en:string)=>sasiConnectionText(lang,zh,en);
 const copy=connectionPageCopy(lang);
 const services=useMemo(()=>PRIMARY_IDS.map(id=>SASI_INTEGRATIONS.find(x=>x.id===id)).filter(Boolean) as SasiIntegration[],[]);
 const[selected,setSelected]=useState<SasiIntegration>(services[0]);
 const[credential,setCredential]=useState("");
 const[baseUrl,setBaseUrl]=useState("");const[model,setModel]=useState("");const[editing,setEditing]=useState(false);
 const[connections,setConnections]=useState<Connection[]>([]);
 const[state,setState]=useState<"loading"|"ready"|"login"|"unavailable">("loading");
 const[busy,setBusy]=useState<"save"|"test"|"delete"|null>(null);
 const[message,setMessage]=useState("");
 const connection=connections.find(x=>x.service===selected.id);
 useEffect(()=>{setBaseUrl(connection?.baseUrl||defaultBaseUrl(selected.id as ByokProvider));setModel(connection?.model||"");setEditing(false);setCredential("")},[selected.id,connection?.baseUrl,connection?.model]);

 useEffect(()=>{
  let alive=true;
  fetch("/api/sasi/connections",{cache:"no-store"})
   .then(async r=>({r,b:await r.json().catch(()=>({}))}))
   .then(({r,b})=>{if(!alive)return;if(r.ok){setConnections(b.connections??[]);setState("ready")}else setState(r.status===401?"login":"unavailable")})
   .catch(()=>alive&&setState("unavailable"));
  return()=>{alive=false};
 },[accountEmail]);

 function status(service:string){
  const item=connections.find(x=>x.service===service);
  if(!item)return t("未连接","Not connected");
  if(item.healthStatus==="unhealthy")return t("连接失败","Connection failed");
  return item.healthStatus==="healthy"?t("已连接","Connected"):t("已安全保存 · 待验证","Stored · verify next");
 }

 async function save(){
  if(!credential.trim()||busy)return;
  setBusy("save");setMessage("");
  try{const r=await fetch("/api/sasi/connections",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:selected.id,apiKey:credential,...(baseUrl.trim()?{baseUrl:baseUrl.trim()}:{}),...(model.trim()?{model:model.trim()}:{} )})});
  const b=await r.json().catch(()=>({}));
  if(r.ok){
   setConnections(xs=>[...xs.filter(x=>x.service!==selected.id),{service:selected.id,keyHint:b.keyHint,healthStatus:"stored",lastCheckedAt:null,lastErrorCode:null,baseUrl,model}]);
   setCredential("");setEditing(false);setMessage(t("已保存，请检查连接。","Saved. Check the connection next."));
   await checkConnection(selected.id);
  }else setMessage(t("暂时无法连接，请稍后再试。","Unable to connect right now. Please try again later."));
  }catch{setMessage(t("暂时无法连接，请稍后再试。","Unable to connect right now. Please try again later."))}finally{setBusy(null)}
 }

 async function checkConnection(provider:string){
  const r=await fetch("/api/sasi/connections/test",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider})});
  const b=await r.json().catch(()=>({}));
  const healthy=r.ok&&b.healthStatus==="healthy";
  setConnections(xs=>xs.map(x=>x.service===provider?{...x,healthStatus:healthy?"healthy":"unhealthy",lastCheckedAt:new Date().toISOString(),lastErrorCode:healthy?null:"CHECK_FAILED",model:healthy&&b.model?b.model:x.model}:x));
  setMessage(healthy?t("连接正常，可以开始使用。","Connection is ready to use."):t("连接没有成功，请检查后重试。","The connection did not succeed. Please check and try again."));
 }

 async function test(){
  if(!connection||busy)return;
  setBusy("test");setMessage("");
  try{await checkConnection(selected.id)}catch{setMessage(t("暂时无法连接，请稍后再试。","Unable to connect right now. Please try again later."))}finally{setBusy(null)}
 }

 async function remove(){
  if(!connection||busy||!window.confirm(t("确定删除这个连接？","Remove this connection?")))return;
  setBusy("delete");setMessage("");
  try{const r=await fetch(`/api/sasi/connections?provider=${encodeURIComponent(selected.id)}`,{method:"DELETE"});
  if(r.ok){setConnections(xs=>xs.filter(x=>x.service!==selected.id));setMessage(t("已删除。","Removed."))}
  else setMessage(t("暂时无法删除，请稍后再试。","Unable to remove it right now. Please try again later."));
  }catch{setMessage(t("暂时无法删除，请稍后再试。","Unable to remove it right now. Please try again later."))}finally{setBusy(null)}
 }

 return <section dir={lang==="ar"?"rtl":"ltr"} className="mx-auto max-w-6xl py-4 sm:py-6">
  <header className="mb-8">
   <p className="text-xs font-semibold tracking-[.18em] text-[var(--lx-faint)]">SASI</p>
   <h1 className="mt-2 text-3xl font-semibold text-[var(--lx-ink)]">{TITLE[lang]}</h1>
   <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--lx-muted)]">{copy.intro}</p>
  </header>

  <div data-connection-layout className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
   <nav aria-label={copy.choose} data-connection-services className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-3">
    {CONNECTION_GROUPS.map(group=><div key={group.id} className="mb-4 last:mb-0">
     <h2 className="px-3 pb-2 pt-2 text-xs font-semibold text-[var(--lx-muted)]">{copy[group.id]}</h2>
     <div className="grid grid-cols-2 gap-1 lg:grid-cols-1">{group.services.map(id=>{
      const item=services.find(x=>x.id===id)!;const active=selected.id===id;
      return <button key={id} type="button" aria-pressed={active} disabled={Boolean(busy)} onClick={()=>{setSelected(item);setCredential("");setMessage("")}} className={[
       "flex min-w-0 items-center gap-3 rounded-xl border px-3 py-3 text-start transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
       active?"border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40":"border-transparent hover:bg-[var(--lx-soft)]"
      ].join(" ")}>
       <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--lx-soft)] text-xs font-bold" style={{color:item.color}}>{connectionServiceCopy(id,lang).symbol}</span>
       <span className="min-w-0"><b className="block text-sm text-[var(--lx-ink)]">{id==="compatible"?copy.otherName:item.name}</b><span className="mt-1 block text-xs text-[var(--lx-muted)]">{status(id)}</span></span>
      </button>
     })}</div>
    </div>)}
   </nav>
   <article data-connection-details className="min-w-0 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 sm:p-8 lg:sticky lg:top-24">
    <p className="text-xs font-medium text-[var(--lx-muted)]">{copy[CONNECTION_GROUPS.find(g=>g.services.includes(selected.id))!.id]}</p>
    <h2 className="mt-2 text-2xl font-semibold text-[var(--lx-ink)]">{selected.id==="compatible"?copy.otherName:selected.name}</h2>
    <p className="mt-2 text-sm text-[var(--lx-muted)]">{connectionServiceCopy(selected.id,lang).products}</p>
    <p className="mt-5 text-sm leading-7 text-[var(--lx-muted)]">{connectionServiceCopy(selected.id,lang).description}</p>
    <div className="my-6 rounded-xl bg-[var(--lx-soft)] p-4">
     <h3 className="text-sm font-medium">{copy.available}</h3>
     <p className="mt-2 text-sm leading-7 text-[var(--lx-muted)]">{connectionServiceCopy(selected.id,lang).available}</p>
    </div>
      <div className="flex flex-wrap items-center gap-2">
       <a href={selected.keyUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--lx-line)] px-3 py-2 text-xs">{copy.open} ↗</a>
       {connection&&<span className="rounded-full bg-[var(--lx-soft)] px-3 py-2 text-xs text-[var(--lx-muted)]">{connection.keyHint}</span>}
      </div>
      {state==="ready"&&(!connection||editing)&&(selected.id==="compatible"?<div className="mt-6 grid gap-3 sm:grid-cols-2">
       <label className="text-sm">{t("服务地址","Service URL")}<input type="url" value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder={selected.id==="compatible"?"https://example.com/v1":copy.automatic} autoComplete="off" className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-transparent px-3 py-2" /></label>
       <label className="text-sm">{t("模型名称","Model ID")}<input value={model} onChange={e=>setModel(e.target.value)} autoComplete="off" placeholder={selected.id==="compatible"?"":copy.automatic} maxLength={180} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-transparent px-3 py-2" /></label>
      </div>:<details className="mt-6 rounded-xl border border-[var(--lx-line)] p-4"><summary className="cursor-pointer text-sm text-[var(--lx-muted)]">{copy.settings}</summary><p className="mt-2 text-xs leading-6 text-[var(--lx-muted)]">{copy.defaults}</p><div className="mt-3 grid gap-3 sm:grid-cols-2">
       <label className="text-sm">{t("服务地址","Service URL")}<input type="url" value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder={copy.automatic} autoComplete="off" className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-transparent px-3 py-2" /></label>
       <label className="text-sm">{t("模型名称","Model ID")}<input value={model} onChange={e=>setModel(e.target.value)} autoComplete="off" maxLength={180} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-transparent px-3 py-2" /></label>
      </div></details>)}
      {(!connection||editing)&&<p className="mt-6 text-sm font-medium">{selected.id==="compatible"?copy.otherDescription:copy.keyOnly}</p>}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
       {(!connection||editing)?<><input type="password" disabled={state!=="ready"} autoComplete="off" spellCheck={false} value={credential} onChange={e=>setCredential(e.target.value)}
        aria-label={t("连接凭证","Connection credential")} placeholder={t("粘贴 API Key","Paste API key")}
        className="min-w-0 flex-1 rounded-xl border border-[var(--lx-line)] bg-transparent px-4 py-3 text-sm outline-none"/>
        <button type="button" disabled={state!=="ready"||busy!==null||credential.trim().length<8||(selected.id==="compatible"&&(!baseUrl.trim()||!model.trim()))} onClick={save} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">
         {busy==="save"?t("连接中…","Connecting…"):t("保存并检查","Save and check")}
        </button></>
       :connection?<div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy!==null} onClick={()=>setEditing(true)} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">{t("修改连接","Edit connection")}</button>
        <button type="button" disabled={busy!==null} onClick={test} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">{busy==="test"?t("检查中…","Checking…"):t("检查连接","Check connection")}</button>
        <button type="button" disabled={busy!==null} onClick={remove} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">{busy==="delete"?t("删除中…","Removing…"):t("删除连接","Remove")}</button>
       </div>
       :<p className="text-sm text-[var(--lx-muted)]">{state==="login"?t("请先登录。","Please sign in first."):state==="loading"?t("正在读取…","Loading…"):t("暂时无法连接，请稍后再试。","Unable to connect right now. Please try again later.")}</p>}
      </div>
      {state!=="ready"&&<p role="status" className="mt-3 text-sm text-[var(--lx-muted)]">{state==="login"?<Link href="/account?mode=signin" className="text-blue-600 underline underline-offset-4">{t("请先登录。","Please sign in first.")}</Link>:state==="loading"?t("正在读取…","Loading…"):t("暂时无法连接，请稍后再试。","Unable to connect right now. Please try again later.")}</p>}
      {message&&<p role="status" className="mt-4 rounded-xl bg-[var(--lx-soft)] p-3 text-sm text-[var(--lx-muted)]">{message}</p>}
    <p className="mt-6 border-t border-[var(--lx-line)] pt-4 text-xs leading-6 text-[var(--lx-muted)]">{copy.billing}</p>
   </article>
  </div>

  <section id="tools" className="mt-10 border-t border-[var(--lx-line)] pt-8">
   <h2 className="text-xl font-semibold text-[var(--lx-ink)]">{TOOL_TITLE[lang]}</h2>
   <div className="mt-4 grid gap-2 sm:grid-cols-2">
    {BUILD_CONNECTORS.map(item=><a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-[var(--lx-line)] px-4 py-3 text-sm hover:bg-[var(--lx-soft)]">
     <span><b>{item.name}</b></span><span aria-hidden>↗</span>
    </a>)}
   </div>
  </section>
 </section>;
}
