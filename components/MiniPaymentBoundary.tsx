"use client";

import { useEffect, useState, type ReactNode } from "react";
import { detectMiniPaymentContext } from "@/lib/mini/payment-client";

export function isMiniPaymentContext() {
  if (typeof window === "undefined") return false;
  const environment = (window as Window & { __wxjs_environment?: string }).__wxjs_environment;
  return environment === "miniprogram" ||
    (new URLSearchParams(window.location.search).get("mini") === "1" && /MicroMessenger/i.test(navigator.userAgent));
}

export default function MiniPaymentBoundary({ children, miniChildren }: { children: ReactNode; miniChildren?: ReactNode }) {
  const [context, setContext] = useState<"checking" | "mini" | "web">("checking");

  useEffect(() => {
    let alive = true;
    void detectMiniPaymentContext().then(mini => {
      if (alive) setContext(mini ? "mini" : "web");
    });
    return () => { alive = false; };
  }, []);

  if (context === "checking") return <p className="p-12 text-center" role="status">…</p>;
  if (context === "mini" && miniChildren) return miniChildren;
  return children;
}
