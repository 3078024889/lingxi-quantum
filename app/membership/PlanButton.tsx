"use client";

import { useRouter } from "next/navigation";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { getProduct } from "@/lib/plans";

// v258：这个按钮是修炼技术、显化订阅、多维叙事（单篇+年度解锁）
// 这几类"直接购买"产品共用的同一个组件——之前改的8个"先填资料再解锁"
// 的产品各自转了一遍，这个组件转一次，等于把剩下这一大片"直接购买"
// 类型的入口也一次性接进新付款页了，不用再一个一个改。
export default function PlanButton({
  productId,
  loggedIn,
  highlight,
}: {
  productId: string;
  loggedIn: boolean;
  highlight?: boolean;
  nameZh: string;
  nameEn: string;
}) {
  const router = useRouter();
  const product = getProduct(productId);

  const buy = () => {
    if (!loggedIn) {
      router.push("/account");
      return;
    }
    if (!product) return;
    const here = typeof window !== "undefined" ? window.location.pathname : "/membership";
    router.push(`/checkout?productId=${productId}&redirect=${encodeURIComponent(here)}`);
  };

  if (REVIEW_MODE) {
    return (
      <div>
        <button
          disabled
          className="w-full cursor-not-allowed py-4 font-display text-sm uppercase tracking-widest2 text-bone-dim/82 opacity-60 border border-white/10"
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
        className={`w-full py-4 font-display text-sm uppercase tracking-widest2 transition disabled:opacity-50 ${
          highlight
            ? "bg-amber text-void-deep hover:bg-lattice"
            : "border border-lattice/40 text-lattice hover:border-amber hover:text-amber"
        }`}
      >
        {loggedIn ? (
          <><span data-lang="zh">开始交换</span><span data-lang="en">Begin the exchange</span></>
        ) : (
          <><span data-lang="zh">登录后交换</span><span data-lang="en">Sign in to exchange</span></>
        )}
      </button>
    </div>
  );
}
