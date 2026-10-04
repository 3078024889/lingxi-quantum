"use client";
import {useEffect,useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import RemoteMediaImporter from "@/components/tools/RemoteMediaImporter";
import PaidActionButton from "@/components/tools/PaidActionButton";
import ResultPanel from "@/components/tools/ResultPanel";
import type {ToolResultFile} from "@/lib/tools/types";
import {localMediaDuration,transcribeLocal} from "@/lib/tools/autonomous/transcribe-local";
import {extractCompactAudio} from "@/lib/tools/media/client";
import {concatMp3,muxTranslatedVideo,toSrtTimed,toVttTimed,type TimedText} from "@/lib/tools/media/video-translate-client";
import {newPaidTaskDraftId,savePaidTaskDraft} from "@/lib/tools/workspace/paid-task-draft";

const LANGS=[
 ["zh","中文"],["en","English"],["ja","日本語"],["ko","한국어"],["fr","Français"],["de","Deutsch"],["es","Español"],["pt","Português"],["ar","العربية"]
] as const;

type Target=typeof LANGS[number][0];
type Mode="subtitle"|"dub";

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
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(String(d.error||"TRANSLATE_FAILED"));return String(d.translated||"");
}
async function translateTimed(input:TimedText[],source:string,target:string,quoteId:string){
 const out:TimedText[]=[];let base=0;
 for(const group of chunks(input,24)){
  const payload=group.map((x,i)=>`${marker(base+i)} ${x.text}`).join("\n");
  const translated=await apiTranslate(payload,source,target,quoteId);
  const map=new Map<number,string>();
  const re=/⟦LX(\d{4})⟧\s*([\s\S]*?)(?=⟦LX\d{4}⟧|$)/g;let m:RegExpExecArray|null;
  while((m=re.exec(translated)))map.set(Number(m[1]),m[2].trim());
  if(map.size!==group.length){
   for(let i=0;i<group.length;i++){const x=group[i];out.push({...x,text:await apiTranslate(x.text,source,target,quoteId)})}
  }else{
   for(let i=0;i<group.length;i++){const x=group[i];out.push({...x,text:map.get(base+i)||x.text})}
  }
  base+=group.length;
 }
 return out;
}
async function remoteTranscribe(file:File,quoteId:string){
 const compact=await extractCompactAudio(file);
 const fd=new FormData();fd.set("file",compact);fd.set("quoteId",quoteId);
 const r=await fetch("/api/tools/media/transcribe",{method:"POST",body:fd});const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(String(d.error||"TRANSCRIBE_FAILED"));return String(d.text||"");
}
async function remoteTts(text:string,target:string,quoteId:string){
 const r=await fetch("/api/tools/media/tts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,language:target,quoteId})});
 if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(String(d.error||"TTS_FAILED"))}return await r.blob();
}
function blobFile(name:string,text:string,mime:string):ToolResultFile{const b=new Blob([text],{type:mime});return{name,blob:b,mime,size:b.size}}

