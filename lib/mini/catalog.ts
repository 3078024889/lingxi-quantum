import { allProducts, getProduct, type Product } from "@/lib/plans";
import { NARRATIVES, getNarrative } from "@/lib/narratives";
import { MEMBERSHIP_CONTENT, type MembershipBenefit } from "@/lib/membership-content";

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
  /** Public web product route. Report entry pages stay the single source of truth across web and Mini Program. */
  webPath?: string;
  /** Server-delivered intake hint. Native clients need no upload for copy/flow changes. */
  assessmentKind?: "life-map" | "relationship" | "daily-tide" | "birth" | "resilience" | "romance" | "wealth" | "archetype";
  assessmentIntro?: string;
  assessmentDescription?: string;
  assessmentCta?: string;
  knowledgeNodes?: string[];
  detailDescription?: string;
  benefits?: MembershipBenefit[];
  closing?: string;
  cta?: string;
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
  "life-archetype": "rpt_archetype",
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
  "life-archetype",
]);

const REPORT_WEB_PATHS: Record<string, string> = {
  "life-map-report": "/life-map",
  "relationship-resonance": "/relationship",
  "qian-reading": "/qian",
  "tarot-reading": "/tarot",
  "resilience-report": "/resilience",
  "romance-report": "/romance",
  "daily-tide-report": "/daily",
  "wealth-report": "/wealth",
  "life-archetype": "/archetype",
};
const PRACTICE_IDS = new Set(["breath", "intuition", "heart-reset", "ascending-heart"]);
const MEMBERSHIP_IDS = new Set(["day", "month", "year", "narrative-all", "everything"]);
const UNAVAILABLE_NARRATIVE_IDS = new Set(
  NARRATIVES.filter((item) => item.status === "soon").map((item) => item.slug)
);

const REPORT_INTAKE: Record<string, Pick<MiniCatalogItem, "assessmentKind" | "assessmentIntro" | "assessmentDescription" | "assessmentCta" | "knowledgeNodes">> = {
  "life-map-report": {
    assessmentKind: "life-map",
    assessmentIntro: "五条意识流在场域中交汇，温柔且如实地照见你携带而来的独特生命结构。",
    assessmentDescription: "生命图谱 · 照见你的生命结构",
    assessmentCta: "开始探索 →",
    knowledgeNodes: ["生命骨架", "交叉验证", "现实运行", "长期路径"],
  },
  "relationship-resonance": {
    assessmentKind: "relationship",
    assessmentIntro: "两份真实资料共同生成关系结构；可选择深度关系共振、合伙商业关系或其他关系。",
    assessmentDescription: "关系共振 · 照见两个生命的交汇",
    assessmentCta: "开启共振探索 →",
    knowledgeNodes: ["双生命坐标", "吸引与距离", "角色与边界", "修复实验"],
  },
  "daily-tide-report": {
    assessmentKind: "daily-tide",
    assessmentIntro: "先从星座进入今日节奏；当你需要更深的个人映照，再选择出生资料校准。",
    assessmentDescription: "今日潮汐 · 感受当下的宇宙节律",
    assessmentCta: "感知我的今日潮汐 →",
    knowledgeNodes: ["今日行动", "关系窗口", "观察变量", "节律回看"],
  },
  "qian-reading": {
    assessmentKind: "birth", assessmentIntro: "从真实出生资料出发，读取此刻与你相关的三重生命讯息。",
    assessmentDescription: "意识坐标读取 · 看见此刻与你发生回应的三枚生命原型",
    assessmentCta: "开启我的生命灵签 →", knowledgeNodes: ["源流签", "灵魂签", "行者签", "三签联锁"],
  },
  "tarot-reading": {
    assessmentKind: "birth", assessmentIntro: "从真实出生资料出发，映照当下状态与未被发现的内在可能。",
    assessmentDescription: "在过往、当下与展开的三重镜像中，看见此刻的自己。",
    assessmentCta: "与灵犀场连接 →", knowledgeNodes: ["过往镜像", "当下镜像", "展开镜像", "现实确认"],
  },
  "resilience-report": {
    assessmentKind: "resilience", assessmentIntro: "出生结构结合你此刻的恢复状态，绘制个人恢复链。",
    assessmentDescription: "当现实发生偏转，照见生命系统如何重新接住自己。",
    assessmentCta: "展开我的生命韧性指数 →", knowledgeNodes: ["冲击", "回收", "重启", "稳态"],
  },
  "romance-report": {
    assessmentKind: "romance", assessmentIntro: "出生结构结合你的关系状态，读取吸引与靠近时序。",
    assessmentDescription: "你的频率，正在唤醒怎样的共振。",
    assessmentCta: "连接我的桃花磁场 →", knowledgeNodes: ["吸引", "靠近", "建立", "边界"],
  },
  "wealth-report": {
    assessmentKind: "wealth", assessmentIntro: "出生结构结合职业与行动状态，定位价值创造的瓶颈。",
    assessmentDescription: "照见你与丰盛对齐的方式。",
    assessmentCta: "进入我的财富创造频率 →", knowledgeNodes: ["发现价值", "构建表达", "资源交换", "留存复制"],
  },
  "life-archetype": {
    assessmentKind: "archetype", assessmentIntro: "八个场域节点在此刻汇入同一张树突网络，展开主原型、隐藏原型与行动原型。",
    assessmentDescription: "生命原型 · 看见此刻正在被激活的三重结构",
    assessmentCta: "展开我的生命原型 →", knowledgeNodes: ["主原型", "隐藏原型", "行动原型", "八域联锁"],
  },
};

const REPORT_DISPLAY_NAMES: Record<string, { zh: string; en: string }> = {
  "life-map-report": { zh: "生命图谱", en: "Life Blueprint" },
  "relationship-resonance": { zh: "关系共振", en: "Relationship Resonance" },
  "resilience-report": { zh: "生命韧性指数", en: "Life Resilience Index" },
  "romance-report": { zh: "桃花磁场指数", en: "Romance Resonance Index" },
  "wealth-report": { zh: "财富创造地图", en: "Wealth Creation Map" },
  "daily-tide-report": { zh: "今日潮汐", en: "Today’s Tide" },
  "tarot-reading": { zh: "灵犀量子生命镜像", en: "Lingxi Quantum Life Mirror" },
  "qian-reading": { zh: "灵犀生命灵签", en: "Lingxi Life Oracle" },
  "life-archetype": { zh: "生命原型", en: "Life Archetype" },
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
  return allProducts.filter((product) => !UNAVAILABLE_NARRATIVE_IDS.has(product.id)).map((product) => {
    const membershipContent = MEMBERSHIP_CONTENT[product.id];
    return ({
    skuId: miniSkuForProduct(product.id),
    productId: product.id,
    name: REPORT_DISPLAY_NAMES[product.id]?.zh ?? product.name,
    nameEn: REPORT_DISPLAY_NAMES[product.id]?.en ?? product.nameEn,
    priceFen: Math.round(product.priceRmb * 100),
    accessType: product.type,
    days: product.days ?? null,
    category: categoryFor(product.id),
    webPath: REPORT_WEB_PATHS[product.id],
    note: membershipContent?.description ?? (categoryFor(product.id) === "narrative" ? getNarrative(product.id)?.teaser ?? product.note : product.note),
    detailDescription: membershipContent?.description,
    benefits: membershipContent?.benefits,
    closing: membershipContent?.closing,
    cta: membershipContent?.cta,
    ...REPORT_INTAKE[product.id],
    });
  });
}
