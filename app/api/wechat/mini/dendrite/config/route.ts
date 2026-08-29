import { NextResponse } from "next/server";
import { getDendriteProduct, RELATIONSHIP_DENDRITE_PRODUCTS } from "@/lib/mini/dendrite-engine";

export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get("productId") ?? "";
  if (productId === "life-archetype") return NextResponse.json({ error: "生命原型由一年内八个已开启场域自动生成，不是第九份测评" }, { status: 409 });
  const product = getDendriteProduct(productId);
  if (!product) return NextResponse.json({ error: "这项树突精测暂未开放" }, { status: 404 });
  return NextResponse.json({
    product,
    ...(productId === "relationship-resonance" ? { relationshipVariants: RELATIONSHIP_DENDRITE_PRODUCTS } : {}),
    engine: {
      id: "lingxifield-dendritic-v2",
      questionBankVersion: "V328",
      questionCount: product.questions.length,
      estimatedMinutes: Math.max(2, Math.ceil(product.questions.length * 0.28)),
      zh: "小程序使用灵犀场树突知识网络：真实选择会激活产品专属节点，节点相连后经过结构增强、抑制与跨节点校准形成当前结构；它不读取星盘，也不预测事件。",
      en: "The Mini Program uses the Lingxifield Dendritic Knowledge Network: lived choices activate product-specific nodes that undergo linked propagation, structural inhibition and cross-node calibration. It does not read an astronomical chart or predict events.",
    },
  // Assessment configuration changes with each release. Never let the Mini
  // Program receive an older question bank from a CDN/browser cache after a
  // deployment (V314's five-question bank was otherwise allowed to linger).
  }, { headers: { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store" } });
}
