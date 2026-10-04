"use client";

import {useMoneyAutoRefresh} from "@/lib/money/use-money-auto-refresh";
import Link from "next/link";
import {moneyText} from "@/lib/notifications/money-copy";
import {useEffect,useMemo,useState,useCallback} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import CurrencySelector from "@/components/CurrencySelector";
import LegacyRefundMigrationPanel from "@/components/LegacyRefundMigrationPanel";
import BalanceWithdrawalPanel from "@/components/BalanceWithdrawalPanel";
import styles from "@/components/money/BalanceDashboard.module.css";
import {dashboardCopy} from "@/components/money/dashboard-copy";
import {CREDIT_PACKS} from "@/lib/sasi/catalog";
import {usdBalanceProducts} from "@/lib/usd-products";

type Currency="CNY"|"USD";
type Snapshot={
 currency:Currency;
 availableMinor:number;
 refundableMinor:number;
 refundHoldMinor:number;
 legacyAvailableMinor:number;
 activeAvailableMinor:number;
};
type Withdrawal={
 id:string;
 currency:Currency;
 amount_minor:number;
 status:string;
 normalized_status:string;
 created_at:string;
};
type Summary={balances:{CNY:Snapshot;USD:Snapshot};withdrawals:Withdrawal[]};

type Copy={
 title:string;subtitle:string;available:string;refundable:string;processing:string;
 topup:string;topupHint:string;returnTitle:string;returnHint:string;history:string;
 noHistory:string;refresh:string;loading:string;unavailable:string;statusPending:string;
 statusSuccess:string;statusFailed:string;
};

