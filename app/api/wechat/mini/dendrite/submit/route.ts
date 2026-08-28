import { NextResponse } from "next/server";
import { requireMiniSession } from "@/lib/mini/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateDendrite, getDendriteProduct, type RelationshipAssessmentType } from "@/lib/mini/dendrite-engine";
import { ensureLifeArchetype } from "@/lib/mini/life-archetype";

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
    const relationshipType: RelationshipAssessmentType = body.relationshipType === "business" ? "business" : body.relationshipType === "other" ? "other" : "deep";
    const product = getDendriteProduct(productId, relationshipType);
    if (productId === "life-archetype") return NextResponse.json({ error: "生命原型不是单独测评；一年内八个基础场域全部开启后由系统自动生成" }, { status: 409 });
    if (!product || !body.responses || typeof body.responses !== "object" || Array.isArray(body.responses)) {
      return NextResponse.json({ error: "精测资料不完整" }, { status: 400 });
    }
    const name = shortText(body.name, 40);
    const partnerName = shortText(body.partnerName, 40);
    if (!name) return NextResponse.json({ error: "请填写这份生命档案的称呼" }, { status: 400 });
    if (productId === "relationship-resonance" && !partnerName) return NextResponse.json({ error: "请填写关系双方的称呼" }, { status: 400 });
    const responses = body.responses as Record<string, string>;
    let result = calculateDendrite(product, responses);
    result.context = { subjectName: name, ...(partnerName ? { partnerName } : {}), ...(productId === "relationship-resonance" ? { relationshipType } : {}) };
    const admin = createAdminClient();

    const input = {
      responses,
      name,
      partnerName,
      relationshipType: productId === "relationship-resonance" ? relationshipType : null,
      completedAt: new Date().toISOString(),
    };
    const { data, error } = await admin.from("mini_dendrite_assessments").insert({
      user_id: session.userId, product_id: productId, input, result, algorithm_version: result.algorithm,
    }).select("id").single();
    if (error || !data) throw new Error(`assessment-storage:${error?.code ?? "unknown"}`);
    const { data: unlockRows } = await admin.from("unlocks").select("product_id, expires_at")
      .eq("user_id", session.userId).in("product_id", [productId, "everything"]);
    const now = Date.now();
    const unlocked = (unlockRows ?? []).some((row) => !row.expires_at || Date.parse(row.expires_at) > now);
    const archetype = await ensureLifeArchetype(session.userId).catch(() => null);
    return NextResponse.json({ submissionId: data.id, result, unlocked, archetype });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message.startsWith("missing response")) return NextResponse.json({ error: "请完成全部节点选择" }, { status: 400 });
    if (message.startsWith("assessment-storage:")) return NextResponse.json({ error: "场域档案暂未写入，请联系灵犀场并提供参考码 V318-SAVE" }, { status: 503 });
    console.error("[mini dendrite submit] failed", message);
    return NextResponse.json({ error: "树突结构连接暂未完成，请稍后重试" }, { status: 500 });
  }
}
