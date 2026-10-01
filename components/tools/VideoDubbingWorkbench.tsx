"use client";
import{useEffect,useMemo,useState}from"react";
import FileDropzone from"@/components/tools/FileDropzone";
import PaidActionButton from"@/components/tools/PaidActionButton";
import ResultPanel from"@/components/tools/ResultPanel";
import type{ToolResultFile}from"@/lib/tools/types";
import{localMediaDuration,toSrt,transcribeLocal}from"@/lib/tools/autonomous/transcribe-local";
import{extractCompactAudio,muxDubbedVideo}from"@/lib/tools/media/client";
import{draftFiles,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft}from"@/lib/tools/workspace/paid-task-draft";

const LANGS=[["zh","中文"],["en","English"],["ja","日本語"],["ko","한국어"],["fr","Français"],["de","Deutsch"],["es","Español"],["pt","Português"],["ar","العربية"]] as const;

async function remoteTranslate(text:string,source:string,target:string,quoteId:string){
 const r=await fetch("/api/tools/media/translate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,source,target,quoteId})});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(String(d.error||"TRANSLATE_FAILED"));return String(d.translated||"");
}
async function remoteTts(text:string,target:string,quoteId:string){
 const r=await fetch("/api/tools/media/tts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,language:target,quoteId})});
 if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(String(d.error||"TTS_FAILED"))}return await r.blob();
}
async function remoteTranscribe(file:File,quoteId:string){
 const compact=await extractCompactAudio(file);
 const fd=new FormData();fd.set("file",compact);fd.set("quoteId",quoteId);
 const r=await fetch("/api/tools/media/transcribe",{method:"POST",body:fd});const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(String(d.error||"TRANSCRIBE_FAILED"));return String(d.text||"");
}

export default function VideoDubbingWorkbench(){
 const[files,setFiles]=useState<File[]>([]),[source,setSource]=useState("zh"),[target,setTarget]=useState("en"),[minutes,setMinutes]=useState(0),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[outputs,setOutputs]=useState<ToolResultFile[]>([]),[subtitles,setSubtitles]=useState<ToolResultFile[]>([]),[draftId,setDraftId]=useState(""),[draftReady,setDraftReady]=useState(false);
 useEffect(()=>{let off=false;(async()=>{let total=0;for(const f of files){try{total+=Math.max(1,Math.ceil((await localMediaDuration(f))/60))}catch{total+=1}}if(!off)setMinutes(total)})();return()=>{off=true}},[files]);
 useEffect(()=>{const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id){setDraftReady(true);return}void(async()=>{const d=await loadPaidTaskDraft<any>(id),f=draftFiles(d);if(d?.toolId==="video-dubbing"){setDraftId(id);setFiles(f);setSource(d.state?.source||"zh");setTarget(d.state?.target||"en");setMinutes(Number(d.state?.minutes||0))}setDraftReady(true)})()},[]);
 useEffect(()=>{if(!draftReady||!files.length)return;const id=draftId||newPaidTaskDraftId();if(!draftId)setDraftId(id);const tm=setTimeout(()=>void savePaidTaskDraft({id,toolId:"video-dubbing",files,state:{source,target,minutes}}),150);return()=>clearTimeout(tm)},[files,source,target,minutes,draftId,draftReady]);
 const quantity=Math.max(1,minutes);

 async function run(quoteId:string){
  setBusy(true);setError("");setOutputs([]);setSubtitles([]);
  const videos:ToolResultFile[]=[],subs:ToolResultFile[]=[];
  try{
   for(let i=0;i<files.length;i++){
    const f=files[i];setStage(`${i+1}/${files.length} · 正在识别语音…`);
    let text="",srt="";
    try{
     const local=await transcribeLocal(f,(p,m)=>setStage(`${i+1}/${files.length} · ${m} ${Math.round(p*100)}%`));
     text=local.text;srt=toSrt(local.segments);
    }catch{
     setStage(`${i+1}/${files.length} · 正在使用兼容识别…`);
     text=await remoteTranscribe(f,quoteId);
     const duration=await localMediaDuration(f).catch(()=>60);
     srt=`1\n00:00:00,000 --> ${new Date(Math.max(1000,duration*1000)).toISOString().slice(11,23).replace(".",",")}\n${text}`;
    }
    setStage(`${i+1}/${files.length} · 正在翻译…`);
    const translated=source===target?text:await remoteTranslate(text,source,target,quoteId);
    const translatedSrt=srt.replace(text,translated);
    const sb=new Blob([translatedSrt],{type:"text/plain;charset=utf-8"});
    subs.push({name:f.name.replace(/\.[^.]+$/,"")+`-${target}.srt`,blob:sb,mime:"text/plain",size:sb.size});
    setStage(`${i+1}/${files.length} · 正在生成配音…`);
    const voice=await remoteTts(translated,target,quoteId);
    setStage(`${i+1}/${files.length} · 正在合成视频…`);
    const dubbed=await muxDubbedVideo(f,voice,p=>setStage(`${i+1}/${files.length} · 正在合成 ${Math.round(p*100)}%`));
    videos.push({name:f.name.replace(/\.[^.]+$/,"")+`-${target}-dubbed.mp4`,blob:dubbed,mime:"video/mp4",size:dubbed.size});
   }
   setOutputs(videos);setSubtitles(subs);setStage("处理完成");
  }catch(e){setError(e instanceof Error?e.message:String(e));setStage("")}
  finally{setBusy(false)}
 }

 return <div className="space-y-4">
  <FileDropzone accept="video/*,audio/*" multiple maxFiles={5} maxSizeMB={500} files={files} onChange={f=>{setFiles(f);setOutputs([]);setSubtitles([]);setError("")}} disabled={busy} kind="media"/>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm">原始语言<select value={source} onChange={e=>setSource(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
   <label className="text-sm">配音语言<select value={target} onChange={e=>setTarget(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
  </div>
  {files.length>0&&!busy&&<PaidActionButton toolId="video-dubbing" quantity={quantity} draftId={draftId} draftReady={draftReady} metadata={{minutes:quantity,files:files.length,source,target,export:"dubbed-mp4"}} onPaid={run} label="查看本次配音成片价格"/>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{stage||"正在处理…"}</p>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]">生成结果包含翻译字幕和可下载 MP4 配音成片。当前版本使用新的合成语音替换原视频音轨，不宣称口型同步或原声克隆。生成语音为 AI 合成语音。</p>
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] p-4 text-sm text-[var(--lx-danger)]">{error}</p>}
  {outputs.length>0&&<ResultPanel sourceSlug="video-dubbing" files={outputs} messageZh="配音视频已生成，可以保存。" messageEn="Dubbed video is ready to save."/>}
  {subtitles.length>0&&<ResultPanel sourceSlug="video-dubbing" files={subtitles} messageZh="翻译字幕也已生成。" messageEn="Translated subtitles are also ready."/>}
 </div>
}
