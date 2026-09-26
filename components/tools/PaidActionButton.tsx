"use client";

import { useEffect, useRef, useState } from "react";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";
import { usePreferredCurrency } from "@/components/CurrencyPreferenceProvider";

type Quote = {
  id: string;
  tool_id: string;
  quantity: number;
  unit_name: string;
  amount_rmb: number;
  amount_usd: number;
  display_currency: "CNY" | "USD";
  display_amount: number;
  currency: "CNY" | "USD";
  expires_at: string;
  status?: string;
};
type StoredQuote = { id:string; toolId:string; quantity:number; currency:"CNY"|"USD"; expiresAt:string };
type Copy = Record<LingxiLang,string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});
const UI={
 defaultLabel:c("继续","Continue","続ける","계속","Continuer","Weiter","Continuar","Continuar","متابعة"),
 paid:c("支付已确认，开始处理…","Payment confirmed. Processing…","支払いを確認しました。処理を開始します…","결제가 확인되었습니다. 처리를 시작합니다…","Paiement confirmé. Traitement…","Zahlung bestätigt. Verarbeitung…","Pago confirmado. Procesando…","Pagamento confirmado. Processando…","تم تأكيد الدفع. جارٍ المعالجة…"),
 quoteFail:c("创建报价失败","Could not create quote","見積を作成できませんでした","견적을 만들지 못했습니다","Impossible de créer le devis","Angebot konnte nicht erstellt werden","No se pudo crear el presupuesto","Não foi possível criar a cotação","تعذر إنشاء عرض السعر"),
 priced:c("价格已锁定，继续选择支付方式。","Price locked. Continue to payment.","価格を確定しました。","가격이 확정되었습니다.","Prix verrouillé.","Preis festgelegt.","Precio fijado.","Preço fixado.","تم تثبيت السعر."),
 waiting:c("等待支付确认…付款完成后这里会自动继续。","Waiting for payment confirmation. This page will continue automatically.","支払い確認待ち…","결제 확인 대기 중…","En attente du paiement…","Warten auf Zahlungsbestätigung…","Esperando confirmación…","Aguardando confirmação…","بانتظار تأكيد الدفع…"),
 blocked:c("浏览器阻止了付款窗口。请允许本站弹窗后再试。","The browser blocked the payment window. Allow pop-ups and try again.","支払いウィンドウがブロックされました。","결제 창이 차단되었습니다.","La fenêtre de paiement a été bloquée.","Das Zahlungsfenster wurde blockiert.","La ventana de pago fue bloqueada.","A janela de pagamento foi bloqueada.","تم حظر نافذة الدفع."),
 serviceUnavailable:c("当前服务暂不可用，不会创建付费订单。","This service is currently unavailable. No paid order will be created.","現在このサービスは利用できません。","현재 서비스를 사용할 수 없습니다.","Service indisponible.","Dienst derzeit nicht verfügbar.","Servicio no disponible.","Serviço indisponível.","الخدمة غير متاحة حاليًا."),
 pricing:c("正在确认价格…","Confirming price…","価格確認中…","가격 확인 중…","Confirmation du prix…","Preis wird bestätigt…","Confirmando precio…","Confirmando preço…","جارٍ تأكيد السعر…"),
 thisTime:c("本次","This time","今回","이번","Cette fois","Diesmal","Esta vez","Desta vez","هذه المرة"),
 confirm:c("确认并付款","Confirm & pay","確認して支払う","확인 후 결제","Confirmer et payer","Bestätigen & bezahlen","Confirmar y pagar","Confirmar e pagar","تأكيد ودفع"),
 recalc:c("重新确认","Recalculate","再確認","다시 확인","Recalculer","Neu bestätigen","Recalcular","Recalcular","إعادة التأكيد"),
 recovered:c("已恢复这次工具的报价记录。","Previous quote restored.","以前の見積を復元しました。","이전 견적을 복구했습니다.","Devis précédent restauré.","Früheres Angebot wiederhergestellt.","Cotización anterior restaurada.","Cotação anterior restaurada.","تمت استعادة عرض السعر السابق."),
 resumePaid:c("之前的付款已经确认，不会重复收费，正在继续处理。","Previous payment confirmed. No duplicate charge; processing is resuming.","以前の支払いを確認しました。","이전 결제가 확인되었습니다.","Paiement précédent confirmé.","Frühere Zahlung bestätigt.","Pago anterior confirmado.","Pagamento anterior confirmado.","تم تأكيد الدفعة السابقة."),
};

function storageKey(toolId:string){return`lingxifield:paid-tool:quote:${toolId}`}
function saveStoredQuote(toolId:string,q:Quote){try{const p:StoredQuote={id:q.id,toolId,quantity:Number(q.quantity),currency:q.currency,expiresAt:q.expires_at};localStorage.setItem(storageKey(toolId),JSON.stringify(p))}catch{}}
function clearStoredQuote(toolId:string){try{localStorage.removeItem(storageKey(toolId))}catch{}}
function price(q:Quote){return q.display_currency==="CNY"?`¥${Number(q.display_amount).toFixed(2)}`:`$${Number(q.display_amount).toFixed(2)} USD`}

