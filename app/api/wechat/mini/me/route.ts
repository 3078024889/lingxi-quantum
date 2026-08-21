import { NextResponse } from "next/server";
import { isMiniWebArchiveProduct } from "@/lib/mini/content-destinations";
import { requireMiniSession } from "@/lib/mini/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";

export async function GET(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
  const admin = createAdminClient();
  const [{ data: profile }, { data: unlocks }, { data: orders }] = await Promise.all([
    admin.from("profiles").select("manifest_until").eq("id", session.userId).maybeSingle(),
    admin.from("unlocks").select("product_id, expires_at").eq("user_id", session.userId),
    admin
      .from("orders")
      .select("id, product_id, status, submission_id, submission_name, created_at, paid_at")
      .eq("user_id", session.userId)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(50),
  ]);
  const now = Date.now();
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
  });
}
