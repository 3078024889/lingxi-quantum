"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/useLang";

export default function MiniAccountLinkPanel({ ticket }: { ticket: string }) {
  const router = useRouter();
  const langEn = useLang();
  const t = (zh: string, en: string) => langEn ? en : zh;
  const [state, setState] = useState<"ready" | "working" | "done" | "error">("ready");
  const [message, setMessage] = useState("");

  const connect = async () => {
    setState("working");
    setMessage("");
    try {
      const response = await fetch("/api/wechat/mini/account-link/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || t("账户连接未完成", "Account link failed"));
      setState("done");
      setMessage(t(`已连接 ${data.account || ''}。请返回小程序刷新，充值将到账此账户。`, `Connected ${data.account || ''}. Return to the mini-program and refresh. Top-ups will credit this account.`));
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : t("账户连接未完成，请稍后重试", "Account link failed — please try again"));
    }
  };

  return (
    <div className="mb-6 w-full border border-lattice/35 bg-lattice/10 px-6 py-5 text-left">
      <p className="font-display text-sm tracking-widest2 text-lattice">
        {t("连接已有灵犀账户", "Link Your Lingxi Account")}
      </p>
      <p className="mt-3 text-sm leading-7 text-bone-dim">
        {t(
          "确认后，当前手机的小程序会话将使用上方登录账户的余额和订单。其他手机的账户连接保持独立。",
          "After confirmation, this phone’s mini-program session will use the signed-in account’s balance and orders. Other phones keep their own account connections."
        )}
      </p>
      {state !== "done" && (
        <button onClick={connect} disabled={state === "working"} className="mt-4 border border-lattice/60 px-5 py-3 text-sm text-lattice transition hover:bg-lattice hover:text-void-deep disabled:opacity-60">
          {state === "working" ? t("正在安全连接…", "Connecting securely…") : t("确认连接此账户", "Confirm account link")}
        </button>
      )}
      {message && <p className={`mt-3 text-sm leading-6 ${state === "error" ? "text-rose" : "text-lattice"}`}>{message}</p>}
    </div>
  );
}
