"use client";
import {inferUnifiedSasiIntent} from "@/lib/sasi/core/unified-intent";
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

async function receiveSasiStream(response:Response,onDelta:(answer:string)=>void):Promise<any>{
 if(!response.headers.get("content-type")?.includes("text/event-stream"))return response.json();
 if(!response.body)throw Error("SASI_STREAM_MISSING");
 const reader=response.body.getReader(),decoder=new TextDecoder();
 let buffer="",answer="",completed:any=null;
 function process(frame:string){
  const lines=frame.split("\n"),kind=lines.find(x=>x.startsWith("event:"))?.slice(6).trim();
  const source=lines.filter(x=>x.startsWith("data:")).map(x=>x.slice(5).trim()).join("\n");
  if(!source)return;
  let payload:any;try{payload=JSON.parse(source)}catch{return}
  if(kind==="reset"){answer="";onDelta("");return}
  if(kind==="delta"&&typeof payload.text==="string"){answer+=payload.text;onDelta(answer)}
  if(kind==="done")completed=payload;
 }
 try{
  while(true){
   const next=await reader.read();if(next.done)break;
   buffer+=decoder.decode(next.value,{stream:true}).replace(/\r\n/g,"\n");
   let pos;
   while((pos=buffer.indexOf("\n\n"))>=0){process(buffer.slice(0,pos));buffer=buffer.slice(pos+2)}
   if(buffer.length>1024*1024)throw Error("SASI_STREAM_BUFFER_LIMIT");
  }
  if(buffer.trim())process(buffer);
  if(!completed)throw Error("SASI_STREAM_INTERRUPTED");
  return completed;
 }finally{reader.releaseLock()}
}

