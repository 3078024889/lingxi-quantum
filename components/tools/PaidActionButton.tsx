"use client";

import { useEffect, useRef, useState } from "react";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Quote={id:string;tool_id:string;quantity:number;unit_name:string;amount_rmb:number;expires_at:string;status?:string};
type StoredQuote={id:string;toolId:string;quantity:number;expiresAt:string};
type Copy=Record<LingxiLang,string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});
const UI={
 defaultLabel:c("继续","Continue","続ける","계속","Continuer","Weiter","Continuar","Continuar","متابعة"),
 paid:c("支付已确认，开始处理…","Payment confirmed. Processing…","支払いを確認しました。処理を開始します…","결제가 확인되었습니다. 처리를 시작합니다…","Paiement confirmé. Traitement…","Zahlung bestätigt. Verarbeitung…","Pago confirmado. Procesando…","Pagamento confirmado. Processando…","تم تأكيد الدفع. جارٍ المعالجة…"),
 quoteFail:c("创建报价失败","Could not create quote","見積を作成できませんでした","견적을 만들지 못했습니다","Impossible de créer le devis","Angebot konnte nicht erstellt werden","No se pudo crear el presupuesto","Não foi possível criar a cotação","تعذر إنشاء عرض السعر"),
 priced:c("价格已由服务器计算。确认后才开始付费处理。","Price calculated by the server. Paid processing starts only after confirmation.","価格はサーバーで計算済みです。","가격은 서버에서 계산되었습니다.","Prix calculé par le serveur.","Preis serverseitig berechnet.","Precio calculado por el servidor.","Preço calculado pelo servidor.","تم حساب السعر على الخادم."),
 waiting:c("等待支付确认…付款完成后这里会自动继续。","Waiting for payment confirmation. This page will continue automatically.","支払い確認待ち…","결제 확인 대기 중…","En attente du paiement…","Warten auf Zahlungsbestätigung…","Esperando confirmación…","Aguardando confirmação…","بانتظار تأكيد الدفع…"),
 blocked:c("浏览器阻止了付款窗口。请允许本站弹窗后再试。","The browser blocked the payment window. Allow pop-ups for this site and try again.","支払いウィンドウがブロックされました。","결제 창이 차단되었습니다.","La fenêtre de paiement a été bloquée.","Das Zahlungsfenster wurde blockiert.","La ventana de pago fue bloqueada.","A janela de pagamento foi bloqueada.","تم حظر نافذة الدفع."),
 pricing:c("正在计算价格…","Calculating price…","価格計算中…","가격 계산 중…","Calcul du prix…","Preis wird berechnet…","Calculando precio…","Calculando preço…","جارٍ حساب السعر…"),
 thisTime:c("本次","This time","今回","이번","Cette fois","Diesmal","Esta vez","Desta vez","هذه المرة"),
 confirm:c("确认并付款","Confirm & pay","確認して支払う","확인 후 결제","Confirmer et payer","Bestätigen & bezahlen","Confirmar y pagar","Confirmar e pagar","تأكيد ودفع"),
 recalc:c("重新计算","Recalculate","再計算","다시 계산","Recalculer","Neu berechnen","Recalcular","Recalcular","إعادة الحساب"),
 recovered:c("已找到这次工具的未完成支付/已支付记录，正在恢复。","Found a previous quote/payment for this tool and restored it.","このツールの未完了または支払い済み記録を復元しました。","이 도구의 이전 견적/결제 기록을 복구했습니다.","Un devis/paiement précédent pour cet outil a été restauré.","Ein früheres Angebot/eine Zahlung für dieses Werkzeug wurde wiederhergestellt.","Se restauró una cotización/pago anterior para esta herramienta.","Uma cotação/pagamento anterior desta ferramenta foi restaurado.","تمت استعادة عرض سعر/دفعة سابقة لهذه الأداة."),
 resumePaid:c("已确认之前的付款，不会重复收费，正在继续处理。","Previous payment confirmed. You will not be charged again; processing is resuming.","以前の支払いを確認しました。再課金せず処理を再開します。","이전 결제가 확인되었습니다. 다시 결제하지 않고 처리를 계속합니다.","Paiement précédent confirmé. Aucun nouveau débit ; reprise du traitement.","Frühere Zahlung bestätigt. Keine erneute Belastung; Verarbeitung wird fortgesetzt.","Pago anterior confirmado. No se volverá a cobrar; se reanuda el proceso.","Pagamento anterior confirmado. Não haverá nova cobrança; o processamento será retomado.","تم تأكيد الدفعة السابقة. لن يتم تحصيل رسوم مرة أخرى وسيُستأنف التنفيذ."),
};

function storageKey(toolId:string){return `lingxifield:paid-tool:quote:${toolId}`}
function saveStoredQuote(toolId:string,q:Quote){
  try{
    const payload:StoredQuote={id:q.id,toolId,quantity:Number(q.quantity),expiresAt:q.expires_at};
    localStorage.setItem(storageKey(toolId),JSON.stringify(payload));
  }catch{}
}
function clearStoredQuote(toolId:string){
  try{localStorage.removeItem(storageKey(toolId))}catch{}
}