const C:Record<LingxiLang,Copy>={
 zh:{title:"余额",subtitle:"一个余额，全部 SASI 共用。",available:"可用余额",refundable:"可退本金",processing:"处理中",topup:"充值",topupHint:"选择金额充值到当前币种余额。",returnTitle:"退回原支付方式",returnHint:"未使用的真实充值本金可按原支付方式退回。",history:"最近退款",noHistory:"还没有退款记录。",refresh:"刷新",loading:"正在读取余额…",unavailable:"暂时无法读取余额。",statusPending:"处理中",statusSuccess:"已完成",statusFailed:"失败"},
 en:{title:"Balance",subtitle:"One balance across every SASI.",available:"Available",refundable:"Refundable principal",processing:"Processing",topup:"Top up",topupHint:"Choose an amount to add to the selected currency balance.",returnTitle:"Return to original payment method",returnHint:"Unused paid principal can be returned to the original payment method.",history:"Recent refunds",noHistory:"No refund history yet.",refresh:"Refresh",loading:"Loading balance…",unavailable:"Balance is temporarily unavailable.",statusPending:"Processing",statusSuccess:"Completed",statusFailed:"Failed"},
 ja:{title:"残高",subtitle:"1つの残高をSASI全体で共有します。",available:"利用可能",refundable:"返金可能元本",processing:"処理中",topup:"チャージ",topupHint:"選択中の通貨残高へチャージします。",returnTitle:"元の支払い方法へ返金",returnHint:"未使用の実入金元本は元の支払い方法へ返金できます。",history:"最近の返金",noHistory:"返金履歴はまだありません。",refresh:"更新",loading:"残高を読み込み中…",unavailable:"残高を一時的に読み込めません。",statusPending:"処理中",statusSuccess:"完了",statusFailed:"失敗"},
 ko:{title:"잔액",subtitle:"하나의 잔액을 모든 SASI에서 함께 사용합니다.",available:"사용 가능",refundable:"환불 가능 원금",processing:"처리 중",topup:"충전",topupHint:"선택한 통화 잔액으로 충전합니다.",returnTitle:"원 결제수단으로 환불",returnHint:"사용하지 않은 실제 충전 원금은 원 결제수단으로 환불할 수 있습니다.",history:"최근 환불",noHistory:"아직 환불 기록이 없습니다.",refresh:"새로고침",loading:"잔액 불러오는 중…",unavailable:"잔액을 일시적으로 불러올 수 없습니다.",statusPending:"처리 중",statusSuccess:"완료",statusFailed:"실패"},
 fr:{title:"Solde",subtitle:"Un seul solde pour tout SASI.",available:"Disponible",refundable:"Principal remboursable",processing:"En cours",topup:"Recharger",topupHint:"Ajoutez un montant au solde dans la devise sélectionnée.",returnTitle:"Retour au moyen de paiement d’origine",returnHint:"Le principal payé et non utilisé peut revenir au moyen de paiement d’origine.",history:"Remboursements récents",noHistory:"Aucun remboursement pour le moment.",refresh:"Actualiser",loading:"Chargement du solde…",unavailable:"Solde temporairement indisponible.",statusPending:"En cours",statusSuccess:"Terminé",statusFailed:"Échec"},
 de:{title:"Guthaben",subtitle:"Ein Guthaben für ganz SASI.",available:"Verfügbar",refundable:"Erstattungsfähiger Betrag",processing:"In Bearbeitung",topup:"Aufladen",topupHint:"Betrag zum ausgewählten Währungsguthaben hinzufügen.",returnTitle:"Zur ursprünglichen Zahlungsart",returnHint:"Nicht genutztes eingezahltes Kapital kann zur ursprünglichen Zahlungsart zurückgehen.",history:"Letzte Erstattungen",noHistory:"Noch keine Erstattungen.",refresh:"Aktualisieren",loading:"Guthaben wird geladen…",unavailable:"Guthaben ist vorübergehend nicht verfügbar.",statusPending:"In Bearbeitung",statusSuccess:"Abgeschlossen",statusFailed:"Fehlgeschlagen"},
 es:{title:"Saldo",subtitle:"Un solo saldo para todo SASI.",available:"Disponible",refundable:"Principal reembolsable",processing:"En proceso",topup:"Recargar",topupHint:"Añade saldo en la moneda seleccionada.",returnTitle:"Volver al método de pago original",returnHint:"El principal pagado y no utilizado puede volver al método de pago original.",history:"Reembolsos recientes",noHistory:"Aún no hay reembolsos.",refresh:"Actualizar",loading:"Cargando saldo…",unavailable:"El saldo no está disponible temporalmente.",statusPending:"En proceso",statusSuccess:"Completado",statusFailed:"Falló"},
 pt:{title:"Saldo",subtitle:"Um único saldo para todo o SASI.",available:"Disponível",refundable:"Principal reembolsável",processing:"Processando",topup:"Recarregar",topupHint:"Adicione saldo na moeda selecionada.",returnTitle:"Retornar ao método original",returnHint:"O principal pago e não utilizado pode retornar ao método de pagamento original.",history:"Reembolsos recentes",noHistory:"Ainda não há reembolsos.",refresh:"Atualizar",loading:"Carregando saldo…",unavailable:"Saldo temporariamente indisponível.",statusPending:"Processando",statusSuccess:"Concluído",statusFailed:"Falhou"},
 ar:{title:"الرصيد",subtitle:"رصيد واحد لكل SASI.",available:"متاح",refundable:"أصل قابل للاسترداد",processing:"قيد المعالجة",topup:"شحن",topupHint:"أضف مبلغًا إلى رصيد العملة المحددة.",returnTitle:"إلى وسيلة الدفع الأصلية",returnHint:"يمكن إعادة أصل المبلغ المدفوع وغير المستخدم إلى وسيلة الدفع الأصلية.",history:"أحدث عمليات الاسترداد",noHistory:"لا يوجد سجل استرداد بعد.",refresh:"تحديث",loading:"جارٍ تحميل الرصيد…",unavailable:"الرصيد غير متاح مؤقتًا.",statusPending:"قيد المعالجة",statusSuccess:"مكتمل",statusFailed:"فشل"},
};

function money(currency:Currency,minor:number){
 const value=(Number(minor)||0)/100;
 return currency==="CNY"?`¥${value.toFixed(2)}`:`$${value.toFixed(2)}`;
}

