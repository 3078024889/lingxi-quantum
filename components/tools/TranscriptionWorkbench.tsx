"use client";
import {useEffect,useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {localMediaDuration,toSrt,toVtt,transcribeLocal} from "@/lib/tools/autonomous/transcribe-local";
import ResultPanel from './ResultPanel';
import {draftFiles,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft} from "@/lib/tools/workspace/paid-task-draft";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {plainText,type PlainCopyKey} from "@/lib/tools/plain-copy";
import ToolUiText from "@/components/tools/ToolUiText";import{toolRuntimeText}from "@/lib/tool-runtime-i18n";

export default function TranscriptionWorkbench({video=false}:{video?:boolean}){
 const {lang}=useLingxiLang();const t=(zh:string,en:string)=>toolRuntimeText(lang,zh,en);
 const toolId=video?"video-transcription":"audio-transcription";
 const [files,setFiles]=useState<File[]>([]),[duration,setDuration]=useState(0),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[text,setText]=useState(""),[srt,setSrt]=useState(""),[vtt,setVtt]=useState(""),[error,setError]=useState<PlainCopyKey|null>(null),[draftId,setDraftId]=useState(""),[draftReady,setDraftReady]=useState(false),[restored,setRestored]=useState(false),[preview,setPreview]=useState(false);
 useEffect(()=>{let active=true;const f=files[0];setDuration(0);if(!f)return;void localMediaDuration(f).then(d=>{if(active){if(!Number.isFinite(d)||d<=0){setError("fileError");return}setDuration(d)}}).catch(()=>{if(active)setError("fileError")});return()=>{active=false}},[files]);
 useEffect(()=>{let active=true;const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id){setRestored(true);return}void loadPaidTaskDraft<any>(id).then(d=>{if(!active)return;const saved=draftFiles(d);if(d?.toolId===toolId&&saved.length){setDraftId(id);setFiles(saved.slice(0,1))}else setError("restoreError")}).catch(()=>{if(active)setError("restoreError")}).finally(()=>{if(active)setRestored(true)});return()=>{active=false}},[toolId]);
 useEffect(()=>{setDraftReady(false);if(!restored||!files[0]||!draftId||duration<=0)return;let active=true;const timer=setTimeout(()=>void savePaidTaskDraft({id:draftId,toolId,files:files.slice(0,1),state:{duration}}).then(()=>{if(active){setDraftReady(true);setError(e=>e==="draftError"?null:e)}}).catch(()=>{if(active)setError("draftError")}),120);return()=>{active=false;clearTimeout(timer)}},[files,duration,draftId,restored,toolId]);
 async function persistDraft(){setDraftReady(false);try{if(!files[0]||!draftId||duration<=0)throw new Error("NO_DRAFT");await savePaidTaskDraft({id:draftId,toolId,files:files.slice(0,1),state:{duration}});setDraftReady(true)}catch(e){setError("draftError");throw e}}
 async function run(maxSeconds?:number){const f=files[0];if(!f)return;setBusy(true);setError(null);setText("");setSrt("");setVtt("");setProgress(0);try{const r=await transcribeLocal(f,p=>setProgress(Math.round(p*100)),maxSeconds);setText(r.text);setSrt(toSrt(r.segments));setVtt(toVtt(r.segments));setPreview(Number(maxSeconds)>0&&Number(maxSeconds)<duration)}catch(e){setError("fileError");throw e}finally{setBusy(false)}}
 const exports=useMemo(()=>text?([[text,'txt','text/plain;charset=utf-8'],[srt,'srt','application/x-subrip'],[vtt,'vtt','text/vtt']] as const).map(([value,extension,mime])=>{const blob=new Blob([value],{type:mime});return{name:'lingxifield-transcript.'+extension,mime,size:blob.size,blob}}):[],[text,srt,vtt]);
 return <div className="space-y-4">
  <FileDropzone accept={video?"video/*,audio/*":"audio/*"} files={files} onChange={f=>{setDraftReady(false);setFiles(f);setText("");setSrt("");setVtt("");setError(null);setDraftId(f[0]?newPaidTaskDraftId():"")}} disabled={busy||!restored} kind="media" maxSizeMB={250}/>
  {files.length>0&&restored&&duration>0&&<div className="flex flex-wrap gap-3"><button type="button" disabled={busy||!draftReady} onClick={()=>void run(5)} className="rounded-xl border border-[var(--lx-line)] px-5 py-2.5 text-sm disabled:opacity-40"><span>{t("免费预览前 5 秒","Free preview of the first 5 seconds")}</span></button>{Math.ceil(Math.max(0,duration-5))>0?<PaidActionButton toolId={toolId} quantity={Math.ceil(Math.max(0,duration-5))} draftId={draftId} draftReady={draftReady} beforePayment={persistDraft} metadata={{durationSeconds:Math.ceil(duration),freePreviewSeconds:5,mode:"local-open-model"}} onPaid={()=>run()} label={`完整${video?"视频":"音频"}转文字 · ${Math.ceil(Math.max(0,duration-5))} 秒计费`}/>:<button type="button" disabled={busy||!draftReady} onClick={()=>void run()} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)]">{t("完整转写","Full transcription")}</button>}</div>}
  {duration>0&&<p className="text-xs leading-5 text-[var(--lx-muted)]">{t("前 5 秒免费预览；完整结果只按超出 5 秒的实际秒数计费，¥0.10 / 秒，$0.10 / 秒。","First 5 seconds are free to preview; full results bill only the seconds beyond 5 at ¥0.10 / $0.10 per second.")}</p>}
  {preview&&<p className="text-xs leading-5 text-[var(--lx-muted)]">{t("这是前 5 秒预览；完整转写会覆盖整段内容。","This is the first 5-second preview; full transcription covers the entire file.")}</p>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{plainText(lang,"working")} {progress}%</p>}
  {draftReady&&<p role="status" data-testid="draft-saved" className="text-xs text-[var(--lx-muted)]">{plainText(lang,"draftSaved")}</p>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{plainText(lang,error)}</p>}
  {text&&<div className="space-y-3"><textarea aria-label={plainText(lang,"text")} value={text} readOnly rows={10} className="w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4"/><ResultPanel files={exports} sourceSlug={toolId}/></div>}
 </div>;
}
