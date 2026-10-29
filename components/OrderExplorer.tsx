"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import type {AccountOrderViewRow} from "@/components/AccountOrdersHistory";
const I:Record<string,string[]> = {
zh:["查找充值与订单","订单号、金额、支付渠道、商品代码","全部","充值记录","工具订单","其他订单","全部时间","本周","本月","近半年","自定义","开始日期","结束日期","查询","收起筛选","展开筛选","全部状态","已支付","待支付","已退款","已取消","未完成","没有找到记录","上一页","下一页","笔记录","显示筛选条件","支付渠道","详情"],
en:["Find top-ups and orders","Order ID, amount, provider or product code","All","Top-ups","Tool orders","Other orders","Any time","This week","This month","Last 6 months","Custom","From","To","Search","Hide filters","Show filters","Any status","Paid","Pending","Refunded","Cancelled","Failed","No matching records","Previous","Next","records","Filters","Payment","Details"],
ja:["入金・注文を検索","注文番号・金額・決済方法","すべて","チャージ","ツール注文","その他","全期間","今週","今月","過去6か月","指定","開始","終了","検索","閉じる","絞り込み","全状態","支払済","未払い","返金済","取消","失敗","該当なし","前へ","次へ","件","条件","決済","詳細"],
ko:["충전 및 주문 검색","주문번호, 금액, 결제수단","전체","충전","도구 주문","기타 주문","전체 기간","이번 주","이번 달","최근 6개월","직접 지정","시작","종료","검색","접기","펼치기","전체 상태","결제됨","미결제","환불됨","취소","실패","결과 없음","이전","다음","건","필터","결제","상세"],
fr:["Rechercher les paiements","Commande, montant, fournisseur","Tout","Recharges","Outils","Autres","Toute période","Cette semaine","Ce mois","6 derniers mois","Personnalisé","Début","Fin","Chercher","Masquer","Filtres","Tout statut","Payé","En attente","Remboursé","Annulé","Échec","Aucun résultat","Précédent","Suivant","résultats","Filtres","Paiement","Détails"],
de:["Aufladungen und Bestellungen","Nummer, Betrag, Zahlungsart","Alle","Aufladungen","Tools","Andere","Alle Zeiten","Diese Woche","Dieser Monat","6 Monate","Benutzerdefiniert","Von","Bis","Suchen","Schließen","Filter","Alle Status","Bezahlt","Ausstehend","Erstattet","Storniert","Fehler","Keine Treffer","Zurück","Weiter","Einträge","Filter","Zahlung","Details"],
es:["Buscar recargas y pedidos","Número, importe, proveedor","Todo","Recargas","Herramientas","Otros","Cualquier fecha","Esta semana","Este mes","6 meses","Personalizar","Desde","Hasta","Buscar","Ocultar","Filtros","Cualquier estado","Pagado","Pendiente","Reembolsado","Cancelado","Error","Sin resultados","Anterior","Siguiente","resultados","Filtros","Pago","Detalles"],
pt:["Buscar recargas e pedidos","Número, valor, provedor","Todos","Recargas","Ferramentas","Outros","Todo período","Esta semana","Este mês","6 meses","Personalizar","Início","Fim","Buscar","Ocultar","Filtros","Todos estados","Pago","Pendente","Reembolsado","Cancelado","Falhou","Sem resultados","Anterior","Próximo","registros","Filtros","Pagamento","Detalhes"],
ar:["البحث في الشحن والطلبات","رقم الطلب أو المبلغ أو الدفع","الكل","الشحن","الأدوات","أخرى","كل الوقت","هذا الأسبوع","هذا الشهر","6 أشهر","مخصص","من","إلى","بحث","إخفاء","عرض","كل الحالات","مدفوع","معلق","مسترد","ملغى","فشل","لا نتائج","السابق","التالي","سجل","المرشحات","الدفع","تفاصيل"]
};
type ResponseData={rows:AccountOrderViewRow[];total:number;page:number;size:number};
const fmt=(d:Date)=>d.toISOString().slice(0,10);
function periodDates(period:string){
 const now=new Date(),start=new Date(now);start.setHours(0,0,0,0);
 if(period==="week")start.setDate(start.getDate()-(start.getDay()+6)%7);
 else if(period==="month")start.setDate(1);
 else if(period==="half")start.setMonth(start.getMonth()-6);
 else return {start:"",end:""};
 return {start:fmt(start),end:fmt(now)};
}
const statusKeys=["all","paid","pending","refunded","cancelled","failed"];
export default function OrderExplorer(){
 const {lang}=useLingxiLang(),t=I[lang]||I.en;
 const [category,setCategory]=useState("all"),[period,setPeriod]=useState("all"),[status,setStatus]=useState("all"),[query,setQuery]=useState(""),[search,setSearch]=useState(""),[start,setStart]=useState(""),[end,setEnd]=useState(""),[open,setOpen]=useState(false),[page,setPage]=useState(0),[data,setData]=useState<ResponseData|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 useEffect(()=>{
  const dates=period==="custom"?{start,end}:periodDates(period);
  const params=new URLSearchParams({category,status,page:String(page),q:search,...dates});
  const controller=new AbortController();setLoading(true);
  fetch("/api/account/orders/search?"+params,{cache:"no-store",signal:controller.signal}).then(async r=>{if(!r.ok)throw Error(String(r.status));return r.json()}).then(d=>{if(!controller.signal.aborted){setData(d);setError("")}}).catch(e=>{if(!controller.signal.aborted)setError(e.message)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[category,period,status,page,search,start,end]);
 const choose=(value:string)=>{setCategory(value);setPage(0)};
 const amount=(o:AccountOrderViewRow)=>{const usd=o.currency==="USD"||o.provider==="paypal";return (usd?"$":"¥")+Number(usd?o.amount_usd:o.amount_rmb||0).toFixed(2)};
 return <section className="mt-6 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 sm:p-6" dir={lang==="ar"?"rtl":"ltr"}>
 <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">{t[0]}</h2><button type="button" aria-expanded={open} onClick={()=>setOpen(!open)} className="rounded-lg border border-[var(--lx-line)] px-3 py-2 text-sm">{open?t[14]:t[15]} ▾</button></div>
 <form className="mt-4 flex gap-2" onSubmit={e=>{e.preventDefault();setPage(0);setSearch(query.trim())}}><input aria-label={t[1]} placeholder={t[1]} value={query} onChange={e=>setQuery(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-[var(--lx-line)] bg-transparent px-3 py-2 text-sm"/><button type="submit" className="rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">{t[13]}</button></form>
 <div className="mt-3 flex flex-wrap gap-2">{["all","topup","tools","other"].map((v,i)=><button key={v} type="button" onClick={()=>choose(v)} aria-pressed={category===v} className={"rounded-full border px-3 py-2 text-sm "+(category===v?"border-[var(--lx-ink)] bg-[var(--lx-soft)]":"border-[var(--lx-line)]")}>{t[i+2]}</button>)}</div>
 <div className="mt-3 flex flex-wrap gap-2">{["all","week","month","half","custom"].map((v,i)=><button type="button" key={v} onClick={()=>{setPeriod(v);setPage(0);if(v==="custom")setOpen(true)}} aria-pressed={period===v} className={"rounded-full px-3 py-1.5 text-xs "+(period===v?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"bg-[var(--lx-soft)]")}>{t[i+6]}</button>)}</div>
 {open&&<div className="mt-4 grid gap-3 rounded-xl bg-[var(--lx-soft)] p-4 sm:grid-cols-3"><label className="text-sm">{t[16]}<select aria-label={t[16]} value={status} onChange={e=>{setStatus(e.target.value);setPage(0)}} className="mt-1 block w-full rounded-lg border bg-[var(--lx-panel)] p-2">{statusKeys.map((v,i)=><option key={v} value={v}>{t[16+i]}</option>)}</select></label><label className="text-sm">{t[11]}<input type="date" value={start} onChange={e=>{setStart(e.target.value);setPeriod("custom");setPage(0)}} className="mt-1 block w-full rounded-lg border bg-[var(--lx-panel)] p-2"/></label><label className="text-sm">{t[12]}<input type="date" value={end} min={start||undefined} onChange={e=>{setEnd(e.target.value);setPeriod("custom");setPage(0)}} className="mt-1 block w-full rounded-lg border bg-[var(--lx-panel)] p-2"/></label></div>}
 <p role="status" className="mt-4 text-xs text-[var(--lx-muted)]">{loading?"…":error?error:data?data.total+" "+t[25]:""}</p>
 <div className="mt-3 space-y-2">{!loading&&data?.rows.length===0&&<p className="py-8 text-center text-sm text-[var(--lx-muted)]">{t[22]}</p>}{data?.rows.map(o=><details key={o.id} className="rounded-xl border border-[var(--lx-line)] p-4"><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3"><span className="min-w-0"><b className="block text-sm">{o.product_id.startsWith("toolquote:")?t[4]:o.product_id.includes("balance")||o.product_id.includes("credit")?t[3]:o.nameZh||o.nameEn||o.product_id}</b><span className="mt-1 block text-xs text-[var(--lx-muted)]">{new Date(o.created_at).toLocaleString(lang)} · {o.provider||"—"}</span></span><span className="text-right"><b>{amount(o)}</b><small className="ms-2 rounded-full bg-[var(--lx-soft)] px-2 py-1">{o.status}</small></span></summary><div className="mt-3 break-all border-t border-[var(--lx-line)] pt-3 text-xs text-[var(--lx-muted)]"><p>ID: {o.id}</p><p>{t[27]}: {o.provider||"—"}</p><Link href="/sasi/pricing" className="mt-2 inline-block underline">{t[28]}</Link></div></details>)}</div>
 <div className="mt-4 flex items-center justify-between"><button disabled={page===0||loading} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-30" onClick={()=>setPage(v=>v-1)}>{t[23]}</button><span className="text-xs">{page+1} / {Math.max(1,Math.ceil((data?.total||0)/25))}</span><button disabled={loading||(page+1)*25>=(data?.total||0)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-30" onClick={()=>setPage(v=>v+1)}>{t[24]}</button></div>
 </section>
}