export default function PaidActionButton({toolId,quantity,metadata,onPaid,label}:{toolId:string;quantity:number;metadata?:Record<string,unknown>;onPaid:(quoteId:string)=>Promise<void>|void;label?:string}){
 const{lang}=useLingxiLang();const t=(x:Copy)=>x[lang];
 const[quote,setQuote]=useState<Quote|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState(""),[restoring,setRestoring]=useState(false);
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),processing=useRef<string|null>(null),restoreAttempted=useRef<string>("");
 const stop=()=>{if(timer.current){clearInterval(timer.current);timer.current=null}};

 async function complete(id:string,fromRecovery=false){
   if(processing.current===id)return;
   processing.current=id;
   stop();
   setMsg(fromRecovery?t(UI.resumePaid):t(UI.paid));
   try{await onPaid(id)}
   finally{processing.current=null}
 }

 async function status(id:string){
   const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(id)}`,{cache:"no-store"});
   if(!r.ok)return null;
   return r.json();
 }

 async function check(id:string){
   const d=await status(id);
   if(!d?.paid)return false;
   await complete(id);
   return true;
 }

 useEffect(()=>{
   const h=(e:MessageEvent)=>{
     if(e.origin!==window.location.origin)return;
     const d=e.data as any;
     if(d?.type==="LINGXIFIELD_TOOL_PAYMENT_CONFIRMED"&&d.quoteId&&d.quoteId===quote?.id)void complete(d.quoteId);
   };
   window.addEventListener("message",h);
   return()=>{stop();window.removeEventListener("message",h)}
 },[quote?.id,lang]);

 useEffect(()=>{
   if(quantity<=0)return;
   const fingerprint=`${toolId}:${quantity}`;
   if(restoreAttempted.current===fingerprint)return;
   restoreAttempted.current=fingerprint;

   let saved:StoredQuote|null=null;
   try{
     const raw=localStorage.getItem(storageKey(toolId));
     if(raw)saved=JSON.parse(raw) as StoredQuote;
   }catch{}
   if(!saved||saved.toolId!==toolId||Number(saved.quantity)!==Number(quantity))return;
   if(!saved.id){
     clearStoredQuote(toolId);
     return;
   }

   setRestoring(true);
   void (async()=>{
     try{
       const r=await fetch(`/api/tools/quote?id=${encodeURIComponent(saved!.id)}`,{cache:"no-store"});
       if(!r.ok){clearStoredQuote(toolId);return}
       const q=await r.json() as Quote;
       if(q.tool_id!==toolId||Number(q.quantity)!==Number(quantity)){clearStoredQuote(toolId);return}
       setQuote(q);
       const d=await status(q.id);
       if(d?.paid){
         setMsg(t(UI.recovered));
         await complete(q.id,true);
       }else if(q.expires_at&&new Date(q.expires_at).getTime()<Date.now()){
         clearStoredQuote(toolId);
         setQuote(null);
       }else{
         setMsg(t(UI.recovered));
       }
     }catch{
       // A recovery failure must never create a new charge automatically.
     }finally{
       setRestoring(false);
     }
   })();
 },[toolId,quantity,lang]);

 async function makeQuote(){
   setBusy(true);setMsg("");
   try{
     const r=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({toolId,quantity,metadata:metadata||{}})});
     const d=await r.json();
     if(!r.ok)throw new Error(d.error||t(UI.quoteFail));
     setQuote(d);saveStoredQuote(toolId,d);setMsg(t(UI.priced))
   }catch(e){setMsg(e instanceof Error?e.message:String(e))}
   finally{setBusy(false)}
 }

 function pay(){
   if(!quote)return;
   saveStoredQuote(toolId,quote);
   const w=window.open(`/tools/pay?quoteId=${encodeURIComponent(quote.id)}`,"lingxi_tool_pay","width=720,height=820");
   if(!w){setMsg(t(UI.blocked));return}
   stop();timer.current=setInterval(()=>void check(quote.id),2200);setMsg(t(UI.waiting))
 }

 const changed=quote&&Number(quote.quantity)!==Number(quantity);
 const disabled=busy||restoring||quantity<=0;

 return <div>
   {!quote||changed
     ?<button onClick={makeQuote} disabled={disabled} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40">{busy||restoring?t(UI.pricing):(label||t(UI.defaultLabel))}</button>
     :<div className="flex flex-wrap items-center gap-3">
       <div className="rounded-2xl bg-blue-50 px-4 py-2.5 text-sm text-blue-900">{t(UI.thisTime)} {quote.quantity} {quote.unit_name} · <b className="text-lg">¥{quote.amount_rmb}</b></div>
       <button onClick={pay} disabled={busy||restoring} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40">{t(UI.confirm)}</button>
       <button onClick={()=>{stop();clearStoredQuote(toolId);setQuote(null);setMsg("")}} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-600">{t(UI.recalc)}</button>
     </div>}
   {msg&&<p className="mt-2 text-xs leading-5 text-slate-500">{msg}</p>}
 </div>
}
