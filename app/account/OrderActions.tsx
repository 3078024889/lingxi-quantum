"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Copy=Record<LingxiLang,string>;
const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});

const UI={
 unlock:c("支付已确认，但解锁出现问题：","Payment confirmed, but unlocking failed: ","支払いは確認されましたが、解除に問題があります：","결제는 확인됐지만 잠금 해제에 문제가 있습니다: ","Paiement confirmé, mais le déverrouillage a échoué : ","Zahlung bestätigt, aber Freischaltung fehlgeschlagen: ","Pago confirmado, pero falló el desbloqueo: ","Pagamento confirmado, mas o desbloqueio falhou: ","تم تأكيد الدفع لكن حدثت مشكلة في الفتح: "),
 none:c("还没查到支付记录。","No payment record found yet.","まだ支払い記録が見つかりません。","아직 결제 기록을 찾지 못했습니다.","Aucun paiement trouvé pour le moment.","Noch kein Zahlungsnachweis gefunden.","Aún no se encontró el pago.","Ainda não encontramos o pagamento.","لم يتم العثور على سجل دفع بعد."),
 queryErr:c("查询出错，请稍后再试。","Could not check the order. Try again later.","注文を確認できませんでした。後で再試行してください。","주문을 확인할 수 없습니다. 나중에 다시 시도하세요.","Impossible de vérifier la commande. Réessayez plus tard.","Bestellung konnte nicht geprüft werden. Bitte später erneut versuchen.","No se pudo consultar el pedido. Inténtalo más tarde.","Não foi possível consultar o pedido. Tente novamente mais tarde.","تعذر التحقق من الطلب. حاول لاحقًا."),
 confirm:c("确定要删除这笔待支付订单吗？删除后无法恢复。如果已经付款，请先查询确认，不要直接删除。","Delete this unpaid order? This cannot be undone. If you already paid, check the order first.","この未払い注文を削除しますか？元に戻せません。支払い済みなら先に確認してください。","이 미결제 주문을 삭제할까요? 되돌릴 수 없습니다. 이미 결제했다면 먼저 조회하세요.","Supprimer cette commande impayée ? Cette action est irréversible. Si vous avez déjà payé, vérifiez d’abord.","Diese unbezahlte Bestellung löschen? Dies kann nicht rückgängig gemacht werden. Bei bereits erfolgter Zahlung zuerst prüfen.","¿Eliminar este pedido pendiente? No se puede deshacer. Si ya pagaste, compruébalo primero.","Excluir este pedido pendente? Não é possível desfazer. Se já pagou, verifique primeiro.","هل تريد حذف هذا الطلب غير المدفوع؟ لا يمكن التراجع. إذا كنت قد دفعت بالفعل فتحقق أولًا."),
 deleteErr:c("删除失败，请稍后再试。","Delete failed. Try again later.","削除できませんでした。後でもう一度お試しください。","삭제하지 못했습니다. 나중에 다시 시도하세요.","Échec de la suppression. Réessayez plus tard.","Löschen fehlgeschlagen. Bitte später erneut versuchen.","No se pudo eliminar. Inténtalo más tarde.","Falha ao excluir. Tente novamente mais tarde.","فشل الحذف. حاول لاحقًا."),
 checking:c("查询中…","Checking…","確認中…","조회 중…","Vérification…","Prüfung…","Comprobando…","Verificando…","جارٍ التحقق…"),
 check:c("查询这笔订单","Check this order","この注文を確認","이 주문 조회","Vérifier cette commande","Bestellung prüfen","Comprobar pedido","Verificar pedido","تحقق من هذا الطلب"),
 deleting:c("删除中…","Deleting…","削除中…","삭제 중…","Suppression…","Löschen…","Eliminando…","Excluindo…","جارٍ الحذف…"),
 delete:c("删除","Delete","削除","삭제","Supprimer","Löschen","Eliminar","Excluir","حذف"),
};

export default function OrderActions({orderId}:{orderId:string}){
 const router=useRouter();const{lang}=useLingxiLang();const t=(x:Copy)=>x[lang];
 const[checking,setChecking]=useState(false),[deleting,setDeleting]=useState(false),[message,setMessage]=useState("");
 const check=async()=>{setChecking(true);setMessage("");try{const res=await fetch(`/api/pay/wechat/query?orderId=${orderId}`);const data=await res.json();if(data.paid)router.refresh();else if(data.unlockError)setMessage(t(UI.unlock)+data.unlockError);else setMessage(t(UI.none))}catch{setMessage(t(UI.queryErr))}finally{setChecking(false)}};
 const remove=async()=>{if(!window.confirm(t(UI.confirm)))return;setDeleting(true);try{const res=await fetch("/api/pay/order/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId})});if(res.ok)router.refresh();else setMessage(t(UI.deleteErr))}catch{setMessage(t(UI.deleteErr))}finally{setDeleting(false)}};
 return <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
  <button onClick={check} disabled={checking} className="border border-lattice/40 px-4 py-1.5 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice disabled:opacity-50">{checking?t(UI.checking):t(UI.check)}</button>
  <button onClick={remove} disabled={deleting} className="border border-rose/30 px-3 py-1.5 text-xs text-rose/80 transition hover:border-rose hover:text-rose disabled:opacity-50">{deleting?t(UI.deleting):t(UI.delete)}</button>
  {message&&<p className="w-full text-xs text-bone-dim">{message}</p>}
 </div>;
}
