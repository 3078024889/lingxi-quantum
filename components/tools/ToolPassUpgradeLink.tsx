"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
const label:Record<string,string>={
 zh:"使用全场实用工具通用包",en:"Use the all-tools pass",
 ja:"共通ツールパスで利用",ko:"전체 도구 이용권 사용",
 fr:"Utiliser le pass tous outils",de:"Alle Werkzeuge mit dem Pass nutzen",
 es:"Usar el pase de herramientas",pt:"Usar o passe de ferramentas",
 ar:"استخدام باقة جميع الأدوات"
};
const oldOrders:Record<string,string>={
 zh:"查看已付款的历史订单",en:"View previously paid orders",
 ja:"支払い済みの注文を確認",ko:"이전 결제 주문 확인",
 fr:"Voir les anciennes commandes payées",de:"Bereits bezahlte Bestellungen ansehen",
 es:"Ver pedidos anteriores pagados",pt:"Ver pedidos pagos anteriores",
 ar:"عرض الطلبات المدفوعة السابقة"
};
export default function ToolPassUpgradeLink(){
 const {lang}=useLingxiLang();
 return <div className="flex flex-col items-start gap-2"><Link href="/tools/pass"
 className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--lx-line)] bg-[var(--lx-ink)] px-5 py-3 text-sm font-semibold text-[var(--lx-bg)]">
 {label[lang]||label.en}
 </Link><Link href="/account/orders" className="text-xs underline underline-offset-2">{oldOrders[lang]||oldOrders.en}</Link></div>;
}
