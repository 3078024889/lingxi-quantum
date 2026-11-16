"use client";

import { useEffect, useState, type ReactNode } from "react";
import { detectMiniPaymentContext, openMiniRecharge } from "@/lib/mini/payment-client";

export function isMiniPaymentContext() {
  if (typeof window === "undefined") return false;
  const environment = (window as Window & { __wxjs_environment?: string }).__wxjs_environment;
  return environment === "miniprogram" ||
    (new URLSearchParams(window.location.search).get("mini") === "1" && /MicroMessenger/i.test(navigator.userAgent));
}

function cnyBalanceProductId() {
  if (typeof window === "undefined") return "";
  const productId = new URLSearchParams(window.location.search).get("productId") || "";
  return /^sasi-balance-(?:10|88|666|888|custom-(?:0|[1-9][0-9]{0,4})(?:\.[0-9]{1,2})?)$/.test(productId) ? productId : "";
}
function isCnyBalanceTopup() {
  return Boolean(cnyBalanceProductId());
}

export default function MiniPaymentBoundary({ children, miniChildren }: { children: ReactNode; miniChildren?: ReactNode }) {
  const [context, setContext] = useState<"checking" | "mini" | "web">("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;
    void detectMiniPaymentContext().then(mini => {
      if (alive) setContext(mini ? "mini" : "web");
    });
    return () => { alive = false; };
  }, []);

  async function openRecharge() {
    setMessage("正在打开人民币小程序充值页…");
    const opened = await openMiniRecharge(cnyBalanceProductId());
    setMessage(opened ? "" : "当前小程序版本没有可用的人民币充值页，请更新体验版后重试。");
  }

  if (context === "checking") return <p className="p-12 text-center" role="status">…</p>;
  if (context === "mini" && miniChildren) return miniChildren;
  if (context === "mini" && isCnyBalanceTopup()) {
    return <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-2xl font-semibold">在小程序中充值</h1>
      <p className="mt-4 text-sm">人民币 CNY 余额使用微信虚拟支付充值。美元余额请在官网钱包选择 USD，使用 PayPal 结算。</p>
      <button type="button" onClick={openRecharge} className="mt-6 rounded-xl bg-black px-6 py-3 text-white">打开余额充值</button>
      <p className="mt-3 text-sm" role="status">{message}</p>
    </main>;
  }
  return children;
}
