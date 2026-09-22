"use client";

import type { LingxiLang } from "@/lib/lingxi-i18n";

export async function localizeReportItems({
  reportKey,
  targetLang,
  items,
}: {
  reportKey: string;
  targetLang: LingxiLang;
  items: string[];
}): Promise<{ items: string[]; translated: boolean }> {
  if (targetLang === "zh" || targetLang === "en" || items.length === 0) {
    return { items, translated: false };
  }

  try {
    const response = await fetch("/api/i18n/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportKey, targetLang, items }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(data.items) || data.items.length !== items.length) {
      return { items, translated: false };
    }
    return { items: data.items as string[], translated: true };
  } catch {
    return { items, translated: false };
  }
}
