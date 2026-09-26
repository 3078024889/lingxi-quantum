"use client";
import {useEffect,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {localMediaDuration,toSrt,toVtt,transcribeLocal} from "@/lib/tools/autonomous/transcribe-local";
import {saveText} from "@/lib/tools/autonomous/download-local";

export default function TranscriptionWorkbench({video=false}:{video?:boolean}){
 const[files,setFiles]=useState<File[]>([]),[minutes,setMinutes]=useState(1),[busy,setBusy]=useState(false),[progress,setProgress]=useState(""),[text,setText]=useState(""),[srt,setSrt]=useState(""),[vtt,setVtt]=useState(""),[error,setError]=useState("");
 useEffect(()=>{const f=files[0];if(!f){setMinutes(1);return}void localMediaDuration(f).then(d=>setMinutes(Math.max(1,Math.ceil(d/60)))).catch(()=>setMinutes(1))},[files]);
 async function run(){const f=files[0];if(!f)return;setBusy(true);setError("");setText("");try{
  const r=await transcribeLocal(f,(p,m)=>setProgress(`${m} ${Math.round(p*100)}%`));setText(r.text);setSrt(toSrt(r.segments));setVtt(toVtt(r.segments));
 }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 const toolId=video?"video-transcription":"audio-transcription";
 return <div className="space-y-4">
  <FileDropzone accept={video?"video/*,audio/*":"audio/*"} files={files} onChange={setFiles} disabled={busy} kind="media" maxSizeMB={250}/>
  {files.length>0&&!busy&&<PaidActionButton toolId={toolId} quantity={minutes} metadata={{minutes,mode:"local-open-model"}} onPaid={run} label="查看本次价格"/>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{progress||"正在识别…"}</p>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]">默认在浏览器中使用开放语音识别模型处理。首次使用会准备模型文件，之后可复用；不需要填写任何模型密钥。</p>
  {error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
  {text&&<div className="space-y-3"><textarea value={text} readOnly rows={10} className="w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4"/><div className="flex gap-2"><button onClick={()=>saveText(text,"lingxifield-transcript.txt")} className="rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">TXT</button><button onClick={()=>saveText(srt,"lingxifield-transcript.srt")} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">SRT</button><button onClick={()=>saveText(vtt,"lingxifield-transcript.vtt")} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">VTT</button></div></div>}
 </div>
}
