"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon from "@/components/LingxiMiniIcon";

const COPY={
 zh:{home:"首页",tools:"工具",create:"软件",account:"账户"},
 en:{home:"Home",tools:"Tools",create:"Software",account:"Account"},
 ja:{home:"ホーム",tools:"ツール",create:"ソフト",account:"アカウント"},
 ko:{home:"홈",tools:"도구",create:"소프트웨어",account:"계정"},
 fr:{home:"Accueil",tools:"Outils",create:"Logiciels",account:"Compte"},
 de:{home:"Start",tools:"Tools",create:"Software",account:"Konto"},
 es:{home:"Inicio",tools:"Herramientas",create:"Software",account:"Cuenta"},
 pt:{home:"Início",tools:"Ferramentas",create:"Software",account:"Conta"},
 ar:{home:"الرئيسية",tools:"الأدوات",create:"برمجيات",account:"الحساب"},
} as const;

export default function MobileBottomNav(){
 const pathname=usePathname()||"/";
 const{lang}=useLingxiLang();
 const c=COPY[lang]??COPY.en;
 if(/^\/(?:checkout|checkout-usd|paypal)(?:\/|$)/.test(pathname))return null;
 const items=[
  {href:"/",label:c.home,icon:"home" as const,active:pathname==="/"},
  {href:"/tools",label:c.tools,icon:"tools" as const,active:pathname==="/tools"||pathname.startsWith("/tools/")},
  {href:"/sasi",label:c.create,icon:"sasi" as const,active:pathname==="/sasi"||pathname.startsWith("/sasi/")},  {href:"/account",label:c.account,icon:"account" as const,active:pathname==="/ai-wallet"||pathname==="/account"||pathname.startsWith("/account/")},
 ];
 return <nav className="lx-v40-mobile-bottom" aria-label={c.home}>
  {items.map(item=><Link key={item.href} href={item.href} className={item.active?"is-active":""}>
   <LingxiMiniIcon name={item.icon} size="tiny"/>
   <span>{item.label}</span>
  </Link>)}
 </nav>;
}
