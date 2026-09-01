"use client";

import { useEffect } from "react";

/**
 * The mini-program web-view loads the live site rather than a copied report.
 * Give that constrained reader a dedicated high-contrast publication mode.
 */
export default function MiniEmbedMode() {
  useEffect(() => {
    const embedded = new URLSearchParams(window.location.search).get("mini") === "1";
    document.documentElement.classList.toggle("lx-mini-embed", embedded);
    if (!embedded || document.querySelector('script[data-lingxi-wechat-bridge="1"]')) return () => document.documentElement.classList.remove("lx-mini-embed");
    const script=document.createElement("script");
    script.src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
    script.async=true;
    script.dataset.lingxiWechatBridge="1";
    document.head.appendChild(script);
    return () => document.documentElement.classList.remove("lx-mini-embed");
  }, []);

  return null;
}
