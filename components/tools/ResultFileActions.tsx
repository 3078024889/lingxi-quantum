"use client";
import {useEffect,useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {plainText} from "@/lib/tools/plain-copy";
import {deliveryFile,downloadBlob,miniLikeEnvironment,privateMobilePreview,prepareAuthorizedFileShare,type FileShareOutcome} from "@/lib/tools/shared/download";
import {fileDeliveryCopy} from "@/lib/tools/shared/file-delivery-copy";

export default function ResultFileActions({blob,name,saveLabel}:{blob:Blob;name:string;saveLabel?:string}) {
 const {lang}=useLingxiLang(),c=fileDeliveryCopy(lang);
 const readyShare=useRef<null|(()=>Promise<FileShareOutcome>)>(null);
 const shareVersion=useRef(0);
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState<number|null>(null),[help,setHelp]=useState(false),[audio,setAudio]=useState(""),[mediaType,setMediaType]=useState(""),[shareReady,setShareReady]=useState(false);
 useEffect(()=>{
  shareVersion.current++;setNotice(null);setHelp(false);setShareReady(false);readyShare.current=null;
  const file=deliveryFile(blob,name);setMediaType(file.type);
  const url=/^(audio|video)\//.test(file.type)?URL.createObjectURL(file):"";setAudio(url);
  return()=>{shareVersion.current++;readyShare.current=null;if(url)URL.revokeObjectURL(url)};
 },[blob,name]);
 async function save(){setBusy(true);try{await downloadBlob(blob,name);setNotice(5);if(miniLikeEnvironment())setHelp(true)}catch{setNotice(4);setHelp(true)}finally{setBusy(false)}}
 async function send(){setBusy(true);try{
  const file=deliveryFile(blob,name);
  if(!navigator.share||!navigator.canShare||!navigator.canShare({files:[file]})){setNotice(3);setHelp(true);return}
  // Payment/allowance dialogs may consume the transient user activation required by Web Share.
  // Authorize on the first click; perform the native share on a fresh click.
  if(!readyShare.current){const version=shareVersion.current,prepared=await prepareAuthorizedFileShare(blob,name);if(version!==shareVersion.current)return;readyShare.current=prepared;setShareReady(true);setNotice(null);return}
  const outcome=await readyShare.current();
  setNotice(outcome==="shared"?1:outcome==="cancelled"?2:outcome==="unsupported"?3:4);
  if(outcome!=="shared")setHelp(true);
 }catch{setNotice(4);setHelp(true)}finally{setBusy(false)}}
 async function temporary(){setBusy(true);try{await privateMobilePreview(blob,name)}catch{setNotice(10)}finally{setBusy(false)}}
 return <div className="min-w-0 w-full space-y-3" data-testid="result-file-actions">
  {audio&&mediaType.startsWith("video/")&&<video aria-label={name} className="block w-full max-w-full rounded-xl" controls playsInline preload="metadata" src={audio}/>}{audio&&mediaType.startsWith("audio/")&&<audio aria-label={name} className="block w-full max-w-full" controls preload="metadata" src={audio}/>}
  <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={save} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)]">{busy?plainText(lang,"working"):(saveLabel||plainText(lang,"save"))}</button><button type="button" disabled={busy} onClick={send} className="rounded-xl border border-[var(--lx-line)] px-5 py-2.5 text-sm">{shareReady?(lang==="zh"?"继续分享":lang==="ja"?"共有する":lang==="ko"?"공유하기":lang==="fr"?"Partager":lang==="de"?"Teilen":lang==="es"?"Compartir":lang==="pt"?"Compartilhar":lang==="ar"?"مشاركة":"Share now"):c[0]}</button></div>
  {notice!==null&&<p role="status" className="break-words text-sm leading-6 text-[var(--lx-muted)]">{c[notice]}</p>}
  <details open={help} onToggle={e=>setHelp(e.currentTarget.open)} className="text-sm leading-6 text-[var(--lx-muted)]"><summary className="cursor-pointer">{c[6]}</summary><p className="mt-2">{c[7]}</p><p className="mt-3">{c[8]}</p><button type="button" disabled={busy} onClick={temporary} className="mt-2 rounded-xl border px-3 py-2 text-left">{c[9]}</button></details>
 </div>;
}
