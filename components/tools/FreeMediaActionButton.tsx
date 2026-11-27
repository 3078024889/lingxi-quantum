"use client";
import {useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {plainText} from "@/lib/tools/plain-copy";
const START={zh:"开始处理",en:"Start processing",ja:"処理を開始",ko:"처리 시작",fr:"Lancer le traitement",de:"Verarbeitung starten",es:"Iniciar procesamiento",pt:"Iniciar processamento",ar:"بدء المعالجة"};

export default function FreeMediaActionButton({disabled,onRun}:{disabled:boolean;onRun:()=>Promise<void>}){
 const {lang}=useLingxiLang();
 const lock=useRef(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function run(){
  if(disabled||lock.current)return;
  lock.current=true;setBusy(true);setError("");
  try{await onRun();}catch{setError(plainText(lang,"fileError"));}
  finally{lock.current=false;setBusy(false);}
 }
 return <div><button type="button" disabled={disabled||busy} onClick={()=>void run()} className="min-h-11 rounded-xl border border-[var(--lx-line)] px-5 py-3 disabled:opacity-40">{busy?plainText(lang,"working"):START[lang]||START.en}</button>{error&&<p role="alert" className="mt-2 text-sm">{error}</p>}</div>;
}
