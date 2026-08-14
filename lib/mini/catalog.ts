import { createHash } from "crypto";
import { allProducts, getProduct, type Product } from "@/lib/plans";
import { NARRATIVES } from "@/lib/narratives";

export type MiniCatalogItem = {
  skuId: string;
  productId: string;
  name: string;
  nameEn: string;
  priceFen: number;
  accessType: Product["type"];
  days: number | null;
  category: "report" | "practice" | "membership" | "narrative";
  note: string;
};

const FIXED_SKUS: Record<string, string> = {
  "life-map-report": "rpt_lifemap",
  "relationship-resonance": "rpt_relation",
  "qian-reading": "rpt_qian",
  "tarot-reading": "rpt_mirror",
  "resilience-report": "rpt_resilience",
  "romance-report": "rpt_romance",
  "daily-tide-report": "rpt_tide",
  "wealth-report": "rpt_wealth",
  breath: "pr_breath",
  intuition: "pr_intuition",
  "heart-reset": "pr_heart",
  "ascending-heart": "pr_ascending",
  day: "sub_manifest_1d",
  month: "sub_manifest_30d",
  year: "sub_manifest_365d",
  "narrative-all": "sub_narrative_365",
  everything: "sub_all_365",
};

const REPORT_IDS = new Set([
  "life-map-report",
  "relationship-resonance",
  "qian-reading",
  "tarot-reading",
  "resilience-report",
  "romance-report",
  "daily-tide-report",
  "wealth-report",
]);
const PRACTICE_IDS = new Set(["breath", "intuition", "heart-reset", "ascending-heart"]);
const MEMBERSHIP_IDS = new Set(["day", "month", "year", "narrative-all", "everything"]);
const UNAVAILABLE_NARRATIVE_IDS = new Set(
  NARRATIVES.filter((item) => item.status === "soon").map((item) => item.slug)
);

function categoryFor(productId: string): MiniCatalogItem["category"] {
  if (REPORT_IDS.has(productId)) return "report";
  if (PRACTICE_IDS.has(productId)) return "practice";
  if (MEMBERSHIP_IDS.has(productId)) return "membership";
  return "narrative";
}

// 微信道具 ID 仅允许英文字母、数字、下划线且最长 20 位。
// 固定商品使用可读 ID；数量会持续增长的叙事使用稳定哈希，避免改标题导致已发布道具失效。
export function miniSkuForProduct(productId: string): string {
  const fixed = FIXED_SKUS[productId];
  if (fixed) return fixed;
  return `n_${createHash("sha256").update(productId).digest("hex").slice(0, 16)}`;
}

export function productFromMiniSku(skuId: string): Product | undefined {
  const fixedProductId = Object.entries(FIXED_SKUS).find(([, value]) => value === skuId)?.[0];
  if (fixedProductId) return getProduct(fixedProductId);
  return allProducts.find(
    (product) => !UNAVAILABLE_NARRATIVE_IDS.has(product.id) && miniSkuForProduct(product.id) === skuId
  );
}

export function getMiniCatalog(): MiniCatalogItem[] {
  return allProducts.filter((product) => !UNAVAILABLE_NARRATIVE_IDS.has(product.id)).map((product) => ({
    skuId: miniSkuForProduct(product.id),
    productId: product.id,
    name: product.name,
    nameEn: product.nameEn,
    priceFen: Math.round(product.priceRmb * 100),
    accessType: product.type,
    days: product.days ?? null,
    category: categoryFor(product.id),
    note: product.note,
  }));
}
