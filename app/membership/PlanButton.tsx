"use client";

import { useRouter } from "next/navigation";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { MEMBERSHIP_CONTENT } from "@/lib/membership-content";
import { getProduct } from "@/lib/plans";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { v104sText } from "@/lib/v104s-i18n";

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
  const { lang } = useLingxiLang();
  const t = (zh:string,en:string) => v104sText(lang,zh,en);
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
          className="w-full cursor-not-allowed py-4 font-display text-sm uppercase tracking-widest2 text-bone-soft opacity-60 border border-white/10"
        >
          {t("审核中 · 暂未开放","In review · not yet open")}
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
        {["day", "month", "year"].includes(productId) ? (
          <>{t(MEMBERSHIP_CONTENT[productId].cta, MEMBERSHIP_CONTENT[productId].ctaEn)} →</>
        ) : loggedIn ? (
          <>{t("立即购买","Buy now")}</>
        ) : (
          <>{t("登录后购买","Sign in to buy")}</>
        )}
      </button>
    </div>
  );
}
