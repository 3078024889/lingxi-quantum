"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoginForm from "./LoginForm";
import MiniAccountLinkPanel from "./MiniAccountLinkPanel";
import AccountCenterV26 from "@/components/AccountCenterV26";
import LxText from "@/components/LxText";

type AccountUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
};
type LoginMode = "signin" | "signup" | "verify";
type LoginParams = {
  afterAuthPath: string;
  initialMode: LoginMode;
  serverError: string;
  initialEmail: string;
  miniLink: string;
};

export default function AccountClientShell() {
  const [view, setView] = useState<"loading" | "login" | "account" | "error">("loading");
  const [user, setUser] = useState<AccountUser | null>(null);
  const [paidOrderCount, setPaidOrderCount] = useState<number | null>(null);
  const [login, setLogin] = useState<LoginParams>({
    afterAuthPath: "/products",
    initialMode: "signin",
    serverError: "",
    initialEmail: "",
    miniLink: ""
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const miniLink = (params.get("miniLink") || "").slice(0, 2048);
    const requestedNext = params.get("next") || "";
    const safeNext =
      requestedNext.startsWith("/") &&
      !requestedNext.startsWith("//") &&
      !requestedNext.includes(String.fromCharCode(92)) &&
      requestedNext.length <= 512;
    const afterAuthPath = safeNext
      ? requestedNext
      : miniLink
        ? "/account?miniLink=" + encodeURIComponent(miniLink) + "&mini=1"
        : "/products";
    const mode = params.get("mode");
    const initialMode: LoginMode = mode === "verify" ? "verify" : mode === "signup" ? "signup" : "signin";

    setLogin({
      afterAuthPath,
      initialMode,
      serverError: (params.get("auth_error") || "").slice(0, 80),
      initialEmail: (params.get("email") || "").slice(0, 320),
      miniLink
    });

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      setView("error");
      return;
    }
    let active = true;
    let initialResolved = false;
    let countedUserId = "";
    const loadPaidOrderCount = (userId: string) => {
      if (countedUserId === userId) return;
      countedUserId = userId;
      const query = supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "paid");
      void Promise.resolve(query)
        .then(({ count, error }) => {
          if (active) setPaidOrderCount(!error && typeof count === "number" ? count : null);
        })
        .catch(() => {
          if (active) setPaidOrderCount(null);
        });
    };
    const applyUser = (nextUser: AccountUser | null) => {
      setUser(nextUser);
      setView(nextUser ? "account" : "login");
      if (nextUser) loadPaidOrderCount(nextUser.id);
      else {
        countedUserId = "";
        setPaidOrderCount(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "INITIAL_SESSION" && !initialResolved) return;
      const nextUser = (session?.user ?? null) as AccountUser | null;
      applyUser(nextUser);
    });

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      initialResolved = true;
      if (error) {
        setView("error");
        return;
      }
      const nextUser = (data.user ?? null) as AccountUser | null;
      applyUser(nextUser);
    }).catch(() => {
      if (!active) return;
      initialResolved = true;
      setView("error");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (view === "loading") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7 text-center" aria-live="polite">
        <p className="text-sm leading-7 text-[var(--lx-muted)]">
          <LxText zh="正在安全读取账户状态…" en="Checking your account securely…" />
        </p>
      </div>
    );
  }

  if (view === "error") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7 text-center" role="alert">
        <h1 className="font-display text-2xl text-[var(--lx-ink)]">
          <LxText zh="账户状态暂时无法读取" en="Account status is temporarily unavailable" />
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">
          <LxText zh="登录状态服务暂时没有响应，账户资料不会在未验证时显示。" en="The session service did not respond. Private account details remain hidden until verification succeeds." />
        </p>
        <button onClick={() => window.location.reload()} className="mt-6 border border-[var(--lx-line)] px-5 py-3 text-sm text-[var(--lx-ink)]">
          <LxText zh="重新检查" en="Retry" />
        </button>
      </div>
    );
  }

  if (view === "account" && user) {
    const email = user.email || user.phone || "";
    const initialName = String(user.user_metadata?.display_name || user.email?.split("@")[0] || "LINGXI");
    return (
      <div className="lx26-account-page">
        {login.miniLink && <MiniAccountLinkPanel ticket={login.miniLink} accountLabel={email} />}
        <AccountCenterV26 email={email} initialName={initialName} paidOrderCount={paidOrderCount} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7 text-center">
      <p className="text-xs uppercase tracking-[.2em] text-[var(--lx-faint)]">
        <LxText zh="账户" en="Account" />
      </p>
      <h1 className="mt-4 font-display text-3xl text-[var(--lx-ink)]">
        <LxText zh="登录灵犀场" en="Sign in to LINGXIFIELD" />
      </h1>
      <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">
        <LxText zh="登录后查看余额、任务、订单与账户服务。" en="Sign in to view your balance, tasks, orders and account services." />
      </p>
      <div className="mt-8">
        <LoginForm
          afterAuthPath={login.afterAuthPath}
          initialMode={login.initialMode}
          serverError={login.serverError}
          initialEmail={login.initialEmail}
        />
      </div>
    </div>
  );
}
