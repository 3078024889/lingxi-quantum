"use client";
import {useEffect,useMemo,useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";

type Order={id:string;product_id:string;provider:string|null;amount_rmb:number|null;amount_usd:number|null;created_at:string};
type Withdrawal={id:string;order_id:string;provider:string;currency:string;provider_currency:string;amount_minor:number;provider_amount_minor:number;status:string;provider_status:string|null;failure_code:string|null;created_at:string;completed_at:string|null};
type Data={orders:Order[];withdrawals:Withdrawal[]};
type C={loadFail:string;invalid:string;confirm:string;done:string;submitted:string;loading:string;eligibleTitle:string;eligibleDesc:string;emptyEligible:string;principal:string;topup:string;amountLabel:string;processing:string;submitting:string;return:string;history:string;emptyHistory:string;completed:string;requested:string;failed:string;wechat:string;alipay:string;other:string;original:string};

const D:Record<LingxiLang,C>={
 zh:{loadFail:"读取失败",invalid:"请输入不超过该订单充值本金的有效金额。",confirm:"确认申请退回 {amount} 的未使用充值本金？退款会回到原支付渠道。",done:"已退回原支付方式。",submitted:"提现申请已提交，到账时间以原支付方式为准。",loading:"正在查询可提现余额…",eligibleTitle:"可提现余额",eligibleDesc:"只退未使用的真实充值本金。赠送额度、邀请奖励、已消耗金额和任务中冻结的金额不属于可退本金。",emptyEligible:"当前没有可提现余额。",principal:"可提现余额",topup:"余额充值",amountLabel:"提现金额",processing:"提现处理中",submitting:"正在提交…",return:"申请提现",history:"提现记录",emptyHistory:"还没有提现记录。",completed:"已申请提现",requested:"已提交",failed:"失败，余额已释放",wechat:"微信支付",alipay:"支付宝",other:"其他支付",original:"申请提现"},
 en:{loadFail:"Could not load refund data.",invalid:"Enter a valid amount no greater than this top-up principal.",confirm:"Request a refund of {amount} from the unused paid principal? It will return to the original payment method.",done:"The original payment provider has confirmed the refund.",submitted:"Refund submitted. The requested amount is reserved while the payment provider confirms it.",loading:"Loading refundable balance…",eligibleTitle:"Top-ups eligible for refund",eligibleDesc:"Only unused paid principal can be refunded. Bonus credit, referral rewards, spent amounts and funds reserved by active tasks are excluded.",emptyEligible:"There are no paid balance top-ups eligible for refund right now.",principal:"paid principal",topup:"balance top-up",amountLabel:"Refund amount",processing:"Refund processing",submitting:"Submitting…",return:"Return to original method",history:"Refund history",emptyHistory:"No refund history yet.",completed:"Returned to original method",requested:"Submitted",failed:"Failed · balance released",wechat:"WeChat Pay",alipay:"Alipay",other:"Other payment",original:"Returned"},
 ja:{loadFail:"返金情報を読み込めませんでした。",invalid:"このチャージ元本を超えない有効な金額を入力してください。",confirm:"未使用の入金元本 {amount} の返金を申請しますか？元の支払い方法へ戻ります。",done:"元の決済サービスで返金完了が確認されました。",submitted:"返金申請を送信しました。申請額は決済サービスの確認中、確保されます。",loading:"返金可能残高を読み込み中…",eligibleTitle:"返金申請できるチャージ",eligibleDesc:"返金対象は未使用の実入金元本のみです。特典、紹介報酬、使用済み金額、処理中タスクの確保額は含まれません。",emptyEligible:"現在、返金申請可能な支払い済みチャージはありません。",principal:"入金元本",topup:"残高チャージ",amountLabel:"返金額",processing:"返金処理中",submitting:"送信中…",return:"元の支払い方法へ返金",history:"返金履歴",emptyHistory:"返金履歴はまだありません。",completed:"返金済み",requested:"申請済み",failed:"失敗・残高解放済み",wechat:"WeChat Pay",alipay:"Alipay",other:"その他の支払い",original:"返金"},
 ko:{loadFail:"환불 정보를 불러오지 못했습니다.",invalid:"해당 충전 원금을 넘지 않는 유효한 금액을 입력하세요.",confirm:"사용하지 않은 충전 원금 {amount}의 환불을 신청할까요? 원 결제수단으로 돌아갑니다.",done:"원 결제수단에서 환불 완료가 확인되었습니다.",submitted:"환불 신청이 제출되었습니다. 결제수단 확인 동안 신청 금액은 예약됩니다.",loading:"환불 가능 잔액 불러오는 중…",eligibleTitle:"환불 신청 가능한 충전",eligibleDesc:"사용하지 않은 실제 충전 원금만 환불됩니다. 보너스, 추천 보상, 사용 금액, 진행 중 작업에 예약된 금액은 제외됩니다.",emptyEligible:"현재 환불 신청 가능한 결제 완료 충전이 없습니다.",principal:"충전 원금",topup:"잔액 충전",amountLabel:"환불 금액",processing:"환불 처리 중",submitting:"제출 중…",return:"원 결제수단으로 환불",history:"환불 기록",emptyHistory:"아직 환불 기록이 없습니다.",completed:"원 결제수단 환불 완료",requested:"제출됨",failed:"실패 · 잔액 해제됨",wechat:"WeChat Pay",alipay:"Alipay",other:"기타 결제",original:"원 결제수단 환불"},
 fr:{loadFail:"Impossible de charger les données de remboursement.",invalid:"Saisissez un montant valide ne dépassant pas le principal de cette recharge.",confirm:"Demander le remboursement de {amount} de principal non utilisé ? Le montant reviendra vers le moyen de paiement d’origine.",done:"Le moyen de paiement d’origine a confirmé le remboursement.",submitted:"Demande envoyée. Le montant demandé est réservé pendant la confirmation du prestataire de paiement.",loading:"Chargement du solde remboursable…",eligibleTitle:"Recharges éligibles au remboursement",eligibleDesc:"Seul le principal payé et non utilisé est remboursable. Les bonus, récompenses, montants dépensés et montants réservés par des tâches actives sont exclus.",emptyEligible:"Aucune recharge payée n’est actuellement éligible.",principal:"principal payé",topup:"recharge de solde",amountLabel:"Montant du remboursement",processing:"Remboursement en cours",submitting:"Envoi…",return:"Retour au moyen d’origine",history:"Historique des remboursements",emptyHistory:"Aucun remboursement pour le moment.",completed:"Remboursé au moyen d’origine",requested:"Envoyé",failed:"Échec · solde libéré",wechat:"WeChat Pay",alipay:"Alipay",other:"Autre paiement",original:"Remboursement"},
 de:{loadFail:"Rückerstattungsdaten konnten nicht geladen werden.",invalid:"Geben Sie einen gültigen Betrag ein, der das eingezahlte Kapital dieser Aufladung nicht übersteigt.",confirm:"Rückerstattung von {amount} ungenutztem eingezahltem Kapital beantragen? Der Betrag geht an die ursprüngliche Zahlungsart zurück.",done:"Die ursprüngliche Zahlungsart hat die Rückerstattung bestätigt.",submitted:"Rückerstattung eingereicht. Der beantragte Betrag bleibt bis zur Bestätigung des Zahlungsanbieters reserviert.",loading:"Erstattungsfähiges Guthaben wird geladen…",eligibleTitle:"Erstattungsfähige Aufladungen",eligibleDesc:"Nur ungenutztes eingezahltes Kapital ist erstattungsfähig. Bonusguthaben, Einladungsprämien, verbrauchte und für aktive Aufgaben reservierte Beträge sind ausgeschlossen.",emptyEligible:"Derzeit gibt es keine bezahlte Aufladung, die erstattet werden kann.",principal:"eingezahltes Kapital",topup:"Guthabenaufladung",amountLabel:"Erstattungsbetrag",processing:"Rückerstattung läuft",submitting:"Wird gesendet…",return:"Zur ursprünglichen Zahlungsart",history:"Rückerstattungsverlauf",emptyHistory:"Noch keine Rückerstattung.",completed:"Zurückerstattet",requested:"Eingereicht",failed:"Fehlgeschlagen · Guthaben freigegeben",wechat:"WeChat Pay",alipay:"Alipay",other:"Andere Zahlung",original:"Rückerstattung"},
 es:{loadFail:"No se pudieron cargar los datos de reembolso.",invalid:"Introduce un importe válido que no supere el principal de esta recarga.",confirm:"¿Solicitar el reembolso de {amount} del principal no utilizado? Volverá al método de pago original.",done:"El método de pago original confirmó el reembolso.",submitted:"Reembolso enviado. El importe solicitado queda reservado mientras el proveedor confirma la operación.",loading:"Cargando saldo reembolsable…",eligibleTitle:"Recargas elegibles para reembolso",eligibleDesc:"Solo se devuelve el principal pagado y no utilizado. Se excluyen bonificaciones, recompensas, importes consumidos y fondos reservados por tareas activas.",emptyEligible:"No hay recargas pagadas elegibles para reembolso ahora.",principal:"principal pagado",topup:"recarga de saldo",amountLabel:"Importe del reembolso",processing:"Reembolso en proceso",submitting:"Enviando…",return:"Devolver al método original",history:"Historial de reembolsos",emptyHistory:"Aún no hay reembolsos.",completed:"Devuelto al método original",requested:"Enviado",failed:"Falló · saldo liberado",wechat:"WeChat Pay",alipay:"Alipay",other:"Otro pago",original:"Reembolso"},
 pt:{loadFail:"Não foi possível carregar os dados de reembolso.",invalid:"Insira um valor válido que não ultrapasse o principal desta recarga.",confirm:"Solicitar a devolução de {amount} do principal não utilizado? O valor retornará ao método de pagamento original.",done:"O método de pagamento original confirmou o reembolso.",submitted:"Reembolso enviado. O valor solicitado fica reservado enquanto o provedor confirma a operação.",loading:"Carregando saldo reembolsável…",eligibleTitle:"Recargas elegíveis para reembolso",eligibleDesc:"Somente o principal pago e não utilizado é reembolsável. Bônus, recompensas, valores consumidos e fundos reservados por tarefas ativas ficam de fora.",emptyEligible:"Não há recargas pagas elegíveis para reembolso no momento.",principal:"principal pago",topup:"recarga de saldo",amountLabel:"Valor do reembolso",processing:"Reembolso em processamento",submitting:"Enviando…",return:"Retornar ao método original",history:"Histórico de reembolsos",emptyHistory:"Ainda não há reembolsos.",completed:"Retornado ao método original",requested:"Enviado",failed:"Falhou · saldo liberado",wechat:"WeChat Pay",alipay:"Alipay",other:"Outro pagamento",original:"Reembolso"},
 ar:{loadFail:"تعذر تحميل بيانات الاسترداد.",invalid:"أدخل مبلغًا صالحًا لا يتجاوز أصل عملية الشحن هذه.",confirm:"هل تريد طلب استرداد {amount} من أصل المبلغ غير المستخدم؟ سيعود إلى وسيلة الدفع الأصلية.",done:"أكدت وسيلة الدفع الأصلية اكتمال الاسترداد.",submitted:"تم إرسال طلب الاسترداد. يبقى المبلغ المطلوب محجوزًا حتى تأكيد مزود الدفع.",loading:"جارٍ تحميل الرصيد القابل للاسترداد…",eligibleTitle:"عمليات الشحن المؤهلة للاسترداد",eligibleDesc:"يُسترد فقط أصل المبلغ المدفوع وغير المستخدم. لا تشمل المكافآت أو مكافآت الدعوة أو المبالغ المستهلكة أو المحجوزة لمهام نشطة.",emptyEligible:"لا توجد حاليًا عمليات شحن مدفوعة مؤهلة للاسترداد.",principal:"الأصل المدفوع",topup:"شحن الرصيد",amountLabel:"مبلغ الاسترداد",processing:"الاسترداد قيد المعالجة",submitting:"جارٍ الإرسال…",return:"إلى وسيلة الدفع الأصلية",history:"سجل الاسترداد",emptyHistory:"لا يوجد سجل استرداد بعد.",completed:"أعيد إلى وسيلة الدفع الأصلية",requested:"تم الإرسال",failed:"فشل · تم تحرير الرصيد",wechat:"WeChat Pay",alipay:"Alipay",other:"دفعة أخرى",original:"استرداد"}
};

function isUsdWallet(productId:string){return productId.includes("-usd-balance-")}
function walletAmount(order:Order){return isUsdWallet(order.product_id)?Number(order.amount_usd||0):Number(order.amount_rmb||0)}
function walletSymbol(order:Order){return isUsdWallet(order.product_id)?"$":"¥"}

export default function BalanceWithdrawalPanel(){
  const{lang}=useLingxiLang();const c=D[lang]??D.en;
  const[data,setData]=useState<Data|null>(null);
  const[msg,setMsg]=useState("");
  const[busy,setBusy]=useState<string|null>(null);
  const[amounts,setAmounts]=useState<Record<string,string>>({});

  const providerText=(order:Order)=>{
    if(order.provider==="paypal")return `PayPal · $${Number(order.amount_usd||0).toFixed(2)} USD`;
    const name=order.provider==="wechat"?c.wechat:order.provider==="alipay"?c.alipay:c.other;
    return `${name} · ¥${Number(order.amount_rmb||0).toFixed(2)}`;
  };
  const providerName=(provider:string)=>provider==="paypal"?"PayPal":provider==="wechat"?c.wechat:provider==="alipay"?c.alipay:c.other;
  const statusLabel=(status:string)=>status==="completed"?c.completed:status==="processing"?c.processing:status==="requested"?c.requested:status==="failed"?c.failed:status;

  async function load(){
    const r=await fetch("/api/account/withdrawals",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.ok)setData(d);else setMsg(d.error||c.loadFail);
  }
  useEffect(()=>{void load()},[c.loadFail]);

  const activeByOrder=useMemo(()=>{
    const out=new Set<string>();
    for(const w of data?.withdrawals||[])if(["requested","processing"].includes(w.status))out.add(w.order_id);
    return out;
  },[data]);

  async function submit(order:Order){
    const max=walletAmount(order);
    const amount=Number(amounts[order.id]||max);
    if(!Number.isFinite(amount)||amount<=0||amount>max){setMsg(c.invalid);return}
    const shown=`${walletSymbol(order)}${amount.toFixed(2)}`;
    if(!confirm(c.confirm.replace("{amount}",shown)))return;
    setBusy(order.id);setMsg("");
    try{
      const r=await fetch("/api/account/withdrawals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId:order.id,amount})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok){setMsg(d.error||c.loadFail);return}
      setMsg(d.status==="completed"?c.done:c.submitted);
      await load();
    }finally{setBusy(null)}
  }

  if(!data)return <div className="lx-state-card is-loading rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 text-[var(--lx-muted)]"><span className="lx-state-dot"/> {msg||c.loading}</div>;

  return <div className="space-y-8 text-[var(--lx-ink)]">
    {msg&&<p role="status" className="lx-state-card rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-muted)]">{msg}</p>}
    <section>
      <h2 className="text-xl font-semibold">{c.eligibleTitle}</h2>
      <p className="mt-2 text-sm leading-7 text-[var(--lx-muted)]">{c.eligibleDesc}</p>
      <div className="mt-5 space-y-3">
        {data.orders.length===0&&<p className="lx-state-card is-empty rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 text-sm text-[var(--lx-muted)]">◇ {c.emptyEligible}</p>}
        {data.orders.map(o=>{
          const max=walletAmount(o),active=activeByOrder.has(o.id);
          return <article key={o.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><b>{walletSymbol(o)}{max.toFixed(2)} {c.principal}</b><p className="mt-1 text-xs text-[var(--lx-faint)]">{providerText(o)} · {new Date(o.created_at).toLocaleString(lang)}</p></div>
              <span className="text-sm text-[var(--lx-faint)]">{c.topup}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <input aria-label={c.amountLabel} className="min-w-40 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-2 text-[var(--lx-ink)] outline-none focus:border-[var(--lx-line-strong)]" inputMode="decimal" value={amounts[o.id]??String(max)} onChange={e=>setAmounts(x=>({...x,[o.id]:e.target.value}))}/>
              <button disabled={active||busy===o.id} onClick={()=>void submit(o)} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-5 py-2 text-[var(--lx-ink)] disabled:opacity-50">{active?c.processing:busy===o.id?c.submitting:c.return}</button>
            </div>
          </article>
        })}
      </div>
    </section>
    <section>
      <h2 className="text-xl font-semibold">{c.history}</h2>
      <div className="mt-5 space-y-3">
        {data.withdrawals.length===0&&<p className="lx-state-card is-empty rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 text-sm text-[var(--lx-muted)]">◇ {c.emptyHistory}</p>}
        {data.withdrawals.map(w=><article key={w.id} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
          <div className="flex flex-wrap justify-between gap-3"><b>{w.currency==="USD"?"$":"¥"}{(Number(w.amount_minor)/100).toFixed(2)}</b><span className="text-[var(--lx-muted)]">{statusLabel(w.status)}</span></div>
          <p className="mt-2 text-xs text-[var(--lx-faint)]">{providerName(w.provider)}{w.provider_currency&&w.provider_currency!==w.currency?` · ${c.original} ${w.provider_currency} ${(Number(w.provider_amount_minor)/100).toFixed(2)}`:""} · {new Date(w.created_at).toLocaleString(lang)}</p>
        </article>)}
      </div>
    </section>
  </div>;
}
