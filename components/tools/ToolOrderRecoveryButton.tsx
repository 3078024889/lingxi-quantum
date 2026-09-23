"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Copy=Record<LingxiLang,string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});
const COPY={
  recover:c("恢复这次工具任务","Resume this tool task","このツール作業を復元","이 도구 작업 복구","Reprendre cette tâche","Diesen Tool-Vorgang fortsetzen","Reanudar esta tarea","Retomar esta tarefa","استئناف مهمة الأداة"),
  checking:c("正在核验原支付记录…","Checking the original payment…","元の支払いを確認中…","기존 결제 확인 중…","Vérification du paiement initial…","Ursprüngliche Zahlung wird geprüft…","Verificando el pago original…","Verificando o pagamento original…","جارٍ التحقق من الدفعة الأصلية…"),
  ready:c("原支付已确认。不会重复收费，正在返回工具继续处理。","Original payment confirmed. No new charge will be created; returning to the tool.","元の支払いを確認しました。再課金せずツールへ戻ります。","기존 결제가 확인되었습니다. 추가 결제 없이 도구로 돌아갑니다.","Paiement initial confirmé. Aucun nouveau débit ; retour à l’outil.","Ursprüngliche Zahlung bestätigt. Keine neue Belastung; zurück zum Werkzeug.","Pago original confirmado. No se generará un nuevo cargo; volviendo a la herramienta.","Pagamento original confirmado. Nenhuma nova cobrança; voltando à ferramenta.","تم تأكيد الدفعة الأصلية. لن يتم إنشاء رسوم جديدة؛ جارٍ العودة إلى الأداة."),
  unpaid:c("这笔记录尚未确认到账，请使用“继续付款 / 恢复确认”。","This record is not confirmed as paid yet. Use “Continue payment / recover”.","この記録はまだ支払い確認されていません。「支払いを続ける / 復元」を使用してください。","이 기록은 아직 결제가 확인되지 않았습니다. ‘결제 계속 / 복구’를 사용하세요.","Ce paiement n’est pas encore confirmé. Utilisez « Continuer le paiement / récupérer ».","Diese Zahlung ist noch nicht bestätigt. Nutzen Sie „Zahlung fortsetzen / wiederherstellen“.","Este pago aún no está confirmado. Usa «Continuar pago / recuperar».","Este pagamento ainda não foi confirmado. Use “Continuar pagamento / recuperar”.","لم يتم تأكيد هذه الدفعة بعد. استخدم «متابعة الدفع / الاستعادة»."),
  failed:c("暂时无法恢复这次任务，请稍后再试。不会因此产生新的收费。","Could not restore this task right now. Try again later; no new charge was created.","この作業を今は復元できません。後でもう一度お試しください。新たな課金は発生しません。","지금 이 작업을 복구할 수 없습니다. 나중에 다시 시도하세요. 추가 결제는 발생하지 않습니다.","Impossible de reprendre cette tâche pour le moment. Réessayez plus tard ; aucun nouveau débit n’a été créé.","Dieser Vorgang kann derzeit nicht fortgesetzt werden. Versuchen Sie es später erneut; es wurde keine neue Belastung erstellt.","No se pudo reanudar esta tarea ahora. Inténtalo más tarde; no se creó ningún cargo nuevo.","Não foi possível retomar esta tarefa agora. Tente novamente mais tarde; nenhuma nova cobrança foi criada.","تعذر استئناف هذه المهمة الآن. حاول لاحقًا؛ لم يتم إنشاء أي رسوم جديدة."),
};

export default function ToolOrderRecoveryButton({quoteId}:{quoteId:string}){
  const {lang}=useLingxiLang();
  const t=(x:Copy)=>x[lang]||x.en;
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  async function recover(){
    if(busy)return;
    setBusy(true);setMessage(t(COPY.checking));
    try{
      const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(quoteId)}`,{cache:"no-store"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||`RECOVERY_${r.status}`);
      if(!d.paid){
        setMessage(t(COPY.unpaid));
        return;
      }
      const q=d.quote||{},grant=d.grant||{};
      const toolId=String(q.toolId||grant.tool_id||"").trim();
      const quantity=Number(q.quantity||grant.quantity||0);
      const expiresAt=String(q.expiresAt||"");
      if(!toolId||!Number.isFinite(quantity)||quantity<=0)throw new Error("RECOVERY_METADATA_MISSING");
      try{
        localStorage.setItem(`lingxifield:paid-tool:quote:${toolId}`,JSON.stringify({id:quoteId,toolId,quantity,expiresAt,paid:true}));
      }catch{}
      setMessage(t(COPY.ready));
      router.push(`/tools/${encodeURIComponent(toolId)}?resumeQuote=${encodeURIComponent(quoteId)}`);
    }catch{
      setMessage(t(COPY.failed));
    }finally{
      setBusy(false);
    }
  }

  return <div className="mt-3">
    <button type="button" onClick={recover} disabled={busy}
      className="rounded-lg border border-[var(--lx-line-strong)] bg-[var(--lx-panel)] px-4 py-2 text-xs font-medium text-[var(--lx-ink)] disabled:cursor-not-allowed disabled:opacity-50">
      {busy?t(COPY.checking):t(COPY.recover)}
    </button>
    {message&&<p className="mt-2 text-xs leading-5 text-[var(--lx-muted)]">{message}</p>}
  </div>;
}
