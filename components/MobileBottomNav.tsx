"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";

const COPY={
 zh:{home:"首页",tools:"工具",create:"创作",tasks:"任务",account:"账户"},
 en:{home:"Home",tools:"Tools",create:"Create",tasks:"Tasks",account:"Account"},
 ja:{home:"ホーム",tools:"ツール",create:"制作",tasks:"タスク",account:"アカウント"},
 ko:{home:"홈",tools:"도구",create:"창작",tasks:"작업",account:"계정"},
 fr:{home:"Accueil",tools:"Outils",create:"Créer",tasks:"Tâches",account:"Compte"},
 de:{home:"Start",tools:"Tools",create:"Erstellen",tasks:"Aufgaben",account:"Konto"},
 es:{home:"Inicio",tools:"Herramientas",create:"Crear",tasks:"Tareas",account:"Cuenta"},
 pt:{home:"Início",tools:"Ferramentas",create:"Criar",tasks:"Tarefas",account:"Conta"},
 ar:{home:"الرئيسية",tools:"الأدوات",create:"إنشاء",tasks:"المهام",account:"الحساب"},
} as const;

export default function MobileBottomNav(){
 const pathname=usePathname()||"/";
 const{lang}=useLingxiLang();
 const c=COPY[lang]??COPY.en;
 if(/^\/(?:checkout|checkout-usd|paypal)(?:\/|$)/.test(pathname))return null;
 const items=[
  {href:"/",label:c.home,icon:"home" as const,active:pathname==="/"},
  {href:"/tools",label:c.tools,icon:"tools" as const,active:pathname==="/tools"||pathname.startsWith("/tools/")},
  {href:"/sasi",label:c.create,icon:"sasi" as const,active:pathname==="/sasi"||(pathname.startsWith("/sasi/")&&pathname!=="/sasi/pricing")||pathname.startsWith("/sasi?mode=book")||pathname.startsWith("/sasi?mode=learning")||pathname.startsWith("/sasi?mode=research")},
  {href:"/account/orders",label:c.tasks,icon:"orders" as const,active:pathname.startsWith("/account/orders")||pathname.startsWith("/account/tool-jobs")},
  {href:"/account",label:c.account,icon:"account" as const,active:pathname==="/sasi/pricing"||pathname==="/ai-wallet"||pathname==="/account"||pathname.startsWith("/account/")},
 ];
 return <nav className="lx-v40-mobile-bottom" aria-label={c.home}>
  {items.map(item=><Link key={item.href} href={item.href} className={item.active?"is-active":""}>
   <LingxiMiniIcon name={item.icon} size="tiny"/>
   <span>{item.label}</span>
  </Link>)}
 </nav>;
}
