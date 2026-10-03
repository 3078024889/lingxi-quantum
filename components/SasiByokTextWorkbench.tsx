"use client";
import {byokError,taskLabel} from "@/lib/sasi/byok-copy";
import {useRef,useState} from "react";
import Link from "next/link";
import SasiFunctionMenu,{SasiSelectedFunctions} from "./SasiFunctionMenu";
import DOMPurify from "dompurify";
type Mode="chat"|"director"|"book"|"website";
type Task={id:string;state:string;estimated_fen:number;expires_at:string;output?:{answer?:string;directorPlan?:unknown;website?:{title:string;html:string}}};
export default function SasiByokTextWorkbench({mode="chat",question:provided,evidence=[]}:{mode?:Mode;question?:string;evidence?:{title:string;locator?:string;text:string}[]}){
 const [question,setQuestion]=useState("");const [task,setTask]=useState<Task|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const lock=useRef(false);
 const [selectedFunctions,setSelectedFunctions]=useState<string[]>([]);
 const changeFunctions=(ids:string[])=>{setSelectedFunctions(ids);setTask(null)};
 const input=provided??question;
 async function run(action:"quote"|"confirm"){
  if(lock.current)return;lock.current=true;setBusy(true);setError("");try{
   const r=await fetch("/api/sasi/byok/text",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(action==="quote"?{action,mode,question:input,evidence,functions:selectedFunctions}:{action,taskId:task?.id,acceptSupplierBilling:true})});const d=await r.json();
   if(!r.ok)throw new Error(d.error==="PRICE_REVIEW_REQUIRED"?"文本回答服务暂未开放，当前不会产生费用。":d.error==="CONNECTION_REQUIRED"?"请先连接你的生成服务。":byokError(d.error));setTask(action==="confirm"?{...task!,...d.task}:d.task);
  }catch(e){setError(e instanceof Error?e.message:"请求失败");}finally{lock.current=false;setBusy(false);}
 }
 function safeHtml(raw:string){return DOMPurify.sanitize(raw,{WHOLE_DOCUMENT:true,FORBID_TAGS:["script","iframe","object","embed","form","input","button","link","base","meta"],FORBID_ATTR:["src","srcset","action","formaction"]});}
 const website=task?.output?.website;
 const html=website?safeHtml(website.html):"";
 async function download(){const {default:JSZip}=await import("jszip");const zip=new JSZip();zip.file("index.html",`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'">${html}`);zip.file("README.txt","SASI 静态网站交付\n本包不包含后端、登录、收款或数据库。打开 index.html 检查文案和布局。可上传到你自己的静态托管服务。发布前检查所有链接与内容。\n");const blob=await zip.generateAsync({type:"blob"});save(blob,"sasi-website.zip");}
 function save(blob:Blob,name:string){const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
 return <section className="my-6 space-y-4 rounded-2xl border p-5">
  <h2 className="text-xl font-semibold">{{chat:"有想法，尽管说",director:"把故事变成可执行分镜",book:"带着问题，与这本书对话",website:"描述需求，生成可下载的网站"}[mode]}</h2>
  <p>写下你想完成的事。{mode==="book"?"仅发送当前问题和选中的原文片段。":mode==="website"?"生成适合展示作品、品牌或活动的网站，预览满意后下载。":""}</p>
  <div className="flex flex-wrap items-center gap-2"><SasiFunctionMenu task={mode} selected={selectedFunctions} onChange={changeFunctions} disabled={busy}/><SasiSelectedFunctions task={mode} selected={selectedFunctions} onChange={changeFunctions} disabled={busy}/><Link href="/sasi/connections" className="ml-auto text-sm underline">连接我的智能服务</Link></div>
  {provided===undefined&&<textarea aria-label="创作需求" disabled={busy} className="w-full rounded-xl border bg-transparent p-3" rows={6} maxLength={12000} value={question} onChange={e=>{setQuestion(e.target.value);setTask(null);}}/>}
  <button className="rounded-xl border px-4 py-2 disabled:opacity-40" disabled={busy||!input.trim()||(mode==="book"&&!evidence.length)} onClick={()=>void run("quote")}>准备生成</button>
  {task?.state==="quoted"&&<div><p>{task.estimated_fen>0?`本次预估 ¥${(task.estimated_fen/100).toFixed(2)}。`:"已经准备好，可以继续。"} 这次将按你刚才提交的内容生成。</p><button disabled={busy||Date.parse(task.expires_at)<=Date.now()} className="my-2 rounded-xl border px-4 py-2" onClick={()=>void run("confirm")}>确认并生成</button></div>}
  {busy&&<p role="status">正在处理，请保持页面打开…</p>}{error&&<p role="alert">{error}</p>}
  {task&&!["quoted","succeeded"].includes(task.state)&&<p>{taskLabel(task.state)}。结果不确定时不会自动重试，请先查看对应 AI 服务的使用记录。</p>}
  {task?.output?.answer&&<p className="whitespace-pre-wrap">{website?"网站已生成，看看是否符合你的想法。":task.output.answer}</p>}
  {task?.output?.directorPlan!==undefined&&<><button className="rounded-xl border p-3" onClick={()=>save(new Blob([JSON.stringify(task.output!.directorPlan,null,2)],{type:"application/json"}),"sasi-storyboard.json")}>下载分镜文件</button><Link href="/sasi/drama" className="ml-3 underline">导入分镜并生成视频 →</Link></>}
  {website&&<><p className="text-sm">这是展示型网站，不含登录、收款或资料保存功能；下载后可发布到你的网站空间。</p><iframe title="网站预览" sandbox="" referrerPolicy="no-referrer" className="h-[600px] w-full rounded-xl border bg-white" srcDoc={`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'">${html}`}/><button className="rounded-xl border p-3" onClick={()=>void download()}>下载网站文件</button></>}
 </section>;
}
