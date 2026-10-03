"use client";

import NextImage from "next/image";
import {useEffect,useMemo,useState} from "react";
import {BUILD_CONNECTORS,SASI_INTEGRATIONS,type SasiIntegration} from "@/lib/sasi/integration-catalog";
import type {LingxiLang} from "@/lib/lingxi-i18n";
import {sasiConnectionText} from "@/lib/sasi/connection-i18n";

type Props={lang:LingxiLang;dark:boolean;accountEmail:string|null};
type Connection={service:string;keyHint:string;healthStatus:"stored"|"checking"|"healthy"|"unhealthy";lastCheckedAt:string|null;lastErrorCode:string|null};

const PRIMARY_IDS=["volcengine","openrouter"] as const;
const LOGOS:Record<string,string>={
 volcengine:"https://www.google.com/s2/favicons?domain=volcengine.com&sz=128",
 openrouter:"https://www.google.com/s2/favicons?domain=openrouter.ai&sz=128",
};

const SHARED_COPY:Record<LingxiLang,string>={
 zh:"只需连接一个 API Key，即可使用该 API 账号下已开通的全球多智能生态模型。",
 en:"Connect one API key to use the global multi-model intelligence services enabled for that API account.",
 ja:"API Key を1つ接続するだけで、その API アカウントで有効になっている世界中のマルチモデル AI を利用できます。",
 ko:"API Key 하나만 연결하면 해당 API 계정에서 활성화된 글로벌 멀티모델 AI를 사용할 수 있습니다.",
 fr:"Connectez une seule clé API pour utiliser les modèles d’IA mondiaux activés sur ce compte API.",
 de:"Verbinde einen API-Schlüssel und nutze die weltweit verfügbaren KI-Modelle, die für dieses API-Konto freigeschaltet sind.",
 es:"Conecta una sola clave API para usar los modelos de IA globales habilitados en esa cuenta API.",
 pt:"Conecte uma única chave API para usar os modelos globais de IA habilitados nessa conta API.",
 ar:"اربط مفتاح API واحدًا لاستخدام نماذج الذكاء الاصطناعي العالمية المفعّلة في حساب الـ API هذا.",
};

const TITLE:Record<LingxiLang,string>={
 zh:"连接我的智能服务",en:"Connect my intelligence service",ja:"インテリジェンスサービスを接続",ko:"지능형 서비스 연결",
 fr:"Connecter mon service d’IA",de:"Meinen KI-Dienst verbinden",es:"Conectar mi servicio de IA",pt:"Conectar meu serviço de IA",ar:"ربط خدمة الذكاء الخاصة بي",
};

const TOOL_TITLE:Record<LingxiLang,string>={
 zh:"连接工具",en:"Connect tools",ja:"ツールを接続",ko:"도구 연결",fr:"Connecter des outils",de:"Tools verbinden",es:"Conectar herramientas",pt:"Conectar ferramentas",ar:"ربط الأدوات",
};

