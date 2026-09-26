"use client";
import {useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {localIdPhoto} from "@/lib/tools/autonomous/image-local";
import {saveBlob} from "@/lib/tools/autonomous/download-local";

export default function IdPhotoAiWorkbench(){
 const[files,setFiles]=useState<File[]>([]),[bg,setBg]=useState("white"),[busy,setBusy]=useState(false),[results,setResults]=useState<Array<{name:string;blob:Blob;url:string}>>([]),[error,setError]=useState("");
 async function run(){setBusy(true);setError("");for(const r of results)URL.revokeObjectURL(r.url);setResults([]);try{
  const out=[] as Array<{name:string;blob:Blob;url:string}>;
  for(const f of files){const blob=await localIdPhoto(f,bg);out.push({name:f.name,blob,url:URL.createObjectURL(blob)})}
  setResults(out);
 }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 return <div className="space-y-4">
  <FileDropzone accept="image/*" multiple maxFiles={20} maxSizeMB={12} files={files} onChange={setFiles} disabled={busy} kind="image"/>
  <div className="flex flex-wrap gap-2">{[["white","白底"],["light blue","蓝底"],["red","红底"],["light gray","灰底"]].map(([v,n])=><button type="button" key={v} onClick={()=>setBg(v)} className={`rounded-full px-4 py-2 text-sm ${bg===v?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border border-[var(--lx-line)]"}`}>{n}</button>)}</div>
  {files.length>0&&!busy&&<PaidActionButton toolId="id-photo-ai" quantity={files.length} metadata={{images:files.length,mode:"local"}} onPaid={run} label="查看本次价格"/>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">正在处理照片…</p>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]">默认在你的浏览器中完成背景识别与换色，不需要连接外部模型。正式提交证件前，请核对对应机构的尺寸和头部比例要求。</p>
  {error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
  {results.length>0&&<div className="grid gap-4 sm:grid-cols-2">{results.map((r,i)=><div key={r.name+i} className="rounded-2xl border border-[var(--lx-line)] p-3"><img src={r.url} alt="证件照结果" className="w-full rounded-xl"/><button type="button" onClick={()=>saveBlob(r.blob,`lingxifield-id-${r.name.replace(/\.[^.]+$/,".png")}`)} className="mt-3 rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">保存结果</button></div>)}</div>}
 </div>
}
