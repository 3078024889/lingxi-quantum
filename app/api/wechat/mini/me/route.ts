import { NextResponse } from "next/server";
import { isMiniWebArchiveProduct } from "@/lib/mini/content-destinations";
import { requireMiniSession } from "@/lib/mini/session";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";
import { ensureLifeArchetype, listLifeArchetypeSubjects } from "@/lib/mini/life-archetype";
import { hasUnlock } from "@/lib/access";
import { MINI_LIFE_ARCHETYPE_ALGORITHM } from "@/lib/mini/dendrite-engine";

export async function GET(req: Request) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "场域服务配置尚未同步，请提供参考码 V319-CONFIG" }, { status: 503 });
    }
    const session = await requireMiniSession(req);
    if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
    const admin = createAdminClient();
    const requestedSubjectId = new URL(req.url).searchParams.get("subjectId") || undefined;
    const [archetype, archetypeSubjects] = await Promise.all([
      ensureLifeArchetype(session.userId, requestedSubjectId).catch(() => ({ ready: false, completed: 0, missing: [] as string[] })),
      listLifeArchetypeSubjects(session.userId).catch(() => []),
    ]);
    const [{ data: profile }, { data: unlocks }, { data: orders }, { data: assessments }] = await Promise.all([
    admin.from("profiles").select("manifest_until").eq("id", session.userId).maybeSingle(),
    admin.from("unlocks").select("product_id, expires_at").eq("user_id", session.userId),
    admin
      .from("orders")
      .select("id, product_id, status, submission_id, submission_name, created_at, paid_at")
      .eq("user_id", session.userId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(50),
    admin.from("mini_dendrite_assessments").select("id, product_id, algorithm_version, created_at, input")
      .eq("user_id", session.userId).order("created_at", { ascending: false }).limit(100),
  ]);
    const now = Date.now();
    const activeUnlockIds = (unlocks ?? []).filter((item) => !item.expires_at || Date.parse(item.expires_at) > now).map((item) => item.product_id);
    const manifestActive = !!profile?.manifest_until && Date.parse(profile.manifest_until) > now;
    return NextResponse.json({
    userId: session.userId,
    manifestUntil: profile?.manifest_until ?? null,
    unlocks: (unlocks ?? []).filter((item) => !item.expires_at || Date.parse(item.expires_at) > now).map((item) => ({
      ...item,
      productName: getProduct(item.product_id)?.name ?? item.product_id,
      webOnly: isMiniWebArchiveProduct(item.product_id),
    })),
    orders: (orders ?? []).map((order) => ({
      ...order,
      productName: getProduct(order.product_id)?.name ?? order.product_id,
      webOnly: !order.submission_id && isMiniWebArchiveProduct(order.product_id),
    })),
    archives: (assessments ?? []).filter((assessment, index, all) => {
      if (assessment.product_id === "life-archetype") {
        const archiveInput=(assessment.input as { subjectId?: string; identityVerified?: boolean } | null);
        const subjectId = archiveInput?.subjectId;
        return assessment.algorithm_version === MINI_LIFE_ARCHETYPE_ALGORITHM && archiveInput?.identityVerified === true && index === all.findIndex((item) => item.product_id === "life-archetype" && item.algorithm_version === MINI_LIFE_ARCHETYPE_ALGORITHM && (item.input as { subjectId?: string; identityVerified?: boolean } | null)?.identityVerified === true && (item.input as { subjectId?: string } | null)?.subjectId === subjectId);
      }
      return manifestActive || hasUnlock(activeUnlockIds, assessment.product_id);
    }).map((assessment) => ({
      id: `assessment:${assessment.id}`,
      submission_id: assessment.id,
      product_id: assessment.product_id,
      productName: getProduct(assessment.product_id)?.name ?? assessment.product_id,
      created_at: assessment.created_at,
      paid_at: assessment.created_at,
      status: "archived",
      assessment: true,
      webOnly: false,
    })),
      archetype,
      archetypeSubjects,
    });
  } catch (error) {
    console.error("[mini me] failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "我的场域暂未同步，请稍后重试并提供参考码 V319-ME" }, { status: 500 });
  }
}
