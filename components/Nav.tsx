"use client";

import NextImage from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LANG_NAMES, type LingxiLang, useLingxiLang } from "@/lib/lingxi-i18n";
import { createClient } from "@/lib/supabase/client";
import { productCatalogText } from "@/lib/product-catalog-i18n";
import { brandText } from "@/lib/brand-system-i18n";
import {moneyText} from "@/lib/notifications/money-copy";
import NotificationBell from "@/components/NotificationBell";
import CurrencySelector from "@/components/CurrencySelector";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";
import {supportCopy} from "@/lib/support-ui-copy";
import LingxifieldFeedback from "@/components/support/LingxifieldFeedback";
import MobileBottomNav from "@/components/MobileBottomNav";

type Theme = "light" | "dark";
type K =
  | "home" | "tools" | "studio"
  | "wallet" | "myField";

const groups: { href: string; key: K; icon: LingxiIconName }[][] = [
  [
    { href: "/", key: "home", icon: "home" },
    { href: "/tools", key: "tools", icon: "tools" },
  ],
  [
    { href: "/sasi", key: "studio", icon: "sasi" },
  ],
  [
    { href: "/ai-wallet", key: "wallet", icon: "wallet" },
    { href: "/account", key: "myField", icon: "account" },
  ],
]

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (pathname === "/sasi/pricing") return href === "/ai-wallet";
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

export default function Nav() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { lang, setLang, t } = useLingxiLang();

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [query, setQuery] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [isMoneyAdmin,setIsMoneyAdmin]=useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const stored = (localStorage.getItem("lx-theme") || "light") as Theme;
    setTheme(stored === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    localStorage.setItem("lx-theme", theme);
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
    return () => { alive = false; };
  }, [pathname]);

  useEffect(() => {
    const h=(e:Event)=>{
      const detail=(e as CustomEvent<{display_name?:string;avatar_url?:string}>).detail || {};
      if (detail.display_name !== undefined) setDisplayName(String(detail.display_name || ""));
      if (detail.avatar_url !== undefined) setAvatarUrl(String(detail.avatar_url || ""));
    };
    window.addEventListener("lingxi:profile",h);
    return()=>window.removeEventListener("lingxi:profile",h);
  }, []);

  const agent =
    pathname === "/sasi" ||
    pathname.startsWith("/sasi/") ||
    pathname.startsWith("/ai-");

  const titles = [t("start"), t("sasi"), t("account")];
  const mt = menuText[lang];

  function submit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    sessionStorage.setItem("lx-global-search", q);
    router.push(isMoneyAdmin&&/资金看板|退款管理|提现管理|money admin|funds dashboard/i.test(q)?"/account/money-admin":`/tools?q=${encodeURIComponent(q)}`);
  }

  async function signOut() {
    try { const {error}=await createClient().auth.signOut({scope:"global"}); if(error)throw error; window.location.replace("/account"); return; } catch { setMenuOpen(false); }
  }

  async function switchAccount() {
    try { const {error}=await createClient().auth.signOut({scope:"global"}); if(error)throw error; window.location.replace("/account?mode=signin&switch=1"); return; } catch { setMenuOpen(false); }
  }

  const side = (
    <>
      <div className="lx11-brand-row">
        <Link href="/" className="lx11-brand">
          <NextImage src="/images/lingxifield-logo.png" alt=""  width={64} height={64}/>
          <span>
            <b>{t("brand")}</b>
            <small>{agent ? "SASI" : "LINGXIFIELD"}</small>
          </span>
        </Link>
        <button className="lx11-close lg:hidden" onClick={() => setOpen(false)}>×</button>
      </div>

      <div className="lx11-nav-scroll">
        <Link className="lx11-new-task" href="/sasi"><LingxiMiniIcon name="new" size="nav"/> <span>{t("newTask")}</span></Link>

        {groups.map((group, index) => (
          <section key={index} className="lx11-group">
            <div className="lx11-group-title">{titles[index]}</div>
            {group.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`lx11-link ${active(pathname, item.href) ? "is-active" : ""}`}
              >
                <LingxiMiniIcon name={item.icon} size="nav" className="lx11-nav-icon"/>
                <span>{t(item.key)}</span>
              </Link>
            ))}
          </section>
        ))}
        {isMoneyAdmin&&<Link href="/account/money-admin" className={`lx11-link ${active(pathname,"/account/money-admin")?"is-active":""}`}><LingxiMiniIcon name="wallet" size="nav"/><span>{moneyText(lang,"moneyAdmin")}</span></Link>}
      </div>

      <div style={{padding:"10px 12px 4px"}}>
        <button type="button" onClick={()=>window.dispatchEvent(new Event("lingxifield:feedback"))} style={{width:"100%",display:"flex",alignItems:"center",gap:8,border:"1px solid rgba(150,125,70,.20)",borderRadius:12,padding:"9px 12px",background:"rgba(255,255,255,.55)",fontSize:14,fontWeight:500,lineHeight:"20px",cursor:"pointer"}}><span aria-hidden="true" style={{fontSize:12}}>✦</span><span>{supportCopy(lang).tell}</span></button>
        <Link href="/account/support" style={{display:"block",padding:"7px 12px 0",fontSize:12,opacity:.55}}>{supportCopy(lang).mine}</Link>
      </div>

      <div className="lx11-sidebar-bottom">
        <div className="lx11-theme-row">
          <button onClick={() => setTheme("light")} className={theme === "light" ? "is-active" : ""}>☀ {t("light")}</button>
          <button onClick={() => setTheme("dark")} className={theme === "dark" ? "is-active" : ""}>🌙 {t("dark")}</button>
        </div>
        <label className="lx11-lang-label">{t("language")}</label>
        <select
          value={lang}
          onChange={(event) => setLang(event.target.value as LingxiLang)}
          className="lx11-lang-select"
        >
          {(Object.keys(LANG_NAMES) as LingxiLang[]).map((key) => (
            <option key={key} value={key}>{LANG_NAMES[key]}</option>
          ))}
        </select>
        <CurrencySelector />
      </div>
    </>
  );

  return (
    <>
      <aside className="lx11-sidebar hidden lg:flex">{side}</aside>

      <header className="lx11-topbar">
        <form className="lx11-search" onSubmit={submit}>
          <span>🔎</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} />
        </form>

        <div className="lx11-top-actions">
          <Link href="/sasi" className="lx11-top-link">✨ ＋ {t("create")}</Link>

          <CurrencySelector compact />

          <NotificationBell />

          <Link href="/ai-wallet" className="lx11-primary">💎 {t("recharge")}</Link>

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
          <Link href="/ai-wallet">💎 {t("recharge")}</Link>
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

      <MobileBottomNav/>
      {open && <button className="lx11-backdrop" onClick={() => setOpen(false)} />}
      <aside className={`lx11-sidebar lx11-drawer ${open ? "is-open" : ""}`}>{side}</aside>
    </>
  );
}
