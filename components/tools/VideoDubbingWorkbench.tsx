"use client";
import{useEffect,useMemo,useState}from"react";
import ToolUiText from "@/components/tools/ToolUiText";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import FileDropzone from"@/components/tools/FileDropzone";
import PaidActionButton from"@/components/tools/PaidActionButton";
import ResultPanel from"@/components/tools/ResultPanel";
import type{ToolResultFile}from"@/lib/tools/types";
import{localMediaDuration,toSrt,transcribeLocal}from"@/lib/tools/autonomous/transcribe-local";
import{mediaDurationCopy}from"@/lib/tools/media/duration-copy";
import{extractCompactAudio,muxDubbedVideo}from"@/lib/tools/media/client";
import {fitVoiceDurationToVideo} from "@/lib/tools/media/voice-duration-fit";
import {voiceDurationCopy,voiceDurationError} from "@/lib/tools/media/voice-duration-plan";
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

const CAPTION_WARNING:Record<string,string>={
 zh:"这份配音视频已完成，但识别服务未返回可信字幕时间轴，所以没有生成虚构的同步字幕。",
 en:"The dubbed video is ready. Speech recognition supplied no reliable subtitle timestamps, so synchronized captions were not fabricated.",
 ja:"吹き替え動画は完成しました。認識に信頼できるタイムスタンプがないため、字幕は作成していません。",
 ko:"더빙 영상은 준비되었습니다. 신뢰할 수 있는 자막 시간 정보가 없어 가짜 동기화 자막은 만들지 않았습니다.",
 fr:"La vidéo doublée est prête. Aucune synchronisation de sous-titres n’a été inventée sans horodatage fiable.",
 de:"Das synchronisierte Video ist fertig. Ohne verlässliche Zeitmarken wurden keine künstlichen Untertitel erzeugt.",
 es:"El video doblado está listo. Sin marcas de tiempo fiables no se generaron subtítulos sincronizados ficticios.",
 pt:"O vídeo dublado está pronto. Sem tempos fiáveis não foram criadas legendas sincronizadas fictícias.",
 ar:"اكتمل الفيديو المدبلج، ولم تُنشأ ترجمات متزامنة مصطنعة لعدم توفر توقيت موثوق."
};
export default function VideoDubbingWorkbench(){
 const {lang:uiLang}=useLingxiLang();
 const[untimed,setUntimed]=useState(false);
 const[files,setFiles]=useState<File[]>([]),[source,setSource]=useState("zh"),[target,setTarget]=useState("en"),[minutes,setMinutes]=useState<number|null>(null),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[outputs,setOutputs]=useState<ToolResultFile[]>([]),[subtitles,setSubtitles]=useState<ToolResultFile[]>([]),[draftId,setDraftId]=useState(""),[draftReady,setDraftReady]=useState(false);
 useEffect(()=>{
  let off=false;setMinutes(null);
  if(files.length)void(async()=>{
    try{
      let total=0;
      for(const f of files){
        const seconds=await localMediaDuration(f);
        if(!Number.isFinite(seconds)||seconds<=0)throw Error("VIDEO_DURATION_UNVERIFIED");
        total+=Math.max(1,Math.ceil(seconds/60));
      }
      if(!off)setMinutes(total);
    }catch{if(!off)setMinutes(-1)}
  })();
  return()=>{off=true};
 },[files]);
 useEffect(()=>{const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id){setDraftReady(true);return}void(async()=>{const d=await loadPaidTaskDraft<any>(id),f=draftFiles(d);if(d?.toolId==="video-dubbing"){setDraftId(id);setFiles(f);setSource(d.state?.source||"zh");setTarget(d.state?.target||"en");setMinutes(null)}setDraftReady(true)})()},[]);
 useEffect(()=>{if(!draftReady||!files.length)return;const id=draftId||newPaidTaskDraftId();if(!draftId)setDraftId(id);const tm=setTimeout(()=>void savePaidTaskDraft({id,toolId:"video-dubbing",files,state:{source,target,minutes}}),150);return()=>clearTimeout(tm)},[files,source,target,minutes,draftId,draftReady]);
 useEffect(()=>{setOutputs([]);setSubtitles([]);setUntimed(false);},[files,source,target]);
 const quantity=minutes!==null&&minutes>0?minutes:0;

 async function run(quoteId:string){
  setBusy(true);setError("");setOutputs([]);setSubtitles([]);setUntimed(false);
  let missingTimings=false;
  const videos:ToolResultFile[]=[],subs:ToolResultFile[]=[];
  try{
   for(let i=0;i<files.length;i++){
    const f=files[i];setStage(`${i+1}/${files.length} · 正在识别语音…`);
    let text="",timed: {start:number;end:number;text:string}[]=[];
    try{
     const local=await transcribeLocal(f,(p,m)=>setStage(`${i+1}/${files.length} · ${m} ${Math.round(p*100)}%`));
     text=local.text;
     timed=local.segments.filter(seg=>Number.isFinite(seg.start)&&Number.isFinite(seg.end)&&seg.start>=0&&seg.end>seg.start&&seg.text.trim());
    }catch{
     setStage(`${i+1}/${files.length} · 正在使用兼容识别…`);
     text=await remoteTranscribe(f,quoteId);
     // The fallback gives text, not a real word-level timing track.
     // Still deliver the actual dub, but never invent an SRT cue over the whole video.
    }
    if(!text.trim())throw Error("TRANSCRIPT_EMPTY");
    setStage(`${i+1}/${files.length} · 正在翻译…`);
    // Translate each real timed chunk independently. Replacing a complete
    // transcript inside one cue silently leaves other subtitle cues untranslated.
    const translatedSegments=source===target?timed:await Promise.all(timed.map(async seg=>({
      ...seg,text:await remoteTranslate(seg.text,source,target,quoteId)
    })));
    if(translatedSegments.some(seg=>!seg.text.trim()))throw Error("TRANSLATION_EMPTY_SEGMENT");
    const translated=source===target?text:translatedSegments.length
      ?translatedSegments.map(seg=>seg.text).join(" ")
      :await remoteTranslate(text,source,target,quoteId);
    if(!translated.trim())throw Error("TRANSLATION_EMPTY");
    if(!translatedSegments.length)missingTimings=true;
    if(translatedSegments.length){
     const translatedSrt=toSrt(translatedSegments);
     const sb=new Blob([translatedSrt],{type:"text/plain;charset=utf-8"});
     subs.push({name:f.name.replace(/\.[^.]+$/,"")+`-${target}.srt`,blob:sb,mime:"text/plain",size:sb.size});
    }
    setStage(`${i+1}/${files.length} · 正在生成配音…`);
    const voice=await remoteTts(translated,target,quoteId);
    setStage(`${i+1}/${files.length} · 正在合成视频…`);
    const measured=await localMediaDuration(f);
    setStage(voiceDurationCopy(uiLang).stage);
    const voiceFitted=await fitVoiceDurationToVideo(voice,measured);
    const dubbed=await muxDubbedVideo(f,voiceFitted,p=>setStage(`${i+1}/${files.length} · 正在合成 ${Math.round(p*100)}%`));
    videos.push({name:f.name.replace(/\.[^.]+$/,"")+`-${target}-dubbed.mp4`,blob:dubbed,mime:"video/mp4",size:dubbed.size});
   }
   setOutputs(videos);setSubtitles(subs);setUntimed(missingTimings);setStage("处理完成");
  }catch(e){setError(voiceDurationError(uiLang,e)||(e instanceof Error?e.message:String(e)));setStage("");throw e}
  finally{setBusy(false)}
 }

 return <div className="space-y-4">
  <FileDropzone accept="video/*" multiple maxFiles={5} maxSizeMB={500} files={files} onChange={f=>{setMinutes(null);setFiles(f);setOutputs([]);setSubtitles([]);setError("");setDraftId("")}} disabled={busy} kind="media"/>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm"><ToolUiText text="原始语言" /><select value={source} disabled={busy} onChange={e=>setSource(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
   <label className="text-sm"><ToolUiText text="配音语言" /><select value={target} disabled={busy} onChange={e=>setTarget(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
  </div>
  {files.length>0&&quantity===0&&<p role={minutes===-1?"alert":"status"} className="text-sm text-[var(--lx-muted)]">{mediaDurationCopy(uiLang,minutes===-1?"invalid":"loading")}</p>}
  {files.length>0&&quantity>0&&<div data-testid="video-dubbing-checkout"><PaidActionButton toolId="video-dubbing" quantity={quantity} draftId={draftId} draftReady={draftReady} metadata={{minutes:quantity,files:files.length,source,target,export:"dubbed-mp4"}} onPaid={run} label="查看本次配音成片价格"/></div>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{stage||"正在处理…"}</p>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]"><ToolUiText text="生成结果包含翻译字幕和可下载 MP4 配音成片。生成前测量配音与视频时长，在合理语速内适配，避免尾音被截掉。仍不宣称逐句同步、口型同步或原声克隆。生成语音为 AI 合成语音。" /></p>
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] p-4 text-sm text-[var(--lx-danger)]">{error}</p>}
  {outputs.length>0&&<ResultPanel sourceSlug="video-dubbing" files={outputs} messageZh="配音视频已生成，可以保存。" messageEn="Dubbed video is ready to save."/>}
  {subtitles.length>0&&<ResultPanel sourceSlug="video-dubbing" files={subtitles} messageZh="翻译字幕也已生成。" messageEn="Translated subtitles are also ready."/>}
  {outputs.length>0&&untimed&&<p role="status" className="text-sm text-[var(--lx-muted)]">{CAPTION_WARNING[uiLang]||CAPTION_WARNING.en}</p>}
 </div>
}
