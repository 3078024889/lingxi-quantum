import { allProducts, getProduct, type Product } from "@/lib/plans";
import { NARRATIVES, getNarrative } from "@/lib/narratives";

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
  /** Server-delivered intake hint. Native clients need no upload for copy/flow changes. */
  assessmentKind?: "life-map" | "relationship" | "daily-tide" | "birth" | "resilience" | "romance" | "wealth";
  assessmentIntro?: string;
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

const REPORT_INTAKE: Record<string, Pick<MiniCatalogItem, "assessmentKind" | "assessmentIntro">> = {
  "life-map-report": {
    assessmentKind: "life-map",
    assessmentIntro: "完整生命坐标：出生资料、当下状态与可选的数字能量附录。",
  },
  "relationship-resonance": {
    assessmentKind: "relationship",
    assessmentIntro: "两份真实资料共同生成关系结构；可选择亲密、合伙或其他关系。",
  },
  "daily-tide-report": {
    assessmentKind: "daily-tide",
    assessmentIntro: "先从你的星座进入今日潮汐；完整深读再使用出生日期校准。",
  },
  "qian-reading": { assessmentKind: "birth", assessmentIntro: "用真实出生资料确定你的三重生命签。" },
  "tarot-reading": { assessmentKind: "birth", assessmentIntro: "用真实出生资料生成当下三镜联合生命公式。" },
  "resilience-report": { assessmentKind: "resilience", assessmentIntro: "出生结构结合你此刻的恢复状态，绘制个人恢复链。" },
  "romance-report": { assessmentKind: "romance", assessmentIntro: "出生结构结合你的关系状态，读取吸引与靠近时序。" },
  "wealth-report": { assessmentKind: "wealth", assessmentIntro: "出生结构结合职业与行动状态，定位价值创造的瓶颈。" },
};

function categoryFor(productId: string): MiniCatalogItem["category"] {
  if (REPORT_IDS.has(productId)) return "report";
  if (PRACTICE_IDS.has(productId)) return "practice";
  if (MEMBERSHIP_IDS.has(productId)) return "membership";
  return "narrative";
}

// 微信道具 ID 仅允许英文字母、数字、下划线且最长 20 位。
// 叙事按价格共用道具；具体交付对象由已校验的 productId 与服务端订单绑定。
// 这样新增文章无需为每篇内容重复创建微信道具，同时不会混淆用户权益。
export function miniSkuForProduct(productId: string): string {
  const fixed = FIXED_SKUS[productId];
  if (fixed) return fixed;
  const product = getProduct(productId);
  if (!product || UNAVAILABLE_NARRATIVE_IDS.has(productId)) return "";
  return `nar_${Math.round(product.priceRmb * 100)}`;
}

export function productForMiniPurchase(skuId: string, productId: string): Product | undefined {
  const product = getProduct(productId);
  if (!product || UNAVAILABLE_NARRATIVE_IDS.has(productId)) return undefined;
  return miniSkuForProduct(product.id) === skuId ? product : undefined;
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
    note: categoryFor(product.id) === "narrative" ? getNarrative(product.id)?.teaser ?? product.note : product.note,
    ...REPORT_INTAKE[product.id],
  }));
}
