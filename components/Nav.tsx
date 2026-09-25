"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LANG_NAMES, type LingxiLang, useLingxiLang } from "@/lib/lingxi-i18n";
import { createClient } from "@/lib/supabase/client";
import { productCatalogText } from "@/lib/product-catalog-i18n";
import { brandText } from "@/lib/brand-system-i18n";
import NotificationBell from "@/components/NotificationBell";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";

type Theme = "light" | "dark";
type K =
  | "home" | "tools" | "products" | "explore" | "studio"
  | "books" | "learning" | "research"
  | "wallet" | "myField";

const groups: { href: string; key: K; icon: LingxiIconName }[][] = [
  [
    { href: "/", key: "home", icon: "home" },
    { href: "/products", key: "products", icon: "products" },
    { href: "/tools", key: "tools", icon: "tools" },
    { href: "/explore", key: "explore", icon: "explore" },
    { href: "/sasi", key: "studio", icon: "sasi" },
  ],
  [
    { href: "/ai-knowledge", key: "books", icon: "book" },
    { href: "/ai-learning", key: "learning", icon: "learning" },
    { href: "/ai-research", key: "research", icon: "research" },
  ],
  [
    { href: "/ai-wallet", key: "wallet", icon: "wallet" },
    { href: "/account", key: "myField", icon: "account" },
  ],
]

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/tools") return pathname === "/tools" || pathname.startsWith("/tools/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

