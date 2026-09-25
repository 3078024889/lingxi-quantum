"use client";
import {useMemo,useState} from "react";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";
type Cue={start:string;end:string;text:string};
type C={load:string;paste:string;shift:string;prepare:string;ready:string;error:string};
const D:Record<LingxiLang,C>={
 zh:{load:"载入 SRT / VTT",paste:"也可以直接粘贴字幕文本。",shift:"整体时间偏移（毫秒）",prepare:"生成 SRT / VTT / TXT",ready:"字幕已解析并生成三种真实导出格式，可以核对后下载。",error:"字幕处理没有完成"},
 en:{load:"Load SRT / VTT",paste:"You can also paste subtitle text directly.",shift:"Global time shift (ms)",prepare:"Create SRT / VTT / TXT",ready:"Subtitles were parsed and three real export formats are ready for review.",error:"Subtitle processing did not finish"},
 ja:{load:"SRT / VTT を読み込む",paste:"字幕テキストを直接貼り付けることもできます。",shift:"全体時間オフセット（ms）",prepare:"SRT / VTT / TXT を生成",ready:"字幕を解析し、3 種類の実ファイルを生成しました。",error:"字幕処理を完了できませんでした"},
 ko:{load:"SRT / VTT 불러오기",paste:"자막 텍스트를 직접 붙여넣을 수도 있습니다.",shift:"전체 시간 이동 (ms)",prepare:"SRT / VTT / TXT 생성",ready:"자막을 분석하고 세 가지 실제 내보내기 형식을 준비했습니다.",error:"자막 처리를 완료하지 못했습니다"},
 fr:{load:"Charger SRT / VTT",paste:"Vous pouvez aussi coller le texte des sous-titres.",shift:"Décalage global (ms)",prepare:"Créer SRT / VTT / TXT",ready:"Les sous-titres ont été analysés et trois formats d’export sont prêts.",error:"Le traitement des sous-titres n’a pas abouti"},
 de:{load:"SRT / VTT laden",paste:"Untertiteltext kann auch direkt eingefügt werden.",shift:"Globale Zeitverschiebung (ms)",prepare:"SRT / VTT / TXT erstellen",ready:"Untertitel wurden verarbeitet und drei echte Exportformate erstellt.",error:"Untertitelverarbeitung fehlgeschlagen"},
 es:{load:"Cargar SRT / VTT",paste:"También puedes pegar el texto de subtítulos.",shift:"Desplazamiento global (ms)",prepare:"Crear SRT / VTT / TXT",ready:"Los subtítulos se analizaron y hay tres formatos reales listos.",error:"No se pudo procesar el subtítulo"},
 pt:{load:"Carregar SRT / VTT",paste:"Você também pode colar o texto da legenda.",shift:"Deslocamento global (ms)",prepare:"Criar SRT / VTT / TXT",ready:"As legendas foram analisadas e três formatos reais estão prontos.",error:"Não foi possível processar a legenda"},
 ar:{load:"تحميل SRT / VTT",paste:"يمكنك أيضًا لصق نص الترجمة مباشرة.",shift:"إزاحة الوقت العامة (ms)",prepare:"إنشاء SRT / VTT / TXT",ready:"تم تحليل الترجمة وإنشاء ثلاث صيغ تصدير حقيقية.",error:"تعذر إكمال معالجة الترجمة"}
};
function parseTime(s:string){const p=s.trim().replace(",",".").split(":").map(Number);if(p.some(x=>!Number.isFinite(x)))return NaN;return p.length===3?p[0]*3600+p[1]*60+p[2]:p.length===2?p[0]*60+p[1]:NaN}
function fmt(sec:number,vtt=false){sec=Math.max(0,sec);const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=(sec%60).toFixed(3).padStart(6,"0");return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${s.replace(".",vtt?".":",")}`}
function parseSubtitle(raw:string):Cue[]{
 const normalized=raw.replace(/^\uFEFF/,"").replace(/\r/g,"").replace(/^WEBVTT[^\n]*\n+/i,"").trim();if(!normalized)return [];
 return normalized.split(/\n\s*\n/).map(block=>{const lines=block.split("\n").filter(Boolean),idx=lines.findIndex(x=>x.includes("-->"));if(idx<0)return null;const timing=lines[idx].split("-->");if(timing.length!==2)return null;const start=timing[0].trim().split(/\s+/)[0],end=timing[1].trim().split(/\s+/)[0],text=lines.slice(idx+1).join("\n").trim(),a=parseTime(start),b=parseTime(end);return text&&Number.isFinite(a)&&Number.isFinite(b)&&b>=a?{start,end,text}:null}).filter(Boolean) as Cue[];
}
export default function SubtitleWorkbench(){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 const[raw,setRaw]=useState(""),[shift,setShift]=useState(0),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]);
 function prepare(){
  try{
   setError("");const cues=parseSubtitle(raw);if(!cues.length)throw new Error("INVALID_SUBTITLE");
   const moved=cues.map(x=>({...x,start:fmt(parseTime(x.start)+shift/1000),end:fmt(parseTime(x.end)+shift/1000)}));
   if(moved.some(x=>parseTime(x.end)<parseTime(x.start)))throw new Error("INVALID_TIME_RANGE");
   const srt=moved.map((x,n)=>`${n+1}\n${x.start} --> ${x.end}\n${x.text}`).join("\n\n");
   const vtt="WEBVTT\n\n"+moved.map(x=>`${x.start.replace(",",".")} --> ${x.end.replace(",",".")}\n${x.text}`).join("\n\n");
   const txt=moved.map(x=>x.text).join("\n");
   const build=(name:string,text:string,mime:string):ToolResultFile=>{const blob=new Blob([text],{type:mime});return{name,blob,mime,size:blob.size}};
   setResults([build("subtitle.srt",srt,"application/x-subrip;charset=utf-8"),build("subtitle.vtt",vtt,"text/vtt;charset=utf-8"),build("subtitle.txt",txt,"text/plain;charset=utf-8")]);
  }catch(e){setResults([]);setError(e instanceof Error?e.message:String(e))}
 }
 const count=useMemo(()=>parseSubtitle(raw).length,[raw]);
 return <div className="space-y-4">
  <label onDragOver={e=>e.preventDefault()} onDrop={async e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f){setRaw(await f.text());setResults([])}}} className="block cursor-pointer rounded-2xl border border-dashed border-[var(--lx-line)] bg-[var(--lx-soft)] p-7 text-center">
   <input type="file" accept=".srt,.vtt,text/plain,text/vtt" className="hidden" onChange={async e=>{const f=e.target.files?.[0];if(f){setRaw(await f.text());setResults([])}}}/><b className="text-[var(--lx-ink)]">{c.load}</b><p className="mt-1 text-sm text-[var(--lx-muted)]">{c.paste}</p>
  </label>
  <textarea rows={14} value={raw} onChange={e=>{setRaw(e.target.value);setResults([])}} placeholder={"1\n00:00:01,000 --> 00:00:03,000\nHello"} className="w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 font-mono text-sm text-[var(--lx-ink)]"/>
  <label className="block text-sm text-[var(--lx-muted)]">{c.shift}<input type="number" value={shift} onChange={e=>{setShift(Number(e.target.value)||0);setResults([])}} className="ml-2 rounded-lg border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]"/></label>
  <button disabled={!raw.trim()} onClick={prepare} className="rounded-xl bg-[var(--lx-ink)] px-4 py-2.5 text-sm text-[var(--lx-bg)] disabled:opacity-40">{c.prepare}{count?` · ${count}`:""}</button>
  {!!results.length&&<ResultPanel files={results} messageZh={c.ready} messageEn={c.ready}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
