import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { hasUnlock } from "@/lib/access";
import { miniContentDestination } from "@/lib/mini/content-destinations";
import { encryptMiniSecret } from "@/lib/mini/crypto";
import { requireMiniSession } from "@/lib/mini/session";
import { getNarrative } from "@/lib/narratives";
import { getProduct } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeStellarTraceDraft, stellarTraceMissingFields } from "@/lib/stellar-trace-intake";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { productId?: unknown; submissionId?: unknown; stellarDraft?: unknown };
  if (typeof body.productId !== "string" || (!getProduct(body.productId) && !getNarrative(body.productId))) {
    return NextResponse.json({ error: "内容参数无效" }, { status: 400 });
  }
  const destination = miniContentDestination(body.productId);
  if (!destination) return NextResponse.json({ error: "这项内容暂不支持在小程序内打开" }, { status: 404 });

  const admin = createAdminClient();
  const stellarDraft = body.productId === "stellar-trace" ? sanitizeStellarTraceDraft(body.stellarDraft) : null;
  const stellarMissing = stellarDraft ? stellarTraceMissingFields(stellarDraft) : [];
  if (body.productId === "stellar-trace" && (!stellarDraft || stellarMissing.length > 0)) {
    return NextResponse.json({ error: `寻踪档案尚缺：${stellarMissing.join("、") || "有效必填资料"}`, missingFields: stellarMissing }, { status: 400 });
  }
  const submissionId = typeof body.submissionId === "string" ? body.submissionId : null;
  let derivedArchetypeAccess = false;
  if (submissionId) {
    const { data: assessment } = await admin.from("mini_dendrite_assessments").select("id, product_id")
      .eq("id", submissionId).eq("user_id", session.userId).eq("product_id", body.productId).maybeSingle();
    if (!assessment) return NextResponse.json({ error: "这份场域记录不存在或不属于当前账户" }, { status: 404 });
    derivedArchetypeAccess = body.productId === "life-archetype";
  }
  const [{ data: unlocks }, { data: profile }] = await Promise.all([
    admin.from("unlocks").select("product_id, expires_at").eq("user_id", session.userId),
    admin.from("profiles").select("manifest_until").eq("id", session.userId).maybeSingle(),
  ]);
  const now = Date.now();
  const activeUnlocks = (unlocks ?? [])
    .filter((item) => !item.expires_at || Date.parse(item.expires_at) > now)
    .map((item) => item.product_id);
  const manifestActive = !!profile?.manifest_until && Date.parse(profile.manifest_until) > now;
  if (!derivedArchetypeAccess && !manifestActive && !hasUnlock(activeUnlocks, body.productId)) {
    return NextResponse.json({ error: "这项权益尚未开启或已到期" }, { status: 403 });
  }

  // 票据仅传递用户、内容和时限。打开端会重新检查权益，不能靠前端参数取得阅读权。
  const ticket = encryptMiniSecret(JSON.stringify({
    userId: session.userId,
    productId: body.productId,
    ...(submissionId ? { submissionId } : {}),
    ...(stellarDraft ? { stellarDraft } : {}),
    expiresAt: Date.now() + 2 * 60 * 1000,
    nonce: randomBytes(12).toString("base64url"),
  }));
  return NextResponse.json({ path: `/api/wechat/mini/content-open?ticket=${encodeURIComponent(ticket)}` });
}
