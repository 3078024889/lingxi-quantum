"use client";
import {useRef,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import RemoteMediaImporter from "@/components/tools/RemoteMediaImporter";
import ResultPanel from "@/components/tools/ResultPanel";
import type {ToolResultFile} from "@/lib/tools/types";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolUiText} from "@/lib/tool-ui-i18n";
import {workbenchCopy} from "@/lib/tools/workbench-i18n-v1473";
import {safeFilename} from "@/lib/tools/shared/download";

export default function VideoToolkitWorkbench(){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolUiText(lang,zh,en);
 const[files,setFiles]=useState<File[]>([]),[mode,setMode]=useState<"compress"|"audio"|"trim">("compress"),[start,setStart]=useState(0),[duration,setDuration]=useState(30),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[outputs,setOutputs]=useState<ToolResultFile[]>([]);
 const ff=useRef<any>(null);

 async function run(){
  if(!files.length)return;
  setBusy(true);setError("");setStage(workbenchCopy(lang,"preparingMedia"));setOutputs([]);
  try{
   const [{FFmpeg},{fetchFile,toBlobURL}]=await Promise.all([import("@ffmpeg/ffmpeg"),import("@ffmpeg/util")]);
   const out:ToolResultFile[]=[];
   for(let i=0;i<files.length;i++){
    const file=files[i],f=new FFmpeg();ff.current=f;
    f.on("progress",({progress}:{progress:number})=>setStage(`${i+1}/${files.length} · ${Math.max(0,Math.min(100,Math.round(progress*100)))}%`));
    await f.load({coreURL:await toBlobURL("/media/ffmpeg-0.12.10/ffmpeg-core.js","text/javascript"),wasmURL:await toBlobURL("/media/ffmpeg-0.12.10/ffmpeg-core.wasm","application/wasm")});
    const ext=file.name.split(".").pop()||"mp4",input=`input-${i}.${ext}`;
    await f.writeFile(input,await fetchFile(file));
    const stem=safeFilename(file.name.replace(/\.[^.]+$/,""),`video-${i+1}`);
    let name=`${stem}-processed.mp4`,output=`output-${i}.mp4`,args:string[]=[];
    if(mode==="compress")args=["-i",input,"-c:v","libx264","-preset","veryfast","-crf","28","-c:a","aac","-b:a","128k",output];
    if(mode==="audio"){output=`output-${i}.mp3`;name=`${stem}.mp3`;args=["-i",input,"-vn","-c:a","libmp3lame","-b:a","192k",output]}
    if(mode==="trim"){name=`${stem}-trimmed.mp4`;args=["-ss",String(Math.max(0,start)),"-i",input,"-t",String(Math.max(1,duration)),"-c:v","libx264","-preset","veryfast","-c:a","aac",output]}
    const code=await f.exec(args);
    if(code!==0)throw new Error(`FFmpeg exited with code ${code}`);
    const data=await f.readFile(output),bytes=data instanceof Uint8Array?data:new TextEncoder().encode(String(data)),copy=new Uint8Array(bytes.length);copy.set(bytes);
    const mime=mode==="audio"?"audio/mpeg":"video/mp4";
    const blob=new Blob([copy.buffer],{type:mime});
    out.push({name,blob,mime,size:blob.size});
    try{await f.deleteFile(input);await f.deleteFile(output)}catch{}
    f.terminate();ff.current=null;
   }
   setOutputs(out);setStage(t("全部处理完成","All files processed"));
  }catch(e){
   try{ff.current?.terminate()}catch{}
   ff.current=null;setStage("");setError(e instanceof Error?e.message:String(e));
  }finally{setBusy(false)}
 }

 function cancel(){try{ff.current?.terminate()}catch{}ff.current=null;setBusy(false);setStage(t("已取消当前处理","Current processing cancelled"))}
 async function addRemote(file:File){setFiles(v=>[...v,file].slice(0,10))}
 const modes=[["compress",t("批量压缩视频","Batch compress")],["audio",t("批量提取 MP3","Batch extract MP3")],["trim",t("批量截取同一时间段","Batch trim same segment")]] as const;

 return <div className="space-y-4">
  <FileDropzone accept="video/*,audio/*" multiple maxFiles={10} maxSizeMB={500} files={files} onChange={f=>{setFiles(f);setOutputs([]);setError("")}} disabled={busy} kind="media"/>
  <RemoteMediaImporter acceptKind="video" onImported={addRemote} disabled={busy}/>
  <div className="flex flex-wrap gap-2">{modes.map(([v,n])=><button key={v} onClick={()=>setMode(v)} className={`rounded-full border px-4 py-2 text-sm ${mode===v?"border-[var(--lx-line-strong)] bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border-[var(--lx-line)] bg-[var(--lx-panel)] text-[var(--lx-muted)]"}`}>{n}</button>)}</div>
  {mode==="trim"&&<div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm text-[var(--lx-muted)]">{t("开始秒数","Start second")}<input type="number" min={0} value={start} onChange={e=>setStart(Math.max(0,Number(e.target.value)||0))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/></label>
   <label className="text-sm text-[var(--lx-muted)]">{t("截取时长（秒）","Duration (seconds)")}<input type="number" min={1} value={duration} onChange={e=>setDuration(Math.max(1,Number(e.target.value)||1))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/></label>
  </div>}
  <div className="flex gap-3">
   <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?t("处理中…","Working…"):t("开始批量处理","Start batch")}</button>
   {busy&&<button onClick={cancel} className="rounded-xl border border-[var(--lx-danger)] px-5 py-2.5 text-sm text-[var(--lx-danger)]">{t("取消","Cancel")}</button>}
  </div>
  {stage&&<p className="text-sm text-[var(--lx-faint)]">{stage}</p>}
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-danger)]">{t("这次没有处理完成。","This run did not finish.")} {error}</p>}
  {outputs.length>0&&<ResultPanel files={outputs} messageZh="视频处理已完成，可以保存结果。" messageEn="Video processing is complete. Save the result below."/>}
 </div>;
}
