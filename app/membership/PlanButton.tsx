"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REVIEW_MODE } from "@/lib/reviewMode";
import WechatPayModal from "@/components/WechatPayModal";
import { getProduct } from "@/lib/plans";

// PayPal企业账户已经被注销、暂时没有可用的海外收款渠道，这里改成
// 微信扫码支付——membership这些产品是"直接购买"，不像生命图谱那些
// 产品需要先提交一份出生数据再解锁，所以不用传submissionId。
export default function PlanButton({
  productId,
  loggedIn,
  highlight,
  nameZh,
  nameEn,
}: {
  productId: string;
  loggedIn: boolean;
  highlight?: boolean;
  nameZh: string;
  nameEn: string;
}) {
  const router = useRouter();
  const [showWechatPay, setShowWechatPay] = useState(false);
  const product = getProduct(productId);

  const buy = () => {
    if (!loggedIn) {
      router.push("/account");
      return;
    }
    setShowWechatPay(true);
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
      {showWechatPay && (
        <WechatPayModal
          productId={productId}
          priceRmb={product?.priceRmb ?? 0}
          productName={{ zh: nameZh, en: nameEn }}
          onClose={() => setShowWechatPay(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
