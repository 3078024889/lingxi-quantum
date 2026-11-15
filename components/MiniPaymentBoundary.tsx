"use client";

import { useEffect, useState, type ReactNode } from "react";
import { detectMiniPaymentContext, miniVirtualTopupsAvailable, openMiniRecharge } from "@/lib/mini/payment-client";
import Link from "next/link";

export function isMiniPaymentContext() {
  if (typeof window === "undefined") return false;
  const environment = (window as Window & { __wxjs_environment?: string }).__wxjs_environment;
  return environment === "miniprogram" ||
    (new URLSearchParams(window.location.search).get("mini") === "1" && /MicroMessenger/i.test(navigator.userAgent));
}

// Mount checkout only after the browser context is known. This also prevents
// automatic OAuth payment effects from running inside a mini-program webview.
export default function MiniPaymentBoundary({ children, miniChildren }: { children: ReactNode; miniChildren?: ReactNode }) {
  const [context, setContext] = useState<"checking" | "mini" | "web">("checking");
  const [message, setMessage] = useState("");
  const [miniTopupsReady, setMiniTopupsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    void detectMiniPaymentContext().then(async mini => {
      if (!alive) return;
      setContext(mini ? "mini" : "web");
      if (mini) {
        const ready = await miniVirtualTopupsAvailable();
        if (alive) setMiniTopupsReady(ready);
      }
    });
    return () => { alive = false; };
  }, []);
  async function openRecharge() {
    if (!miniTopupsReady) { setMessage("小程序虚拟充值尚未开放，请先查看余额与订单。"); return; }
    setMessage("正在打开小程序充值页…");
    const opened = await openMiniRecharge();
    setMessage(opened ? "" : "当前小程序版本没有充值页，请使用最新体验版，或等待新版本审核发布。");
  }
  if (context === "checking") return <p className="p-12 text-center" role="status">…</p>;
  if (context === "mini" && miniChildren) return miniChildren;
  if (context === "mini") return <main className="mx-auto max-w-xl px-6 py-20">
    <h1 className="text-2xl font-semibold">{miniTopupsReady ? "在小程序中充值" : "小程序充值暂未开放"}</h1>
    <p className="mt-4 text-sm">{miniTopupsReady ? "小程序充值使用微信虚拟支付，人民币余额可支付支持余额付款的工具。" : "当前小程序虚拟充值服务尚未开放。可继续查看余额、资金记录和订单；服务端正式开通后，充值入口会自动启用。"}</p>
    {miniTopupsReady&&<button type="button" onClick={openRecharge} className="mt-6 rounded-xl bg-black px-6 py-3 text-white">打开微信虚拟充值</button>}
    <Link href="/ai-wallet" className="mt-6 inline-flex rounded-xl border px-6 py-3">返回余额与充值</Link>
    <p className="mt-3 text-sm" role="status">{message}</p>
  </main>;
  return children;
}
