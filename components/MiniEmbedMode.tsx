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
    return () => document.documentElement.classList.remove("lx-mini-embed");
  }, []);

  return null;
}
