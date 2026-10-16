"use client";
import{useEffect,useMemo,useState}from"react";
import ToolUiText from "@/components/tools/ToolUiText";
import FileDropzone from"@/components/tools/FileDropzone";
import PaidActionButton from"@/components/tools/PaidActionButton";
import ResultPanel from"@/components/tools/ResultPanel";
import type{ToolResultFile}from"@/lib/tools/types";
import{localMediaDuration,toSrt,transcribeLocal}from"@/lib/tools/autonomous/transcribe-local";
import{clipMedia,extractCompactAudio,muxDubbedVideo}from"@/lib/tools/media/client";
import{draftFiles,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft}from"@/lib/tools/workspace/paid-task-draft";

const LANGS=[["zh","中文"],["en","English"],["ja","日本語"],["ko","한국어"],["fr","Français"],["de","Deutsch"],["es","Español"],["pt","Português"],["ar","العربية"]] as const;

async function remoteTranslate(text:string,source:string,target:string,quoteId:string){
 const r=await fetch("/api/tools/media/translate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,source,target,quoteId})});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(String(d.error||"TRANSLATE_FAILED"));return String(d.translated||"");
}
async function previewTts(text:string,target:string){const r=await fetch("/api/tools/media/preview-tts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,language:target})});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(String(d.error||"PREVIEW_TTS_FAILED"))}return await r.blob()}
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
 const[files,setFiles]=useState<File[]>([]),[source,setSource]=useState("zh"),[target,setTarget]=useState("en"),[durations,setDurations]=useState<number[]>([]),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[outputs,setOutputs]=useState<ToolResultFile[]>([]),[subtitles,setSubtitles]=useState<ToolResultFile[]>([]),[draftId,setDraftId]=useState(""),[draftReady,setDraftReady]=useState(false),[previewBusy,setPreviewBusy]=useState(false),[previewVideo,setPreviewVideo]=useState<ToolResultFile|null>(null),[previewError,setPreviewError]=useState("");
 useEffect(()=>{let off=false;(async()=>{const ds:number[]=[];for(const f of files){try{ds.push(await localMediaDuration(f))}catch{ds.push(0)}}if(!off)setDurations(ds)})();return()=>{off=true}},[files]);
 useEffect(()=>{const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id){setDraftReady(true);return}void(async()=>{const d=await loadPaidTaskDraft<any>(id),f=draftFiles(d);if(d?.toolId==="video-dubbing"){setDraftId(id);setFiles(f);setSource(d.state?.source||"zh");setTarget(d.state?.target||"en");setDurations(Array.isArray(d.state?.durations)?d.state.durations:[])}setDraftReady(true)})()},[]);
 useEffect(()=>{if(!draftReady||!files.length||!durations.length)return;const id=draftId||newPaidTaskDraftId();if(!draftId)setDraftId(id);const tm=setTimeout(()=>void savePaidTaskDraft({id,toolId:"video-dubbing",files,state:{source,target,durations}}),150);return()=>clearTimeout(tm)},[files,source,target,durations,draftId,draftReady]);
 const billableSeconds=durations.reduce((n,d)=>n+Math.max(0,Math.ceil(d-5)),0);
 const quantity=Math.max(1,billableSeconds);
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
    if(f.type.startsWith("audio/")){videos.push({name:f.name.replace(/\.[^.]+$/,"")+`-${target}-dubbed.mp3`,blob:voice,mime:"audio/mpeg",size:voice.size});continue}
    setStage(`${i+1}/${files.length} · 正在合成视频…`);
    const dubbed=await muxDubbedVideo(f,voice,p=>setStage(`${i+1}/${files.length} · 正在合成 ${Math.round(p*100)}%`));
    videos.push({name:f.name.replace(/\.[^.]+$/,"")+`-${target}-dubbed.mp4`,blob:dubbed,mime:"video/mp4",size:dubbed.size});
   }
   setOutputs(videos);setSubtitles(subs);setStage("处理完成");
  }catch(e){setError(e instanceof Error?e.message:String(e));setStage("");throw e}
  finally{setBusy(false)}
 }

 async function runPreview(){if(!files[0]||previewBusy||busy)return;setPreviewBusy(true);setPreviewError("");setPreviewVideo(null);try{const clip=await clipMedia(files[0],5),local=await transcribeLocal(clip,()=>{},5);if(!local.text.trim())throw new Error("PREVIEW_TRANSCRIPT_EMPTY");const translated=source===target?local.text:await (async()=>{const r=await fetch("/api/tools/media/preview-translate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text:local.text,source,target})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(String(d.error||"PREVIEW_TRANSLATE_FAILED"));return String(d.translated||"")})();const voice=await previewTts(translated,target);if(files[0].type.startsWith("audio/")){setPreviewVideo({name:files[0].name.replace(/\.[^.]+$/,"")+"-"+target+"-preview.mp3",blob:voice,mime:"audio/mpeg",size:voice.size});return}const dubbed=await muxDubbedVideo(clip,voice);setPreviewVideo({name:files[0].name.replace(/\.[^.]+$/,"")+"-"+target+"-preview.mp4",blob:dubbed,mime:"video/mp4",size:dubbed.size})}catch(e){setPreviewError(e instanceof Error?e.message:String(e))}finally{setPreviewBusy(false)}}
 return <div className="space-y-4">
  <FileDropzone accept="video/*,audio/*" multiple maxFiles={5} maxSizeMB={500} files={files} onChange={f=>{setFiles(f);setOutputs([]);setSubtitles([]);setError("");setDraftId("")}} disabled={busy} kind="media"/>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm"><ToolUiText text="原始语言" /><select value={source} onChange={e=>setSource(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
   <label className="text-sm"><ToolUiText text="配音语言" /><select value={target} onChange={e=>setTarget(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
  </div>
  {files.length>0&&<div className="flex flex-wrap gap-3"><button type="button" disabled={previewBusy||busy} onClick={()=>void runPreview()} className="rounded-xl border border-[var(--lx-line)] px-5 py-2.5 text-sm"><ToolUiText text={previewBusy?"正在生成 5 秒预览…":"免费预览前 5 秒"}/></button>{billableSeconds>0?<PaidActionButton toolId="video-dubbing" quantity={quantity} draftId={draftId} draftReady={draftReady} metadata={{billableSeconds,files:files.length,source,target,export:"dubbed-mp4",freePreviewSeconds:5}} onPaid={run} label={"完整配音 · 超出部分 "+billableSeconds+" 秒"}/>:<span className="rounded-xl bg-[var(--lx-soft)] px-4 py-2.5 text-sm"><ToolUiText text="5 秒以内可直接使用免费预览"/></span>}</div>}
  <p className="text-xs leading-5 text-[var(--lx-muted)]"><ToolUiText text="前 5 秒免费预览；完整配音按超出部分实际秒数计费，¥0.10 / 秒，$0.10 / 秒。"/></p>
  {previewError&&<p role="alert" className="text-sm text-[var(--lx-danger)]"><ToolUiText text={previewError}/></p>}{previewVideo&&<ResultPanel sourceSlug="video-dubbing" files={[previewVideo]} messageZh="5 秒配音预览已生成，可以先试听。" messageEn="The 5-second dubbed preview is ready."/>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{stage||"正在处理…"}</p>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]"><ToolUiText text="生成结果包含翻译字幕和可下载 MP4 配音成片。当前版本使用新的合成语音替换原视频音轨，不宣称口型同步或原声克隆。生成语音为 AI 合成语音。" /></p>
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] p-4 text-sm text-[var(--lx-danger)]">{error}</p>}
  {outputs.length>0&&<ResultPanel sourceSlug="video-dubbing" files={outputs} messageZh="配音视频已生成，可以保存。" messageEn="Dubbed video is ready to save."/>}
  {subtitles.length>0&&<ResultPanel sourceSlug="video-dubbing" files={subtitles} messageZh="翻译字幕也已生成。" messageEn="Translated subtitles are also ready."/>}
 </div>
}
