"use client";

import { useEffect, useState, type ReactNode } from "react";
import { detectMiniPaymentContext, openMiniRecharge } from "@/lib/mini/payment-client";

export function isMiniPaymentContext() {
  if (typeof window === "undefined") return false;
  const environment = (window as Window & { __wxjs_environment?: string }).__wxjs_environment;
  return environment === "miniprogram" ||
    (new URLSearchParams(window.location.search).get("mini") === "1" && /MicroMessenger/i.test(navigator.userAgent));
}

// Mount checkout only after the browser context is known. This also prevents
// automatic OAuth payment effects from running inside a mini-program webview.
export default function MiniPaymentBoundary({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<"checking" | "mini" | "web">("checking");
  const [message, setMessage] = useState("");
  useEffect(() => { let alive = true; void detectMiniPaymentContext().then(mini => { if (alive) setContext(mini ? "mini" : "web"); }); return () => { alive = false; }; }, []);
  async function openRecharge() {
    setMessage("正在打开小程序充值页…");
    const opened = await openMiniRecharge();
    setMessage(opened ? "" : "当前小程序版本没有充值页，请使用最新体验版，或等待新版本审核发布。");
  }
  if (context === "checking") return <p className="p-12 text-center" role="status">…</p>;
  if (context === "mini") return <main className="mx-auto max-w-xl px-6 py-20">
    <h1 className="text-2xl font-semibold">在小程序中充值</h1>
    <p className="mt-4 text-sm">小程序充值使用微信虚拟支付，人民币余额可支付支持余额付款的工具。</p>
    <button type="button" onClick={openRecharge} className="mt-6 rounded-xl bg-black px-6 py-3 text-white">打开余额充值</button>
    <p className="mt-3 text-sm" role="status">{message}</p>
  </main>;
  return children;
}
