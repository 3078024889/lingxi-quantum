"use client";
import {useEffect,useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {localMediaDuration,toSrt,toVtt,transcribeLocal} from "@/lib/tools/autonomous/transcribe-local";
import ResultPanel from './ResultPanel';
import {draftFiles,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft} from "@/lib/tools/workspace/paid-task-draft";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {plainText,type PlainCopyKey} from "@/lib/tools/plain-copy";

const NO_TIMING:Record<string,string>={zh:"已识别文字，但模型未返回可靠时间轴。本次仅提供 TXT，不生成空白字幕。",en:"Text was recognized, but reliable timestamps are unavailable. Only TXT is provided; no empty subtitle files.",ja:"テキストは認識しましたが、時刻情報がありません。TXT のみ出力します。",ko:"텍스트를 인식했지만 신뢰할 수 있는 시간 정보가 없습니다. TXT만 제공합니다.",fr:"Texte reconnu, mais horodatage indisponible. Seul TXT est proposé.",de:"Text erkannt, Zeitstempel fehlen. Nur TXT wird angeboten.",es:"Texto reconocido, pero sin marcas de tiempo fiables. Solo se ofrece TXT.",pt:"Texto reconhecido, mas sem tempos fiáveis. Apenas TXT disponível.",ar:"تم التعرف على النص، لكن التوقيت غير متاح. سيتوفر ملف TXT فقط."};
export default function TranscriptionWorkbench({video=false}:{video?:boolean}){
 const {lang}=useLingxiLang();
 const toolId=video?"video-transcription":"audio-transcription";
 const [files,setFiles]=useState<File[]>([]),[minutes,setMinutes]=useState(0),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[text,setText]=useState(""),[srt,setSrt]=useState(""),[vtt,setVtt]=useState(""),[error,setError]=useState<PlainCopyKey|null>(null),[draftId,setDraftId]=useState(""),[draftReady,setDraftReady]=useState(false),[restored,setRestored]=useState(false);
 useEffect(()=>{let active=true;const f=files[0];setMinutes(0);if(!f)return;void localMediaDuration(f).then(d=>{if(active){if(!Number.isFinite(d)||d<=0){setError("fileError");return}setMinutes(Math.max(1,Math.ceil(d/60)))}}).catch(()=>{if(active)setError("fileError")});return()=>{active=false}},[files]);
 useEffect(()=>{let active=true;const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id){setRestored(true);return}void loadPaidTaskDraft<any>(id).then(d=>{if(!active)return;const saved=draftFiles(d);if(d?.toolId===toolId&&saved.length){setDraftId(id);setFiles(saved.slice(0,1))}else setError("restoreError")}).catch(()=>{if(active)setError("restoreError")}).finally(()=>{if(active)setRestored(true)});return()=>{active=false}},[toolId]);
 useEffect(()=>{setDraftReady(false);if(!restored||!files[0]||!draftId||minutes<=0)return;let active=true;const timer=setTimeout(()=>void savePaidTaskDraft({id:draftId,toolId,files:files.slice(0,1),state:{minutes}}).then(()=>{if(active){setDraftReady(true);setError(e=>e==="draftError"?null:e)}}).catch(()=>{if(active)setError("draftError")}),120);return()=>{active=false;clearTimeout(timer)}},[files,minutes,draftId,restored,toolId]);
 async function persistDraft(){setDraftReady(false);try{if(!files[0]||!draftId||minutes<=0)throw new Error("NO_DRAFT");await savePaidTaskDraft({id:draftId,toolId,files:files.slice(0,1),state:{minutes}});setDraftReady(true)}catch(e){setError("draftError");throw e}}
 async function run(){const f=files[0];if(!f)return;setBusy(true);setError(null);setText("");setSrt("");setVtt("");setProgress(0);try{const r=await transcribeLocal(f,p=>setProgress(Math.round(p*100)));if(!r.text.trim())throw Error("TRANSCRIPT_EMPTY");setText(r.text);const timed=r.segments.filter(c=>c.text.trim()&&Number.isFinite(c.start)&&c.start>=0&&Number.isFinite(c.end));setSrt(timed.length?toSrt(timed):"");setVtt(timed.length?toVtt(timed):"")}catch(e){setError("fileError");throw e}finally{setBusy(false)}}
 const exports=useMemo(()=>text?([[text,'txt','text/plain;charset=utf-8'],[srt,'srt','application/x-subrip'],[vtt,'vtt','text/vtt']] as const).filter(([value])=>Boolean(value.trim())&&value.trim()!=="WEBVTT").map(([value,extension,mime])=>{const blob=new Blob([value],{type:mime});return{name:'lingxifield-transcript.'+extension,mime,size:blob.size,blob}}):[],[text,srt,vtt]);
 return <div className="space-y-4">
  <FileDropzone accept={video?"video/*,audio/*":"audio/*"} files={files} onChange={f=>{setDraftReady(false);setFiles(f);setText("");setSrt("");setVtt("");setError(null);setDraftId(f[0]?newPaidTaskDraftId():"")}} disabled={busy||!restored} kind="media" maxSizeMB={250}/>
  {files.length>0&&restored&&<PaidActionButton toolId={toolId} quantity={minutes} draftId={draftId} draftReady={draftReady} beforePayment={persistDraft} metadata={{minutes,mode:"local-open-model"}} onPaid={run} label={plainText(lang,"price")}/>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{plainText(lang,"working")} {progress}%</p>}
  {draftReady&&<p role="status" data-testid="draft-saved" className="text-xs text-[var(--lx-muted)]">{plainText(lang,"draftSaved")}</p>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{plainText(lang,error)}</p>}
  {text&&<div className="space-y-3">{!srt&&<p role="status" className="text-sm text-[var(--lx-muted)]">{NO_TIMING[lang]||NO_TIMING.en}</p>}<textarea aria-label={plainText(lang,"text")} value={text} readOnly rows={10} className="w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4"/><ResultPanel files={exports} sourceSlug={toolId}/></div>}
 </div>;
}
