"use client";
import {useEffect,useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";

type Currency="CNY"|"USD";
type Entry={id:string;currency:Currency;kind:string;delta_minor:number;balance_after_minor:number;reference_id:string|null;created_at:string;source:"AI"|"SASI"|string};
type Copy={title:string;description:string;cny:string;usd:string;date:string;kind:string;source:string;change:string;after:string;previous:string;next:string;empty:string;error:string;loading:string;ai:string;sasi:string;page:string};
const COPY:Record<LingxiLang,Copy>={
 zh:{title:"资金记录",description:"只展示已写入钱包账本的余额变动。SASI 当前钱包与 AI 历史余额按来源分别列出；不同账本的余额后数值不可直接相加。支付订单及退款、提现状态请查看账户服务。",cny:"人民币 CNY",usd:"美元 USD",date:"时间",kind:"类型",source:"来源",change:"余额变动",after:"该账本变动后余额",previous:"上一页",next:"下一页",empty:"暂无已入账记录",error:"暂时无法读取资金记录",loading:"正在读取资金记录",ai:"AI 历史账本",sasi:"SASI 当前账本",page:"页"},
 en:{title:"Funds activity",description:"Shows posted wallet-ledger changes only. The current SASI wallet and legacy AI balance are listed by source; balances from separate ledgers must not be added together. See account services for order, refund and payout status.",cny:"Chinese yuan · CNY",usd:"US dollar · USD",date:"Date",kind:"Type",source:"Source",change:"Change",after:"Balance after",previous:"Previous",next:"Next",empty:"No posted balance changes yet",error:"Funds activity is temporarily unavailable",loading:"Loading funds activity",ai:"Legacy AI ledger",sasi:"Current SASI ledger",page:"page"},
 ja:{title:"残高の利用履歴",description:"記帳済みの残高変動のみを表示します。SASI現行ウォレットと旧AI残高は発生元別に表示され、別々の台帳残高を合算することはできません。注文・返金・出金状況はアカウントサービスで確認できます。",cny:"人民元 CNY",usd:"米ドル USD",date:"日時",kind:"内容",source:"区分",change:"増減",after:"変動後残高",previous:"前へ",next:"次へ",empty:"記録はまだありません",error:"履歴を読み込めません",loading:"履歴を読み込み中",ai:"旧AI台帳",sasi:"SASI現行台帳",page:"ページ"},
 ko:{title:"잔액 이용 내역",description:"장부에 기록된 잔액 변동만 표시합니다. 현재 SASI 지갑과 이전 AI 잔액을 출처별로 표시하며 서로 다른 장부의 잔액을 합산하면 안 됩니다. 주문·환불·출금 상태는 계정 서비스에서 확인하세요.",cny:"중국 위안 CNY",usd:"미국 달러 USD",date:"일시",kind:"유형",source:"출처",change:"변동",after:"변동 후 잔액",previous:"이전",next:"다음",empty:"반영된 내역이 없습니다",error:"내역을 불러올 수 없습니다",loading:"내역을 불러오는 중",ai:"이전 AI 장부",sasi:"현재 SASI 장부",page:"페이지"},
 fr:{title:"Mouvements du solde",description:"Affiche uniquement les mouvements inscrits au registre. Le portefeuille SASI actuel et l’ancien solde AI sont séparés par origine ; les soldes de registres distincts ne doivent pas être additionnés. Consultez les services du compte pour les commandes et remboursements.",cny:"Yuan chinois · CNY",usd:"Dollar américain · USD",date:"Date",kind:"Type",source:"Origine",change:"Variation",after:"Solde après opération",previous:"Précédent",next:"Suivant",empty:"Aucun mouvement crédité",error:"Historique temporairement indisponible",loading:"Chargement de l’historique",ai:"Ancien registre AI",sasi:"Registre SASI actuel",page:"page"},
 de:{title:"Guthabenbewegungen",description:"Hier erscheinen nur gebuchte Änderungen im Guthabenjournal. Das aktuelle SASI-Wallet und das ältere AI-Guthaben werden nach Herkunft getrennt; Salden verschiedener Journale dürfen nicht addiert werden. Bestell- und Erstattungsstatus stehen unter Kontodienste.",cny:"Chinesischer Yuan · CNY",usd:"US-Dollar · USD",date:"Datum",kind:"Art",source:"Herkunft",change:"Änderung",after:"Saldo danach",previous:"Zurück",next:"Weiter",empty:"Noch keine gebuchten Änderungen",error:"Guthabenverlauf ist vorübergehend nicht verfügbar",loading:"Guthabenverlauf wird geladen",ai:"Älteres AI-Journal",sasi:"Aktuelles SASI-Journal",page:"Seite"},
 es:{title:"Movimientos del saldo",description:"Solo se muestran cambios registrados en el libro de saldo. El monedero SASI actual y el saldo AI anterior aparecen separados por origen; no deben sumarse saldos de libros distintos. Consulta los servicios de cuenta para pedidos y reembolsos.",cny:"Yuan chino · CNY",usd:"Dólar estadounidense · USD",date:"Fecha",kind:"Tipo",source:"Origen",change:"Cambio",after:"Saldo posterior",previous:"Anterior",next:"Siguiente",empty:"Todavía no hay movimientos registrados",error:"El historial no está disponible temporalmente",loading:"Cargando movimientos",ai:"Libro AI anterior",sasi:"Libro SASI actual",page:"página"},
 pt:{title:"Movimentos do saldo",description:"Mostra apenas alterações registadas no livro de saldo. A carteira SASI atual e o saldo AI anterior aparecem separados por origem; saldos de livros diferentes não devem ser somados. Consulte os serviços da conta para pedidos e reembolsos.",cny:"Yuan chinês · CNY",usd:"Dólar americano · USD",date:"Data",kind:"Tipo",source:"Origem",change:"Variação",after:"Saldo após a operação",previous:"Anterior",next:"Próximo",empty:"Ainda não há movimentos confirmados",error:"O histórico está temporariamente indisponível",loading:"A carregar movimentos",ai:"Livro AI anterior",sasi:"Livro SASI atual",page:"página"},
 ar:{title:"حركات الرصيد",description:"يعرض التغييرات المسجلة في دفتر الرصيد فقط. يُعرض رصيد SASI الحالي ورصيد AI السابق حسب المصدر؛ لا تجمع أرصدة دفاتر منفصلة. راجع خدمات الحساب لحالة الطلبات والاسترداد والسحب.",cny:"اليوان الصيني · CNY",usd:"الدولار الأمريكي · USD",date:"التاريخ",kind:"النوع",source:"المصدر",change:"التغيير",after:"الرصيد بعد العملية",previous:"السابق",next:"التالي",empty:"لا توجد تغييرات مسجلة بعد",error:"سجل الرصيد غير متاح مؤقتًا",loading:"جارٍ تحميل السجل",ai:"دفتر AI السابق",sasi:"دفتر SASI الحالي",page:"صفحة"}
};
const LOCALE:Record<LingxiLang,string>={zh:"zh-CN",en:"en-US",ja:"ja-JP",ko:"ko-KR",fr:"fr-FR",de:"de-DE",es:"es-ES",pt:"pt-PT",ar:"ar"};
const KIND:Record<LingxiLang,Record<string,string>>={
 zh:{topup:"充值",reserve:"预留",settle:"消费",usage:"消费",usage_v49:"消费",purchase:"购买",release:"退回",refund:"退款",refund_hold:"退款处理中",refund_release:"退款退回",refund_complete:"退款完成",withdrawal_hold:"提现处理中",withdrawal_release:"提现退回",withdrawal_complete:"提现完成",bonus:"奖励",referral_bonus:"推荐奖励",adjustment:"余额调整",admin_adjustment:"余额调整"},
 en:{topup:"Top-up",reserve:"Reserved",settle:"Spent",usage:"Spent",usage_v49:"Spent",purchase:"Purchase",release:"Released",refund:"Refund",refund_hold:"Refund pending",refund_release:"Refund released",refund_complete:"Refund completed",withdrawal_hold:"Payout pending",withdrawal_release:"Payout released",withdrawal_complete:"Payout completed",bonus:"Bonus",referral_bonus:"Referral bonus",adjustment:"Balance adjustment",admin_adjustment:"Balance adjustment"},
 ja:{topup:"チャージ",reserve:"保留",settle:"利用",usage:"利用",usage_v49:"利用",purchase:"購入",release:"返却",refund:"返金",refund_hold:"返金処理中",refund_release:"返金解除",refund_complete:"返金完了",withdrawal_hold:"出金処理中",withdrawal_release:"出金解除",withdrawal_complete:"出金完了",bonus:"特典",referral_bonus:"紹介特典",adjustment:"残高調整",admin_adjustment:"残高調整"},
 ko:{topup:"충전",reserve:"보류",settle:"사용",usage:"사용",usage_v49:"사용",purchase:"구매",release:"반환",refund:"환불",refund_hold:"환불 처리 중",refund_release:"환불 해제",refund_complete:"환불 완료",withdrawal_hold:"출금 처리 중",withdrawal_release:"출금 해제",withdrawal_complete:"출금 완료",bonus:"보너스",referral_bonus:"추천 보너스",adjustment:"잔액 조정",admin_adjustment:"잔액 조정"},
 fr:{topup:"Recharge",reserve:"Réservé",settle:"Dépense",usage:"Dépense",usage_v49:"Dépense",purchase:"Achat",release:"Libéré",refund:"Remboursement",refund_hold:"Remboursement en cours",refund_release:"Réservation libérée",refund_complete:"Remboursement terminé",withdrawal_hold:"Retrait en cours",withdrawal_release:"Retrait libéré",withdrawal_complete:"Retrait terminé",bonus:"Bonus",referral_bonus:"Bonus de parrainage",adjustment:"Ajustement du solde",admin_adjustment:"Ajustement du solde"},
 de:{topup:"Aufladung",reserve:"Reserviert",settle:"Ausgabe",usage:"Ausgabe",usage_v49:"Ausgabe",purchase:"Kauf",release:"Freigegeben",refund:"Erstattung",refund_hold:"Erstattung läuft",refund_release:"Reservierung aufgehoben",refund_complete:"Erstattung abgeschlossen",withdrawal_hold:"Auszahlung läuft",withdrawal_release:"Auszahlung freigegeben",withdrawal_complete:"Auszahlung abgeschlossen",bonus:"Bonus",referral_bonus:"Empfehlungsbonus",adjustment:"Saldoanpassung",admin_adjustment:"Saldoanpassung"},
 es:{topup:"Recarga",reserve:"Reservado",settle:"Gasto",usage:"Gasto",usage_v49:"Gasto",purchase:"Compra",release:"Liberado",refund:"Reembolso",refund_hold:"Reembolso pendiente",refund_release:"Reserva liberada",refund_complete:"Reembolso completado",withdrawal_hold:"Retiro pendiente",withdrawal_release:"Retiro liberado",withdrawal_complete:"Retiro completado",bonus:"Bonificación",referral_bonus:"Bonificación por referido",adjustment:"Ajuste de saldo",admin_adjustment:"Ajuste de saldo"},
 pt:{topup:"Recarga",reserve:"Reservado",settle:"Despesa",usage:"Despesa",usage_v49:"Despesa",purchase:"Compra",release:"Liberado",refund:"Reembolso",refund_hold:"Reembolso pendente",refund_release:"Reserva liberada",refund_complete:"Reembolso concluído",withdrawal_hold:"Levantamento pendente",withdrawal_release:"Levantamento liberado",withdrawal_complete:"Levantamento concluído",bonus:"Bónus",referral_bonus:"Bónus por indicação",adjustment:"Ajuste de saldo",admin_adjustment:"Ajuste de saldo"},
 ar:{topup:"شحن",reserve:"محجوز",settle:"استخدام",usage:"استخدام",usage_v49:"استخدام",purchase:"شراء",release:"تحرير",refund:"استرداد",refund_hold:"استرداد قيد المعالجة",refund_release:"تحرير مبلغ الاسترداد",refund_complete:"اكتمل الاسترداد",withdrawal_hold:"سحب قيد المعالجة",withdrawal_release:"تحرير السحب",withdrawal_complete:"اكتمل السحب",bonus:"مكافأة",referral_bonus:"مكافأة إحالة",adjustment:"تعديل الرصيد",admin_adjustment:"تعديل الرصيد"}
};
function kindLabel(kind:string,lang:LingxiLang){const key=String(kind||"").toLowerCase().replace(/[\\s-]+/g,"_");return KIND[lang]?.[key]||key.replace(/_/g," ")||"—";}

export default function WalletLedgerPanel({currency:initialCurrency="CNY",showCurrencyTabs=false}:{currency?:"CNY"|"USD";showCurrencyTabs?:boolean}={}){
 const {lang}=useLingxiLang();const c=COPY[lang]||COPY.en;
 const [selectedCurrency,setSelectedCurrency]=useState<Currency>(initialCurrency);
 const currency=showCurrencyTabs?selectedCurrency:initialCurrency;
 const [rows,setRows]=useState<Entry[]>([]);const [error,setError]=useState(false);const [page,setPage]=useState(0);
 const [cursorStack,setCursorStack]=useState<Array<string|null>>([null]);const [nextCursor,setNextCursor]=useState<string|null>(null);
 const [hasMore,setHasMore]=useState(false);const [loading,setLoading]=useState(true);
 const requestCursor=cursorStack[page]??null;
 useEffect(()=>{
  const controller=new AbortController();setLoading(true);setError(false);setNextCursor(null);
  const query=new URLSearchParams({currency});if(requestCursor)query.set("cursor",requestCursor);
  fetch("/api/account/wallet-ledger?"+query.toString(),{cache:"no-store",credentials:"same-origin",signal:controller.signal})
   .then(async r=>{if(!r.ok)throw Error("wallet_activity");return r.json()})
   .then(d=>{if(!controller.signal.aborted){setRows(Array.isArray(d.rows)?d.rows:[]);setHasMore(Boolean(d.hasMore));setNextCursor(typeof d.nextCursor==="string"?d.nextCursor:null)}})
   .catch(()=>{if(!controller.signal.aborted)setError(true)})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[currency,requestCursor]);
 const money=(n:number)=>new Intl.NumberFormat(LOCALE[lang]||"en-US",{style:"currency",currency,minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n||0)/100);
 const date=(value:string)=>{const d=new Date(value);return Number.isNaN(d.getTime())?"—":d.toLocaleString(LOCALE[lang]||"en-US");};
 const sourceLabel=(source:string)=>source==="SASI"?c.sasi:c.ai;
 function selectCurrency(value:Currency){setSelectedCurrency(value);setPage(0);setCursorStack([null]);setNextCursor(null);setHasMore(false);}
 function goNext(){if(!nextCursor||!hasMore||loading)return;setCursorStack(stack=>[...stack.slice(0,page+1),nextCursor]);setPage(p=>p+1);}
 return <section aria-label={c.title} className="lx26-wallet-ledger-panel rounded-2xl border border-[var(--lx-line)] p-4 sm:p-6">
  <div className="flex flex-wrap items-start justify-between gap-4">
   <div><h2 className="text-lg font-semibold">{c.title}</h2><p className="mt-2 max-w-4xl text-xs leading-6 text-[var(--lx-muted)]">{c.description}</p></div>
   {showCurrencyTabs&&<div className="lx26-ledger-currency-tabs" role="tablist" aria-label={c.title}>
    <button type="button" role="tab" data-testid="wallet-ledger-currency-CNY" aria-selected={currency==="CNY"} className={currency==="CNY"?"is-active":""} onClick={()=>selectCurrency("CNY")}>{c.cny}</button>
    <button type="button" role="tab" data-testid="wallet-ledger-currency-USD" aria-selected={currency==="USD"} className={currency==="USD"?"is-active":""} onClick={()=>selectCurrency("USD")}>{c.usd}</button>
   </div>}
  </div>
  {error?<p role="alert" className="mt-4">{c.error}</p>:loading?<p role="status" className="mt-4">{c.loading}</p>:rows.length===0?<div className="lx26-wallet-empty mt-4"><span aria-hidden="true">▤</span><p>{c.empty}</p></div>:
   <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr>{[c.date,c.kind,c.source,c.change,c.after].map(h=><th className="border-b p-3" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.source+r.id}>
    <td className="border-b p-3 whitespace-nowrap">{date(r.created_at)}</td>
    <td className="border-b p-3">{kindLabel(r.kind,lang)}</td>
    <td className="border-b p-3">{sourceLabel(r.source)}</td>
    <td className="border-b p-3 whitespace-nowrap font-semibold tabular-nums">{r.delta_minor>0?"+":""}{money(r.delta_minor)}</td>
    <td className="border-b p-3 whitespace-nowrap tabular-nums">{money(r.balance_after_minor)}</td>
   </tr>)}</tbody></table></div>}
  <div className="mt-4 flex items-center justify-between gap-3">
   <button type="button" disabled={page===0||loading||error} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40" onClick={()=>setPage(p=>Math.max(0,p-1))}>{c.previous}</button>
   <span className="text-xs tabular-nums">{page+1} {c.page}</span>
   <button type="button" disabled={!hasMore||!nextCursor||loading||error} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40" onClick={goNext}>{c.next}</button>
  </div>
 </section>;
}
