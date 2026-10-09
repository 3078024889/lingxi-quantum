"use client";

import { useEffect, useState, type ReactNode } from "react";

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
  useEffect(() => { setContext(isMiniPaymentContext() ? "mini" : "web"); }, []);
  if (context === "checking") return <p className="p-12 text-center" role="status">…</p>;
  if (context === "mini") return <main className="mx-auto max-w-xl px-6 py-20">
    <h1 className="text-2xl font-semibold">小程序内付费暂未开放</h1>
    <p className="mt-4 text-sm">免费工具、账户余额和已有订单仍可查看。</p>
  </main>;
  return children;
}
