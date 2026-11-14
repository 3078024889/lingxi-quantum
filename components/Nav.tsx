"use client";

import NextImage from "next/image";
import {openMiniShare} from '@/lib/mini/share-client';
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LANG_NAMES, type LingxiLang, useLingxiLang } from "@/lib/lingxi-i18n";
import { createClient } from "@/lib/supabase/client";
import { productCatalogText } from "@/lib/product-catalog-i18n";
import { brandText } from "@/lib/brand-system-i18n";
import {moneyText} from "@/lib/notifications/money-copy";
import NotificationBell from "@/components/NotificationBell";
import PublicAnnouncementTicker from "@/components/PublicAnnouncementTicker";
import CurrencySelector from "@/components/CurrencySelector";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";
import {supportCopy} from "@/lib/support-ui-copy";
import LingxifieldFeedback from "@/components/support/LingxifieldFeedback";
import MobileBottomNav from "@/components/MobileBottomNav";
import { detectMiniPaymentContext, openMiniRecharge } from "@/lib/mini/payment-client";

type Theme = "light" | "dark";
type K =
  | "home" | "tools" | "studio"
  | "wallet" | "myField";

const groups: { href: string; key: K; icon: LingxiIconName }[][] = [
  [
    { href: "/", key: "home", icon: "home" },
    { href: "/siai", key: "home", icon: "tools" },
    { href: "/tools", key: "tools", icon: "tools" },
  ],
  [
    { href: "/sasi", key: "studio", icon: "sasi" },
    { href: "/sasi/seller", key: "studio", icon: "sasi" },
  ],
  [
    { href: "/ai-wallet", key: "wallet", icon: "wallet" },
    { href: "/account", key: "myField", icon: "account" },
  ],
]

const softwareNavNames:Record<LingxiLang,string>={zh:"SASI 智能软件市场",en:"SASI Intelligent Software Marketplace",ja:"SASI インテリジェントソフトウェア市場",ko:"SASI 지능형 소프트웨어 마켓",fr:"Marché de logiciels intelligents SASI",de:"SASI-Marktplatz für intelligente Software",es:"Mercado de software inteligente SASI",pt:"Mercado de software inteligente SASI",ar:"سوق برامج SASI الذكية"};
const sellerNavNames:Record<LingxiLang,string>={zh:"卖家服务",en:"Seller services",ja:"出品者サービス",ko:"판매자 서비스",fr:"Services vendeurs",de:"Verkäuferbereich",es:"Servicios para vendedores",pt:"Serviços para vendedores",ar:"خدمات البائعين"};
const marketNavNames:Record<LingxiLang,string>={zh:"全球 SIAI 排行榜",en:"Global SIAI Rankings",ja:"世界の SIAI ランキング",ko:"글로벌 SIAI 순위",fr:"Classement mondial SIAI",de:"Globales SIAI-Ranking",es:"Ranking mundial SIAI",pt:"Ranking global SIAI",ar:"ترتيب SIAI العالمي"};
const HOME_NAV_COPY:Record<LingxiLang,string[]>={
 zh:["首页","全球 SIAI 排行榜","实用工具","SASI 智能软件市场","工具包会员","解决方案","资源中心"],
 en:["Home","Global SIAI Rankings","Practical Tools","SASI Software Marketplace","ToolPass","Solutions","Resources"],
 ja:["ホーム","世界の SIAI ランキング","実用ツール","SASIソフトウェア市場","ToolPass会員","ソリューション","リソース"],
 ko:["홈","글로벌 SIAI 순위","실용 도구","SASI 소프트웨어 마켓","ToolPass 회원","솔루션","자료실"],
 fr:["Accueil","Classement SIAI","Outils pratiques","Marché SASI","ToolPass","Solutions","Ressources"],
 de:["Startseite","Globales SIAI-Ranking","Praktische Tools","SASI-Softwaremarkt","ToolPass","Lösungen","Ressourcen"],
 es:["Inicio","Ranking SIAI global","Herramientas","Mercado SASI","ToolPass","Soluciones","Recursos"],
 pt:["Início","Ranking SIAI global","Ferramentas","Mercado SASI","ToolPass","Soluções","Recursos"],
 ar:["الرئيسية","تصنيف SIAI العالمي","الأدوات العملية","سوق SASI","عضوية ToolPass","الحلول","الموارد"]
};
const HOME_NAV_HREFS=["/","/siai","/tools","/sasi","/tools/pass","/partners","/discoveries"] as const;


