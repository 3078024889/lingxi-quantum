"use client";

import { useEffect, useRef, useState } from "react";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";
import { usePreferredCurrency } from "@/components/CurrencyPreferenceProvider";

type Quote={id:string;tool_id:string;quantity:number;unit_name:string;amount_rmb:number;amount_usd:number;display_currency:"CNY"|"USD";display_amount:number;currency:"CNY"|"USD";expires_at:string;status?:string};
type StoredQuote={id:string;toolId:string;quantity:number;currency:"CNY"|"USD";expiresAt:string};
type Copy=Record<LingxiLang,string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});
const UI={
 defaultLabel:c("继续","Continue","続ける","계속","Continuer","Weiter","Continuar","Continuar","متابعة"),
 paid:c("支付已确认，开始处理…","Payment confirmed. Processing…","支払いを確認しました。処理を開始します…","결제가 확인되었습니다. 처리 중…","Paiement confirmé. Traitement…","Zahlung bestätigt. Verarbeitung…","Pago confirmado. Procesando…","Pagamento confirmado. Processando…","تم تأكيد الدفع. جارٍ المعالجة…"),
 pricing:c("正在确认本次价格…","Confirming price…","価格確認中…","가격 확인 중…","Confirmation du prix…","Preis wird bestätigt…","Confirmando precio…","Confirmando preço…","جارٍ تأكيد السعر…"),
 priced:c("价格已确认，付款后立即继续。","Price confirmed. Continue after payment.","価格を確認しました。","가격이 확인되었습니다.","Prix confirmé.","Preis bestätigt.","Precio confirmado.","Preço confirmado.","تم تأكيد السعر."),
 waiting:c("等待支付确认…返回后会自动继续。","Waiting for payment… It will continue when you return.","支払い確認待ち…","결제 확인 대기 중…","En attente du paiement…","Warten auf Zahlung…","Esperando el pago…","Aguardando pagamento…","بانتظار الدفع…"),
 thisTime:c("本次","This time","今回","이번","Cette fois","Diesmal","Esta vez","Desta vez","هذه المرة"),
 confirm:c("确认并支付","Confirm & pay","確認して支払う","확인 후 결제","Confirmer et payer","Bestätigen & bezahlen","Confirmar y pagar","Confirmar e pagar","تأكيد ودفع"),
 recalc:c("重新确认","Recalculate","再確認","다시 확인","Recalculer","Neu bestätigen","Recalcular","Recalcular","إعادة التأكيد"),
 serviceUnavailable:c("这项服务暂时还没准备好，不会产生费用。","This service is not ready yet. You will not be charged.","現在利用できません。","아직 준비되지 않았습니다.","Service indisponible.","Dienst noch nicht verfügbar.","Servicio no disponible.","Serviço indisponível.","الخدمة غير جاهزة."),
};

function storageKey(toolId:string){return`lingxifield:paid-tool:quote:${toolId}`}
function saveStoredQuote(toolId:string,q:Quote){try{localStorage.setItem(storageKey(toolId),JSON.stringify({id:q.id,toolId,quantity:Number(q.quantity),currency:q.currency,expiresAt:q.expires_at} satisfies StoredQuote))}catch{}}
function clearStoredQuote(toolId:string){try{localStorage.removeItem(storageKey(toolId))}catch{}}
function price(q:Quote){return q.display_currency==="CNY"?`¥${Number(q.display_amount).toFixed(2)}`:`$${Number(q.display_amount).toFixed(2)} USD`}
function unitLabel(unit:string,zh:boolean){
 if(!zh)return unit==="calculation"?"use":unit==="image"?"image":unit==="minute"?"minute":unit==="page"?"page":unit==="file"?"file":unit==="email"?"email":unit==="second"?"second":unit;
 if(unit==="calculation")return"次";if(unit==="image")return"张";if(unit==="minute")return"分钟";if(unit==="page")return"页";if(unit==="file")return"个文件";if(unit==="email")return"个邮箱";if(unit==="second")return"秒";if(unit==="mb")return"MB";return"次";
}
function isMiniProgramWebView(){try{return new URLSearchParams(window.location.search).get("mini")==="1"&&/MicroMessenger/i.test(navigator.userAgent||"")}catch{return false}}
async function openMiniNativePay(quoteId:string){
 return new Promise<boolean>((resolve)=>{
  let settled=false;const done=(v:boolean)=>{if(settled)return;settled=true;resolve(v)};
  const go=()=>{const w=(window as any).wx;if(!w?.miniProgram?.navigateTo){done(false);return}w.miniProgram.navigateTo({url:`/pages/pay/index?quoteId=${encodeURIComponent(quoteId)}`,success:()=>done(true),fail:()=>done(false)})};
  if((window as any).wx?.miniProgram){go();return}
  const id="lingxifield-wechat-jssdk",existing=document.getElementById(id) as HTMLScriptElement|null;
  if(existing){existing.addEventListener("load",go,{once:true});window.setTimeout(()=>done(false),3000);return}
  const s=document.createElement("script");s.id=id;s.src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js";s.async=true;s.onload=go;s.onerror=()=>done(false);document.head.appendChild(s);window.setTimeout(()=>done(false),3500);
 });
}
function preferSameTabPayment(){try{return /MicroMessenger|WeChat|QQ\/|MQQBrowser|; wv\)|Android.*\bwv\b/i.test(navigator.userAgent||"")||window.matchMedia("(max-width: 820px)").matches}catch{return true}}

