"use client";

import { useEffect, useRef, useState } from "react";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Quote={id:string;tool_id:string;quantity:number;unit_name:string;amount_rmb:number;expires_at:string};
type Copy=Record<LingxiLang,string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});

const UI={
 defaultLabel:c("继续","Continue","続ける","계속","Continuer","Weiter","Continuar","Continuar","متابعة"),
 paid:c("支付已确认，开始处理…","Payment confirmed. Processing…","支払いを確認しました。処理を開始します…","결제가 확인되었습니다. 처리를 시작합니다…","Paiement confirmé. Traitement…","Zahlung bestätigt. Verarbeitung…","Pago confirmado. Procesando…","Pagamento confirmado. Processando…","تم تأكيد الدفع. جارٍ المعالجة…"),
 quoteFail:c("创建报价失败","Could not create quote","見積を作成できませんでした","견적을 만들지 못했습니다","Impossible de créer le devis","Angebot konnte nicht erstellt werden","No se pudo crear el presupuesto","Não foi possível criar a cotação","تعذر إنشاء عرض السعر"),
 priced:c("价格已由服务器计算。确认后再调用付费模型。","Price calculated by the server. Confirm before calling the paid model.","価格はサーバーで計算済みです。確認後に有料モデルを呼び出します。","가격은 서버에서 계산되었습니다. 확인 후 유료 모델을 호출합니다.","Prix calculé par le serveur. Confirmez avant d’appeler le modèle payant.","Preis serverseitig berechnet. Vor dem kostenpflichtigen Modell bestätigen.","Precio calculado por el servidor. Confirma antes de usar el modelo de pago.","Preço calculado pelo servidor. Confirme antes de usar o modelo pago.","تم حساب السعر على الخادم. أكّد قبل تشغيل النموذج المدفوع."),
 waiting:c("等待支付确认…","Waiting for payment confirmation…","支払い確認待ち…","결제 확인 대기 중…","En attente du paiement…","Warten auf Zahlungsbestätigung…","Esperando confirmación del pago…","Aguardando confirmação do pagamento…","بانتظار تأكيد الدفع…"),
 pricing:c("正在计算价格…","Calculating price…","価格計算中…","가격 계산 중…","Calcul du prix…","Preis wird berechnet…","Calculando precio…","Calculando preço…","جارٍ حساب السعر…"),
 thisTime:c("本次","This time","今回","이번","Cette fois","Diesmal","Esta vez","Desta vez","هذه المرة"),
 confirm:c("确认并付款","Confirm & pay","確認して支払う","확인 후 결제","Confirmer et payer","Bestätigen & bezahlen","Confirmar y pagar","Confirmar e pagar","تأكيد ودفع"),
 recalc:c("重新计算","Recalculate","再計算","다시 계산","Recalculer","Neu berechnen","Recalcular","Recalcular","إعادة الحساب"),
};

export default function PaidActionButton({toolId,quantity,metadata,onPaid,label}:{toolId:string;quantity:number;metadata?:Record<string,unknown>;onPaid:(quoteId:string)=>Promise<void>|void;label?:string}){
 const{lang}=useLingxiLang();const t=(x:Copy)=>x[lang];
 const[quote,setQuote]=useState<Quote|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 const timer=useRef<ReturnType<typeof setInterval>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearInterval(timer.current)},[]);
 async function checkPaid(id:string){const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(id)}`,{cache:"no-store"});if(!r.ok)return false;const d=await r.json();if(!d.paid)return false;if(timer.current)clearInterval(timer.current);setMsg(t(UI.paid));await onPaid(id);return true}
 async function makeQuote(){setBusy(true);setMsg("");try{const r=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({toolId,quantity,metadata:metadata||{}})});const d=await r.json();if(!r.ok)throw new Error(d.error||t(UI.quoteFail));setQuote(d);setMsg(t(UI.priced))}catch(e){setMsg(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 async function pay(){if(!quote)return;window.open(`/tools/pay?quoteId=${encodeURIComponent(quote.id)}`,"lingxi_tool_pay","width=720,height=820");if(timer.current)clearInterval(timer.current);timer.current=setInterval(()=>checkPaid(quote.id),2200);setMsg(t(UI.waiting))}
 const changed=quote&&Number(quote.quantity)!==Number(quantity);
 return <div>
  {!quote||changed?<button onClick={makeQuote} disabled={busy||quantity<=0} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40">{busy?t(UI.pricing):(label||t(UI.defaultLabel))}</button>:<div className="flex flex-wrap items-center gap-3"><div className="rounded-2xl bg-blue-50 px-4 py-2.5 text-sm text-blue-900">{t(UI.thisTime)} {quote.quantity} {quote.unit_name} · <b className="text-lg">¥{quote.amount_rmb}</b></div><button onClick={pay} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white">{t(UI.confirm)}</button><button onClick={()=>setQuote(null)} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-600">{t(UI.recalc)}</button></div>}
  {msg&&<p className="mt-2 text-xs leading-5 text-slate-500">{msg}</p>}
 </div>;
}