export default function SasiPricingCurrencyClient(){
 const{lang}=useLingxiLang();
 const{currency}=usePreferredCurrency();
 const c=C[lang]??C.en;
 const ui=dashboardCopy[lang];
 const[selected,setSelected]=useState<Currency>(currency);
 const[data,setData]=useState<Summary|null>(null);
 const[error,setError]=useState("");
 const[loading,setLoading]=useState(true);
 const[chosenId,setChosenId]=useState<string|null>(null);
 const[tab,setTab]=useState<"overview"|"topup"|"withdrawals"|"records">("overview");
 const[isAdmin,setIsAdmin]=useState(false);
 useEffect(()=>{void fetch("/api/account/money-admin/access",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>setIsAdmin(d?.isAdmin===true)).catch(()=>{})},[]);

 useEffect(()=>setSelected(currency),[currency]);
 useEffect(()=>{
  const readHash=()=>{const h=location.hash;setTab(h==="#topup"?"topup":h==="#withdrawals"?"withdrawals":h==="#withdrawal-records"||h.startsWith("#withdrawal-")||h.startsWith("#legacy-")?"records":"overview")};
  readHash();window.addEventListener("hashchange",readHash);return()=>window.removeEventListener("hashchange",readHash);
 },[]);
 function chooseTab(next:typeof tab){setTab(next);const id=next==="records"?"withdrawal-records":next==="overview"?"balance-overview":next;history.replaceState(null,"",location.pathname+location.search+"#"+id);}
 const tabs=[{key:"overview",id:"balance-overview",label:ui.overview},{key:"topup",id:"topup",label:c.topup},{key:"withdrawals",id:"withdrawals",label:ui.withdraw},{key:"records",id:"withdrawal-records",label:ui.records}] as const;


 const load=useCallback(async(showLoading=true)=>{
  if(showLoading)setLoading(true);setError("");
  try{
   const r=await fetch("/api/money/summary",{cache:"no-store"});
   const b=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error("MONEY_SUMMARY_FAILED");
   setData(b);
  }catch{setError(c.unavailable)}
  finally{setLoading(false)}
 },[c.unavailable]);

 useEffect(()=>{void load()},[load]);
 useMoneyAutoRefresh(()=>load(false),Boolean(data?.withdrawals.some(w=>["requested","processing"].includes(w.status))));

 const snapshot=data?.balances?.[selected];
 const recent=useMemo(()=>data?.withdrawals?.filter(x=>x.currency===selected).slice(0,5)??[],[data,selected]);
 const cnyPacks=CREDIT_PACKS;
 const usdPacks=usdBalanceProducts;
 const packs=selected==="CNY"?cnyPacks.map(p=>({id:p.id,amount:p.priceRmb})):usdPacks.map(p=>({id:p.id,amount:p.amountUsd}));
 const chosen=packs.find(p=>p.id===chosenId)||packs[0];

 function statusText(value:string){
  if(value==="cancelled")return moneyText(lang,"cancelled");
  if(value==="succeeded")return c.statusSuccess;
  if(value==="failed")return c.statusFailed;
  return c.statusPending;
 }

 return <main className="lx11-page" dir={lang==="ar"?"rtl":"ltr"}>
  <div className={styles.page}>
   <header className={styles.header}>
    <div><h1>{c.title}</h1><p>{c.subtitle}</p></div>
    <div className="w-44 max-w-full"><CurrencySelector/></div>
   </header>
   <section className={styles.hero} aria-label={c.title}>
    <div className={styles.metrics}>
     <article><p>{c.available} · {selected}</p><strong>{snapshot?money(selected,snapshot.availableMinor):"—"}</strong></article>
     <article><p>{c.refundable}</p><strong>{snapshot?money(selected,snapshot.refundableMinor):"—"}</strong></article>
     <article><p>{c.processing}</p><strong>{snapshot?money(selected,snapshot.refundHoldMinor):"—"}</strong></article>
    </div>
    <div className={styles.actions} role="tablist" aria-label={c.title}>
     {tabs.map((item,index)=><button key={item.key} type="button" role="tab" id={"balance-tab-"+item.key} aria-controls={item.id} aria-selected={tab===item.key} tabIndex={tab===item.key?0:-1} className={styles.action+(tab===item.key?" "+styles.primary:"")} onClick={()=>chooseTab(item.key)} onKeyDown={e=>{
      const direction=lang==="ar"?-1:1;let next:number|undefined;
      if(e.key==="ArrowRight")next=(index+direction+4)%4;else if(e.key==="ArrowLeft")next=(index-direction+4)%4;else if(e.key==="Home")next=0;else if(e.key==="End")next=3;
      if(next!==undefined){e.preventDefault();chooseTab(tabs[next].key);document.getElementById("balance-tab-"+tabs[next].key)?.focus();}
     }}>{item.label}</button>)}
    </div>
   </section>
   <div className={styles.sync}>
    <p role={error?"alert":undefined}>{loading?c.loading:error||ui.auto}</p>
    {isAdmin&&<Link className={styles.link} href="/account/money-admin">{moneyText(lang,"moneyAdmin")}</Link>}
    <button type="button" disabled={loading} onClick={()=>void load()} className={styles.link}>{c.refresh}</button>
   </div>
   <section id="topup" role="tabpanel" aria-labelledby="balance-tab-topup" hidden={tab!=="topup"} className={styles.panel+" "+styles.section} data-testid="balance-topup">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--lx-line)] px-6 py-5">
     <div><h2 className="text-lg font-semibold">{c.topup}</h2><p className="mt-2 text-sm text-[var(--lx-muted)]">{c.topupHint}</p></div>
     <span className="rounded-full bg-[var(--lx-soft)] px-3 py-1.5 text-xs font-medium">{selected} · {selected==="CNY"?(lang==="zh"?"微信支付 / 支付宝":"WeChat Pay / Alipay"):"PayPal"}</span>
    </div>
    <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_260px]">
     <fieldset><legend className="sr-only">{c.topupHint}</legend><div className="grid grid-cols-3 gap-2 sm:gap-3">{packs.map(pack=><label key={pack.id} className={"relative cursor-pointer rounded-xl border px-2 py-3 text-center transition focus-within:ring-2 focus-within:ring-sky-500 "+(chosen.id===pack.id?"border-sky-500 bg-sky-500/10 text-[var(--lx-ink)]":"border-[var(--lx-line)] hover:bg-[var(--lx-soft)]")}>
      <input className="sr-only" type="radio" name="topup-amount" value={pack.id} checked={chosen.id===pack.id} onChange={()=>setChosenId(pack.id)}/><span className="text-base font-semibold sm:text-lg">{new Intl.NumberFormat(lang,{style:"currency",currency:selected,maximumFractionDigits:0}).format(pack.amount)}</span>
     </label>)}</div></fieldset>
     <div className="flex flex-col justify-between rounded-2xl bg-[var(--lx-soft)] p-5"><div><p className="text-sm text-[var(--lx-muted)]">{c.topup}</p><strong className="mt-3 block text-3xl font-semibold">{money(selected,chosen.amount*100)}</strong><p className="mt-2 text-xs text-[var(--lx-muted)]">{selected}</p></div>
      <Link data-testid="topup-checkout" href={selected==="CNY"?`/checkout?productId=${encodeURIComponent(chosen.id)}&redirect=/sasi/pricing&lang=${lang}`:`/checkout-usd?productId=${encodeURIComponent(chosen.id)}&lang=${lang}`} className="mt-6 block rounded-xl bg-[var(--lx-ink)] px-4 py-3 text-center text-sm font-semibold text-[var(--lx-bg)] transition hover:opacity-85">{c.topup} {money(selected,chosen.amount*100)} <span aria-hidden="true">→</span></Link>
     </div>
    </div>
   </section>

   <section id="balance-overview" role="tabpanel" aria-labelledby="balance-tab-overview" hidden={tab!=="overview"} className={styles.section}>
    <div className={styles.sectionTitle}><h2>{c.history}</h2><button type="button" onClick={()=>chooseTab("records")} className={styles.link}>{ui.records} <span aria-hidden="true">→</span></button></div>
    <div className={styles.panel}>
     {recent.length===0?<p className={styles.empty}>{c.noHistory}</p>:<div className={styles.tableWrap}><table className={styles.table+" "+styles.recent}>
      <caption className="sr-only">{c.history}</caption>
      <thead><tr><th scope="col">{ui.amount}</th><th scope="col">{ui.date}</th><th scope="col">{ui.status}</th></tr></thead>
      <tbody>{recent.map(item=><tr key={item.id}>
       <td data-label={ui.amount}><b>{money(item.currency,item.amount_minor)}</b></td>
       <td data-label={ui.date} className={styles.date}>{new Date(item.created_at).toLocaleString(lang)}</td>
       <td data-label={ui.status}><span className={styles.badge} data-state={item.normalized_status}>{statusText(item.normalized_status)}</span></td>
      </tr>)}</tbody>
     </table></div>}
    </div>
   </section>
   <BalanceWithdrawalPanel currency={selected} view={tab==="withdrawals"?"eligible":tab==="records"?"history":"hidden"} historyExtra={<LegacyRefundMigrationPanel/>}/>
  </div>
 </main>;
}
