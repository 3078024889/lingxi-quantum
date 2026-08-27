import { NextResponse } from "next/server";
import { getDendriteProduct } from "@/lib/mini/dendrite-engine";

export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get("productId") ?? "";
  const product = getDendriteProduct(productId);
  if (!product) return NextResponse.json({ error: "这项树突精测暂未开放" }, { status: 404 });
  return NextResponse.json({
    product,
    engine: {
      id: "copernican-dendrite-v1",
      zh: "小程序使用灵犀哥白尼树突算法：你的每次选择会激活知识节点，节点之间通过联锁传播形成当前结构；它不读取星盘，也不预测事件。",
      en: "The Mini Program uses Lingxi’s Copernican Dendrite Engine: each response activates knowledge nodes, whose linked propagation forms a current structure. It does not read an astronomical chart or predict events.",
    },
  }, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
}
