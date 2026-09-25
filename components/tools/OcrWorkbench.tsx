"use client";
import {useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import ResultPanel from "@/components/tools/ResultPanel";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

type Copy={language:string;run:string;batch:string;working:string;done:string;copy:string;copied:string;result:string;download:string;error:string};
const C:Record<LingxiLang,Copy>={
 zh:{language:"识别语言",run:"提取文字",batch:"批量提取文字",working:"正在识别…",done:"文字已经提取，可以核对、复制或下载。",copy:"复制文字",copied:"已复制",result:"识别结果",download:"下载结果",error:"识别没有完成"},
 en:{language:"Recognition language",run:"Extract text",batch:"Extract text from batch",working:"Recognizing…",done:"Text extracted. Review, copy or download the result.",copy:"Copy text",copied:"Copied",result:"Recognition result",download:"Download result",error:"Recognition did not finish"},
 ja:{language:"認識言語",run:"文字を抽出",batch:"一括で文字を抽出",working:"認識中…",done:"文字を抽出しました。確認、コピー、ダウンロードできます。",copy:"文字をコピー",copied:"コピーしました",result:"認識結果",download:"結果をダウンロード",error:"認識を完了できませんでした"},
 ko:{language:"인식 언어",run:"텍스트 추출",batch:"일괄 텍스트 추출",working:"인식 중…",done:"텍스트를 추출했습니다. 확인, 복사 또는 다운로드할 수 있습니다.",copy:"텍스트 복사",copied:"복사됨",result:"인식 결과",download:"결과 다운로드",error:"인식을 완료하지 못했습니다"},
 fr:{language:"Langue de reconnaissance",run:"Extraire le texte",batch:"Extraire le texte par lot",working:"Reconnaissance…",done:"Texte extrait. Vérifiez, copiez ou téléchargez le résultat.",copy:"Copier le texte",copied:"Copié",result:"Résultat OCR",download:"Télécharger",error:"La reconnaissance n’a pas abouti"},
 de:{language:"Erkennungssprache",run:"Text extrahieren",batch:"Text stapelweise extrahieren",working:"Erkennung läuft…",done:"Text extrahiert. Ergebnis prüfen, kopieren oder herunterladen.",copy:"Text kopieren",copied:"Kopiert",result:"Erkennungsergebnis",download:"Ergebnis herunterladen",error:"Erkennung konnte nicht abgeschlossen werden"},
 es:{language:"Idioma de reconocimiento",run:"Extraer texto",batch:"Extraer texto por lotes",working:"Reconociendo…",done:"Texto extraído. Revisa, copia o descarga el resultado.",copy:"Copiar texto",copied:"Copiado",result:"Resultado OCR",download:"Descargar resultado",error:"No se pudo completar el reconocimiento"},
 pt:{language:"Idioma de reconhecimento",run:"Extrair texto",batch:"Extrair texto em lote",working:"Reconhecendo…",done:"Texto extraído. Revise, copie ou baixe o resultado.",copy:"Copiar texto",copied:"Copiado",result:"Resultado OCR",download:"Baixar resultado",error:"Não foi possível concluir o reconhecimento"},
 ar:{language:"لغة التعرّف",run:"استخراج النص",batch:"استخراج النص دفعة واحدة",working:"جارٍ التعرّف…",done:"تم استخراج النص. يمكنك مراجعته أو نسخه أو تنزيله.",copy:"نسخ النص",copied:"تم النسخ",result:"نتيجة التعرّف",download:"تنزيل النتيجة",error:"تعذر إكمال التعرّف"}
};

export default function OcrWorkbench(){
 const{lang}=useLingxiLang();const c=C[lang]??C.en;
 const[files,setFiles]=useState<File[]>([]),[ocrLang,setOcrLang]=useState("chi_sim+eng"),[results,setResults]=useState<Array<{name:string;text:string}>>([]),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[copied,setCopied]=useState("");
 const exports=useMemo<ToolResultFile[]>(()=>results.map(r=>{
   const blob=new Blob([r.text],{type:"text/plain;charset=utf-8"});
   return {name:r.name.replace(/\.[^.]+$/,"")+".txt",blob,mime:"text/plain",size:blob.size};
 }),[results]);

 async function run(){
  if(!files.length)return;
  setBusy(true);setResults([]);setError("");setCopied("");let worker:any=null;
  try{
   const{createWorker}=await import("tesseract.js");
   worker=await createWorker(ocrLang,undefined,{logger:m=>{if(m.status)setStage(`${m.status}${typeof m.progress==="number"?` · ${Math.round(m.progress*100)}%`:""}`)}});
   const out:Array<{name:string;text:string}>=[];
   for(let i=0;i<files.length;i++){
     setStage(`${i+1}/${files.length} · ${files[i].name}`);
     const r=await worker.recognize(files[i]);
     out.push({name:files[i].name,text:r.data.text});
   }
   setResults(out);setStage(c.done);
  }catch(e){setError(e instanceof Error?e.message:String(e));setStage("")}
  finally{try{await worker?.terminate()}catch{}setBusy(false)}
 }

 async function copy(name:string,text:string){
  try{await navigator.clipboard.writeText(text);setCopied(name);setTimeout(()=>setCopied(""),1600)}catch{}
 }

 return <div className="space-y-4">
  <FileDropzone accept="image/*" multiple maxFiles={30} maxSizeMB={30} files={files} onChange={setFiles} disabled={busy} kind="image"/>
  <label className="block text-sm text-[var(--lx-muted)]">{c.language}
   <select value={ocrLang} onChange={e=>setOcrLang(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2.5 text-[var(--lx-ink)] outline-none focus:border-[var(--lx-line-strong)]">
    <option value="chi_sim+eng">简体中文 + English</option><option value="chi_tra+eng">繁體中文 + English</option><option value="eng">English</option><option value="jpn+eng">日本語 + English</option><option value="kor+eng">한국어 + English</option><option value="fra+eng">Français + English</option><option value="deu+eng">Deutsch + English</option><option value="spa+eng">Español + English</option>
   </select>
  </label>
  <div className="flex flex-wrap items-center gap-3">
   <button disabled={!files.length||busy} onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?c.working:files.length>1?`${c.batch} · ${files.length}`:c.run}</button>
   {stage&&<span className="text-sm text-[var(--lx-faint)]">{stage}</span>}
  </div>

  {results.map(r=><section key={r.name} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <div><p className="text-xs text-[var(--lx-faint)]">{c.result}</p><div className="mt-1 text-sm font-medium text-[var(--lx-ink)]">{r.name}</div></div>
    <button onClick={()=>void copy(r.name,r.text)} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-2 text-sm text-[var(--lx-ink)]">{copied===r.name?c.copied:c.copy}</button>
   </div>
   <textarea value={r.text} readOnly rows={10} className="mt-3 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 font-mono text-sm text-[var(--lx-ink)]"/>
  </section>)}

  {!!exports.length&&<ResultPanel files={exports} messageZh={c.done} messageEn={c.done}/>}
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-danger)]">{c.error} · {error}</p>}
 </div>;
}