export default function PaidActionButton({toolId,quantity,metadata,onPaid,label}:{toolId:string;quantity:number;metadata?:Record<string,unknown>;onPaid:(quoteId:string)=>Promise<void>|void;label?:string}){
 const{lang}=useLingxiLang();const t=(x:Copy)=>x[lang];const{currency}=usePreferredCurrency();
 const[quote,setQuote]=useState<Quote|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState(""),[restoring,setRestoring]=useState(false);
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),processing=useRef<string|null>(null),restoreAttempted=useRef("");
 const stop=()=>{if(timer.current){clearInterval(timer.current);timer.current=null}};
 async function complete(id:string,fromRecovery=false){if(processing.current===id)return;processing.current=id;stop();setMsg(fromRecovery?t(UI.resumePaid):t(UI.paid));try{await onPaid(id)}finally{processing.current=null}}
 async function status(id:string){const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(id)}`,{cache:"no-store"});if(!r.ok)return null;return r.json()}
 async function check(id:string){const d=await status(id);if(!d?.paid)return false;await complete(id);return true}

 useEffect(()=>{const h=(e:MessageEvent)=>{if(e.origin!==window.location.origin)return;const raw=e.data as unknown;if(!raw||typeof raw!=="object")return;const d=raw as{type?:unknown;quoteId?:unknown};if(d.type==="LINGXIFIELD_TOOL_PAYMENT_CONFIRMED"&&typeof d.quoteId==="string"&&d.quoteId===quote?.id)void complete(d.quoteId)};window.addEventListener("message",h);return()=>{stop();window.removeEventListener("message",h)}},[quote?.id,lang]);

 useEffect(()=>{
  const fp=`${toolId}:${quantity}:${currency}`;if(quantity<=0||restoreAttempted.current===fp)return;restoreAttempted.current=fp;
  let saved:StoredQuote|null=null;try{const raw=localStorage.getItem(storageKey(toolId));if(raw)saved=JSON.parse(raw) as StoredQuote}catch{}
  if(!saved||saved.toolId!==toolId||Number(saved.quantity)!==Number(quantity)||saved.currency!==currency)return;
  if(!saved.id){clearStoredQuote(toolId);return}
  setRestoring(true);void(async()=>{try{const r=await fetch(`/api/tools/quote?id=${encodeURIComponent(saved!.id)}`,{cache:"no-store"});if(!r.ok){clearStoredQuote(toolId);return}const q=await r.json() as Quote;if(q.tool_id!==toolId||Number(q.quantity)!==Number(quantity)||q.currency!==currency){clearStoredQuote(toolId);return}setQuote(q);const d=await status(q.id);if(d?.paid){setMsg(t(UI.recovered));await complete(q.id,true)}else if(q.expires_at&&new Date(q.expires_at).getTime()<Date.now()){clearStoredQuote(toolId);setQuote(null)}else setMsg(t(UI.recovered))}catch{}finally{setRestoring(false)}})();
 },[toolId,quantity,currency,lang]);

 useEffect(()=>{if(quote&&quote.currency!==currency){stop();setQuote(null);setMsg("");clearStoredQuote(toolId)}},[currency,quote,toolId]);

 async function makeQuote(){setBusy(true);setMsg("");try{const r=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({toolId,quantity,currency,metadata:metadata||{}})});const d=await r.json();if(!r.ok)throw new Error(d.error||t(UI.quoteFail));setQuote(d);saveStoredQuote(toolId,d);setMsg(t(UI.priced))}catch(e){const m=e instanceof Error?e.message:String(e);setMsg(m.includes("TOOL_SERVICE_UNAVAILABLE")?t(UI.serviceUnavailable):m)}finally{setBusy(false)}}
 function pay(){if(!quote)return;saveStoredQuote(toolId,quote);const w=window.open(`/tools/pay?quoteId=${encodeURIComponent(quote.id)}`,"lingxi_tool_pay","width=720,height=820");if(!w){setMsg(t(UI.blocked));return}stop();timer.current=setInterval(()=>void check(quote.id),2200);setMsg(t(UI.waiting))}
 const changed=quote&&(Number(quote.quantity)!==Number(quantity)||quote.currency!==currency),disabled=busy||restoring||quantity<=0;
 return <div>{!quote||changed?<button onClick={makeQuote} disabled={disabled} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy||restoring?t(UI.pricing):(label||t(UI.defaultLabel))}</button>:<div className="flex flex-wrap items-center gap-3"><div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-2.5 text-sm text-[var(--lx-ink)]">{t(UI.thisTime)} {quote.quantity} {quote.unit_name} · <b className="text-lg">{price(quote)}</b></div><button onClick={pay} disabled={busy||restoring} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{t(UI.confirm)}</button><button onClick={()=>{stop();clearStoredQuote(toolId);setQuote(null);setMsg("")}} className="rounded-xl border border-[var(--lx-line)] px-4 py-2.5 text-sm text-[var(--lx-muted)]">{t(UI.recalc)}</button></div>}{msg&&<p className="mt-2 text-xs leading-5 text-[var(--lx-muted)]">{msg}</p>}</div>
}
