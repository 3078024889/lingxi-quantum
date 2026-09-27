"use client";
import {useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {translateSubtitleLocal} from "@/lib/tools/autonomous/subtitle-local";
import {saveText} from "@/lib/tools/autonomous/download-local";

export default function SubtitleTranslateWorkbench(){
 const[files,setFiles]=useState<File[]>([]),[target,setTarget]=useState("en"),[source,setSource]=useState("zh"),[busy,setBusy]=useState(false),[out,setOut]=useState(""),[name,setName]=useState("translated.srt"),[error,setError]=useState("");
 async function run(){const f=files[0];if(!f)return;setBusy(true);setError("");setOut("");try{
  const text=await f.text();const translated=await translateSubtitleLocal(text,target,source);setOut(translated);setName(`translated-${f.name}`);
 }catch(e){const m=e instanceof Error?e.message:String(e);setError(m==="LOCAL_TRANSLATOR_UNAVAILABLE"?"当前浏览器暂时无法直接完成字幕翻译。请在系统浏览器中打开此页继续；其他工具不受影响。":m)}finally{setBusy(false)}}
 return <div className="space-y-4">
  <FileDropzone accept=".srt,.vtt,text/plain" files={files} onChange={next=>{setFiles(next);setOut("");}} disabled={busy} kind="subtitle"/>
  <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">原语言<select value={source} disabled={busy} onChange={e=>{setSource(e.target.value);setOut("");}} className="ml-2 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2"><option value="zh">中文</option><option value="en">English</option><option value="ja">日本語</option><option value="ko">한국어</option></select></label><label className="text-sm">目标语言<select value={target} disabled={busy} onChange={e=>{setTarget(e.target.value);setOut("");}} className="ml-2 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2"><option value="zh">中文</option><option value="en">English</option><option value="ja">日本語</option><option value="ko">한국어</option><option value="fr">Français</option><option value="de">Deutsch</option><option value="es">Español</option><option value="pt">Português</option><option value="ar">العربية</option></select></label></div>
  {files.length>0&&!busy&&<button onClick={run} className="rounded-xl border px-4 py-2">先免费生成翻译预览</button>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">正在翻译字幕…</p>}
  <p className="text-xs text-[var(--lx-faint)]">翻译会直接在当前设备上完成，时间轴保持不变，无需额外连接其他服务。</p>
  {error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
  {out&&<><textarea value={out} readOnly rows={12} className="w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-sm"/><PaidActionButton toolId="subtitle-translate" quantity={1} metadata={{mode:"local",source,target}} onPaid={async()=>{await saveText(out,name)}} label="确认翻译结果，支付并导出字幕"/></>}
 </div>
}
