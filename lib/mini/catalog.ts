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
  assessmentDescription?: string;
  assessmentCta?: string;
  knowledgeNodes?: string[];
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

const REPORT_INTAKE: Record<string, Pick<MiniCatalogItem, "assessmentKind" | "assessmentIntro" | "assessmentDescription" | "assessmentCta" | "knowledgeNodes">> = {
  "life-map-report": {
    assessmentKind: "life-map",
    assessmentIntro: "输入你的生命信息，开启一次初始观测。场域将呈现与你相关的第一层生命结构。",
    assessmentDescription: "探索你的生命结构与内在模式。看见性格倾向、行为轨迹，以及贯穿人生的核心线索。",
    assessmentCta: "展开生命图谱 →",
    knowledgeNodes: ["生命骨架", "交叉验证", "现实运行", "长期路径"],
  },
  "relationship-resonance": {
    assessmentKind: "relationship",
    assessmentIntro: "两份真实资料共同生成关系结构；可选择亲密、合伙或其他关系。",
    assessmentDescription: "理解人与人之间的连接方式。看见吸引、互动与关系运行，重新认识彼此的位置。",
    assessmentCta: "解析关系共振 →",
    knowledgeNodes: ["双生命坐标", "吸引与距离", "角色与边界", "修复实验"],
  },
  "daily-tide-report": {
    assessmentKind: "daily-tide",
    assessmentIntro: "先从星座进入今日节奏；当你需要更深的个人映照，再选择出生资料校准。",
    assessmentDescription: "观察时间节奏与状态变化。理解当下环境影响，找到适合自己的行动节点。",
    assessmentCta: "读取今日潮汐 →",
    knowledgeNodes: ["今日行动", "关系窗口", "观察变量", "节律回看"],
  },
  "qian-reading": {
    assessmentKind: "birth", assessmentIntro: "从真实出生资料出发，读取此刻与你相关的三重生命讯息。",
    assessmentDescription: "从你的生命信息出发，映照当下状态与内在方向，读取此刻的生命讯息。",
    assessmentCta: "接收生命讯息 →", knowledgeNodes: ["源流签", "灵魂签", "行者签", "三签联锁"],
  },
  "tarot-reading": {
    assessmentKind: "birth", assessmentIntro: "从真实出生资料出发，映照当下状态与未被发现的内在可能。",
    assessmentDescription: "通过多重视角映照自己。看见潜意识、当下状态，以及未被发现的内在可能。",
    assessmentCta: "开启生命镜像 →", knowledgeNodes: ["潜意识镜像", "当下共振", "未来展开", "现实证据"],
  },
  "resilience-report": {
    assessmentKind: "resilience", assessmentIntro: "出生结构结合你此刻的恢复状态，绘制个人恢复链。",
    assessmentDescription: "探索面对变化时的内在支撑。看见恢复方式与心理韧性，发现隐藏的生命力量。",
    assessmentCta: "探索生命韧性 →", knowledgeNodes: ["冲击", "回收", "重启", "稳态"],
  },
  "romance-report": {
    assessmentKind: "romance", assessmentIntro: "出生结构结合你的关系状态，读取吸引与靠近时序。",
    assessmentDescription: "探索你的关系吸引模式。理解靠近、连接与边界，保持真实完整的自己。",
    assessmentCta: "感知桃花磁场 →", knowledgeNodes: ["吸引", "靠近", "建立", "边界"],
  },
  "wealth-report": {
    assessmentKind: "wealth", assessmentIntro: "出生结构结合职业与行动状态，定位价值创造的瓶颈。",
    assessmentDescription: "探索你的创造方式与价值路径。看见优势、资源与行动方向，连接属于你的财富地图。",
    assessmentCta: "探索财富路径 →", knowledgeNodes: ["发现价值", "构建表达", "资源交换", "留存复制"],
  },
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