export default function SasiPromptConversation({task,initialPrompt='',autoStart=false,onFiles,onTask}:{task:'chat'|'image';initialPrompt?:string;autoStart?:boolean;onFiles:(files:File[],prompt:string)=>void;onTask:(task:SasiEntryMode,prompt:string)=>void}){
 const {lang}=useLingxiLang(),ct=(key:Parameters<typeof composerText>[1])=>composerText(lang,key);
 const [prompt,setPrompt]=useState(initialPrompt),[functions,setFunctions]=useState<string[]>([]),[rights,setRights]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const [turns,setTurns]=useState<Array<{question:string;answer?:string;image?:string}>>([]),[quote,setQuote]=useState<{id:string;estimated_fen:number;question:string;currency:string}|null>(null);
 const [streaming,setStreaming]=useState<{question:string;answer:string}|null>(null);
 const [needsConnection,setNeedsConnection]=useState(false);const exhausted=useRef(false);
 const threadRef=useRef("");
 const sentRef=useRef(false);
 useEffect(()=>{
  if(task!=="chat")return;
  let cancelled=false;
  void fetch("/api/sasi/conversations",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{
   if(cancelled||sentRef.current||!data)return;
   if(typeof data.threadId==="string")threadRef.current=data.threadId;
   const rows:Array<{question:string;answer?:string}>=[];
   const userMessages=new Map<string,{question:string;answer?:string}>();
   for(const message of Array.isArray(data.messages)?data.messages:[]){
    if(message.role==="user"&&typeof message.content==="string"&&typeof message.id==="string"){
     const row={question:message.content} as {question:string;answer?:string};
     rows.push(row);userMessages.set(message.id,row);
    }
   }
   for(const message of Array.isArray(data.messages)?data.messages:[]){
    if(message.role==="assistant"&&typeof message.content==="string"&&typeof message.parent_id==="string"){
     const row=userMessages.get(message.parent_id);
     if(row&&!row.answer)row.answer=message.content;
    }
   }
   if(rows.length)setTurns(rows.slice(-40));
  }).catch(()=>{});
  return()=>{cancelled=true};
 },[task]);
 function commitText(question:string,answer:string){
  setTurns(rows=>[...rows,{question,answer}]);setPrompt("");
  if(task!=="chat")return;
  const threadId=threadRef.current||crypto.randomUUID();
  threadRef.current=threadId;
  const payload=JSON.stringify({threadId,requestId:crypto.randomUUID(),question,answer});
  void (async()=>{
   for(let attempt=0;attempt<3;attempt++){
    try{
     const response=await fetch("/api/sasi/conversations",{method:"POST",headers:{"content-type":"application/json"},body:payload,cache:"no-store"});
     if(response.ok||response.status===401)return; // Guests keep their in-page conversation.
     if(response.status!==429&&response.status<500){setNotice(lang==="zh"?"这条对话暂未保存，当前页面仍可继续查看。":"This conversation has not been saved yet.");return}
    }catch{}
    if(attempt<2)await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));
   }
   setNotice(lang==="zh"?"这条对话暂未保存，当前页面仍可继续查看。":"This conversation has not been saved yet.");
  })();
 }
 const began=useRef(false);
 useEffect(()=>{if(autoStart&&!began.current){began.current=true;void send()}},[autoStart]);
 const lock=useRef(false),input=useRef<HTMLInputElement>(null),previous=useRef<string|undefined>(undefined);
 async function send(confirm=false){
  if(lock.current||(!confirm&&!prompt.trim()))return;
  // Switching workspaces must be a user decision, never an automatic keyword redirect.
  sentRef.current=true;lock.current=true;setBusy(true);setNotice('');
  const question=confirm?quote?.question||'':prompt.trim();
  try{
   if(task==='chat'&&!confirm){
    const local=await tryBrowserLocalText({lang,messages:[
     ...turns.slice(-12).flatMap(t=>[{role:'user' as const,content:t.question},...(t.answer?[{role:'assistant' as const,content:t.answer}]:[])]),
     {role:'user',content:question}
    ]});
    if(local.kind==='answer'){commitText(question,local.answer);return}
    const context=turns.length?turns.slice(-12).map(t=>'User: '+t.question+'\nAssistant: '+(t.answer||'')).join('\n').slice(-16000):'';
    let streamed="";
    const userResource=await streamUserResourceText({prompt:question,context,onDelta:delta=>{streamed+=delta;setStreaming({question,answer:streamed})}});
    if(userResource.kind==='answer'){commitText(question,userResource.answer);setStreaming(null);return}
    setStreaming(null);
    const response=await fetch('/api/sasi/experience/text',{method:'POST',headers:{'content-type':'application/json','accept':'text/event-stream'},body:JSON.stringify({text:question,history:turns.slice(-12).flatMap(t=>[{role:'user',content:t.question},...(t.answer?[{role:'assistant',content:t.answer}]:[])]),task:'chat',allowConnected:false})});
    const data=await receiveSasiStream(response,answer=>setStreaming(answer?{question,answer}:null));
    exhausted.current=data.experienceExhausted===true;
    if(response.ok&&data.state==='answer'){setStreaming(null);commitText(question,data.answer);return}
    setStreaming(null);
   }
   if(task==='image'&&!rights){setNotice(ct('rightsRequired'));return}
   const response=await fetch('/api/sasi/byok/'+(task==='image'?'image':'text'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(confirm?{action:'confirm',taskId:quote?.id,acceptSupplierBilling:true}:task==='image'?{action:'quote',prompt:question,functions,rightsConfirmed:rights,aiLabelAcknowledged:rights}:{action:'quote',question,mode:'chat',functions,previousId:previous.current})});
   const data=await response.json();if(!response.ok){setNeedsConnection(/CONNECTION|PRICE/.test(data.error||''));setNotice(data.error==='AUTH_REQUIRED'?ct('loginRequired'):/CONNECTION|PRICE/.test(data.error||'')?(exhausted.current?EXPERIENCE_USED[lang]:SERVICE_REQUIRED[lang]):ct('supplierNeedsCheck'));return}
   if(!confirm){if(!data.task?.id)throw Error('QUOTE_MISSING');setQuote({...data.task,question,currency:data.billingCurrency||data.currency||'CNY'});setNotice(ct('confirm'));return}
   if(data.task?.state!=='succeeded'){setQuote(null);setNotice(ct('supplierNeedsCheck'));return}
   const output=data.task.output;if(task==='image'&&!output?.imageUrl||task==='chat'&&!output?.answer)throw Error('RESULT_MISSING');
   if(task==='chat'){commitText(question,output.answer);previous.current=data.task.id}else{setTurns(rows=>[...rows,{question,image:output.imageUrl}]);setPrompt('')}setQuote(null);
  }catch{setNotice(ct('supplierNeedsCheck'))}finally{lock.current=false;setBusy(false)}
 }
 return <section className="lx-sasi-layout flex min-h-[calc(100vh-152px)] flex-col pb-14">
  <div className="flex-1 pt-10">{turns.map((turn,i)=><div key={i} className="mb-8"><SasiUserMessage className="mb-6">{turn.question}</SasiUserMessage>{turn.answer&&<SasiAssistantText>{turn.answer}</SasiAssistantText>}{task==="chat"&&turn.answer&&(() => { const destination=inferUnifiedSasiIntent(turn.question,false); return destination!=="chat"&&destination!=="image"?<button type="button" onClick={()=>onTask(destination,turn.question)} className="mt-3 rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm text-[var(--lx-ink)] hover:bg-[var(--lx-soft)]">{lang==="zh"?"继续制作":lang==="ja"?"制作を続ける":lang==="ko"?"제작 계속하기":lang==="fr"?"Continuer la création":lang==="de"?"Weiter erstellen":lang==="es"?"Continuar creando":lang==="pt"?"Continuar a criar":lang==="ar"?"متابعة الإنشاء":"Continue creating"} →</button>:null; })()}{turn.image&&<div data-sasi-result-kind="image"><img src={turn.image} alt={turn.question} className="max-h-[68vh] max-w-full rounded-2xl"/><a href={turn.image} target="_blank" rel="noreferrer">{sasiCommonText(lang,'downloadResult')}</a></div>}</div>)}{streaming&&<div className="mb-8" data-sasi-streaming="true"><SasiUserMessage className="mb-6">{streaming.question}</SasiUserMessage><SasiAssistantText>{streaming.answer||"…"}</SasiAssistantText></div>}</div>
  <SasiComposerSurface dragging={false} className="sticky bottom-3"><SasiComposerTextarea value={prompt} disabled={busy} maxLength={task==='image'?3000:12000} aria-label={sasiCommonText(lang,'ask')} placeholder={sasiCommonText(lang,'ask')} onChange={e=>{setPrompt(e.target.value);setQuote(null)}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing&&e.keyCode!==229){e.preventDefault();void send()}}}/>
   <div className="flex items-center gap-2"><input type="file" ref={input} className="hidden" multiple onChange={e=>{if(e.target.files)onFiles(Array.from(e.target.files),prompt)}}/><SasiFunctionMenu task={task} selected={functions} onChange={ids=>{setFunctions(ids);setQuote(null)}} onUpload={task==='chat'?()=>input.current?.click():undefined} disabled={busy} extraContent={task==='chat'?<div className="grid gap-3"><SasiLocalIntelligenceAction/><SasiUserResourceAction/></div>:undefined}/>
   {quote&&<button disabled={busy} onClick={()=>void send(true)} className="rounded-full border px-3 py-2 text-xs">{ct('confirm')} {quote.currency==='USD'?'$':'¥'}{(Number(quote.estimated_fen)/100).toFixed(2)}</button>}
   <button aria-label={sasiCommonText(lang,'ask')} disabled={busy||!prompt.trim()} onClick={()=>void send()} className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-[var(--lx-ink)] text-[var(--lx-bg)] disabled:opacity-30">{busy?'…':'↑'}</button></div>

   {task==='image'&&<label className="flex gap-2 px-3 pt-2 text-xs text-[var(--lx-muted)]"><input type="checkbox" checked={rights} disabled={busy} onChange={e=>{setRights(e.target.checked);setQuote(null)}}/>{ct('rightsConsent')}</label>}{quote&&<p className="px-3 pt-2 text-xs text-[var(--lx-muted)]">{SUPPLIER_BILLING_COPY[lang]}</p>}<SasiStatusLine>{notice}</SasiStatusLine>{needsConnection&&<Link href="/sasi/connections" className="inline-block px-3 py-2 text-sm text-blue-600">{functionMenuText(lang,"connect")} →</Link>}
  </SasiComposerSurface>
 </section>;
}
