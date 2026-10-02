"use client";
import{useEffect,useState}from"react";
import FileDropzone from"@/components/tools/FileDropzone";
import PaidActionButton from"@/components/tools/PaidActionButton";
import{translateSubtitleLocal}from"@/lib/tools/autonomous/subtitle-local";
import{saveText}from"@/lib/tools/autonomous/download-local";
import{draftFiles,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft}from"@/lib/tools/workspace/paid-task-draft";

export default function SubtitleTranslateWorkbench(){
 const[files,setFiles]=useState<File[]>([]),[target,setTarget]=useState("en"),[source,setSource]=useState("zh"),[busy,setBusy]=useState(false),[out,setOut]=useState(""),[name,setName]=useState("translated.srt"),[error,setError]=useState(""),[draftId,setDraftId]=useState(""),[draftReady,setDraftReady]=useState(false);
 useEffect(()=>{const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id){setDraftReady(true);return}void(async()=>{const d=await loadPaidTaskDraft<any>(id),f=draftFiles(d);if(d?.toolId==="subtitle-translate"){setDraftId(id);setFiles(f.slice(0,1));setSource(d.state?.source||"zh");setTarget(d.state?.target||"en");setOut(d.state?.out||"");setName(d.state?.name||"translated.srt")}setDraftReady(true)})()},[]);
 useEffect(()=>{if(!draftReady||!files[0])return;const id=draftId||newPaidTaskDraftId();if(!draftId)setDraftId(id);const tm=setTimeout(()=>void savePaidTaskDraft({id,toolId:"subtitle-translate",files:files.slice(0,1),state:{source,target,out,name}}),120);return()=>clearTimeout(tm)},[files,source,target,out,name,draftId,draftReady]);
 async function run(){const f=files[0];if(!f)return;setBusy(true);setError("");setOut("");try{const text=await f.text();const translated=await translateSubtitleLocal(text,target,source);setOut(translated);setName(`translated-${f.name}`)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 return <div className="space-y-4"><FileDropzone accept=".srt,.vtt,text/plain" files={files} onChange={next=>{setFiles(next);setOut("");setDraftId("")}} disabled={busy} kind="subtitle"/>
  <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">原语言<select value={source} onChange={e=>{setSource(e.target.value);setOut("")}} className="ml-2 rounded-xl border px-3 py-2"><option value="zh">中文</option><option value="en">English</option><option value="ja">日本語</option><option value="ko">한국어</option></select></label><label className="text-sm">目标语言<select value={target} onChange={e=>{setTarget(e.target.value);setOut("")}} className="ml-2 rounded-xl border px-3 py-2"><option value="zh">中文</option><option value="en">English</option><option value="ja">日本語</option><option value="ko">한국어</option><option value="fr">Français</option><option value="de">Deutsch</option><option value="es">Español</option><option value="pt">Português</option><option value="ar">العربية</option></select></label></div>
  {files.length>0&&!busy&&<button onClick={run} className="rounded-xl border px-4 py-2">先免费生成翻译预览</button>}
  {error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
  {out&&draftReady&&<><textarea value={out} readOnly rows={12} className="w-full rounded-2xl border bg-[var(--lx-soft)] p-4 text-sm"/><PaidActionButton toolId="subtitle-translate" quantity={1} draftId={draftId} draftReady={draftReady} metadata={{source,target,kind:"subtitle-export"}} onPaid={async()=>{await saveText(out,name)}} label="确认翻译结果，支付并导出字幕"/></>}
 </div>;
}
