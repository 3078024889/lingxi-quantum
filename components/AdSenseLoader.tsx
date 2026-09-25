"use client";

import { useEffect } from "react";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7627015374349065";

function isMiniEmbed() {
  try {
    return new URLSearchParams(window.location.search).get("mini") === "1";
  } catch {
    return false;
  }
}

export default function AdSenseLoader() {
  useEffect(() => {
    if (isMiniEmbed()) return;

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-lingxi-adsense="1"]'
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src = ADSENSE_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.lingxiAdsense = "1";
    document.head.appendChild(script);
  }, []);

  return null;
}