export default function PaidActionButton({toolId,quantity,metadata,onPaid,label}:{toolId:string;quantity:number;metadata?:Record<string,unknown>;onPaid:(quoteId:string)=>Promise<void>|void;label?:string}){
 const{lang}=useLingxiLang();const zh=lang==="zh";const t=(x:Copy)=>x[lang];const{currency}=usePreferredCurrency();
 const[quote,setQuote]=useState<Quote|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),processing=useRef<string|null>(null),restoreKey=useRef("");
 const stop=()=>{if(timer.current){clearInterval(timer.current);timer.current=null}};
 async function status(id:string){const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(id)}`,{cache:"no-store"});return r.ok?r.json():null}
 async function complete(id:string){if(processing.current===id)return;processing.current=id;stop();setMsg(t(UI.paid));try{await onPaid(id);clearStoredQuote(toolId)}finally{processing.current=null}}
 async function check(id:string){const d=await status(id);if(!d?.paid)return false;await complete(id);return true}

 useEffect(()=>{const wake=()=>{if(document.visibilityState==="visible"&&quote?.id)void check(quote.id)};window.addEventListener("pageshow",wake);document.addEventListener("visibilitychange",wake);return()=>{window.removeEventListener("pageshow",wake);document.removeEventListener("visibilitychange",wake)}},[quote?.id]);
 useEffect(()=>()=>stop(),[]);

 useEffect(()=>{
  const fp=`${toolId}:${quantity}:${currency}`;if(quantity<=0||restoreKey.current===fp)return;restoreKey.current=fp;
  let saved:StoredQuote|null=null;try{const raw=localStorage.getItem(storageKey(toolId));if(raw)saved=JSON.parse(raw)}catch{}
  if(!saved||saved.toolId!==toolId||Number(saved.quantity)!==Number(quantity)||saved.currency!==currency)return;
  void(async()=>{try{const r=await fetch(`/api/tools/quote?id=${encodeURIComponent(saved!.id)}`,{cache:"no-store"});if(!r.ok){clearStoredQuote(toolId);return}const q=await r.json() as Quote;if(q.tool_id!==toolId||Number(q.quantity)!==Number(quantity)||q.currency!==currency){clearStoredQuote(toolId);return}if(new Date(q.expires_at).getTime()<Date.now()){clearStoredQuote(toolId);return}setQuote(q);await check(q.id)}catch{}})();
 },[toolId,quantity,currency]);

 async function makeQuote(){
  setBusy(true);setMsg("");
  try{
   const r=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({toolId,quantity,currency,metadata:metadata||{}})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(String(d.error||"QUOTE_CREATE_FAILED"));
   setQuote(d);saveStoredQuote(toolId,d);setMsg(t(UI.priced));
  }catch(e){
   const m=e instanceof Error?e.message:String(e);
   setMsg(/TOOL_SERVICE_UNAVAILABLE|PRICE_NOT_AVAILABLE|TOOL_PRICING_NOT_FOUND/.test(m)?t(UI.serviceUnavailable):m);
  }finally{setBusy(false)}
 }
 async function pay(){
  if(!quote)return;saveStoredQuote(toolId,quote);
  if(quote.currency==="CNY"&&isMiniProgramWebView()){
   stop();setMsg(t(UI.waiting));
   const opened=await openMiniNativePay(quote.id);
   if(opened){timer.current=setInterval(()=>void check(quote.id),1800);return}
  }
  const returnTo=window.location.pathname+window.location.search;
  const payUrl=`/tools/pay?quoteId=${encodeURIComponent(quote.id)}&return=${encodeURIComponent(returnTo)}`;
  stop();
  if(preferSameTabPayment()){setMsg(t(UI.waiting));window.location.assign(payUrl);return}
  const w=window.open(payUrl,"lingxi_tool_pay","width=720,height=820");
  if(!w){window.location.assign(payUrl);return}
  timer.current=setInterval(()=>void check(quote.id),1800);setMsg(t(UI.waiting));
 }

 const changed=quote&&(Number(quote.quantity)!==Number(quantity)||quote.currency!==currency);
 return <div>{!quote||changed
  ?<button onClick={makeQuote} disabled={busy||quantity<=0} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?t(UI.pricing):(label||t(UI.defaultLabel))}</button>
  :<div className="flex flex-wrap items-center gap-3">
    <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-2.5 text-sm text-[var(--lx-ink)]">{t(UI.thisTime)} {quote.quantity} {unitLabel(quote.unit_name,zh)} · <b className="text-lg">{price(quote)}</b></div>
    <button onClick={pay} disabled={busy} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{t(UI.confirm)}</button>
    <button onClick={()=>{stop();clearStoredQuote(toolId);setQuote(null);setMsg("")}} className="rounded-xl border border-[var(--lx-line)] px-4 py-2.5 text-sm text-[var(--lx-muted)]">{t(UI.recalc)}</button>
   </div>}
  {msg&&<p className="mt-2 text-xs leading-5 text-[var(--lx-muted)]">{msg}</p>}
 </div>;
}
