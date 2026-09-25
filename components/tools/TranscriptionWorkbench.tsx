"use client";
import {useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import RemoteMediaImporter from "@/components/tools/RemoteMediaImporter";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

type Item={file:File;duration:number;minutes:number;key:string};
type Result={name:string;text:string;srt?:string};
type C={durationFail:string,total:string;minutes:string;lang:string;auto:string;working:string;price:string;ready:string;error:string};
const D:Record<LingxiLang,C>={
 zh:{durationFail:"无法读取这个音视频的时长",total:"已选择",minutes:"计费分钟",lang:"语言提示（可选）",auto:"自动检测",working:"正在转写…",price:"查看本次转写价格",ready:"转写完成，可以核对文字并下载 TXT / SRT。",error:"转写没有完成"},
 en:{durationFail:"Could not read the duration of this media file",total:"Selected",minutes:"billable minutes",lang:"Language hint (optional)",auto:"Auto detect",working:"Transcribing…",price:"See this transcription price",ready:"Transcription finished. Review the text and download TXT / SRT.",error:"Transcription did not finish"},
 ja:{durationFail:"このメディアの長さを読み取れません",total:"選択済み",minutes:"課金分数",lang:"言語ヒント（任意）",auto:"自動検出",working:"文字起こし中…",price:"今回の文字起こし料金を見る",ready:"文字起こしが完了しました。確認して TXT / SRT をダウンロードできます。",error:"文字起こしを完了できませんでした"},
 ko:{durationFail:"미디어 길이를 읽을 수 없습니다",total:"선택됨",minutes:"과금 분",lang:"언어 힌트 (선택)",auto:"자동 감지",working:"전사 중…",price:"이번 전사 가격 보기",ready:"전사가 완료되었습니다. 확인 후 TXT / SRT를 다운로드하세요.",error:"전사를 완료하지 못했습니다"},
 fr:{durationFail:"Impossible de lire la durée de ce média",total:"Sélection",minutes:"minutes facturées",lang:"Langue (facultatif)",auto:"Détection automatique",working:"Transcription…",price:"Voir le prix de cette transcription",ready:"Transcription terminée. Vérifiez puis téléchargez TXT / SRT.",error:"La transcription n’a pas abouti"},
 de:{durationFail:"Mediendauer konnte nicht gelesen werden",total:"Ausgewählt",minutes:"abrechenbare Minuten",lang:"Sprachhinweis (optional)",auto:"Automatisch erkennen",working:"Transkription…",price:"Preis dieser Transkription anzeigen",ready:"Transkription abgeschlossen. Text prüfen und TXT / SRT herunterladen.",error:"Transkription konnte nicht abgeschlossen werden"},
 es:{durationFail:"No se pudo leer la duración del archivo",total:"Seleccionado",minutes:"minutos facturables",lang:"Idioma (opcional)",auto:"Detección automática",working:"Transcribiendo…",price:"Ver precio de esta transcripción",ready:"Transcripción terminada. Revisa y descarga TXT / SRT.",error:"No se pudo completar la transcripción"},
 pt:{durationFail:"Não foi possível ler a duração da mídia",total:"Selecionado",minutes:"minutos cobrados",lang:"Idioma (opcional)",auto:"Detecção automática",working:"Transcrevendo…",price:"Ver preço desta transcrição",ready:"Transcrição concluída. Revise e baixe TXT / SRT.",error:"Não foi possível concluir a transcrição"},
 ar:{durationFail:"تعذر قراءة مدة ملف الوسائط",total:"تم الاختيار",minutes:"دقائق محسوبة",lang:"تلميح اللغة (اختياري)",auto:"اكتشاف تلقائي",working:"جارٍ النسخ…",price:"عرض سعر هذا النسخ",ready:"اكتمل النسخ. راجع النص ونزّل TXT / SRT.",error:"تعذر إكمال النسخ"}
};

function durationOf(file:File,msg:string){return new Promise<number>((resolve,reject)=>{const el=document.createElement(file.type.startsWith("video/")?"video":"audio"),u=URL.createObjectURL(file),finish=()=>URL.revokeObjectURL(u),t=setTimeout(()=>{finish();reject(new Error(msg))},15000);el.preload="metadata";el.onloadedmetadata=()=>{clearTimeout(t);const d=el.duration;finish();Number.isFinite(d)&&d>0?resolve(d):reject(new Error(msg))};el.onerror=()=>{clearTimeout(t);finish();reject(new Error(msg))};el.src=u})}

export default function TranscriptionWorkbench({video=false}:{video?:boolean}){
 const{lang:uiLang}=useLingxiLang();const c=D[uiLang]??D.en;
 const[items,setItems]=useState<Item[]>([]),[hint,setHint]=useState(""),[busy,setBusy]=useState(false),[results,setResults]=useState<Result[]>([]),[error,setError]=useState("");
 const toolId=video?"video-transcription":"audio-transcription";
 async function hydrate(files:File[]){
  setError("");setResults([]);
  try{
   const out=[] as Item[];
   for(const f of files.slice(0,8)){const d=await durationOf(f,c.durationFail);out.push({file:f,duration:d,minutes:Math.max(1,Math.ceil(d/60)),key:`${f.name}-${f.size}-${f.lastModified}`})}
   setItems(out);
  }catch(e){setItems([]);setError(e instanceof Error?e.message:String(e))}
 }
 async function addRemote(file:File){await hydrate([...items.map(x=>x.file),file])}
 const total=useMemo(()=>items.reduce((n,x)=>n+x.minutes,0),[items]);
 const exports=useMemo<ToolResultFile[]>(()=>{
   const out:ToolResultFile[]=[];
   for(const r of results){
    const txt=new Blob([r.text],{type:"text/plain;charset=utf-8"});out.push({name:`${r.name}.txt`,blob:txt,mime:"text/plain",size:txt.size});
    if(r.srt){const s=new Blob([r.srt],{type:"text/plain;charset=utf-8"});out.push({name:`${r.name}.srt`,blob:s,mime:"text/plain",size:s.size})}
   }
   return out;
 },[results]);

 async function run(quoteId:string){
  setBusy(true);setError("");setResults([]);
  try{
   const out=[] as Result[];
   for(let i=0;i<items.length;i++){
    const it=items[i],fd=new FormData();fd.set("file",it.file,it.file.name);fd.set("quote_id",quoteId);fd.set("item_key",`transcribe-${i}`);fd.set("paid_minutes",String(it.minutes));fd.set("tool_id",toolId);if(hint)fd.set("language",hint);
    const r=await fetch("/api/ai/transcribe",{method:"POST",body:fd});const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||"Transcription failed");
    if(typeof d.text!=="string"||!d.text.trim())throw new Error("EMPTY_TRANSCRIPTION");
    out.push({name:it.file.name,text:d.text,srt:typeof d.srt==="string"&&d.srt.trim()?d.srt:undefined});
   }
   setResults(out);
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setBusy(false)}
 }

 return <div className="space-y-4">
  <FileDropzone accept={video?"video/*,audio/*":"audio/*"} multiple maxFiles={8} maxSizeMB={25} files={items.map(x=>x.file)} onChange={hydrate} disabled={busy} kind="media"/>
  <RemoteMediaImporter acceptKind={video?"video":"audio"} onImported={addRemote} disabled={busy}/>
  {items.length>0&&<div className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-sm text-[var(--lx-muted)]">{c.total} {items.length} · <b className="text-[var(--lx-ink)]">{total} {c.minutes}</b></div>}
  <label className="block text-sm text-[var(--lx-muted)]">{c.lang}
   <select value={hint} onChange={e=>setHint(e.target.value)} className="ml-2 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"><option value="">{c.auto}</option><option value="zh">中文</option><option value="en">English</option><option value="ja">日本語</option><option value="ko">한국어</option><option value="es">Español</option><option value="fr">Français</option></select>
  </label>
  {busy?<button disabled className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] opacity-50">{c.working}</button>:total>0?<PaidActionButton toolId={toolId} quantity={total} metadata={{files:items.length}} onPaid={run} label={c.price}/>:null}
  {results.map(r=><section key={r.name} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4"><div className="mb-2 font-medium text-[var(--lx-ink)]">{r.name}</div><textarea rows={10} value={r.text} readOnly className="w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 text-sm text-[var(--lx-ink)]"/></section>)}
  {!!exports.length&&<ResultPanel files={exports} messageZh={c.ready} messageEn={c.ready}/>}
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>
}
