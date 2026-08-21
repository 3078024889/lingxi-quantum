"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/useLang";

type Mode = "signin" | "signup";

export default function LoginForm({ afterAuthPath = "/live-as" }: { afterAuthPath?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("请输入有效的邮箱地址", "Please enter a valid email address"));
      return;
    }
    if (password.length < 6) {
      setError(t("密码至少 6 位", "Password must be at least 6 characters"));
      return;
    }
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(t("注册失败：", "Sign-up failed: ") + translate(error.message));
        return;
      }
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        setError(t("注册成功，请用刚才的密码登录。", "Registered — please sign in with the password you just set."));
        setMode("signin");
        return;
      }
      router.push(afterAuthPath);
      router.refresh();
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(t("登录失败：", "Sign-in failed: ") + translate(error.message));
        return;
      }
      router.push(afterAuthPath);
      router.refresh();
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex rounded-sm border border-white/10 p-1">
        <button
          onClick={() => { setMode("signin"); setError(""); }}
          className={`flex-1 rounded-sm py-2.5 font-display text-sm tracking-widest2 transition ${mode === "signin" ? "bg-lattice/15 text-lattice" : "text-bone-dim hover:text-lattice"}`}
        >
          <span data-lang="zh">登录</span><span data-lang="en">Sign in</span>
        </button>
        <button
          onClick={() => { setMode("signup"); setError(""); }}
          className={`flex-1 rounded-sm py-2.5 font-display text-sm tracking-widest2 transition ${mode === "signup" ? "bg-lattice/15 text-lattice" : "text-bone-dim hover:text-lattice"}`}
        >
          <span data-lang="zh">注册</span><span data-lang="en">Register</span>
        </button>
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("邮箱", "Email")}
        autoComplete="email"
        className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={mode === "signup" ? t("设置密码（至少 6 位）", "Set a password (min. 6 characters)") : t("密码", "Password")}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        className="w-full rounded-sm border border-white/15 bg-void px-5 py-4 text-base text-bone outline-none transition focus:border-lattice/50"
      />

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber disabled:opacity-50"
      >
        {loading ? (
          <span data-lang="zh">处理中…</span>
        ) : mode === "signup" ? (
          <><span data-lang="zh">注册并进入场域</span><span data-lang="en">Register & enter the field</span></>
        ) : (
          <><span data-lang="zh">进入场域</span><span data-lang="en">Enter the field</span></>
        )}
        {loading && <span data-lang="en">Processing…</span>}
      </button>

      {error && <p className="text-sm text-rose">{error}</p>}

      <p className="pt-2 text-center text-xs leading-6 text-bone-soft">
        <span data-lang="zh">
          {mode === "signin"
            ? "首次使用？点上方「注册」创建你的场域账户。"
            : "已有账户？点上方「登录」。请牢记你的密码。"}
        </span>
        <span data-lang="en">
          {mode === "signin"
            ? "First time? Tap 'Register' above to create your field account."
            : "Already have an account? Tap 'Sign in' above. Please remember your password."}
        </span>
      </p>
    </div>
  );
}

// 这个函数是在报错发生的那一刻才被调用的（不是渲染期间），不涉及
// "语言切换按钮要不要触发重新渲染"这个问题，直接读一次当下的语言
// 状态就行，不需要用到上面那个响应式的hook。
function isEn(): boolean {
  return typeof document !== "undefined" && document.documentElement.classList.contains("lang-en");
}

function translate(msg: string): string {
  const en = isEn();
  if (msg.includes("Invalid login credentials")) return en ? "incorrect email or password" : "邮箱或密码不正确";
  if (msg.includes("already registered") || msg.includes("User already registered")) return en ? "this email is already registered — please sign in" : "该邮箱已注册，请直接登录";
  if (msg.includes("Password should be")) return en ? "password too weak — please use a longer one" : "密码强度不足，请用更长的密码";
  return msg;
}
