"use client";
import {useEffect,useRef,useState} from "react";
import type {FFmpeg} from "@ffmpeg/ffmpeg";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {assemblerText} from "@/lib/sasi/assembler-i18n";

export default function VideoAssembler(){
 const{lang}=useLingxiLang();const t=(k:Parameters<typeof assemblerText>[1],v?:Record<string,string|number>)=>assemblerText(lang,k,v);
 const[files,setFiles]=useState<File[]>([]),[ratio,setRatio]=useState("9:16"),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[output,setOutput]=useState("");
 const engine=useRef<FFmpeg|null>(null),active=useRef(false),cancel=useRef(false);
 useEffect(()=>()=>{cancel.current=true;engine.current?.terminate()},[]);
 useEffect(()=>()=>{if(output)URL.revokeObjectURL(output)},[output]);
 function choose(input:FileList|null){
  const selected=Array.from(input??[]);
  if(selected.some(file=>!/\.(mp4|mov|webm)$/i.test(file.name))||selected.length>24||selected.reduce((n,f)=>n+f.size,0)>150*1024*1024){setMessage(t("invalidFiles"));return}
  setFiles(selected);setOutput("");setMessage("");
 }
 function move(index:number,step:number){setFiles(previous=>{const next=[...previous];[next[index],next[index+step]]=[next[index+step],next[index]];return next});setOutput("")}
 async function assemble(){
  if(active.current||files.length<2)return;active.current=true;cancel.current=false;setBusy(true);setOutput("");
  try{
   setMessage(t("loading"));
   const{FFmpeg}=await import("@ffmpeg/ffmpeg");if(cancel.current)throw new Error("CANCELLED");
   const ffmpeg=new FFmpeg();engine.current=ffmpeg;let lastMediaLog="";
   ffmpeg.on("log",({message})=>{lastMediaLog=message});
   await ffmpeg.load({coreURL:"/media/ffmpeg-0.12.10/ffmpeg-core.js",wasmURL:"/media/ffmpeg-0.12.10/ffmpeg-core.wasm"});
   const[width,height]=ratio==="9:16"?[720,1280]:ratio==="1:1"?[720,720]:[1280,720];let totalDuration=0;
   for(let i=0;i<files.length;i++){
    if(cancel.current)throw new Error("CANCELLED");setMessage(t("processing",{i:i+1,n:files.length}));
    const source=`source-${i}`;await ffmpeg.writeFile(source,new Uint8Array(await files[i].arrayBuffer()));
    const probeExit=await ffmpeg.ffprobe(["-v","error","-show_entries","stream=codec_type:format=duration","-of","json",source,"-o","probe.json"]);
    if(probeExit!==0)throw new Error(lastMediaLog||t("invalidVideo"));
    const probe=JSON.parse(String(await ffmpeg.readFile("probe.json","utf8")));const duration=Number(probe.format?.duration);
    if(!probe.streams?.some((stream:{codec_type:string})=>stream.codec_type==="video")||!Number.isFinite(duration)||duration<=0||(totalDuration+=duration)>600)throw new Error(t("invalidVideo"));
    const audio=probe.streams.some((stream:{codec_type:string})=>stream.codec_type==="audio");
    const args=["-protocol_whitelist","file,pipe","-i",source,...(!audio?["-f","lavfi","-i","anullsrc=r=48000:cl=stereo"]:[]),"-map","0:v:0","-map",audio?"0:a:0":"1:a:0","-vf",`scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24`,"-c:v","libx264","-preset","ultrafast","-crf","22","-pix_fmt","yuv420p","-c:a","aac","-ar","48000","-ac","2","-t",String(duration),"-shortest",`clip-${i}.mp4`];
    if(await ffmpeg.exec(args,180000)!==0)throw new Error(t("clipFailed"));await ffmpeg.deleteFile(source);
   }
   setMessage(t("assembling"));await ffmpeg.writeFile("timeline.txt",files.map((_,i)=>`file 'clip-${i}.mp4'`).join("\n"));
   if(await ffmpeg.exec(["-f","concat","-safe","1","-i","timeline.txt","-c","copy","-metadata","comment=SASI assembled video","-movflags","+faststart","film.mp4"],60000)!==0)throw new Error(t("mergeFailed"));
   const result=await ffmpeg.readFile("film.mp4");if(!(result instanceof Uint8Array)||!result.length)throw new Error(t("readFailed"));
   setOutput(URL.createObjectURL(new Blob([new Uint8Array(result)],{type:"video/mp4"})));setMessage(t("done",{n:files.length}));
  }catch(error){setMessage(cancel.current?t("cancelled"):error instanceof Error?error.message:t("mergeFailed"))}
  finally{engine.current?.terminate();engine.current=null;active.current=false;setBusy(false)}
 }
 return <section className="mx-auto max-w-3xl rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6" data-video-assembler-version="v1600">
  <p className="text-sm text-[var(--lx-muted)]">{t("kicker")}</p><h1 className="mt-3 text-3xl font-semibold">{t("title")}</h1>
  <p className="mt-4 leading-7 text-[var(--lx-muted)]">{t("lead")}</p>
  <label className="mt-6 block">{t("add")}<input aria-label={t("add")} className="mt-2 block w-full" type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" multiple disabled={busy} onChange={event=>choose(event.target.files)}/></label>
  <p className="mt-2 text-sm text-[var(--lx-muted)]">{t("limit")}</p>
  <ol className="mt-5 space-y-2">{files.map((file,index)=><li key={`${index}-${file.name}`} className="flex items-center gap-3 rounded-xl border border-[var(--lx-line)] p-3"><span className="min-w-0 flex-1 break-all">{index+1}. {file.name}</span><button aria-label={`${t("up")} ${index+1}`} disabled={busy||!index} onClick={()=>move(index,-1)}>↑</button><button aria-label={`${t("down")} ${index+1}`} disabled={busy||index===files.length-1} onClick={()=>move(index,1)}>↓</button></li>)}</ol>
  <label className="mt-5 block">{t("ratio")}<select className="ml-3 rounded-lg border border-[var(--lx-line)] bg-[var(--lx-bg)] p-2" disabled={busy} value={ratio} onChange={e=>{setRatio(e.target.value);setOutput("")}}><option>9:16</option><option>16:9</option><option>1:1</option></select></label>
  <button className="mt-5 rounded-xl bg-[var(--lx-ink)] px-6 py-3 text-[var(--lx-bg)] disabled:opacity-40" disabled={busy||files.length<2} onClick={()=>void assemble()}>{busy?t("working"):t("start")}</button>
  {busy&&<button className="ml-4" onClick={()=>{cancel.current=true;engine.current?.terminate()}}>{t("stop")}</button>}
  {message&&<p role="status" className="mt-4 leading-7">{message}</p>}
  {output&&<div className="mt-5"><video controls className="max-h-96 w-full rounded-xl" src={output}/><a className="mt-4 inline-block rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-[var(--lx-bg)]" href={output} download="SASI-film.mp4">{t("download")}</a><p className="mt-2 text-sm text-[var(--lx-muted)]">{t("disclose")}</p></div>}
 </section>
}
