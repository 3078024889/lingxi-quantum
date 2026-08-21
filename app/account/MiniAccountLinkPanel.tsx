"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MiniAccountLinkPanel({ ticket }: { ticket: string }) {
  const router = useRouter();
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
      if (!response.ok || !data.ok) throw new Error(data.error || "账户连接未完成");
      setState("done");
      setMessage("已连接。你的既有权益与报告现在会在小程序“我的场域”中出现。");
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "账户连接未完成，请稍后重试");
    }
  };

  return (
    <div className="mb-6 w-full border border-lattice/35 bg-lattice/10 px-6 py-5 text-left">
      <p className="font-display text-sm tracking-widest2 text-lattice">连接已有灵犀账户</p>
      <p className="mt-3 text-sm leading-7 text-bone-dim">确认后，已登录账户中的报告、订单与有效权益会与当前微信小程序身份连接。系统不会猜测或自动合并账户。</p>
      {state !== "done" && (
        <button onClick={connect} disabled={state === "working"} className="mt-4 border border-lattice/60 px-5 py-3 text-sm text-lattice transition hover:bg-lattice hover:text-void-deep disabled:opacity-60">
          {state === "working" ? "正在安全连接…" : "确认连接此账户"}
        </button>
      )}
      {message && <p className={`mt-3 text-sm leading-6 ${state === "error" ? "text-rose" : "text-lattice"}`}>{message}</p>}
    </div>
  );
}
