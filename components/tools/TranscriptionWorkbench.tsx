"use client";
import{useEffect,useState}from"react";
import FileDropzone from"@/components/tools/FileDropzone";
import PaidActionButton from"@/components/tools/PaidActionButton";
import{localMediaDuration,toSrt,toVtt,transcribeLocal}from"@/lib/tools/autonomous/transcribe-local";
import{saveText}from"@/lib/tools/autonomous/download-local";
import{draftFiles,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft}from"@/lib/tools/workspace/paid-task-draft";

export default function TranscriptionWorkbench({video=false}:{video?:boolean}){
 const toolId=video?"video-transcription":"audio-transcription";
 const[files,setFiles]=useState<File[]>([]),[minutes,setMinutes]=useState(1),[busy,setBusy]=useState(false),[progress,setProgress]=useState(""),[text,setText]=useState(""),[srt,setSrt]=useState(""),[vtt,setVtt]=useState(""),[error,setError]=useState(""),[draftId,setDraftId]=useState(""),[draftReady,setDraftReady]=useState(false);
 useEffect(()=>{const f=files[0];if(!f){setMinutes(1);return}void localMediaDuration(f).then(d=>setMinutes(Math.max(1,Math.ceil(d/60)))).catch(()=>setMinutes(1))},[files]);
 useEffect(()=>{const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id){setDraftReady(true);return}void(async()=>{const d=await loadPaidTaskDraft<any>(id);const restored=draftFiles(d);if(d?.toolId===toolId&&restored.length){setDraftId(id);setFiles(restored.slice(0,1));setMinutes(Number(d.state?.minutes||1))}setDraftReady(true)})()},[toolId]);
 useEffect(()=>{if(!draftReady||!files[0])return;const id=draftId||newPaidTaskDraftId();if(!draftId)setDraftId(id);const tm=setTimeout(()=>void savePaidTaskDraft({id,toolId,files:files.slice(0,1),state:{minutes}}),120);return()=>clearTimeout(tm)},[files,minutes,draftId,draftReady,toolId]);
 async function run(){const f=files[0];if(!f)return;setBusy(true);setError("");setText("");try{const r=await transcribeLocal(f,(p,m)=>setProgress(`${m} ${Math.round(p*100)}%`));setText(r.text);setSrt(toSrt(r.segments));setVtt(toVtt(r.segments))}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 return <div className="space-y-4"><FileDropzone accept={video?"video/*,audio/*":"audio/*"} files={files} onChange={f=>{setFiles(f);setText("");setError("")}} disabled={busy} kind="media" maxSizeMB={250}/>
  {files.length>0&&!busy&&draftReady&&<PaidActionButton toolId={toolId} quantity={minutes} draftId={draftId} draftReady={draftReady} metadata={{minutes,mode:"local-open-model"}} onPaid={run} label="查看本次价格"/>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{progress||"正在识别…"}</p>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]">付款会保留当前音视频任务；返回后会继续同一个文件，不会要求重新付款。</p>
  {error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
  {text&&<div className="space-y-3"><textarea value={text} readOnly rows={10} className="w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4"/><div className="flex gap-2"><button onClick={()=>saveText(text,"lingxifield-transcript.txt")} className="rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">TXT</button><button onClick={()=>saveText(srt,"lingxifield-transcript.srt")} className="rounded-xl border px-4 py-2 text-sm">SRT</button><button onClick={()=>saveText(vtt,"lingxifield-transcript.vtt")} className="rounded-xl border px-4 py-2 text-sm">VTT</button></div></div>}
 </div>;
}
