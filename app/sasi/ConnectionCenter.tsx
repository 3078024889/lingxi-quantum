"use client";

import NextImage from "next/image";
import {useEffect,useMemo,useState} from "react";
import {SASI_INTEGRATIONS,type SasiIntegration} from "@/lib/sasi/integration-catalog";
import type {LingxiLang} from "@/lib/lingxi-i18n";
import {sasiConnectionText} from "@/lib/sasi/connection-i18n";

type Props={lang:LingxiLang;dark:boolean;accountEmail:string|null};
type Connection={service:string;keyHint:string;healthStatus:"stored"|"checking"|"healthy"|"unhealthy";lastCheckedAt:string|null;lastErrorCode:string|null};

const PRIMARY_IDS=["volcengine","openrouter"] as const;
const LOGOS:Record<string,string>={
 volcengine:"https://www.google.com/s2/favicons?domain=volcengine.com&sz=128",
 openrouter:"https://www.google.com/s2/favicons?domain=openrouter.ai&sz=128",
};

const COPY:Record<string,{zh:string;en:string}>={
 volcengine:{
  zh:"连接一个 API Key，使用你账号下已开通的多智能生态模型",
  en:"Connect one API key and use the multi-model intelligence ecosystem enabled for your account.",
 },
 openrouter:{
  zh:"连接一个 API Key，使用你有权访问的多智能生态模型。",
  en:"Connect one API key and use the multi-model intelligence ecosystem available to your account.",
 },
};

export default function ConnectionCenter({lang,dark,accountEmail}:Props){
 const t=(zh:string,en:string)=>sasiConnectionText(lang,zh,en);
 const services=useMemo(()=>PRIMARY_IDS.map(id=>SASI_INTEGRATIONS.find(x=>x.id===id)).filter(Boolean) as SasiIntegration[],[]);
 const [selected,setSelected]=useState<SasiIntegration>(services[0]);
 const [credential,setCredential]=useState("");
 const [connections,setConnections]=useState<Connection[]>([]);
 const [state,setState]=useState<"loading"|"ready"|"login"|"unavailable">("loading");
 const [busy,setBusy]=useState<"save"|"test"|"delete"|null>(null);
 const [message,setMessage]=useState("");
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

 const selectedCopy=COPY[selected.id]??COPY.openrouter;

 return <section className={`sasi-connection-center ${dark?"is-dark":"is-light"}`}>
   <header className="sasi-connect-hero">
     <div>
       <p>SASI</p>
       <h1>{t("连接我的智能服务","Connect my intelligence service")}</h1>
       <strong>{t(
         "连接一次，SASI 会在短剧、网站、书本、学习和科研中自动选择适配的能力",
         "Connect once. SASI automatically selects the best available capability for drama, websites, books, learning and research."
       )}</strong>
     </div>
   </header>

   <div className="sasi-connect-main">
     <main>
       <div className="sasi-connect-service-grid">
         {services.map(item=><article key={item.id} className={selected.id===item.id?"selected":""}>
           <button type="button" className="sasi-connect-service-main" onClick={()=>{setSelected(item);setCredential("");setMessage("")}}>
             <span className="sasi-connect-service-logo" style={{background:item.color}}>
               <NextImage src={LOGOS[item.id]} alt="" width={48} height={48} unoptimized/>
             </span>
             <span className="sasi-connect-service-copy"><b>{item.name}</b><small>{item.product}</small></span>
             <em>{status(item.id)}</em>
           </button>
           <p>{lang==="zh"?COPY[item.id].zh:COPY[item.id].en}</p>
         </article>)}
       </div>
     </main>

     <aside className="sasi-connect-setup">
       <header>
         <span className="sasi-connect-service-logo" style={{background:selected.color}}>
           <NextImage src={LOGOS[selected.id]} alt="" width={48} height={48} unoptimized/>
         </span>
         <div><h2>{selected.name}</h2><p>{lang==="zh"?selectedCopy.zh:selectedCopy.en}</p></div>
       </header>
       <div className="sasi-connect-official"><a href={selected.keyUrl} target="_blank" rel="noreferrer">{t("打开服务","Open service")} ↗</a></div>
       <div className="sasi-connect-vault">
         {connection&&<div><h3>{t("已连接","Connected")}</h3><span>{connection.keyHint}</span></div>}
         {state==="ready"&&!connection?<><input type="password" autoComplete="off" spellCheck={false} value={credential} onChange={e=>setCredential(e.target.value)} aria-label={t("连接凭证","Connection credential")} placeholder={t("粘贴 API Key","Paste API key")}/><button type="button" disabled={busy!==null||credential.trim().length<12} onClick={save}>{busy==="save"?t("连接中…","Connecting…"):t("连接","Connect")}</button></>
         :connection?<div className="sasi-connect-actions"><button type="button" disabled={busy!==null} onClick={test}>{busy==="test"?t("检查中…","Checking…"):t("检查连接","Check connection")}</button><button type="button" disabled={busy!==null} onClick={remove}>{busy==="delete"?t("删除中…","Removing…"):t("删除连接","Remove")}</button></div>
         :<p>{state==="login"?t("请先登录。","Please sign in first."):state==="loading"?t("正在读取…","Loading…"):t("暂时无法连接，请稍后再试。","Unable to connect right now. Please try again later.")}</p>}
         {message&&<p className="sasi-connect-message">{message}</p>}
       </div>
     </aside>
   </div>
 </section>;
}
