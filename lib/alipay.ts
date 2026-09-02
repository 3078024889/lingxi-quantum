import { createSign, createVerify } from "node:crypto";

const DEFAULT_GATEWAY = "https://openapi.alipay.com/gateway.do";

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function asPem(value: string, label: "PRIVATE KEY" | "PUBLIC KEY"): string {
  if (value.includes("-----BEGIN")) return value.replace(/\\n/g, "\n");
  const body = value.replace(/\\s+/g, "");
  const rows = body.match(/.{1,64}/g)?.join("\n") ?? body;
  return `-----BEGIN ${label}-----\n${rows}\n-----END ${label}-----`;
}

function timestamp(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}:${part("second")}`;
}

function canonical(params: Record<string, string>, excludeSignType = false): string {
  return Object.entries(params)
    .filter(([key, value]) => key !== "sign" && (!excludeSignType || key !== "sign_type") && value !== "")
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export function alipayMissingVars(): string[] {
  return ["ALIPAY_APP_ID", "ALIPAY_PRIVATE_KEY", "ALIPAY_PUBLIC_KEY"].filter((name) => !env(name));
}

export function alipayConfigured(): boolean {
  return alipayMissingVars().length === 0;
}

export function alipayEnabled(): boolean {
  return process.env.ALIPAY_ENABLED?.trim().toLowerCase() === "true" && alipayConfigured();
}

export function createAlipayPaymentUrl(input: {
  outTradeNo: string;
  amountRmb: number;
  subject: string;
  returnUrl: string;
  notifyUrl: string;
  mobile: boolean;
}): string {
  if (!alipayConfigured()) throw new Error(`Missing Alipay configuration: ${alipayMissingVars().join(", ")}`);
  if (!/^LX[A-Za-z0-9]{1,62}$/.test(input.outTradeNo)) throw new Error("Invalid Alipay out_trade_no");
  if (!Number.isFinite(input.amountRmb) || input.amountRmb <= 0) throw new Error("Invalid Alipay amount");

  const method = input.mobile ? "alipay.trade.wap.pay" : "alipay.trade.page.pay";
  const bizContent = JSON.stringify({
    out_trade_no: input.outTradeNo,
    total_amount: input.amountRmb.toFixed(2),
    subject: input.subject.slice(0, 128),
    product_code: input.mobile ? "QUICK_WAP_WAY" : "FAST_INSTANT_TRADE_PAY",
    timeout_express: "30m",
  });
  const params: Record<string, string> = {
    app_id: env("ALIPAY_APP_ID"),
    method,
    format: "JSON",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: timestamp(),
    version: "1.0",
    notify_url: input.notifyUrl,
    return_url: input.returnUrl,
    biz_content: bizContent,
  };
  const signer = createSign("RSA-SHA256");
  signer.update(canonical(params), "utf8");
  signer.end();
  params.sign = signer.sign(asPem(env("ALIPAY_PRIVATE_KEY"), "PRIVATE KEY"), "base64");

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => query.set(key, value));
  return `${env("ALIPAY_GATEWAY") || DEFAULT_GATEWAY}?${query.toString()}`;
}

export function verifyAlipayNotification(params: Record<string, string>): boolean {
  if (!env("ALIPAY_PUBLIC_KEY") || !params.sign) return false;
  try {
    const verifier = createVerify("RSA-SHA256");
    // 支付宝异步通知验签时 sign 和 sign_type 都不参与待验签内容拼接。
    verifier.update(canonical(params, true), "utf8");
    verifier.end();
    return verifier.verify(asPem(env("ALIPAY_PUBLIC_KEY"), "PUBLIC KEY"), params.sign, "base64");
  } catch (error) {
    console.error("[alipay] notification signature verification failed", error);
    return false;
  }
}

export function alipayAppId(): string {
  return env("ALIPAY_APP_ID");
}

export function alipaySellerId(): string {
  return env("ALIPAY_SELLER_ID");
}

export function alipaySiteUrl(): string {
  return env("ALIPAY_SITE_URL") || "https://lingxifield.cn";
}
