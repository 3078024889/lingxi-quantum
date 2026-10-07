"use client";
import {inferUnifiedSasiIntent} from '@/lib/sasi/core/unified-intent';
import type {SasiEntryMode} from './SasiUnifiedLauncher';
import Link from 'next/link';
import {functionMenuText} from '@/lib/sasi/function-menu-i18n';
import {EXPERIENCE_USED} from '@/lib/sasi/experience-status-copy';
import {SUPPLIER_BILLING_COPY} from "@/lib/sasi/prompt-flow-copy";
import {useEffect,useRef,useState} from 'react';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import {composerText} from '@/lib/sasi/composer-i18n';
import {sasiCommonText} from '@/lib/sasi/common-ui-copy';
import {SERVICE_REQUIRED} from '@/lib/sasi/research-ui-copy';
import {SasiComposerSurface,SasiComposerTextarea,SasiUserMessage} from './SasiComposerCore';
import {SasiAssistantText,SasiStatusLine} from './SasiResultCore';
import SasiFunctionMenu from './SasiFunctionMenu';
import {tryBrowserLocalText} from '@/lib/sasi/browser/local-text';
import SasiLocalIntelligenceAction from './SasiLocalIntelligenceAction';
import SasiUserResourceAction from './SasiUserResourceAction';
import {streamUserResourceText} from '@/lib/sasi/browser/user-resource-text';

