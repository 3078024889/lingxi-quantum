import { NextResponse } from "next/server";
import { requireMiniSession } from "@/lib/mini/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateDendrite, finalizeDendriteResult, getDendriteProduct } from "@/lib/mini/dendrite-engine";

export const runtime = "nodejs";

function shortText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效，请重新进入小程序" }, { status: 401 });
  try {
    const body = await req.json() as { productId?: unknown; responses?: unknown; name?: unknown; partnerName?: unknown; relationshipType?: unknown };
    const productId = typeof body.productId === "string" ? body.productId : "";
    const product = getDendriteProduct(productId);
    if (!product || !body.responses || typeof body.responses !== "object" || Array.isArray(body.responses)) {
      return NextResponse.json({ error: "精测资料不完整" }, { status: 400 });
    }
    const responses = body.responses as Record<string, string>;
    let result = calculateDendrite(product, responses);
    const admin = createAdminClient();

    // The ninth product is a meta-reading. Existing Mini Program assessment
    // history contributes a bounded signal without allowing one old result to
    // overpower the user's current four intuitive responses.
    if (productId === "life-archetype") {
      const { data: history } = await admin.from("mini_dendrite_assessments")
        .select("product_id, result")
        .eq("user_id", session.userId)
        .neq("product_id", "life-archetype")
        .order("created_at", { ascending: false })
        .limit(32);
      const latestProducts = new Set<string>();
      const boostByProduct: Record<string, string> = {
        "life-map-report":"blueprint", "relationship-resonance":"resonance", "resilience-report":"resilience",
        "romance-report":"romance", "wealth-report":"wealth", "daily-tide-report":"tide",
        "tarot-reading":"mirror", "qian-reading":"oracle",
      };
      for (const row of history ?? []) {
        if (latestProducts.has(row.product_id)) continue;
        latestProducts.add(row.product_id);
        const nodeId = boostByProduct[row.product_id];
        if (!nodeId) continue;
        const topScore = Number((row.result as { dominant?: Array<{ score?: number }> })?.dominant?.[0]?.score ?? 0);
        result.nodes = result.nodes.map((node) => node.id === nodeId ? { ...node, score: Math.min(100, node.score + Math.round(topScore * 0.08)) } : node);
      }
      result = finalizeDendriteResult(product, result.nodes, result.edges, latestProducts.size);
    }

    const input = {
      responses,
      name: shortText(body.name, 40),
      partnerName: shortText(body.partnerName, 40),
      relationshipType: ["deep", "business", "other"].includes(String(body.relationshipType)) ? body.relationshipType : null,
      completedAt: new Date().toISOString(),
    };
    const { data, error } = await admin.from("mini_dendrite_assessments").insert({
      user_id: session.userId, product_id: productId, input, result, algorithm_version: result.algorithm,
    }).select("id").single();
    if (error || !data) throw new Error(`insert failed: ${error?.code ?? "unknown"}`);
    return NextResponse.json({ submissionId: data.id, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message.startsWith("missing response")) return NextResponse.json({ error: "请完成全部节点选择" }, { status: 400 });
    console.error("[mini dendrite submit] failed", message);
    return NextResponse.json({ error: "树突联锁暂未完成，请稍后重试" }, { status: 500 });
  }
}
