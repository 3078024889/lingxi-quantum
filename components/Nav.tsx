"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LANG_NAMES, type LingxiLang, useLingxiLang } from "@/lib/lingxi-i18n";
import { createClient } from "@/lib/supabase/client";

type Theme = "light" | "dark";
type K =
  | "home" | "tools" | "studio"
  | "books" | "learning" | "research"
  | "field" | "manifest" | "subconscious" | "practice"
  | "wallet" | "myField";

const groups: { href: string; key: K; icon: string }[][] = [
  [
    { href: "/", key: "home", icon: "🏠" },
    { href: "/tools", key: "tools", icon: "🧰" },
    { href: "/sasi", key: "studio", icon: "✨" },
  ],
  [
    { href: "/ai-knowledge", key: "books", icon: "📚" },
    { href: "/ai-learning", key: "learning", icon: "🎓" },
    { href: "/ai-research", key: "research", icon: "🔬" },
  ],
  [
    { href: "/field-tests", key: "field", icon: "🧭" },
    { href: "/live-as", key: "manifest", icon: "🌠" },
    { href: "/subconscious", key: "subconscious", icon: "🫧" },
    { href: "/practice", key: "practice", icon: "🪷" },
    { href: "/ai-wallet", key: "wallet", icon: "💎" },
    { href: "/account", key: "myField", icon: "👤" },
  ],
];

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/tools") return pathname === "/tools" || pathname.startsWith("/tools/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

const menuText = {
  zh: { account:"账户中心", password:"忘记 / 修改密码", switch:"切换账户", signout:"退出登录", delete:"注销账户", close:"关闭菜单" },
  en: { account:"Account", password:"Forgot / change password", switch:"Switch account", signout:"Sign out", delete:"Delete account", close:"Close menu" },
} as const;

export default function Nav() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { lang, setLang, t } = useLingxiLang();

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [query, setQuery] = useState("");
  const [updates, setUpdates] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

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
        .then(({ data }) => { if (alive) setSignedIn(Boolean(data.user)); })
        .catch(() => { if (alive) setSignedIn(false); });
    } catch {
      setSignedIn(false);
    }
    return () => { alive = false; };
  }, [pathname]);

  const agent =
    pathname === "/sasi" ||
    pathname.startsWith("/sasi/") ||
    pathname.startsWith("/ai-");

  const titles = [t("start"), t("sasi"), t("fieldGroup")];
  const mt = menuText[lang === "zh" ? "zh" : "en"];

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
        <Link className="lx11-new-task" href="/sasi">✨ ＋ {t("newTask")}</Link>

        {groups.map((group, index) => (
          <section key={index} className="lx11-group">
            <div className="lx11-group-title">{titles[index]}</div>
            {group.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`lx11-link ${active(pathname, item.href) ? "is-active" : ""}`}
              >
                <span aria-hidden="true" style={{ width: 22, textAlign: "center", filter: "saturate(1.18)" }}>
                  {item.icon}
                </span>
                <span>{t(item.key)}</span>
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

          <button
            className="lx11-icon-btn"
            aria-label={t("updates")}
            aria-expanded={updates}
            onClick={() => { setUpdates((value) => !value); setMenuOpen(false); }}
          >
            🔔
          </button>

          <Link href="/ai-wallet" className="lx11-primary">💎 {t("recharge")}</Link>

          <button
            className="lx11-avatar"
            aria-label={t("account")}
            aria-expanded={menuOpen}
            onClick={() => { setMenuOpen((value) => !value); setUpdates(false); }}
          >
            👤
          </button>

          <button
            className="lx11-icon-btn"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
        </div>

        {updates && (
          <div className="lx11-updates">
            <b>🔔 {t("updateTitle")}</b>
            <p>✨ {t("update1")}</p>
            <p>🧰 {t("update2")}</p>
            <p>{lang === "zh" ? "创作能力未完成接入的入口，会明确显示「待上线」。" : "Creation entries that are not integrated are clearly marked Coming soon."}</p>
          </div>
        )}

        {menuOpen && (
          <div className="lx11-updates" style={{ right: 18, top: 62 }}>
            <b>👤 {mt.account}</b>
            <Link href="/account" onClick={() => setMenuOpen(false)}>{mt.account} →</Link>
            <Link href="/account#account-actions" onClick={() => setMenuOpen(false)}>{mt.password} →</Link>
            {signedIn && <button type="button" onClick={switchAccount}>{mt.switch} →</button>}
            {signedIn && <button type="button" onClick={signOut}>{mt.signout} →</button>}
            <Link href="/account#account-actions" onClick={() => setMenuOpen(false)}>{mt.delete} →</Link>
          </div>
        )}
      </header>

      <header className="lx11-mobile lg:hidden">
        <Link href="/" className="lx11-mobile-brand">
          <img src="/images/lingxifield-logo.png" alt="" />
          <span><b>{t("brand")}</b><small>{agent ? "SASI" : "LINGXIFIELD"}</small></span>
        </Link>
        <div className="lx11-mobile-actions">
          <Link href="/ai-wallet">💎 {t("recharge")}</Link>
          <button onClick={() => setOpen(true)}>☰</button>
        </div>
      </header>

      {open && <button className="lx11-backdrop" onClick={() => setOpen(false)} />}
      <aside className={`lx11-sidebar lx11-drawer ${open ? "is-open" : ""}`}>{side}</aside>
    </>
  );
}