export default function SasiPromptConversation({task,initialPrompt='',autoStart=false,onFiles,onTask}:{task:'chat'|'image';initialPrompt?:string;autoStart?:boolean;onFiles:(files:File[],prompt:string)=>void;onTask:(task:SasiEntryMode,prompt:string)=>void}){
 const {lang}=useLingxiLang(),ct=(key:Parameters<typeof composerText>[1])=>composerText(lang,key);
 const [prompt,setPrompt]=useState(initialPrompt),[functions,setFunctions]=useState<string[]>([]),[rights,setRights]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const [turns,setTurns]=useState<Array<{question:string;answer?:string;image?:string}>>([]),[quote,setQuote]=useState<{id:string;estimated_fen:number;question:string;currency:string}|null>(null);
 const [streaming,setStreaming]=useState<{question:string;answer:string}|null>(null);
 const [needsConnection,setNeedsConnection]=useState(false);const exhausted=useRef(false);
 const began=useRef(false);
 useEffect(()=>{if(autoStart&&!began.current){began.current=true;void send()}},[autoStart]);
 const lock=useRef(false),input=useRef<HTMLInputElement>(null),previous=useRef<string|undefined>(undefined);
 async function send(confirm=false){
  if(lock.current||(!confirm&&!prompt.trim()))return;
  if(!confirm){const text=prompt.trim(),intent=inferUnifiedSasiIntent(text,false);if(intent!==task&&intent!=='chat'){onTask(intent,text);return}if(task==='image'&&intent==='chat'){onTask('chat',text);return}}
  lock.current=true;setBusy(true);setNotice('');
  const question=confirm?quote?.question||'':prompt.trim();
  try{
   if(task==='chat'&&!confirm){
    const local=await tryBrowserLocalText({lang,messages:[
     ...turns.slice(-4).flatMap(t=>[{role:'user' as const,content:t.question},...(t.answer?[{role:'assistant' as const,content:t.answer}]:[])]),
     {role:'user',content:question}
    ]});
    if(local.kind==='answer'){setTurns(rows=>[...rows,{question,answer:local.answer}]);setPrompt('');return}
    const context=turns.length?turns.slice(-4).map(t=>'User: '+t.question+'\nAssistant: '+(t.answer||'')).join('\n').slice(-8000):'';
    let streamed="";
    const userResource=await streamUserResourceText({prompt:question,context,onDelta:delta=>{streamed+=delta;setStreaming({question,answer:streamed})}});
    if(userResource.kind==='answer'){setTurns(rows=>[...rows,{question,answer:userResource.answer}]);setStreaming(null);setPrompt('');return}
    setStreaming(null);
    const response=await fetch('/api/sasi/experience/text',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:context?context+'\nUser: '+question:question,task:'chat',allowConnected:false})});const data=await response.json();exhausted.current=data.experienceExhausted===true;
    if(response.ok&&data.state==='answer'){setTurns(rows=>[...rows,{question,answer:data.answer}]);setPrompt('');return}
   }
   if(task==='image'&&!rights){setNotice(ct('rightsRequired'));return}
   const response=await fetch('/api/sasi/byok/'+(task==='image'?'image':'text'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(confirm?{action:'confirm',taskId:quote?.id,acceptSupplierBilling:true}:task==='image'?{action:'quote',prompt:question,functions,rightsConfirmed:rights,aiLabelAcknowledged:rights}:{action:'quote',question,mode:'chat',functions,previousId:previous.current})});
   const data=await response.json();if(!response.ok){setNeedsConnection(/CONNECTION|PRICE/.test(data.error||''));setNotice(data.error==='AUTH_REQUIRED'?ct('loginRequired'):/CONNECTION|PRICE/.test(data.error||'')?(exhausted.current?EXPERIENCE_USED[lang]:SERVICE_REQUIRED[lang]):ct('supplierNeedsCheck'));return}
   if(!confirm){if(!data.task?.id)throw Error('QUOTE_MISSING');setQuote({...data.task,question,currency:data.billingCurrency||data.currency||'CNY'});setNotice(ct('confirm'));return}
   if(data.task?.state!=='succeeded'){setQuote(null);setNotice(ct('supplierNeedsCheck'));return}
   const output=data.task.output;if(task==='image'&&!output?.imageUrl||task==='chat'&&!output?.answer)throw Error('RESULT_MISSING');
   setTurns(rows=>[...rows,{question,answer:task==='chat'?output.answer:undefined,image:task==='image'?output.imageUrl:undefined}]);if(task==='chat')previous.current=data.task.id;setPrompt('');setQuote(null);
  }catch{setNotice(ct('supplierNeedsCheck'))}finally{lock.current=false;setBusy(false)}
 }
 return <section className="lx-sasi-layout flex min-h-[calc(100vh-152px)] flex-col pb-14">
  <div className="flex-1 pt-10">{turns.map((turn,i)=><div key={i} className="mb-8"><SasiUserMessage className="mb-6">{turn.question}</SasiUserMessage>{turn.answer&&<SasiAssistantText>{turn.answer}</SasiAssistantText>}{turn.image&&<div data-sasi-result-kind="image"><img src={turn.image} alt={turn.question} className="max-h-[68vh] max-w-full rounded-2xl"/><a href={turn.image} target="_blank" rel="noreferrer">{sasiCommonText(lang,'downloadResult')}</a></div>}</div>)}{streaming&&<div className="mb-8" data-sasi-streaming="true"><SasiUserMessage className="mb-6">{streaming.question}</SasiUserMessage><SasiAssistantText>{streaming.answer||"…"}</SasiAssistantText></div>}</div>
  <SasiComposerSurface dragging={false} className="sticky bottom-3"><SasiComposerTextarea value={prompt} disabled={busy} maxLength={task==='image'?3000:12000} aria-label={sasiCommonText(lang,'ask')} placeholder={sasiCommonText(lang,'ask')} onChange={e=>{setPrompt(e.target.value);setQuote(null)}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing&&e.keyCode!==229){e.preventDefault();void send()}}}/>
   <div className="flex items-center gap-2"><input type="file" ref={input} className="hidden" multiple onChange={e=>{if(e.target.files)onFiles(Array.from(e.target.files),prompt)}}/><SasiFunctionMenu task={task} selected={functions} onChange={ids=>{setFunctions(ids);setQuote(null)}} onUpload={task==='chat'?()=>input.current?.click():undefined} disabled={busy} extraContent={task==='chat'?<div className="grid gap-3"><SasiLocalIntelligenceAction/><SasiUserResourceAction/></div>:undefined}/>
   {quote&&<button disabled={busy} onClick={()=>void send(true)} className="rounded-full border px-3 py-2 text-xs">{ct('confirm')} {quote.currency==='USD'?'$':'¥'}{(Number(quote.estimated_fen)/100).toFixed(2)}</button>}
   <button aria-label={sasiCommonText(lang,'ask')} disabled={busy||!prompt.trim()} onClick={()=>void send()} className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-[var(--lx-ink)] text-[var(--lx-bg)] disabled:opacity-30">{busy?'…':'↑'}</button></div>

   {task==='image'&&<label className="flex gap-2 px-3 pt-2 text-xs text-[var(--lx-muted)]"><input type="checkbox" checked={rights} disabled={busy} onChange={e=>{setRights(e.target.checked);setQuote(null)}}/>{ct('rightsConsent')}</label>}{quote&&<p className="px-3 pt-2 text-xs text-[var(--lx-muted)]">{SUPPLIER_BILLING_COPY[lang]}</p>}<SasiStatusLine>{notice}</SasiStatusLine>{needsConnection&&<Link href="/sasi/connections" className="inline-block px-3 py-2 text-sm text-blue-600">{functionMenuText(lang,"connect")} →</Link>}
  </SasiComposerSurface>
 </section>;
}
