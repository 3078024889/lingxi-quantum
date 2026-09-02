import { NextResponse } from "next/server";
import { hasUnlock } from "@/lib/access";
import { miniContentDestination } from "@/lib/mini/content-destinations";
import { decryptMiniSecret } from "@/lib/mini/crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Ticket = { userId: string; productId: string; submissionId?: string; expiresAt: number; nonce: string };

function fail(req: Request, message: string) {
  const url = new URL("/account", req.url);
  url.searchParams.set("miniError", message);
  return NextResponse.redirect(url, 302);
}

export async function GET(req: Request) {
  const ticketText = new URL(req.url).searchParams.get("ticket");
  if (!ticketText || ticketText.length > 4096) return fail(req, "内容链接无效");
  try {
    const ticket = JSON.parse(decryptMiniSecret(ticketText)) as Ticket;
    const destinationPath = ticket.submissionId ? "/mini-report" : miniContentDestination(ticket.productId);
    if (!ticket.userId || !ticket.nonce || ticket.expiresAt < Date.now() || !destinationPath) {
      return fail(req, "内容链接已过期");
    }

    const admin = createAdminClient();
    const [{ data: unlocks }, { data: profile }, userResult, assessmentResult] = await Promise.all([
      admin.from("unlocks").select("product_id, expires_at").eq("user_id", ticket.userId),
      admin.from("profiles").select("manifest_until").eq("id", ticket.userId).maybeSingle(),
      admin.auth.admin.getUserById(ticket.userId),
      ticket.submissionId
        ? admin.from("mini_dendrite_assessments").select("id, product_id").eq("id", ticket.submissionId).eq("user_id", ticket.userId).eq("product_id", ticket.productId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    const now = Date.now();
    const activeUnlocks = (unlocks ?? [])
      .filter((item) => !item.expires_at || Date.parse(item.expires_at) > now)
      .map((item) => item.product_id);
    const manifestActive = !!profile?.manifest_until && Date.parse(profile.manifest_until) > now;
    const email = userResult.data.user?.email;
    const derivedArchetypeAccess = ticket.productId === "life-archetype" && !!ticket.submissionId && !!assessmentResult.data;
    if ((!derivedArchetypeAccess && !manifestActive && !hasUnlock(activeUnlocks, ticket.productId)) || !email || (ticket.submissionId && !assessmentResult.data)) {
      return fail(req, "内容权益尚未同步");
    }

    const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
    const tokenHash = link.data.properties?.hashed_token;
    if (link.error || !tokenHash) return fail(req, "内容登录暂不可用");
    const supabase = createClient();
    const verification = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
    if (verification.error || verification.data.user?.id !== ticket.userId) return fail(req, "内容身份校验失败");

    const destination = new URL(destinationPath, req.url);
    destination.searchParams.set("mini", "1");
    if (ticket.submissionId) destination.searchParams.set("id", ticket.submissionId);
    return NextResponse.redirect(destination);
  } catch (error) {
    console.error("[mini content open] failed", error instanceof Error ? error.message : "unknown");
    return fail(req, "内容链接无效");
  }
}
