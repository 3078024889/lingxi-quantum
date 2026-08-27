import { NextResponse } from "next/server";
import { isMiniWebArchiveProduct } from "@/lib/mini/content-destinations";
import { requireMiniSession } from "@/lib/mini/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";
import { ensureLifeArchetype } from "@/lib/mini/life-archetype";
import { hasUnlock } from "@/lib/access";

export async function GET(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
  const admin = createAdminClient();
  const archetype = await ensureLifeArchetype(session.userId).catch(() => ({ ready: false, completed: 0, missing: [] as string[] }));
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
    admin.from("mini_dendrite_assessments").select("id, product_id, created_at")
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
    archives: (assessments ?? []).filter((assessment) => assessment.product_id === "life-archetype" || manifestActive || hasUnlock(activeUnlockIds, assessment.product_id)).map((assessment) => ({
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
  });
}
