"use client";
import {useEffect,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";

import {localMediaDuration,toSrt,transcribeLocal} from "@/lib/tools/autonomous/transcribe-local";
import {translateSubtitleLocal} from "@/lib/tools/autonomous/subtitle-local";
import {saveText} from "@/lib/tools/autonomous/download-local";

export default function VideoDubbingWorkbench(){
 const[files,setFiles]=useState<File[]>([]),[source,setSource]=useState("zh"),[target,setTarget]=useState("en"),[minutes,setMinutes]=useState(1),[busy,setBusy]=useState(false),[progress,setProgress]=useState(""),[translated,setTranslated]=useState(""),[error,setError]=useState("");
 useEffect(()=>{const f=files[0];if(f)void localMediaDuration(f).then(d=>setMinutes(Math.max(1,Math.ceil(d/60)))).catch(()=>setMinutes(1))},[files]);
 async function run(){const f=files[0];if(!f)return;setBusy(true);setError("");try{
  const t=await transcribeLocal(f,(p,m)=>setProgress(`${m} ${Math.round(p*100)}%`));const srt=toSrt(t.segments);
  const out=await translateSubtitleLocal(srt,target,source);setTranslated(out);
 }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 function preview(){if(!translated)return;const plain=translated.replace(/^\d+$/gm,"").replace(/\d\d:\d\d:\d\d[,.]\d+\s+-->\s+\d\d:\d\d:\d\d[,.]\d+/g,"").trim();speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(plain.slice(0,5000));u.lang=target;speechSynthesis.speak(u)}
 return <div className="space-y-4">
  <FileDropzone accept="video/*,audio/*" files={files} onChange={setFiles} disabled={busy} kind="media" maxSizeMB={250}/>
  <label className="text-sm">配音语言<select value={target} onChange={e=>setTarget(e.target.value)} className="ml-2 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2"><option value="zh">中文</option><option value="en">English</option><option value="ja">日本語</option><option value="ko">한국어</option><option value="fr">Français</option><option value="de">Deutsch</option><option value="es">Español</option><option value="pt">Português</option><option value="ar">العربية</option></select></label>
  <label className="block text-sm">原始语言<select value={source} onChange={e=>setSource(e.target.value)} className="ml-2 border p-2"><option value="zh">中文</option><option value="en">English</option><option value="ja">日本語</option><option value="ko">한국어</option></select></label>
  {files.length>0&&!busy&&<button onClick={run} className="rounded-xl border px-4 py-2">免费尝试字幕翻译与语音试听</button>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{progress||"正在准备翻译配音…"}</p>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]">默认先在浏览器中完成语音识别、字幕翻译和配音预览，不需要连接外部服务。目前不能下载配音音轨或配音成片，暂不收费。浏览器不支持本地翻译时会停止并提示。</p>
  {error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
  {translated&&<div className="space-y-3"><textarea value={translated} readOnly rows={12} className="w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4"/><div className="flex gap-2"><button onClick={preview} className="rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">试听配音</button><button onClick={()=>saveText(translated,"lingxifield-dub.srt")} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">保存翻译字幕</button></div></div>}
 </div>
}
