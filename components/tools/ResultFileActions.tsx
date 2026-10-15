"use client";
import {useEffect,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {plainText} from "@/lib/tools/plain-copy";
import {deliveryFile,downloadBlob,miniLikeEnvironment,privateMobilePreview,shareFile} from "@/lib/tools/shared/download";
import {fileDeliveryCopy} from "@/lib/tools/shared/file-delivery-copy";

export default function ResultFileActions({blob,name}:{blob:Blob;name:string}) {
 const {lang}=useLingxiLang(),c=fileDeliveryCopy(lang);
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState<number|null>(null),[help,setHelp]=useState(false),[audio,setAudio]=useState("");
 useEffect(()=>{setNotice(null);setHelp(false);const file=deliveryFile(blob,name);if(!file.type.startsWith("audio/")){setAudio("");return}const url=URL.createObjectURL(file);setAudio(url);return()=>URL.revokeObjectURL(url)},[blob,name]);
 async function save(){setBusy(true);try{await downloadBlob(blob,name);setNotice(5);if(miniLikeEnvironment())setHelp(true)}catch{setNotice(4);setHelp(true)}finally{setBusy(false)}}
 async function send(){setBusy(true);try{const outcome=await shareFile(blob,name);setNotice(outcome==="shared"?1:outcome==="cancelled"?2:outcome==="unsupported"?3:4);if(outcome!=="shared")setHelp(true)}finally{setBusy(false)}}
 async function temporary(){setBusy(true);try{await privateMobilePreview(blob,name)}catch{setNotice(10)}finally{setBusy(false)}}
 return <div className="min-w-0 w-full space-y-3" data-testid="result-file-actions">
  {audio&&<audio aria-label={name} className="block w-full max-w-full" controls preload="metadata" src={audio}/>}
  <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={save} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)]">{busy?plainText(lang,"working"):plainText(lang,"save")}</button><button type="button" disabled={busy} onClick={send} className="rounded-xl border border-[var(--lx-line)] px-5 py-2.5 text-sm">{c[0]}</button></div>
  {notice!==null&&<p role="status" className="break-words text-sm leading-6 text-[var(--lx-muted)]">{c[notice]}</p>}
  <details open={help} onToggle={e=>setHelp(e.currentTarget.open)} className="text-sm leading-6 text-[var(--lx-muted)]"><summary className="cursor-pointer">{c[6]}</summary><p className="mt-2">{c[7]}</p><p className="mt-3">{c[8]}</p><button type="button" disabled={busy} onClick={temporary} className="mt-2 rounded-xl border px-3 py-2 text-left">{c[9]}</button></details>
 </div>;
}
