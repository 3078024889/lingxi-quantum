"use client";

import Link from "next/link";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";
import ToolOrderRecoveryButton from "@/components/tools/ToolOrderRecoveryButton";

export type AccountOrderViewRow={
  id:string;product_id:string;amount_rmb:number|null;amount_usd:number|null;
  status:string;provider:string|null;created_at:string;paid_at:string|null;
  group:string|null;nameZh:string|null;nameEn:string|null;
};
type Props={signedIn:boolean;loadFailed:boolean;paymentState:"pending"|"error"|null;orders:AccountOrderViewRow[]};
type Copy={
 account:string;title:string;back:string;lead:string;pending:string;error:string;signin:string;loadFailed:string;empty:string;
 order:string;tool:string;other:string;aiTopup:string;sasiTopup:string;viewAi:string;viewSasi:string;
 pendingStatus:string;paid:string;failed:string;refunded:string;cancelled:string;otherPay:string;wechat:string;alipay:string;
};
const D:Record<LingxiLang,Copy>={
 zh:{account:"账户",title:"订单与使用记录",back:"返回账户",lead:"充值、工具处理和已经完成的付款都留在这里，方便你随时回来核对。",pending:"付款已经返回，正在确认到账。请不要重复支付；确认完成后余额会自动更新。",error:"这次付款还没有确认到账。请先查看下面的订单状态；未确认前不会增加余额。",signin:"请先登录查看订单。",loadFailed:"订单暂时无法读取，请刷新重试。",empty:"还没有订单。",order:"订单号",tool:"实用工具任务",other:"其他历史记录",aiTopup:"AI 余额充值",sasiTopup:"SASI 创作余额充值",viewAi:"查看 AI 余额",viewSasi:"查看 SASI 余额",pendingStatus:"等待付款",paid:"已到账",failed:"未完成",refunded:"已退款",cancelled:"已取消",otherPay:"其他支付",wechat:"微信支付",alipay:"支付宝"},
 en:{account:"Account",title:"Orders & usage",back:"Back to account",lead:"Top-ups, paid tool runs and completed payments stay here so you can check them whenever needed.",pending:"Your payment has returned and is being confirmed. Do not pay again; the balance will update automatically once confirmed.",error:"This payment has not been confirmed yet. Check the order below; your balance will not change before confirmation.",signin:"Please sign in to view orders.",loadFailed:"Orders could not be loaded. Refresh and try again.",empty:"No orders yet.",order:"Order",tool:"Utility tool task",other:"Other historical record",aiTopup:"AI balance top-up",sasiTopup:"SASI creation balance top-up",viewAi:"View AI balance",viewSasi:"View SASI balance",pendingStatus:"Awaiting payment",paid:"Paid",failed:"Not completed",refunded:"Refunded",cancelled:"Cancelled",otherPay:"Other payment",wechat:"WeChat Pay",alipay:"Alipay"},
 ja:{account:"アカウント",title:"注文と利用履歴",back:"アカウントへ戻る",lead:"チャージ、ツール処理、完了した支払いをここでいつでも確認できます。",pending:"支払いから戻りました。現在入金確認中です。重複して支払わないでください。確認後、残高は自動更新されます。",error:"この支払いはまだ確認されていません。下の注文状態を確認してください。確認前に残高は増えません。",signin:"注文を見るにはログインしてください。",loadFailed:"注文を読み込めませんでした。更新してもう一度お試しください。",empty:"注文はまだありません。",order:"注文番号",tool:"実用ツール作業",other:"その他の履歴",aiTopup:"AI 残高チャージ",sasiTopup:"SASI 制作残高チャージ",viewAi:"AI 残高を見る",viewSasi:"SASI 残高を見る",pendingStatus:"支払い待ち",paid:"入金済み",failed:"未完了",refunded:"返金済み",cancelled:"キャンセル済み",otherPay:"その他の支払い",wechat:"WeChat Pay",alipay:"Alipay"},
 ko:{account:"계정",title:"주문 및 사용 기록",back:"계정으로 돌아가기",lead:"충전, 유료 도구 작업, 완료된 결제 내역을 언제든 여기서 확인할 수 있습니다.",pending:"결제에서 돌아왔으며 입금 확인 중입니다. 중복 결제하지 마세요. 확인되면 잔액이 자동으로 업데이트됩니다.",error:"이번 결제는 아직 확인되지 않았습니다. 아래 주문 상태를 확인하세요. 확인 전에는 잔액이 증가하지 않습니다.",signin:"주문을 보려면 먼저 로그인하세요.",loadFailed:"주문을 불러오지 못했습니다. 새로고침 후 다시 시도하세요.",empty:"아직 주문이 없습니다.",order:"주문 번호",tool:"실용 도구 작업",other:"기타 기록",aiTopup:"AI 잔액 충전",sasiTopup:"SASI 창작 잔액 충전",viewAi:"AI 잔액 보기",viewSasi:"SASI 잔액 보기",pendingStatus:"결제 대기",paid:"결제 완료",failed:"미완료",refunded:"환불 완료",cancelled:"취소됨",otherPay:"기타 결제",wechat:"WeChat Pay",alipay:"Alipay"},
 fr:{account:"Compte",title:"Commandes et utilisation",back:"Retour au compte",lead:"Recharges, traitements payants et paiements terminés restent ici pour être vérifiés à tout moment.",pending:"Le paiement est revenu et sa confirmation est en cours. Ne payez pas une seconde fois ; le solde se mettra à jour automatiquement après confirmation.",error:"Ce paiement n’est pas encore confirmé. Vérifiez l’état de la commande ci-dessous ; le solde ne changera pas avant confirmation.",signin:"Connectez-vous pour voir vos commandes.",loadFailed:"Impossible de charger les commandes. Actualisez et réessayez.",empty:"Aucune commande pour le moment.",order:"Commande",tool:"Tâche d’outil",other:"Autre historique",aiTopup:"Recharge de solde IA",sasiTopup:"Recharge de solde SASI",viewAi:"Voir le solde IA",viewSasi:"Voir le solde SASI",pendingStatus:"En attente de paiement",paid:"Payé",failed:"Non terminé",refunded:"Remboursé",cancelled:"Annulé",otherPay:"Autre paiement",wechat:"WeChat Pay",alipay:"Alipay"},
 de:{account:"Konto",title:"Bestellungen & Nutzung",back:"Zurück zum Konto",lead:"Aufladungen, bezahlte Werkzeugläufe und abgeschlossene Zahlungen bleiben hier jederzeit nachvollziehbar.",pending:"Die Zahlung ist zurückgekehrt und wird bestätigt. Bitte nicht erneut zahlen; das Guthaben aktualisiert sich nach Bestätigung automatisch.",error:"Diese Zahlung wurde noch nicht bestätigt. Prüfen Sie unten den Bestellstatus; vor der Bestätigung ändert sich das Guthaben nicht.",signin:"Bitte anmelden, um Bestellungen zu sehen.",loadFailed:"Bestellungen konnten nicht geladen werden. Aktualisieren und erneut versuchen.",empty:"Noch keine Bestellungen.",order:"Bestellung",tool:"Werkzeugaufgabe",other:"Sonstiger Verlauf",aiTopup:"KI-Guthabenaufladung",sasiTopup:"SASI-Erstellungsguthaben",viewAi:"KI-Guthaben ansehen",viewSasi:"SASI-Guthaben ansehen",pendingStatus:"Zahlung ausstehend",paid:"Bezahlt",failed:"Nicht abgeschlossen",refunded:"Erstattet",cancelled:"Storniert",otherPay:"Andere Zahlung",wechat:"WeChat Pay",alipay:"Alipay"},
 es:{account:"Cuenta",title:"Pedidos y uso",back:"Volver a la cuenta",lead:"Las recargas, tareas de herramientas pagadas y pagos completados quedan aquí para que puedas revisarlos cuando quieras.",pending:"El pago ha vuelto y se está confirmando. No pagues de nuevo; el saldo se actualizará automáticamente al confirmarse.",error:"Este pago aún no está confirmado. Revisa el estado del pedido abajo; el saldo no cambiará antes de la confirmación.",signin:"Inicia sesión para ver tus pedidos.",loadFailed:"No se pudieron cargar los pedidos. Actualiza e inténtalo de nuevo.",empty:"Aún no hay pedidos.",order:"Pedido",tool:"Tarea de herramienta",other:"Otro historial",aiTopup:"Recarga de saldo IA",sasiTopup:"Recarga de saldo SASI",viewAi:"Ver saldo IA",viewSasi:"Ver saldo SASI",pendingStatus:"Esperando pago",paid:"Pagado",failed:"No completado",refunded:"Reembolsado",cancelled:"Cancelado",otherPay:"Otro pago",wechat:"WeChat Pay",alipay:"Alipay"},
 pt:{account:"Conta",title:"Pedidos e uso",back:"Voltar à conta",lead:"Recargas, tarefas pagas de ferramentas e pagamentos concluídos ficam aqui para você conferir quando quiser.",pending:"O pagamento retornou e está sendo confirmado. Não pague novamente; o saldo será atualizado automaticamente após a confirmação.",error:"Este pagamento ainda não foi confirmado. Confira o estado do pedido abaixo; o saldo não muda antes da confirmação.",signin:"Entre para ver seus pedidos.",loadFailed:"Não foi possível carregar os pedidos. Atualize e tente novamente.",empty:"Ainda não há pedidos.",order:"Pedido",tool:"Tarefa de ferramenta",other:"Outro histórico",aiTopup:"Recarga de saldo IA",sasiTopup:"Recarga de saldo SASI",viewAi:"Ver saldo IA",viewSasi:"Ver saldo SASI",pendingStatus:"Aguardando pagamento",paid:"Pago",failed:"Não concluído",refunded:"Reembolsado",cancelled:"Cancelado",otherPay:"Outro pagamento",wechat:"WeChat Pay",alipay:"Alipay"},
 ar:{account:"الحساب",title:"الطلبات والاستخدام",back:"العودة إلى الحساب",lead:"تبقى عمليات الشحن والمهام المدفوعة والمدفوعات المكتملة هنا لتتمكن من مراجعتها في أي وقت.",pending:"عاد الدفع وهو قيد التأكيد. لا تدفع مرة أخرى؛ سيتحدث الرصيد تلقائيًا بعد التأكيد.",error:"لم يتم تأكيد هذا الدفع بعد. راجع حالة الطلب أدناه؛ لن يتغير الرصيد قبل التأكيد.",signin:"سجّل الدخول لعرض الطلبات.",loadFailed:"تعذر تحميل الطلبات. حدّث الصفحة وحاول مجددًا.",empty:"لا توجد طلبات بعد.",order:"طلب",tool:"مهمة أداة",other:"سجل آخر",aiTopup:"شحن رصيد الذكاء الاصطناعي",sasiTopup:"شحن رصيد SASI",viewAi:"عرض رصيد AI",viewSasi:"عرض رصيد SASI",pendingStatus:"بانتظار الدفع",paid:"مدفوع",failed:"غير مكتمل",refunded:"تم الاسترداد",cancelled:"ملغى",otherPay:"دفعة أخرى",wechat:"WeChat Pay",alipay:"Alipay"}
};

