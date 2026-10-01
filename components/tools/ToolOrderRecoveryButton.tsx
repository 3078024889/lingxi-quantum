"use client";
import{useState}from"react";import{useRouter}from"next/navigation";import{useLingxiLang,type LingxiLang}from"@/lib/lingxi-i18n";
type Copy=Record<LingxiLang,string>;const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});
const COPY={recover:c("继续这次已付款任务","Resume this paid task","支払い済み作業を続ける","결제한 작업 계속","Reprendre cette tâche payée","Bezahlte Aufgabe fortsetzen","Continuar esta tarea pagada","Continuar esta tarefa paga","متابعة هذه المهمة المدفوعة"),checking:c("正在恢复…","Restoring…","復元中…","복원 중…","Restauration…","Wird wiederhergestellt…","Restaurando…","Restaurando…","جارٍ الاستعادة…"),ready:c("已确认原支付，不会重复收费。","Original payment confirmed. You will not be charged again.","元の支払いを確認しました。","기존 결제가 확인되었습니다.","Paiement initial confirmé.","Ursprüngliche Zahlung bestätigt.","Pago original confirmado.","Pagamento original confirmado.","تم تأكيد الدفعة الأصلية."),failed:c("暂时无法恢复，请稍后再试；不会产生新的收费。","Could not restore right now. Try again later; no new charge was created.","今は復元できません。","지금 복원할 수 없습니다.","Impossible de restaurer maintenant.","Derzeit nicht wiederherstellbar.","No se pudo restaurar ahora.","Não foi possível restaurar agora.","تعذر الاستعادة الآن.")};
export default function ToolOrderRecoveryButton({quoteId}:{quoteId:string}){
 const{lang}=useLingxiLang();const t=(x:Copy)=>x[lang]||x.en;const router=useRouter();const[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function recover(){if(busy)return;setBusy(true);setMessage(t(COPY.checking));try{
  const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(quoteId)}`,{cache:"no-store"}),d=await r.json().catch(()=>({}));
  if(!r.ok||!d.paid)throw new Error(String(d.error||"NOT_PAID"));
  const q=d.quote||{},grant=d.grant||{},toolId=String(q.toolId||grant.tool_id||"").trim(),quantity=Number(q.quantity||grant.quantity||0),meta=(q.metadata&&typeof q.metadata==="object")?q.metadata:{};
  if(!toolId||!Number.isFinite(quantity)||quantity<=0)throw new Error("RECOVERY_METADATA_MISSING");
  const draftId=String(meta.draftId||""),returnPath=String(meta.returnPath||`/tools/${toolId}`);
  try{localStorage.setItem(`lingxifield:paid-export:quote:${toolId}`,JSON.stringify({id:quoteId,toolId,quantity,currency:meta.pricing_currency||undefined,expiresAt:q.expiresAt||"",draftId}))}catch{}
  setMessage(t(COPY.ready));const u=new URL(returnPath,location.origin);u.searchParams.set("resumeQuote",quoteId);if(draftId)u.searchParams.set("resumeDraft",draftId);router.push(u.pathname+u.search);
 }catch{setMessage(t(COPY.failed))}finally{setBusy(false)}}
 return <div className="mt-3"><button type="button" onClick={recover} disabled={busy} className="rounded-lg border border-[var(--lx-line-strong)] bg-[var(--lx-panel)] px-4 py-2 text-xs font-medium text-[var(--lx-ink)] disabled:opacity-50">{busy?t(COPY.checking):t(COPY.recover)}</button>{message&&<p className="mt-2 text-xs leading-5 text-[var(--lx-muted)]">{message}</p>}</div>
}