function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (pathname === "/sasi/pricing") return href === "/sasi";
  if (href === "/sasi") return pathname === "/sasi" || pathname === "/sasi/delivery" || pathname.startsWith("/sasi/marketplace/");
  if (href === "/sasi/seller") return pathname === "/sasi/seller" || pathname.startsWith("/sasi/seller/");
  if (href === "/tools") return pathname === "/tools" || pathname.startsWith("/tools/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

const menuText: Record<LingxiLang, { account:string; orders:string; password:string; navigation:string; settings:string; switch:string; signout:string; delete:string; close:string }> = {
  zh: { account:"账户", orders:"订单与使用记录", password:"修改密码", navigation:"网站导航", settings:"设置", switch:"切换账户", signout:"退出登录", delete:"注销账户", close:"关闭菜单" },
  en: { account:"My Account", orders:"Paid Tasks", password:"Change password", navigation:"Site navigation", settings:"Settings", switch:"Switch account", signout:"Sign out", delete:"Delete account", close:"Close menu" },
  ja: { account:"マイアカウント", orders:"有料タスク", password:"パスワード変更", navigation:"サイトナビ", settings:"設定", switch:"アカウント切替", signout:"ログアウト", delete:"アカウント削除", close:"閉じる" },
  ko: { account:"내 계정", orders:"유료 작업", password:"비밀번호 변경", navigation:"사이트 메뉴", settings:"설정", switch:"계정 전환", signout:"로그아웃", delete:"계정 삭제", close:"닫기" },
  fr: { account:"Mon compte", orders:"Tâches payantes", password:"Modifier le mot de passe", navigation:"Navigation", settings:"Paramètres", switch:"Changer de compte", signout:"Se déconnecter", delete:"Supprimer le compte", close:"Fermer" },
  de: { account:"Mein Konto", orders:"Bezahlte Aufgaben", password:"Passwort ändern", navigation:"Navigation", settings:"Einstellungen", switch:"Konto wechseln", signout:"Abmelden", delete:"Konto löschen", close:"Schließen" },
  es: { account:"Mi cuenta", orders:"Tareas pagadas", password:"Cambiar contraseña", navigation:"Navegación", settings:"Ajustes", switch:"Cambiar de cuenta", signout:"Cerrar sesión", delete:"Eliminar cuenta", close:"Cerrar" },
  pt: { account:"Minha conta", orders:"Tarefas pagas", password:"Alterar senha", navigation:"Navegação", settings:"Configurações", switch:"Trocar de conta", signout:"Sair", delete:"Excluir conta", close:"Fechar" },
  ar: { account:"حسابي", orders:"المهام المدفوعة", password:"تغيير كلمة المرور", navigation:"التنقل", settings:"الإعدادات", switch:"تبديل الحساب", signout:"تسجيل الخروج", delete:"حذف الحساب", close:"إغلاق" },
};

export default function Nav({homeLayout=false}:{homeLayout?:boolean}={}) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { lang, setLang, t } = useLingxiLang();

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [homeNavOpen,setHomeNavOpen]=useState(false);
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  useEffect(()=>{
   let saved=false;
   try{saved=localStorage.getItem("lx-sidebar-collapsed")==="1"}catch{}
   setSidebarCollapsed(saved);
  },[]);
  useEffect(()=>{
   document.documentElement.dataset.lxSidebar=sidebarCollapsed?"closed":"open";
   try{localStorage.setItem("lx-sidebar-collapsed",sidebarCollapsed?"1":"0")}catch{}
   return()=>{delete document.documentElement.dataset.lxSidebar};
  },[sidebarCollapsed]);
  const [theme, setTheme] = useState<Theme>("light");
  const [query, setQuery] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [isMoneyAdmin,setIsMoneyAdmin]=useState(false);
 const [isComHost,setIsComHost]=useState(false);
 useEffect(()=>{setIsComHost(["lingxifield.com","www.lingxifield.com"].includes(window.location.hostname.toLowerCase()))},[]);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [miniRecharge, setMiniRecharge] = useState(false);
  useEffect(() => { let alive = true; void detectMiniPaymentContext().then(value => { if (alive) setMiniRecharge(value); }); return () => { alive = false; }; }, []);
  function rechargeClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!miniRecharge) return;
    event.preventDefault();
    void openMiniRecharge().then(opened => { if (!opened) window.alert("请使用最新小程序体验版，或等待新版本审核发布后再充值。"); });
  }

  useEffect(() => {
    let stored:Theme="light";try{stored=(localStorage.getItem("lx-theme")||"light") as Theme}catch{}
    setTheme(stored === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => setHomeNavOpen(false), [pathname]);

  useEffect(() => {
    try{localStorage.setItem("lx-theme", theme)}catch{}
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let alive = true;
    try {
      const supabase = createClient();
      supabase.auth.getUser()
        .then(({ data }) => {
          if (!alive) return;
          setSignedIn(Boolean(data.user));
          setIsMoneyAdmin(false);
          if(data.user)void fetch("/api/account/money-admin/access",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(alive)setIsMoneyAdmin(d?.isAdmin===true)}).catch(()=>{});
          setDisplayName(String(data.user?.user_metadata?.display_name || data.user?.email?.split("@")[0] || ""));
          setAvatarUrl(String(data.user?.user_metadata?.avatar_url || data.user?.user_metadata?.picture || ""));
        })
        .catch(() => { if (alive) setSignedIn(false); });
    } catch {
      setSignedIn(false);
    }
    return (
    <>
      {homeLayout ? (
       <header className="lx-home-nav" data-home-nav>
        <Link href="/" className="lx-home-nav-brand" aria-label="LINGXIFIELD home"><NextImage src="/images/lingxifield-logo.png" alt="" width={64} height={64}/><span><b>灵犀场 LINGXIFIELD</b><small>{lang==="zh"?"全球智能服务与实用工具平台":"Global intelligent services & practical tools"}</small></span></Link>
        <nav className={homeNavOpen?"lx-home-nav-links is-open":"lx-home-nav-links"} aria-label="Main navigation">{HOME_NAV_HREFS.map((href,index)=><Link href={href} key={href} onClick={()=>setHomeNavOpen(false)} className={active(pathname,href)?"is-active":""}>{HOME_NAV_COPY[lang][index]}</Link>)}</nav>
        <form className="lx-home-nav-search" onSubmit={submit}><span aria-hidden="true">⌕</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder={lang==="zh"?"搜索工具、问题或产品…":"Search tools, questions or products…"} aria-label={lang==="zh"?"搜索工具、问题或产品":"Search tools, questions or products"}/></form>
        <div className="lx-home-nav-actions">
         <select aria-label={t("language")} value={lang} onChange={event=>setLang(event.target.value as LingxiLang)}>{(Object.keys(LANG_NAMES) as LingxiLang[]).map(key=><option key={key} value={key}>{LANG_NAMES[key]}</option>)}</select>
         <CurrencySelector compact/><NotificationBell/><button type="button" className="lx-home-theme-toggle" aria-label={lang==="zh"?"切换深浅主题":"Toggle theme"} onClick={()=>setTheme(theme==="light"?"dark":"light")}>{theme==="light"?"☾":"☀"}</button>
         <Link href="/ai-wallet" onClick={rechargeClick} className="lx-home-recharge">💎 {t("recharge")}</Link>
         {signedIn===false?<><Link href="/account?mode=signin" className="lx-home-signin">{lang==="zh"?"登录":"Sign in"}</Link><Link href="/account?mode=signup" className="lx-home-register">{lang==="zh"?"注册":"Register"}</Link></>:<button type="button" className="lx-home-account-trigger" aria-label={mt.account} aria-expanded={menuOpen} onClick={()=>setMenuOpen(value=>!value)}>{avatarUrl?<NextImage src={avatarUrl} alt="" width={36} height={36} unoptimized/>:<span>{Array.from(displayName||"L").slice(0,2).join("").toUpperCase()}</span>}</button>}
        </div>
        <button type="button" className="lx-home-nav-toggle" aria-expanded={homeNavOpen} aria-label={lang==="zh"?"展开导航":"Open navigation"} onClick={()=>setHomeNavOpen(value=>!value)}>{homeNavOpen?"×":"☰"}</button>
        {menuOpen&&<div className="lx11-account-menu lx-home-account-menu" role="menu"><div className="lx11-account-menu-head">{avatarUrl?<NextImage src={avatarUrl} alt="" className="lx11-account-menu-photo" width={64} height={64} unoptimized/>:<span className="lx11-account-menu-fallback">{Array.from(displayName||"L").slice(0,2).join("").toUpperCase()}</span>}<div><b>{displayName||mt.account}</b><small>{signedIn?mt.account:t("account")}</small></div></div><div className="lx11-account-menu-links">
         <Link href="/account" onClick={()=>setMenuOpen(false)}><LingxiMiniIcon name="account" size="tiny"/><b>{mt.account}</b></Link><Link href="/account/orders" onClick={()=>setMenuOpen(false)}><LingxiMiniIcon name="orders" size="tiny"/><b>{mt.orders}</b></Link><Link href="/account/settings" onClick={()=>setMenuOpen(false)}><span>⚙</span><b>{mt.settings}</b></Link><button type="button" onClick={()=>{setMenuOpen(false);setOpen(true)}}><LingxiMiniIcon name="products" size="tiny"/><b>{mt.navigation}</b></button>{signedIn&&<button type="button" onClick={switchAccount}><LingxiMiniIcon name="switch" size="tiny"/><b>{mt.switch}</b></button>}{signedIn&&<button type="button" onClick={signOut}><LingxiMiniIcon name="signout" size="tiny"/><b>{mt.signout}</b></button>}
        </div></div>}
       </header>
      ) : (
       <>
      <aside className="lx11-sidebar hidden lg:flex">{side}</aside>

      <header className="lx11-topbar">
        <button type="button" className="lx11-desktop-side-toggle" aria-expanded={!sidebarCollapsed} aria-label={sidebarCollapsed?(lang==="zh"?"展开左侧导航":"Show sidebar"):(lang==="zh"?"收起左侧导航":"Hide sidebar")} onClick={()=>setSidebarCollapsed(v=>!v)}>{sidebarCollapsed?"☰":"⇤"}</button>
        <form className="lx11-search" onSubmit={submit}>
          <span>🔎</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} />
        </form>

        <div className="lx11-top-actions">

          <CurrencySelector compact />

          <NotificationBell />
          {miniRecharge&&<button type="button" onClick={()=>void openMiniShare(document.title)} aria-label={lang==='zh'?'分享':'Share'} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--lx-line)]">↗</button>}

          <Link href="/ai-wallet" onClick={rechargeClick} className="lx11-primary">💎 {t("recharge")}</Link>

          <button
            className="lx11-avatar lx11-account-trigger"
            aria-label={mt.account}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {avatarUrl ? (
              <NextImage src={avatarUrl} alt="" className="lx11-avatar-photo"  width={64} height={64} unoptimized/>
            ) : (
              <span className="lx11-avatar-inner"><b>{Array.from(displayName || "L").slice(0,2).join("").toUpperCase()}</b></span>
            )}
          </button>
        </div>


        {menuOpen && (
          <div className="lx11-account-menu" role="menu">
            <div className="lx11-account-menu-head">
              {avatarUrl ? <NextImage src={avatarUrl} alt="" className="lx11-account-menu-photo"  width={64} height={64} unoptimized/> : <span className="lx11-account-menu-fallback">{Array.from(displayName || "L").slice(0,2).join("").toUpperCase()}</span>}
              <div>
                <b>{displayName || mt.account}</b>
                <small>{signedIn ? mt.account : t("account")}</small>
              </div>
            </div>
            <div className="lx11-account-menu-links">
              <Link href="/account" onClick={() => setMenuOpen(false)}><LingxiMiniIcon name="account" size="tiny"/><b>{mt.account}</b></Link>
              <Link href="/account/orders" onClick={() => setMenuOpen(false)}><LingxiMiniIcon name="orders" size="tiny"/><b>{mt.orders}</b></Link>
              <Link href="/account/settings" onClick={() => setMenuOpen(false)} className="lx-v40-account-settings-link"><span>⚙</span><b>{mt.settings}</b></Link>
              <button type="button" onClick={() => { setMenuOpen(false); setOpen(true); }}><LingxiMiniIcon name="products" size="tiny"/><b>{mt.navigation}</b></button>
            </div>
            <div className="lx11-account-menu-divider" />
            <div className="lx11-account-menu-links">
              {signedIn && <button type="button" onClick={switchAccount}><LingxiMiniIcon name="switch" size="tiny"/><b>{mt.switch}</b></button>}
              {signedIn && <button type="button" onClick={signOut}><LingxiMiniIcon name="signout" size="tiny"/><b>{mt.signout}</b></button>}
            </div>
          </div>
        )}
      </header>

      <header className="lx11-mobile lg:hidden">
        <Link href="/" className="lx11-mobile-brand">
          <NextImage src="/images/lingxifield-logo.png" alt=""  width={64} height={64}/>
          <span><b>{t("brand")}</b><small>{agent ? "SASI" : "LINGXIFIELD"}</small></span>
        </Link>
        <div className="lx11-mobile-actions">
          <CurrencySelector compact />
          <NotificationBell />
          <Link href="/ai-wallet" onClick={rechargeClick}>💎 {t("recharge")}</Link>
          <button
            className="lx11-mobile-account"
            aria-label={mt.account}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {avatarUrl ? <NextImage src={avatarUrl} alt=""  width={64} height={64} unoptimized/> : <span>{Array.from(displayName || "L").slice(0,2).join("").toUpperCase()}</span>}
          </button>
        </div>
        {menuOpen && (
          <div className="lx11-account-menu lx11-account-menu-mobile" role="menu">
            <div className="lx11-account-menu-head">
              {avatarUrl ? <NextImage src={avatarUrl} alt="" className="lx11-account-menu-photo"  width={64} height={64} unoptimized/> : <span className="lx11-account-menu-fallback">{Array.from(displayName || "L").slice(0,2).join("").toUpperCase()}</span>}
              <div><b>{displayName || mt.account}</b><small>{mt.account}</small></div>
            </div>
            <div className="lx11-account-menu-links">
              <Link href="/account" onClick={() => setMenuOpen(false)}><LingxiMiniIcon name="account" size="tiny"/><b>{mt.account}</b></Link>
              <Link href="/account/orders" onClick={() => setMenuOpen(false)}><LingxiMiniIcon name="orders" size="tiny"/><b>{mt.orders}</b></Link>
              <Link href="/account/settings" onClick={() => setMenuOpen(false)} className="lx-v40-account-settings-link"><span>⚙</span><b>{mt.settings}</b></Link>
              <button type="button" onClick={() => { setMenuOpen(false); setOpen(true); }}><LingxiMiniIcon name="products" size="tiny"/><b>{mt.navigation}</b></button>
              {signedIn && <button type="button" onClick={switchAccount}><span>SW</span><b>{mt.switch}</b></button>}
              {signedIn && <button type="button" onClick={signOut}><span>EX</span><b>{mt.signout}</b></button>}
            </div>
            <div className="lx-v40-account-quick-settings">
              <div>
                <label>{t("language")}</label>
                <select value={lang} onChange={(event)=>setLang(event.target.value as LingxiLang)}>
                  {(Object.keys(LANG_NAMES) as LingxiLang[]).map(key=><option key={key} value={key}>{LANG_NAMES[key]}</option>)}
                </select>
              </div>
              <div>
                <CurrencySelector/>
              </div>
            </div>
          </div>
        )}
      </header>


       </>
      )}
      <PublicAnnouncementTicker/>
      <MobileBottomNav/>
      {open && <button className="lx11-backdrop" onClick={() => setOpen(false)} />}
      <aside className={`lx11-sidebar lx11-drawer ${open ? "is-open" : ""}`}>{side}</aside>
    </>
  );
}