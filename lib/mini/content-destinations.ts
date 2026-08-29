import { getNarrative } from "@/lib/narratives";

const PRACTICE_ROUTES: Record<string, string> = {
  breath: "/practice/breath",
  intuition: "/practice/intuition",
  "heart-reset": "/practice/heart-reset",
  "ascending-heart": "/practice/ascending-heart",
};

// 只有权益、没有 submission_id 的历史报告无法定位到某一份报告实例。
// 这不是“内容不支持”，而是应带用户进入已经安全登录的网页档案馆，
// 由网页账户展示历史订单、档案与下载内容。
export const MINI_WEB_ARCHIVE_PRODUCT_IDS = new Set([
  "stellar-trace",
  "life-map-report",
  "relationship-resonance",
  "qian-reading",
  "tarot-reading",
  "resilience-report",
  "romance-report",
  "daily-tide-report",
  "wealth-report",
  "life-archetype",
]);

export function isMiniWebArchiveProduct(productId: string): boolean {
  return MINI_WEB_ARCHIVE_PRODUCT_IDS.has(productId);
}

export function miniContentDestination(productId: string): string | null {
  if (productId === "stellar-trace") return "/stellar-trace";
  if (PRACTICE_ROUTES[productId]) return PRACTICE_ROUTES[productId];
  if (isMiniWebArchiveProduct(productId)) return "/account/orders";
  if (productId === "narrative-all") return "/narrative";
  if (productId === "everything") return "/account/orders";
  if (["day", "month", "year"].includes(productId)) return "/live-as";
  const narrative = getNarrative(productId);
  return narrative && narrative.status !== "soon" ? `/narrative/${productId}` : null;
}
