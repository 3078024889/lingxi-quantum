"use client";
import{useEffect,useRef,useState}from"react";
import{useLingxiLang,type LingxiLang}from"@/lib/lingxi-i18n";
import{usePreferredCurrency}from"@/components/CurrencyPreferenceProvider";
import{foodBillingText}from"@/lib/tools/food/billing-copy";

type Quote={id:string;tool_id:string;quantity:number;unit_name:string;amount_rmb:number;amount_usd:number;display_currency:"CNY"|"USD";display_amount:number;currency:"CNY"|"USD";expires_at:string;status?:string;metadata?:Record<string,unknown>};
type StoredQuote={id:string;toolId:string;quantity:number;currency:"CNY"|"USD";expiresAt:string;draftId?:string};
type Copy=Record<LingxiLang,string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});
const UI={
 defaultLabel:c("继续","Continue","続ける","계속","Continuer","Weiter","Continuar","Continuar","متابعة"),
 paid:c("支付已确认，正在继续原任务…","Payment confirmed. Resuming your task…","支払いを確認しました。元の作業を続けます…","결제가 확인되었습니다. 기존 작업을 계속합니다…","Paiement confirmé. Reprise de votre tâche…","Zahlung bestätigt. Aufgabe wird fortgesetzt…","Pago confirmado. Reanudando la tarea…","Pagamento confirmado. Retomando a tarefa…","تم تأكيد الدفع. جارٍ استئناف المهمة…"),
 pricing:c("正在确认本次价格…","Confirming price…","価格確認中…","가격 확인 중…","Confirmation du prix…","Preis wird bestätigt…","Confirmando precio…","Confirmando preço…","جارٍ تأكيد السعر…"),
 priced:c("价格已确认，付款后会继续当前任务。","Price confirmed. Your current task continues after payment.","価格を確認しました。支払い後に作業を続けます。","가격이 확인되었습니다. 결제 후 현재 작업을 계속합니다.","Prix confirmé. Votre tâche reprendra après paiement.","Preis bestätigt. Danach wird die aktuelle Aufgabe fortgesetzt.","Precio confirmado. La tarea continuará tras el pago.","Preço confirmado. A tarefa continuará após o pagamento.","تم تأكيد السعر وستستمر المهمة بعد الدفع."),
 waiting:c("支付窗口已打开。当前任务会留在这里。","Payment opened separately. Your current task stays here.","支払い画面を別で開きました。現在の作業は保持されます。","결제 창을 별도로 열었습니다. 현재 작업은 유지됩니다.","Le paiement s’est ouvert séparément. Votre tâche reste ici.","Die Zahlung wurde separat geöffnet. Ihre Aufgabe bleibt erhalten.","El pago se abrió aparte. Tu tarea permanece aquí.","O pagamento abriu separadamente. Sua tarefa permanece aqui.","فُتحت نافذة الدفع بشكل منفصل وستبقى مهمتك هنا."),
 popupBlocked:c("为了保留当前文件和编辑结果，请允许浏览器打开支付窗口后再继续；不会创建新的收费。","To preserve your files and edits, allow the payment window and try again. No new charge was created.","現在のファイルと編集内容を保つため、支払いウィンドウを許可してください。","현재 파일과 편집 내용을 유지하려면 결제 창을 허용하세요.","Autorisez la fenêtre de paiement pour conserver vos fichiers et modifications.","Erlauben Sie das Zahlungsfenster, damit Dateien und Bearbeitungen erhalten bleiben.","Permite la ventana de pago para conservar archivos y cambios.","Permita a janela de pagamento para preservar arquivos e edições.","اسمح لنافذة الدفع للحفاظ على الملفات والتعديلات."),
 thisTime:c("本次","This time","今回","이번","Cette fois","Diesmal","Esta vez","Desta vez","هذه المرة"),
 confirm:c("确认并支付","Confirm & pay","確認して支払う","확인 후 결제","Confirmer et payer","Bestätigen & bezahlen","Confirmar y pagar","Confirmar e pagar","تأكيد ودفع"),
 recalc:c("重新确认","Recalculate","再確認","다시 확인","Recalculer","Neu bestätigen","Recalcular","Recalcular","إعادة التأكيد"),
 serviceUnavailable:c("这项服务暂时还没准备好，不会产生费用。","This service is not ready yet. You will not be charged.","現在利用できません。","아직 준비되지 않았습니다.","Service indisponible.","Dienst noch nicht verfügbar.","Servicio no disponible.","Serviço indisponível.","الخدمة غير جاهزة.")
};
function storageKey(toolId:string){return`lingxifield:paid-tool:quote:${toolId}`}
function saveStoredQuote(toolId:string,q:Quote,draftId?:string){try{localStorage.setItem(storageKey(toolId),JSON.stringify({id:q.id,toolId,quantity:Number(q.quantity),currency:q.currency,expiresAt:q.expires_at,draftId} satisfies StoredQuote))}catch{}}
function clearStoredQuote(toolId:string){try{localStorage.removeItem(storageKey(toolId))}catch{}}
function price(q:Quote){return q.display_currency==="CNY"?`¥${Number(q.display_amount).toFixed(2)}`:`$${Number(q.display_amount).toFixed(2)} USD`}
function unitLabel(unit:string,zh:boolean){if(unit==="food")return zh?"种食物":"foods";if(!zh)return unit==="image"?"image":unit==="minute"?"minute":unit==="page"?"page":unit==="file"?"file":unit==="email"?"email":unit==="second"?"second":"use";if(unit==="image")return"张";if(unit==="minute")return"分钟";if(unit==="page")return"页";if(unit==="file")return"个文件";if(unit==="email")return"个邮箱";if(unit==="second")return"秒";return"次"}
function isMiniProgramWebView(){try{return new URLSearchParams(window.location.search).get("mini")==="1"&&/MicroMessenger/i.test(navigator.userAgent||"")}catch{return false}}
async function openMiniNativePay(quoteId:string){return new Promise<boolean>(resolve=>{let settled=false;const done=(v:boolean)=>{if(settled)return;settled=true;resolve(v)},go=()=>{const w=(window as any).wx;if(!w?.miniProgram?.navigateTo){done(false);return}w.miniProgram.navigateTo({url:`/pages/pay/index?quoteId=${encodeURIComponent(quoteId)}`,success:()=>done(true),fail:()=>done(false)})};if((window as any).wx?.miniProgram){go();return}const id="lingxifield-wechat-jssdk",existing=document.getElementById(id)as HTMLScriptElement|null;if(existing){existing.addEventListener("load",go,{once:true});setTimeout(()=>done(false),3000);return}const s=document.createElement("script");s.id=id;s.src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js";s.async=true;s.onload=go;s.onerror=()=>done(false);document.head.appendChild(s);setTimeout(()=>done(false),3500)})}

export default function PaidActionButton({toolId,quantity,metadata,onPaid,label,draftId,draftReady=true}:{toolId:string;quantity:number;metadata?:Record<string,unknown>;onPaid:(quoteId:string)=>Promise<void>|void;label?:string;draftId?:string;draftReady?:boolean}){
 const{lang}=useLingxiLang();const zh=lang==="zh";const t=(x:Copy)=>x[lang]||x.en;const{currency}=usePreferredCurrency();
 const[quote,setQuote]=useState<Quote|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),processing=useRef<string|null>(null),restoreKey=useRef("");
 const stop=()=>{if(timer.current){clearInterval(timer.current);timer.current=null}};
 async function status(id:string){const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(id)}`,{cache:"no-store"});return r.ok?r.json():null}
 async function complete(id:string){if(!draftReady||processing.current===id)return;processing.current=id;stop();setMsg(t(UI.paid));try{await onPaid(id);clearStoredQuote(toolId)}catch{setMsg(t(c('支付已确认，结果尚未完成。请重试，无需重复付款。','Payment confirmed. Retry the result without paying again.','支払い確認済みです。再払いせずに再試行してください。','결제가 확인되었습니다. 다시 결제하지 말고 재시도하세요.','Paiement confirmé. Réessayez sans payer à nouveau.','Zahlung bestätigt. Erneut versuchen, nicht nochmals bezahlen.','Pago confirmado. Reintenta sin volver a pagar.','Pagamento confirmado. Tente de novo sem pagar novamente.','تم تأكيد الدفع. أعد المحاولة دون الدفع مجددًا.')))}finally{processing.current=null}}
 async function check(id:string){if(!draftReady)return false;const d=await status(id);if(!d?.paid)return false;await complete(id);return true}
 const checkRef=useRef(check);checkRef.current=check;

 useEffect(()=>{const wake=()=>{if(document.visibilityState==="visible"&&quote?.id&&draftReady)void checkRef.current(quote.id)};window.addEventListener("pageshow",wake);document.addEventListener("visibilitychange",wake);return()=>{window.removeEventListener("pageshow",wake);document.removeEventListener("visibilitychange",wake)}},[quote?.id,draftReady]);
 useEffect(()=>()=>{if(timer.current){clearInterval(timer.current);timer.current=null}},[]);

 useEffect(()=>{
  if(!draftReady||quantity<=0)return;
  const fp=`${toolId}:${quantity}:${currency}:${draftId||""}`;if(restoreKey.current===fp)return;restoreKey.current=fp;
  let id=new URLSearchParams(location.search).get("resumeQuote")||"";
  if(!id){try{const raw=localStorage.getItem(storageKey(toolId));if(raw){const saved=JSON.parse(raw) as StoredQuote;if(saved.toolId===toolId&&Number(saved.quantity)===Number(quantity)&&saved.currency===currency&&(!saved.draftId||!draftId||saved.draftId===draftId))id=saved.id}}catch{}}
  if(!id)return;
  void(async()=>{try{const r=await fetch(`/api/tools/quote?id=${encodeURIComponent(id)}`,{cache:"no-store"});if(!r.ok)return;const q=await r.json() as Quote;if(q.tool_id!==toolId||Number(q.quantity)!==Number(quantity)||(toolId!=="food-calorie"&&q.currency!==currency)||(toolId==="food-calorie"&&q.metadata?.foodRequestId!==draftId))return;setQuote(q);saveStoredQuote(toolId,q,draftId);await checkRef.current(q.id)}catch{}})();
 },[toolId,quantity,currency,draftId,draftReady]);

 async function makeQuote(){
  setBusy(true);setMsg("");
  try{
   const r=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({toolId,quantity,currency,metadata:{...(metadata||{}),draftId:draftId||undefined,returnPath:location.pathname}})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(String(d.error||"QUOTE_CREATE_FAILED"));
   setQuote(d);saveStoredQuote(toolId,d,draftId);setMsg(t(UI.priced));
  }catch(e){const m=e instanceof Error?e.message:String(e);setMsg(toolId==="food-calorie"?foodBillingText(lang,/登录|SIGN_IN_REQUIRED/.test(m)?"login":/EXPIRED/.test(m)?"expired":"unavailable"):/TOOL_SERVICE_UNAVAILABLE|PRICE_NOT_AVAILABLE|TOOL_PRICING_NOT_FOUND/.test(m)?t(UI.serviceUnavailable):m)}
  finally{setBusy(false)}
 }
 async function pay(){
  if(!quote)return;saveStoredQuote(toolId,quote,draftId);
  if(quote.currency==="CNY"&&isMiniProgramWebView()){
   stop();setMsg(t(UI.waiting));const opened=await openMiniNativePay(quote.id);if(opened){timer.current=setInterval(()=>void checkRef.current(quote.id),1800);return}
  }
  const u=new URL(location.href);u.searchParams.set("resumeQuote",quote.id);if(draftId)u.searchParams.set("resumeDraft",draftId);
  const payUrl=`/tools/pay?quoteId=${encodeURIComponent(quote.id)}&return=${encodeURIComponent(u.pathname+u.search)}`;
  stop();
  const w=window.open(payUrl,"lingxi_tool_pay","width=720,height=820");
  if(w){timer.current=setInterval(()=>void checkRef.current(quote.id),1800);setMsg(t(UI.waiting));return}
  // Never destroy a stateful unpaid task in the same tab unless a persistent draft exists.
  if(draftId){location.assign(payUrl);return}
  setMsg(t(UI.popupBlocked));
 }
 const changed=quote&&(Number(quote.quantity)!==Number(quantity)||(quote.currency!==currency&&(toolId!=='food-calorie'||quote.status==='quoted')));
 return <div>{!quote||changed
  ?<button onClick={makeQuote} disabled={busy||quantity<=0||!draftReady} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?t(UI.pricing):(label||t(UI.defaultLabel))}</button>
  :<div className="flex flex-wrap items-center gap-3"><div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-2.5 text-sm">{t(UI.thisTime)} {quote.quantity} {toolId==="food-calorie"?foodBillingText(lang,quote.unit_name==="food"?"foodUnit":"imageUnit"):unitLabel(quote.unit_name,zh)} · <b className="text-lg">{price(quote)}</b></div><button onClick={pay} disabled={busy||!draftReady} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{t(UI.confirm)}</button><button onClick={()=>{stop();clearStoredQuote(toolId);setQuote(null);setMsg("")}} className="rounded-xl border border-[var(--lx-line)] px-4 py-2.5 text-sm text-[var(--lx-muted)]">{t(UI.recalc)}</button></div>}
  {msg&&<p className="mt-2 text-xs leading-5 text-[var(--lx-muted)]">{msg}</p>}
  {toolId==='food-calorie'&&msg===foodBillingText(lang,'login')&&<a className="mt-2 inline-block underline" href={`/account?next=${encodeURIComponent('/tools/food-calorie?resumeDraft='+(draftId||''))}`}>{foodBillingText(lang,'login')}</a>}
 </div>;
}
