"use client";

import { useEffect } from "react";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7627015374349065";

function adsDisabledForThisContext() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (
      params.get("mini") === "1" ||
      params.get("ads") === "0" ||
      params.get("releasecheck") === "1"
    ) {
      return true;
    }

    const ua = navigator.userAgent || "";
    if (/MicroMessenger|miniProgram/i.test(ua)) {
      return true;
    }

    return false;
  } catch {
    // Embedded or unusual browser context: fail closed rather than injecting ads.
    return true;
  }
}

export default function AdSenseLoader() {
  useEffect(() => {
    if (adsDisabledForThisContext()) return;

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

    return () => {
      // Do not remove a shared loader that may already be in use by another route.
    };
  }, []);

  return null;
}