export default function VideoTranslateWorkbench(){
 const[files,setFiles]=useState<File[]>([]),[source,setSource]=useState("auto"),[targets,setTargets]=useState<Target[]>(["en"]),[mode,setMode]=useState<Mode>("subtitle"),[durations,setDurations]=useState<number[]>([]),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[videos,setVideos]=useState<ToolResultFile[]>([]),[subs,setSubs]=useState<ToolResultFile[]>([]),[draftId,setDraftId]=useState("");
 useEffect(()=>{let off=false;(async()=>{const ds=[] as number[];for(const f of files)ds.push(await localMediaDuration(f).catch(()=>60));if(!off)setDurations(ds)})();return()=>{off=true}},[files]);
 const startedMinutes=useMemo(()=>durations.reduce((n,d)=>n+Math.max(1,Math.ceil(d/60)),0),[durations]);
 const quantity=Math.max(1,startedMinutes*Math.max(1,targets.length));
 const totalBytes=useMemo(()=>files.reduce((n,f)=>n+f.size,0),[files]);
 const persistFiles=totalBytes<=250*1024*1024;
 useEffect(()=>{if(!files.length){setDraftId("");return}if(!draftId)setDraftId(newPaidTaskDraftId())},[files.length,draftId]);

 function addTarget(v:Target){setTargets(cur=>cur.includes(v)?cur.filter(x=>x!==v):(cur.length>=3?cur:[...cur,v]))}
 async function addRemote(file:File){setFiles(cur=>[...cur,file].slice(0,20));setVideos([]);setSubs([]);setError("")}
 async function saveDraft(){
  if(!draftId)return;
  await savePaidTaskDraft({id:draftId,toolId:"video-translate",files:persistFiles?files:undefined,state:{source,targets,mode,startedMinutes,fileNames:files.map(f=>f.name),largeBatch:!persistFiles}});
 }
 async function run(quoteId:string){
  setBusy(true);setStage("");setError("");setVideos([]);setSubs([]);
  const vo:ToolResultFile[]=[],so:ToolResultFile[]=[];
  try{
   for(let fi=0;fi<files.length;fi++){
    const file=files[fi],duration=durations[fi]||await localMediaDuration(file).catch(()=>60),stem=file.name.replace(/\.[^.]+$/,"");
    setStage(`${fi+1}/${files.length} · 正在识别语音…`);
    let original:TimedText[]=[];
    try{
      const local=await transcribeLocal(file,(p,m)=>setStage(`${fi+1}/${files.length} · ${m} ${Math.round(p*100)}%`));
      original=local.segments.map(x=>({start:x.start,end:x.end,text:x.text}));
      if(!original.length&&local.text)original=[{start:0,end:duration,text:local.text}];
    }catch{
      const text=await remoteTranscribe(file,quoteId);
      original=[{start:0,end:duration,text}];
    }
    if(!original.length)throw new Error("TRANSCRIPT_EMPTY");

    for(let ti=0;ti<targets.length;ti++){
      const target=targets[ti];
      setStage(`${fi+1}/${files.length} · ${ti+1}/${targets.length} · 正在翻译字幕…`);
      const translated=source===target?original:await translateTimed(original,source,target,quoteId);
      const srt=toSrtTimed(translated),vtt=toVttTimed(translated),txt=translated.map(x=>x.text).join("\n");
      so.push(blobFile(`${stem}-${target}.srt`,srt,"application/x-subrip;charset=utf-8"));
      so.push(blobFile(`${stem}-${target}.vtt`,vtt,"text/vtt;charset=utf-8"));
      so.push(blobFile(`${stem}-${target}.txt`,txt,"text/plain;charset=utf-8"));

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
  <FileDropzone accept="video/*" multiple append maxFiles={20} maxSizeMB={500} files={files} onChange={f=>{setFiles(f);setVideos([]);setSubs([]);setError("")}} disabled={busy} kind="media"/>
  <RemoteMediaImporter acceptKind="video" onImported={addRemote} disabled={busy}/>
  <p className="text-xs leading-5 text-[var(--lx-faint)]">支持本地视频、直接公开 HTTPS 媒体地址，以及当前解析器支持的抖音、TikTok、小红书、快手公开分享链接。不会绕过登录、DRM、私有权限或平台访问控制。</p>

  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm">原始语言
    <select value={source} onChange={e=>setSource(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">
     <option value="auto">自动识别</option>{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}
    </select>
   </label>
   <label className="text-sm">输出方式
    <select value={mode} onChange={e=>setMode(e.target.value as Mode)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">
     <option value="subtitle">翻译字幕 + 原音高质量 MP4</option>
     <option value="dub">翻译字幕 + AI 配音高质量 MP4</option>
    </select>
   </label>
  </div>

  <section className="rounded-2xl border border-[var(--lx-line)] p-4">
   <div className="text-sm font-medium">目标语言 <span className="text-xs font-normal text-[var(--lx-faint)]">最多同时 3 种；每增加一种目标语言，按相同视频分钟数增加一次计费数量。</span></div>
   <div className="mt-3 flex flex-wrap gap-2">{LANGS.map(([v,n])=><button type="button" key={v} onClick={()=>addTarget(v)} className={`rounded-full border px-4 py-2 text-sm ${targets.includes(v)?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border-[var(--lx-line)]"}`}>{n}</button>)}</div>
  </section>

  {files.length>0&&<section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-sm">
   <b>{files.length} 个视频 · {startedMinutes} 个起始分钟 · {targets.length} 个目标语言</b>
   <p className="mt-1 text-[var(--lx-muted)]">计费数量：{startedMinutes} × {targets.length} = {quantity} 分钟单位。人民币 ¥1.50 / 分钟单位；美元 $1.50 / 分钟单位。</p>
   {!persistFiles&&<p className="mt-2 text-xs text-[var(--lx-faint)]">这批视频较大，为避免浏览器数据库保存超大文件，付款和处理期间请保持当前页面打开。</p>}
  </section>}

  {files.length>0&&targets.length>0&&<PaidActionButton toolId="video-translate" quantity={quantity} draftId={persistFiles?draftId:undefined} draftReady={true} beforePayment={persistFiles?saveDraft:undefined} metadata={{startedMinutes,targetCount:targets.length,mode,files:files.length}} onPaid={run} label="查看本次视频翻译价格"/>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{stage||"正在处理…"}</p>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]">高质量模式优先保留原视频码流，只新增翻译字幕轨；需要兼容重编码时使用 H.264 高质量参数。AI 配音为整轨合成语音，不宣称口型同步、原声克隆或逐句声纹复刻。</p>
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] p-4 text-sm text-[var(--lx-danger)]">{error}</p>}
  {videos.length>0&&<ResultPanel sourceSlug="video-translate" files={videos} messageZh="翻译视频已生成，可以保存。" messageEn="Translated videos are ready to save."/>}
  {subs.length>0&&<ResultPanel sourceSlug="video-translate" files={subs} messageZh="SRT / VTT / TXT 翻译字幕也已生成。" messageEn="Translated SRT / VTT / TXT files are also ready."/>}
 </div>;
}
