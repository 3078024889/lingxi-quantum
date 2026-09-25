"use client";
import {useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

type C={paste:string,target:string;working:string;price:string;ready:string;error:string};
const C:Record<LingxiLang,C>={
 zh:{paste:"也可以直接粘贴一份字幕正文",target:"翻译成",working:"正在翻译…",price:"查看本次翻译价格",ready:"字幕翻译完成，可以核对后下载。",error:"字幕翻译没有完成"},
 en:{paste:"Or paste subtitle text directly",target:"Translate to",working:"Translating…",price:"See this translation price",ready:"Subtitle translation finished. Review and download the result.",error:"Subtitle translation did not finish"},
 ja:{paste:"字幕本文を直接貼り付けることもできます",target:"翻訳先",working:"翻訳中…",price:"今回の翻訳料金を見る",ready:"字幕翻訳が完了しました。確認してダウンロードできます。",error:"字幕翻訳を完了できませんでした"},
 ko:{paste:"자막 본문을 직접 붙여넣을 수도 있습니다",target:"번역 언어",working:"번역 중…",price:"이번 번역 가격 보기",ready:"자막 번역이 완료되었습니다. 확인 후 다운로드하세요.",error:"자막 번역을 완료하지 못했습니다"},
 fr:{paste:"Ou collez directement le texte des sous-titres",target:"Traduire vers",working:"Traduction…",price:"Voir le prix de cette traduction",ready:"Traduction terminée. Vérifiez puis téléchargez le résultat.",error:"La traduction n’a pas abouti"},
 de:{paste:"Oder Untertiteltext direkt einfügen",target:"Übersetzen nach",working:"Übersetzung…",price:"Preis dieser Übersetzung anzeigen",ready:"Untertitelübersetzung abgeschlossen. Prüfen und herunterladen.",error:"Untertitelübersetzung konnte nicht abgeschlossen werden"},
 es:{paste:"O pega directamente el texto de los subtítulos",target:"Traducir a",working:"Traduciendo…",price:"Ver precio de esta traducción",ready:"Traducción terminada. Revisa y descarga el resultado.",error:"No se pudo completar la traducción"},
 pt:{paste:"Ou cole diretamente o texto da legenda",target:"Traduzir para",working:"Traduzindo…",price:"Ver preço desta tradução",ready:"Tradução concluída. Revise e baixe o resultado.",error:"Não foi possível concluir a tradução"},
 ar:{paste:"أو الصق نص الترجمة مباشرة",target:"الترجمة إلى",working:"جارٍ الترجمة…",price:"عرض سعر هذه الترجمة",ready:"اكتملت ترجمة الترجمة النصية. راجع النتيجة ثم نزّلها.",error:"تعذر إكمال الترجمة"}
};
const targets=["Simplified Chinese","Traditional Chinese","English","Japanese","Korean","Spanish","French","German"] as const;

export default function SubtitleTranslateWorkbench(){
 const{lang}=useLingxiLang();const c=C[lang]??C.en;
 const[files,setFiles]=useState<File[]>([]),[manual,setManual]=useState(""),[target,setTarget]=useState("Simplified Chinese"),[busy,setBusy]=useState(false),[results,setResults]=useState<Array<{name:string;text:string}>>([]),[error,setError]=useState("");
 const quantity=files.length||(manual.trim()?1:0);
 const exports=useMemo<ToolResultFile[]>(()=>results.map(r=>{const b=new Blob([r.text],{type:"text/plain;charset=utf-8"});return{name:`translated-${r.name}`,blob:b,mime:"text/plain",size:b.size}}),[results]);

 async function run(q:string){
  setBusy(true);setError("");setResults([]);
  try{
   const source=files.length?await Promise.all(files.map(async f=>({name:f.name,text:await f.text()}))):[{name:"manual.srt",text:manual}];
   const out=[] as Array<{name:string;text:string}>;
   for(let i=0;i<source.length;i++){
    const r=await fetch("/api/ai/subtitle-translate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId:q,itemKey:`subtitle-${i}`,targetLanguage:target,text:source[i].text})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||"Translation failed");
    if(typeof d.text!=="string"||!d.text.trim())throw new Error("EMPTY_TRANSLATION");
    out.push({name:source[i].name,text:d.text});
   }
   setResults(out);
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setBusy(false)}
 }

 return <div className="space-y-4">
  <FileDropzone accept=".srt,.vtt,text/plain" multiple maxFiles={20} maxSizeMB={5} files={files} onChange={f=>{setFiles(f);if(f.length)setManual("");setResults([]);setError("")}} disabled={busy} kind="subtitle"/>
  <div className="text-center text-xs text-[var(--lx-faint)]">{c.paste}</div>
  <textarea value={manual} onChange={e=>{setManual(e.target.value);if(e.target.value.trim())setFiles([]);setResults([])}} rows={8} className="w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 font-mono text-sm text-[var(--lx-ink)]"/>
  <label className="block text-sm text-[var(--lx-muted)]">{c.target}
   <select value={target} onChange={e=>setTarget(e.target.value)} className="ml-2 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2 text-[var(--lx-ink)]">{targets.map(x=><option key={x}>{x}</option>)}</select>
  </label>
  {busy?<button disabled className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] opacity-50">{c.working}</button>:quantity?<PaidActionButton toolId="subtitle-translate" quantity={quantity} metadata={{files:files.length||1}} onPaid={run} label={c.price}/>:null}
  {results.map(r=><section key={r.name} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4"><div className="mb-2 text-sm font-medium text-[var(--lx-ink)]">{r.name}</div><textarea value={r.text} readOnly rows={10} className="w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 font-mono text-sm text-[var(--lx-ink)]"/></section>)}
  {!!exports.length&&<ResultPanel files={exports} messageZh={c.ready} messageEn={c.ready}/>}
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>
}