const menuText: Record<LingxiLang, { account:string; orders:string; password:string; navigation:string; switch:string; signout:string; delete:string; close:string }> = {
  zh: { account:"账户", orders:"订单与使用记录", password:"修改密码", navigation:"网站导航", switch:"切换账户", signout:"退出登录", delete:"注销账户", close:"关闭菜单" },
  en: { account:"My Account", orders:"Paid Tasks", password:"Change password", navigation:"Site navigation", switch:"Switch account", signout:"Sign out", delete:"Delete account", close:"Close menu" },
  ja: { account:"マイアカウント", orders:"有料タスク", password:"パスワード変更", navigation:"サイトナビ", switch:"アカウント切替", signout:"ログアウト", delete:"アカウント削除", close:"閉じる" },
  ko: { account:"내 계정", orders:"유료 작업", password:"비밀번호 변경", navigation:"사이트 메뉴", switch:"계정 전환", signout:"로그아웃", delete:"계정 삭제", close:"닫기" },
  fr: { account:"Mon compte", orders:"Tâches payantes", password:"Modifier le mot de passe", navigation:"Navigation", switch:"Changer de compte", signout:"Se déconnecter", delete:"Supprimer le compte", close:"Fermer" },
  de: { account:"Mein Konto", orders:"Bezahlte Aufgaben", password:"Passwort ändern", navigation:"Navigation", switch:"Konto wechseln", signout:"Abmelden", delete:"Konto löschen", close:"Schließen" },
  es: { account:"Mi cuenta", orders:"Tareas pagadas", password:"Cambiar contraseña", navigation:"Navegación", switch:"Cambiar de cuenta", signout:"Cerrar sesión", delete:"Eliminar cuenta", close:"Cerrar" },
  pt: { account:"Minha conta", orders:"Tarefas pagas", password:"Alterar senha", navigation:"Navegação", switch:"Trocar de conta", signout:"Sair", delete:"Excluir conta", close:"Fechar" },
  ar: { account:"حسابي", orders:"المهام المدفوعة", password:"تغيير كلمة المرور", navigation:"التنقل", switch:"تبديل الحساب", signout:"تسجيل الخروج", delete:"حذف الحساب", close:"إغلاق" },
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
    router.push(`/tools?q=${encodeURIComponent(q)}`);
  }

  async function signOut() {
    try { await createClient().auth.signOut(); } catch {}
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  async function switchAccount() {
    try { await createClient().auth.signOut(); } catch {}
    setMenuOpen(false);
    router.push("/account?switch=1");
    router.refresh();
  }

  const side = (
    <>
      <div className="lx11-brand-row">
        <Link href="/" className="lx11-brand">
          <img src="/images/lingxifield-logo.png" alt="" />
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
                <span>{item.key === "products" ? productCatalogText(lang,"title") : item.key === "explore" ? brandText(lang,"exploreNav") : t(item.key)}</span>
              </Link>
            ))}
          </section>
        ))}
      </div>

      <div className="lx11-sidebar-bottom">
        <div className="lx11-theme-row">
          <button onClick={() => setTheme("light")} className={theme === "light" ? "is-active" : ""}>☀ {t("light")}</button>
          <button onClick={() => setTheme("dark")} className={theme === "dark" ? "is-active" : ""}>🌙 {t("dark")}</button>
        </div>
        <label className="lx11-lang-label">{t("language")} / Language</label>
        <select
          value={lang}
          onChange={(event) => setLang(event.target.value as LingxiLang)}
          className="lx11-lang-select"
        >
          {(Object.keys(LANG_NAMES) as LingxiLang[]).map((key) => (
            <option key={key} value={key}>{LANG_NAMES[key]}</option>
          ))}
        </select>
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

          <NotificationBell />

          <Link href="/ai-wallet" className="lx11-primary">💎 {t("recharge")}</Link>

          <button
            className="lx11-avatar lx11-account-trigger"
            aria-label={mt.account}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="lx11-avatar-photo" />
            ) : (
              <span className="lx11-avatar-inner"><b>{Array.from(displayName || "L").slice(0,2).join("").toUpperCase()}</b></span>
            )}
          </button>
        </div>


        {menuOpen && (
          <div className="lx11-account-menu" role="menu">
            <div className="lx11-account-menu-head">
              {avatarUrl ? <img src={avatarUrl} alt="" className="lx11-account-menu-photo" /> : <span className="lx11-account-menu-fallback">{Array.from(displayName || "L").slice(0,2).join("").toUpperCase()}</span>}
              <div>
                <b>{displayName || mt.account}</b>
                <small>{signedIn ? mt.account : t("account")}</small>
              </div>
            </div>
            <div className="lx11-account-menu-links">
              <Link href="/account" onClick={() => setMenuOpen(false)}><span className="lx11-menu-glyph tone-account">●</span><b>{mt.account}</b></Link>
              <Link href="/account/orders" onClick={() => setMenuOpen(false)}><span className="lx11-menu-glyph tone-orders">▤</span><b>{mt.orders}</b></Link>
              <button type="button" onClick={() => { setMenuOpen(false); setOpen(true); }}><span className="lx11-menu-glyph tone-nav">⌁</span><b>{mt.navigation}</b></button>
            </div>
            <div className="lx11-account-menu-divider" />
            <div className="lx11-account-menu-links">
              {signedIn && <button type="button" onClick={switchAccount}><span>SW</span><b>{mt.switch}</b></button>}
              {signedIn && <button type="button" onClick={signOut}><span>EX</span><b>{mt.signout}</b></button>}
            </div>
          </div>
        )}
      </header>

      <header className="lx11-mobile lg:hidden">
        <Link href="/" className="lx11-mobile-brand">
          <img src="/images/lingxifield-logo.png" alt="" />
          <span><b>{t("brand")}</b><small>{agent ? "SASI" : "LINGXIFIELD"}</small></span>
        </Link>
        <div className="lx11-mobile-actions">
          <NotificationBell />
          <Link href="/ai-wallet">💎 {t("recharge")}</Link>
          <button
            className="lx11-mobile-account"
            aria-label={mt.account}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{Array.from(displayName || "L").slice(0,2).join("").toUpperCase()}</span>}
          </button>
        </div>
        {menuOpen && (
          <div className="lx11-account-menu lx11-account-menu-mobile" role="menu">
            <div className="lx11-account-menu-head">
              {avatarUrl ? <img src={avatarUrl} alt="" className="lx11-account-menu-photo" /> : <span className="lx11-account-menu-fallback">{Array.from(displayName || "L").slice(0,2).join("").toUpperCase()}</span>}
              <div><b>{displayName || mt.account}</b><small>{mt.account}</small></div>
            </div>
            <div className="lx11-account-menu-links">
              <Link href="/account" onClick={() => setMenuOpen(false)}><span>AC</span><b>{mt.account}</b></Link>
              <Link href="/account/orders" onClick={() => setMenuOpen(false)}><span>OR</span><b>{mt.orders}</b></Link>
              <button type="button" onClick={() => { setMenuOpen(false); setOpen(true); }}><span>NV</span><b>{mt.navigation}</b></button>
              {signedIn && <button type="button" onClick={switchAccount}><span>SW</span><b>{mt.switch}</b></button>}
              {signedIn && <button type="button" onClick={signOut}><span>EX</span><b>{mt.signout}</b></button>}
            </div>
          </div>
        )}
      </header>

      {open && <button className="lx11-backdrop" onClick={() => setOpen(false)} />}
      <aside className={`lx11-sidebar lx11-drawer ${open ? "is-open" : ""}`}>{side}</aside>
    </>
  );
}
