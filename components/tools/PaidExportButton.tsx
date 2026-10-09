"use client";
import {plainText,plainMessage} from "@/lib/tools/plain-copy";
import {isMiniProgramContext,miniVirtualPaymentAvailable} from "@/lib/mini/payment-client";

import{useEffect,useRef,useState}from"react";
import{useLingxiLang}from"@/lib/lingxi-i18n";
import{usePreferredCurrency}from"@/components/CurrencyPreferenceProvider";
import type{PaidTaskPhase}from"@/lib/tools/commerce/paid-task-state";
import {deliveryText} from '@/lib/tools/commerce/delivery-copy';
import {quoteDisplay} from '@/lib/tools/commerce/quote-display';

type Quote={
 id:string;tool_id?:string;toolId?:string;quantity:number;unit_name?:string;unitName?:string;
 amount_rmb?:number;amountRmb?:number;amount_usd?:number;amountUsd?:number;
 currency?:"CNY"|"USD";display_currency?:"CNY"|"USD";displayCurrency?:"CNY"|"USD";
 display_amount?:number;displayAmount?:number;expires_at?:string;expiresAt?:string;
 metadata?:Record<string,unknown>
};
type Grant={consumed_at?:string|null;consumedAt?:string|null};
const POLL_MS=1800,MAX_POLL_FAILURES=4;
function key(toolId:string){return`lingxifield:paid-export:quote:${toolId}`}
function save(toolId:string,q:Quote,draftId?:string){try{localStorage.setItem(key(toolId),JSON.stringify({id:q.id,toolId,quantity:q.quantity,currency:q.currency,expiresAt:q.expires_at||q.expiresAt,draftId:draftId||""}))}catch{}}
function clear(toolId:string){try{localStorage.removeItem(key(toolId))}catch{}}
function isConsumed(g:Grant|undefined){return Boolean(g?.consumed_at||g?.consumedAt)}
function isMini(){return isMiniProgramContext()}
function clearResume(){try{const u=new URL(location.href);u.searchParams.delete("resumeQuote");u.searchParams.delete("resumeDraft");history.replaceState(null,"",u.pathname+(u.search?u.search:"")+u.hash)}catch{}}
async function openMiniPay(id:string){return new Promise<boolean>(resolve=>{let done=false;const finish=(v:boolean)=>{if(done)return;done=true;resolve(v)},go=()=>{const wx=(window as any).wx;if(!wx?.miniProgram?.navigateTo){finish(false);return}wx.miniProgram.navigateTo({url:`/pages/pay/index?quoteId=${encodeURIComponent(id)}`,success:()=>finish(true),fail:()=>finish(false)})};if((window as any).wx?.miniProgram){go();return}const s=document.createElement("script");s.src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js";s.async=true;s.onload=go;s.onerror=()=>finish(false);document.head.appendChild(s);setTimeout(()=>finish(false),3500)})}

export default function PaidExportButton({toolId,quantity,onUnlocked,onCompleted,label,draftId,metadata,beforePayment,disabled=false}:{toolId:string;quantity:number;onUnlocked:()=>Promise<void>|void;onCompleted?:()=>Promise<void>|void;label?:string;draftId?:string;metadata?:Record<string,unknown>;beforePayment?:()=>Promise<void>;disabled?:boolean}){
 const{lang}=useLingxiLang();const{currency}=usePreferredCurrency();
 const[quote,setQuote]=useState<Quote|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState(""),[phase,setPhase]=useState<PaidTaskPhase>("idle");
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),processing=useRef<string|null>(null),fails=useRef(0),completedQuote=useRef<string|null>(null),generated=useRef(new Set<string>()),checking=useRef(false);
 const [paidId,setPaidId]=useState('');
 const tx=(key:Parameters<typeof deliveryText>[1])=>deliveryText(lang,key);
 const stop=()=>{if(timer.current){clearInterval(timer.current);timer.current=null}fails.current=0};

 async function finishExisting(id:string){
  if(completedQuote.current===id)return;
  completedQuote.current=id;stop();clear(toolId);clearResume();setQuote(null);setPhase("completed");
  setMsg(tx('existing'));
  await onCompleted?.();
 }

 async function unlock(id:string){
  if(processing.current===id||completedQuote.current===id)return;
  processing.current=id;stop();setPhase("generating");
  try{
   setPaidId(id);setMsg(tx('generating'));
   if(!generated.current.has(id)){await onUnlocked();generated.current.add(id);}
   const c=await fetch("/api/tools/export/consume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId:id,draftId:draftId||null})});
   const x=await c.json().catch(()=>({})) as{ok?:boolean;alreadyCompleted?:boolean;error?:string};
   if(x.alreadyCompleted){await finishExisting(id);return}
   if(!c.ok)throw new Error(x.error||"EXPORT_CONSUME_FAILED");
   completedQuote.current=id;clear(toolId);clearResume();setQuote(null);setPhase("completed");
   setMsg(tx('ready'));
   await onCompleted?.();
  }catch{setPhase("error");setMsg(tx('failed'))}
  finally{processing.current=null}
 }

 async function check(id:string){
  if(checking.current||completedQuote.current===id)return false;
  checking.current=true;
  try{return await (navigator.locks?navigator.locks.request(`lingxi-export:${id}`,()=>checkLocked(id)):checkLocked(id));}
  finally{checking.current=false}
 }
 async function checkLocked(id:string){
  try{
   const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(id)}`,{cache:"no-store"});if(!r.ok)throw new Error();
   const d=await r.json();fails.current=0;
   if(!d?.paid)return false;
   const q=d.quote as Quote|undefined;if(q)setQuote(q);
   const legacyPdf=Boolean(q&&['pdf-editor','e-sign-pdf'].includes(toolId)&&(q.unit_name||q.unitName)==='page'&&Number(q.quantity)===Number(metadata?.pages)&&Number(metadata?.pages)>0);
   if(q&&((q.tool_id||q.toolId)!==toolId||(Number(q.quantity)!==quantity&&!legacyPdf)||(q.metadata?.draftId&&q.metadata.draftId!==draftId))){stop();setPaidId(id);setPhase('error');setMsg(tx('failed'));return false;}
   if(isConsumed(d.grant as Grant|undefined)){await finishExisting(id);return true}
   setPhase("paid");await unlock(id);return true;
  }catch{fails.current++;if(fails.current>=MAX_POLL_FAILURES){stop();setMsg(plainText(lang,"paymentStatus"))}return false}
 }
 const checkRef=useRef(check);checkRef.current=check;

 useEffect(()=>{stop();completedQuote.current=null;setPaidId('');setPhase("idle");setQuote(null);setMsg("")},[toolId,draftId,quantity,currency]);
 useEffect(()=>{const wake=()=>{if(document.visibilityState==="visible"&&quote?.id)void checkRef.current(quote.id)};window.addEventListener("pageshow",wake);document.addEventListener("visibilitychange",wake);return()=>{window.removeEventListener("pageshow",wake);document.removeEventListener("visibilitychange",wake);if(timer.current){clearInterval(timer.current);timer.current=null}}},[quote?.id]);
 useEffect(()=>{let id=new URLSearchParams(location.search).get("resumeQuote")||"";if(!id){try{const raw=localStorage.getItem(key(toolId));if(raw){const x=JSON.parse(raw);if(Number(x.quantity)===Number(quantity)&&(x.currency===currency||!x.currency)&&(x.draftId===draftId||!x.draftId||!draftId))id=String(x.id||"")}}catch{}}if(id)void checkRef.current(id)},[toolId,quantity,currency,draftId]);

 async function start(){
  if(disabled||busy||!Number.isSafeInteger(quantity)||quantity<=0)return;
  if(paidId){await check(paidId);return}
  if(phase==="completed"||phase==="generating")return;
  if(isMini()&&(currency!=="CNY"||!await miniVirtualPaymentAvailable())){setMsg(lang==="zh"?"小程序内付费暂未开放，已有订单仍可查看。":"Payments in the mini program are temporarily unavailable. Existing orders remain available.");return}
  setBusy(true);setMsg("");setPhase("pricing");
  try{
   try{await beforePayment?.()}catch{setPhase("error");setMsg(tx("draftSaveFailed"));return}
   let q=quote;const expires=q?.expires_at||q?.expiresAt;
   if(!q||Number(q.quantity)!==quantity||(expires&&new Date(expires).getTime()<=Date.now())){
    const r=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({toolId,quantity,currency,metadata:{...(metadata||{}),draftId:draftId||undefined,returnPath:location.pathname}})});
    const d=await r.json().catch(()=>({})) as Quote&{error?:string};if(!r.ok||!d.id)throw new Error(d.error||plainText(lang,"paymentError"));q=d;setQuote(q);
   }
   setPhase("quoted");save(toolId,q,draftId);setPhase("waitingPayment");
   if(isMini()&&currency==="CNY"){setMsg(plainText(lang,"openingPayment"));if(await openMiniPay(q.id)){stop();timer.current=setInterval(()=>void check(q!.id),POLL_MS)}else{setMsg(lang==="zh"?"请返回小程序重试，未发起付款。":"Return to the mini program and try again. No payment was started.")}return}
   const u=new URL(location.href);if(draftId)u.searchParams.set("resumeDraft",draftId);u.searchParams.set("resumeQuote",q.id);
   const payUrl=`/tools/pay?quoteId=${encodeURIComponent(q.id)}&return=${encodeURIComponent(u.pathname+u.search)}`;
   const w=window.open(payUrl,"lingxi_tool_pay","width=720,height=820");
   if(w){stop();timer.current=setInterval(()=>void check(q!.id),POLL_MS);setMsg(tx('waiting'));return}
   if(draftId){location.assign(payUrl);return}
   setPhase("quoted");setMsg(tx('popup'));
  }catch(e){setPhase("error");setMsg(plainText(lang,"paymentError"))}finally{setBusy(false)}
 }

 const amount=quote?quoteDisplay(quote,currency).text:'';
 if(phase==="completed")return <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-sm"><b>{tx('complete')}</b><p className="mt-1 text-[var(--lx-muted)]">{msg}</p></div>;
 return <div><button data-testid="paid-export-start" onClick={start} disabled={disabled||busy||!Number.isSafeInteger(quantity)||quantity<=0||phase==="generating"} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?tx('pricing'):paidId?tx('retry'):(label||tx('confirm'))}</button>{amount&&<span className="ml-3 text-sm text-[var(--lx-muted)]">{amount}</span>}{msg&&<p className="mt-2 text-xs leading-5 text-[var(--lx-muted)]">{msg}</p>}</div>
}
