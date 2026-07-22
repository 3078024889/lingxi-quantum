"use client";

import { useState } from "react";
import Bi from "./Bi";

// 通用分享按钮——用浏览器/系统原生的分享面板（Web Share API），
// 图4截图里那个"共享链接"弹窗（WhatsApp/Facebook/微信/Outlook/
// Gmail/Twitter/LinkedIn……）就是这个API调出来的系统面板，不是我们
// 自己画的——具体列出哪些平台，由用户当时用的设备/浏览器/系统决定，
// 不是这段代码能固定指定"必须包含知乎、脉脉、小红书"这些的，国内
// 很多平台（小红书、抖音、微博、脉脉）也没有对外开放"网页一键分享
// 到该平台"这样的标准接口，只能靠系统分享面板里恰好有没有装它的
// App。没有原生分享能力的设备（大部分桌面浏览器），退化成"复制
// 链接"，用户自己粘贴去想发的地方。
export default function ShareButton({
  text,
  url,
  label,
  className,
}: {
  text: string;
  url: string;
  label?: { zh: string; en: string };
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch {
        // 用户自己取消了分享面板——不是错误，不用提示。
      }
      return;
    }
    try {
      await navigator.clipboard?.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 复制也失败的极端情况——静默失败，不阻塞用户继续使用页面。
    }
  };

  return (
    <button
      onClick={share}
      className={className ?? "text-xs text-bone-dim underline decoration-dotted underline-offset-4 transition hover:text-lattice"}
    >
      {copied ? (
        <Bi zh="已复制链接" en="Link copied" />
      ) : (
        <Bi zh={label?.zh ?? "分享"} en={label?.en ?? "Share"} />
      )}
    </button>
  );
}
