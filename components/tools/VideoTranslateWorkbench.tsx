"use client";
import ToolUiText from "@/components/tools/ToolUiText";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {mediaDurationCopy} from "@/lib/tools/media/duration-copy";
import {useEffect,useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import RemoteMediaImporter from "@/components/tools/RemoteMediaImporter";
import PaidActionButton from "@/components/tools/PaidActionButton";
import ResultPanel from "@/components/tools/ResultPanel";
import type {ToolResultFile} from "@/lib/tools/types";
import {localMediaDuration,transcribeLocal} from "@/lib/tools/autonomous/transcribe-local";
import {concatMp3,muxTranslatedVideo,requireTimedTranscript,toSrtTimed,toVttTimed,type TimedText} from "@/lib/tools/media/video-translate-client";
import {extractExactTranslatedCues,requireCuesWithinVideo,pairBilingualCues} from "@/lib/tools/media/video-subtitle-integrity";
import {newPaidTaskDraftId,savePaidTaskDraft} from "@/lib/tools/workspace/paid-task-draft";

const LANGS=[
 ["zh","中文"],["en","English"],["ja","日本語"],["ko","한국어"],["fr","Français"],["de","Deutsch"],["es","Español"],["pt","Português"],["ar","العربية"]
] as const;

type Target=typeof LANGS[number][0];
type Mode="subtitle"|"dub";
const bilingualNote:Record<typeof LANGS[number][0],string>={
 zh:"同步提供原文＋译文双语 SRT/VTT；时间码来自真实语音识别，异常时间轴不会生成文件。",
 en:"Bilingual SRT/VTT (original + translation) included. Timing comes from real speech recognition; invalid timestamps block export.",
 ja:"原文＋訳文の二言語SRT/VTTも出力。音声認識の実際の時間情報を維持し、不正な時間情報は出力しません。",
 ko:"원문과 번역문이 함께 있는 SRT/VTT도 제공합니다. 실제 음성 인식 시각을 유지하며 잘못된 시각은 내보내지 않습니다.",
 fr:"SRT/VTT bilingues inclus (original + traduction). Horodatages issus de la reconnaissance vocale ; les horodatages invalides bloquent l'export.",
 de:"Zweisprachige SRT/VTT (Original + Übersetzung) inklusive. Zeitstempel stammen aus der Spracherkennung; ungültige Zeiten verhindern den Export.",
 es:"Incluye SRT/VTT bilingüe (original y traducción). Los tiempos proceden del reconocimiento real de voz; los tiempos inválidos bloquean la exportación.",
 pt:"Inclui SRT/VTT bilíngue (original e tradução). Os tempos vêm do reconhecimento real de fala; tempos inválidos impedem a exportação.",
 ar:"تتضمن النتيجة ترجمات SRT/VTT ثنائية اللغة (الأصل والترجمة). التوقيت من التعرف الحقيقي على الكلام، والتوقيت غير الصالح يمنع التصدير."
};


function chunks<T>(items:T[],n:number){const out:T[][]=[];for(let i=0;i<items.length;i+=n)out.push(items.slice(i,i+n));return out}
function marker(i:number){return `⟦LX${String(i).padStart(4,"0")}⟧`}
function splitTts(text:string,max=10500){
 const parts:string[]=[];let cur="";
 for(const piece of text.split(/(?<=[。！？.!?])\s*/)){
  if(!piece)continue;
  if((cur+piece).length>max&&cur){parts.push(cur);cur=piece}else cur+=piece;
 }
 if(cur)parts.push(cur);
 return parts.length?parts:[text.slice(0,max)];
}
async function apiTranslate(text:string,source:string,target:string,quoteId:string){
 const r=await fetch("/api/tools/media/translate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,source,target,quoteId})});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(String(d.error||"TRANSLATE_FAILED"));const translated=String(d.translated||"").trim();if(!translated)throw Error("TRANSLATION_EMPTY");return translated;
}
async function translateTimed(input:TimedText[],source:string,target:string,quoteId:string){
 const out:TimedText[]=[];let base=0;
 for(const group of chunks(input,24)){
  const payload=group.map((x,i)=>`${marker(base+i)} ${x.text}`).join("\n");
  const translated=await apiTranslate(payload,source,target,quoteId);
  const cues=extractExactTranslatedCues(translated,base,group.length);
  if(!cues){
   for(let i=0;i<group.length;i++){
    const x=group[i],text=await apiTranslate(x.text,source,target,quoteId);
    if(text.includes("\uFFFD"))throw Error("TRANSLATION_INVALID");
    out.push({...x,text});
   }
  }else{
   for(let i=0;i<group.length;i++)out.push({...group[i],text:cues[i]});
  }
  base+=group.length;
 }
 return out;
}
async function remoteTts(text:string,target:string,quoteId:string){
 const r=await fetch("/api/tools/media/tts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,language:target,quoteId})});
 if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(String(d.error||"TTS_FAILED"))}return await r.blob();
}
function blobFile(name:string,text:string,mime:string):ToolResultFile{const b=new Blob([text],{type:mime});return{name,blob:b,mime,size:b.size}}

export default function VideoTranslateWorkbench(){
 const {lang:uiLang}=useLingxiLang();
 const[files,setFiles]=useState<File[]>([]),[source,setSource]=useState("auto"),[targets,setTargets]=useState<Target[]>(["en"]),[mode,setMode]=useState<Mode>("subtitle"),[durations,setDurations]=useState<number[]>([]),[durationStatus,setDurationStatus]=useState<"loading"|"ready"|"invalid">("loading"),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[videos,setVideos]=useState<ToolResultFile[]>([]),[subs,setSubs]=useState<ToolResultFile[]>([]),[draftId,setDraftId]=useState("");
 useEffect(()=>{
  let off=false;setDurations([]);setDurationStatus("loading");
  if(files.length)void(async()=>{
    try{
      const ds:number[]=[];
      for(const f of files){
        const seconds=await localMediaDuration(f);
        if(!Number.isFinite(seconds)||seconds<=0)throw Error("VIDEO_DURATION_UNVERIFIED");
        ds.push(seconds);
      }
      if(!off){setDurations(ds);setDurationStatus("ready")}
    }catch{if(!off){setDurations([]);setDurationStatus("invalid")}}
  })();
  return()=>{off=true};
 },[files]);
 const durationReady=files.length>0&&durationStatus==="ready"&&durations.length===files.length;
 const startedMinutes=useMemo(()=>durationReady?durations.reduce((n,d)=>n+Math.max(1,Math.ceil(d/60)),0):0,[durations,durationReady]);
 const quantity=durationReady?startedMinutes*Math.max(1,targets.length):0;
 const totalBytes=useMemo(()=>files.reduce((n,f)=>n+f.size,0),[files]);
 const persistFiles=totalBytes<=250*1024*1024;
 // Changing language, source file or output mode invalidates the previously rendered artifact.
 useEffect(()=>{setVideos([]);setSubs([]);setError("");},[files,source,targets,mode]);
 useEffect(()=>{if(!files.length){setDraftId("");return}if(!draftId)setDraftId(newPaidTaskDraftId())},[files.length,draftId]);

 function addTarget(v:Target){setTargets(cur=>cur.includes(v)?cur.filter(x=>x!==v):(cur.length>=3?cur:[...cur,v]))}
 async function addRemote(file:File){setDurations([]);setDurationStatus("loading");setFiles(cur=>[...cur,file].slice(0,20));setVideos([]);setSubs([]);setError("")}
 async function saveDraft(){
  if(!draftId)return;
  await savePaidTaskDraft({id:draftId,toolId:"video-translate",files:persistFiles?files:undefined,state:{source,targets,mode,startedMinutes,fileNames:files.map(f=>f.name),largeBatch:!persistFiles}});
 }
 async function run(quoteId:string){
  if(!durationReady)throw Error("VIDEO_DURATION_UNVERIFIED");
  setBusy(true);setStage("");setError("");setVideos([]);setSubs([]);
  const vo:ToolResultFile[]=[],so:ToolResultFile[]=[];
  try{
   for(let fi=0;fi<files.length;fi++){
    const file=files[fi],duration=durations[fi],stem=file.name.replace(/\.[^.]+$/,"");
    setStage(`${fi+1}/${files.length} · 正在识别语音…`);
    let original:TimedText[]=[];
    // Remote fallback supplies text only, not timestamps. A full-video cue
    // would fabricate synchronization and mislead users: fail and preserve the
    // existing paid job for retry rather than create false translated MP4/SRT.
    const local=await transcribeLocal(file,(p,m)=>setStage(`${fi+1}/${files.length} · ${m} ${Math.round(p*100)}%`));
    original=requireCuesWithinVideo(requireTimedTranscript(local.segments.map(x=>({start:x.start,end:x.end,text:x.text}))),duration);

    for(let ti=0;ti<targets.length;ti++){
      const target=targets[ti];
      setStage(`${fi+1}/${files.length} · ${ti+1}/${targets.length} · 正在翻译字幕…`);
      const translated=source===target?original:await translateTimed(original,source,target,quoteId);
      const checked=requireCuesWithinVideo(requireTimedTranscript(translated),duration);
      const srt=toSrtTimed(checked),vtt=toVttTimed(checked),txt=checked.map(x=>x.text).join("\n");
      const bilingual=pairBilingualCues(original,checked);
      so.push(blobFile(`${stem}-${target}.srt`,srt,"application/x-subrip;charset=utf-8"));
      so.push(blobFile(`${stem}-${target}.vtt`,vtt,"text/vtt;charset=utf-8"));
      so.push(blobFile(`${stem}-${target}.txt`,txt,"text/plain;charset=utf-8"));
      so.push(blobFile(`${stem}-${target}-bilingual.srt`,toSrtTimed(bilingual),"application/x-subrip;charset=utf-8"));
      so.push(blobFile(`${stem}-${target}-bilingual.vtt`,toVttTimed(bilingual),"text/vtt;charset=utf-8"));

      let dubbed:Blob|null=null;
      if(mode==="dub"){
       setStage(`${fi+1}/${files.length} · ${ti+1}/${targets.length} · 正在生成 AI 配音…`);
       const ttsParts=[] as Blob[];
       for(const part of splitTts(txt)){ttsParts.push(await remoteTts(part,target,quoteId))}
       dubbed=await concatMp3(ttsParts,p=>setStage(`${fi+1}/${files.length} · 正在合并语音 ${Math.round(p*100)}%`));
      }
      setStage(`${fi+1}/${files.length} · ${ti+1}/${targets.length} · 正在生成高质量 MP4…`);
      const translatedVideo=await muxTranslatedVideo({video:file,subtitles:srt,language:target,duration,dubbedAudio:dubbed,onProgress:p=>setStage(`${fi+1}/${files.length} · 视频合成 ${Math.round(p*100)}%`)});
      vo.push({name:`${stem}-${target}-${mode==="dub"?"translated-dubbed":"translated"}.mp4`,blob:translatedVideo,mime:"video/mp4",size:translatedVideo.size});
    }
   }
   setVideos(vo);setSubs(so);setStage("全部视频翻译完成");
  }catch(e){setError(e instanceof Error?e.message:String(e));setStage("");throw e}
  finally{setBusy(false)}
 }
 return <div className="space-y-5">
  <FileDropzone accept="video/*" multiple append maxFiles={20} maxSizeMB={500} files={files} onChange={f=>{setDurations([]);setDurationStatus("loading");setFiles(f);setVideos([]);setSubs([]);setError("")}} disabled={busy} kind="media"/>
  <RemoteMediaImporter acceptKind="video" onImported={addRemote} disabled={busy}/>
  <p className="text-xs leading-5 text-[var(--lx-faint)]"><ToolUiText text="支持本地视频、直接公开 HTTPS 媒体地址，以及当前解析器支持的抖音、TikTok、小红书、快手公开分享链接。不会绕过登录、DRM、私有权限或平台访问控制。" /></p>

  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm"><ToolUiText text="原始语言" />
    <select value={source} disabled={busy} onChange={e=>setSource(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">
     <option value="auto"><ToolUiText text="自动识别" /></option>{LANGS.map(([v,n])=><option key={v} value={v}><ToolUiText text={n}/></option>)}
    </select>
   </label>
   <label className="text-sm"><ToolUiText text="输出方式" />
    <select value={mode} disabled={busy} onChange={e=>setMode(e.target.value as Mode)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">
     <option value="subtitle"><ToolUiText text="翻译字幕 + 原音高质量 MP4" /></option>
     <option value="dub"><ToolUiText text="翻译字幕 + AI 配音高质量 MP4" /></option>
    </select>
   </label>
  </div>

  <section className="rounded-2xl border border-[var(--lx-line)] p-4">
   <div className="text-sm font-medium"><ToolUiText text="目标语言" /> <span className="text-xs font-normal text-[var(--lx-faint)]"><ToolUiText text="最多同时 3 种；每增加一种目标语言，按相同视频分钟数增加一次计费数量。" /></span></div>
   <div className="mt-3 flex flex-wrap gap-2">{LANGS.map(([v,n])=><button type="button" key={v} disabled={busy} onClick={()=>addTarget(v)} className={`rounded-full border px-4 py-2 text-sm ${targets.includes(v)?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border-[var(--lx-line)]"}`}><ToolUiText text={n}/></button>)}</div>
  </section>

  {files.length>0&&!durationReady&&<p role={durationStatus==="invalid"?"alert":"status"} className="text-sm text-[var(--lx-muted)]">{mediaDurationCopy(uiLang,durationStatus==="invalid"?"invalid":"loading")}</p>}
  {durationReady&&<section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-sm">
   <b>{files.length} <ToolUiText text="个视频 ·" /> {startedMinutes} <ToolUiText text="个起始分钟 ·" /> {targets.length} <ToolUiText text="个目标语言" /></b>
   <p className="mt-1 text-[var(--lx-muted)]"><ToolUiText text="计费数量：" />{startedMinutes} × {targets.length} = {quantity} <ToolUiText text="分钟单位。人民币 ¥1.50 / 分钟单位；美元 $1.50 / 分钟单位。" /></p>
   {!persistFiles&&<p className="mt-2 text-xs text-[var(--lx-faint)]"><ToolUiText text="这批视频较大，为避免浏览器数据库保存超大文件，付款和处理期间请保持当前页面打开。" /></p>}
  </section>}

  {durationReady&&targets.length>0&&<div data-testid="video-translate-checkout"><PaidActionButton toolId="video-translate" quantity={quantity} draftId={persistFiles?draftId:undefined} draftReady={true} beforePayment={persistFiles?saveDraft:undefined} metadata={{startedMinutes,targetCount:targets.length,mode,files:files.length}} onPaid={run} label="查看本次视频翻译价格"/></div>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]"><ToolUiText text={stage||"正在处理…"}/></p>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]"><ToolUiText text="高质量模式优先保留原视频码流，只新增翻译字幕轨；需要兼容重编码时使用 H.264 高质量参数。AI 配音为整轨合成语音，不宣称口型同步、原声克隆或逐句声纹复刻。" /></p>
  <p className="text-xs leading-5 text-[var(--lx-faint)]">{bilingualNote[uiLang]}</p>
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] p-4 text-sm text-[var(--lx-danger)]">{error}</p>}
  {videos.length>0&&<ResultPanel sourceSlug="video-translate" files={videos} messageZh="翻译视频已生成，可以保存。" messageEn="Translated videos are ready to save."/>}
  {subs.length>0&&<ResultPanel sourceSlug="video-translate" files={subs} messageZh="SRT / VTT / TXT 翻译字幕也已生成。" messageEn="Translated SRT / VTT / TXT files are also ready."/>}
 </div>;
}