const locale=(lang:LingxiLang)=>lang==="zh"?"zh-CN":lang;
const status=(c:Copy,s:string)=>s==="pending"?c.pendingStatus:s==="paid"?c.paid:s==="failed"?c.failed:s==="refunded"?c.refunded:s==="cancelled"?c.cancelled:s;
const provider=(c:Copy,p:string|null)=>p==="paypal"?"PayPal":p==="wechat"?c.wechat:p==="alipay"?c.alipay:c.otherPay;

function productLabel(c:Copy,o:AccountOrderViewRow,lang:LingxiLang){
  if(o.product_id.startsWith("toolquote:"))return c.tool;
  if(o.product_id.startsWith("ai-usd-balance-")||o.product_id.startsWith("ai-balance-"))return c.aiTopup;
  if(o.product_id.startsWith("sasi-usd-balance-")||o.product_id.startsWith("sasi-balance-")||o.product_id.startsWith("sasi-credit-"))return c.sasiTopup;
  if(lang==="zh"&&o.nameZh)return o.nameZh;
  if(o.nameEn)return o.nameEn;
  return c.other;
}

export default function AccountOrdersHistory({signedIn,loadFailed,paymentState,orders}:Props){
 const{lang}=useLingxiLang();const c=D[lang]??D.en;
 return <div className="mx-auto max-w-3xl px-6 py-20">
   <div className="flex items-start justify-between gap-4">
     <div><div className="lx-page-title-line"><LingxiMiniIcon name="orders" size="title"/><p className="lx11-kicker">{c.account}</p></div><h1 className="mt-3 font-display text-3xl text-[var(--lx-ink)]">{c.title}</h1></div>
     <Link href="/account" className="text-sm text-[var(--lx-muted)]">← {c.back}</Link>
   </div>
   <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">{c.lead}</p>

   {paymentState==="pending"&&<p role="status" className="mt-6 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-sm text-[var(--lx-ink)]">{c.pending}</p>}
   {paymentState==="error"&&<p role="alert" className="mt-6 rounded-2xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-ink)]">{c.error}</p>}
   {!signedIn&&<p className="mt-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 text-[var(--lx-muted)]">{c.signin}</p>}
   {loadFailed&&<p role="alert" className="mt-8 rounded-2xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-[var(--lx-ink)]">{c.loadFailed}</p>}
   {signedIn&&!loadFailed&&orders.length===0&&<p className="mt-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 text-[var(--lx-muted)]">{c.empty}</p>}

   <div className="mt-8 space-y-3">
    {orders.map(o=>{
      const amount=o.provider==="paypal"&&o.amount_usd!=null?`$${Number(o.amount_usd).toFixed(2)}`:o.amount_rmb!=null?`¥${Number(o.amount_rmb).toFixed(2)}`:o.amount_usd!=null?`$${Number(o.amount_usd).toFixed(2)}`:"—";
      const tool=o.product_id.startsWith("toolquote:");
      const viewAi=o.group==="ai"||o.product_id.startsWith("ai-usd-balance-");
      const viewSasi=o.group==="production"||o.product_id.startsWith("sasi-usd-balance-");
      return <article key={o.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 lx-order-card">
       <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 lx-order-main"><LingxiMiniIcon name={tool?"tools":viewSasi?"sasi":viewAi?"wallet":"orders"} size="title"/><div>
         <p className="text-[11px] text-[var(--lx-faint)]">{c.order} {o.id}</p>
         <h2 className="mt-2 font-display text-lg text-[var(--lx-ink)]">{productLabel(c,o,lang)}</h2>
         <p className="mt-2 text-xs text-[var(--lx-muted)]">{new Date(o.created_at).toLocaleString(locale(lang))} · {provider(c,o.provider)}</p>
        </div></div>
        <div className="text-right lx-order-side"><b className="text-lg text-[var(--lx-ink)]">{amount}</b><p className={`mt-1 text-xs lx-order-status status-${o.status}`}>{status(c,o.status)}</p></div>
       </div>
       {viewAi&&<Link href="/ai-wallet" className="mt-4 inline-block text-sm text-[var(--lx-ink)]">{c.viewAi} →</Link>}
       {viewSasi&&<Link href="/sasi/pricing" className="mt-4 inline-block text-sm text-[var(--lx-ink)]">{c.viewSasi} →</Link>}
       {tool&&<div className="mt-4"><ToolOrderRecoveryButton quoteId={o.product_id.slice("toolquote:".length)}/></div>}
      </article>
    })}
   </div>
 </div>;
}
