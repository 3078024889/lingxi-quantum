"use client";
import { useEffect,useRef,useState } from "react";
import PaidActionButton from "@/components/tools/PaidActionButton";

const LANGS=[["en","英语"],["zh","中文"],["ja","日语"],["ko","韩语"],["es","西班牙语"],["pt","葡萄牙语"],["fr","法语"],["de","德语"],["it","意大利语"],["id","印尼语"],["vi","越南语"],["th","泰语"],["hi","印地语"],["ar","阿拉伯语"]];

function probeMedia(src:string,timeoutMs=15000){
 return new Promise<number>((resolve,reject)=>{
  const el=document.createElement("video"),timer=setTimeout(()=>{cleanup();reject(new Error("无法读取媒体时长，请改为上传文件。"))},timeoutMs);
  const cleanup=()=>{clearTimeout(timer);el.removeAttribute("src");el.load()};
  el.preload="metadata";
  el.onloadedmetadata=()=>{const d=el.duration;cleanup();Number.isFinite(d)&&d>0?resolve(d):reject(new Error("无法读取媒体时长"))};
  el.onerror=()=>{cleanup();reject(new Error("这个链接不是浏览器可直接读取的媒体地址。请上传文件，或换成可公开访问的视频/音频直链。"))};
  el.src=src;
 });
}
export default function VideoDubbingWorkbench(){
 const [file,setFile]=useState<File|null>(null),[url,setUrl]=useState(""),[target,setTarget]=useState("en"),[duration,setDuration]=useState(0),[probeBusy,setProbeBusy]=useState(false),[busy,setBusy]=useState(false),[quoteId,setQuoteId]=useState(""),[projectId,setProjectId]=useState(""),[languageId,setLanguageId]=useState(""),[status,setStatus]=useState(""),[output,setOutput]=useState(""),[error,setError]=useState(""),[topupRequired,setTopupRequired]=useState(0),[topupQuoteId,setTopupQuoteId]=useState("");
 const obj=useRef("");
 const minutes=duration>0?Math.max(1,Math.ceil(duration/60)):0;

 async function setAndProbeFile(f:File|null){
  if(obj.current){URL.revokeObjectURL(obj.current);obj.current=""}
  setFile(f);setUrl("");setDuration(0);setProjectId("");setOutput("");setError("");
  if(!f)return;
  obj.current=URL.createObjectURL(f);
  try{setDuration(await probeMedia(obj.current))}catch(e){setError(e instanceof Error?e.message:String(e))}
 }
 useEffect(()=>()=>{if(obj.current)URL.revokeObjectURL(obj.current)},[]);

 async function probeUrl(){
  if(!url.trim())return;setProbeBusy(true);setError("");setDuration(0);
  try{const u=new URL(url.trim());if(u.protocol!=="https:")throw new Error("链接必须使用 HTTPS。");setDuration(await probeMedia(u.toString()))}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setProbeBusy(false)}
 }

 async function start(paidQuoteId:string){
  if((!file&&!url.trim())||!minutes)return;setBusy(true);setError("");setOutput("");setStatus("正在创建翻译项目…");setQuoteId(paidQuoteId);
  try{
   const form=new FormData();form.set("target_language",target);form.set("quote_id",paidQuoteId);form.set("item_key","dub-0");form.set("paid_minutes",String(minutes));
   if(file)form.set("file",file,file.name);else form.set("source_url",url.trim());
   const res=await fetch("/api/ai/dub/create",{method:"POST",body:form});const data=await res.json();
   if(!res.ok)throw new Error(data.error==="ELEVENLABS_NOT_CONFIGURED"?"视频配音服务暂不可用，请稍后再试。":(data.detail||data.error||"创建失败"));
   setProjectId(data.project_id||"");setLanguageId(data.language_id||"");setStatus(data.status||"queued");
  }catch(e){setError(e instanceof Error?e.message:String(e));setStatus("")}finally{setBusy(false)}
 }

 useEffect(()=>{
  if(!projectId||!quoteId)return;
  const timer=setInterval(async()=>{
   try{
    if(languageId){
     const r=await fetch(`/api/ai/dub/language-status?project_id=${encodeURIComponent(projectId)}&language_id=${encodeURIComponent(languageId)}&quote_id=${encodeURIComponent(quoteId)}`,{cache:"no-store"});const d=await r.json();
     if(r.ok){setStatus(d.status||"");const candidate=d.outputs?.video||d.outputs?.dubbed_video||d.outputs?.lossless_audio||Object.values(d.outputs||{})[0];if(typeof candidate==="string")setOutput(candidate)}
    }else{
     const r=await fetch(`/api/ai/dub/status?project_id=${encodeURIComponent(projectId)}&quote_id=${encodeURIComponent(quoteId)}`,{cache:"no-store"});const d=await r.json();
     if(r.ok){setStatus(d.status||"");if(d.language_id)setLanguageId(d.language_id);if(d.error==="TOPUP_REQUIRED"){setTopupRequired(Number(d.required_minutes)||0);setError(`检测到实际时长需要按 ${d.required_minutes} 分钟计费，需要补足差额。`)}else{setTopupRequired(0)}}
    }
   }catch{}
  },5000);return()=>clearInterval(timer)
 },[projectId,languageId,quoteId]);

 return <div className="space-y-5">
  <div className="grid gap-4 md:grid-cols-2">
   <label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();setAndProbeFile(e.dataTransfer.files?.[0]||null)}} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><input type="file" accept="video/*,audio/*" className="hidden" disabled={busy} onChange={e=>setAndProbeFile(e.target.files?.[0]||null)}/><div className="font-medium">上传视频 / 音频</div><div className="mt-1 text-sm text-slate-500">{file?file.name:"点击选择文件"}</div></label>
   <div className="rounded-2xl border border-slate-200 p-4"><label className="text-sm font-medium text-slate-700">或粘贴可直接读取的公开视频/音频链接</label><input value={url} disabled={busy} onChange={e=>{setUrl(e.target.value);setFile(null);setDuration(0)}} placeholder="https://...mp4" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-400"/><button onClick={probeUrl} disabled={!url.trim()||probeBusy} className="mt-3 rounded-full border border-slate-200 px-4 py-2 text-sm">{probeBusy?"检测中…":"检测时长"}</button><p className="mt-2 text-xs leading-5 text-slate-500">网页地址若无法读取时长，请改为上传文件。不会接来源不明的“万能下载”接口。</p></div>
  </div>
  {duration>0&&<div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">检测时长：{Math.floor(duration/60)}分 {Math.round(duration%60)}秒 · 本次按 <b>{minutes} 分钟</b>计费</div>}
  <div className="flex flex-wrap items-end gap-3"><label className="text-sm text-slate-600">翻译成<select value={target} onChange={e=>setTarget(e.target.value)} disabled={busy} className="ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2">{LANGS.map(([v,n])=><option value={v} key={v}>{n}</option>)}</select></label></div>
  {busy?<button disabled className="rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white opacity-50">正在创建项目…</button>:minutes>0?<PaidActionButton toolId="video-dubbing" quantity={minutes} metadata={{detectedDurationSeconds:Math.round(duration),targetLanguage:target}} onPaid={start} label="查看本次价格"/>:null}
  <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">按源媒体时长和目标语言计费。确认本次价格并付款后开始处理。</div>
  {status&&<div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">当前状态：<strong>{status}</strong></div>}
  {output&&<a href={output} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white">打开生成结果</a>}
  {topupRequired>0&&quoteId&&<div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="text-sm font-medium text-amber-900">实际时长比预估更长，需要补到 {topupRequired} 分钟。</div><button onClick={async()=>{setBusy(true);try{const r=await fetch("/api/tools/quote/topup",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({parentQuoteId:quoteId,requiredQuantity:topupRequired})});const d=await r.json();if(!r.ok)throw new Error(d.error||"创建补差价报价失败");if(d.alreadyEnough){setTopupRequired(0);setError("");return;}setTopupQuoteId(d.id);window.open(`/tools/pay?quoteId=${encodeURIComponent(d.id)}`,"lingxi_tool_topup","width=720,height=820");setError(`补差价 ¥${d.amount_rmb}，付款后系统会自动继续。`);const t=setInterval(async()=>{const s=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(d.id)}`,{cache:"no-store"});if(s.ok){const j=await s.json();if(j.paid){clearInterval(t);setTopupRequired(0);setError("");}}},2200);}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}} className="mt-3 rounded-full bg-amber-600 px-4 py-2 text-sm text-white">补差价并继续</button>{topupQuoteId&&<div className="mt-2 text-xs text-amber-800">补差价报价：{topupQuoteId}</div>}</div>}
  {error&&<p className="text-sm text-rose-600">{error}</p>}
 </div>;
}