export default function ConnectionCenter({lang,accountEmail}:Props){
 const t=(zh:string,en:string)=>sasiConnectionText(lang,zh,en);
 const services=useMemo(()=>PRIMARY_IDS.map(id=>SASI_INTEGRATIONS.find(x=>x.id===id)).filter(Boolean) as SasiIntegration[],[]);
 const[selected,setSelected]=useState<SasiIntegration>(services[0]);
 const[credential,setCredential]=useState("");
 const[connections,setConnections]=useState<Connection[]>([]);
 const[state,setState]=useState<"loading"|"ready"|"login"|"unavailable">("loading");
 const[busy,setBusy]=useState<"save"|"test"|"delete"|null>(null);
 const[message,setMessage]=useState("");
 const connection=connections.find(x=>x.service===selected.id);

 useEffect(()=>{
  if(!accountEmail){setState("login");return}
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
  return t("已连接","Connected");
 }

 async function save(){
  if(!credential.trim()||busy)return;
  setBusy("save");setMessage("");
  const r=await fetch("/api/sasi/connections",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:selected.id,apiKey:credential})});
  const b=await r.json().catch(()=>({}));
  if(r.ok){
   setConnections(xs=>[...xs.filter(x=>x.service!==selected.id),{service:selected.id,keyHint:b.keyHint,healthStatus:"stored",lastCheckedAt:null,lastErrorCode:null}]);
   setCredential("");setMessage(t("已连接。","Connected."));
  }else setMessage(t("暂时无法连接，请稍后再试。","Unable to connect right now. Please try again later."));
  setBusy(null);
 }

 async function test(){
  if(!connection||busy)return;
  setBusy("test");setMessage("");
  const r=await fetch("/api/sasi/connections/test",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:selected.id})});
  const b=await r.json().catch(()=>({}));
  setConnections(xs=>xs.map(x=>x.service===selected.id?{...x,healthStatus:b.healthStatus??(r.ok?"healthy":"unhealthy"),lastCheckedAt:new Date().toISOString(),lastErrorCode:b.errorCode??b.error??null}:x));
  setMessage(r.ok?t("连接正常，可以开始使用。","Connection is ready to use."):t("连接没有成功，请检查后重试。","The connection did not succeed. Please check and try again."));
  setBusy(null);
 }

 async function remove(){
  if(!connection||busy||!window.confirm(t("确定删除这个连接？","Remove this connection?")))return;
  setBusy("delete");setMessage("");
  const r=await fetch(`/api/sasi/connections?provider=${encodeURIComponent(selected.id)}`,{method:"DELETE"});
  if(r.ok){setConnections(xs=>xs.filter(x=>x.service!==selected.id));setMessage(t("已删除。","Removed."))}
  else setMessage(t("暂时无法删除，请稍后再试。","Unable to remove it right now. Please try again later."));
  setBusy(null);
 }

 return <section className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
  <header className="mb-8">
   <p className="text-xs font-semibold tracking-[.18em] text-[var(--lx-faint)]">SASI</p>
   <h1 className="mt-2 text-3xl font-semibold text-[var(--lx-ink)]">{TITLE[lang]}</h1>
   <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--lx-muted)]">{SHARED_COPY[lang]}</p>
  </header>

  <div className="space-y-3">
   {services.map(item=>{
    const active=selected.id===item.id;
    return <article key={item.id} className={["rounded-2xl border bg-[var(--lx-panel)] transition",active?"border-[var(--lx-line-strong)]":"border-[var(--lx-line)]"].join(" ")}>
     <button type="button" onClick={()=>{setSelected(item);setCredential("");setMessage("")}} className="flex w-full items-center gap-4 px-5 py-4 text-left">
      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[var(--lx-soft)]">
       <NextImage src={LOGOS[item.id]} alt="" width={32} height={32} unoptimized/>
      </span>
      <span className="min-w-0 flex-1">
       <b className="block text-[15px] text-[var(--lx-ink)]">{item.name}</b>
       <small className="mt-1 block leading-5 text-[var(--lx-muted)]">{SHARED_COPY[lang]}</small>
      </span>
      <span className="shrink-0 text-xs text-[var(--lx-faint)]">{status(item.id)}</span>
     </button>

     {active&&<div className="border-t border-[var(--lx-line)] px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
       <a href={selected.keyUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--lx-line)] px-3 py-2 text-xs">{t("打开服务","Open service")} ↗</a>
       {connection&&<span className="rounded-full bg-[var(--lx-soft)] px-3 py-2 text-xs text-[var(--lx-muted)]">{connection.keyHint}</span>}
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
       {state==="ready"&&!connection?<><input type="password" autoComplete="off" spellCheck={false} value={credential} onChange={e=>setCredential(e.target.value)}
        aria-label={t("连接凭证","Connection credential")} placeholder={t("粘贴 API Key","Paste API key")}
        className="min-w-0 flex-1 rounded-xl border border-[var(--lx-line)] bg-transparent px-4 py-3 text-sm outline-none"/>
        <button type="button" disabled={busy!==null||credential.trim().length<12} onClick={save} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">
         {busy==="save"?t("连接中…","Connecting…"):t("连接","Connect")}
        </button></>
       :connection?<div className="flex gap-2">
        <button type="button" disabled={busy!==null} onClick={test} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">{busy==="test"?t("检查中…","Checking…"):t("检查连接","Check connection")}</button>
        <button type="button" disabled={busy!==null} onClick={remove} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">{busy==="delete"?t("删除中…","Removing…"):t("删除连接","Remove")}</button>
       </div>
       :<p className="text-sm text-[var(--lx-muted)]">{state==="login"?t("请先登录。","Please sign in first."):state==="loading"?t("正在读取…","Loading…"):t("暂时无法连接，请稍后再试。","Unable to connect right now. Please try again later.")}</p>}
      </div>
      {message&&<p className="mt-3 text-xs text-[var(--lx-muted)]">{message}</p>}
     </div>}
    </article>
   })}
  </div>

  <section id="tools" className="mt-10 border-t border-[var(--lx-line)] pt-8">
   <h2 className="text-xl font-semibold text-[var(--lx-ink)]">{TOOL_TITLE[lang]}</h2>
   <div className="mt-4 grid gap-2 sm:grid-cols-2">
    {BUILD_CONNECTORS.map(item=><a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-[var(--lx-line)] px-4 py-3 text-sm hover:bg-[var(--lx-soft)]">
     <span><b>{item.name}</b><small className="ml-2 text-[var(--lx-muted)]">{lang==="zh"?item.roleZh:item.roleEn}</small></span><span aria-hidden>↗</span>
    </a>)}
   </div>
  </section>
 </section>;
}
