import "server-only";
import type { NextRequest } from "next/server";

export type PaymentCurrency = "CNY" | "USD";

export function parseCurrency(value: unknown): PaymentCurrency | null {
  return value === "CNY" || value === "USD" ? value : null;
}

export function requestCountry(req: Request) {
  for (const raw of [
    req.headers.get("x-vercel-ip-country"),
    req.headers.get("cf-ipcountry"),
    req.headers.get("cloudfront-viewer-country"),
    req.headers.get("x-country-code"),
  ]) {
    const code = String(raw || "").trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(code)) return code;
  }
  return "";
}

export function recommendedCurrency(req: Request | NextRequest): PaymentCurrency {
  const country = requestCountry(req);
  if (country === "CN") return "CNY";

  const referer = req.headers.get("referer") || "";
  if (/[?&]mini=1(?:&|$)/.test(referer)) return "CNY";

  try {
    const host = new URL(req.url).hostname.toLowerCase();
    if (host === "lingxifield.cn" || host.endsWith(".lingxifield.cn")) return "CNY";
  } catch {}

  return "USD";
}

export function providerAllowedForCurrency(provider: string, currency: PaymentCurrency) {
  return currency === "CNY"
    ? provider === "wechat" || provider === "alipay"
    : provider === "paypal";
}

export function amountForCurrency(input: {
  currency: PaymentCurrency;
  amountRmb: number;
  amountUsd: number;
}) {
  return input.currency === "CNY"
    ? {
        display_currency: "CNY" as const,
        display_symbol: "¥",
        display_amount: Number(input.amountRmb.toFixed(2)),
      }
    : {
        display_currency: "USD" as const,
        display_symbol: "$",
        display_amount: Number(input.amountUsd.toFixed(2)),
      };
}
