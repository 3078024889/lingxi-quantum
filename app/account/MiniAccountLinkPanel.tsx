"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/useLang";
import { openMiniRecharge } from "@/lib/mini/payment-client";

export default function MiniAccountLinkPanel({ ticket, accountLabel }: { ticket: string; accountLabel: string }) {
  const langEn = useLang();
  const t = (zh: string, en: string) => langEn ? en : zh;
  const [state, setState] = useState<"ready" | "working" | "done" | "error">("ready");
  const [message, setMessage] = useState("");

  const started = useRef("");
  const connect = useCallback(async () => {
    setState("working");
    setMessage("");
    try {
      const response = await fetch("/api/wechat/mini/account-link/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || (langEn ? "Account link failed" : "账户连接未完成"));
      setState("done");
      setMessage(langEn ? `Connected ${data.account || ''}. Top-ups will credit this account.` : `已同步到账账户：${data.account || ''}。返回充值后将使用此账户。`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : (langEn ? "Account link failed — please try again" : "账户连接未完成，请稍后重试"));
    }
  }, [ticket, langEn]);

  useEffect(() => {
    if (started.current === ticket) return;
    started.current = ticket;
    void connect();
  }, [ticket, connect]);

  return (
    <div className="mb-6 w-full border border-lattice/35 bg-lattice/10 px-6 py-5 text-left">
      <p className="font-display text-sm tracking-widest2 text-lattice">
        {t("同步当前登录账户", "Sync Your Signed-in Account")}
      </p>
      <p className="mt-3 text-sm leading-7 text-bone-dim">
        {t(
          `到账账户：${accountLabel}。正在同步到当前手机，其他手机的账户保持独立。`,
          `Destination: ${accountLabel}. Syncing this phone; other phones keep their own accounts.`
        )}
      </p>
      {state !== "done" && (
        <button onClick={connect} disabled={state === "working" || state === "ready"} className="mt-4 border border-lattice/60 px-5 py-3 text-sm text-lattice transition hover:bg-lattice hover:text-void-deep disabled:opacity-60">
          {state === "working" || state === "ready" ? t("正在同步账户…", "Syncing account…") : t("重新同步账户", "Retry account sync")}
        </button>
      )}
      {message && <p className={`mt-3 text-sm leading-6 ${state === "error" ? "text-rose" : "text-lattice"}`}>{message}</p>}
      {state === "done" && <button onClick={() => void openMiniRecharge()} className="mt-4 border border-lattice/60 px-5 py-3 text-sm text-lattice">{t("返回充值，查看到账账户", "Return to top-up")}</button>}
    </div>
  );
}
