"use client";
import Link from "next/link";
import LxText from "@/components/LxText";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";
import AccountProfileCard from "@/components/AccountProfileCard";
import ChangePasswordForm from "@/app/account/ChangePasswordForm";
import SwitchAccountButton from "@/app/account/SwitchAccountButton";
import SignOutButton from "@/app/account/SignOutButton";
import DeleteAccountButton from "@/app/account/DeleteAccountButton";

type Entry={href:string;icon:LingxiIconName;zh:string;en:string;subZh:string;subEn:string};
const items:Entry[]=[
 {href:"/products",icon:"products",zh:"产品中心",en:"Product Center",subZh:"管理软件作品与授权",subEn:"Software & licenses"},
 {href:"/account/orders",icon:"orders",zh:"订单与使用记录",en:"Orders & usage",subZh:"订单明细与使用记录",subEn:"Order and usage history"},
 {href:"/ai-wallet",icon:"wallet",zh:"余额",en:"Wallet",subZh:"余额、充值及账本",subEn:"Balance, top-ups & ledger"},
 {href:"/sasi",icon:"sasi",zh:"SASI 智能软件",en:"SASI Software",subZh:"发现、管理与发布原创软件",subEn:"Discover, manage & publish software"},
 {href:"/account/withdrawals",icon:"refund",zh:"余额提现",en:"Withdrawals",subZh:"查看退款与提现进度",subEn:"Refund and withdrawal status"},
 {href:"/account/support",icon:"account",zh:"我的问题",en:"Support requests",subZh:"问题、截图和处理进度",subEn:"Requests and progress"},
 {href:"/account/notifications",icon:"orders",zh:"消息与公告",en:"Notifications",subZh:"平台消息与版本更新",subEn:"Platform notices & updates"},
 {href:"/account/settings",icon:"settings",zh:"设置",en:"Settings",subZh:"账户安全、语言与偏好",subEn:"Security and preferences"}
];
export default function AccountCenterV26({email,initialName,paidOrderCount}:{email:string;initialName:string;paidOrderCount:number|null}){
 return <div className="lx26-account">
  <header className="lx26-account-head"><p className="lx26-overline">LINGXIFIELD / ACCOUNT</p><h1><LxText zh="账户中心" en="Account Center" ja="アカウントセンター" ko="계정 센터" fr="Espace compte" de="Kontocenter" es="Centro de cuenta" pt="Centro da conta" ar="مركز الحساب"/></h1><p><LxText zh="管理账户信息、订单、余额及平台服务" en="Manage profile, orders, balances and services"/></p></header>
  <div className="lx26-account-profile"><AccountProfileCard email={email} initialName={initialName}/></div>
  <section className="lx26-account-welcome"><span aria-hidden="true" className="lx26-title-bar"/><h2><LxText zh="欢迎回来" en="Welcome back" ja="おかえりなさい" ko="다시 오신 것을 환영합니다" fr="Bon retour" de="Willkommen zurück" es="Bienvenido de nuevo" pt="Bem-vindo de volta" ar="مرحبًا بعودتك"/></h2></section>
  <nav className="lx26-account-services" aria-label="Account services">
   {items.map(item=><Link key={item.href} href={item.href} className="lx26-account-tile">
    <LingxiMiniIcon name={item.icon} size="title"/>
    <span className="lx26-account-tilecopy"><strong><LxText zh={item.zh} en={item.en}/></strong><small><LxText zh={item.subZh} en={item.subEn}/>{item.href==="/account/orders"&&paidOrderCount!==null?<span> · {paidOrderCount}</span>:null}</small></span>
    <span className="lx26-account-chevron" aria-hidden="true">›</span>
   </Link>)}
  </nav>
  <section className="lx26-account-actions"><ChangePasswordForm/><SwitchAccountButton/><SignOutButton/><DeleteAccountButton/></section>
 </div>;
}