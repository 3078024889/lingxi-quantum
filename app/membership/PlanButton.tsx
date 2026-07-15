"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REVIEW_MODE } from "@/lib/reviewMode";

export default function PlanButton({
  productId,
  loggedIn,
  highlight,
}: {
  productId: string;
  loggedIn: boolean;
  highlight?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buy = async () => {
    if (!loggedIn) {
      router.push("/account");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // 跳转到 PayPal 付款页
      } else {
        setError(data.error || (document.documentElement.classList.contains("lang-en") ? "Order failed, please try again later" : "下单失败，请稍后再试"));
        setLoading(false);
      }
    } catch {
      setError(document.documentElement.classList.contains("lang-en") ? "Network error, please try again later" : "网络错误，请稍后再试");
      setLoading(false);
    }
  };

  if (REVIEW_MODE) {
    return (
      <div>
        <button
          disabled
          className="w-full cursor-not-allowed py-4 font-display text-sm uppercase tracking-widest2 text-bone-dim/60 opacity-60 border border-white/10"
        >
          <span data-lang="zh">审核中 · 暂未开放</span><span data-lang="en">In review · not yet open</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={buy}
        disabled={loading}
        className={`w-full py-4 font-display text-sm uppercase tracking-widest2 transition disabled:opacity-50 ${
          highlight
            ? "bg-amber text-void-deep hover:bg-lattice"
            : "border border-lattice/40 text-lattice hover:border-amber hover:text-amber"
        }`}
      >
        {loading ? (
          <><span data-lang="zh">正在前往支付…</span><span data-lang="en">Going to payment…</span></>
        ) : loggedIn ? (
          <><span data-lang="zh">开始交换</span><span data-lang="en">Begin the exchange</span></>
        ) : (
          <><span data-lang="zh">登录后交换</span><span data-lang="en">Sign in to exchange</span></>
        )}
      </button>
      {error && <p className="mt-3 text-center text-sm text-rose">{error}</p>}
    </div>
  );
}
