"use client";

import { useEffect, useState, type ReactNode } from "react";
import { detectMiniPaymentContext } from "@/lib/mini/payment-client";

export function isMiniPaymentContext() {
  if (typeof window === "undefined") return false;
  const environment = (window as Window & { __wxjs_environment?: string }).__wxjs_environment;
  return environment === "miniprogram" ||
    (new URLSearchParams(window.location.search).get("mini") === "1" && /MicroMessenger/i.test(navigator.userAgent));
}

// Keep mini-program tool checkout separate from browser checkout, but never
// block the official website wallet page or route top-ups into native UI.
export default function MiniPaymentBoundary({ children, miniChildren }: { children: ReactNode; miniChildren?: ReactNode }) {
  const [context, setContext] = useState<"checking" | "mini" | "web">("checking");
  useEffect(() => {
    let alive = true;
    void detectMiniPaymentContext().then(mini => { if (alive) setContext(mini ? "mini" : "web"); });
    return () => { alive = false; };
  }, []);
  if (context === "checking") return <p className="p-12 text-center" role="status">…</p>;
  return context === "mini" && miniChildren ? miniChildren : children;
}
