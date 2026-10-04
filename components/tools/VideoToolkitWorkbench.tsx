"use client";
import {plainText,plainMessage} from "@/lib/tools/plain-copy";
import {useRef,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import RemoteMediaImporter from "@/components/tools/RemoteMediaImporter";
import ResultPanel from "@/components/tools/ResultPanel";
import type {ToolResultFile} from "@/lib/tools/types";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolUiText} from "@/lib/tool-ui-i18n";
import {workbenchCopy} from "@/lib/tools/workbench-i18n-v1473";
import {safeFilename} from "@/lib/tools/shared/download";

type Mode="compress"|"audio"|"trim"|"mute"|"convert"|"rotate"|"speed";
type CompressPreset="high"|"balanced"|"small";
type Resolution="source"|"1080"|"720"|"480";
const CRF:Record<CompressPreset,number>={high:23,balanced:28,small:33};
const SCALE:Record<Exclude<Resolution,"source">,string>={"1080":"-2:1080","720":"-2:720","480":"-2:480"};

export default function VideoToolkitWorkbench(){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolUiText(lang,zh,en);
 const[files,setFiles]=useState<File[]>([]),[mode,setMode]=useState<Mode>("compress"),[start,setStart]=useState(0),[duration,setDuration]=useState(30),[preset,setPreset]=useState<CompressPreset>("balanced"),[resolution,setResolution]=useState<Resolution>("source"),[fps,setFps]=useState(0),[rotation,setRotation]=useState<"90"|"180"|"270">("90"),[speed,setSpeed]=useState(1),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[outputs,setOutputs]=useState<ToolResultFile[]>([]);
 const ff=useRef<any>(null);

 function videoFilters(extra:string[]=[]){
  const filters=[...extra];
  if(resolution!=="source")filters.push(`scale=${SCALE[resolution]}`);
  if(fps>0)filters.push(`fps=${Math.max(1,Math.min(120,fps))}`);
  return filters;
 }
 async function run(){
  if(!files.length)return;setBusy(true);setError("");setStage(workbenchCopy(lang,"preparingMedia"));setOutputs([]);
  try{
   const [{FFmpeg},{fetchFile,toBlobURL}]=await Promise.all([import("@ffmpeg/ffmpeg"),import("@ffmpeg/util")]);
   const out:ToolResultFile[]=[];
   for(let i=0;i<files.length;i++){
    const file=files[i],f=new FFmpeg();ff.current=f;
    f.on("progress",({progress}:{progress:number})=>setStage(`${i+1}/${files.length} · ${Math.max(0,Math.min(100,Math.round(progress*100)))}%`));
    await f.load({coreURL:await toBlobURL("/media/ffmpeg-0.12.10/ffmpeg-core.js","text/javascript"),wasmURL:await toBlobURL("/media/ffmpeg-0.12.10/ffmpeg-core.wasm","application/wasm")});
    const ext=file.name.split(".").pop()||"mp4",input=`input-${i}.${ext}`;await f.writeFile(input,await fetchFile(file));
    const stem=safeFilename(file.name.replace(/\.[^.]+$/,""),`video-${i+1}`),output=`output-${i}.mp4`;let name=`${stem}-processed.mp4`,args:string[]=[];
    if(mode==="audio"){const o=`output-${i}.mp3`;name=`${stem}.mp3`;args=["-i",input,"-vn","-c:a","libmp3lame","-b:a","192k",o];const code=await f.exec(args);if(code!==0)throw new Error(`FFmpeg exited with code ${code}`);const data=await f.readFile(o),bytes=data instanceof Uint8Array?data:new TextEncoder().encode(String(data)),copy=new Uint8Array(bytes.length);copy.set(bytes);out.push({name,blob:new Blob([copy.buffer],{type:"audio/mpeg"}),mime:"audio/mpeg",size:copy.byteLength});try{await f.deleteFile(input);await f.deleteFile(o)}catch{}f.terminate();ff.current=null;continue}
    const base=["-i",input];
    if(mode==="compress"){
      const filters=videoFilters();args=[...base,...(filters.length?["-vf",filters.join(",")]:[]),"-c:v","libx264","-preset","veryfast","-crf",String(CRF[preset]),"-c:a","aac","-b:a",preset==="small"?"96k":"128k",output];name=`${stem}-compressed.mp4`;
    }
    if(mode==="trim"){
      const filters=videoFilters();args=["-ss",String(Math.max(0,start)),"-i",input,"-t",String(Math.max(1,duration)),...(filters.length?["-vf",filters.join(",")]:[]),"-c:v","libx264","-preset","veryfast","-c:a","aac",output];name=`${stem}-trimmed.mp4`;
    }
    if(mode==="mute"){
      const filters=videoFilters();args=[...base,...(filters.length?["-vf",filters.join(",")]:[]),"-an","-c:v","libx264","-preset","veryfast",output];name=`${stem}-muted.mp4`;
    }
    if(mode==="convert"){
      const filters=videoFilters();args=[...base,...(filters.length?["-vf",filters.join(",")]:[]),"-c:v","libx264","-preset","veryfast","-crf","24","-c:a","aac","-movflags","+faststart",output];name=`${stem}.mp4`;
    }
    if(mode==="rotate"){
      const rot=rotation==="90"?"transpose=1":rotation==="270"?"transpose=2":"hflip,vflip";const filters=videoFilters([rot]);args=[...base,"-vf",filters.join(","),"-c:v","libx264","-preset","veryfast","-c:a","copy",output];name=`${stem}-rotate-${rotation}.mp4`;
    }
    if(mode==="speed"){
      const s=Math.max(.5,Math.min(2,speed)),filters=videoFilters([`setpts=${(1/s).toFixed(4)}*PTS`]),atempo=s.toFixed(3);args=[...base,"-vf",filters.join(","),"-filter:a",`atempo=${atempo}`,"-c:v","libx264","-preset","veryfast","-c:a","aac",output];name=`${stem}-${s}x.mp4`;
    }
    const code=await f.exec(args);if(code!==0)throw new Error(`FFmpeg exited with code ${code}`);
    const data=await f.readFile(output),bytes=data instanceof Uint8Array?data:new TextEncoder().encode(String(data)),copy=new Uint8Array(bytes.length);copy.set(bytes);const blob=new Blob([copy.buffer],{type:"video/mp4"});out.push({name,blob,mime:"video/mp4",size:blob.size});
    try{await f.deleteFile(input);await f.deleteFile(output)}catch{}f.terminate();ff.current=null;
   }
   setOutputs(out);setStage(plainText(lang,"ready"));
  }catch(e){try{ff.current?.terminate()}catch{}ff.current=null;setStage("");setError(plainText(lang,"fileError"))}finally{setBusy(false)}
 }
 function cancel(){try{ff.current?.terminate()}catch{}ff.current=null;setBusy(false);setStage(t("已取消处理","Cancelled"))}
 async function addRemote(file:File){setFiles(v=>[...v,file].slice(0,10))}
 const modes:[Mode,string][]=[["compress",t("压缩","Compress")],["trim",t("截取","Trim")],["audio",t("提取 MP3","Extract MP3")],["mute",t("静音","Mute")],["convert",t("转 MP4","Convert MP4")],["rotate",t("旋转","Rotate")],["speed",t("变速","Speed")]];
 return <div className="space-y-4">
  <FileDropzone accept="video/*,audio/*" multiple maxFiles={10} maxSizeMB={500} files={files} onChange={f=>{setFiles(f);setOutputs([]);setError("")}} disabled={busy} kind="media"/>
  <RemoteMediaImporter acceptKind="video" onImported={addRemote} disabled={busy}/>
  <div className="flex flex-wrap gap-2">{modes.map(([v,n])=><button key={v} onClick={()=>setMode(v)} className={`rounded-full border px-4 py-2 text-sm ${mode===v?"border-[var(--lx-line-strong)] bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border-[var(--lx-line)] bg-[var(--lx-panel)] text-[var(--lx-muted)]"}`}>{n}</button>)}</div>
  {mode==="compress"&&<label className="block text-sm text-[var(--lx-muted)]">{t("压缩强度","Compression")}<select value={preset} onChange={e=>setPreset(e.target.value as CompressPreset)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2"><option value="high">{t("高清","High quality")}</option><option value="balanced">{t("均衡","Balanced")}</option><option value="small">{t("更小体积","Smaller file")}</option></select></label>}
  {mode==="trim"&&<div className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-[var(--lx-muted)]">{t("开始秒数","Start second")}<input type="number" min={0} value={start} onChange={e=>setStart(Math.max(0,Number(e.target.value)||0))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2"/></label><label className="text-sm text-[var(--lx-muted)]">{t("截取时长（秒）","Duration")}<input type="number" min={1} value={duration} onChange={e=>setDuration(Math.max(1,Number(e.target.value)||1))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2"/></label></div>}
  {mode==="rotate"&&<label className="block text-sm text-[var(--lx-muted)]">{t("旋转角度","Rotation")}<select value={rotation} onChange={e=>setRotation(e.target.value as any)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2"><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></label>}
  {mode==="speed"&&<label className="block text-sm text-[var(--lx-muted)]">{t("播放速度","Playback speed")} {speed.toFixed(2)}×<input className="mt-2 w-full" type="range" min={.5} max={2} step={.05} value={speed} onChange={e=>setSpeed(Number(e.target.value))}/></label>}
  {mode!=="audio"&&<div className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-[var(--lx-muted)]">{t("输出分辨率","Output resolution")}<select value={resolution} onChange={e=>setResolution(e.target.value as Resolution)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2"><option value="source">{t("保持原尺寸","Keep source")}</option><option value="1080">1080p</option><option value="720">720p</option><option value="480">480p</option></select></label><label className="text-sm text-[var(--lx-muted)]">{t("输出帧率（0=保持原帧率）","FPS (0 = keep source)")}<input type="number" min={0} max={120} value={fps} onChange={e=>setFps(Math.max(0,Math.min(120,Number(e.target.value)||0)))} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2"/></label></div>}
  <div className="flex gap-3"><button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?plainText(lang,"working"):t("开始处理","Start processing")}</button>{busy&&<button onClick={cancel} className="rounded-xl border border-[var(--lx-danger)] px-5 py-2.5 text-sm text-[var(--lx-danger)]">{t("取消","Cancel")}</button>}</div>
  {stage&&<p className="text-sm text-[var(--lx-faint)]">{stage}</p>}{error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] p-4 text-sm text-[var(--lx-danger)]">{plainMessage(lang,error)}</p>}{outputs.length>0&&<ResultPanel files={outputs} messageZh={plainText(lang,"ready")} messageEn={plainText(lang,"ready")}/>}
 </div>
}
