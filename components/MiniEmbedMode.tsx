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

    if (embedded) {
      // Defense in depth: the Mini Program web-view must never navigate into
      // Google ad frames. The primary protection is that AdSenseLoader never
      // loads AdSense in mini mode; this also removes any stale/cached ad nodes.
      document
        .querySelectorAll(
          'script[src*="googlesyndication.com"], iframe[src*="doubleclick.net"], iframe[src*="googlesyndication.com"], ins.adsbygoogle'
        )
        .forEach((node) => node.remove());
    }

    if (!embedded || document.querySelector('script[data-lingxi-wechat-bridge="1"]')) {
      return () => document.documentElement.classList.remove("lx-mini-embed");
    }

    const script = document.createElement("script");
    script.src = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
    script.async = true;
    script.dataset.lingxiWechatBridge = "1";
    document.head.appendChild(script);

    return () => document.documentElement.classList.remove("lx-mini-embed");
  }, []);

  return null;
}
